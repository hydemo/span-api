import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CompanyProjectService } from './companyProject.service';
import { companyProjectsProviders } from './companyProject.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { JwtModule } from '@nestjs/jwt';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    CompanyProjectService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...companyProjectsProviders,
  ],
  exports: [CompanyProjectService],
  imports: [
    DatabaseModule,
  ],
})

export class CompanyProjectModule { }
