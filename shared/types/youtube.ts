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
