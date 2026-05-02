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
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">IRA Logistics</h1>
          <p className="text-slate-400">Voice-First Warehouse System</p>
        </div>

        <div className="bg-slate-900 rounded-lg p-6 shadow-xl border border-slate-800">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="Enter username"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 text-white rounded-lg px-4 py-3 border border-slate-700 focus:border-blue-500 focus:outline-none"
                placeholder="Enter password"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 font-medium transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-slate-500 text-center mb-3">Quick Login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => quickLogin('worker')}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 transition-colors"
              >
                Worker
              </button>
              <button
                onClick={() => quickLogin('manager')}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 transition-colors"
              >
                Manager
              </button>
              <button
                onClick={() => quickLogin('driver')}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 transition-colors"
              >
                Driver
              </button>
              <button
                onClick={() => quickLogin('admin')}
                className="bg-slate-800 hover:bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-700 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-slate-500">
          <p>Demo Credentials:</p>
          <p>ravi/worker123 • anita/manager123</p>
          <p>vikram/driver123 • admin/admin123</p>
        </div>
      </div>
    </div>
  );
}
