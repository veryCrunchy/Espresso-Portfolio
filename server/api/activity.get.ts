import type { ActivityItem } from '#shared/types';

/**
 * One feed of recent things Espresso made: YouTube uploads and blog posts, newest first.
 * A failing source is skipped rather than failing the whole feed.
 */
export default defineCmsHandler(async (event): Promise<ActivityItem[]> => {
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 6, 1), 24);
  const channel = typeof query.channel === 'string' ? query.channel.match(YOUTUBE_CHANNEL_ID)?.[0] : undefined;
  const includePosts = query.posts !== '0';

  const [videos, posts] = await Promise.all([
    channel
      ? fetchYoutubeFeed(channel).then(
          (feed): ActivityItem[] =>
            feed.videos.map((v) => ({
              id: `yt-${v.id}`,
              source: 'youtube',
              title: v.title,
              url: v.url,
              date: v.published,
              image: v.thumbnail,
              meta: v.views !== null ? `${v.views.toLocaleString('en-US')} views` : null,
              isShort: v.isShort,
            })),
          () => [],
        )
      : [],
    includePosts
      ? listPosts({ limit }).then(
          ({ posts }): ActivityItem[] =>
            posts.map((p) => ({
              id: `post-${p.id}`,
              source: 'blog',
              title: p.title,
              url: `/blog/${p.slug}`,
              date: p.published_at ?? '',
              image: typeof p.cover_image === 'object' && p.cover_image ? p.cover_image.id : null,
              meta: p.reading_minutes ? `${p.reading_minutes} min read` : null,
            })),
          () => [],
        )
      : [],
  ]);

  return [...videos, ...posts]
    .filter((item) => item.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}, 300);
