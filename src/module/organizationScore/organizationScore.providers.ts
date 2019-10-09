import { Connection } from 'mongoose';
import { OrganizationScoreSchema } from './organizationScore.schema';
// 引入schema

export const organizationScoresProviders = [
  {
    provide: 'OrganizationScoreModelToken',
    useFactory: (connection: Connection) => connection.model('organizationScore', OrganizationScoreSchema),
    inject: ['MongoDBConnection'],
  },
];