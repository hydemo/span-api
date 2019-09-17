import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
// import { UserModule } from '../api/users/user.module';
import { AuthStrategy } from './auth.strategy';
import { AdminModule } from 'src/module/admin/admin.module';
import { CompanyModule } from 'src/module/company/company.module';
// import { AdminModule } from '../cms/admin/admin.module';

@Module({
  providers: [
    AuthService,
    AuthStrategy,
  ],
  imports: [
    // UserModule,
    AdminModule,
    CompanyModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secretOrPrivateKey: 'secretKey',
      signOptions: {
        expiresIn: 7 * 24 * 60 * 60,
      },
    }),
  ],
})

export class AuthModule { }
