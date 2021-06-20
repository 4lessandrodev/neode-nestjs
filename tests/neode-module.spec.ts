import { IConnection, NeodeModule } from '../src/index';
import Neode from 'neode';
import { fromEnv, SchemaObject } from 'neode';

describe('connection with .env', () => {
	it('module should be defined', () => {
		const module = new NeodeModule();
		expect(module).toBeDefined();
	});

	it('neode should be installed', () => {
		const neode = fromEnv;
		expect(neode).toBeDefined();
	});

	it('should open a connection from env', () => {
		const neode: Neode = fromEnv();
		expect(neode).toBeDefined();
	});
});

describe('connection with config', () => {
	const schema: SchemaObject = {
		id: {
			type: 'uuid',
			primary: true,
			required: true
		},
		name: {
			type: 'string',
			required: true
		}
	};
	const config: IConnection = {
		host: 'bolt://localhost',
		password: 'neo4j',
		port: 7687,
		username: 'neo4j'
	};
	it('types for connection should be defined', () => {
		expect(schema).toBeDefined();
		expect(config).toBeDefined();
	});
});
