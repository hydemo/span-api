import { Connection } from 'mongoose';
import { UserAnswerSchema } from './userAnswer.schema';
// 引入schema

export const userAnswersProviders = [
  {
    provide: 'UserAnswerModelToken',
    useFactory: (connection: Connection) => connection.model('userAnswer', UserAnswerSchema),
    inject: ['MongoDBConnection'],
  },
];