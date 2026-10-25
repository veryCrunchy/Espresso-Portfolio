import { readItems } from '@directus/sdk';
import type { Page } from '#shared/types';

const IMAGE_FIELDS = ['id', 'title', 'description', 'width', 'height', 'focal_point_x', 'focal_point_y'];

export default defineCmsHandler(async (event) => {
  const raw = getQuery(event).slug;
  const slug = '/' + (typeof raw === 'string' ? raw : '').replace(/^\/+|\/+$/g, '');
  const directus = createServerDirectus();

  let pages: Page[];
  try {
    pages = (await directus.request(
      readItems('pages', {
        filter: { slug: { _eq: slug } },
        limit: 1,
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
                },
              },
            ],
          },
        ] as never,
      }),
    )) as Page[];
  } catch (error) {
    toCmsError(error, 'Unable to load the page from Directus.');
  }

  const page = pages[0];
  if (!page) {
    throw createError({ statusCode: 404, statusMessage: 'Page not found' });
  }
  return page;
});
