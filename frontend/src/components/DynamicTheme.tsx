import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DynamicTheme: React.FC = () => {
  const { songColor, getColorRgb, getLighterColor } = useTheme();
  const { r, g, b } = getColorRgb();

  // Create CSS variables for different shades and opacities
  const variables = {
    '--accent-color': `#${songColor}`,
    '--accent-rgb': `${r}, ${g}, ${b}`,
    '--accent-light': getLighterColor(0.2),
    '--accent-glow': `0 0 20px rgba(${r}, ${g}, ${b}, 0.4)`,
    '--accent-border': `rgba(${r}, ${g}, ${b}, 0.7)`,
  };

  // Generate CSS string
  const cssVariables = Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n');

  return (
    <style>
      {`
        :root {
          ${cssVariables}
        }

        /* Keep background consistent, only use accent for specific elements */
        .game-screen {
          /* No background - let parent background show through */
        }

        /* Subtle accent elements */
        .timer-bar .timer-progress {
          background: linear-gradient(90deg, var(--accent-color), var(--accent-light));
        }

        .volume-slider::-webkit-slider-thumb {
          background: var(--accent-color);
        }

        .volume-slider::-moz-range-thumb {
          background: var(--accent-color);
        }

        /* Make the cover image glow with the song color */
        .cover-image {
          box-shadow: var(--accent-glow);
          border: 1px solid var(--accent-border);
        }

        /* Play status indicator */
        .play-status {
          color: var(--accent-color);
          background-color: rgba(var(--accent-rgb), 0.1);
          border: 1px solid rgba(var(--accent-rgb), 0.2);
        }

        /* Selected option highlight */
        .option-button.selected {
          border-color: var(--accent-color);
          box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.3);
        }

        /* Score display */
        .game-header .score-display span {
          border: 1px solid rgba(var(--accent-rgb), 0.5);
        }

        /* Next button accent */
        .next-button {
          border-bottom: 3px solid var(--accent-color);
        }

        /* Final score container subtle accent */
        .final-score-container {
          border: 4px solid rgba(var(--accent-rgb), 0.4);
          box-shadow: 0 0 30px rgba(var(--accent-rgb), 0.2);
        }

        .final-score-container .score-value {
          color: var(--accent-color);
        }

        /* Keep glass effects consistent */
        .question-container, .game-header, .game-summary {
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
      `}
    </style>
  );
};

export default DynamicTheme;