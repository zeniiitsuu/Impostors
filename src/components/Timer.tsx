import React, { useEffect } from 'react';
import { useGame } from '../context/GameContext';
import './Timer.css';

export const Timer: React.FC = () => {
  const { state, dispatch } = useGame();

  useEffect(() => {
    if (state.timeRemaining <= 0) return;

    const timer = setInterval(() => {
      dispatch({ type: 'UPDATE_TIMER', time: state.timeRemaining - 1 });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.timeRemaining, dispatch]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="timer">
      {state.timeRemaining > 0 && (
        <div className="time-display">
          {formatTime(state.timeRemaining)}
        </div>
      )}
    </div>
  );
};