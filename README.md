# Neode NestJS

A module to connect Neode, Neo4j and NestJS.

`npm i neode-nestjs` or `yarn add neode-nestjs`

<img src="./readme/nest.png">

#### Variables

> .env

Ensure you are reading your .env before start your application
You must add `env-cmd` before your script

```json
{
     "start:dev": "env-cmd nest start --watch"
}
```

```shell
NEO4J_DATABASE=neo4j
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your-password
NEO4J_HOST=localhost
NEO4J_PORT=7687
NEO4J_PROTOCOL=neo4j
NEO4J_ENCRYPTION=ENCRYPTION_OFF
```

---

#### Main module

```ts
import { NeodeModule } from 'neode-nestjs';
```

> app.module.ts

```ts
@Module({
     imports: [NeodeModule.forRoot(), UserModule],
     controllers: [AppController],
     providers: [],
})
export class AppModule {}
```

---

#### Entities or Schemas

> Your schema to inject on module

Important when you import `Neode` use like example bellow. Or you will have a problem with types

```ts
import * as Neode from 'neode';
```

<img src="./readme/Neo.jpg">

> Schema

```ts
import { SchemaObject } from 'neode';

const UserSchema: SchemaObject = {
     id: {
          type: 'uuid',
          primary: true,
          required: true,
     },
     name: {
          type: 'string',
          required: true,
     },
     email: {
          type: 'string',
          unique: true,
          required: true,
     },
     password: {
          type: 'string',
          required: true,
     },
     avatar: {
          type: 'string',
     },
     isFirstAuth: {
          type: 'boolean',
     },
};

export default UserSchema;
```

---

#### Specific module

```ts
@Module({
     imports: [NeodeModule.forFeature({ User: UserSchema })],
     controllers: [UserController],
     providers: [UserService],
})
export class UserModule {}
```

---

#### Service class

You can get connection by injected `Connection`. It returns a Neode instance

The word `'User'` is the same you have used to inject on `{ User: UserSchema }` if you use same different word as not `User` you must to use it.

```ts
@Injectable()
export class UserService {
     constructor(@Inject('Connection') private readonly neode: Neode) {}

     async createUser(dto: CreateUserDto): Promise<void> {
          await this.neode.merge('User', dto);
     }

     async getUsers(): Promise<UserInterface[]> {
          const users = await this.neode.all('User');
          return (await users.toJson()) as UserInterface[];
     }
}
```
