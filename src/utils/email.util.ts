import { Injectable } from '@nestjs/common';
import * as  nodemail from 'nodemailer';
import * as smtpTransport from 'nodemailer-smtp-transport';
import * as util from 'util';
import { ConfigService } from 'src/config/config.service';

@Injectable()
export class EmailUtil {
  constructor(
    private readonly config: ConfigService,
  ) { }
  /**
   * 
   * @param {Object} mailOption 邮件内容
   * @returns {void} 
   */
  async sendMail(mailOption) {
    //邮件发送方的设置
    const transporter =
      nodemail.createTransport(smtpTransport(this.config.mail_opts));
    for (let i = 0; i < 5; i++) {
      try {
        await transporter.sendMail(mailOption);
        i = 5;
      } catch (error) {
        if (i === 4) {
          return { status: 400, code: 4020 };//返回邮件发送错误code
        }
      }
    }
    const index = mailOption.to.indexOf('@')
    const start = (index - 1) / 2;
    const replaceStr = mailOption.to.substring(start, index - 1);
    const str = '*'.repeat(replaceStr.length)
    const mail = mailOption.to.replace(replaceStr, str);
    return { status: 200, code: 2010, mail };//返回成功code
  }
  /**
   * 
   * @param {String} who 激活账号邮箱 
   * @param {String} token 激活验证码 
   * @param {String} language 语言类型
   * @param {String} url 邮件链接路径
   * @returns {Object} 返回邮箱发送结果code
   * @author: oy
   */
  async sendActiveMail(who, token, language, url) {
    const from = util.format('%s <%s>',
      this.config.name, this.config.mail_opts.auth.user);
    const to = who;
    let subject;
    let html;
    if (language === 'zh') {
      subject = `${this.config.name}账号激活`;
      html = `请点击下面链接激活账号:
        <a href="${url}?token=${token}&language=zh">激活链接</a>`
    } else {
      subject = `${this.config.name} Account activation`;
      html = `Please click on the link to active your account: 
        <a href="${url}?token=${token}&language=en-US">Active link</a>`
    }
    const mailOption = { from, to, subject, html };
    return await this.sendMail(mailOption);
  }
  /**
   * ----{发送修改密码验证邮件}----
   * @param {String} who 账号邮箱 
   * @param {String} token 验证码 
   * @param {String} language 语言类型
   * @param {String} url 邮件链接路径
   * @returns {Object} 返回邮箱发送结果code
   * @author: oy
   */
  async sendResetPassMail(who, token, language, url) {
    const from = util.format('%s <%s>',
      this.config.name, this.config.mail_opts.auth.user);
    const to = who;
    let subject;
    let html;
    if (language === 'zh') {
      subject = `${this.config.name}密码修改`;
      html = `请点击下面链接修改密码:
        <a href="${url}?token=${token}">激活链接</a>`
    } else {
      subject = `${this.config.name} password reset`;
      html = `Please click on the link to reset your password: 
        <a href="${url}?token=${token}">Active link</a>`
    }
    const mailOption = { from, to, subject, html };
    return await this.sendMail(mailOption);
  }
  /**
   * ----{发送未完成问卷邮件}----
   * @param {String} who 账号邮箱 
   * @param {String} language 语言类型
   * @param {String} questionnaireName 问卷名字
   * @returns {Object} 返回邮箱发送结果code
   * @author: jv
   */

  async sendNotice(who, content) {
    const from = util.format('%s <%s>',
      this.config.name, this.config.mail_opts.auth.user);
    const to = who;
    let subject;
    let html;
    // if (language === 'zh') {
    subject = `您有一份问卷计划还未完成，请尽快完成。`;
    html = `${content}网址:${this.config.user_url}.<a href="${this.config.user_url}">链接</a>`
    // } else {
    // subject = 'Questionnaire response reminder';
    // html = `Please complete the questionnaire in time:${questionnaireName}`;
    // }
    const mailOption = { from, to, subject, html };
    return await this.sendMail(mailOption);
  }

  /**
   * ----{发送未完成问卷邮件}----
   * @param {String} who 账号邮箱 
   * @param {String} language 语言类型
   * @param {String} questionnaireName 问卷名字
   * @returns {Object} 返回邮箱发送结果code
   * @author: jv
   */

  async sendProjectNotify(who, content) {
    const from = util.format('%s <%s>',
      this.config.name, this.config.mail_opts.auth.user);
    const to = who;
    let subject;
    let html;
    // if (language === 'zh') {
    subject = '您收到一份新的问卷计划，请尽快完成。';
    html = `${content}网址:${this.config.user_url}.<a href="${this.config.user_url}">链接</a>`
    // } else {
    // subject = 'Questionnaire response reminder';
    // html = `Please complete the questionnaire in time:${questionnaireName}`;
    // }
    const mailOption = { from, to, subject, html };
    return await this.sendMail(mailOption);
  }
}

