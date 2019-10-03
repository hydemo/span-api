import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CompanyProjectService } from './companyProject.service';
import { companyProjectsProviders } from './companyProject.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { JwtModule } from '@nestjs/jwt';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { UserModule } from '../user/user.module';
import { UserProjectModule } from '../userProject/userProject.module';
import { UserQuestionnaireModule } from '../userQuestionnaire/userQuestionnaire.module';
import { RedisModule } from 'nestjs-redis';

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
    UserModule,
    UserProjectModule,
    UserQuestionnaireModule,
    RedisModule,
  ],
})

export class CompanyProjectModule { }
