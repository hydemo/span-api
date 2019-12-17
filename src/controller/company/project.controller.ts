import { Body, Controller, Get, Post, Query, Inject, Request, Param, UseGuards, Put, Response } from '@nestjs/common';
import {
  ApiUseTags,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import * as fs from 'fs'
import { ProjectService } from 'src/module/project/project.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
import { CompanyProjectService } from 'src/module/companyProject/companyProject.service';
import { AuthGuard } from '@nestjs/passport';
import { EmailContentDTO } from 'src/module/companyProject/companyProject.dto';
import { ApiException } from 'src/common/expection/api.exception';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';


@ApiUseTags('company/projects')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('company/projects')
@UseGuards(AuthGuard())
export class CompanyProjectController {
  constructor(
    @Inject(ProjectService) private projectService: ProjectService,
    @Inject(CompanyProjectService) private companyProjectService: CompanyProjectService,
  ) { }

  @Get('')
  @ApiOperation({ title: '获取计划列表', description: '获取计划列表' })
  async projects(
    @Query() pagination: Pagination
  ) {
    const data = await this.projectService.projectsForCompany(pagination)
    return { status: 200, data }
  }

  @Get('/me')
  @ApiOperation({ title: '获取计划列表', description: '获取计划列表' })
  async myProjects(
    @Query() pagination: Pagination,
    @Request() req: any,
  ) {
    const data = await this.companyProjectService.myProjects(pagination, req.user)
    return { status: 200, data }
  }

  @Post(':id')
  @ApiOperation({ title: '获取计划列表', description: '获取计划列表' })
  async acceptProject(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
    @Body() questionnaires: any
  ) {
    return await this.companyProjectService.acceptProject(id, req.user, questionnaires)
  }

  @Put('/:id/questionnaires/:questionnaireId')
  @ApiOperation({ title: '修改配置', description: '修改配置' })
  async update(
    @Param('id', new MongodIdPipe()) id: string,
    @Param('questionnaireId', new MongodIdPipe()) questionnaireId: string,
    @Request() req: any,
    @Body() questionnaire: any
  ) {
    const data = await this.companyProjectService.updateProject(id, questionnaireId, questionnaire, req.user)
    return { status: 200, data }
  }

  @Get('/:id/questionnaires/:questionnaireId/progress')
  @ApiOperation({ title: '获取进度', description: '获取进度' })
  async progress(
    @Param('id', new MongodIdPipe()) id: string,
    @Param('questionnaireId', new MongodIdPipe()) questionnaireId: string,
    @Request() req: any,
  ) {
    const data = await this.companyProjectService.progress(id, questionnaireId, req.user)
    return { status: 200, data }
  }

  @Get('/:id/questionnaires/:questionnaireId/download')
  @ApiOperation({ title: '数据下载', description: '数据下载' })
  async download(
    @Param('id', new MongodIdPipe()) id: string,
    @Param('questionnaireId', new MongodIdPipe()) questionnaireId: string,
    @Request() req: any,
    @Response() res: any
  ) {
    try {
      const userAgent = (req.headers["user-agent"] || "").toLowerCase();
      const { filename } = await this.companyProjectService.download(id, questionnaireId, req.uer)
      const path = `temp/download/excel/${filename}`;
      let disposition;
      if (userAgent.indexOf("msie") >= 0 || userAgent.indexOf("chrome") >= 0) {
        disposition = `attachment; filename=${encodeURIComponent(filename)}`;
      } else if (userAgent.indexOf("firefox") >= 0) {
        disposition = `attachment; filename*="utf8''${encodeURIComponent(
          filename
        )}"`;
      } else {
        /* safari等其他非主流浏览器只能自求多福了 */
        disposition = `attachment; filename=${new Buffer(filename).toString(
          "binary"
        )}`;
      }
      res.writeHead(200, {
        "Content-Type": "application/octet-stream;charset=utf8",
        "Content-Disposition": disposition
      });
      const stream = fs.createReadStream(path);
      stream.pipe(res);
      stream
        .on("end", () => {
          fs.exists(path, exists => {
            if (exists)
              fs.unlink(path, err => {
                console.log(err)
              });
          });
          return;
        })
        .on("error", err => {
          throw new ApiException('服务器异常', ApiErrorCode.INTERNAL_ERROR, 500)
        });
    } catch (error) {
      throw new ApiException('服务器异常', ApiErrorCode.INTERNAL_ERROR, 500)
    }
  }


  @Post('/:id/notice')
  @ApiOperation({ title: '发送计划提醒', description: '发送计划提醒' })
  async sendNotice(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
    @Body() content: EmailContentDTO,

  ) {
    const data = await this.companyProjectService.sendNotice(id, req.user, content.content)
    return { status: 200, data }
  }

  @Post('/:id/unComplete')
  @ApiOperation({ title: '未完成提醒', description: '未完成提醒' })
  async sendN(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
    @Body() content: EmailContentDTO,
  ) {
    const data = await this.companyProjectService.sendUnComplete(id, req.user, content.content)
    return { status: 200, data }
  }


}