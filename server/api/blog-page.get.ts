import { readSingleton } from '@directus/sdk';
import type { BlogPage } from '#shared/types';

const FALLBACK: BlogPage = {
  eyebrow: 'Journal',
  headline: 'The <em>Blog</em>',
  description: null,
  posts_per_page: 9,
};

export default defineCmsHandler(async (): Promise<BlogPage> => {
  const directus = createServerDirectus();

  try {
    const page = await directus.request(readSingleton('blog_page', { fields: ['*'] }));
    return { ...FALLBACK, ...page };
  } catch (error) {
    if (isMissingInCms(error)) return FALLBACK;
    toCmsError(error, 'Unable to load blog page content from Directus.');
  }
});
