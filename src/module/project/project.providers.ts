import { Connection } from 'mongoose';
import { ProjectSchema } from './project.schema';
// 引入schema

export const projectsProviders = [
  {
    provide: 'ProjectModelToken',
    useFactory: (connection: Connection) => connection.model('project', ProjectSchema),
    inject: ['MongoDBConnection'],
  },
];