import { Host } from '../../../shared/qb/host';
import { jimmy1 } from './jimmy1';

const host = new Host({ title: 'Jimmy (1994)', dir: 'JIMMY', exe: 'JIM' });
void host.run(jimmy1);
