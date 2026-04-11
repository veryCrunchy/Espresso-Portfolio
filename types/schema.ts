import type {

    BlockRichtext,

} from './blocks';
import type { Page, Testimonial, TestimonialsPage, SiteSettings } from './content';


//Directus Schema




export interface Schema {
    pages: Page[]
    testimonials: Testimonial[]
    testimonials_page: TestimonialsPage
    site_settings: SiteSettings
}