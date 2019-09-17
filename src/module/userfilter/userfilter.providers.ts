import { Connection } from 'mongoose';
import { UserfilterSchema } from './userfilter.schema';
// 引入schema

export const userfiltersProviders = [
  {
    provide: 'UserfilterModelToken',
    useFactory: (connection: Connection) => connection.model('userfilter', UserfilterSchema),
    inject: ['MongoDBConnection'],
  },
];