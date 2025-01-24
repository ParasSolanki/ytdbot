import { Client, GatewayIntentBits, Events } from "discord.js";

type YTVideoThumbnail = {
  url: string;
  width: number;
  height: number;
};

type YTLiveVideoSearchResponse = {
  kind: string;
  etag: string;
  nextPageToken?: string;
  regionCode: string;
  pageInfo: { totalResults: number; resultsPerPage: number };
  items: Array<{
    kind: string;
    etag: string;
    id: { kind: string; videoId: string };
    snippet: {
      channelTitle: string;
      liveBroadcastContent: "live";
      publishTime: string;

      publishedAt: string;
      channelId: string;
      title: string;
      description: string;
      thumbnails: {
        default: YTVideoThumbnail;
        medium?: YTVideoThumbnail;
        high?: YTVideoThumbnail;
      };
    };
  }>;
};

const YOUTUBE_API_BASE_URL = "https://www.googleapis.com";

const env = {
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY!,
  YOUTUBE_CHANNEL_ID: process.env.YOUTUBE_CHANNEL_ID!,
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN!,
  DISCORD_CHANNEL_ID: process.env.DISCORD_CHANNEL_ID!,
};

async function getYoutubeChannelIdFromHandle({
  handle,
  apiKey,
}: {
  handle: string;
  apiKey: string;
}) {
  console.log("Getting YT channel id from handle");
  const url = new URL("/youtube/v3/channels", YOUTUBE_API_BASE_URL);

  url.searchParams.set("part", "snippet");
  url.searchParams.set("forHandle", handle);
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Something went wrong while getting YT channel id from ${handle} handle`
      );
    }

    const json = await response.json();

    return { data: json, error: undefined };
  } catch (error) {
    console.error(
      `Something went wrong while getting YT channel id from ${handle} handle`,
      error
    );

    return { error, data: undefined };
  }
}

async function checkYoutubeChannelIsLive({
  channelId,
  apiKey,
}: {
  channelId: string;
  apiKey: string;
}) {
  console.log("Checking YT channel is live");

  const url = new URL("/youtube/v3/search", YOUTUBE_API_BASE_URL);

  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("eventType", "live");
  url.searchParams.set("type", "video");
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(
        `Something went wrong while checking YT ${channelId} channel is live `
      );
    }

    const json = (await response.json()) as YTLiveVideoSearchResponse;

    return { data: json, error: undefined };
  } catch (error) {
    console.error(
      `Something went wrong while getting YT ${channelId} channel is live`,
      error
    );

    return { error, data: undefined };
  }
}

let isLive = false;

function main() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  });

  client.on(Events.ClientReady, () => {
    console.log(`Logged in ready client`);
    let channelId = "";

    for (const guild of client.guilds.cache.values()) {
      // Iterate over all the channels in the guild
      for (const channel of guild.channels.cache.values()) {
        // Check if the channel is a text channel
        if (channel.isTextBased() && channel.isSendable()) {
          channelId = channel.id;
          break;
        }
      }
    }

    if (!channelId) {
      console.error("Channel not found");
      return;
    }

    const channel = client.channels.cache.get(channelId);

    if (!channel || !channel.isTextBased()) {
      console.error("Channel not found");
      return;
    }

    checkYoutubeChannelIsLive({
      apiKey: env.YOUTUBE_API_KEY,
      channelId: env.YOUTUBE_CHANNEL_ID,
    })
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Error", error);
          return;
        }

        if (data.items && data.items.length > 0) {
          const liveStream = data.items[0];
          if (liveStream.snippet.liveBroadcastContent === "live" && !isLive) {
            isLive = true; // Mark as live
            const message = `🎥 **${liveStream.snippet.channelTitle}** is live!\n**Title:** ${liveStream.snippet.title}\n**Watch here:** https://www.youtube.com/watch?v=${liveStream.id.videoId}`;

            // @ts-ignore
            channel.send(message);

            console.log("Message sent");
          } else if (
            liveStream.snippet.liveBroadcastContent !== "live" &&
            isLive
          ) {
            isLive = false; // Mark as not live
          }
        } else if (isLive) {
          isLive = false; // Mark as not live
        }
      })
      .catch(({ error }) => {
        console.error("Error", error);
      });
  });

  client.login(env.DISCORD_BOT_TOKEN);
}

main();
