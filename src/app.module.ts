import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NecordModule } from 'necord';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { QuoteModule } from './quote/quote.module';
import { SqliteProvider } from './quote/sqlite/sqlite';
import { NotificationModule } from './notification/notification.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NecordModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => { // () => ({...}) is only for single-line object return!
        /* () => {
          const ...
          if (...) ...
          return {...} 
        } is the arrow "block" */
        const token = config.get<string>('DISCORD_TOKEN');
        // const guildId = config.get<string>('DISCORD_GUILD_ID');

        if (!token) {
          throw new Error('Discord_TOKEN is missing in .env');
        }

        /*if (!guildId) {
          throw new Error('DISCORD_GUILD_ID is missing in .env');
        }*/

        return {
          token,
          intents: ['Guilds', 'GuildMessages'],
          // development: [guildId],
        };
        
      },
    }),
    QuoteModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService, SqliteProvider],
})
export class AppModule {}
