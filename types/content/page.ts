
import type {
    BlockHero,
    BlockRichtext,
    BlockType,
} from '../blocks';

export interface Page {
    slug: string;
    sort?: number | null;
    status?: string;
    title?: string | null;
    color_text?: string | null;
    color_background?: string | null;
    color_primary?: string | null;
    color_accent?: string | null;
    blocks?: (string | PageBlock)[];
}

export interface PageBlock {
    collection?: BlockType | null;
    id?: string;
    item?:
    | (
        | string
        | BlockHero
        | BlockRichtext
    )[]
    | null;
    pages_id?: (string | Page) | null;
    sort?: number | null;
    hide_block?: boolean | null;
}

