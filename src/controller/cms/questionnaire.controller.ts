import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common'
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Pagination } from 'src/common/dto/pagination.dto'
import { QuestionnaireService } from 'src/module/questionnaire/questionnaire.service';
import { CreateQuestionnaireDTO } from 'src/module/questionnaire/questionnaire.dto';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';


@ApiUseTags('admin/questionnaires')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('admin/questionnaires')
@UseGuards(AuthGuard())
export class CMSQuestionnaireController {
  constructor(
    @Inject(QuestionnaireService) private questionnaireService: QuestionnaireService,
  ) { }

  @ApiOkResponse({
    description: '问卷列表',
    // // type: CreateQuestionnaireDTO,
    isArray: true,
  })
  @Get('/')
  @ApiOperation({ title: '问卷列表', description: '问卷列表' })
  async sacles(
    @Query() pagination: Pagination,
    @Query('isArchive') isArchive: boolean,
    @Request() req: any,
  ) {
    const data = await this.questionnaireService.list(pagination, req.user._id, isArchive)
    return { status: 200, data }
  }

  @Post('/')
  @ApiOperation({ title: '新增问卷', description: '新增问卷' })
  async addSacle(
    @Body() questionnaire: any,
    @Request() req: any,
  ) {
    return await this.questionnaireService.create(questionnaire, req.user)
  }

  // @Put('/:id')
  // @ApiOperation({ title: '新增问卷版本', description: '新增问卷版本' })
  // async updateQuestionnaire(
  //   @Body() questionnaire: any,
  //   @Param('id', new MongodIdPipe()) id: string,
  // ) {
  //   const data = await this.questionnaireService.update(id, questionnaire.questionnaireObject)
  //   return { status: 200, data }
  // }

  // @ApiOkResponse({
  //   description: '问卷标签列表',
  //   // // type: CreateQuestionnaireDTO,
  //   isArray: true,
  // })
  // @Get('/tags')
  // @ApiOperation({ title: '问卷标签列表', description: '问卷标签列表' })
  // async questionnaireTags(
  //   @Query() pagination: Pagination,
  // ) {
  //   const data = await this.tagService.list(pagination)
  //   return { status: 200, data }
  // }

  // @ApiOkResponse({
  //   description: '问卷标尺列表',
  //   // // type: CreateQuestionnaireDTO,
  //   isArray: true,
  // })
  // @Get('/questionnaireOptions')
  // @ApiOperation({ title: '问卷标尺列表', description: '问卷标尺列表' })
  // async questionnaireOptions(
  //   @Query() pagination: Pagination,
  //   @Request() req: any,
  //   @Query('type') type: string,
  // ) {
  //   return await this.questionnaireOptionService.list(pagination, type, req.user._id)
  // }


  // @Post('/questionnaireOptions')
  // @ApiOperation({ title: '新增问卷标尺', description: '新增问卷标尺' })
  // async createQuestionnaireOptions(
  //   @Body() questionnaireOption: CreateQuestionnaireOptionDTO,
  //   @Request() req: any,
  // ) {
  //   await this.questionnaireOptionService.create(questionnaireOption, req.user)
  //   return { status: 200, message: 'success' }
  // }


  // @Delete('/questionnaireOptions/:id')
  // @ApiOperation({ title: '问卷标签列表', description: '问卷标签列表' })
  // async deleteQuestionnaireOption(
  //   @Param('id', new MongodIdPipe()) id: string,
  //   @Request() req: any,
  // ) {
  //   await this.questionnaireOptionService.deleteById(id, req.user._id)
  //   return { status: 200, message: 'success' }
  // }

  @Get('/detail/:id')
  @ApiOperation({ title: '问卷详情包含题目', description: '问卷详情包含题目' })
  async getFullQuestionnaireById(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.questionnaireService.getFullQuestionnaireById(id)
    return { status: 200, data }
  }

  @Get('/:id')
  @ApiOperation({ title: '问卷详情', description: '问卷详情' })
  async getQuestionnaireById(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.questionnaireService.findById(id)
    return { status: 200, data }
  }

  @Get('/:id/userinfo')
  @ApiOperation({ title: '问卷详情', description: '问卷详情' })
  async getUserinfo(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.questionnaireService.getUserinfo(id)
    return { status: 200, data }
  }

  @Post('/:id/userfilter')
  @ApiOperation({ title: '问卷详情', description: '问卷详情' })
  async getUserfilter(
    @Param('id', new MongodIdPipe()) id: string,
    @Body() body: any,
  ) {
    const data = await this.questionnaireService.getUserfilter(id, body.subjectNum, body.choice || '', body.type || '')
    return { status: 200, data }
  }

  @Get('/:id/subject')
  @ApiOperation({ title: '问卷详情', description: '问卷详情' })
  async getSubject(
    @Param('id', new MongodIdPipe()) id: string,
    @Query('choice') choice: any,
  ) {
    const data = await this.questionnaireService.getSubject(id, choice || [])
    return { status: 200, data }
  }

  @Put('/:id/archive')
  @ApiOperation({ title: '问卷归档', description: '问卷归档' })
  async archive(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.questionnaireService.archive(id)
    return { status: 200, data }
  }

  @Put('/:id/recover')
  @ApiOperation({ title: '问卷归档', description: '问卷归档' })
  async recover(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.questionnaireService.recover(id)
    return { status: 200, data }
  }

  @Delete('/:id')
  @ApiOperation({ title: '删除问卷', description: '删除问卷' })
  async deleteById(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    return await this.questionnaireService.deleteById(id)
  }

  // @Put('/:id/archive')
  // @ApiOperation({ title: '新增问卷', description: '新增问卷' })
  // async archive(
  //   @Param('id', new MongodIdPipe()) id: string,
  // ) {
  //   const data = await this.questionnaireService.archive(id)
  //   return { status: 200, data }
  // }

  // @Put('/:id/recover')
  // @ApiOperation({ title: '新增问卷', description: '新增问卷' })
  // async recover(
  //   @Param('id', new MongodIdPipe()) id: string,
  // ) {
  //   const data = await this.questionnaireService.recover(id)
  //   return { status: 200, data }
  // }
}