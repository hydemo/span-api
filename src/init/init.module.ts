import { Module, Global } from '@nestjs/common';
import { InitService } from './init.service';
import { AdminModule } from 'src/module/admin/admin.module';

@Global()
@Module({
  providers: [
    InitService,
  ],
  imports: [
    AdminModule,
  ],
  exports: [InitService],
})
export class InitModule { }