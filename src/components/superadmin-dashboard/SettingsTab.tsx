import { Building2, Mail, Key } from 'lucide-react';
import { SYSTEM_SETTINGS } from '../../superAdminDashboardData';

export default function SettingsTab() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {/* NGO Info */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-600" /> NGO Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {[
            { label: 'Organization Name', value: SYSTEM_SETTINGS.ngoName },
            { label: 'Tagline', value: SYSTEM_SETTINGS.tagline },
            { label: 'Registration No.', value: SYSTEM_SETTINGS.registrationNo },
            { label: 'Address', value: SYSTEM_SETTINGS.address },
            { label: 'Phone', value: SYSTEM_SETTINGS.phone },
            { label: 'Email', value: SYSTEM_SETTINGS.email },
            { label: 'Website', value: SYSTEM_SETTINGS.website },
          ].map((item, i) => (
            <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
              <p className="font-semibold text-slate-800 mt-0.5">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Email & Payment Config */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Mail className="w-4 h-4 text-indigo-600" /> Email Configuration</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">SMTP Host</span><span className="font-bold text-slate-800">{SYSTEM_SETTINGS.smtpHost}</span></div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">Port</span><span className="font-bold text-slate-800">{SYSTEM_SETTINGS.smtpPort}</span></div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">Sender Email</span><span className="font-bold text-slate-800">{SYSTEM_SETTINGS.smtpEmail}</span></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2"><Key className="w-4 h-4 text-indigo-600" /> Payment Gateway & API Keys</h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">Gateway</span><span className="font-bold text-slate-800">{SYSTEM_SETTINGS.paymentGateway}</span></div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">API Key</span><span className="font-mono text-slate-800">{SYSTEM_SETTINGS.apiKeyMasked}</span></div>
            <div className="flex justify-between p-2.5 bg-slate-50 rounded-lg"><span className="text-slate-500 font-semibold">Secret</span><span className="font-mono text-slate-800">{SYSTEM_SETTINGS.secretKeyMasked}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
