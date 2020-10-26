import { IMailable, IMailDriver } from '../types';

/**
 * A Mail Driver that doesn't send emails to a third party.
 * Instead it holds the mailable objects in memory for testing.
 *
 * This Driver allows enables `getTestEmails()` and `resetTestEmails()`
 * for usage in your tests to make life easier.
 */
export class MemoryMailDriver implements IMailDriver {
  public sentTestEmails = [];

  async sendMail(mailable: IMailable) {
    this.sentTestEmails.push(mailable);
  }

  /**
   * ### USE FOR TESTING ONLY
   *
   * Use this method to reset in-memory emails during testing.
   */
  resetTestEmails() {
    this.sentTestEmails = [];
  }

  /**
   * ### USE FOR TESTING ONLY
   *
   * Use this property to access in-memory emails
   * during testing.
   */
  getTestEmails() {
    return this.sentTestEmails;
  }
}
