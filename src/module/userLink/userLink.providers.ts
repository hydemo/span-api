import { Connection } from 'mongoose';
import { UserLinkSchema } from './userLink.schema';
// 引入schema

export const userLinksProviders = [
  {
    provide: 'UserLinkModelToken',
    useFactory: (connection: Connection) => connection.model('userLink', UserLinkSchema),
    inject: ['MongoDBConnection'],
  },
];