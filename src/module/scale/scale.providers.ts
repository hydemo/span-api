import { Connection } from 'mongoose';
import { ScaleSchema } from './scale.schema';
// 引入schema

export const scalesProviders = [
  {
    provide: 'ScaleModelToken',
    useFactory: (connection: Connection) => connection.model('scale', ScaleSchema),
    inject: ['MongoDBConnection'],
  },
];