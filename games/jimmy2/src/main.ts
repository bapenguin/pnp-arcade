import { Host } from '../../../shared/qb/host';
import { jimmy2 } from './jimmy2';

const host = new Host({ title: 'Jimmy 2: The Final Voyage', dir: 'JIMMY', exe: 'JIMMY2' });
void host.run(jimmy2);
