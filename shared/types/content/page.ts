import type { Block, BlockType } from '../blocks';
import type { File } from '../system';
import type { DesignSettings } from './design';

export interface Page extends DesignSettings {
    id?: string;
    slug: string;
    sort?: number | null;
    status?: string;
    title?: string | null;
    seo_description?: string | null;
    seo_image?: string | File | null;
    blocks?: PageBlock[];
}

export interface PageBlock {
    id?: string | number;
    collection?: BlockType | null;
    item?: Block | null;
    pages_id?: string | Page | null;
    sort?: number | null;
    hide_block?: boolean | null;
}
