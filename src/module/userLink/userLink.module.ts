import { Module } from '@nestjs/common';
import { UserLinkService } from './userLink.service';
import { userLinksProviders } from './userLink.providers';
import { DatabaseModule } from '@database/database.module';


@Module({
  providers: [
    UserLinkService,

    ...userLinksProviders,
  ],
  exports: [UserLinkService],
  imports: [
    DatabaseModule,
  ],
})

export class UserLinkModule { }
