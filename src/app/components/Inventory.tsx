import { ArrowLeft, Package, MapPin } from 'lucide-react';
import database from '../../data/database.json';

interface InventoryProps {
  onNavigate: (screen: string) => void;
}

export function Inventory({ onNavigate }: InventoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'low_stock': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'low_stock': return 'Low Stock';
      case 'critical': return 'Critical';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <div className="bg-slate-900 p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('menu')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-blue-400">Inventory</h1>
            <p className="text-sm text-slate-400">{database.inventory.length} items</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="grid gap-3">
          {database.inventory.map((item) => (
            <div key={item.item} className="bg-slate-900 rounded-lg p-4 border border-slate-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 rounded-lg p-2">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{item.item}</h3>
                    <div className="flex items-center gap-1 text-sm text-slate-400">
                      <MapPin className="w-3 h-3" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Quantity</span>
                <span className="text-lg font-bold text-white">{item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
