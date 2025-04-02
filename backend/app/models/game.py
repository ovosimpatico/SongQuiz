import uuid
from typing import Dict, List, Optional

from pydantic import BaseModel


class GameSettings(BaseModel):
    num_songs: int = 5  # 5, 10, or 25 songs
    num_choices: int = 6  # Number of song choices to present
    genres: Optional[List[str]] = None  # List of genres to filter songs by
    playlist_id: Optional[str] = None  # ID of a predefined playlist
    start_year: Optional[int] = None  # Start year for filtering
    end_year: Optional[int] = None  # End year for filtering


class GameOption(BaseModel):
    song_id: int
    name: str
    is_correct: bool


class GameQuestion(BaseModel):
    song_id: int
    preview_url: str
    blurred_cover_url: str
    clear_cover_url: str = ""  # Original unblurred cover URL
    correct_option_index: int
    options: List[GameOption]
    time_limit: int = 15  # seconds
    song_color: str = ""  # Add song color for theming
    artists: str = ""  # Artists of the song


class GameSession(BaseModel):
    session_id: str
    questions: List[GameQuestion]
    current_question: int = 0
    score: int = 0
    total_questions: int
    started_at: float  # Unix timestamp

    @classmethod
    def create(cls, questions: List[GameQuestion]):
        return cls(
            session_id=str(uuid.uuid4()),
            questions=questions,
            total_questions=len(questions),
            started_at=0  # Will be set when the game starts
        )


class GameResponse(BaseModel):
    session_id: str
    current_question: int
    total_questions: int
    question: GameQuestion
    score: int
    time_remaining: Optional[int] = None


class AnswerRequest(BaseModel):
    session_id: str
    question_index: int
    selected_option_index: int


class AnswerResponse(BaseModel):
    correct: bool
    correct_option_index: int
    score: int
    next_question_index: Optional[int] = None
    game_complete: bool = False
    points_earned: int = 0


class GameSummary(BaseModel):
    session_id: str
    score: int
    total_questions: int
    accuracy: float  # Percentage correct