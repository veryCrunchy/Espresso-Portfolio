import type { BlockGallery } from './block-gallery';
import type { BlockHero } from './block-hero';
import type { BlockRichtext } from './block-richtext';


export type BlockType =
    | 'block_hero'
    | 'block_gallery'
    | 'block_richtext'


export type Block =
    | BlockHero
    | BlockGallery
    | BlockRichtext
