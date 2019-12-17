import { Module } from '@nestjs/common';
import { UserQuestionnaireService } from './userQuestionnaire.service';
import { userQuestionnairesProviders } from './userQuestionnaire.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { QuestionnaireModule } from '../questionnaire/questionnaire.module';
import { UserModule } from '../user/user.module';
import { OrganizationModule } from '../organization/organization.module';
import { ProjectModule } from '../project/project.module';
import { UserAnswerModule } from '../userAnswer/userAnswer.module';
import { UserScoreModule } from '../userScore/userScore.module';
import { OrganizationScoreModule } from '../organizationScore/organizationScore.module';
import { ScaleModule } from '../scale/scale.module';
import { UserProjectModule } from '../userProject/userProject.module';
import { UserLinkModule } from '../userLink/userLink.module';
import { UserResultService } from './userResult.service';

@Module({
  providers: [
    UserQuestionnaireService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    UserResultService,
    ...userQuestionnairesProviders,
  ],
  exports: [UserQuestionnaireService, UserResultService],
  imports: [
    DatabaseModule,
    QuestionnaireModule,
    UserModule,
    OrganizationModule,
    ProjectModule,
    UserAnswerModule,
    UserScoreModule,
    OrganizationScoreModule,
    ScaleModule,
    UserProjectModule,
    UserLinkModule,
  ],
})

export class UserQuestionnaireModule { }
