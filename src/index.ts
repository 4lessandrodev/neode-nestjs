import { Global, Module, DynamicModule, Logger } from '@nestjs/common';
import { fromEnv } from 'neode';
import Neode from 'neode';
var NEODE_CONNECTION_CONFIG: IConfig | undefined;
const isTimestamped = true;

/**
 * @var host
 * @var username
 * @var password
 * @var port
 */
export interface IConfig {
	host: string;
	username: string;
	password: string;
	port: number;
}

// Just handle warn on terminal
const handleWarn = (schema: string) =>
	new Logger('NeodeModule', isTimestamped).warn(
		`Could not install schema ${schema}. Already installed ?`,
	);

interface Schema {
	[label: string]: Neode.SchemaObject;
}

@Global()
@Module({})
export class NeodeModule {
	/**
	 * @param config as optional settings
	 * @argument host
	 * @argument username
	 * @argument password
	 * @argument port
	 * @description Provide an object with settings or ensure you have a .env file with neo4j connection settings
	 * @returns Connection as Neode instance. You can get it with `Connection` key on injection argument
	 */
	static forRoot (config?: IConfig): DynamicModule {
		if (config) {
			NEODE_CONNECTION_CONFIG = {
				host: config.host,
				password: config.password,
				port: config.port,
				username: config.username
			};
			return {
				module: NeodeModule,
				global: true,
				providers: [
					{
						provide: 'Connection',
						useFactory: async (): Promise<Neode> => {
							const connection: Neode = await new Neode(
								`${config.host}:${config.port}`,
								config.username, config.password);
							return connection;
						}
					}
				]
			};
		}
		NEODE_CONNECTION_CONFIG = undefined;
		return {
			module: NeodeModule,
			global: true,
			providers: [
				{
					provide: 'Connection',
					useFactory: async (): Promise<Neode> => {
						const connection: Neode = await fromEnv();
						return connection;
					},
				},
			],
			exports: ['Connection'],
		};
	}

	/**
	 *
	 * @param schema key: as label name and value: Node definition as `SchemaObject`
	 * example: `{ User: UserSchema }`
	 * @returns Instance of Neode as connection for module
	 */
	static forFeature (schema: Schema): DynamicModule {
		// Check if connection its from env or provided config
		if (!NEODE_CONNECTION_CONFIG) {
			return {
				module: NeodeModule,
				global: false,
				providers: [
					{
						provide: 'CONFIG',
						useValue: schema,
					},
					{
						provide: 'Connection',
						useFactory: async (): Promise<Neode> => {
							const connection = await fromEnv().with(schema);

							// If schema already installed It handle warn
							try {
								await connection.schema.install();
							} catch (error) {
								handleWarn(Object.keys(schema)[0]);
							} finally {
								return connection;
							}
						},
						inject: ['CONFIG'],
					},
				],
				exports: ['Connection'],
			};
		}
		// Create e new connection from URI
		return {
			module: NeodeModule,
			global: false,
			providers: [
				{
					provide: 'CONFIG',
					useValue: schema,
				},
				{
					provide: 'Connection',
					useFactory: async (): Promise<Neode> => {
						const connection = await new Neode(`${NEODE_CONNECTION_CONFIG.host}:${NEODE_CONNECTION_CONFIG.port}`,
							NEODE_CONNECTION_CONFIG.username, NEODE_CONNECTION_CONFIG.password).with(schema);
						// If schema already installed It handle warn
						try {
							await connection.schema.install();
						} catch (error) {
							handleWarn(Object.keys(schema)[0]);
						} finally {
							return connection;
						}
					},
					inject: ['CONFIG'],
				},
			],
			exports: ['Connection'],
		};
	}
}
