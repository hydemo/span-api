import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common'
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { Pagination } from 'src/common/dto/pagination.dto'
import { QuestionnaireService } from 'src/module/questionnaire/questionnaire.service';
import { CreateQuestionnaireDTO } from 'src/module/questionnaire/questionnaire.dto';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
import { UserQuestionnaireService } from 'src/module/userQuestionnaire/userQuestionnaire.service';
import { UserInfoAnswerDTO, SubjectDTO, UserfilterDTO } from 'src/module/userQuestionnaire/userQuestionnaire.dto';


@ApiUseTags('api/questionnaires')
@ApiForbiddenResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@Controller('api/questionnaires')
@UseGuards(AuthGuard())
export class ApiQuestionnaireController {
  constructor(
    @Inject(UserQuestionnaireService) private userQuestionnaireService: UserQuestionnaireService,
  ) { }

  @Get('/:id')
  @ApiOperation({ title: '问卷详情', description: '问卷详情' })
  async questionnaire(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const { data, current } = await this.userQuestionnaireService.findById(id, req.user._id)
    return { status: 200, data, current }
  }

  @Get('/:id/userinfo')
  @ApiOperation({ title: '用户信息题', description: '用户信息题' })
  async userinfo(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const data = await this.userQuestionnaireService.getUserinfo(id, req.user._id)
    return { status: 200, data, }
  }

  @Post('/:id/userinfo')
  @ApiOperation({ title: '用户信息题', description: '用户信息题' })
  async userinfoAnswer(
    @Param('id', new MongodIdPipe()) id: string,
    @Body() userinfo: UserInfoAnswerDTO,
    @Request() req: any,
  ) {
    console.log(userinfo, 'userinfo')
    const current = await this.userQuestionnaireService.userinfoAnswer(id, userinfo, req.user._id)
    return { status: 200, current }
  }

  @Get('/:id/userfilter')
  @ApiOperation({ title: '用户筛选题', description: '用户筛选题' })
  async userfilter(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const userQuestionnaire = await this.userQuestionnaireService.canActive(id, req.user._id)
    const data = await this.userQuestionnaireService.getUserfilter(userQuestionnaire, userQuestionnaire.userfilterChoice.length + 1)
    console.log(data, 'data')
    return { status: 200, data }
  }

  @Post('/:id/userfilter')
  @ApiOperation({ title: '提交用户筛选题', description: '提交用户筛选题' })
  async userfilterAnswer(
    @Param('id', new MongodIdPipe()) id: string,
    @Body() userfilter: UserfilterDTO,
    @Request() req: any,
  ) {
    const userQuestionnaire = await this.userQuestionnaireService.canActive(id, req.user._id)
    const data = await this.userQuestionnaireService.userfilterAnswer(userQuestionnaire, userfilter, userQuestionnaire.userfilterChoice.length + 1)
    return { status: 200, data }
  }

  @Get('/:id/choice')
  @ApiOperation({ title: '用户筛选题', description: '用户筛选题' })
  async choice(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const userQuestionnaire = await this.userQuestionnaireService.canActive(id, req.user._id)
    const data = await this.userQuestionnaireService.getChoice(userQuestionnaire)
    return { status: 200, data }
  }

  @Get('/:id/subject')
  @ApiOperation({ title: '主体题', description: '主体题' })
  async subject(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const data = await this.userQuestionnaireService.getSubject(id, req.user._id)
    return { status: 200, data }
  }

  @Post('/:id/subject')
  @ApiOperation({ title: '主体题', description: '主体题' })
  async subjectAnswer(
    @Param('id', new MongodIdPipe()) id: string,
    @Body() answer: SubjectDTO,
    @Request() req: any,
  ) {
    const data = await this.userQuestionnaireService.subjectAnswer(id, req.user, answer)

    return { status: 200, data }
  }


}