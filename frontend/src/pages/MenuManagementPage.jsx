import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, ToggleLeft, ToggleRight, Search, Leaf, Drumstick } from 'lucide-react';
import api from '../utils/api';

const DEFAULT_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
];

function MenuItemModal({ item, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    name: item?.name || '',
    code: item?.code || '',
    category: item?.category?._id || item?.category || categories[0]?._id || '',
    price: item?.price || '',
    description: item?.description || '',
    image: item?.image || DEFAULT_IMAGES[0],
    isVeg: item?.isVeg !== undefined ? item.isVeg : true,
    isAvailable: item?.isAvailable !== undefined ? item.isAvailable : true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      alert('Error saving item: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">{item ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Item Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="e.g. Butter Chicken" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Item Code</label>
              <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="e.g. MC-01" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Price (Rs.) *</label>
              <input required type="number" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="0.00" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Category *</label>
              <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 bg-white">
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 resize-none" placeholder="Short description of the item..." />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Image URL</label>
              <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Type</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setForm(f => ({ ...f, isVeg: true }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.isVeg ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500'}`}>
                  <Leaf size={14} /> Veg
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, isVeg: false }))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${!form.isVeg ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500'}`}>
                  <Drumstick size={14} /> Non-Veg
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5">Availability</label>
              <button type="button" onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${form.isAvailable ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-500'}`}>
                {form.isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {form.isAvailable ? 'Available' : 'Unavailable'}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" disabled={saving} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {item ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuManagementPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, itemRes] = await Promise.all([
        api.get('/menu/categories'),
        api.get('/menu/items'),
      ]);
      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveItem = async (form) => {
    if (editingItem) {
      await api.put(`/menu/items/${editingItem._id}`, form);
    } else {
      await api.post('/menu/items', form);
    }
    await fetchData();
    setEditingItem(null);
    setShowAddModal(false);
  };

  const handleToggle = async (id) => {
    await api.patch(`/menu/items/${id}/availability`);
    await fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    await api.delete(`/menu/items/${id}`);
    await fetchData();
  };

  const filtered = items.filter(i => {
    const matchCat = catFilter === 'all' || i.category?._id === catFilter;
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 text-sm mt-0.5">{items.length} items across {categories.length} categories</p>
        </div>
        <button id="add-menu-item-btn" onClick={() => { setEditingItem(null); setShowAddModal(true); }}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors shadow-md shadow-orange-200">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-orange-400" />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setCatFilter('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${catFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            All
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => setCatFilter(c._id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${catFilter === c._id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              style={catFilter === c._id ? { backgroundColor: c.color } : {}}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 size={32} className="animate-spin text-orange-500" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map(item => (
            <div key={item._id} className={`bg-white rounded-2xl border-2 overflow-hidden shadow-sm transition-all hover:shadow-md ${!item.isAvailable ? 'opacity-60' : 'border-gray-100'}`}>
              <div className="relative">
                <img src={item.image} alt={item.name} className="w-full aspect-video object-cover"
                  onError={e => e.target.src = DEFAULT_IMAGES[0]} />
                <div className={`absolute top-2 left-2 w-4 h-4 rounded-sm border-2 flex items-center justify-center bg-white ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                </div>
                {!item.isAvailable && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-lg">UNAVAILABLE</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                {item.code && <p className="text-xs text-gray-400 mt-0.5">{item.code}</p>}
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-orange-600 font-bold text-sm">Rs.{item.price}</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{item.category?.name?.split(' ')[0]}</span>
                </div>
                <div className="flex gap-1.5 mt-2.5">
                  <button onClick={() => handleToggle(item._id)} title="Toggle availability"
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:border-blue-400 hover:text-blue-600 text-gray-500 transition-all">
                    {item.isAvailable ? <ToggleRight size={14} className="mx-auto" /> : <ToggleLeft size={14} className="mx-auto" />}
                  </button>
                  <button onClick={() => { setEditingItem(item); setShowAddModal(true); }}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:border-orange-400 hover:text-orange-600 text-gray-500 transition-all">
                    <Pencil size={14} className="mx-auto" />
                  </button>
                  <button onClick={() => handleDelete(item._id)}
                    className="flex-1 py-1.5 text-xs font-medium rounded-lg border border-gray-200 hover:border-red-400 hover:text-red-600 text-gray-500 transition-all">
                    <Trash2 size={14} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showAddModal || editingItem) && (
        <MenuItemModal
          item={editingItem}
          categories={categories}
          onSave={handleSaveItem}
          onClose={() => { setShowAddModal(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}
