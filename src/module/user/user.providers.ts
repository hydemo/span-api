import { Connection } from 'mongoose';
// 引入schema
import { UserSchema } from './user.schema';

export const usersProviders = [
  {
    provide: 'UserModelToken',
    useFactory: (connection: Connection) => connection.model('user', UserSchema),
    inject: ['MongoDBConnection'],
  },
];