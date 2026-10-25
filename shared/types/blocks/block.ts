import type { BlockGallery } from './block-gallery';
import type { BlockHero } from './block-hero';
import type { BlockRichtext } from './block-richtext';
import type { BlockLinks, BlockPosts, BlockYoutube } from './block-integrations';

export type BlockType =
    | 'block_hero'
    | 'block_gallery'
    | 'block_richtext'
    | 'block_youtube'
    | 'block_posts'
    | 'block_links'

export type Block =
    | BlockHero
    | BlockGallery
    | BlockRichtext
    | BlockYoutube
    | BlockPosts
    | BlockLinks
