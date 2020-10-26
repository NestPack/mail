export type UninitializedClass<T> = new (...args: any[]) => T;

export interface IMailable {
  to: string[];
  from?: string;
  cc?: string[];
  bcc?: string[];
  ReplyTo?: string[];
  subject?: string;
  text?: string;
  html?: string;
  attachment?: string | Buffer | NodeJS.ReadWriteStream;
  /**
   * Custom email options for the driver.
   */
  options?: {
    [key: string]: any;
  };
}

/**
 * A swappapble driver for the MailModule.
 */
export interface IMailDriver {
  /**
   * Send an email.
   */
  sendMail(mailable: IMailable): Promise<any>;
  /**
   * ### USE FOR TESTING ONLY
   *
   * Use this method to reset in-memory emails during testing.
   */
  resetTestEmails?(): void;
  /**
   * ### USE FOR TESTING ONLY
   *
   * Use this property to access in-memory emails
   * during testing.
   */
  getTestEmails?(): IMailable[];
}

export interface IMailModuleOptions {
  /**
   * A driver to handle how to send mail.
   *
   * Requires passing in an uninitialized class.
   */
  driver?: UninitializedClass<IMailDriver>;
  /**
   * Use MemoryMailDriver if `NODE_ENV` is `test`.
   *
   * This will automatically replace the current driver
   * with MemoryMailDriver for testing.
   *
   * Default: `true`
   */
  useMemoryIfTest?: boolean;
  /**
   * Driver specific options
   */
  driverOptions?: {
    [key: string]: any;
  };
}
