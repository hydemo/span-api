import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { projectsProviders } from './project.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';

@Module({
  providers: [
    ProjectService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...projectsProviders,
  ],
  exports: [ProjectService],
  imports: [
    DatabaseModule,
    QuestionnaireModule,
  ],
})

export class ProjectModule { }
