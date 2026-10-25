import { readItem, readItems } from '@directus/sdk';
import type { Post, PostDetail } from '#shared/types';

const FIELDS = [...POST_SUMMARY_FIELDS, ...DESIGN_FIELDS, 'status', 'content', 'seo_title', 'seo_description'];

export default defineCmsHandler(async (event): Promise<PostDetail> => {
  const slug = getRouterParam(event, 'slug');
  const access = previewAccess(event);
  const directus = createServerDirectus();

  let post: (Post & { date_created?: string | null }) | undefined;
  try {
    const result = await directus.request(
      readItems('posts', {
        // Previews with the secret may also see drafts and scheduled posts.
        filter: (access.drafts
          ? { slug: { _eq: slug }, status: { _neq: 'archived' } }
          : publishedFilter({ slug: { _eq: slug } })) as never,
        limit: 1,
        fields: FIELDS as never,
      }),
    );
    post = (result as Post[])[0];

    // Unsaved edits live in a content version until they are promoted to main.
    if (post && access.version) {
      const main = post;
      post = await directus
        .request(readItem('posts', post.id, { version: access.version, fields: FIELDS as never }))
        .then((versioned) => versioned as Post)
        .catch(() => main);
    }
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
