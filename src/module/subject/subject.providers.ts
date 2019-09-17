import { Connection } from 'mongoose';
import { SubjectSchema } from './subject.schema';
// 引入schema

export const subjectsProviders = [
  {
    provide: 'SubjectModelToken',
    useFactory: (connection: Connection) => connection.model('subject', SubjectSchema),
    inject: ['MongoDBConnection'],
  },
];