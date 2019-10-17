import { Module } from '@nestjs/common';
import { UserProjectService } from './userProject.service';
import { userProjectsProviders } from './userProject.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { UserQuestionnaireModule } from '../userQuestionnaire/userQuestionnaire.module';

@Module({
  providers: [
    UserProjectService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...userProjectsProviders,
  ],
  exports: [UserProjectService],
  imports: [
    DatabaseModule,
  ],
})

export class UserProjectModule { }
