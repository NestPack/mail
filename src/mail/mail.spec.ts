import { Injectable, Module } from '@nestjs/common';
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
      id: number;
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
      id: number;
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

  describe('forRoot', () => {
    it('should import the same service as parent module', async () => {
      @Injectable()
      class ParentService {
        constructor(public mailService: MailService) {}
      }
      @Injectable()
      class ChildService {
        constructor(public mailService: MailService) {}
      }
      @Module({
        providers: [ChildService],
      })
      class ChildModule {}

      const module = await Test.createTestingModule({
        imports: [MailModule.forRoot(), ChildModule],
        providers: [ParentService],
      }).compile();

      const childService = module.get(ChildService);
      const parentService = module.get(ParentService);

      expect(childService.mailService).toBe(parentService.mailService);
    });
    it('should import the same service as sibling module', async () => {
      @Injectable()
      class SiblingService {
        constructor(public mailService: MailService) {}
      }
      @Injectable()
      class ChildService {
        constructor(public mailService: MailService) {}
      }
      @Module({
        providers: [ChildService],
      })
      class ChildModule {}

      @Module({
        providers: [SiblingService],
      })
      class SiblingModule {}

      const module = await Test.createTestingModule({
        imports: [MailModule.forRoot(), ChildModule, SiblingModule],
      }).compile();

      const childService = module.get(ChildService);
      const parentService = module.get(SiblingService);

      expect(childService.mailService).toBe(parentService.mailService);
    });
  });

  describe('forFeature', () => {
    it('should not be global', async () => {
      @Injectable()
      class ParentService {
        constructor(public mailService: MailService) {}
      }
      @Injectable()
      class ChildService {
        constructor(public mailService: MailService) {}
      }
      @Module({
        imports: [MailModule.forFeature()],
        providers: [ChildService],
      })
      class ChildModule {}

      const module = await Test.createTestingModule({
        imports: [MailModule.forFeature(), ChildModule],
        providers: [ParentService],
      }).compile();

      const childService = module.get(ChildService);
      const parentService = module.get(ParentService);

      expect(childService.mailService).not.toBe(parentService.mailService);
    });
    it('should export mailService, driver, and options', async () => {
      @Injectable()
      class ChildService {
        constructor(public mailService: MailService) {}
      }
      @Module({
        imports: [MailModule.forFeature()],
        providers: [ChildService, MailService],
        exports: [ChildService, MailService],
      })
      class ChildModule {}

      @Injectable()
      class ParentService {
        constructor(public mailService: MailService) {}
      }

      @Module({
        imports: [ChildModule],
        providers: [ParentService],
      })
      class ParentModule {}

      const module = await Test.createTestingModule({
        imports: [ParentModule],
      }).compile();

      const childService = module.get(ChildService);
      const parentService = module.get(ParentService);

      expect(childService.mailService).toBe(parentService.mailService);
    });
    it('should not share exports across siblings', async () => {
      @Injectable()
      class SiblingService {
        constructor(public mailService: MailService) {}
      }
      @Injectable()
      class ChildService {
        constructor(public mailService: MailService) {}
      }
      @Module({
        imports: [MailModule.forFeature()],
        providers: [ChildService],
      })
      class ChildModule {}

      @Module({
        imports: [MailModule.forFeature()],
        providers: [SiblingService],
      })
      class SiblingModule {}

      const module = await Test.createTestingModule({
        imports: [ChildModule, SiblingModule],
      }).compile();

      const childService = module.get(ChildService);
      const siblingService = module.get(SiblingService);

      expect(childService.mailService).not.toBe(siblingService.mailService);
      // Stil uses same driver if same
      expect(childService.mailService.driver).toBe(
        siblingService.mailService.driver,
      );
    });

    it('should allow different drivers for siblings', async () => {
      class RuntimeMailDriver implements IMailDriver {
        id: number;
        async sendMail(mailable) {
          return mailable;
        }
      }
      @Injectable()
      class SiblingService {
        constructor(public mailService: MailService) {}
      }
      @Injectable()
      class ChildService {
        constructor(public mailService: MailService) {}
      }
      @Module({
        imports: [
          MailModule.forFeature({
            driver: RuntimeMailDriver,
            useMemoryIfTest: false,
          }),
        ],
        providers: [ChildService],
      })
      class ChildModule {}

      @Module({
        imports: [MailModule.forFeature()],
        providers: [SiblingService],
      })
      class SiblingModule {}

      const module = await Test.createTestingModule({
        imports: [ChildModule, SiblingModule],
      }).compile();

      const childService = module.get(ChildService);
      const siblingService = module.get(SiblingService);

      expect(childService.mailService.driver).not.toBe(
        siblingService.mailService.driver,
      );
    });
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
