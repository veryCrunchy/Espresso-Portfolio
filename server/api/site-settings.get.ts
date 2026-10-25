import { readSingleton } from '@directus/sdk';

export default defineCmsHandler(async () => {
  const directus = createServerDirectus();

  try {
    return await directus.request(readSingleton('site_settings', { fields: ['*'] }));
  } catch (error) {
    toCmsError(error, 'Unable to load site settings from Directus.');
  }
});
