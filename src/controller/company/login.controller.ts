import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from 'src/module/company/company.service';
import { CreateCompanyDTO, CompanyLoginDTO, CompanyResetPassDTO, CompanyEmailPassDTO } from 'src/module/company/company.dto';


@ApiUseTags('company/user')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('company/user')
// @UseGuards(AuthGuard())
export class CompanyUserController {
  constructor(
    @Inject(CompanyService) private companyService: CompanyService,
  ) { }

  @Post('/register')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async register(
    @Body() company: CreateCompanyDTO,
    @Request() req: any
  ) {
    await this.companyService.register(name);
    return { status: 200, code: 2020 };
  }

  @Post('/login')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async login(
    @Body() login: CompanyLoginDTO,
    @Request() req: any
  ) {
    const clientIp = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
    return await this.companyService.login(login.username, login.password, clientIp);
  }

  @UseGuards(AuthGuard())
  @Get('/signout')
  @ApiOkResponse({
    description: '登录成功',
  })
  @ApiOperation({ title: '登录', description: '登录' })
  async signout(
    @Request() req): Promise<any> {
    await this.companyService.signout(req.user._id)
    return { status: 200, code: 2002 }
  }

  @Post('/email/password')
  @ApiOkResponse({
    description: '邮箱重置密码',
  })
  @ApiOperation({ title: '邮箱重置密码', description: '邮箱重置密码' })
  async sendResetPassEmail(
    @Body() reset: CompanyEmailPassDTO,
    @Request() req): Promise<any> {
    return await this.companyService.sendResetPassEmail(reset.username, reset.language)
  }

  @Post('/phone/activation')
  @ApiOkResponse({
    description: '发送短信验证码',
  })
  @ApiOperation({ title: '发送短信验证码', description: '发送短信验证码' })
  async sendPhoneCode(
    @Body('username') username: string,
    @Request() req): Promise<any> {
    return await this.companyService.sendPhoneCode(username)
  }

  @Post('/phone/code')
  @ApiOkResponse({
    description: '获取短信验证码',
  })
  @ApiOperation({ title: '获取短信验证码', description: '获取短信验证码' })
  async getPhoneCode(
    @Query('phone') phone: string,
    @Request() req): Promise<any> {
    return await this.companyService.getPhoneCode(phone)
  }

  @Post('/phone/codeverification')
  @ApiOkResponse({
    description: '短信验证码校验',
  })
  @ApiOperation({ title: '短信验证码校验', description: '短信验证码校验' })
  async phoneCodeCheck(
    @Body('code') code: string,
    @Body('username') username: string,
    @Request() req): Promise<any> {
    return await this.companyService.phoneCodeCheck(username, code)
  }

  @Put('/passforget')
  @ApiOkResponse({
    description: '重置密码',
  })
  @ApiOperation({ title: '重置密码', description: '重置密码' })
  async passforget(
    @Body() reset: CompanyResetPassDTO,
  ): Promise<any> {
    return await this.companyService.resetPassword(reset.username, reset)
  }

  @Get('/passforget')
  @ApiOkResponse({
    description: '重置密码',
  })
  @ApiOperation({ title: '重置密码', description: '重置密码' })
  async forgetTokenCheck(
    @Query('token') token: string,
    @Response() res,
  ): Promise<any> {
    return await this.companyService.forgetTokenCheck(token, res)
  }

}