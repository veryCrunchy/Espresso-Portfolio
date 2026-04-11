import { isDirectusError, readSingleton } from '@directus/sdk';
import { createServerDirectus } from '../utils/directus';

export default defineEventHandler(async () => {
  const directus = createServerDirectus();

  try {
    return await directus.request(
      readSingleton('links_page', { fields: ['*'] })
    );
  } catch (error) {
    if (isDirectusError(error)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to load links page content from Directus.',
        data: error.errors,
      });
    }
    throw error;
  }
});
