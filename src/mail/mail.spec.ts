import { Test } from '@nestjs/testing';
import { MemoryMailDriver } from './drivers/memory-mail.driver';
import { MailModule } from './mail.module';
import { MailService } from './mail.service';
import { IMailDriver } from './types';

describe('MailModule', () => {
  it('should instantiate', async () => {
    const module = await Test.createTestingModule({
      imports: [MailModule.forRoot()],
    }).compile();

    const service = module.get(MailService);
    expect(service).toBeInstanceOf(MailService);
  });

  it('should default to MemoryMailDriver', async () => {
    const module = await Test.createTestingModule({
      imports: [
        MailModule.forRoot({
          useMemoryIfTest: false,
        }),
      ],
    }).compile();

    const driver = module.get('MAIL_DRIVER');
    expect(driver).toBeInstanceOf(MemoryMailDriver);
  });

  it('should replace current mail driver if test', async () => {
    class RuntimeMailDriver implements IMailDriver {
      async sendMail(mailable) {
        return mailable;
      }
    }

    const module = await Test.createTestingModule({
      imports: [
        MailModule.forRoot({
          driver: RuntimeMailDriver,
          useMemoryIfTest: true,
        }),
      ],
    }).compile();

    const driver = module.get('MAIL_DRIVER');
    expect(driver).toBeInstanceOf(MemoryMailDriver);
  });

  it('should not current mail driver if test if useMemoryIfTest false', async () => {
    class RuntimeMailDriver implements IMailDriver {
      async sendMail(mailable) {
        return mailable;
      }
    }

    const module = await Test.createTestingModule({
      imports: [
        MailModule.forRoot({
          driver: RuntimeMailDriver,
          useMemoryIfTest: false,
        }),
      ],
    }).compile();

    const driver = module.get('MAIL_DRIVER');
    expect(driver).toBeInstanceOf(RuntimeMailDriver);
  });
});

describe('MemoryMailDriver', () => {
  it('should be able to fake send and receive mailables', async () => {
    const module = await Test.createTestingModule({
      imports: [
        MailModule.forRoot({
          driver: MemoryMailDriver,
        }),
      ],
    }).compile();

    const mailService = module.get(MailService);
    const mailDriver = module.get(MemoryMailDriver);
    await mailService.sendMail({ to: ['test@test.com'] });
    expect(mailDriver.getTestEmails()).toMatchObject([
      { to: ['test@test.com'] },
    ]);
    mailDriver.resetTestEmails();
    expect(mailDriver.getTestEmails()).toMatchObject([]);
  });
});
