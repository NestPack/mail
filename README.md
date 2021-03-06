# NestPack Mail
A Mail Module for NestJs that allows for swappable Email Services.

## Installation

```bash
$ npm install @nestpack/mail
# OR
$ yarn add @nestpack/mail
```

## Usage

Import the `MailModule` and register on your root `AppModule`.

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MailModule } from '@nestpack/mail';
import { AppController } from './app.controller';

@Module({
  imports: [MailModule.forRoot()],
  controllers: [AppController]
})
export class AppModule {}
```

Drivers are used to switch between email providers. By default, `MemoryMailDriver` is used. 
This driver does not send emails to a 3rd party provider, and, instead, holds your emails in memory.

To use a different driver, register it by passing it into the driver option.


`forRoot()` will import the `MailModule` globally, meaning you don't need to import everywhere, and everything shares the same configuration. `forFeature()` can also be used to use different configurations in different modules.

In this example, `MemoryMailDriver` is used, but a different 3rd party driver would be passed in.
(If nothing is passed in `MemoryMailDriver` is used anyway.)

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { MailModule, MemoryMailDriver } from '@nestpack/mail';
import { AppController } from './app.controller';

@Module({
  imports: [MailModule.forRoot({
    driver: MemoryMailDriver
  })],
  controllers: [AppController]
})
export class AppModule {}
```

Next, create something that can be emailed by creating a new `Mailable`. This can be
a class instance, or an object so long as it implements the `IMailable` interface.

```typescript
// confirmation.mailable.ts
import { IMailable } from '@nestpack/mail';
import { User } from 'user/user.entity.ts';

export class ConfirmationMailable implements IMailable {
  constructor(public user: User){
    this.to = [user.email];
    this.from = 'default@yoursite.com'
    this.text = 'Hello world';
  }
}
```

Now that the mailable is created, inject the `MailService` somewhere in the app, and 
send the email.

```typescript
import { Injectable } from '@nestjs/common';
import { MailService } from '@nestpack/mail';
import { User } from '../user/user.entity.ts';
import { ConfirmationMailable } from '../confirmation.mailable.ts'


@Injectable()
export class YourService {
  constructor(private readonly mailService: MailService){}

  async sendConfirmationEmail(user: User){
    await this.mailService.sendMail(new ConfirmationMailable(user));

  }
}
```


### Usage with testing
By default, when `NODE_ENV` is `test` the `MemoryMailDriver` will be used. This means that within tests, 
emails aren't sent to the 3rd party services. In order to get test emails, the `MemoryMailDriver` needs to be accessed directly from the module system as show below.

```typescript
    const module = await Test.createTestingModule({
      imports: [
        MailModule.forRoot(),
      ],
    }).compile();

    const mailService = module.get(MailService);
    const mailDriver = module.get(MemoryMailDriver);


    // Email is not sent, and is stored in-memory instead.
    await service.sendMail({ to: ['test@test.com'] });

    expect(mailDriver.getTestEmails()).toMatchObject([{ to: ['test@test.com'] }]);

    mailDriver.resetTestEmails();

    expect(mailDriver.getTestEmails()).toMatchObject([]);
```

## Writing a Driver
A custom Mail Driver must be a class that implements the IMailDriver interface. The driver is
dependency injected, so the class has access to the Nest module system, including the options 
passed into `MailModule.forRoot()`.

```typescript
import { Inject, Injectable } from '@nestjs/common';
import { IMailable, IMailDriver, IMailModuleOptions } from '@nestpack/mail';

@Injectable()
export class CustomMailDriver implements IMailDriver {
  constructor(@Inject('MAIL_OPTIONS') private options: IMailModuleOptions) {}

  async sendMail(mailable: IMailable) {
    // Global 3rd party mailer options.
    this.options.driverOptions;

    // Mailable specific 3rd party mailer options.
    mailable.options;

    // Use the options above to set up your custom driver and send an email here.
  }
}

```