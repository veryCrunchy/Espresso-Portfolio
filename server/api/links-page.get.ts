import { readSingleton } from '@directus/sdk';

export default defineCmsHandler(async () => {
  const directus = createServerDirectus();

  try {
    return await directus.request(readSingleton('links_page', { fields: ['*'] }));
  } catch (error) {
    toCmsError(error, 'Unable to load links page content from Directus.');
  }
});
