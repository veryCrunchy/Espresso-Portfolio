import { joinURL } from 'ufo';

export default defineEventHandler((event) => {
  const site = useRuntimeConfig().public.siteUrl;
  setResponseHeader(event, 'Content-Type', 'text/plain; charset=utf-8');
  return `User-agent: *\nDisallow: /api/\n\nSitemap: ${joinURL(site, 'sitemap.xml')}\n`;
});
