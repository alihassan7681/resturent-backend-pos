import { useRef } from 'react';
import { X, Printer, ChefHat, Receipt, CheckCircle2 } from 'lucide-react';

export default function ReceiptModal({ order, settings, onClose }) {
  const customerReceiptRef = useRef(null);
  const kitchenReceiptRef = useRef(null);

  if (!order) return null;

  const sym = settings?.currencySymbol || 'Rs.';
  const now = new Date(order.createdAt || Date.now());
  const dateStr = now.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', hour12: true });
  const logoUrl = window.location.origin + '/logo.png';

  const printReceipt = (ref) => {
    const content = ref.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank', 'width=400,height=750');
    win.document.write(`
      <!DOCTYPE html><html><head>
        <title>Receipt - ${order.orderNumber}</title>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 12px;
            color: #111;
            width: 80mm;
            padding: 8px 12px 16px;
            margin: 0 auto;
            background: #fff;
          }
          .center { text-align: center; }
          .right { text-align: right; }
          .bold { font-weight: 700; }
          .semi { font-weight: 600; }

          /* Logo */
          .logo { display: block; max-width: 120px; max-height: 80px; margin: 0 auto 6px; object-fit: contain; }
          .logo-wrap { text-align: center; margin-bottom: 8px; }

          /* Header */
          .brand { font-size: 20px; font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; }
          .tagline { font-size: 10px; color: #555; margin-top: 1px; }
          .meta { font-size: 10px; color: #555; margin-top: 3px; }

          /* Dividers */
          hr { border: none; border-top: 1px dashed #bbb; margin: 8px 0; }
          .solid { border-top: 1.5px solid #111; }
          .bold-hr { border-top: 2px solid #111; margin: 6px 0; }

          /* Order badge */
          .order-badge {
            display: inline-block;
            border: 2px solid #111;
            border-radius: 6px;
            padding: 2px 10px;
            font-size: 16px;
            font-weight: 900;
            letter-spacing: 1px;
            margin: 6px 0;
          }
          .type-badge {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            background: #111;
            color: #fff;
            padding: 2px 7px;
            border-radius: 20px;
          }

          /* Info rows */
          .row { display: flex; justify-content: space-between; align-items: flex-start; padding: 2px 0; font-size: 11px; }
          .row .label { color: #555; }
          .row .val { font-weight: 600; text-align: right; max-width: 60%; }

          /* Items table */
          table { width: 100%; border-collapse: collapse; }
          th { font-size: 10px; font-weight: 700; text-transform: uppercase; color: #555; padding: 4px 0; border-bottom: 1px solid #111; }
          th.left, td.left { text-align: left; }
          th.right, td.right { text-align: right; }
          th.center, td.center { text-align: center; }
          td { padding: 5px 0; font-size: 11px; vertical-align: top; }
          td.name { font-weight: 600; padding-right: 4px; }
          td.note { font-size: 9px; color: #e07b00; font-style: italic; }

          /* Totals */
          .total-section { margin-top: 4px; }
          .total-row { display: flex; justify-content: space-between; font-size: 11px; padding: 3px 0; }
          .total-row span:last-child { text-align: right; min-width: 70px; font-weight: 600; }
          .total-row.grand { font-size: 17px; font-weight: 900; padding: 8px 0; border-top: 2.5px solid #111; border-bottom: 2.5px solid #111; margin: 6px 0; letter-spacing: -0.3px; }
          .total-row.grand span:last-child { font-size: 17px; font-weight: 900; }
          .total-row.discount { color: #16a34a; font-weight: 600; }

          /* Payment */
          .payment-box { border: 1.5px solid #111; border-radius: 6px; padding: 5px 10px; margin: 8px 0; font-size: 11px; }

          /* Footer */
          .footer { font-size: 10px; color: #555; text-align: center; margin-top: 10px; }
          .powered { font-size: 9px; color: #999; text-align: center; margin-top: 4px; letter-spacing: 0.3px; }

          /* KOT specific */
          .kot-title { font-size: 18px; font-weight: 900; letter-spacing: 2px; }
          .kot-item { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px dashed #ddd; align-items: flex-start; }
          .kot-qty { font-size: 18px; font-weight: 900; min-width: 28px; }
          .kot-name { font-size: 13px; font-weight: 700; flex: 1; }
          .kot-note { font-size: 10px; color: #c05e00; font-style: italic; margin-top: 2px; }
          .rush { font-size: 13px; font-weight: 900; letter-spacing: 2px; text-align: center; margin-top: 10px; }
        </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm" id="receipt-modal">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col overflow-hidden">

        {/* ── Modal Header ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-lg">
              <CheckCircle2 size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-extrabold text-lg leading-tight">Order Placed!</h2>
              <p className="text-slate-400 text-xs">{order.orderNumber} · {dateStr} · {timeStr}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* ── Two Receipts ── */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-5 grid md:grid-cols-2 gap-5">

          {/* ════════ KITCHEN KOT ════════ */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ChefHat size={17} className="text-amber-600" />
                <span className="font-bold text-gray-800 text-sm">Kitchen KOT</span>
              </div>
              <button
                onClick={() => printReceipt(kitchenReceiptRef)}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow"
              >
                <Printer size={13} /> Print KOT
              </button>
            </div>

            {/* KOT Paper */}
            <div className="bg-white rounded-2xl shadow-md border border-amber-100 overflow-hidden">
              <div className="h-2 bg-amber-400" />
              <div ref={kitchenReceiptRef} className="p-5">
                <div className="logo-wrap">
                  <img src={logoUrl} alt="Logo" className="logo" onError={e => e.target.style.display = 'none'} />
                </div>
                <div className="center kot-title">KITCHEN ORDER</div>
                <div className="center" style={{ margin: '8px 0' }}>
                  <span className="order-badge">{order.orderNumber}</span>
                </div>
                <div className="center" style={{ marginBottom: '4px' }}>
                  <span className="type-badge">{order.orderType?.toUpperCase()}</span>
                  {order.tableNumber && <span className="type-badge" style={{ marginLeft: '6px' }}>Table: {order.tableNumber}</span>}
                </div>
                <div className="row" style={{ marginTop: '6px', fontSize: '10px', color: '#777' }}>
                  <span>{dateStr}</span><span>{timeStr}</span>
                </div>
                <hr className="bold-hr" />

                {order.items?.map((item, i) => (
                  <div key={i} className="kot-item">
                    <span className="kot-qty">{item.quantity}×</span>
                    <div style={{ flex: 1 }}>
                      <div className="kot-name">{item.name}</div>
                      {item.notes && <div className="kot-note">📝 {item.notes}</div>}
                    </div>
                  </div>
                ))}

                <div className="rush">★ PREPARE ASAP ★</div>
              </div>
            </div>
          </div>

          {/* ════════ CUSTOMER BILL ════════ */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={17} className="text-blue-600" />
                <span className="font-bold text-gray-800 text-sm">Customer Bill</span>
              </div>
              <button
                onClick={() => printReceipt(customerReceiptRef)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow"
              >
                <Printer size={13} /> Print Bill
              </button>
            </div>

            {/* Bill Paper */}
            <div className="bg-white rounded-2xl shadow-md border border-blue-100 overflow-hidden">
              <div className="h-2 bg-blue-600" />
              <div ref={customerReceiptRef} className="p-5">
                {/* Restaurant Header */}
                <div className="center" style={{ marginBottom: '10px' }}>
                  <div className="logo-wrap">
                    <img src={logoUrl} alt="Logo" style={{ display: 'block', maxWidth: '130px', maxHeight: '90px', margin: '0 auto 6px', objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                  </div>
                  <div className="brand">{settings?.restaurantName || 'Sangat Café'}</div>
                  {settings?.tagline && <div className="tagline">{settings.tagline}</div>}
                  <div className="meta">{settings?.address || ''}</div>
                  <div className="meta">📞 {settings?.phone || ''}</div>
                </div>

                <hr className="solid" />

                {/* Order Meta */}
                <div style={{ margin: '8px 0' }}>
                  <div className="row"><span className="label">Bill No:</span><span className="val bold">{order.orderNumber}</span></div>
                  <div className="row"><span className="label">Date:</span><span className="val">{dateStr} {timeStr}</span></div>
                  <div className="row"><span className="label">Type:</span><span className="val"><span className="type-badge">{order.orderType}</span></span></div>
                  {order.tableNumber && <div className="row"><span className="label">Table:</span><span className="val bold">{order.tableNumber}</span></div>}
                  {order.customerName && order.customerName !== 'Guest' && (
                    <div className="row"><span className="label">Customer:</span><span className="val">{order.customerName}</span></div>
                  )}
                  <div className="row"><span className="label">Cashier:</span><span className="val">{order.cashier?.name || 'Staff'}</span></div>
                </div>

                <hr className="solid" />

                {/* Items */}
                <table style={{ margin: '6px 0' }}>
                  <thead>
                    <tr>
                      <th className="left">Item</th>
                      <th className="center" style={{ width: '28px' }}>Qty</th>
                      <th className="right" style={{ width: '70px' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, i) => (
                      <tr key={i}>
                        <td className="left name">
                          {item.name}
                          {item.notes && <div className="note">📝 {item.notes}</div>}
                        </td>
                        <td className="center">{item.quantity}</td>
                        <td className="right">{sym}{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <hr className="solid" />

                {/* Totals */}
                <div className="total-section">
                  <div className="total-row"><span>Subtotal</span><span>{sym} {Math.round(order.subtotal || 0).toLocaleString()}</span></div>
                  {order.discountAmount > 0 && (
                    <div className="total-row discount">
                      <span>Discount {order.discountType === 'percent' ? `(${order.discountValue}%)` : '(Flat)'}</span>
                      <span>- {sym} {Math.round(order.discountAmount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {order.taxAmount > 0 && (() => {
                    const taxBase = Math.round((order.subtotal || 0) - (order.discountAmount || 0));
                    return (
                      <div className="total-row">
                        <span>Tax ({order.taxRate}% on {sym} {taxBase.toLocaleString()})</span>
                        <span>{sym} {Math.round(order.taxAmount || 0).toLocaleString()}</span>
                      </div>
                    );
                  })()}
                  <div className="total-row grand">
                    <span>TOTAL</span>
                    <span>{sym} {Math.round(order.grandTotal || 0).toLocaleString()}</span>
                  </div>
                </div>

                {/* Payment */}
                <div className="payment-box">
                  <div className="row"><span className="label semi">Paid Via:</span><span className="val bold" style={{ textTransform: 'uppercase' }}>{order.paymentMethod}</span></div>
                </div>

                {/* Footer */}
                <div className="footer">{settings?.receiptFooter || 'Thank you for visiting!'}</div>
                <div className="powered">━━━━━━━━━━━━━━━━━━━━━━</div>
                <div className="powered">Developed by Tech Wave Software House</div>
                <div className="powered">📞 03217165022</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between rounded-b-3xl">
          <p className="text-xs text-gray-400">Developed by <span className="font-bold text-gray-600">Tech Wave Software House</span> · 03217165022</p>
          <button
            onClick={onClose}
            className="px-7 py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-xl shadow-lg text-sm transition-all active:scale-95"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
}
