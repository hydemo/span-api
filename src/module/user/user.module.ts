import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './user.service';
import { usersProviders } from './user.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { JwtModule } from '@nestjs/jwt';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { XlsxService } from './xlsx.service';
import { OrganizationModule } from '../organization/organization.module';
import { CheckService } from './check.service';

@Module({
  providers: [
    UserService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    XlsxService,
    CheckService,
    ...usersProviders,
  ],
  exports: [UserService, XlsxService],
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

export class UserModule { }
