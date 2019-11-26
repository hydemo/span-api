import { Controller, Post, Query, Inject, Request, UseInterceptors, FileInterceptor, UploadedFile } from '@nestjs/common';
import {
  ApiUseTags,
  ApiForbiddenResponse,
  ApiConsumes,
  ApiImplicitFile,
} from '@nestjs/swagger';
import * as multer from 'multer'
import { join } from 'path';
import { extname } from 'path';
import { UserLinkService } from 'src/module/userLink/userLink.service';

@ApiUseTags('cms/link')
@ApiForbiddenResponse({ description: 'Unauthorized' })

@Controller('cms/link')
export class CMSLinkController {
  constructor(
    @Inject(UserLinkService) private userLinkService: UserLinkService,
  ) { }


  @Post('')
  // @UseGuards(AuthGuard())
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
    // @Query('company', new MongodIdPipe()) company: string
  ) {
    return await this.userLinkService.upload('temp/excel', file.filename)
  }




}