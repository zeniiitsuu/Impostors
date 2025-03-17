import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { Timer } from './Timer';
import './Results.css';

export const Results: React.FC = () => {
  const { state, dispatch } = useGame();
  const { language, translations } = useLanguage();
  const currentPlayerId = 'current-player-id';
  
  // State for tie-breaking animation
  const [showTieBreaker, setShowTieBreaker] = useState(false);
  const [tiedPlayers, setTiedPlayers] = useState<Array<{id: string, name: string}>>([]);
  const [selectedTiePlayer, setSelectedTiePlayer] = useState<string | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  
  // Determine the most voted player
  const voteCounts: Record<string, number> = {};
  Object.values(state.votes).forEach(targetId => {
    voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
  });
  
  // Find players with the highest votes
  let highestVotes = 0;
  let playersWithHighestVotes: string[] = [];
  
  Object.entries(voteCounts).forEach(([playerId, count]) => {
    if (count > highestVotes) {
      highestVotes = count;
      playersWithHighestVotes = [playerId];
    } else if (count === highestVotes) {
      playersWithHighestVotes.push(playerId);
    }
  });
  
  // Determine if there's a tie
  const isTie = playersWithHighestVotes.length > 1 && highestVotes > 0;
  
  // Get the most voted player (either from tie-breaker or direct vote)
  const mostVotedPlayerId = selectedTiePlayer || (playersWithHighestVotes.length === 1 ? playersWithHighestVotes[0] : null);
  
  const eliminatedPlayer = state.players.find(p => p.id === mostVotedPlayerId);
  const impostorPlayer = state.players.find(p => p.isImpostor);
  
  // Add a flag to track if we should allow returning to lobby
  const canReturnToLobby = !showTieBreaker || animationComplete;
  
  // Determine if players won or lost
  const isCorrectGuess = eliminatedPlayer?.isImpostor === true;
  const isCurrentPlayerImpostor = state.players.find(p => p.id === currentPlayerId)?.isImpostor;
  
  // Determine win/loss message
  const getResultMessage = () => {
    if (!eliminatedPlayer) {
      // If there's a tie but no elimination, we still need to return to lobby
      return "No one was eliminated";
    }
    
    if (isCurrentPlayerImpostor) {
      return isCorrectGuess 
        ? "You were caught! The crew wins!" 
        : "You escaped! Impostors win!";
    } else {
      return isCorrectGuess 
        ? "You caught the impostor! The crew wins!" 
        : "You eliminated the wrong person! Impostors win!";
    }
  };
  
  // Handle tie-breaking completion
  useEffect(() => {
    if (animationComplete && selectedTiePlayer) {
      // For Deathmatch mode, add a message when a non-impostor is eliminated
      const isImpostor = state.players.find(p => p.id === selectedTiePlayer)?.isImpostor;
      const eliminationMessage = !isImpostor && state.gameMode === 'deathmatch' 
        ? "Player was kicked... He was not the impostor" 
        : null;
      
      dispatch({ 
        type: 'ELIMINATE_PLAYER', 
        playerId: selectedTiePlayer,
        message: eliminationMessage
      });
      
      // Check win condition for Deathmatch mode
      if (state.gameMode === 'deathmatch') {
        // Mark the player as eliminated first
        const updatedPlayers = state.players.map(p => 
          p.id === selectedTiePlayer ? { ...p, isAlive: false } : p
        );
        
        // Calculate game state after elimination
        const alivePlayers = updatedPlayers.filter(p => p.isAlive);
        const aliveImpostor = alivePlayers.find(p => p.isImpostor);
        const aliveCrewMembers = alivePlayers.filter(p => !p.isImpostor);
        
        // Game is over only if:
        // 1. The impostor was eliminated (crew wins)
        // 2. Only the impostor and one crew member remain (impostor wins)
        // 3. All crew members are eliminated (impostor wins)
        const gameOver = (isImpostor) || // Impostor was eliminated
                        (aliveImpostor && aliveCrewMembers.length === 1) || // Impostor and one crew member
                        (aliveImpostor && aliveCrewMembers.length === 0); // Only impostor remains
        
        if (gameOver) {
          // Add a short delay before transitioning to lobby
          const transitionTimer = setTimeout(() => {
            dispatch({ type: 'SET_PHASE', phase: 'lobby' });
          }, 10000); // 10 seconds delay for Deathmatch
          
          return () => clearTimeout(transitionTimer);
        } else {
          // Continue to next round after delay
          const continueTimer = setTimeout(() => {
            // Start a new round with the same players (but eliminated ones can't participate)
            const numberQuestion = getRandomQuestion();
            dispatch({ type: 'SET_QUESTION', question: numberQuestion });
            dispatch({ type: 'SET_PHASE', phase: 'role_reveal' });
          }, 10000); // 10 seconds delay before next round
          
          return () => clearTimeout(continueTimer);
        }
      } else {
        // For Quickplay mode, always return to lobby
        const transitionTimer = setTimeout(() => {
          dispatch({ type: 'SET_PHASE', phase: 'lobby' });
        }, 5000); // 5 seconds delay
        
        return () => clearTimeout(transitionTimer);
      }
    }
  }, [animationComplete, selectedTiePlayer, dispatch, state.players, state.gameMode]);
  
  // Helper function to get a random question
  const getRandomQuestion = () => {
    const questions = translations[language].gameQuestions;
    const questionKeys = Object.keys(questions);
    const randomKey = questionKeys[Math.floor(Math.random() * questionKeys.length)];
    return questions[randomKey];
  };

  // Handle tie-breaking animation
  useEffect(() => {
    if (isTie && !showTieBreaker && !animationComplete && state.currentPhase === 'results') {
      // Get the tied players' information
      const tiedPlayersList = playersWithHighestVotes.map(id => {
        const player = state.players.find(p => p.id === id);
        return { id, name: player?.name || 'Unknown' };
      });
      
      setTiedPlayers(tiedPlayersList);
      setShowTieBreaker(true);
      
      // Start the animation sequence
      let currentIndex = 0;
      let speed = 400; // Start slow
      let progress = 0;
      const totalDuration = 4000; // 4 seconds total
      const progressInterval = 50; // Update progress every 50ms
      const startTime = Date.now();
      
      // Clear any existing animation
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
      
      // Animation interval
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        progress = Math.min(100, (elapsed / totalDuration) * 100);
        setAnimationProgress(progress);
        
        // Gradually speed up the highlighting
        if (progress < 70) {
          speed = Math.max(50, 400 - (progress * 5));
        } else {
          // Then slow down for dramatic effect
          speed = 50 + ((progress - 70) * 25);
        }
        
        // Update the highlighted player
        setHighlightedIndex(currentIndex);
        currentIndex = (currentIndex + 1) % tiedPlayersList.length;
        
        // When animation is complete, select a random player
        if (progress >= 100) {
          clearInterval(interval);
          animationRef.current = null;
          
          // Randomly select one of the tied players
          const randomIndex = Math.floor(Math.random() * tiedPlayersList.length);
          setHighlightedIndex(randomIndex);
          setSelectedTiePlayer(tiedPlayersList[randomIndex].id);
          setAnimationComplete(true);
        }
      }, speed);
      
      animationRef.current = interval;
      
      // Add a safety timeout to ensure the animation completes
      const safetyTimeout = setTimeout(() => {
        if (!animationComplete) {
          // If animation hasn't completed after the expected duration plus a buffer,
          // force completion
          if (animationRef.current) {
            clearInterval(animationRef.current);
            animationRef.current = null;
          }
          
          // Randomly select one of the tied players
          const randomIndex = Math.floor(Math.random() * tiedPlayersList.length);
          setHighlightedIndex(randomIndex);
          setSelectedTiePlayer(tiedPlayersList[randomIndex].id);
          setAnimationProgress(100);
          setAnimationComplete(true);
        }
      }, totalDuration + 1000); // Add 1 second buffer
      
      animationRef.current = interval;
      
      // Cleanup
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
        }
      };
    }
  }, [isTie, showTieBreaker, animationComplete, state.currentPhase, playersWithHighestVotes, state.players]);
  
  const handleReturnToLobby = () => {
    // Reset game state and return to lobby
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    dispatch({ type: 'SET_PHASE', phase: 'lobby' });
  };
  
  if (state.currentPhase !== 'results') {
    return null;
  }
  
  return (
    <div className="results-container">
      <div className="phase-header">
        <h2>Game Results</h2>
      </div>
      
      {/* Tie-breaker animation */}
      {showTieBreaker && (
        <div className="tie-breaker-container">
          <h3 className="tie-breaker-title">TIE BREAKER!</h3>
          <p>Multiple players received {highestVotes} votes each. Randomly selecting one...</p>
          
          <div className="tie-candidates">
            {tiedPlayers.map((player, index) => (
              <div 
                key={player.id} 
                className={`tie-candidate ${highlightedIndex === index ? 'highlighted' : ''} 
                  ${animationComplete && selectedTiePlayer === player.id ? 'selected' : ''}
                  ${animationComplete && selectedTiePlayer !== player.id ? 'not-selected' : ''}`}
              >
                {player.name}
              </div>
            ))}
          </div>
          
          <div className="tie-breaker-progress">
            <div 
              className="tie-breaker-progress-bar" 
              style={{ width: `${animationProgress}%` }}
            ></div>
          </div>
          
          <p className="tie-breaker-message">
            {animationComplete 
              ? `${tiedPlayers.find(p => p.id === selectedTiePlayer)?.name} has been selected!` 
              : 'Selecting randomly...'}
          </p>
        </div>
      )}
      
      {/* Only show results after tie breaker animation is complete */}
      {(!showTieBreaker || animationComplete) && (
        <div className="elimination-result">
          {eliminatedPlayer ? (
            <h3 className="eliminated-player-message">
              {eliminatedPlayer.name} was eliminated...
            </h3>
          ) : (
            <h3>No one was eliminated</h3>
          )}
          
          {eliminatedPlayer && (
            <h3 className={`impostor-status ${isCorrectGuess ? 'correct' : 'incorrect'}`}>
              {isCorrectGuess 
                ? "They were the Impostor!" 
                : state.gameMode === 'deathmatch' && state.eliminatedMessage
                  ? state.eliminatedMessage
                  : `They were not the Impostor! The real Impostor was ${impostorPlayer?.name}`}
            </h3>
          )}
          
          <h2 className={`game-result ${isCorrectGuess ? 'win' : 'loss'}`}>
            {getResultMessage()}
          </h2>
        </div>
      )}
      
      <div className="voting-results">
        <h3>Voting Results:</h3>
        {Object.entries(state.votes).length === 0 ? (
          <p>No votes were cast!</p>
        ) : (
          <div className="vote-tally">
            {state.players.map(player => {
              const votesForPlayer = Object.values(state.votes).filter(targetId => targetId === player.id).length;
              return votesForPlayer > 0 ? (
                <div key={player.id} className="player-votes">
                  <span>{player.name}: {votesForPlayer} vote{votesForPlayer !== 1 ? 's' : ''}</span>
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>
      
      <button 
        className="return-to-lobby-btn danger"
        onClick={handleReturnToLobby}
        disabled={!canReturnToLobby}
      >
        {translations[language].returnToLobby}
      </button>
    </div>
  );
};