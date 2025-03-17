import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { CombinedRoomCreator } from './CombinedRoomCreator';
import Settings from './Settings';
import './MainMenu.css';
// Import the new logo
import impostorsLogo from '../assets/impostors.png';

const MainMenu: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showRoomCreator, setShowRoomCreator] = useState(false);
  const navigate = useNavigate();
  const { dispatch } = useGame();
  const { language, translations } = useLanguage();

  const handleCreateRoom = () => {
    setShowRoomCreator(true);
  };

  const handleSettings = () => {
    setShowSettings(true);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handleAbout = () => {
    alert(translations[language].aboutGame);
  };

  return (
    <div className="main-menu">
      <div className="logo-container">
        <img src={impostorsLogo} alt="Impostors" className="game-logo" />
      </div>
      
      {showSettings && <Settings onClose={handleCloseSettings} />}

      {!showRoomCreator ? (
        <div className="menu-container">
          <button 
            className="menu-button create-room-btn" 
            onClick={handleCreateRoom}
          >
            {translations[language].createRoom}
          </button>
          
          <button 
            className="menu-button settings-btn" 
            onClick={handleSettings}
          >
            {translations[language].settings}
          </button>
          
          <button 
            className="menu-button about-btn" 
            onClick={handleAbout}
          >
            {translations[language].about}
          </button>
        </div>
      ) : (
        <CombinedRoomCreator onRoomCreated={() => {}} />
      )}
    </div>
  );
};

export default MainMenu;