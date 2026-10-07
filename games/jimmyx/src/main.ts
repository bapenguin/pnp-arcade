import { Host } from '../../../shared/qb/host';
import { jimmyx } from './jimmyx';

// The Sound Blaster clips, converted to WAV by `npm run sounds` (public/sfx/). The second
// row were on the disk but unused by the original; the new content (J7) uses them.
const CLIPS = [
  'army', 'backoff', 'hello', 'meanswar', 'myday', 'ouch', 'thankyou', 'toll',
  'hermit', 'gun', 'fart', 'arty', 'crushed', 'beavhuh1', 'butthuh1',
];

const host = new Host({
  title: 'Jimmy X',
  dir: 'JIMMY',
  exe: 'JIMMYX',
  sounds: Object.fromEntries(CLIPS.map((c) => [c, `sfx/${c}.wav`])),
});
void host.run(jimmyx);
