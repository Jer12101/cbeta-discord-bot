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

## Disclaimer

This bot does not include any CBETA XML data. To use it, users must download the XML files directly from [CBETA](https://www.cbeta.org) under their terms of use.

CBETA XML data is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Taiwan (CC BY-NC-SA 3.0 TW)](https://creativecommons.org/licenses/by-nc-sa/3.0/tw/). This means it is free for personal and non-commercial use with proper attribution. Commercial use is prohibited without permission.

This project is intended for personal, educational, and non-commercial study only.

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

