import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Timer } from './Timer';
import './Voting.css';

export const Voting: React.FC = () => {
  const { state, dispatch } = useGame();
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const currentPlayerId = 'current-player-id';
  
  // Check if the current player is eliminated (for Deathmatch mode)
  const currentPlayer = state.players.find(p => p.id === currentPlayerId);
  const isEliminated = !currentPlayer?.isAlive;

  const handleVote = () => {
    if (!selectedPlayer) return;
    
    dispatch({
      type: 'SUBMIT_VOTE',
      voterId: currentPlayerId,
      targetId: selectedPlayer,
    });
  };

  if (state.currentPhase !== 'voting') {
    return null;
  }

  const hasVoted = Object.keys(state.votes).includes(currentPlayerId);

  return (
    <div className="voting-container">
      <div className="phase-header">
        <h2>Voting Phase</h2>
        <Timer />
      </div>

      <p className="voting-instruction">Vote for who you think is the impostor:</p>

      <div className="players-list">
        {state.players
          .filter(player => player.isAlive && player.id !== currentPlayerId)
          .map(player => (
            <div 
              key={player.id} 
              className={`player-vote-card ${selectedPlayer === player.id ? 'selected' : ''}`}
              onClick={() => !hasVoted && setSelectedPlayer(player.id)}
            >
              <span className="player-name">{player.name}</span>
            </div>
          ))}
      </div>

      {isEliminated && state.gameMode === 'deathmatch' ? (
        <div className="spectator-message">
          <h3>You have been eliminated</h3>
          <p>You are now spectating the game</p>
        </div>
      ) : (
        <>
          <button
            className="vote-btn"
            disabled={hasVoted || !selectedPlayer}
            onClick={handleVote}
          >
            Vote
          </button>

          <div className="vote-status">
            {hasVoted ? (
              <p>You have cast your vote. Waiting for others...</p>
            ) : (
              <p>Select a player to vote for elimination</p>
            )}
          </div>
        </>
      )}

      <div className="vote-count">
        <h3>Current Votes:</h3>
        {Object.entries(state.votes).length === 0 ? (
          <p>No votes yet</p>
        ) : (
          <div>
            {Object.entries(state.votes).map(([voterId, targetId]) => {
              const voter = state.players.find(p => p.id === voterId);
              const target = state.players.find(p => p.id === targetId);
              return (
                <div key={voterId} className="vote-entry">
                  <span>{voter?.name || 'Unknown'}</span>
                  <span> voted for </span>
                  <span>{target?.name || 'Unknown'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};