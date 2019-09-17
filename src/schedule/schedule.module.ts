import { Module, Global } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { QuestionModule } from 'src/api/question/question.module';
import { VipModule } from 'src/vip/vip.module';
import { BalanceModule } from 'src/balance/balance.module';

@Global()
@Module({
  providers: [
    ScheduleService,
  ],
  imports: [
    QuestionModule,
    VipModule,
    BalanceModule,
  ],
  exports: [ScheduleService],
})
export class ScheduleModule { }