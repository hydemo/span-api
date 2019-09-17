import { Connection } from 'mongoose';
// 引入schema
import { CompanySchema } from './company.schema';

export const companysProviders = [
  {
    provide: 'CompanyModelToken',
    useFactory: (connection: Connection) => connection.model('company', CompanySchema),
    inject: ['MongoDBConnection'],
  },
];