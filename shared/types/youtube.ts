export interface YoutubeVideo {
  id: string
  title: string
  published: string
  thumbnail: string
  views: number | null
  isShort: boolean
  url: string
}

export interface YoutubeFeed {
  channelTitle: string
  channelUrl: string
  videos: YoutubeVideo[]
}

export interface ActivityItem {
  id: string
  source: 'youtube' | 'blog'
  title: string
  /** Absolute URL for videos, site path for posts. */
  url: string
  date: string
  /** Thumbnail URL (videos) or Directus file id (posts). */
  image: string | null
  meta: string | null
  isShort?: boolean
}
