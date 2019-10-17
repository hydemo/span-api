import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Req, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { createDecipheriv } from 'crypto';


@ApiUseTags('api/user')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('api')
export class ApiKefusController {
  constructor(

  ) { }

  @Post('/weixin')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async login(
    @Body() body,
    @Query('openid') openid: string,
    @Request() req: any
  ) {
    console.log(body)
    return 'success'
  }

  @Get('/weixin')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async weixin(
    @Query('echostr') echostr: string,
    @Request() req: any
  ) {
    return echostr
  }

  @Get('/test')
  @ApiOperation({ title: '注册企业', description: '注册企业' })
  async test(
  ) {
    const text = 'oSD/k/q/ZZe7gJCH6WPDggIllBMrBMpZ0hfbRPux9OsW+Aifc51v1v9YaE2MgOwoScVm6DHbasV6aFWOqillv5ALCQ4Tf3GolOWh/HiqH2ZwNXw897q9QkM4JZdIUnKlA8lbUm6VmUdRGoHNGAPlK550gau3sNW2CN+eeillPyF5rl7cyDbiPsHy8UfpGsu6s47eDwp7QtTxYNldEcypoSb/uiGNiksFcPNHdpuHEvJYcJ73VxG2zf1GBQ3EX3zR1xF2UgYrui64jex8eZ54AFXRXbYc1N/zed34cE4iaKu5zNbo0+g6DGwjss7C/FgnM/g44lZ0J5M/fd0GTsGbXOjpddMyWWNClvLv7uNhAkHm9JJwlGzK8dHVuSov19Q+'
    // const text = 'td+B9uWrhktFNsp4tVud6/Kj6CEwSEtOJnwj/1d74istGLZXQPlvUO6zsE307uMuoE+f6J261yGVUClPBUzmcLpWHGQHCwDU3/h4GdPxaPH8kSfIV1bfrTGbXeAH44rksREXE2ee9bclaslmb8uUv4Br9Cq8uhB5ZV7ifjFsyiv9WyWESD2G+ZFvQUOvf9u1YaHy+XZFFTk+GLHsQtH0Xggs4LUM46qjJzU8hjd3VDEFenThXEYX/QwLaIYK0gnU3UFCobdjpFqOfhwheCUj2Rukacjm8Ni8UCZS1nQDfx0='
    // const arr = ['thinkthen', '1571307998', '947615597', 'td+B9uWrhktFNsp4tVud6/Kj6CEwSEtOJnwj/1d74istGLZXQPlvUO6zsE307uMuoE+f6J261yGVUClPBUzmcLpWHGQHCwDU3/h4GdPxaPH8kSfIV1bfrTGbXeAH44rksREXE2ee9bclaslmb8uUv4Br9Cq8uhB5ZV7ifjFsyiv9WyWESD2G+ZFvQUOvf9u1YaHy+XZFFTk+GLHsQtH0Xggs4LUM46qjJzU8hjd3VDEFenThXEYX/QwLaIYK0gnU3UFCobdjpFqOfhwheCUj2Rukacjm8Ni8UCZS1nQDfx0=']
    // const data = createHash('sha1').update(arr.sort().join('')).digest('hex');
    let aesKey = Buffer.from('qs61gyWAJezqrY9wHb7m9xLptkiFBxX86vQhzrTrj5D' + '=', 'base64');
    const cipherEncoding = 'base64';
    const clearEncoding = 'utf8';
    const cipher = createDecipheriv('aes-256-cbc', aesKey, aesKey.slice(0, 16));
    cipher.setAutoPadding(false); // 是否取消自动填充 不取消
    let this_text = cipher.update(text, cipherEncoding, clearEncoding) + cipher.final(clearEncoding);
    console.log(this_text, 'aaa')
  }



}