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

  @Get('/projects/:id')
  @ApiOperation({ title: '获取计划已生成反馈的问卷列表', description: '获取计划已生成反馈的问卷列表' })
  async questionnaires(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const data = await this.feedbackService.questionnaires(id, req.user._id)
    return { status: 200, data }
  }

  @Get('/questionnaires/:id')
  @ApiOperation({ title: '问卷的反馈指标', description: '问卷的反馈指标' })
  async feedback(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const data = await this.feedbackService.scales(id, req.user._id)
    return { status: 200, data }
  }

  @Get('/questionnaires/:id')
  @ApiOperation({ title: '问卷的反馈指标', description: '问卷的反馈指标' })
  async feedback(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ) {
    const data = await this.feedbackService.scales(id, req.user._id)
    return { status: 200, data }
  }
}