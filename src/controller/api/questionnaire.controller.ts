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
import { UserQuestionnaireService } from 'src/module/userQuestionnaire/userQuestionnaire.service';


@ApiUseTags('api/questionnaires')
@ApiForbiddenResponse({ description: 'Unauthorized' })

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

  @Get('/:id/userfilter')
  @ApiOperation({ title: '用户筛选题', description: '用户筛选题' })
  async userfilter(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
    @Query('subjectNum') subjectNum: number,
  ) {
    const data = await this.userQuestionnaireService.getUserfilter(id, req.user._id, Number(subjectNum))
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


}