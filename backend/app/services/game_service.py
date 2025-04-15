import random
import time
import uuid
from typing import Dict, List, Optional, Tuple

from app.models.game import (
    AnswerResponse,
    GameOption,
    GameQuestion,
    GameResponse,
    GameSession,
    GameSettings,
    GameSummary,
)
from app.models.song import Song
from app.services.playlist_service import playlist_service
from app.services.song_service import song_service


class GameService:
    def __init__(self):
        # Store active game sessions
        self.active_sessions: Dict[str, GameSession] = {}

    async def create_game(self, settings: GameSettings) -> GameSession:
        """Create a new game session with the specified settings."""
        # Process playlist if specified
        genres = settings.genres
        start_year = settings.start_year
        end_year = settings.end_year

        if settings.playlist_id:
            playlist = playlist_service.get_playlist_by_id(settings.playlist_id)
            if playlist:
                genres = playlist.genres or genres
                start_year = playlist.start_year or start_year
                end_year = playlist.end_year or end_year
            else:
                print(f"Playlist not found: {settings.playlist_id}")

        # Get random songs for the game, filtered by criteria
        game_songs = song_service.get_random_songs(
            settings.num_songs,
            genres=genres,
            start_year=start_year,
            end_year=end_year
        )


        # Ensure we have at least one song
        if not game_songs:
            # Return songs without filtering if no songs match the criteria
            game_songs = song_service.get_random_songs(settings.num_songs)

        # Create game questions
        questions = []
        for song in game_songs:
            # Get choices for this question, using the same filters
            choices = song_service.get_random_song_choices(
                song,
                settings.num_choices,
                genres=genres,
                start_year=start_year,
                end_year=end_year
            )

            # Make sure we have exactly 4 different song options
            # First, ensure the correct song is in the list
            if song not in choices:
                choices.append(song)

            # Filter out duplicates by name
            unique_choices = []
            seen_names = set()
            for choice in choices:
                if choice.Name not in seen_names:
                    seen_names.add(choice.Name)
                    unique_choices.append(choice)

            # If we don't have enough unique options after filtering, add more random songs
            while len(unique_choices) < settings.num_choices:
                additional_songs = song_service.get_random_songs(
                    settings.num_choices - len(unique_choices),
                    genres=genres,
                    start_year=start_year,
                    end_year=end_year
                )

                for additional_song in additional_songs:
                    if additional_song.Name not in seen_names and additional_song.SongId != song.SongId:
                        seen_names.add(additional_song.Name)
                        unique_choices.append(additional_song)

                # Break if we can't find any more unique songs
                if len(unique_choices) < settings.num_choices:
                    additional_songs = song_service.get_random_songs(
                        settings.num_choices - len(unique_choices)
                    )
                    for additional_song in additional_songs:
                        if additional_song.Name not in seen_names and additional_song.SongId != song.SongId:
                            seen_names.add(additional_song.Name)
                            unique_choices.append(additional_song)

            # Ensure we have exactly 4 options
            choices = unique_choices[:settings.num_choices]

            # Make sure the correct song is still in the list
            if song not in choices:
                choices[-1] = song

            # Find the index of the correct option
            correct_index = next(i for i, s in enumerate(choices) if s.SongId == song.SongId)

            # Create option objects
            options = [
                GameOption(
                    song_id=s.SongId,
                    name=s.Name,
                    is_correct=(s.SongId == song.SongId)
                ) for s in choices
            ]

            # Create the question
            preview_url = await song_service.get_deezer_preview_url(song)
            question = GameQuestion(
                song_id=song.SongId,
                preview_url=preview_url,
                blurred_cover_url=song.CoverMedium or "",
                clear_cover_url=song.CoverBig or song.CoverXL or song.CoverMedium or "",  # Use best available cover
                correct_option_index=correct_index,
                options=options,
                song_color=song.DarkColor or song.Color,  # Prefer DarkColor when available
                artists=song.Artists  # Add the artists field from the song
            )

            questions.append(question)

        # Create the game session
        session = GameSession.create(questions)

        # Store the session
        self.active_sessions[session.session_id] = session

        return session

    def start_game(self, session_id: str) -> Optional[GameSession]:
        """Start the game by setting the start time."""
        if session_id not in self.active_sessions:
            return None

        session = self.active_sessions[session_id]
        session.started_at = time.time()
        return session

    def get_game_response(self, session_id: str) -> Optional[GameResponse]:
        """Get the current game state as a response object."""
        if session_id not in self.active_sessions:
            return None

        session = self.active_sessions[session_id]

        # Check if we have a valid current question
        if session.current_question >= len(session.questions):
            return None

        question = session.questions[session.current_question]

        # Calculate time remaining if game has started
        time_remaining = None
        if session.started_at > 0:
            elapsed = time.time() - session.started_at
            question_time = session.current_question * question.time_limit
            current_question_elapsed = elapsed - question_time

            if current_question_elapsed < question.time_limit:
                time_remaining = int(question.time_limit - current_question_elapsed)
            else:
                time_remaining = 0

        return GameResponse(
            session_id=session.session_id,
            current_question=session.current_question,
            total_questions=session.total_questions,
            question=question,
            score=session.score,
            time_remaining=time_remaining
        )

    def answer_question(self, session_id: str, question_index: int, selected_option_index: int) -> Optional[AnswerResponse]:
        """Process a player's answer to a question."""
        if session_id not in self.active_sessions:
            return None

        session = self.active_sessions[session_id]

        # Validate question index
        if question_index < 0 or question_index >= len(session.questions):
            return None

        # Check if this is the current question
        if question_index != session.current_question:
            return None

        question = session.questions[question_index]

        # Special case for timeouts: -1 option index means timeout
        is_correct = False
        if selected_option_index == -1:
            # Timeout - always incorrect
            is_correct = False
        else:
            # Check if the selected option is valid
            if selected_option_index < 0 or selected_option_index >= len(question.options):
                return None

            # Check if the answer is correct
            is_correct = question.correct_option_index == selected_option_index

        # Update score if correct - add time bonus based on remaining time
        time_remaining = 0
        if session.started_at > 0:
            elapsed = time.time() - session.started_at
            question_time = session.current_question * question.time_limit
            current_question_elapsed = elapsed - question_time
            time_remaining = max(0, question.time_limit - current_question_elapsed)

        # Calculate points: 10 base points + time bonus if correct
        points = 0
        if is_correct:
            # Base points (10) + time bonus (up to 5 more points based on time)
            points = 10 + int(time_remaining / question.time_limit * 5)
            session.score += points

        # Move to the next question
        session.current_question += 1
        game_complete = session.current_question >= session.total_questions

        # Prepare the response
        next_question = None if game_complete else session.current_question

        return AnswerResponse(
            correct=is_correct,
            correct_option_index=question.correct_option_index,
            score=session.score,
            next_question_index=next_question,
            game_complete=game_complete,
            points_earned=points
        )

    def get_game_summary(self, session_id: str) -> Optional[GameSummary]:
        """Get a summary of the completed game."""
        if session_id not in self.active_sessions:
            return None

        session = self.active_sessions[session_id]

        # Calculate accuracy
        accuracy = (session.score / session.total_questions) * 100 if session.total_questions > 0 else 0

        return GameSummary(
            session_id=session.session_id,
            score=session.score,
            total_questions=session.total_questions,
            accuracy=accuracy
        )

    def cleanup_old_sessions(self, max_age_seconds: int = 3600) -> None:
        """Remove old game sessions to free up memory."""
        current_time = time.time()
        to_remove = []

        for session_id, session in self.active_sessions.items():
            # Skip sessions that haven't started
            if session.started_at == 0:
                continue

            # Check if the session is too old
            age = current_time - session.started_at
            if age > max_age_seconds:
                to_remove.append(session_id)

        # Remove old sessions
        for session_id in to_remove:
            del self.active_sessions[session_id]


# Create a global instance of the game service
game_service = GameService()