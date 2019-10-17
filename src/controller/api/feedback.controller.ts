import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request } from '@nestjs/common'
import {
  ApiUseTags,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
import { FeedbackService } from 'src/module/feedback/feedback.service';


@ApiUseTags('api/feedbacks')
@ApiForbiddenResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@Controller('api/feedbacks')
@UseGuards(AuthGuard())
export class ApiFeedbackController {
  constructor(
    @Inject(FeedbackService) private feedbackService: FeedbackService,
  ) { }

  @Get('/projects')
  @ApiOperation({ title: '获取计划已生成反馈的问卷列表', description: '获取计划已生成反馈的问卷列表' })
  async projects(
    @Request() req: any,
  ) {
    const data = await this.feedbackService.projects(req.user)
    return { status: 200, data }
  }

  @Get('/projects/:id')
  @ApiOperation({ title: '获取计划已生成反馈的问卷列表', description: '获取计划已生成反馈的问卷列表' })
  async questionnaires(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const data = await this.feedbackService.questionnaires(id)
    return { status: 200, data }
  }

  @Get('/projects/:id/questionnaires/:questionnaireId')
  @ApiOperation({ title: '问卷的反馈指标', description: '问卷的反馈指标' })
  async scales(
    @Param('id', new MongodIdPipe()) id: string,
    @Param('questionnaireId', new MongodIdPipe()) questionnaireId: string,
    @Request() req: any,
  ) {
    const data = await this.feedbackService.scales(id, questionnaireId, req.user._id)
    return { status: 200, data }
  }

  @Get('/projects/:id/questionnaires/:questionnaireId/permission')
  @ApiOperation({ title: '指标反馈详情', description: '指标反馈详情' })
  async leaderPermission(
    @Param('id', new MongodIdPipe()) id: string,
    @Param('questionnaireId', new MongodIdPipe()) questionnaireId: string,
    @Request() req: any,
  ) {

    const data = await this.feedbackService.leaderPermission(id, questionnaireId, req.user)
    return { status: 200, data }
  }

  @Get('/projects/:id/questionnaires/:questionnaireId/scales/:scaleId')
  @ApiOperation({ title: '指标反馈详情', description: '指标反馈详情' })
  async feedback(
    @Param('id', new MongodIdPipe()) id: string,
    @Param('questionnaireId', new MongodIdPipe()) questionnaireId: string,
    @Param('scaleId', new MongodIdPipe()) scaleId: string,
    @Query('leader') leader: boolean,
    @Query('departmentId') departmentId: string,
    @Request() req: any,
  ) {

    const data = await this.feedbackService.feedback(id, questionnaireId, scaleId, Number(leader), req.user, departmentId)
    return { status: 200, data }
  }
}