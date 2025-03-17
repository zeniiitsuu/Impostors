import React, { useState, FormEvent, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import './PlayerNameInput.css';

interface CombinedRoomCreatorProps {
  onRoomCreated?: (roomId: string) => void;
}

export const CombinedRoomCreator: React.FC<CombinedRoomCreatorProps> = ({ onRoomCreated }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [playerLimit, setPlayerLimit] = useState<number>(6);
  const [roomLink, setRoomLink] = useState<string>('');
  const [gameMode, setGameMode] = useState<'quickplay' | 'deathmatch'>('quickplay');
  const [theme, setTheme] = useState<'numbers' | 'colors'>('numbers');
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { language, translations } = useLanguage();

  const handleCreateRoom = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      alert(translations[language].yourName);
      return;
    }
    
    // Check if a player with this name already exists
    const nameExists = state.players.some(player => 
      player.name.toLowerCase() === playerName.trim().toLowerCase() && 
      player.id !== 'current-player-id'
    );
    
    if (nameExists) {
      alert('A player with this name already exists. Please choose a different name.');
      return;
    }
    
    const roomId = uuidv4();
    const link = `${window.location.origin}/room/${roomId}`;
    setRoomLink(link);
    
    if (onRoomCreated) {
      onRoomCreated(roomId);
    }
    
    // Reset game state first to clear any previous game data
    dispatch({ type: 'SET_PHASE', phase: 'lobby' });
    
    // Add the player to the game with the provided name
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
    
    // Start the game with the custom settings
    const finalRoomName = roomName.trim() || `Game Room ${roomId.substring(0, 6)}`;
    // Log the game mode to verify it's being set correctly
    console.log('Creating room with game mode:', gameMode);
    dispatch({ 
      type: 'START_GAME', 
      roomId, 
      roomName: finalRoomName, 
      playerLimit,
      gameMode,
      theme
    });
    
    // Ensure we're in lobby phase
    dispatch({ type: 'SET_PHASE', phase: 'lobby' });
    
    // Navigate to the game with the room ID
    navigate(`/game/${roomId}`);
  }, [onRoomCreated, dispatch, navigate, roomName, playerLimit, playerName, state.players]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      alert(translations[language].inviteLinkCopied);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [roomLink]);

  return (
    <div className="player-name-input-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: 'var(--space-md)' }}>
      <div className="player-name-card" style={{ maxWidth: '600px', width: '100%' }}>
        <h2>{translations[language].createRoomTitle}</h2>
        <form onSubmit={handleCreateRoom}>
          <div className="form-group">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={translations[language].yourName}
              className="player-name-field"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder={`${translations[language].roomName} (optional)`}
              className="player-name-field"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="playerLimit" style={{ color: 'white', display: 'block', marginBottom: '8px', textAlign: 'left' }}>
                {translations[language].playerLimit} (3-10):
              </label>
              <select
                id="playerLimit"
                value={playerLimit}
                onChange={(e) => setPlayerLimit(Number(e.target.value))}
                className="player-name-field"
              >
                {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                  <option key={num} value={num}>{num} players</option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="gameMode" style={{ color: 'white', display: 'block', marginBottom: '8px', textAlign: 'left' }}>
                Game Mode:
              </label>
              <select
                id="gameMode"
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value as 'quickplay' | 'deathmatch')}
                className="player-name-field"
              >
                <option value="quickplay">Quickplay</option>
                <option value="deathmatch">Deathmatch</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="theme" style={{ color: 'white', display: 'block', marginBottom: '8px', textAlign: 'left' }}>
              Theme:
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'numbers' | 'colors')}
              className="player-name-field"
            >
              <option value="numbers">Numbers</option>
              <option value="colors">Colors</option>
            </select>
          </div>
          
          <button 
            type="submit"
            className="submit-name-btn"
            disabled={!playerName.trim()}
          >
            {translations[language].createRoom}
          </button>
        </form>
      </div>

      {roomLink && (
        <div className="room-link-container" style={{ marginTop: '20px', backgroundColor: '#16213e', padding: '20px', borderRadius: '10px', maxWidth: '600px', width: '100%' }}>
          <p style={{ color: 'white' }}>{translations[language].shareLink}</p>
          <div className="link-box" style={{ display: 'flex', marginTop: '10px' }}>
            <input 
              type="text" 
              value={roomLink} 
              readOnly 
              className="player-name-field"
              style={{ flex: '1', marginRight: '10px' }}
            />
            <button 
              onClick={copyLink}
              className="submit-name-btn"
              style={{ width: 'auto', whiteSpace: 'nowrap' }}
            >
              {translations[language].copyLink}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};