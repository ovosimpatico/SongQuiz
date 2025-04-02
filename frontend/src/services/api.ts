import axios from 'axios';
import { Playlist } from '../types/song';

// Create axios instance with base URL
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Game API
export const gameApi = {
  // Create a new game session
  createGame: async (settings: { numSongs: number; numChoices: number; genres?: string[]; playlist_id?: string; start_year?: number; end_year?: number }) => {
    console.log('Creating game with settings:', settings); // Debug log
    const response = await api.post('/game/create', {
      num_songs: settings.numSongs,
      num_choices: settings.numChoices,
      genres: settings.genres,
      playlist_id: settings.playlist_id,
      start_year: settings.start_year,
      end_year: settings.end_year
    });
    return response.data;
  },

  // Start a game session
  startGame: async (sessionId: string) => {
    const response = await api.post(`/game/start/${sessionId}`);
    return response.data;
  },

  // Get the current state of a game
  getGameState: async (sessionId: string) => {
    const response = await api.get(`/game/state/${sessionId}`);
    return response.data;
  },

  // Submit an answer to a question
  answerQuestion: async (sessionId: string, questionIndex: number, selectedOptionIndex: number) => {
    const response = await api.post('/game/answer', {
      session_id: sessionId,
      question_index: questionIndex,
      selected_option_index: selectedOptionIndex,
    });
    return response.data;
  },

  // Get a summary of a completed game
  getGameSummary: async (sessionId: string) => {
    const response = await api.get(`/game/summary/${sessionId}`);
    return response.data;
  },
};

// Songs API
export const songsApi = {
  // Get a list of songs
  getSongs: async (limit = 20, offset = 0) => {
    const response = await api.get('/songs', {
      params: { limit, offset },
    });
    return response.data;
  },

  // Get the total number of songs
  getSongCount: async () => {
    const response = await api.get('/songs/count');
    return response.data.count;
  },

  // Get available genres
  getGenres: async () => {
    const response = await api.get('/songs/genres');
    return response.data;
  },

  // Get a song by ID
  getSong: async (songId: number) => {
    const response = await api.get(`/songs/${songId}`);
    return response.data;
  },

  // Get random songs
  getRandomSongs: async (count = 5) => {
    const response = await api.get('/songs/random', {
      params: { count },
    });
    return response.data;
  },
};

// Preview API
export const previewApi = {
  // Get audio preview URL for a song
  getAudioPreview: async (songId: number) => {
    const response = await api.get(`/preview/audio/${songId}`);
    return response.data.preview_url;
  },

  // Get blurred cover image for a song
  getBlurredCover: async (songId: number, blurLevel = 10) => {
    const response = await api.get(`/preview/cover/${songId}`, {
      params: { blur_level: blurLevel },
    });
    return response.data;
  },
};

// Playlists API
export const playlistsApi = {
  // Get all available playlists
  getPlaylists: async (): Promise<Playlist[]> => {
    const response = await api.get('/playlists');
    return response.data;
  },

  // Get a playlist by ID
  getPlaylist: async (playlistId: string): Promise<Playlist> => {
    const response = await api.get(`/playlists/${playlistId}`);
    return response.data;
  },
};

export default {
  game: gameApi,
  songs: songsApi,
  preview: previewApi,
  playlists: playlistsApi,
};