import { Module } from '@nestjs/common';
import { UserQuestionnaireService } from './userQuestionnaire.service';
import { userQuestionnairesProviders } from './userQuestionnaire.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    UserQuestionnaireService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...userQuestionnairesProviders,
  ],
  exports: [UserQuestionnaireService],
  imports: [
    DatabaseModule,
  ],
})

export class UserQuestionnaireModule { }
