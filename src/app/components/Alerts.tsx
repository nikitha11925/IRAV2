import { ArrowLeft, AlertTriangle, Package, TruckIcon, Shield } from 'lucide-react';
import database from '../../data/database.json';

interface AlertsProps {
  onNavigate: (screen: string) => void;
}

export function Alerts({ onNavigate }: AlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'high': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'medium': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'hazard': return Shield;
      case 'inventory': return Package;
      case 'shipment': return TruckIcon;
      default: return AlertTriangle;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeAlerts = database.alerts.filter(a => a.status === 'active');
  const acknowledgedAlerts = database.alerts.filter(a => a.status === 'acknowledged');

  return (
    <div className="min-h-screen bg-background flex flex-col transition-colors duration-500">
      
      {/* Sticky Matte Header */}
      <div className="matte-glass sticky top-0 z-10 p-4 md:px-6 border-b border-border flex items-center gap-4">
        <button 
          onClick={() => onNavigate('menu')} 
          className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-all duration-300 active:scale-90 bg-muted/50 border border-transparent hover:border-border"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-primary tracking-tight">System Alerts</h1>
          <p className="text-sm text-muted-foreground font-medium">{activeAlerts.length} requiring attention</p>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="space-y-8 max-w-3xl mx-auto">
          
          {/* Active Alerts Section */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-1">Active Alerts</h2>
            <div className="space-y-4">
              {activeAlerts.map((alert, index) => {
                const Icon = getTypeIcon(alert.type);
                return (
                  <div 
                    key={alert.id} 
                    className="matte-glass rounded-2xl p-5 border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.01] animate-in slide-in-from-bottom-4 fade-in"
                    style={{ 
                      animationFillMode: 'both', 
                      animationDelay: `${index * 100}ms` 
                    }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="bg-destructive/10 rounded-xl p-3">
                        <Icon className="w-6 h-6 text-destructive" />
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-muted-foreground capitalize">{alert.type}</span>
                        </div>
                        <p className="text-foreground font-medium text-lg leading-snug">{alert.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium text-muted-foreground pt-4 border-t border-border/50">
                      <span>Reported by: <span className="text-foreground">{alert.reportedBy}</span></span>
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                  </div>
                );
              })}

              {/* Empty State */}
              {activeAlerts.length === 0 && (
                <div className="bg-background rounded-3xl p-10 border border-border text-center shadow-sm animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-emerald-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-1">All Clear</h3>
                  <p className="text-muted-foreground font-medium">No active alerts at this time.</p>
                </div>
              )}
            </div>
          </div>

          {/* Acknowledged Alerts Section */}
          {acknowledgedAlerts.length > 0 && (
            <div className="animate-in fade-in duration-700 delay-300">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 pl-1">Acknowledged Log</h2>
              <div className="space-y-3">
                {acknowledgedAlerts.map((alert) => {
                  const Icon = getTypeIcon(alert.type);
                  return (
                    <div 
                      key={alert.id} 
                      className="bg-muted/30 rounded-2xl p-4 border border-border/50 opacity-70 hover:opacity-100 transition-opacity duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-muted rounded-lg p-2.5 mt-0.5">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityColor(alert.severity)} opacity-80`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-xs text-muted-foreground">{formatTime(alert.timestamp)}</span>
                          </div>
                          <p className="text-foreground text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">Ack by: {alert.reportedBy}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}