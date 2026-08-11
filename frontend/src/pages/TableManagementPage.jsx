import { useState, useEffect } from 'react';
import { Plus, Trash2, X, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../utils/api';

const TABLE_STATUS_COLORS = {
  available: 'bg-green-50 border-green-300 text-green-700',
  occupied: 'bg-red-50 border-red-300 text-red-700',
  reserved: 'bg-amber-50 border-amber-300 text-amber-700',
};

export default function TableManagementPage() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4 });
  const [saving, setSaving] = useState(false);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tables');
      setTables(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/tables', form);
      await fetchTables();
      setShowModal(false);
      setForm({ tableNumber: '', capacity: 4 });
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleRelease = async (id) => {
    try {
      await api.put(`/tables/${id}`, { status: 'available', currentOrderId: null });
      await fetchTables();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    await api.delete(`/tables/${id}`);
    await fetchTables();
  };

  const counts = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">Floor plan & table status</p>
        </div>
        <button id="add-table-btn" onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-orange-200">
          <Plus size={16} /> Add Table
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Tables', value: counts.total, color: 'bg-slate-600' },
          { label: 'Available', value: counts.available, color: 'bg-green-600' },
          { label: 'Occupied', value: counts.occupied, color: 'bg-red-600' },
          { label: 'Reserved', value: counts.reserved, color: 'bg-amber-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <div className={`w-3 h-3 rounded-full ${color} mx-auto mb-2`} />
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Tables Floor Plan Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 size={24} className="animate-spin text-orange-500" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map(table => (
            <div key={table._id} className={`rounded-2xl border-2 p-4 text-center transition-all hover:shadow-md ${TABLE_STATUS_COLORS[table.status]}`}>
              <div className="text-3xl mb-2">
                {table.status === 'available' ? '🟢' : table.status === 'occupied' ? '🔴' : '🟡'}
              </div>
              <p className="font-black text-xl">{table.tableNumber}</p>
              <p className="text-xs mt-0.5 opacity-70">{table.capacity} seats</p>
              <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${
                table.status === 'available' ? 'bg-green-100 text-green-700' :
                table.status === 'occupied' ? 'bg-red-100 text-red-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {table.status}
              </span>
              {table.currentOrderId && (
                <div className="mt-2 text-xs bg-white/60 rounded-lg p-1.5">
                  Order: {table.currentOrderId.orderNumber || 'Active'}
                </div>
              )}
              <div className="flex gap-1.5 mt-3">
                {table.status === 'occupied' && (
                  <button onClick={() => handleRelease(table._id)}
                    className="flex-1 py-1.5 bg-white/80 hover:bg-white text-green-700 text-xs font-semibold rounded-lg border border-green-300 transition-all">
                    Release
                  </button>
                )}
                <button onClick={() => handleDelete(table._id)}
                  className="py-1.5 px-3 bg-white/80 hover:bg-white text-red-600 text-xs font-semibold rounded-lg border border-red-300 transition-all">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Add New Table</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Table Number *</label>
                <input required value={form.tableNumber} onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="e.g. T-9 or A1" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Seating Capacity</label>
                <select value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white">
                  {[2, 4, 6, 8, 10, 12].map(n => <option key={n} value={n}>{n} Seats</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Add Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
