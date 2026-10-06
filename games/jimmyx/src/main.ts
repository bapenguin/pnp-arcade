import { Host } from '../../../shared/qb/host';
import { jimmyx } from './jimmyx';

// The Sound Blaster clips, converted to WAV by `npm run sounds` (public/sfx/).
const CLIPS = ['army', 'backoff', 'hello', 'meanswar', 'myday', 'ouch', 'thankyou', 'toll'];

const host = new Host({
  title: 'Jimmy X',
  dir: 'JIMMY',
  exe: 'JIMMYX',
  sounds: Object.fromEntries(CLIPS.map((c) => [c, `sfx/${c}.wav`])),
});
void host.run(jimmyx);
