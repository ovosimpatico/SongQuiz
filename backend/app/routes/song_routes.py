from typing import List, Optional

from app.models.song import Song
from app.services.song_service import song_service
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(
    prefix="/api/songs",
    tags=["songs"]
)


@router.get("", response_model=List[dict])
async def get_songs(limit: int = 10, offset: int = 0):
    """Get a paginated list of songs."""
    songs = song_service.songs[offset:offset + limit]
    return [song.dict() for song in songs]


@router.get("/count", response_model=int)
async def get_song_count():
    """Get the total number of songs."""
    return song_service.get_total_song_count()


@router.get("/genres", response_model=List[str])
async def get_available_genres():
    """Get a list of available genres that have at least 30 songs."""
    return song_service.get_available_genres()


@router.get("/random", response_model=List[dict])
async def get_random_songs(count: int = 10):
    """Get a list of random songs."""
    count = min(count, 50)  # Limit to 50 songs max
    songs = song_service.get_random_songs(count)
    return [song.dict() for song in songs]


@router.get("/{song_id}", response_model=dict)
async def get_song(song_id: int):
    """Get a song by ID."""
    song = song_service.get_song_by_id(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song.dict()