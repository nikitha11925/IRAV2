import { ArrowLeft, Clock, User, FileText, AlertOctagon, Mic } from 'lucide-react';

interface LogsProps {
  logs: any[];
  user?: any; // Added to fix the missing prop reference from the original code
  onNavigate: (screen: string) => void;
}

export function Logs({ logs, user, onNavigate }: LogsProps) {
  
  // Role Protection - Updated with Pastel Tech
  if (!user || !['manager', 'admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 transition-colors duration-500">
        <div className="matte-glass max-w-md w-full rounded-[2rem] p-8 text-center animate-in zoom-in-95 fade-in duration-500 border-t-4 border-t-destructive shadow-xl shadow-destructive/5">
          <div className="bg-destructive/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertOctagon className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Access Denied</h2>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
            Only <span className="text-primary font-bold">Managers</span> and <span className="text-primary font-bold">Admins</span> have clearance to view activity logs.
          </p>
          <button 
            onClick={() => onNavigate('voice')}
            className="w-full bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] rounded-xl px-5 py-3.5 font-bold shadow-sm transition-all duration-300"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'LOCATE_ITEM': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'DELAY_UPDATE': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'REPORT_HAZARD': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'SHIPMENT_STATUS': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'INVENTORY_CHECK': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
          <h1 className="text-xl font-bold text-primary tracking-tight">System Logs</h1>
          <p className="text-sm text-muted-foreground font-medium">{logs.length} recorded events</p>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Timeline Container */}
        <div className="space-y-6 max-w-4xl mx-auto relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-[2px] before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          
          {logs.slice().reverse().map((log, index) => (
            <div 
              key={log.id} 
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-in slide-in-from-bottom-6 fade-in"
              style={{ animationFillMode: 'both', animationDelay: `${index * 75}ms` }}
            >
              
              {/* Timeline Node */}
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-muted text-muted-foreground shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md transition-all duration-300 z-10">
                <Clock className="w-4 h-4" />
              </div>

              {/* Log Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background rounded-2xl p-5 border border-border shadow-sm group-hover:shadow-md group-hover:border-primary/40 transition-all duration-300 group-hover:-translate-y-1">
                
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-xl border border-border/50">
                    <User className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-foreground">{log.user}</span>
                    <span className="text-xs text-muted-foreground font-semibold capitalize px-1.5 py-0.5 bg-background rounded-md border border-border shadow-sm">
                      {log.role}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-bold text-foreground">{formatTime(log.timestamp)}</span>
                    <span className="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{formatDate(log.timestamp)}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold border tracking-wider uppercase shadow-sm ${getIntentColor(log.action)}`}>
                    {log.action}
                  </span>
                </div>

                <p className="text-sm font-medium text-foreground leading-relaxed mb-5">{log.details}</p>

                {/* Nested Matte Box for Voice Input */}
                <div className="bg-input-background rounded-xl p-3 border border-border relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/50"></div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Voice Transcript</p>
                  </div>
                  <p className="text-xs text-foreground font-mono font-semibold">"{log.voiceInput}"</p>
                </div>

              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-20 animate-in fade-in zoom-in-95 duration-500">
              <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm">
                <FileText className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 tracking-tight">No Activity Found</h3>
              <p className="text-muted-foreground font-medium">System logs will appear here once voice interactions occur.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}