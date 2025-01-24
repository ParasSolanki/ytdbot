# YTDBot

Discord bot that sends message to your server's channel when your favorite youtube channel is live.

## How it works

- The bot checks if the youtube channel is live every 3 hours
- If the channel is live, the bot sends a message to the discord channel
- If the channel is not live, the bot does nothing

## How to use

1. Create a discord bot and get the bot token from [here](https://discord.com/developers/applications)
2. Go to [Google Cloud Console](https://console.cloud.google.com/) and create a new project
3. Go to [Youtube Data API](https://console.cloud.google.com/apis/library/youtube.googleapis.com) and enable the API
4. Go to [Youtube Data API Console](https://console.cloud.google.com/apis/credentials) and create a new API key
5. Go to [Discord Developer Portal](https://discord.com/developers/applications) and add the bot to the channel
6. Add the bot token, discord channel id, youtube channel id and youtube api key to the .env file
7. Run the bot using `pnpm start`

## Installation

```bash
pnpm install
```

## Usage

```bash
pnpm start
```

## Environment variables

To run this project, you will need to add the following environment variables to your .env file.

| Name               | Description             |
| ------------------ | ----------------------- |
| DISCORD_BOT_TOKEN  | The discord bot token.  |
| DISCORD_CHANNEL_ID | The discord channel id. |
| YOUTUBE_CHANNEL_ID | The youtube channel id. |
| YOUTUBE_API_KEY    | The youtube api key.    |
