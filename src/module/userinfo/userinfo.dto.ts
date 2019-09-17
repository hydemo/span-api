import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsArray, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserinfoDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '题目类型' })
  readonly subjectType: string;

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '是否必填' })
  readonly required: boolean;

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

  @IsArray()
  @ApiModelProperty({ description: '选项' })
  readonly option: [{ content: string, optionNum: number }];
}
