import { readItems } from '@directus/sdk';

export default defineCmsHandler(async () => {
  const directus = createServerDirectus();

  try {
    return await directus.request(
      readItems('testimonials', {
        fields: ['id', 'name', 'subject', 'quote', 'date_created', 'image', 'image_url'],
        filter: { status: { _eq: 'published' } },
        sort: ['sort', '-date_created'],
        limit: -1,
      }),
    );
  } catch (error) {
    toCmsError(
      error,
      'Unable to load testimonials from Directus. Confirm the testimonials collection exists and published items are readable.',
    );
  }
});
