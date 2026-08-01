import { useEffect, useState } from 'react';
import { Building2, Info, Save } from 'lucide-react';
import type { ApiOrgSettings } from '../../api/client';

export default function SettingsTab({
  settings,
  loading,
  saving,
  onSave,
}: {
  settings: ApiOrgSettings | null;
  loading: boolean;
  saving: boolean;
  onSave: (payload: ApiOrgSettings) => void;
}) {
  const [form, setForm] = useState<ApiOrgSettings | null>(settings);

  // Sync local edit buffer whenever the real record loads/refreshes, but
  // don't clobber in-progress edits on background refetches.
  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  if (loading || !form) {
    return <p className="text-xs text-slate-400 py-6 text-center">Loading...</p>;
  }

  const fields: { key: keyof ApiOrgSettings; label: string }[] = [
    { key: 'ngoName', label: 'Organization Name' },
    { key: 'tagline', label: 'Tagline' },
    { key: 'registrationNo', label: 'Registration No.' },
    { key: 'address', label: 'Address' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
    { key: 'website', label: 'Website' },
  ];

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* NGO Info */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-600" /> NGO Information</h3>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {fields.map(({ key, label }) => (
            <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
              <input
                type="text"
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-400"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Honest empty state -- no real SMTP delivery or payment gateway
          integration exists in this app, so this section doesn't pretend
          to have live, editable config for either. */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-slate-400" /> Email &amp; Payment Integration</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          This app doesn't have a real email-delivery (SMTP) or payment-gateway integration configured yet -- account emails and donation records are handled without either. Once those are integrated, their configuration will appear here for real.
        </p>
      </div>
    </div>
  );
}
