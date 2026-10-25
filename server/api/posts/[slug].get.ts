import { readItems } from '@directus/sdk';
import type { Post, PostDetail } from '#shared/types';

export default defineCmsHandler(async (event): Promise<PostDetail> => {
  const slug = getRouterParam(event, 'slug');
  const directus = createServerDirectus();

  let post: (Post & { date_created?: string | null }) | undefined;
  try {
    const result = await directus.request(
      readItems('posts', {
        filter: publishedFilter({ slug: { _eq: slug } }) as never,
        limit: 1,
        fields: [...POST_SUMMARY_FIELDS, 'content', 'seo_title', 'seo_description'] as never,
      }),
    );
    post = (result as Post[])[0];
  } catch (error) {
    if (!isMissingInCms(error)) toCmsError(error, 'Unable to load the post from Directus.');
  }

  if (!post) {
    throw createError({ statusCode: 404, statusMessage: 'Post not found' });
  }

  const normalized = normalizePost(post);
  const date = normalized.published_at;

  const neighbour = (op: '_lt' | '_gt') =>
    date
      ? directus
          .request(
            readItems('posts', {
              filter: publishedFilter({ published_at: { [op]: date } }) as never,
              sort: [op === '_lt' ? '-published_at' : 'published_at'] as never,
              limit: 1,
              fields: ['slug', 'title'],
            }),
          )
          .then((r) => (r[0] as Pick<Post, 'slug' | 'title'>) ?? null)
          .catch(() => null)
      : Promise.resolve(null);

  const [prev, next] = await Promise.all([neighbour('_lt'), neighbour('_gt')]);

  return {
    post: { ...normalized, reading_minutes: readingMinutes(normalized.content) },
    prev,
    next,
  };
});
