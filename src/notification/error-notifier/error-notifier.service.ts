import { Injectable, Logger } from '@nestjs/common';
import { Client, User } from 'discord.js';

@Injectable()
export class ErrorNotifierService {
    private readonly logger = new Logger(ErrorNotifierService.name);

    constructor(private readonly client: Client) {}

    async notifyOwnerAboutError(err: Error, context: string, interactionUserId?: string, guildId?: string) {
        try {
        const ownerId = 'YOUR_DISCORD_USER_ID'; // your real Discord user ID
        const owner: User = await this.client.users.fetch(ownerId);

        const message = [
            `⚠️ **Bot Error Report**`,
            `**Context**: ${context}`,
            interactionUserId ? `**User ID**: ${interactionUserId}` : null,
            guildId ? `**Guild ID**: ${guildId}` : null,
            `**Error**: ${err.name}: ${err.message}`,
        ].filter(Boolean).join('\n');

        await owner.send(message.slice(0, 2000));
        this.logger.log(`Notified owner about error`);
        } catch (notifyErr) {
        this.logger.error('Failed to notify owner about error', notifyErr);
        }
    }
}

