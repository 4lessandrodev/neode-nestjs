/* eslint-disable prettier/prettier */
import { Global, Module, DynamicModule, Logger } from '@nestjs/common';
import { fromEnv } from 'neode';
import Neode from 'neode';
const isTimestamped = true;

/**
 * @var host
 * @var username
 * @var password
 * @var port
 */
export interface IConnection {
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
	 * @param connection as optional settings
	 * @argument host
	 * @argument username
	 * @argument password
	 * @argument port
	 * @description Provide an object with settings or ensure you have a .env file with neo4j connection settings
	 * @returns Connection as Neode instance. You can get it with `Connection` key on injection argument
	 */
	static forRoot (connection?: IConnection): DynamicModule {
		if (!connection) {
			return {
				module: NeodeModule,
				global: true,
				providers: [
					{
						provide: 'Connection',
						useFactory: async (): Promise<Neode> => {
							const connect: Neode = await fromEnv();
							return connect;
						},
					},
				],
				exports: ['Connection'],
			};
		}
		return {
			module: NeodeModule,
			global: true,
			providers: [
				{
					provide: 'Connection',
					useFactory: async (): Promise<Neode> => {
						const connect: Neode = await new Neode(
							`${connection.host}:${connection.port}`,
							connection.username, connection.password);
						return connect;
					}
				}
			]
		};
	}

	/**
	 *
	 * @param schema key: as label name and value: Node definition as `SchemaObject`
	 * example: `{ User: UserSchema }`
	 * @param connection as optional Object with `host` `port` `user` and `password`
	 * @returns Instance of Neode as connection for module
	 */
	static forFeature (schema: Schema, connection?: IConnection): DynamicModule {
		// Check if connection its from env or provided config
		if (!connection) {
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
							const connect = await fromEnv().with(schema);

							// If schema already installed It handle warn
							try {
								await connect.schema.install();
							} catch (error) {
								handleWarn(Object.keys(schema)[0]);
							} finally {
								return connect;
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
						const connect = await new Neode(
							`${connection.host}:${connection.port}`,
							connection.username, connection.password).with(schema);
						// If schema already installed It handle warn
						try {
							await connect.schema.install();
						} catch (error) {
							handleWarn(Object.keys(schema)[0]);
						} finally {
							return connect;
						}
					},
					inject: ['CONFIG'],
				},
			],
			exports: ['Connection'],
		};
	}
}
