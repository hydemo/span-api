import { Connection } from 'mongoose';
import { CompanyProjectSchema } from './companyProject.schema';
// 引入schema

export const companyProjectsProviders = [
  {
    provide: 'CompanyProjectModelToken',
    useFactory: (connection: Connection) => connection.model('companyProject', CompanyProjectSchema),
    inject: ['MongoDBConnection'],
  },
];