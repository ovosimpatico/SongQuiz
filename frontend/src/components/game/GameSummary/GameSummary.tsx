import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faHeadphones, faGuitar, faMicrophone, faKeyboard } from '@fortawesome/free-solid-svg-icons';
import { GameSummaryType } from '../../../types/game';
import { APP_NAME } from '../../../App';
import './GameSummary.scss';

interface GameSummaryProps {
  summary: GameSummaryType;
  onPlayAgain: () => void;
  onExit: () => void;
  answeredQuestions?: {id: string, correct: boolean, answer: string, correctAnswer: string}[];
}

const GameSummary: React.FC<GameSummaryProps> = ({ summary, onPlayAgain, onExit, answeredQuestions = [] }) => {
  // Ensure accuracy is a valid number
  const safeAccuracy = isNaN(summary.accuracy) || !isFinite(summary.accuracy) ? 0 : summary.accuracy;

  const getScoreMessage = () => {
    if (safeAccuracy >= 80) {
      return "Amazing! You're a music genius!";
    } else if (safeAccuracy >= 60) {
      return "Great job! You know your music well!";
    } else if (safeAccuracy >= 40) {
      return "Not bad! Keep practicing to improve your score.";
    } else {
      return "You might want to listen to more music!";
    }
  };

  const getRankLabel = () => {
    if (safeAccuracy >= 90) return "Music Maestro";
    if (safeAccuracy >= 70) return "Melody Master";
    if (safeAccuracy >= 50) return "Rhythm Rookie";
    if (safeAccuracy >= 30) return "Beat Beginner";
    return "Tune Trainee";
  };

  const getEmojiForRank = () => {
    if (safeAccuracy >= 90) return <FontAwesomeIcon icon={faMusic} />;
    if (safeAccuracy >= 70) return <FontAwesomeIcon icon={faHeadphones} />;
    if (safeAccuracy >= 50) return <FontAwesomeIcon icon={faGuitar} />;
    if (safeAccuracy >= 30) return <FontAwesomeIcon icon={faMicrophone} />;
    return <FontAwesomeIcon icon={faKeyboard} />;
  };

  return (
    <motion.div
      className="game-summary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="game-summary__title"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Game Complete!
      </motion.h2>

      <motion.div
        className="game-summary__message"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {getScoreMessage()}
      </motion.div>

      <motion.div
        className="game-summary__score-circle"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring" }}
      >
        <div className="game-summary__score-label">Final Score</div>
        <div className="game-summary__score-value">{summary.score}</div>
      </motion.div>

      <motion.div
        className="game-summary__stats"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="game-summary__rank">
          <div className="game-summary__rank-badge">
            <span className="game-summary__rank-emoji">{getEmojiForRank()}</span>
            <span>{getRankLabel()}</span>
          </div>
        </div>

        <div className="game-summary__score-grid">
          <div className="game-summary__score-item">
            <div className="game-summary__score-value">{summary.correctAnswers}</div>
            <div className="game-summary__score-label">Correct</div>
          </div>

          <div className="game-summary__score-item">
            <div className="game-summary__score-value">{summary.totalQuestions}</div>
            <div className="game-summary__score-label">Total</div>
          </div>

          <div className="game-summary__score-item">
            <div className="game-summary__score-value">{safeAccuracy.toFixed(0)}%</div>
            <div className="game-summary__score-label">Accuracy</div>
          </div>
        </div>
      </motion.div>

      {answeredQuestions.length > 0 && (
        <motion.div
          className="game-summary__questions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h3>Your Answers</h3>
          <div className="game-summary__answers-container">
            {answeredQuestions.map((question, index) => (
              <motion.div
                key={index}
                className={`game-summary__answer-card ${question.correct ? 'correct' : 'incorrect'}`}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="game-summary__answer-header">
                  <span className="game-summary__question-number">Question {index + 1}</span>
                  <span className="game-summary__result-badge">{question.correct ? 'Correct' : 'Incorrect'}</span>
                </div>
                <div className="game-summary__answer-content">
                  {question.correct ? (
                    <div className="game-summary__correct-answer">
                      <span className="game-summary__answer-label">You correctly guessed:</span>
                      <span className="game-summary__song-title">{question.correctAnswer}</span>
                    </div>
                  ) : (
                    <div className="game-summary__incorrect-answer">
                      <span className="game-summary__answer-label">Correct song was:</span>
                      <span className="game-summary__song-title">{question.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className="game-summary__actions"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 + (answeredQuestions.length > 0 ? answeredQuestions.length * 0.1 : 0) }}
      >
        <motion.button
          className="game-summary__play-again"
          onClick={onPlayAgain}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Play Again
        </motion.button>
        <motion.button
          className="game-summary__exit"
          onClick={onExit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Return to Menu
        </motion.button>
        <motion.button
          className="game-summary__share"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            const text = `I scored ${summary.score} points with ${safeAccuracy.toFixed(0)}% accuracy in ${APP_NAME}! Can you beat my score?`;
            if (navigator.share) {
              navigator.share({
                title: `My ${APP_NAME} Score`,
                text: text,
                url: window.location.href,
              }).catch(() => {
                // Fallback if share fails
                navigator.clipboard.writeText(text);
                alert('Score copied to clipboard!');
              });
            } else {
              // Fallback - copy to clipboard
              navigator.clipboard.writeText(text);
              alert('Score copied to clipboard!');
            }
          }}
        >
          Share Score
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default GameSummary;