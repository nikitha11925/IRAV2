import { ArrowLeft, Package, MapPin } from 'lucide-react';
import database from '../../data/database.json';

interface InventoryProps {
  onNavigate: (screen: string) => void;
}

export function Inventory({ onNavigate }: InventoryProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'low_stock': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      default: return 'bg-muted text-muted-foreground border-border';
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
          <h1 className="text-xl font-bold text-primary tracking-tight">Inventory Database</h1>
          <p className="text-sm text-muted-foreground font-medium">{database.inventory.length} items tracked</p>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-6 overflow-auto">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {database.inventory.map((item, index) => (
            <div 
              key={item.item} 
              className="bg-background rounded-2xl p-5 border border-border shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 hover:scale-[1.02] animate-in slide-in-from-bottom-6 fade-in"
              style={{ 
                animationFillMode: 'both', 
                animationDelay: `${index * 75}ms` 
              }}
            >
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-xl p-3">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{item.item}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium mt-0.5">
                      <MapPin className="w-4 h-4" />
                      <span>{item.location}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Quantity in Stock</span>
                <span className="text-2xl font-black text-foreground">{item.quantity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}