import { Connection } from 'mongoose';
import { OrganizationSchema } from './organization.schema';
// 引入schema

export const organizationsProviders = [
  {
    provide: 'OrganizationModelToken',
    useFactory: (connection: Connection) => connection.model('organization', OrganizationSchema),
    inject: ['MongoDBConnection'],
  },
];