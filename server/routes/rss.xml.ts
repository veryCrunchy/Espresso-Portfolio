import { readItems, readSingleton } from '@directus/sdk';
import { joinURL } from 'ufo';
import type { Post } from '#shared/types';

export default defineCachedEventHandler(
  async (event) => {
    const { public: config } = useRuntimeConfig();
    const directus = createServerDirectus();
    const site = config.siteUrl;

    const [settings, posts] = await Promise.all([
      directus.request(readSingleton('site_settings', { fields: ['site_name', 'site_description'] })).catch(() => null),
      directus
        .request(
          readItems('posts', {
            filter: publishedFilter() as never,
            sort: ['-published_at', '-date_created'] as never,
            limit: 30,
            fields: ['slug', 'title', 'excerpt', 'content', 'published_at', 'date_created', 'tags', 'seo_description'] as never,
          }),
        )
        .then((r) => (r as Post[]).map(normalizePost))
        .catch(() => [] as Post[]),
    ]);

    const title = settings?.site_name || "Espresso's Work";
    const items = posts
      .map((post) => {
        const url = joinURL(site, 'blog', post.slug);
        const description = post.excerpt || post.seo_description || stripHtml(post.content ?? '').slice(0, 280);
        return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      ${post.published_at ? `<pubDate>${new Date(post.published_at).toUTCString()}</pubDate>` : ''}
      <description>${escapeXml(description)}</description>
${(post.tags ?? []).map((t) => `      <category>${escapeXml(t)}</category>`).join('\n')}
      <content:encoded><![CDATA[${(post.content ?? '').replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>
    </item>`;
      })
      .join('\n');

    setResponseHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8');
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(joinURL(site, 'blog'))}</link>
    <description>${escapeXml(settings?.site_description || `${title} — blog`)}</description>
    <language>en</language>
    <atom:link href="${escapeXml(joinURL(site, 'rss.xml'))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
  },
  { maxAge: 60 * 10, swr: true, name: 'rss' },
);
