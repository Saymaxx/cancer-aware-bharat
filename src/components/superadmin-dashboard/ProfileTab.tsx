import { useEffect, useState } from 'react';
import type { ApiStaffMe } from '../../api/client';

export default function ProfileTab({
  me,
  loading,
  savingName,
  changingPassword,
  onSaveName,
  onChangePassword,
  onLogout,
}: {
  me: ApiStaffMe | null;
  loading: boolean;
  savingName: boolean;
  changingPassword: boolean;
  onSaveName: (name: string) => void;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onLogout: () => void;
}) {
  const [name, setName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (me) setName(me.name);
  }, [me]);

  if (loading || !me) {
    return <p className="text-xs text-slate-400 py-6 text-center">Loading...</p>;
  }

  const handleChangePassword = async () => {
    const ok = await onChangePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  return (
    <div className="max-w-2xl animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
            {me.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{me.name}</h3>
            <p className="text-xs text-slate-500">{me.email} • {me.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
          </div>
        </div>
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Email Address</label>
            <input value={me.email} disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 text-xs cursor-not-allowed" />
          </div>
          <div className="pt-2">
            <button
              onClick={() => onSaveName(name)}
              disabled={savingName || !name || name === me.name}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {savingName ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="font-bold text-slate-600 block mb-1">Change Password</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs"
              />
              <input
                type="password"
                placeholder="New password (min 8 characters)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={changingPassword || !currentPassword || newPassword.length < 8}
              className="mt-3 px-5 py-2.5 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-xs font-bold hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button onClick={onLogout} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer">Secure Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
