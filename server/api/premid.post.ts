import type { PreMIDPayload } from '#shared/types/premid';

export default defineEventHandler(async (event) => {
  const { premidSecret } = useRuntimeConfig();

  if (premidSecret) {
    const header = getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '');
    const token = header || getQuery(event).token;
    if (token !== premidSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized.' });
    }
  }

  const body = await readBody<PreMIDPayload>(event);

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload.' });
  }

  setPreMIDActivity(body.active_activity ?? null);

  return { ok: true };
});
