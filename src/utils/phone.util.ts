import * as SMSClient from '@alicloud/sms-sdk';
import * as randomize from 'randomatic';
import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { RedisService } from 'nestjs-redis';
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum';
import { ApiException } from 'src/common/expection/api.exception';

@Injectable()
export class PhoneUtil {

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) { }
  /**
   * 
   * @param {Object} phone 手机号
   * @returns {Promise} promise
   * @author:oy
   */
  sendVerificationCode(phone: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const accessKeyId = this.config.phoneAccessKey;
      const secretAccessKey = this.config.phoneAccessSecret;
      //生成验证码
      const code = randomize('0', 6);
      //生成手机连接    
      const smsClient = new SMSClient({ accessKeyId, secretAccessKey });
      //发送短信
      smsClient.sendSMS({
        PhoneNumbers: `${phone}`,
        SignName: this.config.signModel,
        TemplateCode: this.config.verifyModel,
        TemplateParam: `{ "code": "${code}" }`
      }).then((res) => {
        let { Code } = res;
        if (Code === 'OK') {
          const client = this.redis.getClient()
          client.set(phone, code, 'EX', 60 * 5);
          return resolve(true)
        }
      }, (err) => {
        return resolve(false);
      })
    });
  }
  /**
    * ----{短信验证}----
    * @param {String} user 用户名 
    * @param {String} code 验证码
    * @returns {Promise} promise
    * @author:oy 
    */
  async codeCheck(phone: string, code: string) {
    const client = this.redis.getClient()
    const storeCode = await client.get(phone);
    if (!storeCode) {
      return { status: 400, code: 4043, msg: 'code expire' }
    }
    if (storeCode === code) {
      return { status: 200, code: 2050 }
    } else {
      return { status: 400, code: 4044, msg: 'code error' }
    }
  }
}
