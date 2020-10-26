import { Inject, Injectable } from '@nestjs/common';
import { IMailable, IMailDriver } from './types';

@Injectable()
export class MailService {
  constructor(@Inject('MAIL_DRIVER') private driver: IMailDriver) {}

  sendMail(mailable: IMailable) {
    return this.driver.sendMail(mailable);
  }

  resetTestEmails() {
    this.driver.resetTestEmails();
  }
  /**
   * ### USE FOR TESTING ONLY
   *
   * Use this method to access in-memory emails
   * during testing.
   */
  getTestEmails() {
    return this.driver.getTestEmails();
  }
}
