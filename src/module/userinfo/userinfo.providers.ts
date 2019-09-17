import { Connection } from 'mongoose';
import { UserinfoSchema } from './userinfo.schema';
// 引入schema

export const userinfosProviders = [
  {
    provide: 'UserinfoModelToken',
    useFactory: (connection: Connection) => connection.model('userinfo', UserinfoSchema),
    inject: ['MongoDBConnection'],
  },
];