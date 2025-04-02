export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
}

export interface GameQuestion {
  correctSong: Song;
  options: Song[];
}

export interface GameSettings {
  numSongs: number;
  numChoices: number;
  genres?: string[];  // Optional list of genres to filter songs
  playlist_id?: string; // Optional playlist ID for predefined filters
  start_year?: number; // Optional start year for filtering
  end_year?: number; // Optional end year for filtering
}

export interface GameSummaryType {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface GameState {
  questions: GameQuestion[];
  currentQuestionIndex: number;
  score: number;
  correctAnswers: number;
  loading: boolean;
  error: string | null;
}

export interface GameOption {
  song_id: number;
  name: string;
  is_correct: boolean;
}

export interface GameSession {
  session_id: string;
  questions: GameQuestion[];
  current_question: number;
  score: number;
  total_questions: number;
  started_at: number;
}

export interface GameResponse {
  session_id: string;
  current_question: number;
  total_questions: number;
  question: GameQuestion;
  score: number;
  time_remaining: number | null;
}

export interface AnswerRequest {
  session_id: string;
  question_index: number;
  selected_option_index: number;
}

export interface AnswerResponse {
  correct: boolean;
  correct_option_index: number;
  score: number;
  next_question_index: number | null;
  game_complete: boolean;
}

export interface GameSummary {
  session_id: string;
  score: number;
  total_questions: number;
  accuracy: number;
}

// Backend API types
export interface ApiSong {
  SongId: number;
  Name: string;
  Artists: string;
  CoverSmall?: string;
  CoverMedium?: string;
  CoverBig?: string;
  CoverXL?: string;
  DeezerID?: number;
  DeezerURL?: string;
  AlbumName?: string;
}

export interface ApiGameOption {
  song_id: number;
  name: string;
  is_correct: boolean;
}

export interface ApiGameQuestion {
  song_id: number;
  preview_url: string;
  blurred_cover_url: string;
  clear_cover_url: string;
  correct_option_index: number;
  options: ApiGameOption[];
  time_limit: number;
  song_color: string;
  artists: string;
}

export interface ApiGameSession {
  session_id: string;
  questions: ApiGameQuestion[];
  current_question: number;
  score: number;
  total_questions: number;
  started_at: number;
}

export interface ApiGameResponse {
  session_id: string;
  current_question: number;
  total_questions: number;
  question: ApiGameQuestion;
  score: number;
  time_remaining?: number;
}

export interface ApiAnswerRequest {
  session_id: string;
  question_index: number;
  selected_option_index: number;
}

export interface ApiAnswerResponse {
  correct: boolean;
  correct_option_index: number;
  score: number;
  next_question_index?: number;
  game_complete: boolean;
  points_earned: number;
}

export interface ApiGameSummary {
  session_id: string;
  score: number;
  total_questions: number;
  accuracy: number;
}

export interface ApiGameSettings {
  num_songs: number;
  num_choices: number;
  genres?: string[];  // Optional list of genres to filter songs
  playlist_id?: string; // Optional playlist ID for predefined filters
  start_year?: number; // Optional start year for filtering
  end_year?: number; // Optional end year for filtering
}

// Mapping functions to convert between API and frontend types
export const mapApiSongToSong = (apiSong: ApiSong): Song => ({
  id: apiSong.SongId.toString(),
  title: apiSong.Name,
  artist: apiSong.Artists,
  coverUrl: apiSong.CoverMedium || apiSong.CoverBig || apiSong.CoverXL || apiSong.CoverSmall || '',
  audioUrl: apiSong.DeezerURL || '',
});

export const mapApiGameSummaryToGameSummary = (apiSummary: ApiGameSummary): GameSummaryType => ({
  score: apiSummary.score,
  totalQuestions: apiSummary.total_questions,
  correctAnswers: Math.round(apiSummary.accuracy * apiSummary.total_questions / 100),
  accuracy: apiSummary.accuracy,
});