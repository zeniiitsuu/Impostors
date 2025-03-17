import React from 'react';
import './Settings.css';
import { useLanguage } from '../context/LanguageContext';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { language, setLanguage, translations } = useLanguage();

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
  };

  const handleSave = () => {
    localStorage.setItem('language', language);
    onClose();
  };

  return (
    <div className="settings-overlay">
      <div className="settings-modal">
        <h2>{translations[language].title}</h2>
        
        <div className="settings-section">
          <label>{translations[language].language}:</label>
          <div className="language-options">
            <button
              className={`language-button ${language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              {translations[language].english}
            </button>
            <button
              className={`language-button ${language === 'pt' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('pt')}
            >
              {translations[language].portuguese}
            </button>
          </div>
        </div>

        <div className="settings-actions">
          <button className="cancel-button" onClick={onClose}>
            {translations[language].cancel}
          </button>
          <button className="save-button" onClick={handleSave}>
            {translations[language].save}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;