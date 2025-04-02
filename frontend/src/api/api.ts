import axios from 'axios';
import {
  Song,
  GameSettings,
  GameSession,
  GameResponse,
  AnswerRequest,
  AnswerResponse,
  GameSummary
} from '../types/game';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Song API
export const getSongs = async (limit = 20, offset = 0): Promise<Song[]> => {
  const response = await api.get(`/songs?limit=${limit}&offset=${offset}`);
  return response.data;
};

export const getSongCount = async (): Promise<number> => {
  const response = await api.get('/songs/count');
  return response.data.count;
};

export const getGenres = async (): Promise<string[]> => {
  const response = await api.get('/songs/genres');
  return response.data;
};

export const getSongById = async (songId: number): Promise<Song> => {
  const response = await api.get(`/songs/${songId}`);
  return response.data;
};

export const getRandomSongs = async (count = 5): Promise<Song[]> => {
  const response = await api.get(`/songs/random?count=${count}`);
  return response.data;
};

// Game API
export const createGame = async (settings: GameSettings): Promise<GameSession> => {
  // Map frontend settings to API settings format
  const apiSettings = {
    num_songs: settings.numSongs,
    num_choices: settings.numChoices,
    genres: settings.genres
  };

  console.log('Creating game with settings:', apiSettings);

  const response = await api.post('/game/create', apiSettings);
  return response.data;
};

export const startGame = async (sessionId: string): Promise<GameResponse> => {
  const response = await api.post(`/game/start/${sessionId}`);
  return response.data;
};

export const getGameState = async (sessionId: string): Promise<GameResponse> => {
  const response = await api.get(`/game/state/${sessionId}`);
  return response.data;
};

export const answerQuestion = async (answerRequest: AnswerRequest): Promise<AnswerResponse> => {
  const response = await api.post('/game/answer', answerRequest);
  return response.data;
};

export const getGameSummary = async (sessionId: string): Promise<GameSummary> => {
  const response = await api.get(`/game/summary/${sessionId}`);
  return response.data;
};

// Preview API
export const getAudioPreview = async (songId: number): Promise<string> => {
  const response = await api.get(`/preview/audio/${songId}`);
  return response.data.preview_url;
};

export const getBlurredCover = async (songId: number, blurLevel = 10): Promise<{
  blurred_url: string;
  original_url: string;
  blur_level: number;
}> => {
  const response = await api.get(`/preview/cover/${songId}?blur_level=${blurLevel}`);
  return response.data;
};