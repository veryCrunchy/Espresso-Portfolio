import { isDirectusError, readSingleton } from '@directus/sdk';
import { createServerDirectus } from '../utils/directus';

export default defineEventHandler(async () => {
  const directus = createServerDirectus();

  try {
    return await directus.request(
      readSingleton('site_settings', {
        fields: ['*'],
      })
    );
  } catch (error) {
    if (isDirectusError(error)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to load site settings from Directus.',
        data: error.errors,
      });
    }

    throw error;
  }
});
