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


@ApiUseTags('company/questionnaires')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('company/questionnaires')
@UseGuards(AuthGuard())
export class CompanyQuestionnaireController {
  constructor(
    @Inject(QuestionnaireService) private questionnaireService: QuestionnaireService,
  ) { }

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

  @Get('/:id/scales')
  @ApiOperation({ title: '获取问卷量表', description: '获取问卷量表' })
  async getScale(
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const data = await this.questionnaireService.getScale(id)
    return { status: 200, data }
  }
}