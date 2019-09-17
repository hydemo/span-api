import { Module } from '@nestjs/common';
import { ScaleService } from './scale.service';
import { scalesProviders } from './scale.providers';
import { DatabaseModule } from '@database/database.module';
import { CryptoUtil } from '@utils/crypto.util';
import { EmailUtil } from 'src/utils/email.util';
import { PhoneUtil } from 'src/utils/phone.util';
import { TagModule } from '../scaleTag/scaleTag.module';
import { ScaleValidator } from './scale.validator';
import { ScaleOptionModule } from '../scaleOption/scaleOption.module';

@Module({
  providers: [
    ScaleService,
    CryptoUtil,
    EmailUtil,
    PhoneUtil,
    ScaleValidator,
    ...scalesProviders,
  ],
  exports: [ScaleService],
  imports: [
    DatabaseModule,
    TagModule,
    ScaleModule,
    ScaleOptionModule,
  ],
})

export class ScaleModule { }
