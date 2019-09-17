import { Connection } from 'mongoose';
import { QuestionnaireSchema } from './questionnaire.schema';
// 引入schema

export const questionnairesProviders = [
  {
    provide: 'QuestionnaireModelToken',
    useFactory: (connection: Connection) => connection.model('questionnaire', QuestionnaireSchema),
    inject: ['MongoDBConnection'],
  },
];