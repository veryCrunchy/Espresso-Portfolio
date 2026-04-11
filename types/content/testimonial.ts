export interface Testimonial {
  id: number | string;
  status?: 'draft' | 'published' | 'archived' | null;
  name: string;
  subject: string;
  quote: string;
  date_created?: string | null;
}

export interface TestimonialSubmission {
  name: string;
  subject: string;
  quote: string;
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
}