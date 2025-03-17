import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import './PlayerNameInput.css';

interface PlayerNameInputProps {
  roomId?: string;
  onNameSubmit?: (name: string) => void;
}

export const PlayerNameInput: React.FC<PlayerNameInputProps> = ({ roomId, onNameSubmit }) => {
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useGame();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      alert('Please enter a name');
      return;
    }
    
    // Get current players before adding the new player
    const { state, dispatch } = useGame();
    const currentPlayers = state.players;
    
    // Check if a player with this name already exists
    const nameExists = currentPlayers.some(player => 
      player.name.toLowerCase() === playerName.trim().toLowerCase() && 
      player.id !== 'current-player-id'
    );
    
    if (nameExists) {
      alert('A player with this name already exists. Please choose a different name.');
      return;
    }
    
    // Add the player to the game
    dispatch({ 
      type: 'JOIN_GAME', 
      player: { 
        id: 'current-player-id', 
        name: playerName.trim(), 
        isImpostor: false, 
        isAlive: true, 
        hasVoted: false 
      } 
    });
    
    // Check if player was actually added (by comparing player counts)
    const newPlayerCount = useGame().state.players.length;
    
    if (newPlayerCount === currentPlayers.length) {
      // Player wasn't added, likely due to duplicate name
      alert('A player with this name already exists. Please choose a different name.');
      return;
    }
    
    if (onNameSubmit) {
      onNameSubmit(playerName);
    }
    
    // If roomId is provided, navigate to the game with that room ID
    if (roomId) {
      navigate(`/game/${roomId}`);
    }
  };

  return (
    <div className="player-name-card">
      <h2>Enter Your Name</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name"
            className="player-name-field"
            autoFocus
          />
        </div>
        <button 
          type="submit"
          className="submit-name-btn"
          disabled={!playerName.trim()}
        >
          {roomId ? 'Join Game' : 'Continue'}
        </button>
      </form>
    </div>
  );
};