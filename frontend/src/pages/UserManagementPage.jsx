import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Shield, ShoppingCart, ChefHat } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ROLE_CONFIG = {
  admin: { label: 'Admin', icon: Shield, color: 'bg-violet-100 text-violet-700' },
  cashier: { label: 'Cashier', icon: ShoppingCart, color: 'bg-blue-100 text-blue-700' },
  kitchen: { label: 'Kitchen', icon: ChefHat, color: 'bg-orange-100 text-orange-700' },
};

function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', password: '', role: user?.role || 'cashier', active: user?.active !== false });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...form };
      if (!data.password) delete data.password;
      await onSave(data);
      onClose();
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{user ? 'Edit Staff User' : 'Add Staff User'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Full Name *</label>
            <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="e.g. John Smith" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Email Address *</label>
            <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="staff@restro.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">
              {user ? 'New Password (leave blank to keep)' : 'Password *'}
            </label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required={!user}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="Min 6 characters" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ROLE_CONFIG).map(([role, { label, icon: Icon }]) => (
                <button key={role} type="button" onClick={() => setForm(f => ({ ...f, role }))}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-semibold ${form.role === role ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-800">Account Active</p>
              <p className="text-xs text-gray-400">Inactive users cannot log in</p>
            </div>
            <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              className={`w-12 h-6 rounded-full transition-all relative ${form.active ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all ${form.active ? 'left-6' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {user ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (form) => {
    if (editingUser) {
      await api.put(`/auth/users/${editingUser._id}`, form);
    } else {
      await api.post('/auth/users', form);
    }
    await fetchUsers();
    setEditingUser(null);
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    if (id === currentUser._id) return alert("You can't delete your own account.");
    if (!window.confirm('Delete this user?')) return;
    await api.delete(`/auth/users/${id}`);
    await fetchUsers();
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{users.length} total staff members</p>
        </div>
        <button id="add-user-btn" onClick={() => { setEditingUser(null); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-orange-200">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-3 flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-orange-500" /></div>
        ) : users.map(u => {
          const roleCfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.cashier;
          const RoleIcon = roleCfg.icon;
          return (
            <div key={u._id} className={`bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow ${!u.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{u.name}</p>
                    <p className="text-gray-400 text-xs truncate max-w-32">{u.email}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleCfg.color}`}>
                  <RoleIcon size={11} />
                  {roleCfg.label}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${u.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-500">{u.active ? 'Active' : 'Inactive'}</span>
                  {u._id === currentUser?._id && (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-semibold">You</span>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditingUser(u); setShowAddModal(true); }}
                    className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(u._id)} disabled={u._id === currentUser?._id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {(showAddModal || editingUser) && (
        <UserModal
          user={editingUser}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingUser(null); }}
        />
      )}
    </div>
  );
}
