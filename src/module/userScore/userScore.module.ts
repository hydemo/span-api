import { Module } from '@nestjs/common';
import { UserScoreService } from './userScore.service';
import { userScoresProviders } from './userScore.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    UserScoreService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...userScoresProviders,
  ],
  exports: [UserScoreService],
  imports: [
    DatabaseModule,
  ],
})

export class UserScoreModule { }
