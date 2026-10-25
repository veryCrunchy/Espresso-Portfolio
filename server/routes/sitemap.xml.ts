import { readItems } from '@directus/sdk';
import { joinURL } from 'ufo';
import type { Page, Post } from '#shared/types';

export default defineCachedEventHandler(
  async (event) => {
    const site = useRuntimeConfig().public.siteUrl;
    const directus = createServerDirectus();

    const [pages, posts] = await Promise.all([
      directus.request(readItems('pages', { fields: ['slug'], limit: -1 })).catch(() => [] as Pick<Page, 'slug'>[]),
      directus
        .request(
          readItems('posts', {
            filter: publishedFilter() as never,
            fields: ['slug', 'date_updated', 'published_at', 'date_created'] as never,
            limit: -1,
          }),
        )
        .catch(() => [] as Post[]),
    ]);

    const entries: { loc: string; lastmod?: string | null }[] = [
      ...pages.map((p) => ({ loc: joinURL(site, p.slug ?? '/') })),
      { loc: joinURL(site, 'blog') },
      { loc: joinURL(site, 'links') },
      { loc: joinURL(site, 'testimonials') },
      ...(posts as (Post & { date_created?: string })[]).map((p) => ({
        loc: joinURL(site, 'blog', p.slug),
        lastmod: p.date_updated ?? p.published_at ?? p.date_created,
      })),
    ];

    const unique = [...new Map(entries.map((e) => [e.loc, e])).values()];

    setResponseHeader(event, 'Content-Type', 'application/xml; charset=utf-8');
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique
  .map(
    (e) =>
      `  <url><loc>${escapeXml(e.loc)}</loc>${e.lastmod ? `<lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : ''}</url>`,
  )
  .join('\n')}
</urlset>`;
  },
  { maxAge: 60 * 10, swr: true, name: 'sitemap' },
);
