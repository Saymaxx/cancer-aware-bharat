import { useEffect, useState } from 'react';
import { Settings } from 'lucide-react';
import type { ApiStaffMe } from '../../api/client';

export default function SettingsTab({
  me,
  loading,
  savingName,
  changingPassword,
  onSaveName,
  onChangePassword,
}: {
  me: ApiStaffMe | null;
  loading: boolean;
  savingName: boolean;
  changingPassword: boolean;
  onSaveName: (name: string) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}) {
  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (me) setProfileName(me.name);
  }, [me]);

  if (loading || !me) {
    return <p className="text-xs text-slate-400 py-6 text-center">Loading...</p>;
  }

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
    <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs max-w-2xl animate-[fadeInUp_0.4s_ease-out] text-xs">
      <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
        <Settings className="w-5 h-5 text-primary" /> Administrative Settings
      </h3>

      <div className="space-y-5">

        {/* Account details */}
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
              value={me.email}
              disabled
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
        <button
          onClick={() => onSaveName(profileName)}
          disabled={savingName || !profileName || profileName === me.name}
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-opacity cursor-pointer"
        >
          {savingName ? 'Saving...' : 'Save Account Name'}
        </button>

        {/* Password reset */}
        <div className="border-t border-outline-variant/20 pt-5 space-y-4">
          <h4 className="font-bold text-slate-950 text-sm">Security Credentials</h4>
          <div className="space-y-1">
            <label className="font-bold text-slate-600">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
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
                className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-600">Verify New Password</label>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
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
    </div>
  );
}
