import { useState, useEffect } from 'react';
import { Save, Loader2, Building2, Phone, Mail, MapPin, ReceiptText, Percent } from 'lucide-react';
import api from '../utils/api';

export default function SettingsPage() {
  const [form, setForm] = useState({
    restaurantName: '',
    tagline: '',
    address: '',
    phone: '',
    email: '',
    gstNumber: '',
    taxRatePercent: 5,
    currencySymbol: 'Rs.',
    receiptFooter: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then(res => {
      setForm(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await api.put('/settings', form);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Error saving settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 size={32} className="animate-spin text-orange-500" /></div>;
  }

  const Field = ({ label, icon: Icon, children }) => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase mb-1.5">
        {Icon && <Icon size={12} />}
        {label}
      </label>
      {children}
    </div>
  );

  const inputClass = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-orange-400 transition-colors";

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configure restaurant info, tax rates, and receipt details</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Restaurant Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 size={18} className="text-orange-500" />
            Restaurant Information
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Field label="Restaurant Name" icon={Building2}>
                <input id="setting-name" value={form.restaurantName} onChange={e => setForm(f => ({ ...f, restaurantName: e.target.value }))}
                  className={inputClass} placeholder="Your Restaurant Name" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Tagline">
                <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))}
                  className={inputClass} placeholder="Delicious Food & Quick Service" />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Address" icon={MapPin}>
                <textarea value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} rows={2}
                  className={`${inputClass} resize-none`} placeholder="Full business address" />
              </Field>
            </div>
            <Field label="Phone" icon={Phone}>
              <input id="setting-phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className={inputClass} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Email" icon={Mail}>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={inputClass} placeholder="info@restaurant.com" />
            </Field>
          </div>
        </div>

        {/* Tax & Financial Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Percent size={18} className="text-orange-500" />
            Tax & Financial Settings
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="GST Number">
              <input id="setting-gst" value={form.gstNumber} onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                className={inputClass} placeholder="27AAAAA0000A1Z5" />
            </Field>
            <Field label="Tax Rate (%)">
              <input id="setting-tax" type="number" min="0" max="50" value={form.taxRatePercent}
                onChange={e => setForm(f => ({ ...f, taxRatePercent: Number(e.target.value) }))}
                className={inputClass} placeholder="5" />
            </Field>
            <Field label="Currency Symbol">
              <input value={form.currencySymbol} onChange={e => setForm(f => ({ ...f, currencySymbol: e.target.value }))}
                className={inputClass} placeholder="Rs." maxLength={5} />
            </Field>
          </div>
        </div>

        {/* Receipt Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ReceiptText size={18} className="text-orange-500" />
            Receipt Settings
          </h2>
          <Field label="Receipt Footer Message">
            <textarea value={form.receiptFooter} onChange={e => setForm(f => ({ ...f, receiptFooter: e.target.value }))} rows={3}
              className={`${inputClass} resize-none`} placeholder="Thank you for dining with us! Please visit again." />
          </Field>

          {/* Preview */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Receipt Preview</p>
            <div className="font-mono text-xs text-center space-y-1 text-gray-700">
              <p className="font-bold text-sm">{form.restaurantName || 'Restaurant Name'}</p>
              <p>{form.tagline}</p>
              <p>{form.address}</p>
              <p>Tel: {form.phone}</p>
              {form.gstNumber && <p>GSTIN: {form.gstNumber}</p>}
              <p className="border-t border-dashed border-gray-300 pt-1 mt-1">{form.receiptFooter || 'Thank you!'}</p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button id="save-settings-btn" type="submit" disabled={saving}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors shadow-md shadow-orange-200 disabled:opacity-70">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-green-600 font-medium text-sm">
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              Settings saved successfully!
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
