import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import { Game } from './components/Game'
import { JoinRoom } from './components/JoinRoom'
import { GameProvider } from './context/GameContext'
import { LanguageProvider } from './context/LanguageContext'
import './App.css'

function App() {
  return (
    <Router>
      <LanguageProvider>
        <GameProvider>
          <div className="app-container">
            <Routes>
              <Route path="/" element={<MainMenu />} />
              <Route path="/room/:roomId" element={<JoinRoom />} />
              <Route path="/game/:roomId" element={<Game />} />
            </Routes>
          </div>
        </GameProvider>
      </LanguageProvider>
    </Router>
  )
}

export default App
