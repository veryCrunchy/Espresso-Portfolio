import {
    authentication,
    createDirectus,
    createItem,
    createItems,
    customEndpoint,
    deleteItem,
    deleteItems,
    graphql,
    isDirectusError,
    readItem,
    readItems,
    realtime,
    rest,
    updateItem,
    updateItems,
} from '@directus/sdk';
import type { Schema } from '~/types/schema';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const client = createDirectus<Schema>(config.public.directusUrl)
        .with(authentication('json', { credentials: 'include' }))
        .with(graphql({ credentials: 'include' }))
        .with(rest({ credentials: 'include' }));

    const directus = import.meta.client ? client.with(realtime()) : client;

    return {
        provide: {
            directus,
            readItem,
            readItems,
            createItem,
            createItems,
            updateItem,
            updateItems,
            deleteItem,
            deleteItems,
            customEndpoint,
            isDirectusError,
        },
    };
});