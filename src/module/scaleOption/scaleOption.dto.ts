import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsPhoneNumber, IsMongoId, IsMobilePhone, IsEmail, IsEnum, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateScaleOptionDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '创建者id' })
  readonly creatorId: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '创建者姓名' })
  readonly creatorName: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '标尺方案名称' })
  readonly name: string;

  @IsArray()
  @ApiModelProperty({ description: '标尺' })
  readonly option: [{ content: string }];

  @IsArray()
  @ApiModelProperty({ description: '分数' })
  readonly score: [{ score: number }];

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '公开或者私有,默认私有' })
  readonly isPublic: boolean;

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '引用次数' })
  readonly referenceNum: number;
}
