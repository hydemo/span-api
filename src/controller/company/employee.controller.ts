import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, UseInterceptors, FileInterceptor, UploadedFile, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiConsumes,
  ApiImplicitFile,
} from '@nestjs/swagger';
import * as multer from 'multer'
import { join } from 'path';
import { extname } from 'path';
import * as fs from 'fs';
import { AuthGuard } from '@nestjs/passport';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
import { UserService } from 'src/module/user/user.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { CreateEmployeeDTO } from 'src/module/user/user.dto';


@ApiUseTags('company/employee')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('company')
export class CompanyEmployeeController {
  constructor(
    @Inject(UserService) private userService: UserService,
  ) { }

  @Get('/employee/template')
  @ApiOperation({ title: '获取模版', description: '获取模版' })
  async register(
    @Request() req: any,
    @Query('language') language: string,
    @Response() res: any,
  ) {
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();
    let filename;

    filename = '模板.xlsx';

    const path = `temp/template/${filename}`;
    let disposition;
    if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
      disposition = `attachment; filename=${encodeURIComponent(filename)}`;
    } else if (userAgent.indexOf('firefox') >= 0) {
      disposition = `attachment; filename*="utf8''${encodeURIComponent(filename)}"`;
    } else {
      /* safari等其他非主流浏览器只能自求多福了 */
      disposition = `attachment; filename=${new Buffer(filename).toString('binary')}`;
    }
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream;charset=utf8',
      'Content-Disposition': disposition
    });
    const stream = fs.createReadStream(path);
    stream.pipe(res);
    stream
      .on('end', () => {
        return;
      })
      .on('error', err => {
      });
  }

  @Post('/employee/upload')
  @UseGuards(AuthGuard())
  @ApiConsumes('multipart/form-data')
  @ApiImplicitFile({ name: 'file', required: true, description: '修改头像' })
  @UseInterceptors(FileInterceptor('file', {
    storage: multer.diskStorage({
      destination: join('temp/excel')
      , filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
  }))
  async upload(
    @Request() req,
    @UploadedFile() file,
    @Query('company', new MongodIdPipe()) company: string
  ) {
    return await this.userService.upload('temp/excel', file.filename, company)
  }

  // 获取部门员工
  @Get('/:id/employees')
  @UseGuards(AuthGuard())
  @ApiOperation({ title: '获取员工列表', description: '获取员工列表' })
  async getEmployess(
    @Query() pagination: Pagination,
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any
  ) {
    const data = await this.userService.list(pagination, id, req.user)
    return { status: 200, data }
  }

  @Post('/:id/employees')
  @UseGuards(AuthGuard())
  @ApiOperation({ title: '添加员工', description: '添加员工' })
  async addEmployess(
    @Body() employee: CreateEmployeeDTO,
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any
  ) {
    const data = await this.userService.addEmployee(id, employee, req.user)
    return { status: 200, data }
  }

  @Put('/employees/:userId')
  @UseGuards(AuthGuard())
  @ApiOperation({ title: '修改员工信息', description: '修改员工信息' })
  async updateEmployess(
    @Body() employee: CreateEmployeeDTO,
    @Param('userId', new MongodIdPipe()) userId: string,
    @Request() req: any
  ) {
    const data = await this.userService.updateEmployee(employee, req.user, userId)
    return { status: 200, data }
  }

  @Delete('/employees/:id')
  @UseGuards(AuthGuard())
  @ApiOperation({ title: '删除员工', description: '删除员工' })
  async deleteEmployee(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any
  ) {
    const data = await this.userService.deleteEmployee(id, req.user)
    return { status: 200, data }
  }
}