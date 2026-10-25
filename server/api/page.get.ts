import { readItem, readItems } from '@directus/sdk';
import type { Page } from '#shared/types';

const IMAGE_FIELDS = ['id', 'title', 'description', 'width', 'height', 'focal_point_x', 'focal_point_y'];

const PAGE_QUERY = {
  deep: { blocks: { _sort: ['sort'] } } as never,
  fields: [
    '*',
    { seo_image: ['id'] },
    {
      blocks: [
        'id',
        'collection',
        'sort',
        {
          item: {
            block_hero: ['*', { image: IMAGE_FIELDS }],
            block_gallery: ['*', { images: [{ directus_files_id: IMAGE_FIELDS }] }],
            block_richtext: ['*'],
            block_youtube: ['*'],
            block_posts: ['*'],
            block_links: ['*'],
            block_activity: ['*'],
          },
        },
      ],
    },
  ] as never,
};

export default defineCmsHandler(async (event) => {
  const raw = getQuery(event).slug;
  const slug = '/' + (typeof raw === 'string' ? raw : '').replace(/^\/+|\/+$/g, '');
  const { version } = previewAccess(event);
  const directus = createServerDirectus();

  let pages: Page[];
  try {
    pages = (await directus.request(
      readItems('pages', { filter: { slug: { _eq: slug } }, limit: 1, ...PAGE_QUERY }),
    )) as Page[];
  } catch (error) {
    toCmsError(error, 'Unable to load the page from Directus.');
  }

  let page = pages[0];
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  }

  // Unsaved edits live in a content version until they are promoted to main.
  if (page.id && version) {
    page = await directus
      .request(readItem('pages', page.id, { version, ...PAGE_QUERY }))
      .then((versioned) => versioned as Page)
      .catch(() => page!);
  }

  return page;
});
