
import React, { useState, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import MatchScreen from './components/MatchScreen';
import { MatchSettings, MatchState, CompletedMatch } from './types';
import { createInitialMatchState } from './logic';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'setup' | 'match'>('setup');
  const [matchSettings, setMatchSettings] = useState<MatchSettings | null>(null);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [history, setHistory] = useState<CompletedMatch[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('pickleball_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const handleStartMatch = (settings: MatchSettings) => {
    setMatchSettings(settings);
    setMatchState(createInitialMatchState(settings.initialServerTeam));
    setCurrentView('match');
  };

  const handleExitMatch = () => {
    setCurrentView('setup');
    setMatchState(null);
    setMatchSettings(null);
  };

  const handleClearHistory = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử đấu?")) {
      setHistory([]);
      localStorage.removeItem('pickleball_history');
    }
  };

  const handleFinishMatch = (match: CompletedMatch) => {
    const newHistory = [match, ...history].slice(0, 20); // Keep last 20
    setHistory(newHistory);
    localStorage.setItem('pickleball_history', JSON.stringify(newHistory));
    setCurrentView('setup');
    setMatchState(null);
    setMatchSettings(null);
  };

  return (
    <div className="font-sans antialiased text-white bg-slate-950 min-h-screen">
      {currentView === 'setup' ? (
        <SetupScreen onStart={handleStartMatch} history={history} onClearHistory={handleClearHistory} />
      ) : (
        matchSettings && matchState && (
          <MatchScreen 
            settings={matchSettings} 
            state={matchState} 
            setState={setMatchState}
            onExit={handleExitMatch}
            onFinish={handleFinishMatch}
          />
        )
      )}
    </div>
  );
};

export default App;
