import { isDirectusError, readItems } from '@directus/sdk';
import { createServerDirectus } from '../utils/directus';

export default defineEventHandler(async () => {
  const directus = createServerDirectus();

  try {
    return await directus.request(
      readItems('links', {
        filter: { status: { _eq: 'published' } },
        sort: ['sort'],
        fields: ['id', 'title', 'url', 'open_new_tab', { image: ['id', 'filename_download'] } as any],
      })
    );
  } catch (error) {
    if (isDirectusError(error)) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to load links from Directus.',
        data: error.errors,
      });
    }
    throw error;
  }
});
