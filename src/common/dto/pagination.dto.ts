import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class Pagination {
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
  readonly search?: string;

  @IsString()
  @Type(() => String)
  @IsOptional()
  @ApiModelPropertyOptional({ description: '搜索参数' })
  readonly value?: string;
}
