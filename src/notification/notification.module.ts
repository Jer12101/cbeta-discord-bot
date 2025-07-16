import { Module } from '@nestjs/common';
import { ErrorNotifierService } from './error-notifier/error-notifier.service';

@Module({
  providers: [ErrorNotifierService],
  exports: [ErrorNotifierService],
})
export class NotificationModule {}
