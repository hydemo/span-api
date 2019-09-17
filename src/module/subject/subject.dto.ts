import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsArray, IsNumber, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSubjectDTO {
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

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '题目类型' })
  readonly subjectType: string;

  @IsArray()
  @ApiModelProperty({ description: '选项' })
  readonly option: [{ content: string, optionNum: number }];

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '引导语' })
  readonly guide: string;

  //页码
  @IsNumber()
  @Type(() => Number)
  @ApiModelProperty({ description: '页码' })
  readonly page: number;

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '是否必填' })
  readonly required: boolean;
  //总页数
  @IsNumber()
  @Type(() => Number)
  @ApiModelProperty({ description: '总页码' })
  readonly totalPage: number;
}
