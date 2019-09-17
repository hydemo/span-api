import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common'
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ScaleService } from 'src/module/scale/scale.service'
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe'
import { ScalePagination } from 'src/module/scale/pagination.dto'
import { Pagination } from 'src/common/dto/pagination.dto'
import { TagService } from 'src/module/scaleTag/scaleTag.service'
import { ScaleOptionService } from 'src/module/scaleOption/scaleOption.service'
import { CreateScaleOptionDTO } from 'src/module/scaleOption/scaleOption.dto'


@ApiUseTags('admin/scales')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('admin/scales')
@UseGuards(AuthGuard())
export class CMSScaleController {
  constructor(
    @Inject(ScaleService) private scaleService: ScaleService,
    @Inject(TagService) private tagService: TagService,
    @Inject(ScaleOptionService) private scaleOptionService: ScaleOptionService,
  ) { }

  @ApiOkResponse({
    description: '量表列表',
    // // type: CreateScaleDTO,
    isArray: true,
  })
  @Get('/')
  @ApiOperation({ title: '量表列表', description: '量表列表' })
  async sacles(
    @Query() pagination: ScalePagination,
    @Request() req: any,
  ) {
    const data = await this.scaleService.list(pagination, req.user._id)
    return { status: 200, data }
  }

  @Post('/')
  @ApiOperation({ title: '新增量表', description: '新增量表' })
  async addSacle(
    @Body() scale: any,
  ) {
    const data = await this.scaleService.create(scale.scaleObject)
    return { status: 200, data }
  }

  @Put('/:id')
  @ApiOperation({ title: '新增量表版本', description: '新增量表版本' })
  async updateScale(
    @Body() scale: any,
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.scaleService.update(id, scale.scaleObject)
    return { status: 200, data }
  }

  @ApiOkResponse({
    description: '量表标签列表',
    // // type: CreateScaleDTO,
    isArray: true,
  })
  @Get('/tags')
  @ApiOperation({ title: '量表标签列表', description: '量表标签列表' })
  async scaleTags(
    @Query() pagination: Pagination,
  ) {
    const data = await this.tagService.list(pagination)
    return { status: 200, data }
  }

  @ApiOkResponse({
    description: '量表标尺列表',
    // // type: CreateScaleDTO,
    isArray: true,
  })
  @Get('/scaleOptions')
  @ApiOperation({ title: '量表标尺列表', description: '量表标尺列表' })
  async scaleOptions(
    @Query() pagination: Pagination,
    @Request() req: any,
    @Query('type') type: string,
  ) {
    return await this.scaleOptionService.list(pagination, type, req.user._id)
  }


  @Post('/scaleOptions')
  @ApiOperation({ title: '新增量表标尺', description: '新增量表标尺' })
  async createScaleOptions(
    @Body() scaleOption: CreateScaleOptionDTO,
    @Request() req: any,
  ) {
    await this.scaleOptionService.create(scaleOption, req.user)
    return { status: 200, message: 'success' }
  }


  @Delete('/scaleOptions/:id')
  @ApiOperation({ title: '量表标签列表', description: '量表标签列表' })
  async deleteScaleOption(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    await this.scaleOptionService.deleteById(id, req.user._id)
    return { status: 200, message: 'success' }
  }

  @Get('/:id')
  @ApiOperation({ title: '量表详情', description: '量表详情' })
  async getScaleById(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.scaleService.getScaleById(id)
    return { status: 200, data }
  }

  @Delete('/:id')
  @ApiOperation({ title: '删除量表', description: '删除量表' })
  async deleteById(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    await this.scaleService.deleteById(id)
    return { status: 200, code: 2042 }
  }

  @Put('/:id/archive')
  @ApiOperation({ title: '新增量表', description: '新增量表' })
  async archive(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.scaleService.archive(id)
    return { status: 200, data }
  }

  @Put('/:id/recover')
  @ApiOperation({ title: '新增量表', description: '新增量表' })
  async recover(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.scaleService.recover(id)
    return { status: 200, data }
  }
}