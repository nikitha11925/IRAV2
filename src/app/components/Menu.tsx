import { X, Mic, FileText, Package, AlertTriangle, Users, LogOut, ChevronRight } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 transition-colors duration-500">
      
      {/* Central Matte Glass Hub */}
      <div className="w-full max-w-2xl matte-glass rounded-[2rem] p-6 md:p-10 animate-in fade-in zoom-in-95 duration-500 ease-out shadow-xl shadow-primary/5">
        
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-border">
          <div>
            <h1 className="text-3xl font-bold text-primary tracking-tight">System Menu</h1>
            <p className="text-muted-foreground font-medium mt-1">
              {user.name} <span className="mx-2 opacity-50">•</span> <span className="capitalize">{user.role}</span>
            </p>
          </div>
          <button
            onClick={() => onNavigate('voice')}
            className="p-3 rounded-full hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-all duration-300 active:scale-90 bg-muted/50 border border-transparent hover:border-border"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1">
          <div className="grid gap-4">
            {availableItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="group w-full bg-background hover:bg-primary/5 border border-border rounded-2xl p-4 md:p-5 flex items-center gap-5 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-primary/30 hover:shadow-md animate-in slide-in-from-bottom-6 fade-in"
                style={{ 
                  animationFillMode: 'both', 
                  animationDelay: `${index * 75}ms` 
                }}
              >
                <div className="bg-primary/10 p-3 rounded-xl group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                  <item.icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                
                <span className="text-foreground font-semibold text-lg">{item.label}</span>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full mt-10 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground rounded-2xl p-5 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] font-bold shadow-sm animate-in slide-in-from-bottom-6 fade-in"
            style={{ 
              animationFillMode: 'both', 
              animationDelay: `${availableItems.length * 75 + 100}ms` 
            }}
          >
            <LogOut className="w-5 h-5" />
            <span>Secure Logout</span>
          </button>
        </div>

      </div>
    </div>
  );
}