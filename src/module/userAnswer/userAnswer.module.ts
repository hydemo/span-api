import { Module } from '@nestjs/common';
import { UserAnswerService } from './userAnswer.service';
import { userAnswersProviders } from './userAnswer.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    UserAnswerService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...userAnswersProviders,
  ],
  exports: [UserAnswerService],
  imports: [
    DatabaseModule,
  ],
})

export class UserAnswerModule { }
