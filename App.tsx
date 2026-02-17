
import React, { useState, useEffect, useCallback } from 'react';
import { SystemStatus, User } from './types';
import BootScreen from './components/BootScreen';
import LoginScreen from './components/LoginScreen';
import DesktopEnvironment from './components/DesktopEnvironment';
import { Power } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<SystemStatus>('booting');
  const [user, setUser] = useState<User | null>(null);

  const handleBootComplete = useCallback(() => {
    setStatus('login');
  }, []);

  const handleLogin = useCallback((username: string) => {
    setUser({ username, avatar: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200&h=200' });
    setStatus('desktop');
  }, []);

  const handleUpdateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
  }, []);

  const handlePowerAction = useCallback((action: 'shutdown' | 'restart') => {
    if (action === 'restart') {
      setStatus('booting');
    } else {
      setStatus('off');
    }
  }, []);

  const handlePowerOn = useCallback(() => {
    setStatus('booting');
  }, []);

  if (status === 'off') {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center gap-6">
        <div className="text-zinc-800 text-sm uppercase tracking-widest">System Offline</div>
        <button 
          onClick={handlePowerOn}
          className="group relative flex items-center justify-center w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all duration-500 shadow-2xl"
        >
          <Power className="w-8 h-8 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
          <div className="absolute inset-0 rounded-full group-hover:bg-emerald-500/10 blur-xl transition-all"></div>
        </button>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden select-none text-white">
      {status === 'booting' && <BootScreen onComplete={handleBootComplete} />}
      {status === 'login' && <LoginScreen onLogin={handleLogin} />}
      {status === 'desktop' && user && (
        <DesktopEnvironment 
          user={user} 
          onUpdateUser={handleUpdateUser}
          onPowerAction={handlePowerAction} 
        />
      )}
    </div>
  );
};

export default App;
