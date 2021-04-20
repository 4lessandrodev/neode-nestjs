import { NeodeModule } from '../src/index';
import Neode from 'neode';

describe('index', () => {
     it('module should be defined', () => {
          const module = new NeodeModule();
          expect(module).toBeDefined();
     });

     it('neode should be installed', () => {
          const neode = Neode.fromEnv;
          expect(neode).toBeDefined();
     });
});
