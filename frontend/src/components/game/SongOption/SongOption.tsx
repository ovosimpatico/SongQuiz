import React from 'react';
import { motion } from 'framer-motion';
  import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import './SongOption.scss';

interface SongOptionProps {
  name: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isRevealed?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const SongOption: React.FC<SongOptionProps> = ({
  name,
  isSelected = false,
  isCorrect = false,
  isRevealed = false,
  onClick,
  disabled = false,
}) => {
  // Determine the variant of the option button based on current state
  let variant = 'default';

  if (isRevealed) {
    if (isCorrect) {
      variant = 'correct';
    } else if (isSelected && !isCorrect) {
      variant = 'incorrect';
    }
  } else if (isSelected) {
    variant = 'selected';
  }

  return (
    <motion.button
      className={`song-option song-option--${variant}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <span className="song-option__name">{name}</span>

      {isRevealed && (
        <div className={`song-option__icon song-option__icon--${isCorrect ? 'correct' : 'incorrect'}`}>
          {isCorrect ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}
        </div>
      )}
    </motion.button>
  );
};

export default SongOption;