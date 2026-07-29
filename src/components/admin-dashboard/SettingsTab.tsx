import React from 'react';
import { Settings, CheckCircle2 } from 'lucide-react';

export default function SettingsTab({
  passwordSuccess,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  onSubmit,
}: {
  passwordSuccess: boolean;
  profileName: string;
  setProfileName: (val: string) => void;
  profileEmail: string;
  setProfileEmail: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs max-w-2xl animate-[fadeInUp_0.4s_ease-out] text-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" /> Administrative Settings
      </h3>

      {passwordSuccess && (
        <div className="mb-5 p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-semibold flex items-center gap-1.5">
          <CheckCircle2 className="w-4.5 h-4.5" /> Settings updated successfully!
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-5">

        {/* Node details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Admin Account Name</label>
            <input
              type="text"
              value={profileName}
              onChange={e => setProfileName(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Admin Email Address</label>
            <input
              type="email"
              value={profileEmail}
              onChange={e => setProfileEmail(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Password reset */}
        <div className="border-t border-outline-variant/20 pt-5 space-y-4">
          <h4 className="font-bold text-slate-950 text-sm">Security Credentials</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-slate-600">New Password</label>
              <input
                type="password"
                placeholder="Enter new password"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Verify New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity"
        >
          Save Administrative Settings
        </button>

      </form>
    </div>
  );
}
