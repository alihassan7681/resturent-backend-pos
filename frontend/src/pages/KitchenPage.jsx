import { useState, useEffect, useCallback } from 'react';
import { Clock, AlertTriangle, Zap, RefreshCw, Search, X } from 'lucide-react';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';

const STATUS_CONFIG = {
  pending: {
    color: 'border-amber-400 bg-amber-50',
    headerColor: 'bg-amber-500',
    action: { label: 'Start Preparing', next: 'preparing', color: 'bg-blue-600 hover:bg-blue-700' },
  },
  preparing: {
    color: 'border-blue-400 bg-blue-50',
    headerColor: 'bg-blue-600',
    action: { label: 'Mark Ready', next: 'ready', color: 'bg-green-600 hover:bg-green-700' },
  },
  ready: {
    color: 'border-green-400 bg-green-50',
    headerColor: 'bg-green-600',
    action: { label: 'Complete', next: 'completed', color: 'bg-slate-700 hover:bg-slate-800' },
  },
};

function ElapsedTimer({ createdAt }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const calc = () => setSec(Math.max(0, Math.floor((Date.now() - new Date(createdAt)) / 1000)));
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [createdAt]);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const isUrgent = m >= 15;
  const isWarning = m >= 10;
  return (
    <span className={`flex items-center gap-1 font-mono text-xs font-bold px-2 py-0.5 rounded-full ${
      isUrgent ? 'bg-red-600 text-white animate-pulse' :
      isWarning ? 'bg-amber-500 text-white' : 'bg-black/20 text-white'
    }`}>
      <Clock size={11} />
      {m}:{String(s).padStart(2, '0')}
      {isUrgent && <AlertTriangle size={11} />}
    </span>
  );
}

function OrderCard({ order, onStatusChange }) {
  const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
  const typeEmoji = { 'dine-in': '🍽️', takeaway: '🛍️', delivery: '🛵' };

  return (
    <div className={`rounded-2xl border-2 overflow-hidden shadow-lg ${cfg.color}`}>
      {/* Card Header */}
      <div className={`${cfg.headerColor} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-white font-black text-lg tracking-tight">{order.orderNumber}</span>
          <span>{typeEmoji[order.orderType] || '🍽️'}</span>
          {order.tableNumber && (
            <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {order.tableNumber}
            </span>
          )}
        </div>
        <ElapsedTimer createdAt={order.createdAt} />
      </div>

      {/* Items */}
      <div className="p-3 space-y-2">
        {order.items.map((item, i) => (
          <div key={item._id || i} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm">
            <span className="bg-slate-900 text-white text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
              {item.quantity}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
              {item.notes && (
                <p className="text-xs text-orange-600 font-medium mt-0.5 italic">📝 {item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="px-3 pb-3">
        <button
          onClick={() => onStatusChange(order._id, cfg.action.next)}
          className={`w-full ${cfg.action.color} text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 shadow active:scale-95 transition-all`}
        >
          <Zap size={14} />
          {cfg.action.label}
        </button>
      </div>
    </div>
  );
}

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { subscribe } = useSocket();

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders/active');
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  useEffect(() => {
    const unsubCreate = subscribe('order:created', (order) => {
      setOrders(prev => [order, ...prev.filter(o => o._id !== order._id)]);
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
      } catch {}
    });
    const unsubUpdate = subscribe('order:updated', (order) => {
      if (['completed', 'cancelled'].includes(order.orderStatus)) {
        setOrders(prev => prev.filter(o => o._id !== order._id));
      } else {
        setOrders(prev => prev.map(o => o._id === order._id ? order : o));
      }
    });
    return () => { unsubCreate(); unsubUpdate(); };
  }, [subscribe]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      if (newStatus === 'completed') setOrders(prev => prev.filter(o => o._id !== orderId));
      const res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (newStatus !== 'completed') setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
    } catch { fetchOrders(); }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <RefreshCw size={40} className="animate-spin text-orange-500" />
      </div>
    );
  }

  const filtered = search.trim()
    ? orders.filter(o => o.orderNumber.toLowerCase().includes(search.toLowerCase()))
    : orders;

  if (filtered.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-950 text-slate-500">
        <span className="text-7xl mb-4">✅</span>
        <p className="text-2xl font-bold">Kitchen is all clear!</p>
        <p className="text-sm mt-2">No active orders right now</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-slate-950 p-4">
      {/* Search Bar */}
      <div className="relative max-w-xs mb-4">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search order no..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-orange-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(order => (
          <OrderCard key={order._id} order={order} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </div>
  );
}
