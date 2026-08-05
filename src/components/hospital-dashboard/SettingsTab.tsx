import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function SettingsTab({
  changingPassword,
  onChangePassword,
}: {
  changingPassword: boolean;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleChangePassword = async () => {
    if (passwordMismatch) return;
    const ok = await onChangePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Portal Configuration</h3>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-semibold text-slate-800">Email notification on new NGO patient referrals</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
          </label>
          <label className="flex items-center justify-between cursor-pointer">
            <span className="font-semibold text-slate-800">Auto-acknowledge urgent financial aid verification requests</span>
            <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded" />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
        <h3 className="font-headline-lg text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-4.5 h-4.5 text-primary" /> Security Credentials
        </h3>
        <p className="text-slate-500">
          If you're still using the temporary password issued at approval, change it here so you're not stuck with it indefinitely.
        </p>
        <div className="space-y-1">
          <label className="font-bold text-slate-600">Current Password</label>
          <input
            type="password"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="font-bold text-slate-600">New Password</label>
            <input
              type="password"
              placeholder="Min 8 characters"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Verify New Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
            {passwordMismatch && <p className="text-red-500 font-semibold mt-1">Passwords do not match.</p>}
          </div>
        </div>
        <button
          onClick={handleChangePassword}
          disabled={changingPassword || !currentPassword || newPassword.length < 8 || passwordMismatch}
          className="px-6 py-2.5 bg-white text-primary border border-primary/30 rounded-lg font-bold hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {changingPassword ? 'Updating...' : 'Update Password'}
        </button>
      </div>
    </div>
  );
}
