import { Module } from '@nestjs/common';
import { SubjectService } from './subject.service';
import { subjectsProviders } from './subject.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';

@Module({
  providers: [
    SubjectService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ...subjectsProviders,
  ],
  exports: [SubjectService],
  imports: [
    DatabaseModule,
  ],
})

export class SubjectModule { }
