import { Module } from '@nestjs/common';
import { UserinfoService } from './userinfo.service';
import { userinfosProviders } from './userinfo.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    UserinfoService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...userinfosProviders,
  ],
  exports: [UserinfoService],
  imports: [
    DatabaseModule,
  ],
})

export class UserinfoModule { }
