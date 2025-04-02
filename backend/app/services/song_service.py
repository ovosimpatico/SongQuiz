import json
import random
import re
from collections import defaultdict
from math import floor
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

import httpx
from app.models.song import Song, SongsData
from fastapi import HTTPException


class SongService:
    def __init__(self):
        self.songs_data: Optional[SongsData] = None
        self.songs: List[Song] = []
        self.genres: Dict[str, List[Song]] = {}  # Map of genre to songs with that genre
        self.available_genres: List[str] = []  # Genres with at least 30 songs
        self._load_songs()

    def _load_songs(self) -> None:
        """Load songs data from the JSON file and index genres."""
        try:
            json_path = Path("songs.json")
            with open(json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.songs_data = SongsData(**data)
                self.songs = self.songs_data.Songs

            # Index genres
            self._index_genres()
            print(f"Loaded {len(self.songs)} songs successfully")
            print(f"Found {len(self.available_genres)} genres with at least 30 songs")
        except Exception as e:
            print(f"Error loading songs: {e}")
            # Initialize with empty list to avoid crashes
            self.songs = []
            self.genres = {}
            self.available_genres = []

    def _index_genres(self) -> None:
        """Index all songs by genre and find available genres with at least 30 songs."""
        self.genres = {}
        genre_count: Dict[str, int] = {}

        # Process each song
        for song in self.songs:
            # Use AlbumGenres field if available, or Tags as fallback
            song_genres = song.AlbumGenres or song.Tags or []

            # Add song to each of its genres
            for genre in song_genres:
                if genre not in self.genres:
                    self.genres[genre] = []
                self.genres[genre].append(song)

                # Track genre count
                genre_count[genre] = genre_count.get(genre, 0) + 1

        # Find genres with at least 30 songs
        self.available_genres = [
            genre for genre, count in genre_count.items()
            if count >= 30
        ]

        # Sort genres alphabetically
        self.available_genres.sort()

    def get_song_by_id(self, song_id: int) -> Optional[Song]:
        """Get a song by its ID."""
        for song in self.songs:
            if song.SongId == song_id:
                return song
        return None

    def get_song_release_year(self, song: Song) -> Optional[int]:
        """Extract the release year from a song.

        Tries to get it from the ReleaseDate field first, then from Tags.
        """
        # Try to get year from ReleaseDate (format: YYYY-MM-DD)
        if song.ReleaseDate and len(song.ReleaseDate) >= 4:
            try:
                return int(song.ReleaseDate[:4])
            except ValueError:
                pass

        # Try to get year from Tags (format: "year:YYYY")
        if song.Tags:
            for tag in song.Tags:
                if tag.startswith("year:"):
                    try:
                        return int(tag[5:])
                    except ValueError:
                        pass

        return None

    def filter_songs_by_criteria(
        self,
        genres: Optional[List[str]] = None,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None
    ) -> List[Song]:
        """Filter songs based on multiple criteria."""
        filtered_songs = self.songs.copy()

        # Filter by genres if specified
        if genres:
            genre_song_ids = set()
            for genre in genres:
                if genre in self.genres:
                    for song in self.genres[genre]:
                        genre_song_ids.add(song.SongId)

            filtered_songs = [song for song in filtered_songs if song.SongId in genre_song_ids]

        # Filter by year range if specified
        if start_year or end_year:
            year_filtered = []
            for song in filtered_songs:
                year = self.get_song_release_year(song)
                if year:
                    if start_year and end_year:
                        if start_year <= year <= end_year:
                            year_filtered.append(song)
                    elif start_year:
                        if year >= start_year:
                            year_filtered.append(song)
                    elif end_year:
                        if year <= end_year:
                            year_filtered.append(song)
            filtered_songs = year_filtered

        return filtered_songs

    def get_random_songs(
        self,
        count: int,
        genres: Optional[List[str]] = None,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None
    ) -> List[Song]:
        """Get a random sample of songs, optionally filtered by genres and/or year range."""
        # Filter songs based on criteria
        filtered_songs = self.filter_songs_by_criteria(genres, start_year, end_year)

        # If we don't have enough songs after filtering, return all we have
        if count >= len(filtered_songs):
            return filtered_songs

        return random.sample(filtered_songs, count)

    def get_random_song_choices(
        self,
        correct_song: Song,
        num_choices: int,
        genres: Optional[List[str]] = None,
        start_year: Optional[int] = None,
        end_year: Optional[int] = None
    ) -> List[Song]:
        """Get a list of random song choices including the correct song, optionally filtered."""

        # Get the filtered song pool
        song_pool = self.filter_songs_by_criteria(genres, start_year, end_year)

        # Remove the correct song from the pool for now
        other_songs = [s for s in song_pool if s.SongId != correct_song.SongId]

        # Make sure we have enough songs for choices
        if len(other_songs) < num_choices - 1:
            # Get more songs from the general pool
            additional_songs = [s for s in self.songs if s.SongId != correct_song.SongId and s not in other_songs]
            other_songs.extend(additional_songs)

        # Filter songs to ensure unique names
        unique_other_songs = []
        seen_names = set()

        # First add the correct song name to seen_names
        seen_names.add(correct_song.Name)

        # Shuffle to get random candidates
        random.shuffle(other_songs)

        # Select songs with unique names
        for song in other_songs:
            if song.Name not in seen_names:
                seen_names.add(song.Name)
                unique_other_songs.append(song)

            # Break when we have enough choices
            if len(unique_other_songs) >= num_choices - 1:
                break

        # If we still don't have enough unique names, try again with the full song list
        if len(unique_other_songs) < num_choices - 1:
            remaining_songs = [s for s in self.songs if s.SongId != correct_song.SongId and s.Name not in seen_names]
            random.shuffle(remaining_songs)

            for song in remaining_songs:
                if song.Name not in seen_names:
                    seen_names.add(song.Name)
                    unique_other_songs.append(song)

                # Break when we have enough choices
                if len(unique_other_songs) >= num_choices - 1:
                    break

        # Get the choices we have
        wrong_choices = unique_other_songs[:num_choices - 1]

        # Add the correct song
        choices = wrong_choices + [correct_song]

        # Verify all song names are unique
        choice_names = [s.Name for s in choices]
        if len(set(choice_names)) != len(choices):
            print("WARNING: Duplicate song names in choices!")

        # Shuffle the choices
        random.shuffle(choices)

        return choices

    def get_available_genres(self) -> List[str]:
        """Get the list of available genres (those with at least 30 songs)."""
        return self.available_genres

    async def get_deezer_preview_url(self, song: Song) -> str:
        """Get the Deezer preview URL for a song."""
        if not song.DeezerID:
            return ""

        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(f"https://api.deezer.com/track/{song.DeezerID}")
                if response.status_code != 200:
                    return ""

                data = response.json()
                preview_url = data.get("preview")
                if not preview_url:
                    return ""

                return preview_url
            except Exception as e:
                print(f"Error fetching preview URL: {e}")
                return ""

    def get_total_song_count(self) -> int:
        """Get the total number of songs in the database."""
        return len(self.songs)

    def get_available_years(self) -> Set[int]:
        """Get a set of all years that have at least one song."""
        years = set()
        for song in self.songs:
            year = self.get_song_release_year(song)
            if year:
                years.add(year)
        return years

    def get_decade_counts(self) -> Dict[str, int]:
        """Get counts of songs by decade."""
        decade_counts = defaultdict(int)
        for song in self.songs:
            year = self.get_song_release_year(song)
            if year:
                # Calculate the decade (e.g., 1980s, 1990s, etc.)
                decade = floor(year / 10) * 10
                decade_counts[f"{decade}s"] += 1

        # Sort by decade
        sorted_decades = dict(sorted(decade_counts.items(),
                                    key=lambda item: int(item[0][:-1])))
        return sorted_decades

    def get_genre_distribution(self) -> Dict[str, int]:
        """Get distribution of songs by genre."""
        genre_distribution = defaultdict(int)
        for genre, songs in self.genres.items():
            genre_distribution[genre] = len(songs)

        # Sort by count descending
        sorted_genres = dict(sorted(genre_distribution.items(),
                                   key=lambda item: item[1],
                                   reverse=True))
        return sorted_genres


# Create a global instance of the song service
song_service = SongService()