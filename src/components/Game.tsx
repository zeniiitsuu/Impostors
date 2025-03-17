import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useGame } from '../context/GameContext';
import { Question } from './Question';
import { Discussion } from './Discussion';
import { Voting } from './Voting';
import { Results } from './Results';
import { Timer } from './Timer';
import { createBot, generateBotAnswer, getBotVote, isBot } from '../utils/botManager';
import './Game.css';

export const Game: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { state, dispatch } = useGame();
  const { language, translations } = useLanguage();
  const navigate = useNavigate();
  const [currentPlayerId] = useState('current-player-id');
  const [showInviteLink, setShowInviteLink] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [isHost] = useState(true); // Assuming the current player is the host for demonstration purposes

  // Set the roomId in the game state when component mounts
  useEffect(() => {
    if (roomId && (!state.roomId || state.roomId !== roomId)) {
      // Log the current game mode from state
      console.log('Current game mode in state:', state.gameMode);
      
      // Set the roomId and initialize the game state
      dispatch({ 
        type: 'START_GAME', 
        roomId,
        roomName: state.roomName || `Game Room`,
        playerLimit: state.playerLimit || 10,
        gameMode: state.gameMode || 'quickplay'
      });
      // Ensure we're in lobby phase
      dispatch({ type: 'SET_PHASE', phase: 'lobby' });
      
      // Log after dispatch to verify
      console.log('Game mode after initialization:', state.gameMode);
    }
  }, [roomId, state.roomId, state.roomName, state.playerLimit, state.gameMode, dispatch]);

  const handleAddBot = () => {
    const bot = createBot();
    dispatch({ type: 'JOIN_GAME', player: bot });
  };

  const handleInvite = () => {
    setShowInviteLink(!showInviteLink);
  };

  const copyInviteLink = async () => {
    try {
      const inviteLink = `${window.location.origin}/room/${state.roomId}`;
      await navigator.clipboard.writeText(inviteLink);
      alert(translations[language].inviteLinkCopied);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleStartGame = () => {
    if (state.players.length < 3) return;
    
    const numberQuestion = getNumberQuestion();
    
    // Reset all players to non-impostors first
    const updatedPlayers = state.players.map(player => ({
      ...player,
      isImpostor: false,
      isAlive: true,
      hasVoted: false
    }));
    
    // Randomly select one player as impostor
    const impostorIndex = Math.floor(Math.random() * updatedPlayers.length);
    updatedPlayers[impostorIndex].isImpostor = true;
    
    // Update all players at once
    dispatch({ type: 'UPDATE_PLAYERS', players: updatedPlayers });
    
    // Set question and move to role reveal
    dispatch({ type: 'SET_QUESTION', question: numberQuestion });
    dispatch({ type: 'SET_PHASE', phase: 'role_reveal' });
  };

  const getNumberQuestion = () => {
    const questions = translations[language].gameQuestions;
    const questionKeys = Object.keys(questions);
    const randomKey = questionKeys[Math.floor(Math.random() * questionKeys.length)];
    return questions[randomKey];
  };

  const numberQuestion = getNumberQuestion();

  // Handle bot actions
  useEffect(() => {
    // Handle bot answers in number input phase
    if (state.currentPhase === 'number_input') {
      state.players.forEach(player => {
        if (isBot(player.id) && !state.answers[player.id]) {
          // Generate a random number between 1 and 100 for bot answers
          const botAnswer = Math.floor(Math.random() * 100) + 1;
          setTimeout(() => {
            dispatch({
              type: 'SUBMIT_ANSWER',
              playerId: player.id,
              answer: botAnswer.toString()
            });
          }, Math.random() * 5000 + 1000); // Random delay between 1-6 seconds
        }
      });
    }
    
    // Handle bot votes in voting phase
    if (state.currentPhase === 'voting') {
      state.players.forEach(player => {
        if (isBot(player.id) && player.isAlive && !Object.keys(state.votes).includes(player.id)) {
          setTimeout(() => {
            const targetId = getBotVote(player.id, state.players);
            if (targetId) {
              dispatch({
                type: 'SUBMIT_VOTE',
                voterId: player.id,
                targetId
              });
            }
          }, Math.random() * 10000 + 2000); // Random delay between 2-12 seconds
        }
      });
    }
  }, [state.currentPhase, state.players, state.answers, state.votes, dispatch]);

  // Handle phase transitions
  useEffect(() => {
    if (state.timeRemaining === 0 && state.currentPhase !== 'lobby') {
      // Move to the next phase when timer expires
      const phases: Array<'lobby' | 'role_reveal' | 'number_input' | 'discussion' | 'voting' | 'results'> = [
        'lobby',
        'role_reveal',
        'number_input',
        'discussion',
        'voting',
        'results'
      ];
      
      // Force transition from role_reveal to number_input when timer hits zero
      if (state.currentPhase === 'role_reveal') {
        console.log('Timer reached zero in role_reveal, transitioning to number_input');
        dispatch({ type: 'SET_PHASE', phase: 'number_input' });
      } else if (state.currentPhase === 'number_input') {
        // If timer runs out and not all players have submitted, force transition anyway
        dispatch({ type: 'REVEAL_ANSWERS' });
      } else if (state.currentPhase === 'discussion') {
        dispatch({ type: 'SET_PHASE', phase: 'voting' });
      } else if (state.currentPhase === 'voting') {
        dispatch({ type: 'SET_PHASE', phase: 'results' });
      } else if (state.currentPhase === 'results') {
        // Do nothing - we'll stay in results until player clicks "Return to Lobby"
        // This prevents automatic transition to a new round
      }
    }
  }, [state.timeRemaining, state.currentPhase, dispatch]);

  // Handle automatic transition when all players have submitted answers
  useEffect(() => {
    if (state.currentPhase === 'number_input' && 
        Object.keys(state.answers).length === state.players.length) {
      // Force transition to discussion phase regardless of timer
      console.log('All players submitted answers, transitioning to discussion phase');
      dispatch({ type: 'REVEAL_ANSWERS' });
    }
  }, [state.answers, state.players.length, state.currentPhase, dispatch]);

  if (!state.roomId) {
    return null;
  }

  // Find the current player
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);

  const handleExitButtonClick = () => {
    setShowExitConfirmation(true);
  };

  const handleConfirmExit = () => {
    if (isHost) {
      // If host is leaving, notify all players that the room is closed
      // In a real implementation, this would be done through a server
      alert(translations[language].lobbyClosedByHost);
    }
    // Clear game state
    dispatch({ type: 'CLEAR_GAME' });
    // Navigate back to main menu
    navigate('/');
  };

  const handleCancelExit = () => {
    setShowExitConfirmation(false);
  };

  return (
    <div className="game-container">
      {state.currentPhase === 'lobby' ? (
        // Lobby Phase - Original layout with players at the top
        <div className="lobby-phase">
          <div className="game-header">
            <h1>{state.roomName || `Room: ${state.roomId}`}</h1>
            <p className="room-info">{translations[language].playerLimit}: {state.playerLimit || 10}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={handleAddBot}
                className="add-bot-btn"
              >
                {translations[language].addBot}
              </button>
              <button 
                onClick={handleInvite}
                className="invite-btn"
              >
                {translations[language].invitePlayers}
              </button>
              <button 
                onClick={handleStartGame}
                className="start-game-btn"
                disabled={state.players.length < 3}
              >
                {translations[language].startGame}
              </button>
            </div>
            
            {showInviteLink && (
              <div className="invite-link-container" style={{ marginTop: '1rem', textAlign: 'center' }}>
                <p>{translations[language].shareLink}</p>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    value={`${window.location.origin}/room/${state.roomId}`} 
                    readOnly 
                    style={{ padding: '0.5rem', width: '60%', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <button 
                    onClick={copyInviteLink}
                    style={{ padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    {translations[language].copyLink}
                  </button>
                </div>
              </div>
            )}
            
            <div className="players-info">
              <h3>{translations[language].players}:</h3>
              <div className="players-list">
                {state.players.map(player => (
                  <div 
                    key={player.id} 
                    className={`player-item ${!player.isAlive ? 'eliminated' : ''}`}
                  >
                    {player.name}
                    {!player.isAlive && ` (${translations[language].eliminated})`}
                    {player.id === currentPlayerId && ` (${translations[language].you})`}
                    {state.currentPhase !== 'lobby' && state.currentPhase !== 'role_reveal' && player.isImpostor && !player.isAlive && ` (${translations[language].impostor})`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Game Phases - Restructured layout with game phase as the focus
        <div className="game-phase">
          <div className="game-content">
            {state.currentPhase === 'role_reveal' && (
              <div className="role-reveal-container">
                <div className="phase-header">
                  <h2>{translations[language].roleReveal}</h2>
                  <Timer />
                </div>
                <div className="role-info">
                  {currentPlayer?.isImpostor ? (
                    <>
                      <h3>{translations[language].youAreImpostor}</h3>
                      <p>{translations[language].tryToBlendIn}</p>
                      <p>{translations[language].makeUpAnswer}</p>
                    </>
                  ) : (
                    <>
                      <h3>{translations[language].youAreNotImpostor}</h3>
                      <p>{translations[language].question}: {state.question}</p>
                      <p>{translations[language].answerHonestly}</p>
                    </>
                  )}
                </div>
              </div>
            )}
            {state.currentPhase === 'number_input' && <Question />}
            {state.currentPhase === 'discussion' && <Discussion />}
            {state.currentPhase === 'voting' && <Voting />}
            {state.currentPhase === 'results' && <Results />}
          </div>
          
          <div className="game-header secondary">
            <h3>Room: {state.roomName || state.roomId}</h3>
            <div className="players-info compact">
              <h4>Players:</h4>
              <div className="players-list">
                {state.players.map(player => (
                  <div 
                    key={player.id} 
                    className={`player-item ${!player.isAlive ? 'eliminated' : ''}`}
                  >
                    {player.name}
                    {!player.isAlive && ` (${translations[language].eliminated})`}
                    {player.id === currentPlayerId && ` (${translations[language].you})`}
                    {state.currentPhase !== 'lobby' && state.currentPhase !== 'role_reveal' && player.isImpostor && !player.isAlive && ` (${translations[language].impostor})`}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Exit Button */}
      <div className="exit-button-container">
        <button 
          className="exit-button" 
          onClick={handleExitButtonClick}
        >
          {translations[language].exitRoom}
        </button>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <div className="confirmation-dialog-overlay">
          <div className="confirmation-dialog">
            <p>{translations[language].confirmExit}</p>
            {isHost && (
              <p className="warning-text">{translations[language].lobbyClosedWarning}</p>
            )}
            <div className="confirmation-buttons">
              <button 
                className="confirm-button" 
                onClick={handleConfirmExit}
              >
                {translations[language].yes}
              </button>
              <button 
                className="cancel-button" 
                onClick={handleCancelExit}
              >
                {translations[language].no}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};