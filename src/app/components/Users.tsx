import { ArrowLeft, User, Shield, Truck, Briefcase } from 'lucide-react';
import database from '../../data/database.json';

interface UsersProps {
  onNavigate: (screen: string) => void;
}

export function Users({ onNavigate }: UsersProps) {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'worker': return User;
      case 'manager': return Briefcase;
      case 'driver': return Truck;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'worker': return 'bg-blue-500/20 text-blue-400';
      case 'manager': return 'bg-purple-500/20 text-purple-400';
      case 'driver': return 'bg-green-500/20 text-green-400';
      case 'admin': return 'bg-red-500/20 text-red-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const groupedUsers = {
    admin: database.users.filter(u => u.role === 'admin'),
    manager: database.users.filter(u => u.role === 'manager'),
    driver: database.users.filter(u => u.role === 'driver'),
    worker: database.users.filter(u => u.role === 'worker'),
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('menu')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-blue-400">User Management</h1>
            <p className="text-sm text-slate-400">{database.users.length} users</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-6">
          {Object.entries(groupedUsers).map(([role, users]) => (
            users.length > 0 && (
              <div key={role}>
                <h2 className="text-sm text-slate-500 mb-3 capitalize">{role}s</h2>
                <div className="space-y-2">
                  {users.map((user) => {
                    const Icon = getRoleIcon(user.role);
                    return (
                      <div key={user.id} className="bg-slate-900 rounded-lg p-4 border border-slate-800">
                        <div className="flex items-center gap-3">
                          <div className={`rounded-lg p-2 ${getRoleColor(user.role)}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-medium">{user.name}</h3>
                            <p className="text-sm text-slate-500">@{user.username}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${getRoleColor(user.role)}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
