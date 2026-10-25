export interface BlockYoutube {
    id?: string;
    title?: string | null;
    headline?: string | null;
    /** Channel id (UC…) or any youtube.com/channel/UC… URL. */
    channel?: string | null;
    limit?: number | null;
    include_shorts?: boolean | null;
}

export interface BlockPosts {
    id?: string;
    title?: string | null;
    headline?: string | null;
    limit?: number | null;
}

export interface BlockLinks {
    id?: string;
    title?: string | null;
    headline?: string | null;
}
