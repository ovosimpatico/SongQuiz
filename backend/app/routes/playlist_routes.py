"""Routes for playlist operations."""
from typing import List

from app.models.song import Playlist
from app.services.playlist_service import playlist_service
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/api/playlists",
    tags=["playlists"]
)


@router.get("", response_model=List[Playlist])
async def get_playlists():
    """Get all available predefined playlists."""
    return playlist_service.get_all_playlists()


@router.get("/{playlist_id}", response_model=Playlist)
async def get_playlist(playlist_id: str):
    """Get a playlist by its ID."""
    playlist = playlist_service.get_playlist_by_id(playlist_id)
    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return playlist