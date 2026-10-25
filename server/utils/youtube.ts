import type { YoutubeFeed, YoutubeVideo } from '#shared/types';

export const YOUTUBE_CHANNEL_ID = /UC[\w-]{22}/;

function tag(xml: string, name: string) {
  const match = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return match ? decodeEntities(match[1]!.trim()) : '';
}

function attr(xml: string, name: string, attribute: string) {
  const match = xml.match(new RegExp(`<${name}[^>]*\\s${attribute}="([^"]*)"`));
  return match ? decodeEntities(match[1]!) : '';
}

function decodeEntities(value: string) {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

/** Latest uploads from a channel's public RSS feed — no API key needed. Cached for 30 minutes. */
export const fetchYoutubeFeed = defineCachedFunction(
  async (channel: string): Promise<YoutubeFeed> => {
    let xml: string;
    try {
      xml = await $fetch<string>('https://www.youtube.com/feeds/videos.xml', {
        query: { channel_id: channel },
        responseType: 'text',
        timeout: 8000,
      });
    } catch {
      throw createError({ statusCode: 502, statusMessage: 'Could not reach YouTube.' });
    }

    const videos: YoutubeVideo[] = xml
      .split('<entry>')
      .slice(1)
      .map((entry) => {
        const id = tag(entry, 'yt:videoId');
        const url = attr(entry, 'link', 'href') || `https://www.youtube.com/watch?v=${id}`;
        const views = Number(attr(entry, 'media:statistics', 'views'));
        return {
          id,
          title: tag(entry, 'title'),
          published: tag(entry, 'published'),
          thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          views: Number.isFinite(views) ? views : null,
          isShort: url.includes('/shorts/'),
          url,
        };
      })
      .filter((v) => v.id);

    return {
      channelTitle: tag(xml.split('<entry>')[0] ?? '', 'title'),
      channelUrl: `https://www.youtube.com/channel/${channel}`,
      videos,
    };
  },
  { maxAge: 60 * 30, swr: true, name: 'youtube', getKey: (channel: string) => channel },
);
