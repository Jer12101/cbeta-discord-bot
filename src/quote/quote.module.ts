import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { SqliteProvider } from './sqlite/sqlite';
import { QuoteCommand } from './quote.command/quote.command';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [NotificationModule],
  providers: [QuoteService, SqliteProvider, QuoteCommand],
})
export class QuoteModule {}
