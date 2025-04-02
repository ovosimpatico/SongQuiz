import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import AppLayout from './components/layout/AppLayout';
import WelcomeScreen from './components/game/WelcomeScreen';
import GameScreen from './components/game/GameScreen';
import DynamicTheme from './components/DynamicTheme';
import { GameSettings } from './types/game';
import './App.scss';

// App name centralized here for easy updates
export const APP_NAME = 'Ovo Quiz';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'welcome' | 'playing'>('welcome');
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    numSongs: 5,
    numChoices: 4
  });

  const handleStartGame = (numSongs: number, numChoices: number, genres?: string[], playlistId?: string) => {
    setGameSettings({ numSongs, numChoices, genres, playlist_id: playlistId });
    setGameState('playing');
  };

  const handleExitGame = () => {
    setGameState('welcome');
  };

  return (
    <AppLayout background={gameState === 'welcome' ? 'gradient' : 'default'}>
      <DynamicTheme />
      <div className="app-container">
        <AnimatePresence mode="wait">
          {gameState === 'welcome' && (
            <WelcomeScreen key="welcome" onStart={handleStartGame} />
          )}
          {gameState === 'playing' && (
            <GameScreen
              key="game"
              settings={gameSettings}
              onExit={handleExitGame}
            />
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default App;
