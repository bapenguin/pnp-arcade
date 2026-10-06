// Converts Jimmy X's Sound Blaster clips (legacy/*.VOC, *.WAV) to WAV files browsers can
// play, in public/sfx/ (lowercase names). No ffmpeg needed:
//  - Some ".VOC" files are really WAVs (RIFF): copied as they are.
//  - Creative Voice files: the 8-bit PCM blocks (types 1, 2, 3 = silence, 8 = extended
//    rate, 9 = new-style) are unpacked into an 8-bit mono WAV.
//  - Creative's 4-bit ADPCM (codec 1: MYDAY.VOC, CLOTHES.VOC) is decoded with the
//    Sound Blaster's own step tables (as DOSBox emulates them).
// The output is committed, so the site builds without the legacy files.
//
//   npm run sounds

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'legacy');
const out = path.join(root, 'public', 'sfx');
fs.mkdirSync(out, { recursive: true });

function wav(rate, pcm) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write('WAVEfmt ', 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); // PCM
  h.writeUInt16LE(1, 22); // mono
  h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate, 28); // bytes per second (1 byte per sample)
  h.writeUInt16LE(1, 32);
  h.writeUInt16LE(8, 34);
  h.write('data', 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

// Sound Blaster 4-bit ADPCM: each nibble moves a reference sample by a step that adapts
// to the signal. The first byte of the data is the starting reference sample.
const SCALE_MAP = [
  0, 1, 2, 3, 4, 5, 6, 7, 0, -1, -2, -3, -4, -5, -6, -7,
  1, 3, 5, 7, 9, 11, 13, 15, -1, -3, -5, -7, -9, -11, -13, -15,
  2, 6, 10, 14, 18, 22, 26, 30, -2, -6, -10, -14, -18, -22, -26, -30,
  4, 12, 20, 28, 36, 44, 52, 60, -4, -12, -20, -28, -36, -44, -52, -60,
];
const ADJUST_MAP = [
  0, 0, 0, 0, 0, 16, 16, 16, 0, 0, 0, 0, 0, 16, 16, 16,
  -16, 0, 0, 0, 0, 16, 16, 16, -16, 0, 0, 0, 0, 16, 16, 16,
  -16, 0, 0, 0, 0, 16, 16, 16, -16, 0, 0, 0, 0, 16, 16, 16,
  -16, 0, 0, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, 0, 0,
];

// The hardware clamps the reference to 0-255. MYDAY.VOC's steps lean positive, so a
// clamped decode climbs into the ceiling and clips a third of the clip; it's decoded
// unclamped here instead, and `finishAdpcm` takes the drift back out.
function adpcm4(data, state, out) {
  for (const byte of data) {
    for (const nib of [byte >> 4, byte & 15]) {
      const s = Math.min(63, Math.max(0, nib + state.scale));
      state.ref += SCALE_MAP[s];
      state.scale = Math.min(48, Math.max(0, state.scale + ADJUST_MAP[s]));
      out.push(state.ref);
    }
  }
}

// A one-pole high-pass at 40 Hz removes the slow drift (it's far below speech), then
// the level is normalised to a peak of ±110 around the 8-bit midpoint.
function finishAdpcm(samples, rate) {
  const a = Math.exp((-2 * Math.PI * 40) / rate);
  let px = samples[0], py = 0, peak = 1;
  const y = samples.map((x) => {
    py = a * (py + x - px);
    px = x;
    peak = Math.max(peak, Math.abs(py));
    return py;
  });
  return Buffer.from(y.map((v) => Math.round(128 + (v / peak) * 110)));
}

function voc(buf, name) {
  const adpcm = { ref: -1, scale: 0 };
  const adpcmSamples = [];
  let isAdpcm = false;
  let p = buf.readUInt16LE(20);
  const chunks = [];
  let rate = 0;
  let extRate = 0;
  while (p < buf.length) {
    const type = buf[p];
    if (type === 0) break;
    const size = buf[p + 1] | (buf[p + 2] << 8) | (buf[p + 3] << 16);
    const body = p + 4;
    if (type === 1) {
      const codec = buf[body + 1];
      rate ||= extRate || Math.round(1e6 / (256 - buf[body]));
      let data = buf.subarray(body + 2, body + size);
      if (codec === 1) {
        if (adpcm.ref < 0) {
          adpcm.ref = data[0];
          adpcmSamples.push(data[0]);
          data = data.subarray(1);
        }
        adpcm4(data, adpcm, adpcmSamples);
        isAdpcm = true;
      } else if (codec === 0) {
        chunks.push(data);
      } else {
        throw new Error(`${name}: codec ${codec} isn't supported`);
      }
    } else if (type === 2) {
      const data = buf.subarray(body, body + size);
      if (isAdpcm) adpcm4(data, adpcm, adpcmSamples);
      else chunks.push(data);
    } else if (type === 3) {
      const len = buf.readUInt16LE(body) + 1;
      rate ||= Math.round(1e6 / (256 - buf[body + 2]));
      chunks.push(Buffer.alloc(len, 0x80));
    } else if (type === 8) {
      // Extended: a 16-bit time constant that overrides the next block's rate.
      const mode = buf[body + 3];
      extRate = Math.round(256e6 / (65536 - buf.readUInt16LE(body)) / (mode + 1));
    } else if (type === 9) {
      rate ||= buf.readUInt32LE(body);
      if (buf[body + 4] !== 8 || buf[body + 5] !== 1) throw new Error(`${name}: only 8-bit mono is supported`);
      chunks.push(buf.subarray(body + 12, body + size));
    }
    p = body + size;
  }
  if (isAdpcm) chunks.push(finishAdpcm(adpcmSamples, rate));
  return wav(rate, Buffer.concat(chunks));
}

let n = 0;
for (const f of fs.readdirSync(src).sort()) {
  const ext = path.extname(f).toUpperCase();
  if (ext !== '.VOC' && ext !== '.WAV') continue;
  const buf = fs.readFileSync(path.join(src, f));
  const dest = path.join(out, `${path.basename(f, path.extname(f)).toLowerCase()}.wav`);
  try {
    if (buf.toString('latin1', 0, 4) === 'RIFF') fs.writeFileSync(dest, buf);
    else if (buf.toString('latin1', 0, 19) === 'Creative Voice File') fs.writeFileSync(dest, voc(buf, f));
    else throw new Error(`${f}: unknown format`);
    n++;
  } catch (e) {
    console.warn(`Skipped ${e.message}`);
  }
}
console.log(`Wrote ${n} clips to ${path.relative(root, out)}.`);
