import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { Timer } from './Timer';

export const Question: React.FC = () => {
  const { state, dispatch } = useGame();
  const { language, translations } = useLanguage();
  const [answer, setAnswer] = useState<number | ''>('');
  
  // Get the current player to check if they're an impostor
  const currentPlayerId = 'current-player-id';
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);
  
  // Check if the current player has already submitted an answer
  const hasSubmittedAnswer = Object.keys(state.answers).includes(currentPlayerId);
  const submittedAnswer = state.answers[currentPlayerId];
  
  // Check if the current player is eliminated (for Deathmatch mode)
  const isEliminated = !currentPlayer?.isAlive;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer === '' || !state.question) return;

    // In a real implementation, we would get the player's ID from authentication
    // For now, we'll use a placeholder
    const playerId = 'current-player-id';
    dispatch({
      type: 'SUBMIT_ANSWER',
      playerId,
      answer: answer.toString(),
    });

    // No need to reset the answer state as we'll show a confirmation message instead
  };

  if (!state.question || state.currentPhase !== 'number_input') {
    return null;
  }

  return (
    <div className="question-container">
      <div className="phase-header">
        <h2>{translations[language].numberInputPhase}</h2>
        <Timer />
      </div>
      {currentPlayer?.isImpostor ? (
        <h3 className="question-text">{translations[language].enterNumber}</h3>
      ) : (
        <h3 className="question-text">{state.question}</h3>
      )}
      
      {isEliminated && state.gameMode === 'deathmatch' ? (
        <div className="spectator-message">
          <h3>{translations[language].eliminated || "You have been eliminated"}</h3>
          <p>{translations[language].spectating || "You are now spectating the game"}</p>
        </div>
      ) : hasSubmittedAnswer ? (
        <div className="answer-confirmation">
          <h3>{translations[language].yourAnswer} {submittedAnswer}</h3>
          <p>{translations[language].waitingForPlayers}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="answer-form">
          <input
            type="number"
            value={answer}
            onChange={(e) => setAnswer(e.target.value ? Number(e.target.value) : '')}
            placeholder={translations[language].enterAnswerPlaceholder}
            className="answer-input"
            min="0"
            step="1"
          />
          <button 
            type="submit" 
            className="submit-answer-btn"
            disabled={answer === ''}
          >
            {translations[language].submit}
          </button>
        </form>
      )}
    </div>
  );
};