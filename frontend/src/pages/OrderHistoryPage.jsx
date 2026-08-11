import { useState, useEffect } from 'react';
import { Search, Printer, ChevronDown, ChevronUp, RefreshCw, X, Eye, Calendar, Filter } from 'lucide-react';
import api from '../utils/api';
import ReceiptModal from '../components/receipt/ReceiptModal';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  preparing: 'bg-blue-100 text-blue-800 border-blue-300',
  ready: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-gray-100 text-gray-700 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const PAYMENT_ICONS = { cash: '💵 Cash', card: '💳 Card', upi: '📱 Online / UPI', unpaid: '⏳ Pending' };

function OrderDetailModal({ order, settings, onClose, onReprint }) {
  if (!order) return null;
  const sym = settings?.currencySymbol || 'Rs.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-slate-900 text-white">
          <div>
            <h3 className="font-extrabold text-base">Order Details — {order.orderNumber}</h3>
            <p className="text-xs text-gray-300 mt-0.5">
              {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
            <div><span className="text-xs text-gray-500 block">Type</span><span className="font-bold capitalize">{order.orderType}</span></div>
            {order.tableNumber && <div><span className="text-xs text-gray-500 block">Table</span><span className="font-bold">{order.tableNumber}</span></div>}
            <div><span className="text-xs text-gray-500 block">Customer</span><span className="font-bold">{order.customerName || 'Guest'}</span></div>
            <div><span className="text-xs text-gray-500 block">Payment</span><span className="font-bold">{PAYMENT_ICONS[order.paymentMethod]}</span></div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Itemized List</p>
            <div className="space-y-2">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-xl">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name} <span className="text-teal-700 font-bold">x{item.quantity}</span></p>
                    {item.notes && <p className="text-xs text-orange-600 italic">📝 {item.notes}</p>}
                  </div>
                  <span className="font-bold text-gray-900">{sym}{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bill Summary */}
          <div className="bg-gray-50 rounded-xl p-3.5 space-y-1.5 border border-gray-200 text-xs">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{sym}{order.subtotal?.toFixed(2)}</span></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-semibold"><span>Discount ({order.discountType === 'percent' ? `${order.discountValue}%` : 'Flat'})</span><span>-{sym}{order.discountAmount?.toFixed(2)}</span></div>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-gray-600"><span>GST ({order.taxRate}%)</span><span>{sym}{order.taxAmount?.toFixed(2)}</span></div>
            )}
            <div className="flex justify-between font-extrabold text-sm text-gray-900 border-t border-gray-200 pt-1.5"><span>Grand Total</span><span className="text-teal-700">{sym}{order.grandTotal?.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between gap-3">
          <button
            onClick={() => { onClose(); onReprint(order); }}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Printer size={16} />
            Reprint Receipt
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 font-semibold text-gray-700 rounded-xl text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [reprintOrder, setReprintOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  useEffect(() => {
    api.get('/settings').then(r => setSettings(r.data)).catch(() => {});
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get('/orders', { params });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    setPage(1);
  }, [statusFilter, typeFilter, search, startDate, endDate]);

  const sym = settings?.currencySymbol || 'Rs.';
  const paginated = orders.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(orders.length / PER_PAGE);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-500 text-sm mt-0.5">{orders.length} total recorded transactions</p>
        </div>
        <button
          id="refresh-orders-btn"
          onClick={fetchOrders}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3 shadow-sm">
        <div className="flex flex-wrap gap-3">
          {/* Search by Order Number / Customer */}
          <div className="relative flex-1 min-w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              id="order-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order # (e.g. ORD-1001), customer..."
              className="w-full pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"><X size={14} /></button>}
          </div>

          {/* Status Filter */}
          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Order Type Filter */}
          <select
            id="type-filter"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 bg-white font-medium"
          >
            <option value="">All Order Types</option>
            <option value="dine-in">Dine-in</option>
            <option value="takeaway">Takeaway</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 text-xs font-semibold text-gray-600">
          <Calendar size={14} className="text-gray-400" />
          <span>From:</span>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500"
          />
          <span>To:</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500"
          />
          {(startDate || endDate || search || statusFilter || typeFilter) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); setSearch(''); setStatusFilter(''); setTypeFilter(''); }}
              className="text-xs text-red-500 hover:text-red-700 font-bold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <RefreshCw size={24} className="animate-spin text-teal-600" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-gray-700">No orders match filter criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Order #</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Items</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Payment</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date & Time</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {paginated.map(order => (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrderDetail(order)}
                      className="hover:bg-gray-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3.5 font-mono font-bold text-gray-900">{order.orderNumber}</td>
                      <td className="px-4 py-3.5 text-gray-600 capitalize font-medium">{order.orderType}</td>
                      <td className="px-4 py-3.5 text-gray-700">
                        <div className="font-semibold">{order.customerName || 'Guest'}</div>
                        {order.tableNumber && <div className="text-xs text-gray-400">Table: {order.tableNumber}</div>}
                      </td>
                      <td className="px-4 py-3.5 text-gray-600">{order.items?.length} item(s)</td>
                      <td className="px-4 py-3.5 font-extrabold text-teal-700">{sym}{order.grandTotal?.toFixed(2)}</td>
                      <td className="px-4 py-3.5 text-gray-700 font-medium">
                        {PAYMENT_ICONS[order.paymentMethod] || order.paymentMethod}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.completed}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                        {' '}{new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`view-order-${order._id}`}
                            onClick={() => setSelectedOrderDetail(order)}
                            className="p-1.5 text-gray-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                            title="View Detail"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            id={`reprint-${order._id}`}
                            onClick={() => setReprintOrder(order)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Reprint Receipt"
                          >
                            <Printer size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 font-medium">
                  Showing {(page - 1) * PER_PAGE + 1} - {Math.min(page * PER_PAGE, orders.length)} of {orders.length}
                </p>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-xs font-bold border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Prev</button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-xs font-bold border rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrderDetail && (
        <OrderDetailModal
          order={selectedOrderDetail}
          settings={settings}
          onClose={() => setSelectedOrderDetail(null)}
          onReprint={(ord) => setReprintOrder(ord)}
        />
      )}

      {/* Reprint Receipt Modal */}
      {reprintOrder && (
        <ReceiptModal
          order={reprintOrder}
          settings={settings}
          onClose={() => setReprintOrder(null)}
        />
      )}
    </div>
  );
}
