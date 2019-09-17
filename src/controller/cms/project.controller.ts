import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common'
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { ProjectService } from 'src/module/project/project.service'
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe'
import { Pagination } from 'src/common/dto/pagination.dto'
import { CreateProjectDTO } from 'src/module/project/project.dto';


@ApiUseTags('admin/projects')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('admin/projects')
@UseGuards(AuthGuard())
export class CMSProjectController {
  constructor(
    @Inject(ProjectService) private projectService: ProjectService,
  ) { }

  @ApiOkResponse({
    description: '问卷计划列表',
    isArray: true,
  })
  @Get('/')
  @ApiOperation({ title: '问卷计划列表', description: '问卷计划列表' })
  async sacles(
    @Query() pagination: Pagination,
    @Query('isArchive') isArchive: boolean,
  ) {
    const data = await this.projectService.list(pagination, isArchive)
    return { status: 200, data }
  }

  @Post('/')
  @ApiOperation({ title: '新增问卷计划', description: '新增问卷计划' })
  async addSacle(
    @Body() project: CreateProjectDTO,
    @Request() req: any,
  ) {
    return await this.projectService.create(project, req.user)
  }

  @Get('/assignType')
  @ApiOperation({ title: '分配方案', description: '分配方案' })
  async assignType(
    @Query('category') category: number,
  ) {
    const data = await this.projectService.assignType(category)
    return { status: 200, data }
  }

  @Get('/:id')
  @ApiOperation({ title: '分配方案', description: '分配方案' })
  async detail(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.projectService.findById(id)
    return { status: 200, data }
  }

  @Delete('/:id')
  @ApiOperation({ title: '删除计划', description: '删除计划' })
  async deleteById(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any
  ) {
    const data = await this.projectService.deleteById(id, req.user._id)
    return { status: 200, data }
  }

  // @ApiOkResponse({
  //   description: '问卷计划标签列表',
  //   // // type: CreateProjectDTO,
  //   isArray: true,
  // })
  // @Get('/tags')
  // @ApiOperation({ title: '问卷计划标签列表', description: '问卷计划标签列表' })
  // async projectTags(
  //   @Query() pagination: Pagination,
  // ) {
  //   const data = await this.tagService.list(pagination)
  //   return { status: 200, data }
  // }


  @Put('/:id/archive')
  @ApiOperation({ title: '新增问卷计划', description: '新增问卷计划' })
  async archive(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.projectService.archive(id)
    return { status: 200, data }
  }

  @Put('/:id/recover')
  @ApiOperation({ title: '新增问卷计划', description: '新增问卷计划' })
  async recover(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.projectService.recover(id)
    return { status: 200, data }
  }
}