import { useState, useEffect } from 'react';
import { Menu, Wifi, WifiOff, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

export default function Navbar({ onMenuToggle }) {
  const { user } = useAuth();
  const { connected } = useSocket();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 gap-4 sticky top-0 z-20 shadow-sm">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          id="menu-toggle-btn"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <p className="text-xs text-gray-500">{formatDate(time)}</p>
        </div>
      </div>

      {/* Right: clock, connection status, user */}
      <div className="flex items-center gap-3">
        {/* Live Clock */}
        <div className="hidden md:flex items-center gap-2 text-sm font-mono text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {formatTime(time)}
        </div>

        {/* Connection Status */}
        <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg ${
          connected
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
          <span className="hidden sm:inline">{connected ? 'Live' : 'Offline'}</span>
        </div>

        {/* User avatar */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-sm">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-gray-800 leading-none">{user.name}</p>
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
