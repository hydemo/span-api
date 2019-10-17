import { Module } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { UserProjectModule } from '../userProject/userProject.module';
import { CompanyProjectModule } from '../companyProject/companyProject.module';
import { UserQuestionnaireModule } from '../userQuestionnaire/userQuestionnaire.module';
import { OrganizationModule } from '../organization/organization.module';
import { UserLinkModule } from '../userLink/userLink.module';


@Module({
  providers: [
    FeedbackService,
  ],
  exports: [FeedbackService],
  imports: [
    UserProjectModule,
    CompanyProjectModule,
    UserQuestionnaireModule,
    OrganizationModule,
    UserLinkModule,
  ],
})

export class FeedbackModule { }
