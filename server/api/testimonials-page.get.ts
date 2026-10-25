import { readSingleton } from '@directus/sdk';

export default defineCmsHandler(async () => {
  const directus = createServerDirectus();

  try {
    return await directus.request(readSingleton('testimonials_page', { fields: ['*'] }));
  } catch (error) {
    toCmsError(error, 'Unable to load testimonials page content from Directus.');
  }
});
