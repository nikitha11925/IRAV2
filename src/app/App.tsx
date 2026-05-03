import { useState } from 'react';
import { Login } from './components/Login';
import { VoiceDashboard } from './components/VoiceDashboard';
import { Menu } from './components/Menu';
import { Logs } from './components/Logs';
import { Inventory } from './components/Inventory';
import { Alerts } from './components/Alerts';
import { Users } from './components/Users';
import  database  from '../data/database.json';

type Screen = 'login' | 'voice' | 'menu' | 'logs' | 'inventory' | 'alerts' | 'users';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>(database.logs);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    setCurrentScreen('voice');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentScreen('login');
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as Screen);
  };

  const handleLogUpdate = (newLog: any) => {
    setLogs(prev => [...prev, newLog]);
  };

  if (currentScreen === 'login' || !currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="size-full bg-background text-foreground transition-colors duration-500">
      {currentScreen === 'voice' && (
        <VoiceDashboard
          user={currentUser}
          onNavigate={handleNavigate}
          onLogUpdate={handleLogUpdate}
        />
      )}
      {currentScreen === 'menu' && (
        <Menu
          user={currentUser}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
        />
      )}
      {currentScreen === 'logs' && (
        <Logs 
          logs={logs} 
          user={currentUser} 
          onNavigate={handleNavigate} 
        />
      )}
      {currentScreen === 'inventory' && (
        <Inventory onNavigate={handleNavigate} />
      )}
      {currentScreen === 'alerts' && (
        <Alerts onNavigate={handleNavigate} />
      )}
      {currentScreen === 'users' && (
        <Users onNavigate={handleNavigate} />
      )}
    </div>
  );
}