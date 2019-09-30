import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsMongoId, IsMobilePhone, IsEmail, IsEnum, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCompanyProjectDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '名称' })
  readonly companyProject: string;
}
