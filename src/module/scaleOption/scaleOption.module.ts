import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ScaleOptionService } from './scaleOption.service';
import { scaleOptionsProviders } from './scaleOption.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { JwtModule } from '@nestjs/jwt';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    ScaleOptionService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...scaleOptionsProviders,
  ],
  exports: [ScaleOptionService],
  imports: [
    DatabaseModule,
  ],
})

export class ScaleOptionModule { }
