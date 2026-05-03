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
      case 'worker': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'manager': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'driver': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'admin': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const groupedUsers = {
    admin: database.users.filter(u => u.role === 'admin'),
    manager: database.users.filter(u => u.role === 'manager'),
    driver: database.users.filter(u => u.role === 'driver'),
    worker: database.users.filter(u => u.role === 'worker'),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-500">
      
      {/* Sticky Matte Glass Header */}
      <div className="matte-glass sticky top-0 z-10 p-4 md:px-6 border-b border-border flex items-center gap-4">
        <button 
          onClick={() => onNavigate('menu')} 
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-all duration-300 active:scale-90 bg-muted/50 border border-transparent hover:border-border"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">Personnel Directory</h1>
          <p className="text-sm text-muted-foreground font-medium">{database.users.length} registered accounts</p>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="space-y-10 max-w-4xl mx-auto">
          {Object.entries(groupedUsers).map(([role, users], groupIndex) => (
            users.length > 0 && (
              <div 
                key={role}
                className="animate-in slide-in-from-bottom-8 fade-in"
                style={{ animationFillMode: 'both', animationDelay: `${groupIndex * 150}ms` }}
              >
                {/* Group Header */}
                <div className="flex items-center gap-3 mb-4 pl-1">
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{role}s</h2>
                  <div className="h-px bg-border flex-1"></div>
                  <span className="text-xs font-semibold text-muted-foreground">{users.length}</span>
                </div>

                {/* User Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {users.map((user, index) => {
                    const Icon = getRoleIcon(user.role);
                    return (
                      <div 
                        key={user.id} 
                        className="matte-glass rounded-2xl p-4 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Role Icon Avatar */}
                          <div className={`rounded-2xl p-3 border shadow-sm transition-transform duration-300 group-hover:scale-110 ${getRoleColor(user.role)}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          {/* User Info */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-foreground font-bold text-lg truncate">{user.name}</h3>
                            <p className="text-sm font-medium text-muted-foreground truncate">@{user.username}</p>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${getRoleColor(user.role)}`}>
                              {user.role}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Active
                            </span>
                          </div>
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