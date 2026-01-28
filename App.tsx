
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

  // Load history and current match state from localStorage on mount
  useEffect(() => {
    try {
      // Load history
      const savedHistory = localStorage.getItem('pickleball_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      // Load current match state if it exists
      const savedMatchSettings = localStorage.getItem('pickleball_current_settings');
      const savedMatchState = localStorage.getItem('pickleball_current_state');
      
      console.log('Checking saved match data:', { 
        hasSettings: !!savedMatchSettings, 
        hasState: !!savedMatchState 
      });

      if (savedMatchSettings && savedMatchState) {
        const parsedSettings = JSON.parse(savedMatchSettings);
        const parsedState = JSON.parse(savedMatchState);
        
        console.log('Restoring match state:', { parsedSettings, parsedState });
        
        setMatchSettings(parsedSettings);
        setMatchState(parsedState);
        setCurrentView('match');
      }
    } catch (e) {
      console.error("Failed to load saved data:", e);
      // Clear corrupted data
      localStorage.removeItem('pickleball_current_settings');
      localStorage.removeItem('pickleball_current_state');
    }
  }, []);

  const handleStartMatch = (settings: MatchSettings) => {
    setMatchSettings(settings);
    const initialState = createInitialMatchState(settings.initialServerTeam);
    setMatchState(initialState);
    setCurrentView('match');
    // Save match state to localStorage
    localStorage.setItem('pickleball_current_settings', JSON.stringify(settings));
    localStorage.setItem('pickleball_current_state', JSON.stringify(initialState));
  };

  const handleExitMatch = () => {
    setCurrentView('setup');
    setMatchState(null);
    setMatchSettings(null);
    // Clear saved match state
    localStorage.removeItem('pickleball_current_settings');
    localStorage.removeItem('pickleball_current_state');
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('pickleball_history');
  };

  const handleFinishMatch = (match: CompletedMatch) => {
    const newHistory = [match, ...history].slice(0, 20); // Keep last 20
    setHistory(newHistory);
    localStorage.setItem('pickleball_history', JSON.stringify(newHistory));
    setCurrentView('setup');
    setMatchState(null);
    setMatchSettings(null);
    // Clear saved match state when finishing
    localStorage.removeItem('pickleball_current_settings');
    localStorage.removeItem('pickleball_current_state');
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
