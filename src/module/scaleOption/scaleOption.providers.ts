import { Connection } from 'mongoose';
import { ScaleOptionSchema } from './scaleOption.schema';
// 引入schema

export const scaleOptionsProviders = [
  {
    provide: 'ScaleOptionModelToken',
    useFactory: (connection: Connection) => connection.model('scaleOption', ScaleOptionSchema),
    inject: ['MongoDBConnection'],
  },
];