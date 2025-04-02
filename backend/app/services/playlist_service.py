"""Service for managing predefined playlists."""
from typing import Dict, List, Optional

from app.models.song import Playlist

# Predefined playlists
PLAYLISTS: List[Playlist] = [
    Playlist(
        id="pop-2010s",
        name="Best Pop 2010s",
        description="The most popular pop hits from the 2010s decade",
        genres=["Pop"],
        start_year=2010,
        end_year=2019,
    ),
    Playlist(
        id="old-school-rap",
        name="Old School Rap",
        description="Classic rap hits from the 80s and 90s",
        genres=["Rap/Hip Hop"],
        start_year=1980,
        end_year=1999,
    ),
    Playlist(
        id="latest-hits",
        name="Latest Hits",
        description="The newest songs from the past year",
        start_year=2023,
    ),
    Playlist(
        id="rock-classics",
        name="Rock Classics",
        description="Timeless rock anthems from the 70s to 90s",
        genres=["Rock"],
        start_year=1970,
        end_year=1999,
    ),
    Playlist(
        id="2000s-nostalgia",
        name="2000s Nostalgia",
        description="Hits that defined the 2000s",
        start_year=2000,
        end_year=2009,
    ),
]


class PlaylistService:
    """Service for managing predefined playlists."""

    def __init__(self):
        self.playlists: Dict[str, Playlist] = {p.id: p for p in PLAYLISTS}

    def get_all_playlists(self) -> List[Playlist]:
        """Get all available playlists."""
        return list(self.playlists.values())

    def get_playlist_by_id(self, playlist_id: str) -> Optional[Playlist]:
        """Get a playlist by its ID."""
        return self.playlists.get(playlist_id)


# Create a global instance of the playlist service
playlist_service = PlaylistService()