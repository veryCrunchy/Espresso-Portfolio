
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

