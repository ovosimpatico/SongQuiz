export interface Contributor {
  id: number;
  name: string;
  role: string;
}

export interface Song {
  SongId: number;
  Name: string;
  Artists: string;
  Color: string;
  DarkColor: string;
  SongMetaId: number | null;
  SpotifyId: string | null;
  DeezerID: number | null;
  DeezerURL: string | null;
  CoverSmall: string | null;
  CoverMedium: string | null;
  CoverBig: string | null;
  CoverXL: string | null;
  ISRC: string | null;
  BPM: number | null;
  Duration: number | null;
  ReleaseDate: string | null;
  AlbumName: string | null;
  Explicit: boolean | null;
  Rank: number | null;
  Tags: string[] | null;
  Contributors: Contributor[] | null;
  AlbumGenres: string[] | null;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  genres?: string[];
  start_year?: number;
  end_year?: number;
  cover_image?: string;
}