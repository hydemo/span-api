import { Module } from '@nestjs/common';
import { OrganizationScoreService } from './organizationScore.service';
import { organizationScoresProviders } from './organizationScore.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    OrganizationScoreService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...organizationScoresProviders,
  ],
  exports: [OrganizationScoreService],
  imports: [
    DatabaseModule,
  ],
})

export class OrganizationScoreModule { }
