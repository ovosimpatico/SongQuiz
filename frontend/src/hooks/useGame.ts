import { useState, useCallback } from 'react';
import {
  ApiAnswerResponse,
  ApiGameQuestion,
  ApiGameResponse,
  ApiGameSession,
  GameSettings,
  GameState,
  GameSummaryType,
  Song
} from '../types/game';
import { gameApi } from '../services/api';

interface UseGameProps {
  onGameComplete?: (summary: GameSummaryType) => void;
}

export default function useGame({ onGameComplete }: UseGameProps = {}) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    loading: false,
    error: null,
  });
  const [currentApiQuestion, setCurrentApiQuestion] = useState<ApiGameQuestion | null>(null);
  const [isCreatingGame, setIsCreatingGame] = useState<boolean>(false);

  // Create a new game session
  const createGame = useCallback(async (settings: GameSettings) => {
    // Prevent multiple concurrent game creation requests
    if (isCreatingGame) {
      console.log('Game creation already in progress, skipping duplicate request');
      return null;
    }

    try {
      setIsCreatingGame(true);
      setGameState(prev => ({ ...prev, loading: true, error: null }));

      // Create a new game session
      const session: ApiGameSession = await gameApi.createGame(settings);
      setSessionId(session.session_id);

      // Start the game
      const gameResponse: ApiGameResponse = await gameApi.startGame(session.session_id);
      setCurrentApiQuestion(gameResponse.question);

      // Update state
      setGameState(prev => ({
        ...prev,
        loading: false,
        currentQuestionIndex: gameResponse.current_question,
        score: gameResponse.score,
      }));

      setIsCreatingGame(false);
      return gameResponse;
    } catch (error) {
      console.error('Error creating game:', error);
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create game'
      }));
      setIsCreatingGame(false);
      return null;
    }
  }, [isCreatingGame]);

  // Answer a question
  const answerQuestion = useCallback(async (optionIndex: number) => {
    if (!sessionId || !currentApiQuestion) return null;

    try {
      setGameState(prev => ({ ...prev, loading: true }));

      // Submit the answer
      const response: ApiAnswerResponse = await gameApi.answerQuestion(
        sessionId,
        gameState.currentQuestionIndex,
        optionIndex
      );

      // Update state based on the response
      setGameState(prev => ({
        ...prev,
        loading: false,
        score: response.score,
        correctAnswers: prev.correctAnswers + (response.correct ? 1 : 0),
      }));

      // If the game is complete, call the completion callback
      if (response.game_complete && onGameComplete) {
        // Use currentQuestionIndex + 1 as the total questions count
        // This represents the current question number, which is the total number of questions answered
        const totalQuestions = gameState.currentQuestionIndex + 1;
        const correctAnswers = gameState.correctAnswers + (response.correct ? 1 : 0);
        const summary: GameSummaryType = {
          score: response.score,
          totalQuestions,
          correctAnswers,
          accuracy: (correctAnswers / totalQuestions) * 100,
        };
        onGameComplete(summary);
      }
      // If there's a next question, move to it
      else if (response.next_question_index !== undefined) {
        // Get the next question
        const gameResponse = await gameApi.getGameState(sessionId);
        setCurrentApiQuestion(gameResponse.question);

        // Update state
        setGameState(prev => ({
          ...prev,
          currentQuestionIndex: response.next_question_index!,
        }));
      }

      return response;
    } catch (error) {
      console.error('Error answering question:', error);
      setGameState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to submit answer'
      }));
      return null;
    }
  }, [sessionId, currentApiQuestion, gameState.currentQuestionIndex, gameState.questions.length, gameState.correctAnswers, onGameComplete]);

  // Reset the game
  const resetGame = useCallback(() => {
    setSessionId(null);
    setCurrentApiQuestion(null);
    setGameState({
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      correctAnswers: 0,
      loading: false,
      error: null,
    });
  }, []);

  // Convert the current API question to a frontend song object
  const getCurrentQuestion = useCallback(() => {
    if (!currentApiQuestion) return null;

    // Extract option data from the API question
    const options: Song[] = currentApiQuestion.options.map(option => ({
      id: option.song_id.toString(),
      title: option.name,
      artist: '', // The API doesn't include artist in options
      coverUrl: '', // Will be populated from blurred_cover_url
      audioUrl: currentApiQuestion.preview_url,
    }));

    // Find the correct option
    const correctOption = options[currentApiQuestion.correct_option_index];

    // Add artists to the correct option from the question
    if (correctOption) {
      correctOption.artist = currentApiQuestion.artists || '';
    }

    return {
      options,
      correctOption,
      timeLimit: currentApiQuestion.time_limit,
      coverUrl: currentApiQuestion.blurred_cover_url,
      clearCoverUrl: currentApiQuestion.clear_cover_url,
      songColor: currentApiQuestion.song_color || '4f46e5', // Use the song color or default to a purple color
      artists: currentApiQuestion.artists || '', // Include artists from API
    };
  }, [currentApiQuestion]);

  // Check if game already exists and is valid
  const hasActiveGame = useCallback(() => {
    return sessionId !== null && currentApiQuestion !== null;
  }, [sessionId, currentApiQuestion]);

  return {
    gameState,
    sessionId,
    createGame,
    answerQuestion,
    resetGame,
    getCurrentQuestion,
    hasActiveGame
  };
}