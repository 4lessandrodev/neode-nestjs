import { Global, Module, DynamicModule, Logger } from '@nestjs/common';
import * as Neode from 'neode';

// Just handle warn on terminal
const handleWarn = (schema: string)=> new Logger('NeodeModule', true).console.warn(`Could not install schema ${schema}. Already installed ?`);

interface Schema {
  [label: string]: Neode.SchemaObject;
}

@Global()
@Module({})
export class NeodeModule {
  /**
   * @description ensure you have a .env file with neo4j connection settings
   * @returns Connection as Neode instance
   */
  static forRoot(): DynamicModule {
    return {
      module: NeodeModule,
      global: true,
      providers: [
        {
          provide: 'Connection',
          useFactory: async () => {
            let connection: Neode;

            connection = await Neode.fromEnv();
          
            return connection;
          },
        }
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
  static forFeature(schema: Schema): DynamicModule {
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
          useFactory: async () => {
            const connection = await Neode.fromEnv().with(schema);

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
