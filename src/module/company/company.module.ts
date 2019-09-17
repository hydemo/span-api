import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CompanyService } from './company.service';
import { companysProviders } from './company.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { JwtModule } from '@nestjs/jwt';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { OrganizationModule } from '../organization/organization.module';

@Module({
  providers: [
    CompanyService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...companysProviders,
  ],
  exports: [CompanyService],
  imports: [
    JwtModule.register({
      secretOrPrivateKey: 'secretKey',
      signOptions: {
        expiresIn: 7 * 24 * 60 * 60,
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DatabaseModule,
    OrganizationModule,
  ],
})

export class CompanyModule { }
