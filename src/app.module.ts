import { Module, MulterModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { InitModule } from './init/init.module';
import { AdminModule } from './module/admin/admin.module';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from './config/config.service';
import { CMSAdminController } from './controller/cms/admin.controller';
import { ConfigModule } from './config/config.module';
import { CryptoUtil } from './utils/crypto.util';
import { EmailUtil } from './utils/email.util';
import { PhoneUtil } from './utils/phone.util';
import { OrganizationModule } from './module/organization/organization.module';
import { CMSOrganizationController } from './controller/cms/organization.controller';
import { ScaleModule } from './module/scale/scale.module';
import { CMSScaleController } from './controller/cms/scale.controller';
import { TagModule } from './module/scaleTag/scaleTag.module';
import { ScaleOptionModule } from './module/scaleOption/scaleOption.module';
import { QuestionnaireModule } from './module/questionnaire/questionnaire.module';
import { CMSQuestionnaireController } from './controller/cms/questionnaire.controller';
import { CompanyUserController } from './controller/company/login.controller';
import { CompanyModule } from './module/company/company.module';
import { CMSProjectController } from './controller/cms/project.controller';
import { ProjectModule } from './module/project/project.module';
import { UserModule } from './module/user/user.module';
import { ApiUserController } from './controller/api/login.controller';
import { CompanyEmployeeController } from './controller/company/employee.controller';
import { CompanyOrganizationController } from './controller/company/organization.controller';
import { CompanyProjectController } from './controller/company/project.controller';
import { CompanyQuestionnaireController } from './controller/company/questionnaire.controller';
import { UserProjectModule } from './module/userProject/userProject.module';
import { UserQuestionnaireModule } from './module/userQuestionnaire/userQuestionnaire.module';
import { CompanyProjectModule } from './module/companyProject/companyProject.module';
import { ApiProjectController } from './controller/api/project.controller';
import { ApiQuestionnaireController } from './controller/api/questionnaire.controller';
import { ApiOrganizationController } from './controller/api/organization.controller';
import { FeedbackModule } from './module/feedback/feedback.module';
import { ApiFeedbackController } from './controller/api/feedback.controller';

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    InitModule,
    ConfigModule,
    AdminModule,
    OrganizationModule,
    ScaleModule,
    TagModule,
    ScaleOptionModule,
    QuestionnaireModule,
    CompanyModule,
    ProjectModule,
    UserModule,
    MulterModule,
    UserProjectModule,
    UserQuestionnaireModule,
    CompanyProjectModule,
    FeedbackModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.redis,
      inject: [ConfigService]
    }),

    // ScheduleModule
  ],
  providers: [
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
  ],
  controllers: [
    CMSAdminController,
    CMSOrganizationController,
    CMSScaleController,
    CMSQuestionnaireController,
    CMSProjectController,
    CompanyUserController,
    CompanyEmployeeController,
    CompanyOrganizationController,
    CompanyProjectController,
    CompanyQuestionnaireController,
    ApiUserController,
    ApiProjectController,
    ApiQuestionnaireController,
    ApiOrganizationController,
    ApiFeedbackController,
  ]
})
export class AppModule { }
