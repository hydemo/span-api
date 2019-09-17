import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsMongoId, IsMobilePhone, IsEmail, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyDTO {
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
  readonly email: string;

  @IsMobilePhone('zh-CN')
  @Type(() => String)
  @ApiModelProperty({ description: '联系电话' })
  readonly phone: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '企业id' })
  readonly companyId: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '企业名' })
  readonly companyName: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '所属行业' })
  readonly industry: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '验证码' })
  readonly code: string;
}

export class UpdateCompanyPassDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  password: string;
}

export class UpdateCompanyPhoneDTO {
  @IsString()
  @IsPhoneNumber('CH')
  @Type(() => String)
  @ApiModelProperty({ description: '联系电话' })
  readonly phone: string;
}

export class UpdateCompanyDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '昵称' })
  readonly username?: string;

  @IsString()
  @ApiModelProperty({ description: '头像' })
  readonly avatar?: string;
}

export class CompanyLoginDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  password: string;
}

export class CompanyEmailPassDTO {
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

export class CompanyResetPassDTO {
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

export class CompanyPhoneDTO {
  @IsString()
  @IsEnum(['active', 'forget'])
  @Type(() => String)
  @ApiModelProperty({ description: '类型' })
  readonly language: string;
}
