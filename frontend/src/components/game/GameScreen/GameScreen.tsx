import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faVolumeUp } from '@fortawesome/free-solid-svg-icons';
import useGame from '../../../hooks/useGame';
import useAudioPlayer from '../../../hooks/useAudioPlayer';
import useTimer from '../../../hooks/useTimer';
import { useTheme } from '../../../contexts/ThemeContext';
import { GameSettings, GameSummaryType, Song } from '../../../types/game';
import LoadingScreen from '../../ui/LoadingScreen';
import GameSummary from '../GameSummary';
import './GameScreen.scss';

interface GameScreenProps {
  onGameComplete?: (summary?: GameSummaryType) => void;
  onExit: () => void;
  settings: GameSettings;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameComplete, onExit, settings }) => {
  // Game state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [volume, setVolume] = useState<number>(0.7); // Default volume
  const [showNextButton, setShowNextButton] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showSummary, setShowSummary] = useState(false); // New state to control summary visibility
  const [answeredQuestions, setAnsweredQuestions] = useState<{id: string, correct: boolean, answer: string, correctAnswer: string}[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [showClearCover, setShowClearCover] = useState(false); // State to control whether to show the clear cover
  const [isLoading, setIsLoading] = useState(true); // State to track loading status

  // Get theme functions
  const { setSongColor } = useTheme();

  // Store the current displayed question in a ref to prevent updates when answering
  const displayedQuestionRef = useRef<any>(null);

  // Ref to track if we've initiated game creation
  const hasInitiatedGameRef = useRef<boolean>(false);

  // Ref to track points earned in the last answer
  const pointsEarnedRef = useRef<number>(0);

  // Ref to track if we've shown the initial loading screen already
  const initialLoadCompleteRef = useRef<boolean>(false);

  // Initialize game hook
  const { createGame, answerQuestion, resetGame, getCurrentQuestion, hasActiveGame, gameState } = useGame({
    onGameComplete: (summary) => {
      setGameCompleted(true);
      if (onGameComplete) {
        onGameComplete(summary);
      }
    }
  });

  // Initialize audio player with the current preview URL
  const [audioState, audioControls] = useAudioPlayer(previewUrl);

  // Initialize timer - 30 seconds per question, but don't start automatically
  const [timerState, timerControls] = useTimer(30, () => {
    // Auto-submit if time runs out
    if (!isAnswerSubmitted && displayedQuestionRef.current) {
      // For timeout, we'll use handleTimerComplete instead
      handleTimerComplete();
    }
  }, { autoStart: false });

  // Handle option selection - directly submit the answer on click
  const handleOptionSelect = useCallback((optionId: string) => {
    if (isAnswerSubmitted) return;

    // Set selected option
    setSelectedOption(optionId);

    // Find the index of the selected option
    const selectedIndex = currentQuestion.options.findIndex((option: Song) => option.id === optionId);
    if (selectedIndex === -1) return;

    // Submit answer immediately
    answerQuestion(selectedIndex).then(result => {
      if (result) {
        const isCorrect = result.correct;
        setIsCorrect(isCorrect);
        // Update score with base score + time bonus if correct
        setScore(result.score);
        setIsAnswerSubmitted(true);

        // Add a small delay before showing the clear cover for better visual effect
        setTimeout(() => {
          setShowClearCover(true); // Show the clear cover when the answer is submitted
        }, 300);

        // Store points earned for display
        if (isCorrect) {
          // Store points in a ref to access in the UI
          pointsEarnedRef.current = result.points_earned;
        }

        // If game is complete
        if (result.game_complete) {
          setGameCompleted(true);
        } else {
          // Show the next button after a short delay
          setTimeout(() => {
            setShowNextButton(true);
          }, 1800);
        }

        // Add this question to the answered questions
        setAnsweredQuestions(prev => [
          ...prev,
          {
            id: currentQuestion.correctOption.id,
            correct: isCorrect,
            answer: optionId ? currentQuestion.options.find((o: Song) => o.id === optionId)?.title || "" : "",
            correctAnswer: currentQuestion.correctOption.title
          }
        ]);
      }
    });
  }, [isAnswerSubmitted, currentQuestion, answerQuestion]);

  // Handle timer expiration
  const handleTimerComplete = useCallback(() => {
    if (!isAnswerSubmitted) {
      audioControls.pause();

      // For timeout, submit with -1 index
      answerQuestion(-1).then(result => {
        if (result) {
          setIsCorrect(false); // Always incorrect for timeout
          setScore(result.score);
          setIsAnswerSubmitted(true);

          setTimeout(() => {
            setShowClearCover(true);
          }, 300);

          pointsEarnedRef.current = 0; // No points for timeout

          if (result.game_complete) {
            setGameCompleted(true);
          } else {
            setTimeout(() => {
              setShowNextButton(true);
            }, 1800);
          }

          setAnsweredQuestions(prev => [
            ...prev,
            {
              id: currentQuestion.correctOption.id,
              correct: false,
              answer: "timeout",
              correctAnswer: currentQuestion.correctOption.title
            }
          ]);
        }
      });
    }
  }, [isAnswerSubmitted, audioControls, answerQuestion, currentQuestion]);

  // Set volume for audio player
  useEffect(() => {
    audioControls.setVolume(volume);
  }, [volume, audioControls]);

  // Start a new game when component mounts
  useEffect(() => {
    // Only create a new game if:
    // 1. We haven't initiated a game creation yet
    // 2. There's no active game
    // 3. We're not in the completed state
    if (!hasInitiatedGameRef.current && !hasActiveGame() && !gameCompleted) {
      console.log('Initiating game creation');
      hasInitiatedGameRef.current = true;
      createGame(settings);
    }
  }, [createGame, settings, hasActiveGame, gameCompleted]);

  // Update current question only when starting a new question
  useEffect(() => {
    if (!isAnswerSubmitted) {
      const question = getCurrentQuestion();
      if (question) {
        setCurrentQuestion(question);
        displayedQuestionRef.current = question; // Set displayed question on update
        setShowClearCover(false); // Ensure cover is blurred for new questions

        // Only set loading to false if this is the initial load
        if (!initialLoadCompleteRef.current) {
          setIsLoading(false); // Question loaded successfully
          initialLoadCompleteRef.current = true; // Mark initial load as complete
        }

        // Update the theme color with the song's color
        if (question.songColor) {
          setSongColor(question.songColor);
        }
      }
    }
  }, [getCurrentQuestion, isAnswerSubmitted, setSongColor]);

  // Update preview URL when current question changes
  useEffect(() => {
    if (!isAnswerSubmitted && currentQuestion?.correctOption?.audioUrl) {
      setPreviewUrl(currentQuestion.correctOption.audioUrl);
    }
  }, [currentQuestion, isAnswerSubmitted]);

  // Play audio and start timer when audio is ready
  useEffect(() => {
    if (previewUrl && !audioState.isLoading && !isAnswerSubmitted && !audioState.isPlaying && audioState.duration > 0) {
      // Play audio
      audioControls.play();

      // Start timer
      timerControls.start();
    }
  }, [previewUrl, audioState.isLoading, audioState.duration, audioState.isPlaying, audioControls, timerControls, isAnswerSubmitted]);

  // Handle proceeding to next question
  const handleNextQuestion = useCallback(() => {
    // Stop any playing audio
    audioControls.stop();

    // Reset state for next question
    timerControls.reset();
    setShowNextButton(false);
    setIsAnswerSubmitted(false);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowClearCover(false); // Reset cover image to blurred state
    pointsEarnedRef.current = 0; // Reset points earned
    // Don't set loading to true for song transitions
  }, [audioControls, timerControls]);

  // Handle exit game
  const handleExitGame = useCallback(() => {
    audioControls.stop();
    resetGame();
    // Reset our state trackers
    hasInitiatedGameRef.current = false;
    initialLoadCompleteRef.current = false; // Reset initial load flag
    onExit(); // Call the onExit prop directly
  }, [audioControls, resetGame, onExit]);

  // Handle volume change
  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, []);

  // Use the displayed question from the ref for rendering
  const questionToDisplay = displayedQuestionRef.current;

  // Handle playing again
  const handlePlayAgain = useCallback(() => {
    // Stop any playing audio
    audioControls.stop();

    // Reset all game state
    setShowSummary(false);
    setGameCompleted(false);
    setAnsweredQuestions([]);
    setScore(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(null);
    setShowNextButton(false);
    setPreviewUrl('');
    pointsEarnedRef.current = 0;
    setShowClearCover(false); // Ensure cover is blurred when starting a new game
    setIsLoading(true); // Show loading screen for new game
    initialLoadCompleteRef.current = false; // Reset initial load flag

    // Reset the initiated game ref
    hasInitiatedGameRef.current = false;

    // Create a new game
    createGame(settings);
  }, [audioControls, createGame, settings]);

  // Handle viewing game summary
  const handleViewSummary = useCallback(() => {
    setShowSummary(true);
  }, []);

  // Update loading state when game state changes
  useEffect(() => {
    // Only show loading during initial load
    if (!initialLoadCompleteRef.current) {
      setIsLoading(gameState.loading);
    }
  }, [gameState.loading]);

  // Update loading state based on audio loading
  useEffect(() => {
    // Only show loading during initial load
    if (!initialLoadCompleteRef.current) {
      // If audio is loading, show loading screen
      if (previewUrl && audioState.isLoading) {
        setIsLoading(true);
      }
      // If audio has loaded successfully
      else if (previewUrl && !audioState.isLoading && audioState.duration > 0) {
        setIsLoading(false);
        initialLoadCompleteRef.current = true; // Mark initial load as complete
      }
    }
  }, [previewUrl, audioState.isLoading, audioState.duration]);

  if (!questionToDisplay) {
    return (
      <div className="game-screen">
        <LoadingScreen isLoading={true} />
        <div className="loading">
          <h2>Starting Game</h2>
        </div>
      </div>
    );
  }

  // Find the correct option for display purposes
  const correctOptionId = questionToDisplay.correctOption.id;

  return (
    <div className="game-screen">
      <LoadingScreen isLoading={isLoading} />

      <motion.div
        className="game-header"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <button className="back-button" onClick={handleExitGame}>
          <FontAwesomeIcon icon={faArrowLeft} /> Back
        </button>
        <motion.div
          className="score-display"
          animate={{
            scale: gameState.score !== score ? [1, 1.2, 1] : 1,
          }}
          transition={{ duration: 0.4, type: "tween", ease: "easeInOut" }}
        >
          <span>{score}</span>
        </motion.div>
        <div className="volume-control">
          <FontAwesomeIcon icon={faVolumeUp} className="volume-icon" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
        <div className="timer-bar">
          <motion.div
            className="timer-progress"
            style={{ width: `${timerState.progress}%` }}
          />
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showSummary ? (
          <GameSummary
            summary={{
              score,
              totalQuestions: answeredQuestions.length,
              correctAnswers: answeredQuestions.filter(q => q.correct).length,
              accuracy: answeredQuestions.length ? (answeredQuestions.filter(q => q.correct).length / answeredQuestions.length) * 100 : 0
            }}
            onPlayAgain={handlePlayAgain}
            onExit={handleExitGame}
            answeredQuestions={answeredQuestions}
          />
        ) : (
          <motion.div
            key="game-content"
            className="game-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="question-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                Guess the song
              </motion.h2>

              <motion.div
                className="audio-player"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {audioState.isLoading ? (
                  <div className="loading-spinner">Loading preview...</div>
                ) : (
                  <motion.div
                    className="play-status"
                    animate={{
                      scale: audioState.isPlaying ? [1, 1.05, 1] : 1,
                    }}
                    transition={{ duration: 0.4, repeat: audioState.isPlaying ? Infinity : 0, repeatDelay: 1.5 }}
                  >
                    {audioState.isPlaying ? 'Now Playing' : 'Paused'}
                  </motion.div>
                )}
              </motion.div>

              {questionToDisplay.coverUrl && (
                <motion.div
                  className={`cover-image-container ${showClearCover ? 'reveal-mode' : ''}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className={`cover-image ${showClearCover ? 'clear' : 'blurred'}`}>
                    <motion.img
                      key={questionToDisplay.coverUrl}
                      src={showClearCover ? questionToDisplay.clearCoverUrl : questionToDisplay.coverUrl}
                      alt={showClearCover ? "Album cover" : "Blurred album cover"}
                      initial={{ filter: "blur(10px)", scale: 1 }}
                      animate={{
                        filter: showClearCover ? "blur(0px)" : "blur(10px)",
                        scale: showClearCover ? 1.05 : 1
                      }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  <AnimatePresence>
                    {showClearCover && (
                      <motion.div
                        className="song-details"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                      >
                        <h3 className="song-title">{questionToDisplay.correctOption.title}</h3>
                        <p className="song-artists">{questionToDisplay.artists || questionToDisplay.correctOption.artist}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              <div className="options-container">
                {questionToDisplay.options.map((option: Song, index: number) => (
                  <motion.button
                    key={option.id}
                    className={`option-button ${selectedOption === option.id ? 'selected' : ''} ${
                      isAnswerSubmitted && option.id === correctOptionId ? 'correct' : ''
                    } ${
                      isAnswerSubmitted && selectedOption === option.id && selectedOption !== correctOptionId ? 'incorrect' : ''
                    }`}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={isAnswerSubmitted}
                    whileHover={!isAnswerSubmitted ? { scale: 1.03, y: -2 } : {}}
                    whileTap={!isAnswerSubmitted ? { scale: 0.98 } : {}}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.5 + (index * 0.1),
                      duration: 0.4,
                      type: "spring",
                      stiffness: 200,
                      damping: 15
                    }}
                  >
                    {option.title}
                  </motion.button>
                ))}
              </div>

              <AnimatePresence>
                {isAnswerSubmitted && (
                  <motion.div
                    className="result-container"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="result-message">
                      {isCorrect ? (
                        <motion.div
                          className="correct-message"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          Correct! +{pointsEarnedRef.current} points
                        </motion.div>
                      ) : (
                        <motion.div
                          className="incorrect-message"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          Incorrect! The correct answer was: {questionToDisplay.correctOption.title}
                        </motion.div>
                      )}
                    </div>

                    <AnimatePresence>
                      {showNextButton ? (
                        <motion.button
                          className="next-button"
                          onClick={handleNextQuestion}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          Next Song
                        </motion.button>
                      ) : gameCompleted && (
                        <motion.button
                          className="next-button"
                          onClick={handleViewSummary}
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ delay: 0.2, type: "spring" }}
                        >
                          See Results
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameScreen;