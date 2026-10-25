export interface Testimonial {
  id: number | string;
  status?: 'draft' | 'published' | 'archived' | null;
  sort?: number | null;
  name: string;
  subject: string;
  quote: string;
  date_created?: string | null;
  image?: string | null;
  image_url?: string | null;
}

export interface TestimonialSubmission {
  name: string;
  subject: string;
  quote: string;
  image_url?: string;
  /** Honeypot — real visitors never fill this in. */
  website?: string;
}

export interface TestimonialsPage {
  id: number;
  eyebrow: string;
  headline: string;
  description: string;
  form_eyebrow: string;
  form_headline: string;
  form_description: string;
  success_message: string;
  empty_state: string;
  placeholder_name: string | null;
  placeholder_subject: string | null;
  placeholder_quote: string | null;
}