import { Module } from '@nestjs/common';
import { UserfilterService } from './userfilter.service';
import { userfiltersProviders } from './userfilter.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    UserfilterService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...userfiltersProviders,
  ],
  exports: [UserfilterService],
  imports: [
    DatabaseModule,
  ],
})

export class UserfilterModule { }
