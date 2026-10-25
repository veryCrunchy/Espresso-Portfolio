import type { PostList } from '#shared/types';

export default defineCmsHandler(async (event): Promise<PostList> => {
  const query = getQuery(event);
  const limit = Math.min(Math.max(Number(query.limit) || 9, 1), 50);
  const page = Math.max(Number(query.page) || 1, 1);
  const tag = typeof query.tag === 'string' && query.tag ? query.tag.toLowerCase().slice(0, 50) : undefined;

  try {
    const { posts, total, tags } = await listPosts({ limit, page, tag });
    return { posts, total, tags, page, pageCount: Math.max(1, Math.ceil(total / limit)) };
  } catch (error) {
    // Before the blog collection exists the blog simply looks empty.
    if (isMissingInCms(error)) return { posts: [], total: 0, tags: [], page: 1, pageCount: 1 };
    toCmsError(error, 'Unable to load blog posts from Directus.');
  }
});
