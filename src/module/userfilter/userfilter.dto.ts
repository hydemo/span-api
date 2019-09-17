import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsArray, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserfilterDTO {
  @IsArray()
  @ApiModelProperty({ description: '题目' })
  readonly question: [{ content: string }];

  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: '量表' })
  readonly scale: string;

  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: 'id' })
  readonly _id?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '是否必填' })
  readonly required: boolean;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '题目类型' })
  readonly subjectType: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '筛选类型' })
  readonly filterType: string;

  @IsNumber()
  @Type(() => String)
  @ApiModelProperty({ description: '频率筛选条件' })
  readonly filterScore: number;

  @IsNumber()
  @Type(() => String)
  @ApiModelProperty({ description: '筛选层级' })
  readonly layer: number;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '筛选范围' })
  readonly filterRange: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '引导语' })
  readonly guide: string;

  @IsArray()
  @ApiModelProperty({ description: '分数' })
  readonly score: [{
    score: number
  }];

  @IsArray()
  @ApiModelProperty({ description: '选项' })
  readonly option: [{ content: string }];
}
