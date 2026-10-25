export default defineEventHandler((event) => {
  const channel = getRouterParam(event, 'channel') ?? '';
  if (!new RegExp(`^${YOUTUBE_CHANNEL_ID.source}$`).test(channel)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid YouTube channel id.' });
  }
  return fetchYoutubeFeed(channel);
});
