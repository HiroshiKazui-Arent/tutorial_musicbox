export interface ArtistResponse {
  id: string
  name: string
  thumbnailPath: string | null
  bio: string | null
  createdAt: string
}

export interface SongResponse {
  id: string
  title: string
  artistId: string
  thumbnailPath: string | null
  audioPath: string
  duration: number | null
  createdAt: string
  artist: { id: string; name: string }
  likeCount?: number
  isLiked?: boolean
}
