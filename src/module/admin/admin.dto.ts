import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsMongoId, IsMobilePhone, IsEmail, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdminDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '昵称' })
  readonly username: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  password: string;

  @IsEmail()
  @Type(() => String)
  @ApiModelProperty({ description: '邮箱' })
  email: string;


  @IsMobilePhone('zh-CN')
  @Type(() => String)
  @ApiModelProperty({ description: '联系电话' })
  readonly phone?: string;

  @IsString()
  @ApiModelProperty({ description: '头像' })
  readonly avatar?: string;
}

export class UpdateAdminPassDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  password: string;
}

export class UpdateAdminPhoneDTO {
  @IsString()
  @IsPhoneNumber('CH')
  @Type(() => String)
  @ApiModelProperty({ description: '联系电话' })
  readonly phone: string;
}

export class UpdateAdminDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '昵称' })
  readonly username?: string;

  @IsString()
  @ApiModelProperty({ description: '头像' })
  readonly avatar?: string;
}

export class LoginDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  password: string;
}

export class EmailPassDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username: string;

  @IsString()
  @IsEnum(['zh', 'en-US'])
  @Type(() => String)
  @ApiModelProperty({ description: '语言' })
  readonly language: string;
}

export class ResetPassDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '新密码' })
  readonly password: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '确认密码' })
  readonly confirm: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: 'token' })
  readonly token: string;
}

export class PhoneDTO {
  @IsString()
  @IsEnum(['active', 'forget'])
  @Type(() => String)
  @ApiModelProperty({ description: '类型' })
  readonly language: string;
}
