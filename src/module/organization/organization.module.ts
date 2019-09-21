import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { OrganizationService } from './organization.service';
import { organizationsProviders } from './organization.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { JwtModule } from '@nestjs/jwt';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { UserModule } from '../user/user.module';

@Module({
  providers: [
    OrganizationService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...organizationsProviders,
  ],
  exports: [OrganizationService],
  imports: [
    DatabaseModule,
  ],
})

export class OrganizationModule { }
