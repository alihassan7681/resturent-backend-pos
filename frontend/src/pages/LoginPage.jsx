import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Eye, EyeOff, Loader2, ChefHat, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const quickLogins = [
  { label: 'Admin', email: 'admin@restro.com', password: 'password123', icon: LayoutDashboard, color: 'from-violet-600 to-purple-700', desc: 'Full system access' },
  { label: 'Cashier', email: 'cashier@restro.com', password: 'password123', icon: ShoppingCart, color: 'from-sky-600 to-blue-700', desc: 'POS & Order management' },
  { label: 'Kitchen', email: 'kitchen@restro.com', password: 'password123', icon: ChefHat, color: 'from-orange-600 to-amber-700', desc: 'Kitchen Display System' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e, qEmail, qPassword) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(qEmail || email, qPassword || password);
      const routes = { admin: '/dashboard', cashier: '/pos', kitchen: '/kitchen' };
      navigate(routes[user.role] || '/pos');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-4xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Branding */}
          <div className="hidden lg:block text-center lg:text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-2xl shadow-orange-900/40">
                <Flame size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-white text-3xl font-extrabold">RestroPOS</h1>
                <p className="text-slate-400 text-sm">Restaurant Management System</p>
              </div>
            </div>
            <h2 className="text-white text-2xl font-bold mb-3 leading-snug">
              Streamline your<br />restaurant operations
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">
              Complete POS system with real-time Kitchen Display, multi-role access, automated receipts, and powerful analytics dashboard.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {['Real-time KDS', 'Dual Receipts', 'Role Access', 'Analytics'].map(f => (
                <div key={f} className="flex items-center gap-2 text-slate-300 text-sm">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Login Form */}
          <div className="bg-white/[0.05] backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Flame size={16} className="text-white" />
              </div>
              <span className="text-white font-bold text-lg">RestroPOS</span>
            </div>

            <h2 className="text-white text-xl font-bold mb-1">Welcome back</h2>
            <p className="text-slate-400 text-sm mb-6">Sign in to your account</p>

            {/* Quick Login Buttons */}
            <div className="mb-6">
              <p className="text-slate-400 text-xs font-medium mb-3 uppercase tracking-wider">Quick Demo Login</p>
              <div className="grid grid-cols-3 gap-2">
                {quickLogins.map(({ label, email: qEmail, password: qPwd, icon: Icon, color, desc }) => (
                  <button
                    key={label}
                    id={`quick-login-${label.toLowerCase()}`}
                    onClick={() => handleLogin(null, qEmail, qPwd)}
                    disabled={loading}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gradient-to-br ${color} hover:opacity-90 transition-all duration-200 disabled:opacity-50 shadow-lg`}
                  >
                    <Icon size={18} className="text-white" />
                    <span className="text-white text-xs font-semibold">{label}</span>
                    <span className="text-white/70 text-xs hidden sm:block text-center leading-tight">{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <hr className="flex-1 border-slate-700" />
              <span className="text-slate-500 text-xs">or sign in manually</span>
              <hr className="flex-1 border-slate-700" />
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-900/30 border border-red-700/50 text-red-300 text-sm px-4 py-3 rounded-xl">
                  {error}
                </div>
              )}
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Email Address</label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@restro.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="text-slate-300 text-sm font-medium block mb-1.5">Password</label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/30"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-slate-500 text-xs mt-4 text-center">
              Default password for all demo accounts: <span className="text-slate-300 font-mono">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
