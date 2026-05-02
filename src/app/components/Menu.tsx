import { X, Mic, FileText, Package, AlertTriangle, Users, LogOut } from 'lucide-react';

interface MenuProps {
  user: any;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export function Menu({ user, onNavigate, onLogout }: MenuProps) {
  const menuItems = [
    { id: 'voice', icon: Mic, label: 'Voice Dashboard', roles: ['worker', 'manager', 'driver', 'admin'] },
    { id: 'logs', icon: FileText, label: 'Activity Logs', roles: ['manager', 'admin'] },
    { id: 'inventory', icon: Package, label: 'Inventory', roles: ['worker', 'manager', 'admin'] },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts', roles: ['manager', 'admin'] },
    { id: 'users', icon: Users, label: 'User Management', roles: ['admin'] },
  ];

  const availableItems = menuItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-400">Menu</h1>
            <p className="text-sm text-slate-400">{user.name} • {user.role}</p>
          </div>
          <button
            onClick={() => onNavigate('voice')}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="space-y-2">
          {availableItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg p-4 flex items-center gap-4 transition-colors"
            >
              <item.icon className="w-6 h-6 text-blue-400" />
              <span className="text-white">{item.label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-8 bg-red-600/20 hover:bg-red-600/30 border border-red-600/50 rounded-lg p-4 flex items-center justify-center gap-3 transition-colors"
        >
          <LogOut className="w-5 h-5 text-red-400" />
          <span className="text-red-400">Logout</span>
        </button>
      </div>
    </div>
  );
}
