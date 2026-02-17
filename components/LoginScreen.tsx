
import React, { useState } from 'react';
import { User, Lock, ArrowRight } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin') {
      onLogin('mario');
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url(https://picsum.photos/id/11/1920/1080)' }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

      <div className="relative flex flex-col items-center space-y-6 z-10 w-full max-w-sm px-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
          <img src="https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=200&h=200" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight">Mario</h2>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className={`relative flex items-center transition-transform ${error ? 'animate-shake' : ''}`}>
            <input
              autoFocus
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-center"
            />
            <button 
              type="submit"
              className="absolute right-2 p-2 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
          {error && <p className="text-rose-400 text-xs text-center font-medium">Wrong password. Try "admin"</p>}
        </form>

        <p className="text-white/40 text-xs">Login with: mario | admin</p>
      </div>

      <div className="absolute bottom-8 text-white/50 text-xs tracking-widest font-medium uppercase">
        MarioOS Linux v1.0.4
      </div>
    </div>
  );
};

export default LoginScreen;
