from typing import Dict

from app.services.song_service import song_service
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/api/preview",
    tags=["preview"]
)


@router.get("/audio/{song_id}")
async def get_audio_preview(song_id: int):
    """Get the audio preview URL for a song."""
    song = song_service.get_song_by_id(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    preview_url = await song_service.get_deezer_preview_url(song)
    if not preview_url:
        raise HTTPException(status_code=404, detail="Preview not available for this song")

    # Return the preview URL
    return {"preview_url": preview_url}


@router.get("/cover/{song_id}")
async def get_blurred_cover(song_id: int, blur_level: int = 10):
    """Get a blurred version of the song cover image."""
    song = song_service.get_song_by_id(song_id)
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # Get the original cover
    original_cover = song.CoverMedium or song.CoverBig or song.CoverXL or song.CoverSmall

    # Get the blurred URL
    blurred_url = original_cover

    # Return the blurred cover URL and the original URL
    return {
        "blurred_url": blurred_url,
        "original_url": original_cover,
        "blur_level": blur_level
    }