export interface EndpointSpotifyTrack {
  is_playing: boolean
  timestamp?: number
  context?: unknown
  progress_ms?: number
  item?: Item | null
  currently_playing_type?: string
  actions?: Actions
}

export interface SpotifyTrack {
  isPlaying: boolean
  timestamp?: number
  context?: unknown
  progressMs?: number
  item?: Item | null
  currentlyPlayingType?: string
  actions?: Actions
}

export interface Actions {
  disallows?: Disallows
}

export interface Disallows {
  resuming?: boolean
  pausing?: boolean
  seeking?: boolean
  skipping_next?: boolean
  skipping_prev?: boolean
}

export interface Artist {
  name: string
  href?: string
  id?: string
  type?: string
  uri?: string
  external_urls?: ExternalUrls
}

export interface SpotifyImage {
  url: string
  height?: number | null
  width?: number | null
}

export interface Album {
  album_type?: string
  artists?: Artist[]
  external_urls?: ExternalUrls
  href?: string
  id?: string
  images: SpotifyImage[]
  name: string
  release_date?: string
  release_date_precision?: string
  total_tracks?: number
  type?: string
  uri?: string
}

export interface ExternalUrls {
  spotify: string
}

export interface Item {
  album: Album
  artists: Artist[]
  disc_number?: number
  duration_ms: number
  explicit?: boolean
  external_urls: ExternalUrls
  href?: string
  id?: string
  is_local?: boolean
  name: string
  preview_url?: string | null
  track_number?: number
  type?: string
  uri?: string
}
