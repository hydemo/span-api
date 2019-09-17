import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { QuestionnaireService } from './questionnaire.service';
import { questionnairesProviders } from './questionnaire.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { JwtModule } from '@nestjs/jwt';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { ScaleModule } from '../scale/scale.module';
import { UserinfoModule } from '../userinfo/userinfo.module';
import { UserfilterModule } from '../userfilter/userfilter.module';
import { SubjectModule } from '../subject/subject.module';

@Module({
  providers: [
    QuestionnaireService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...questionnairesProviders,
  ],
  exports: [QuestionnaireService],
  imports: [
    DatabaseModule,
    ScaleModule,
    UserinfoModule,
    UserfilterModule,
    SubjectModule,
  ],
})

export class QuestionnaireModule { }
