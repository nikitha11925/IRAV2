import { ArrowLeft, Clock, User, FileText } from 'lucide-react';

interface LogsProps {
  logs: any[];
  onNavigate: (screen: string) => void;
}

export function Logs({ logs, onNavigate }: LogsProps) {
  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'LOCATE_ITEM': return 'bg-blue-500/20 text-blue-400';
      case 'DELAY_UPDATE': return 'bg-yellow-500/20 text-yellow-400';
      case 'REPORT_HAZARD': return 'bg-red-500/20 text-red-400';
      case 'SHIPMENT_STATUS': return 'bg-purple-500/20 text-purple-400';
      case 'INVENTORY_CHECK': return 'bg-green-500/20 text-green-400';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('menu')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-blue-400">Activity Logs</h1>
            <p className="text-sm text-slate-400">{logs.length} entries</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="space-y-3">
          {logs.slice().reverse().map((log) => (
            <div key={log.id} className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-white">{log.user}</span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs text-slate-500">{log.role}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(log.timestamp)}</span>
                </div>
              </div>

              <div className="mb-2">
                <span className={`inline-block px-2 py-1 rounded text-xs font-mono ${getIntentColor(log.action)}`}>
                  {log.action}
                </span>
              </div>

              <p className="text-sm text-slate-300 mb-2">{log.details}</p>

              <div className="bg-slate-950 rounded p-2 border border-slate-800">
                <p className="text-xs text-slate-500 mb-1">Voice Input:</p>
                <p className="text-xs text-slate-400 font-mono">{log.voiceInput}</p>
              </div>

              <p className="text-xs text-slate-600 mt-2">{formatDate(log.timestamp)}</p>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500">No activity logs yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
