import type { File } from '../system';
import type { DesignSettings } from './design';

export interface Post extends DesignSettings {
  id: string;
  status?: 'published' | 'draft' | 'archived';
  slug: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image?: string | File | null;
  published_at?: string | null;
  date_updated?: string | null;
  tags?: string[] | null;
  author_name?: string | null;
  featured?: boolean | null;
  seo_title?: string | null;
  seo_description?: string | null;
  /** Computed server-side from content. */
  reading_minutes?: number;
}

export type PostSummary = Omit<Post, 'content'>;

export interface PostList {
  posts: PostSummary[];
  total: number;
  page: number;
  pageCount: number;
  tags: string[];
  tagCounts: Record<string, number>;
  /** Published posts across all tags. */
  totalAll: number;
}

export interface PostDetail {
  post: Post;
  prev: Pick<Post, 'slug' | 'title'> | null;
  next: Pick<Post, 'slug' | 'title'> | null;
}

export interface BlogPage {
  id?: number;
  eyebrow?: string | null;
  headline?: string | null;
  description?: string | null;
  posts_per_page?: number | null;
}
