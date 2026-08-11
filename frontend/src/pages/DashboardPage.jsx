import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { ShoppingBag, Wallet, TrendingUp, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  preparing: 'bg-blue-100 text-blue-800 border-blue-300',
  ready: 'bg-green-100 text-green-800 border-green-300',
  completed: 'bg-gray-100 text-gray-700 border-gray-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [range, setRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, chartRes, setRes] = await Promise.all([
          api.get('/reports/dashboard/summary'),
          api.get(`/reports/dashboard/sales-chart?range=${range}`),
          api.get('/settings'),
        ]);
        setSummary(sumRes.data);
        setChartData(chartRes.data);
        setSettings(setRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  const sym = settings?.currencySymbol || 'Rs.';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  const isPctPositive = (summary?.salesComparisonPct || 0) >= 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Real-time store performance & business insights</p>
        </div>
      </div>

      {/* Top Row: 4 Clickable Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Sale */}
        <div
          id="stat-card-sales"
          onClick={() => navigate('/orders')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-teal-200">
              <Wallet size={20} />
            </div>
            <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${
              isPctPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {isPctPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {Math.abs(summary?.salesComparisonPct || 0)}% vs yesterday
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-900 group-hover:text-teal-700 transition-colors">
              {sym}{(summary?.todaySales || 0).toFixed(0)}
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">Today's Sales</p>
            <p className="text-xs text-gray-400 mt-1">Click to view today's orders →</p>
          </div>
        </div>

        {/* Card 2: Today's Profit */}
        <div
          id="stat-card-profit"
          onClick={() => navigate('/expenses')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
              <Wallet size={20} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-700 transition-colors">
              {sym}{(summary?.todayProfit || 0).toFixed(0)}
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">Today's Profit</p>
            <p className="text-xs text-gray-400 mt-1">Sales minus expenses →</p>
          </div>
        </div>

        {/* Card 3: Total Orders */}
        <div
          id="stat-card-orders"
          onClick={() => navigate('/orders')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors">
              {summary?.todayOrdersCount || 0}
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">Today's Orders</p>
            <p className="text-xs text-gray-400 mt-1">Completed orders today →</p>
          </div>
        </div>

        {/* Card 4: Avg Order Value */}
        <div
          id="stat-card-aov"
          onClick={() => navigate('/reports')}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-200">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-900 group-hover:text-orange-700 transition-colors">
              {sym}{summary?.todayAvgOrderValue || 0}
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-0.5">Avg Order Value</p>
            <p className="text-xs text-gray-400 mt-1">Detailed sales report →</p>
          </div>
        </div>
      </div>

      {/* Alerts Section (if delayed orders or low-stock items exist) */}
      {((summary?.alerts?.delayedOrdersCount > 0) || (summary?.alerts?.unavailableItemsCount > 0)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-bold text-amber-900 text-sm">Attention Needed</p>
              <div className="flex flex-wrap gap-2 text-xs text-amber-800 mt-0.5">
                {summary.alerts.delayedOrdersCount > 0 && (
                  <span>• {summary.alerts.delayedOrdersCount} pending order(s) waiting &gt;10 mins</span>
                )}
                {summary.alerts.unavailableItemsCount > 0 && (
                  <span>• {summary.alerts.unavailableItemsCount} menu item(s) marked unavailable</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {summary.alerts.delayedOrdersCount > 0 && (
              <button
                onClick={() => navigate('/kitchen')}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
              >
                Open Kitchen Display
              </button>
            )}
            {summary.alerts.unavailableItemsCount > 0 && (
              <button
                onClick={() => navigate('/menu')}
                className="bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
              >
                Manage Menu
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Sales Performance</h2>
            <p className="text-gray-400 text-xs mt-0.5">Daily sales revenue over time</p>
          </div>
          {/* Toggle Switch: 7d vs 30d */}
          <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200 self-start sm:self-auto">
            <button
              id="chart-range-7d"
              onClick={() => setRange('7d')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === '7d' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Last 7 Days
            </button>
            <button
              id="chart-range-30d"
              onClick={() => setRange('30d')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === '30d' ? 'bg-slate-900 text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => `${sym}${v}`} />
            <Tooltip formatter={(val) => [`${sym}${Number(val).toFixed(2)}`, 'Sales']} />
            <Bar dataKey="sales" fill="url(#salesGradient)" radius={[6, 6, 0, 0]} />
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.9} />
                <stop offset="95%" stopColor="#0f766e" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Orders Table (Last 10) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <p className="text-gray-400 text-xs">Latest 10 transactions</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
          >
            View All Orders →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Order #</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Items</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {summary?.recentOrders?.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-gray-900">{order.orderNumber}</td>
                  <td className="px-4 py-3 capitalize text-gray-600">{order.orderType}</td>
                  <td className="px-4 py-3 text-gray-600">{order.items?.length} item(s)</td>
                  <td className="px-4 py-3 font-bold text-gray-900">{sym}{order.grandTotal?.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.orderStatus] || STATUS_COLORS.completed}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
