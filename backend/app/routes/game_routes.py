from typing import List, Optional

from app.models.game import AnswerRequest, AnswerResponse, GameResponse, GameSession, GameSettings, GameSummary
from app.services.game_service import game_service
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException

router = APIRouter(
    prefix="/api/game",
    tags=["game"]
)


@router.post("/create", response_model=GameSession)
async def create_game(settings: GameSettings):
    """Create a new game session with the specified settings."""
    try:
        return await game_service.create_game(settings)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create game: {str(e)}")


@router.post("/start/{session_id}", response_model=GameResponse)
async def start_game(session_id: str, background_tasks: BackgroundTasks):
    """Start a game session and get the first question."""
    # Start the game
    session = game_service.start_game(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Game session not found")

    # Schedule cleanup of old sessions
    background_tasks.add_task(game_service.cleanup_old_sessions)

    # Get the game response
    response = game_service.get_game_response(session_id)
    if not response:
        raise HTTPException(status_code=404, detail="Failed to get game state")

    return response


@router.get("/state/{session_id}", response_model=GameResponse)
async def get_game_state(session_id: str):
    """Get the current state of a game session."""
    response = game_service.get_game_response(session_id)
    if not response:
        raise HTTPException(status_code=404, detail="Game session not found or invalid state")

    return response


@router.post("/answer", response_model=AnswerResponse)
async def answer_question(answer: AnswerRequest):
    """Submit an answer to the current question."""
    response = game_service.answer_question(
        answer.session_id,
        answer.question_index,
        answer.selected_option_index
    )

    if not response:
        raise HTTPException(status_code=404, detail="Game session not found or invalid answer")

    return response


@router.get("/summary/{session_id}", response_model=GameSummary)
async def get_game_summary(session_id: str):
    """Get a summary of a completed game."""
    summary = game_service.get_game_summary(session_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Game session not found")

    return summary