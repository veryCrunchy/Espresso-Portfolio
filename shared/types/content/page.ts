import type { Block, BlockType } from '../blocks';
import type { File } from '../system';

export interface Page {
    id?: string;
    slug: string;
    sort?: number | null;
    status?: string;
    title?: string | null;
    seo_description?: string | null;
    seo_image?: string | File | null;
    color_text?: string | null;
    color_background?: string | null;
    color_primary?: string | null;
    color_secondary?: string | null;
    color_accent?: string | null;
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
