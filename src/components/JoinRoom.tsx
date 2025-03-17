import React from 'react';
import { useParams } from 'react-router-dom';
import { PlayerNameInput } from './PlayerNameInput';
import './JoinRoom.css';

interface JoinRoomProps {}

export const JoinRoom: React.FC<JoinRoomProps> = () => {
  const { roomId } = useParams<{ roomId: string }>();
  
  return (
    <div className="join-room-container">
      <div className="join-room-card">
        <h1>Join Game Room</h1>
        <p>Please enter your nickname to join the game.</p>
        <PlayerNameInput roomId={roomId} />
      </div>
    </div>
  );
};