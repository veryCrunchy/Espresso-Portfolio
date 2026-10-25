import type { BlockActivity, BlockGallery, BlockHero, BlockLinks, BlockPosts, BlockRichtext, BlockYoutube } from './blocks';
import type { BlogPage, Link, LinksPage, Page, Post, SiteSettings, Testimonial, TestimonialsPage } from './content';
import type { File } from './system';

// Directus schema
export interface Schema {
    pages: Page[]
    posts: Post[]
    blog_page: BlogPage
    testimonials: Testimonial[]
    testimonials_page: TestimonialsPage
    site_settings: SiteSettings
    links: Link[]
    links_page: LinksPage
    block_hero: BlockHero[]
    block_gallery: BlockGallery[]
    block_richtext: BlockRichtext[]
    block_youtube: BlockYoutube[]
    block_posts: BlockPosts[]
    block_links: BlockLinks[]
    block_activity: BlockActivity[]
    directus_files: File[]
}
