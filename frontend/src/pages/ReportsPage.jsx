import { useState, useEffect, useRef } from 'react';
import { Printer, Calendar, Wallet, ShoppingBag, Tag, CreditCard, Loader2 } from 'lucide-react';
import api from '../utils/api';

const RANGE_TYPES = [
  { id: 'daily', label: 'Today' },
  { id: 'weekly', label: 'Last 7 Days' },
  { id: 'monthly', label: 'Last 30 Days' },
  { id: 'custom', label: 'Custom Range' },
];

export default function ReportsPage() {
  const [rangeType, setRangeType] = useState('monthly');
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let params = { type: rangeType };
      if (rangeType === 'custom') {
        params.from = fromDate;
        params.to = toDate;
      }
      const [repRes, setRes] = await Promise.all([
        api.get('/reports/reports', { params }),
        api.get('/settings'),
      ]);
      setReport(repRes.data);
      setSettings(setRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [rangeType, fromDate, toDate]);

  const handlePrint = () => {
    window.print();
  };

  const sym = settings?.currencySymbol || 'Rs.';

  const paymentBreakdown = report?.paymentMethods
    ? [
        { name: 'Cash', value: report.paymentMethods.cash || 0, icon: '💵' },
        { name: 'Card', value: report.paymentMethods.card || 0, icon: '💳' },
        { name: 'Online / UPI', value: report.paymentMethods.upi || 0, icon: '📱' },
      ]
    : [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Printable Area Wrapper */}
      <div className="print-area">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5 no-print">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-gray-500 text-sm mt-0.5">Comprehensive financial and product breakdown</p>
          </div>
          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md self-start sm:self-auto"
          >
            <Printer size={16} />
            Export / Print Report
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm no-print my-4">
          {/* Tabs */}
          <div className="flex gap-2">
            {RANGE_TYPES.map(({ id, label }) => (
              <button
                key={id}
                id={`report-tab-${id}`}
                onClick={() => setRangeType(id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  rangeType === id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {rangeType === 'custom' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Calendar size={14} className="text-gray-400" />
              <span>From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500"
              />
              <span>To:</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-teal-500"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-teal-600" />
          </div>
        ) : (
          <div ref={reportRef} className="space-y-6">
            {/* Print Header Visible Only on Print */}
            <div className="hidden print:block text-center border-b border-black pb-4 mb-4">
              <h1 className="text-xl font-bold">{settings?.restaurantName || 'RestroPOS'}</h1>
              <p className="text-xs">Sales Aggregation Report</p>
              <p className="text-xs text-gray-600 mt-1">Generated: {new Date().toLocaleString('en-IN')}</p>
            </div>

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Total Sales</span>
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{sym}{(report?.totalSales || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Gross revenue</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Total Orders</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{report?.totalOrders || 0}</p>
                <p className="text-xs text-gray-400 mt-1">Completed checkouts</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Total Discounts</span>
                  <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center">
                    <Tag size={16} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-orange-600">{sym}{(report?.totalDiscounts || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Discounts given</p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase">Net Profit</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-emerald-600">{sym}{(report?.netProfit || 0).toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Minus {sym}{(report?.totalExpenses || 0).toFixed(0)} expenses</p>
              </div>
            </div>

            {/* Tables Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Payment Methods Breakdown */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-base mb-4">Payment Methods Breakdown</h2>
                <div className="space-y-3">
                  {paymentBreakdown.map(({ name, value, icon }) => {
                    const pct = report?.totalSales > 0 ? ((value / report.totalSales) * 100).toFixed(1) : 0;
                    return (
                      <div key={name} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-semibold text-gray-800">{icon} {name}</span>
                          <span className="text-sm font-extrabold text-gray-900">{sym}{value.toFixed(2)} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-600 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top 10 Selling Items */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-bold text-gray-900 text-base mb-4">Top 10 Selling Items</h2>
                {!report?.topSellingItems?.length ? (
                  <p className="text-gray-400 text-xs text-center py-6">No sales recorded</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Item</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-gray-500">Qty</th>
                          <th className="px-3 py-2 text-right text-xs font-semibold text-gray-500">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {report.topSellingItems.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium text-gray-800">{item.name}</td>
                            <td className="px-3 py-2 text-center font-bold text-gray-700">{item.quantity}</td>
                            <td className="px-3 py-2 text-right font-bold text-teal-700">{sym}{item.revenue.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
