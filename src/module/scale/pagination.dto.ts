import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsString, IsMongoId, IsEnum, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class ScalePagination {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiModelPropertyOptional({ type: Number, example: 1 })
  @Type(() => Number)
  readonly current: number = 1;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiModelPropertyOptional({ type: Number, example: 10 })
  @Type(() => Number)
  readonly pageSize: number = 10;

  @IsString()
  @Type(() => String)
  @IsOptional()
  @ApiModelPropertyOptional({ description: '标签参数' })
  readonly value?: string = '';

  @IsString()
  @Type(() => String)
  @IsOptional()
  @ApiModelPropertyOptional({ description: '类型' })
  readonly type: string;

  @IsString()
  @IsEnum([
    "baseScale",
    "infoScale",
    "filterScale",
    "customizeScale",
    "socialScale"
  ])
  @Type(() => String)
  @IsOptional()
  @ApiModelPropertyOptional({ description: '量表类型' })
  readonly scaleType: string;


  @IsMongoId()
  @Type(() => String)
  @IsOptional()
  @ApiModelPropertyOptional({ description: '量表id' })
  readonly scaleId?: string;

  @IsString()
  @IsEnum(["singlechoice", "multiplechoice", "text", "answer", "social"])
  @Type(() => String)
  @IsOptional()
  @ApiModelPropertyOptional({ description: '题目类型' })
  readonly subjectType?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  @ApiModelPropertyOptional({ description: '题目类型' })
  readonly isArchive?: boolean;
}
