import { useState, useEffect } from 'react';
import { Search, ShoppingCart, X, Plus, Minus, Trash2, Tag, CreditCard, Smartphone, Banknote, Table2, Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import ReceiptModal from '../components/receipt/ReceiptModal';

const ORDER_TYPES = [
  { id: 'dine-in', label: 'Dine-in', icon: '🍽️' },
  { id: 'takeaway', label: 'Takeaway', icon: '🛍️' },
  { id: 'delivery', label: 'Delivery', icon: '🛵' },
];

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'upi', label: 'Online / UPI', icon: Smartphone },
];

export default function PosPage() {
  const { user } = useAuth();
  const cart = useCart();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [settings, setSettings] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [showTableModal, setShowTableModal] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [editingNote, setEditingNote] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, itemRes, tableRes, settingRes] = await Promise.all([
          api.get('/menu/categories'),
          api.get('/menu/items'),
          api.get('/tables'),
          api.get('/settings'),
        ]);
        setCategories(catRes.data);
        setMenuItems(itemRes.data);
        setTables(tableRes.data.filter(t => t.status === 'available'));
        setSettings(settingRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMenu(false);
      }
    };
    fetchData();
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchCat = activeCategory === 'all' || item.category?._id === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;

    setPlacing(true);
    try {
      const orderPayload = {
        orderType: cart.orderType,
        tableNumber: cart.tableNumber,
        customerName: cart.customerName || 'Guest',
        customerPhone: cart.customerPhone,
        items: cart.items.map(i => ({
          menuItem: i._id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          notes: i.notes || '',
        })),
        subtotal: cart.subtotal,
        discountType: cart.discountType,
        discountValue: cart.discountValue,
        discountAmount: cart.discountAmount,
        taxRate: cart.taxRate,
        taxAmount: cart.taxAmount,
        grandTotal: cart.grandTotal,
        paymentMethod: cart.paymentMethod,
        paymentStatus: 'completed',
      };

      const res = await api.post('/orders', orderPayload);
      const order = res.data;

      // Checkout & update status
      await api.put(`/orders/${order._id}/checkout`, {
        paymentMethod: cart.paymentMethod,
        discountType: cart.discountType,
        discountValue: cart.discountValue,
        discountAmount: cart.discountAmount,
        taxRate: cart.taxRate,
        taxAmount: cart.taxAmount,
        grandTotal: cart.grandTotal,
      });

      setCompletedOrder({ ...order, cashier: { name: user?.name } });
      setShowReceipt(true);
      triggerToast(`Order ${order.orderNumber} placed & paid successfully!`);
      cart.clearCart();
    } catch (err) {
      console.error('Order placement error:', err);
      alert('Failed to place order: ' + (err.response?.data?.message || 'Unknown error'));
    } finally {
      setPlacing(false);
    }
  };

  const sym = settings?.currencySymbol || 'Rs.';

  return (
    <div className="flex h-full overflow-hidden bg-gray-50 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 size={20} className="text-green-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Menu Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header & Search Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 space-y-3 shadow-sm">
          {/* Order Type Tabs */}
          <div className="flex items-center gap-2">
            {ORDER_TYPES.map(type => (
              <button
                key={type.id}
                id={`order-type-${type.id}`}
                onClick={() => {
                  cart.setOrderType(type.id);
                  if (type.id !== 'dine-in') cart.setTableNumber('');
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  cart.orderType === type.id
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-md shadow-teal-900/20'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}

            {/* Dine-in Table Selector */}
            {cart.orderType === 'dine-in' && (
              <div className="ml-auto flex items-center gap-2">
                <button
                  id="select-table-btn"
                  onClick={() => setShowTableModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-dashed border-teal-400 text-teal-700 hover:border-teal-600 hover:bg-teal-50 transition-all bg-white"
                >
                  <Table2 size={16} />
                  {cart.tableNumber ? `Table ${cart.tableNumber}` : 'Select Table'}
                </button>
                <input
                  type="text"
                  value={cart.tableNumber}
                  onChange={e => cart.setTableNumber(e.target.value)}
                  placeholder="No."
                  className="w-16 px-2.5 py-1.5 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:border-teal-500 font-bold"
                />
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="menu-search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search dishes, burgers, beverages..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Category
            </button>
            {categories.map(cat => (
              <button
                key={cat._id}
                onClick={() => setActiveCategory(cat._id)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat._id
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={activeCategory === cat._id ? { backgroundColor: cat.color || '#0d9488' } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loadingMenu ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 size={32} className="animate-spin text-teal-600" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <span className="text-5xl mb-3">🍕</span>
              <p className="font-semibold text-gray-600">No items match your search</p>
            </div>
          ) : (
            <div className="pos-menu-grid">
              {filteredItems.map(item => (
                <button
                  key={item._id}
                  id={`menu-item-${item._id}`}
                  onClick={() => item.isAvailable && cart.addItem(item)}
                  disabled={!item.isAvailable}
                  className={`relative bg-white rounded-2xl border-2 p-3 text-left transition-all duration-200 group shadow-sm flex flex-col justify-between ${
                    !item.isAvailable
                      ? 'opacity-50 cursor-not-allowed border-gray-200'
                      : 'border-gray-100 hover:border-teal-500 hover:shadow-md cursor-pointer active:scale-95'
                  }`}
                >
                  {/* Veg / Non-Veg Badge */}
                  <div className={`absolute top-2 right-2 w-4 h-4 rounded-sm border-2 flex items-center justify-center bg-white ${
                    item.isVeg ? 'border-green-600' : 'border-red-600'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                  </div>

                  <div>
                    {/* Item Image */}
                    <div className="w-full aspect-video rounded-xl overflow-hidden mb-2 bg-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=60'}
                      />
                    </div>
                    <p className="text-gray-900 font-bold text-sm leading-snug mb-1 line-clamp-2">{item.name}</p>
                    {item.code && <p className="text-gray-400 text-xs mb-1 font-mono">{item.code}</p>}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-teal-700 font-extrabold text-base">{sym}{item.price}</span>
                    {!item.isAvailable ? (
                      <span className="text-red-500 text-xs font-semibold">Sold Out</span>
                    ) : (
                      <span className="w-7 h-7 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white flex items-center justify-center font-bold text-base transition-colors">
                        +
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Cart */}
      <div className="w-80 xl:w-96 bg-white border-l border-gray-200 flex flex-col shadow-xl">
        {/* Cart Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-teal-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Live Order Cart</h2>
            {cart.itemCount > 0 && (
              <span className="bg-teal-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </div>
          {cart.items.length > 0 && (
            <button
              onClick={cart.clearCart}
              className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Customer Details */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex gap-2">
          <input
            type="text"
            placeholder="Customer Name"
            value={cart.customerName}
            onChange={e => cart.setCustomerName(e.target.value)}
            className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 bg-white"
          />
          <input
            type="text"
            placeholder="Phone (Optional)"
            value={cart.customerPhone}
            onChange={e => cart.setCustomerPhone(e.target.value)}
            className="w-32 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 bg-white"
          />
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto">
          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-4">
              <ShoppingCart size={56} className="mb-3 text-gray-300" />
              <p className="font-bold text-gray-600">Cart is empty</p>
              <p className="text-xs text-gray-400 mt-1">Tap items on the left to start order</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {cart.items.map(item => (
                <div key={item._id} className="bg-gray-50 rounded-2xl p-3 border border-gray-200/60 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="text-sm font-bold text-gray-900 leading-tight flex-1">{item.name}</p>
                    <button
                      onClick={() => cart.removeItem(item._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
                      <button
                        onClick={() => cart.updateQuantity(item._id, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-teal-100 hover:text-teal-800 flex items-center justify-center transition-colors font-bold text-gray-700"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="text-sm font-extrabold text-gray-900 w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item._id, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-teal-100 hover:text-teal-800 flex items-center justify-center transition-colors font-bold text-gray-700"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="text-teal-700 font-extrabold text-base">{sym}{(item.price * item.quantity).toFixed(2)}</span>
                  </div>

                  {/* Notes */}
                  {editingNote === item._id ? (
                    <input
                      autoFocus
                      value={item.notes || ''}
                      onChange={e => cart.updateNotes(item._id, e.target.value)}
                      onBlur={() => setEditingNote(null)}
                      placeholder="e.g. Extra spicy, no onions..."
                      className="mt-2 w-full text-xs border border-teal-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500"
                    />
                  ) : (
                    <button
                      onClick={() => setEditingNote(item._id)}
                      className="mt-1.5 text-xs text-gray-400 hover:text-teal-600 transition-colors flex items-center gap-1"
                    >
                      <Tag size={11} />
                      {item.notes ? <span className="text-teal-700 font-medium">"{item.notes}"</span> : 'Add special note...'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Discount, Payment Method & Checkout */}
        {cart.items.length > 0 && (
          <div className="border-t border-gray-200 p-4 space-y-3 bg-gray-50">
            {/* Discount Selector */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Discount</span>
                <span className="text-xs text-gray-400 font-medium">Applied: {sym}{cart.discountAmount.toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex rounded-xl border border-gray-200 bg-white overflow-hidden p-0.5">
                  <button
                    onClick={() => cart.setDiscountType('flat')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      cart.discountType === 'flat' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {sym} Flat
                  </button>
                  <button
                    onClick={() => cart.setDiscountType('percent')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      cart.discountType === 'percent' ? 'bg-teal-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    % Percent
                  </button>
                </div>
                <input
                  id="discount-input"
                  type="number"
                  min="0"
                  value={cart.discountValue || ''}
                  onChange={e => cart.setDiscountValue(Number(e.target.value))}
                  placeholder={cart.discountType === 'percent' ? '0 %' : '0.00'}
                  className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500 font-semibold bg-white"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Payment Method</p>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    id={`payment-${id}`}
                    onClick={() => cart.setPaymentMethod(id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs font-bold ${
                      cart.paymentMethod === id
                        ? 'border-teal-600 bg-teal-50 text-teal-800 shadow-sm'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculations Summary */}
            <div className="bg-white rounded-xl p-3 border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600 font-medium">
                <span>Subtotal</span>
                <span>{sym}{cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Discount</span>
                  <span>-{sym}{cart.discountAmount.toFixed(2)}</span>
                </div>
              )}
              {cart.taxRate > 0 && (
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>GST ({cart.taxRate}%)</span>
                  <span>{sym}{cart.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 font-extrabold text-sm border-t border-gray-200 pt-1.5">
                <span>GRAND TOTAL</span>
                <span className="text-teal-700 text-base">{sym}{cart.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Big Checkout Button */}
            <button
              id="checkout-btn"
              onClick={handlePlaceOrder}
              disabled={placing || cart.items.length === 0}
              className="w-full bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 hover:from-teal-500 hover:to-cyan-600 disabled:opacity-50 text-white font-extrabold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-teal-900/30 text-base active:scale-95"
            >
              {placing ? <Loader2 size={20} className="animate-spin" /> : null}
              {placing ? 'Processing Order...' : `Checkout & Print • ${sym}${cart.grandTotal.toFixed(2)}`}
            </button>
          </div>
        )}
      </div>

      {/* Table Selector Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={() => setShowTableModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-gray-900 text-base">Select Dining Table</h3>
              <button onClick={() => setShowTableModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X size={18} />
              </button>
            </div>

            {/* Custom Table Number Input */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Enter Table Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={cart.tableNumber}
                  onChange={e => cart.setTableNumber(e.target.value)}
                  placeholder="e.g. T-1, Table 5, Bar-2"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-bold"
                />
                <button
                  onClick={() => setShowTableModal(false)}
                  className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-teal-700"
                >
                  Set
                </button>
              </div>
            </div>

            {/* Preset Tables Grid */}
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Available Tables</p>
            {tables.length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-4">No active tables found</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto">
                {tables.map(t => (
                  <button
                    key={t._id}
                    id={`table-btn-${t.tableNumber}`}
                    onClick={() => {
                      cart.setTableNumber(t.tableNumber);
                      setShowTableModal(false);
                    }}
                    className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${
                      cart.tableNumber === t.tableNumber
                        ? 'border-teal-600 bg-teal-50 text-teal-800'
                        : 'border-gray-200 hover:border-teal-400 text-gray-700'
                    }`}
                  >
                    <div className="text-xl mb-0.5">🪑</div>
                    <div>{t.tableNumber}</div>
                    <div className="text-[10px] text-gray-400 font-normal">{t.capacity} seats</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dual Receipts Modal (Kitchen KOT + Customer Bill) */}
      {showReceipt && completedOrder && (
        <ReceiptModal
          order={completedOrder}
          settings={settings}
          onClose={() => { setShowReceipt(false); setCompletedOrder(null); }}
        />
      )}
    </div>
  );
}
