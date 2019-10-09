import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsMongoId, IsArray } from 'class-validator';
import { Type } from 'class-transformer';


export class OptionDTO {
  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: '答案id' })
  readonly optionId: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '答案' })
  readonly content: string;
}

export class ChoiceDTO {
  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: '答案id' })
  readonly questionId: string;

  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: '选项id' })
  readonly optionId: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '答案' })
  readonly scoreMethod: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '答案' })
  readonly content: string;
}

export class UserInfoDTO {
  @IsMongoId()
  @Type(() => String)
  @ApiModelPropertyOptional({ description: '题目id' })
  readonly questionId?: string;

  @IsArray()
  @ApiModelProperty({ description: '答案', isArray: true, type: OptionDTO })
  readonly choice: OptionDTO[];
}

export class UserInfoAnswerDTO {
  @IsArray()
  @ApiModelProperty({ description: '答案', isArray: true, type: UserInfoDTO })
  readonly answer: UserInfoDTO[];
}

export class AnswerDTO {
  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: '问题id' })
  readonly questionId: string;

  selectedArray: any

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '题目类型' })
  readonly type: string;

  @IsArray()
  @IsArray()
  @ApiModelProperty({ description: '答案', isArray: true, type: ChoiceDTO })
  readonly choice: ChoiceDTO[];

  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: '量表id' })
  readonly scaleId?: string;
}

export class SubjectDTO {
  @IsMongoId()
  @Type(() => String)
  @ApiModelPropertyOptional({ description: '被评价人id' })
  readonly rateeId?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '评价类型' })
  readonly rateeType?: string;

  @IsArray()
  @ApiModelProperty({ description: '答案', isArray: true, type: AnswerDTO })
  readonly answer: AnswerDTO[];
}

export class FilterChooseDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '选择' })
  readonly choose: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '答案' })
  readonly content: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '邮箱' })
  readonly email: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '类型' })
  readonly rateeType: string;

  @IsMongoId()
  @Type(() => String)
  @ApiModelPropertyOptional({ description: '被评价人id' })
  readonly id: string;
}


export class UserfilterDTO {
  @IsArray()
  @IsArray()
  @ApiModelProperty({ description: '答案', isArray: true, type: FilterChooseDTO })
  readonly filterChoose: FilterChooseDTO[];
}


