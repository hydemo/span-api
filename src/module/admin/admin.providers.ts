import { Connection } from 'mongoose';
// 引入schema
import { AdminSchema } from './admin.schema';

export const adminsProviders = [
  {
    provide: 'AdminModelToken',
    useFactory: (connection: Connection) => connection.model('admin', AdminSchema),
    inject: ['MongoDBConnection'],
  },
];