import { Controller, Get, Query, UseGuards, Inject, Request, Put, Response, Req, Delete, Param } from '@nestjs/common'
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { AuthGuard } from '@nestjs/passport'
import { UserProjectService } from 'src/module/userProject/userProject.service';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
import { UserQuestionnaireService } from 'src/module/userQuestionnaire/userQuestionnaire.service';


@ApiUseTags('api/projects')
@ApiForbiddenResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@Controller('api/projects')
@UseGuards(AuthGuard())
export class ApiProjectController {
  constructor(
    @Inject(UserProjectService) private userProjectService: UserProjectService,
    @Inject(UserQuestionnaireService) private userQuestionnaireService: UserQuestionnaireService,
  ) { }

  @ApiOkResponse({
    description: '问卷计划列表',
    isArray: true,
  })
  @Get('/')
  @ApiOperation({ title: '问卷计划列表', description: '问卷计划列表' })
  async projects(
    @Request() req: any,
  ) {
    console.log(req.user._id)
    const data = await this.userProjectService.list(req.user._id)
    return { status: 200, data }
  }

  @ApiOkResponse({
    description: '问卷计划列表',
    isArray: true,
  })
  @Get('/:id/questionnaires')
  @ApiOperation({ title: '问卷计划列表', description: '问卷计划列表' })
  async questionnaires(
    @Request() req: any,
    @Param('id', new MongodIdPipe()) id: string,
  ) {
    const userProject = await this.userProjectService.findById(id, req.user._id)
    const data = await this.userQuestionnaireService.list(userProject)
    return { status: 200, data }
  }
}