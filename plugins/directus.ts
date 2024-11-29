import { createDirectus, rest, readItem, readItems } from '@directus/sdk';
import type { Schema } from '~/types/schema';



export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const directus = createDirectus<Schema>(config.public.directusUrl).with(rest());
    return { provide: { directus, readItem, readItems } }
})