"""Routes for song statistics and analytics."""
from typing import Dict, List

from app.services.song_service import song_service
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/api/stats",
    tags=["stats"]
)


@router.get("/years")
async def get_available_years():
    """Get a list of years that have songs in the database, suitable for filtering."""
    years = song_service.get_available_years()
    return {
        "min_year": min(years) if years else None,
        "max_year": max(years) if years else None,
        "years": sorted(years)
    }


@router.get("/decade-counts")
async def get_decade_counts():
    """Get counts of songs by decade."""
    decades = song_service.get_decade_counts()
    return decades


@router.get("/genre-distribution")
async def get_genre_distribution():
    """Get distribution of songs by genre."""
    genre_distribution = song_service.get_genre_distribution()
    return genre_distribution