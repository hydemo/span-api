import { Connection } from 'mongoose';
import { UserProjectSchema } from './userProject.schema';
// 引入schema

export const userProjectsProviders = [
  {
    provide: 'UserProjectModelToken',
    useFactory: (connection: Connection) => connection.model('userProject', UserProjectSchema),
    inject: ['MongoDBConnection'],
  },
];