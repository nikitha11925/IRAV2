import { useState } from 'react';
import database from '../../data/database.json';

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = database.users.find(
      u => u.username === username && u.password === password
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials');
    }
  };

  const quickLogin = (role: string) => {
    const user = database.users.find(u => u.role === role);
    if (user) {
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 transition-colors duration-500">
      {/* Added animate-in for a smooth entrance */}
      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-700 ease-out">
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">IRA Logistics</h1>
          <p className="text-muted-foreground font-medium">Voice-First Warehouse System</p>
        </div>

        {/* Applied our new matte-glass utility here */}
        <div className="matte-glass rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-input-background text-foreground rounded-xl px-4 py-3 border border-border focus:border-primary focus:ring-[3px] focus:ring-primary/30 focus:outline-none transition-all"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-input-background text-foreground rounded-xl px-4 py-3 border border-border focus:border-primary focus:ring-[3px] focus:ring-primary/30 focus:outline-none transition-all"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-destructive-foreground text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] rounded-xl px-4 py-3 font-semibold shadow-sm transition-all duration-300"
            >
              Login
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-muted-foreground bg-white dark:bg-[#1a1a1a]">Quick Login</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-5">
              {['worker', 'manager', 'driver', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => quickLogin(role)}
                  className="bg-muted hover:bg-accent hover:text-accent-foreground text-foreground rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] capitalize"
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground/70 font-medium">
          <p>Demo Credentials:</p>
          <p className="mt-1">ravi/worker123 • anita/manager123</p>
          <p>vikram/driver123 • admin/admin123</p>
        </div>
      </div>
    </div>
  );
}