import { Connection } from 'mongoose';
import { UserScoreSchema } from './userScore.schema';
// 引入schema

export const userScoresProviders = [
  {
    provide: 'UserScoreModelToken',
    useFactory: (connection: Connection) => connection.model('userScore', UserScoreSchema),
    inject: ['MongoDBConnection'],
  },
];