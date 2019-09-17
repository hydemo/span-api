import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TagService } from './scaleTag.service';
import { tagsProviders } from './scaleTag.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { JwtModule } from '@nestjs/jwt';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    TagService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...tagsProviders,
  ],
  exports: [TagService],
  imports: [
    DatabaseModule,
  ],
})

export class TagModule { }
