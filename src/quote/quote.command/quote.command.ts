import { Context, SlashCommand, SlashCommandContext } from "necord";
import { Injectable } from "@nestjs/common";
import { QuoteService } from "../quote.service";
import { Quote } from "../quote.service";
import { ErrorNotifierService } from "src/notification/error-notifier/error-notifier.service";

@Injectable()
export class QuoteCommand {
    constructor(
        private readonly quoteService: QuoteService,
        private readonly errorNotifier: ErrorNotifierService,
    ) {}

    @SlashCommand({
        name: '阿彌陀佛',
        description: '取得隨機佛經引用',
    })
    async onQuoteCommand(
        @Context() [interaction]: SlashCommandContext
    ) {
        try {
            const quote: Quote | undefined = this.quoteService.getRandomQuote();

            if (!quote) {
                await interaction.reply('找不到任何經文，請先匯入資料庫！');
                return;
            }
            const embedDescription = `「${quote.text}」`;

            // Discord embed description max length check
            if (embedDescription.length > 4096) {
                throw new Error(`Embed description too long (${embedDescription.length} characters) for ${quote.sutra_name} - ${quote.chapter}`);
            }

            await interaction.reply({
                embeds: [{
                    title: `${quote.sutra_name} - ${quote.chapter}`,
                    description: embedDescription,
                }]
            });
        } catch (err) {
            console.error('❌ Error in onQuoteCommand:', err);

            // Tell the user in the interaction
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp('⚠️ 發生錯誤，已通知管理員。');
            } else {
                await interaction.reply('⚠️ 發生錯誤，已通知管理員。');
            }

            await this.errorNotifier.notifyOwnerAboutError(
                err instanceof Error ? err : new Error(String(err)),
                '/quote command failed',
                interaction.user.id,
                interaction.guildId ?? undefined
            );
        }
    }
        
}

// The bot respons with an embed