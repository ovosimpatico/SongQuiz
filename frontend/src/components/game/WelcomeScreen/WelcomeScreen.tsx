import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faGamepad, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { playlistsApi, songsApi } from '../../../services/api';
import { Playlist } from '../../../types/song';
import VinylAnimation from './VinylAnimation';
import { APP_NAME } from '../../../App';
import './WelcomeScreen.scss';

interface WelcomeScreenProps {
  onStart: (numSongs: number, numChoices: number, genres?: string[], playlistId?: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  // Always 10 songs per game
  const NUM_SONGS = 10;
  const NUM_CHOICES = 4;

  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availablePlaylists, setAvailablePlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGenres, setShowGenres] = useState(false);
  const [showPlaylists, setShowPlaylists] = useState(false);

  useEffect(() => {
    // Fetch available genres and playlists when component mounts
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch genres
        const genresData = await songsApi.getGenres();
        setAvailableGenres(Array.isArray(genresData) ? genresData : []);

        // Fetch playlists
        const playlistsData = await playlistsApi.getPlaylists();
        setAvailablePlaylists(playlistsData);

        console.log('Fetched data:', { genres: genresData, playlists: playlistsData }); // Debugging
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGenreClick = (genre: string) => {
    // Clear playlist selection when selecting custom genres
    setSelectedPlaylistId(null);

    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleClearGenres = () => {
    setSelectedGenres([]);
  };

  const handlePlaylistSelect = (playlistId: string) => {
    // Clear genre selection when selecting a playlist
    if (selectedPlaylistId === playlistId) {
      setSelectedPlaylistId(null);
    } else {
      setSelectedPlaylistId(playlistId);
      setSelectedGenres([]);
    }
  };

  const toggleGenreVisibility = () => {
    setShowGenres(!showGenres);
    if (!showGenres) {
      setShowPlaylists(false);
    }
  };

  const togglePlaylistVisibility = () => {
    setShowPlaylists(!showPlaylists);
    if (!showPlaylists) {
      setShowGenres(false);
    }
  };

  const getSelectedPlaylistName = () => {
    if (!selectedPlaylistId) return null;
    const playlist = availablePlaylists.find(p => p.id === selectedPlaylistId);
    return playlist ? playlist.name : null;
  };

  const startGame = () => {
    onStart(
      NUM_SONGS,
      NUM_CHOICES,
      selectedGenres.length > 0 ? selectedGenres : undefined,
      selectedPlaylistId || undefined
    );
  };

  return (
    <div className="welcome-screen">
      <div className="welcome-screen__header">
        <h1 className="welcome-screen__title">{APP_NAME}</h1>
        <VinylAnimation />
      </div>

      <div className="welcome-screen__card-container">
        <div className="welcome-screen__card">
          <div className="welcome-screen__content">
            <div className="welcome-screen__options-section">
              <div>
                <p>
                  Welcome to {APP_NAME}!
                </p>
              </div>

              <div>
                <button
                  className="welcome-screen__toggle-button"
                  onClick={togglePlaylistVisibility}
                >
                  {selectedPlaylistId ?
                    `Playlist: ${getSelectedPlaylistName()}` :
                    'Choose a Playlist'}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: showPlaylists ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <path
                      d="M19 9L12 16L5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {showPlaylists && (
                    <motion.div
                      className="welcome-screen__dropdown-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {!isLoading ? (
                        <div className="welcome-screen__playlist-grid">
                          {availablePlaylists.map((playlist) => (
                            <button
                              key={playlist.id}
                              className={`playlist-item ${selectedPlaylistId === playlist.id ? 'selected' : ''}`}
                              onClick={() => handlePlaylistSelect(playlist.id)}
                            >
                              <div className="playlist-item__title">{playlist.name}</div>
                              <div className="playlist-item__description">{playlist.description}</div>
                            </button>
                          ))}
                          {availablePlaylists.length === 0 && (
                            <div className="no-results">No playlists available</div>
                          )}
                        </div>
                      ) : (
                        <div className="loading">Loading playlists...</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <button
                  className="welcome-screen__toggle-button"
                  onClick={toggleGenreVisibility}
                  disabled={!!selectedPlaylistId}
                >
                  {selectedGenres.length > 0 ?
                    `${selectedGenres.length} genre${selectedGenres.length !== 1 ? 's' : ''} selected` :
                    'Or Select Custom Genres'}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{
                      transform: showGenres ? 'rotate(180deg)' : 'rotate(0)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <path
                      d="M19 9L12 16L5 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <AnimatePresence>
                  {showGenres && (
                    <motion.div
                      className="welcome-screen__dropdown-panel"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {!isLoading ? (
                        <>
                          <div className="welcome-screen__genre-grid">
                            {availableGenres.map((genre) => (
                              <button
                                key={genre}
                                className={`genre-chip ${selectedGenres.includes(genre) ? 'selected' : ''}`}
                                onClick={() => handleGenreClick(genre)}
                              >
                                {genre}
                              </button>
                            ))}
                          </div>
                          <div className="welcome-screen__selected-genres">
                            <span>
                              {selectedGenres.length === 0
                                ? 'No genres selected (all genres will be included)'
                                : `${selectedGenres.length} genre${selectedGenres.length !== 1 ? 's' : ''} selected`}
                            </span>
                            {selectedGenres.length > 0 && (
                              <button
                                className="welcome-screen__clear-genres"
                                onClick={handleClearGenres}
                              >
                                Clear all
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="loading">Loading genres...</div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              className="welcome-screen__start-button"
              onClick={startGame}
            >
              START GAME
            </button>

            <div className="welcome-screen__instructions">
              <h3 className="welcome-screen__label">How to play</h3>
              <p><FontAwesomeIcon icon={faMusic} /> Listen to a clip and guess the song</p>
              <p><FontAwesomeIcon icon={faGamepad} /> Each song has 4 different options to choose from</p>
              <p><FontAwesomeIcon icon={faTrophy} /> Try to get the highest score possible!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;