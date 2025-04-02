import { useState, useEffect, useRef, useCallback } from 'react';

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  currentTime: number;
  error: string | null;
}

interface AudioControls {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  setVolume: (volume: number) => void;
  seek: (time: number) => void;
  stop: () => void;
}

/**
 * Custom hook for controlling audio playback
 * @param url The URL of the audio file to play
 * @returns [AudioState, AudioControls]
 */
const useAudioPlayer = (url: string): [AudioState, AudioControls] => {
  // Create a single audio element instance
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // State to track audio playback
  const [audioState, setAudioState] = useState<AudioState>({
    isPlaying: false,
    isLoading: true,
    duration: 0,
    currentTime: 0,
    error: null,
  });

  // Initialize or update audio element when URL changes
  useEffect(() => {
    // Clean up previous instance
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    }

    if (!url) {
      setAudioState(prev => ({
        ...prev,
        isLoading: false,
        isPlaying: false,
        error: null,
      }));
      return;
    }

    // Create new audio element if needed
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const audio = audioRef.current;

    // Set new source
    audio.src = url;
    audio.load();

    // Reset state for new track
    setAudioState({
      isPlaying: false,
      isLoading: true,
      duration: 0,
      currentTime: 0,
      error: null,
    });

    // Setup event listeners
    const onLoadedMetadata = () => {
      setAudioState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const onTimeUpdate = () => {
      setAudioState(prev => ({
        ...prev,
        currentTime: audio.currentTime,
      }));
    };

    const onEnded = () => {
      setAudioState(prev => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
      }));
    };

    const onError = () => {
      setAudioState(prev => ({
        ...prev,
        error: 'Failed to load audio',
        isLoading: false,
      }));
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    // Cleanup function
    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [url]);

  // Audio control functions
  const play = useCallback(() => {
    if (!audioRef.current) return;

    const playPromise = audioRef.current.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setAudioState(prev => ({ ...prev, isPlaying: true }));
        })
        .catch(error => {
          console.error('Playback error:', error);
          setAudioState(prev => ({
            ...prev,
            error: 'Failed to play audio',
            isPlaying: false,
          }));
        });
    }
  }, []);

  const pause = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    setAudioState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const toggle = useCallback(() => {
    if (audioState.isPlaying) {
      pause();
    } else {
      play();
    }
  }, [audioState.isPlaying, pause, play]);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = Math.max(0, Math.min(1, volume));
  }, []);

  const seek = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration || 0));
    setAudioState(prev => ({ ...prev, currentTime: audioRef.current?.currentTime || 0 }));
  }, []);

  const stop = useCallback(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setAudioState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
    }));
  }, []);

  // Return audio state and controls
  return [
    audioState,
    {
      play,
      pause,
      toggle,
      setVolume,
      seek,
      stop,
    },
  ];
};

export default useAudioPlayer;