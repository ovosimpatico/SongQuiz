import { useState, useEffect, useRef, useCallback } from 'react';

interface TimerState {
  timeLeft: number;
  progress: number;
  isRunning: boolean;
}

interface TimerControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
  restart: () => void;
}

interface TimerOptions {
  autoStart?: boolean;
  interval?: number;
}

/**
 * Custom hook for creating a countdown timer
 * @param duration Duration in seconds
 * @param onComplete Callback when timer completes
 * @param options Timer options
 * @returns [TimerState, TimerControls]
 */
const useTimer = (
  duration: number,
  onComplete?: () => void,
  options: TimerOptions = {}
): [TimerState, TimerControls] => {
  const { autoStart = true, interval = 100 } = options;

  // State to track timer
  const [state, setState] = useState<TimerState>({
    timeLeft: duration,
    progress: 100,
    isRunning: autoStart,
  });

  // Refs to prevent stale closures in setInterval
  const timeLeftRef = useRef<number>(duration);
  const isRunningRef = useRef<boolean>(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef<(() => void) | undefined>(onComplete);

  // Update ref when callback changes
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Main timer logic
  const setupTimer = useCallback(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only set up if timer should be running
    if (!isRunningRef.current) return;

    // Set up new interval
    intervalRef.current = setInterval(() => {
      // Decrease time left
      timeLeftRef.current = Math.max(0, timeLeftRef.current - (interval / 1000));

      // Calculate progress percentage
      const progressValue = (timeLeftRef.current / duration) * 100;

      // Update state
      setState({
        timeLeft: timeLeftRef.current,
        progress: progressValue,
        isRunning: timeLeftRef.current > 0 && isRunningRef.current,
      });

      // Check if timer completed
      if (timeLeftRef.current <= 0) {
        // Stop the timer
        isRunningRef.current = false;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Call completion callback
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, interval);
  }, [duration, interval]);

  // Set up timer when running state changes
  useEffect(() => {
    timeLeftRef.current = state.timeLeft;
    isRunningRef.current = state.isRunning;

    if (state.isRunning) {
      setupTimer();
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isRunning, state.timeLeft, setupTimer]);

  // Initialize timer when duration changes
  useEffect(() => {
    // Reset state
    timeLeftRef.current = duration;
    setState({
      timeLeft: duration,
      progress: 100,
      isRunning: autoStart,
    });
    isRunningRef.current = autoStart;

    // Set up timer if auto-start is enabled
    if (autoStart) {
      setupTimer();
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [duration, autoStart, setupTimer]);

  // Timer control functions
  const start = useCallback(() => {
    if (state.isRunning || state.timeLeft <= 0) return;

    isRunningRef.current = true;
    setState(prev => ({ ...prev, isRunning: true }));
  }, [state.isRunning, state.timeLeft]);

  const pause = useCallback(() => {
    if (!state.isRunning) return;

    isRunningRef.current = false;
    setState(prev => ({ ...prev, isRunning: false }));
  }, [state.isRunning]);

  const reset = useCallback(() => {
    timeLeftRef.current = duration;
    isRunningRef.current = false;

    setState({
      timeLeft: duration,
      progress: 100,
      isRunning: false,
    });
  }, [duration]);

  const restart = useCallback(() => {
    timeLeftRef.current = duration;
    isRunningRef.current = true;

    setState({
      timeLeft: duration,
      progress: 100,
      isRunning: true,
    });
  }, [duration]);

  return [
    state,
    {
      start,
      pause,
      reset,
      restart,
    },
  ];
};

export default useTimer;