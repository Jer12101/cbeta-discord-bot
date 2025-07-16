# CBETA Discord Bot

A NestJS-powered Discord bot for serving quotations from the CBETA (Chinese Buddhist Electronic Text Association).

---

## Features

- Parses CBETA TEI-XML into a local SQLite database
- Responds to Discord slash commands with random quotes
- Skips editorial and index files
- Owner error notifications via Discord DM
- Built with [NestJS](https://nestjs.com/)

---

## Prerequisites

- Node.js 18+
- Discord bot token
- CBETA XML files

---

## Installation

Clone the repository and install dependencies:

    git clone https://github.com/Jer12101/cbeta-discord-bot.git
    cd cbeta-discord-bot
    npm install

---

## Configuration

Create a `.env` file in the project root:

    DISCORD_TOKEN=your_bot_token
    OWNER_ID=your_discord_user_id

---

## Prepare the Database

Place CBETA XML files in a `/data` subdirectory and parse them:

    npm run parse

This generates a local SQLite database (`cbeta.db`) with parsed sutra quotes.

> Note: The database and journal files are excluded via `.gitignore`.

---

## Running the Bot

**Development mode (hot-reloading):**

    npm run start:dev

**Production mode:**

    npm run start

---

## Deployment

You can deploy to your server (e.g. Linode) by:

- Cloning the repo
- Running `npm install`
- Building the database locally (once)
- Using a process manager like PM2:

    pm2 start dist/main.js --name cbeta-discord-bot

---

## License

MIT License © 2025 Che-Wei Hsieh

