import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, UtensilsCrossed, ClipboardList,
  BarChart3, Users, Settings, CreditCard, Wallet, TableProperties,
  ChefHat, X, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  // Admin-only
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { path: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin'] },
  // Cashier + Admin
  { path: '/pos', label: 'POS', icon: ShoppingCart, roles: ['admin', 'cashier'] },
  { path: '/orders', label: 'Orders', icon: ClipboardList, roles: ['admin', 'cashier'] },
  { path: '/tables', label: 'Tables', icon: TableProperties, roles: ['admin', 'cashier'] },
  // Kitchen Display
  { path: '/kitchen', label: 'Kitchen Display', icon: ChefHat, roles: ['kitchen', 'admin', 'cashier'] },
  // Admin-only
  { path: '/menu', label: 'Menu Management', icon: UtensilsCrossed, roles: ['admin'] },
  { path: '/expenses', label: 'Expenses', icon: Wallet, roles: ['admin'] },
  { path: '/users', label: 'Staff Users', icon: Users, roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

const roleColors = {
  admin: 'from-violet-600 to-purple-700',
  cashier: 'from-sky-600 to-blue-700',
  kitchen: 'from-orange-600 to-amber-700',
};

const roleLabels = {
  admin: 'Administrator',
  cashier: 'Cashier',
  kitchen: 'Kitchen Staff',
};

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const filteredNav = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed left-0 top-0 h-full z-40 w-64 sidebar-bg flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
              <Flame size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">RestroPOS</h1>
              <p className="text-slate-400 text-xs mt-0.5">Management System</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700">
            <X size={18} />
          </button>
        </div>

        {/* User Card */}
        {user && (
          <div className="mx-3 mt-4 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColors[user.role] || 'from-slate-600 to-slate-700'} flex items-center justify-center mb-2`}>
              <span className="text-white font-bold text-sm">{user.name?.[0]?.toUpperCase()}</span>
            </div>
            <p className="text-white text-sm font-semibold leading-tight truncate">{user.name}</p>
            <p className="text-slate-400 text-xs mt-0.5">{roleLabels[user.role]}</p>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNav.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/30'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                }
              `}
            >
              <Icon size={18} className="flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all duration-150"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>

        {/* Tech Wave Branding */}
        <div className="px-4 pb-4 text-center">
          <p className="text-slate-600 text-[10px] leading-relaxed">
            Powered by
          </p>
          <p className="text-slate-400 text-xs font-bold tracking-wide">
            Tech Wave Software House
          </p>
          <p className="text-slate-600 text-[10px]">03217165022</p>
        </div>
      </aside>
    </>
  );
}
