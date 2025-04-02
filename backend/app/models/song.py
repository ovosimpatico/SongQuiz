from typing import Any, Dict, List, Optional, Tuple

from pydantic import BaseModel


class Contributor(BaseModel):
    id: int
    name: str
    role: str


class Song(BaseModel):
    SongId: int
    Name: str
    Artists: str
    Color: str
    DarkColor: str
    SongMetaId: Optional[Any] = None
    SpotifyId: Optional[str] = None
    DeezerID: Optional[int] = None
    DeezerURL: Optional[str] = None
    CoverSmall: Optional[str] = None
    CoverMedium: Optional[str] = None
    CoverBig: Optional[str] = None
    CoverXL: Optional[str] = None
    ISRC: Optional[str] = None
    BPM: Optional[float] = 0
    Duration: Optional[int] = 0
    ReleaseDate: Optional[str] = None
    AlbumName: Optional[str] = None
    Explicit: Optional[bool] = False
    Rank: Optional[int] = None
    Tags: Optional[List[str]] = None
    Contributors: Optional[List[Contributor]] = None
    AlbumGenres: Optional[List[str]] = None


class Playlist(BaseModel):
    """A predefined playlist with specific filters for song selection."""
    id: str
    name: str
    description: str
    genres: Optional[List[str]] = None
    start_year: Optional[int] = None
    end_year: Optional[int] = None
    cover_image: Optional[str] = None


class Artist(BaseModel):
    ArtistId: int
    Name: str
    HasPublicSongs: Optional[bool] = None
    SongId: Optional[int] = None
    Color: Optional[str] = None
    DarkColor: Optional[str] = None
    DeezerID: Optional[int] = None
    DeezerURL: Optional[str] = None
    PictureSmall: Optional[str] = None
    PictureMedium: Optional[str] = None
    PictureBig: Optional[str] = None
    PictureXL: Optional[str] = None
    NbAlbums: Optional[int] = None
    NbFans: Optional[int] = None
    Radio: Optional[bool] = None
    TopGenres: Optional[List[str]] = None
    Rank: Optional[Any] = None


class SongsData(BaseModel):
    Songs: List[Song]
    Artists: Optional[List[Artist]] = None