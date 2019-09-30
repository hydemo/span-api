import { Connection } from 'mongoose';
import { UserQuestionnaireSchema } from './userQuestionnaire.schema';
// 引入schema

export const userQuestionnairesProviders = [
  {
    provide: 'UserQuestionnaireModelToken',
    useFactory: (connection: Connection) => connection.model('userQuestionnaire', UserQuestionnaireSchema),
    inject: ['MongoDBConnection'],
  },
];