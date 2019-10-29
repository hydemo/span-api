import { Module, Global } from '@nestjs/common';
import { InitService } from './init.service';
import { AdminModule } from 'src/module/admin/admin.module';
import { UserLinkModule } from 'src/module/userLink/userLink.module';

@Global()
@Module({
  providers: [
    InitService,
  ],
  imports: [
    AdminModule,
    UserLinkModule,
  ],
  exports: [InitService],
})
export class InitModule { }