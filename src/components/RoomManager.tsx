import { useState, useCallback, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

interface RoomManagerProps {
  onRoomCreated?: (roomId: string) => void;
  playerName: string;
}

export const RoomManager: React.FC<RoomManagerProps> = ({ onRoomCreated, playerName }) => {
  const [roomLink, setRoomLink] = useState<string>('');
  const [roomName, setRoomName] = useState<string>('');
  const [playerLimit, setPlayerLimit] = useState<number>(6);
  const [showForm, setShowForm] = useState<boolean>(false);
  const navigate = useNavigate();

  const { dispatch } = useGame();

  const handleShowForm = useCallback(() => {
    setShowForm(true);
  }, []);

  const handleCreateRoom = useCallback((e: FormEvent) => {
    e.preventDefault();
    
    const roomId = uuidv4();
    const link = `${window.location.origin}/room/${roomId}`;
    setRoomLink(link);
    
    if (onRoomCreated) {
      onRoomCreated(roomId);
    }
    
    // Reset game state first to clear any previous game data
    dispatch({ type: 'SET_PHASE', phase: 'lobby' });
    
    // Add the player to the game with the provided name
    dispatch({ type: 'JOIN_GAME', player: { id: 'current-player-id', name: playerName, isImpostor: false, isAlive: true, hasVoted: false } });
    
    // Start the game with the custom settings
    const finalRoomName = roomName.trim() || `Game Room ${roomId.substring(0, 6)}`;
    dispatch({ 
      type: 'START_GAME', 
      roomId, 
      roomName: finalRoomName, 
      playerLimit 
    });
    
    // Ensure we're in lobby phase
    dispatch({ type: 'SET_PHASE', phase: 'lobby' });
    
    // Navigate to the game with the room ID
    navigate(`/game/${roomId}`);
  }, [onRoomCreated, dispatch, navigate, roomName, playerLimit]);

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomLink);
      alert('Room link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [roomLink]);

  return (
    <div className="room-manager">
      {!showForm ? (
        <button 
          onClick={handleShowForm}
          className="create-room-btn"
        >
          Create Room
        </button>
      ) : (
        <form onSubmit={handleCreateRoom} className="room-settings-form">
          <div className="form-group">
            <label htmlFor="roomName">Room Name (optional):</label>
            <input
              type="text"
              id="roomName"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter room name"
              className="room-name-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="playerLimit">Player Limit (3-10):</label>
            <select
              id="playerLimit"
              value={playerLimit}
              onChange={(e) => setPlayerLimit(Number(e.target.value))}
              className="player-limit-select"
            >
              {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <option key={num} value={num}>{num} players</option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit"
            className="create-room-btn"
          >
            Create Room
          </button>
        </form>
      )}

      {roomLink && (
        <div className="room-link-container">
          <p>Share this link with your friends:</p>
          <div className="link-box">
            <input 
              type="text" 
              value={roomLink} 
              readOnly 
              className="room-link"
            />
            <button 
              onClick={copyLink}
              className="copy-btn"
            >
              Copy Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};