import { DynamicModule, Module, Scope } from '@nestjs/common';
import { MemoryMailDriver } from './drivers/memory-mail.driver';
import { MailService } from './mail.service';
import { IMailModuleOptions } from './types';

/**
 * ### MailModule
 *
 * Provides a unified interface for sending emails.
 */
@Module({})
export class MailModule {
  static forRoot(options: IMailModuleOptions = {}): DynamicModule {
    const nodeEnv = process.env.NODE_ENV;
    const useMemoryIfTest = options.useMemoryIfTest ?? true;
    const selectedDriver =
      nodeEnv === 'test' && useMemoryIfTest
        ? MemoryMailDriver
        : options.driver ?? MemoryMailDriver;

    return {
      module: MailModule,
      global: true,
      providers: [
        {
          provide: 'MAIL_OPTIONS',
          useValue: options,
        },
        {
          provide: 'MAIL_DRIVER',
          useClass: selectedDriver,
        },
        // Allow direct access to the DI injected driver class
        { useExisting: 'MAIL_DRIVER', provide: selectedDriver },
        MailService,
      ],
      exports: [MailService],
    };
  }

  static forFeature(options: IMailModuleOptions = {}): DynamicModule {
    const nodeEnv = process.env.NODE_ENV;
    const useMemoryIfTest = options.useMemoryIfTest ?? true;
    const selectedDriver =
      nodeEnv === 'test' && useMemoryIfTest
        ? MemoryMailDriver
        : options.driver ?? MemoryMailDriver;

    return {
      module: MailModule,
      global: false,
      providers: [
        {
          provide: 'MAIL_OPTIONS',
          useValue: options,
        },
        {
          provide: 'MAIL_DRIVER',
          useClass: selectedDriver,
        },
        // Allow direct access to the DI injected driver class
        { useExisting: 'MAIL_DRIVER', provide: selectedDriver },
        {
          provide: MailService,
          useClass: MailService,
          scope: Scope.TRANSIENT,
        },
      ],
      exports: ['MAIL_OPTIONS', 'MAIL_DRIVER', selectedDriver, MailService],
    };
  }
}
