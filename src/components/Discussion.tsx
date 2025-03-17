import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { Timer } from './Timer';

export const Discussion: React.FC = () => {
  const { state, dispatch } = useGame();
  const { language, translations } = useLanguage();
  const [message, setMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add message to the chat
    dispatch({
      type: 'SEND_MESSAGE',
      playerId: 'current-player-id', // In a real app, this would come from auth
      message: message.trim(),
    });
    
    setMessage('');
  };

  if (state.currentPhase !== 'discussion') {
    return null;
  }

  return (
    <div className="discussion-container">
      <div className="phase-header">
        <h2>Discussion Phase</h2>
        <Timer />
      </div>

      <div className="answers-section">
        <h3>{translations[language].everyoneAnswers}</h3>
        <div className="answers-grid">
          {Object.entries(state.answers).map(([playerId, answer]) => {
            const player = state.players.find(p => p.id === playerId);
            return (
              <div key={playerId} className="answer-cube">
                <div className="player-name">{player?.name || translations[language].unknownPlayer}</div>
                <div className="answer-number">{answer}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="chat-section">
        <div className="messages-container">
          {state.chatMessages.map((msg, index) => {
            const player = state.players.find(p => p.id === msg.playerId);
            return (
              <div key={index} className="chat-message">
                <strong>{player?.name || translations[language].unknownPlayer}:</strong>
                <span>{msg.message}</span>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} className="message-form">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={translations[language].typeMessage}
            className="message-input"
          />
          <button 
            type="submit"
            className="send-message-btn"
            disabled={!message.trim()}
          >
            {translations[language].sendMessage}
          </button>
        </form>
      </div>
    </div>
  );
};