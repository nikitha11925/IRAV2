import { ArrowLeft, AlertTriangle, Package, TruckIcon, Shield } from 'lucide-react';
import database from '../../data/database.json';

interface AlertsProps {
  onNavigate: (screen: string) => void;
}

export function Alerts({ onNavigate }: AlertsProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('menu')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-blue-400">Alerts</h1>
            <p className="text-sm text-slate-400">{activeAlerts.length} active</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-sm text-slate-500 mb-3">Active Alerts</h2>
            <div className="space-y-3">
              {activeAlerts.map((alert) => {
                const Icon = getTypeIcon(alert.type);
                return (
                  <div key={alert.id} className="bg-slate-900 rounded-lg p-4 border-2 border-red-500/50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="bg-red-500/20 rounded-lg p-2">
                        <Icon className="w-5 h-5 text-red-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-500">{alert.type}</span>
                        </div>
                        <p className="text-white">{alert.message}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Reported by: {alert.reportedBy}</span>
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                  </div>
                );
              })}

              {activeAlerts.length === 0 && (
                <div className="bg-slate-900 rounded-lg p-8 border border-slate-800 text-center">
                  <AlertTriangle className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                  <p className="text-slate-500">No active alerts</p>
                </div>
              )}
            </div>
          </div>

          {acknowledgedAlerts.length > 0 && (
            <div>
              <h2 className="text-sm text-slate-500 mb-3">Acknowledged</h2>
              <div className="space-y-3">
                {acknowledgedAlerts.map((alert) => {
                  const Icon = getTypeIcon(alert.type);
                  return (
                    <div key={alert.id} className="bg-slate-900 rounded-lg p-4 border border-slate-800 opacity-60">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-slate-800 rounded-lg p-2">
                          <Icon className="w-5 h-5 text-slate-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-slate-400">{alert.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{alert.reportedBy}</span>
                        <span>{formatTime(alert.timestamp)}</span>
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
