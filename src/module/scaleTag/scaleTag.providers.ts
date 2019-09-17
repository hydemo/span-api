import { Connection } from 'mongoose';
import { TagSchema } from './scaleTag.schema';
// 引入schema

export const tagsProviders = [
  {
    provide: 'TagModelToken',
    useFactory: (connection: Connection) => connection.model('tag', TagSchema),
    inject: ['MongoDBConnection'],
  },
];