import { readItems } from '@directus/sdk';
import type { Post, PostSummary } from '#shared/types';

export const POST_SUMMARY_FIELDS = [
  'id',
  'slug',
  'title',
  'excerpt',
  'published_at',
  'date_created',
  'date_updated',
  'tags',
  'featured',
  'author_name',
  { cover_image: ['id', 'title', 'description', 'width', 'height', 'focal_point_x', 'focal_point_y'] },
] as const;

type RawPost = Post & { date_created?: string | null };

/** Published posts whose publish date is not in the future. */
export function publishedFilter(extra: Record<string, unknown> = {}) {
  return {
    _and: [
      { status: { _eq: 'published' } },
      { _or: [{ published_at: { _null: true } }, { published_at: { _lte: '$NOW' } }] },
      extra,
    ],
  };
}

export function normalizePost<T extends RawPost>(post: T): T {
  return {
    ...post,
    published_at: post.published_at ?? post.date_created ?? null,
    tags: Array.isArray(post.tags) ? post.tags : [],
  };
}

/**
 * Directus has no filter operators for JSON fields, so tag filtering and paging happen
 * here over the (small) list of published post summaries.
 */
export async function listPosts(options: { limit: number; page?: number; tag?: string }) {
  const directus = createServerDirectus();
  const page = options.page ?? 1;

  const all = ((await directus.request(
    readItems('posts', {
      filter: publishedFilter() as never,
      sort: ['-featured', '-published_at', '-date_created'] as never,
      limit: -1,
      fields: POST_SUMMARY_FIELDS as never,
    }),
  )) as RawPost[]).map(normalizePost);

  const tags = [...new Set(all.flatMap((p) => p.tags ?? []))].sort();
  const matching = options.tag ? all.filter((p) => p.tags?.some((t) => t.toLowerCase() === options.tag)) : all;
  const slice = matching.slice((page - 1) * options.limit, page * options.limit);

  // Fetch bodies only for the visible posts, to compute reading time.
  const bodies = slice.length
    ? ((await directus.request(
        readItems('posts', { filter: { id: { _in: slice.map((p) => p.id) } } as never, fields: ['id', 'content'], limit: -1 }),
      )) as Pick<Post, 'id' | 'content'>[])
    : [];
  const minutes = new Map(bodies.map((b) => [b.id, readingMinutes(b.content)]));

  const posts: PostSummary[] = slice.map((post) => ({ ...post, reading_minutes: minutes.get(post.id) ?? 1 }));

  return { posts, total: matching.length, tags };
}
