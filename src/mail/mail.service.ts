import { Inject, Injectable } from '@nestjs/common';
import { IMailable, IMailDriver } from './types';

@Injectable()
export class MailService {
  constructor(@Inject('MAIL_DRIVER') public driver: IMailDriver) {}

  sendMail(mailable: IMailable) {
    return this.driver.sendMail(mailable);
  }
}
