export default function ProfileTab({
  profileName,
  setProfileName,
  profileEmail,
  showToast,
  onLogout,
}: {
  profileName: string;
  setProfileName: (val: string) => void;
  profileEmail: string;
  showToast: (msg: string) => void;
  onLogout: () => void;
}) {
  return (
    <div className="max-w-2xl animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black shadow-lg">SA</div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">{profileName}</h3>
            <p className="text-xs text-slate-500">{profileEmail} • Super Admin</p>
          </div>
        </div>
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-600 block mb-1">Display Name</label>
            <input value={profileName} onChange={e => setProfileName(e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" />
          </div>
          <div>
            <label className="font-bold text-slate-600 block mb-1">Email Address</label>
            <input value={profileEmail} disabled className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-500 text-xs cursor-not-allowed" />
          </div>
          <div className="pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-600 block mb-1">Change Password</label>
            <div className="grid grid-cols-2 gap-3">
              <input type="password" placeholder="Current password" className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" />
              <input type="password" placeholder="New password" className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-500 text-xs" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                localStorage.setItem('aware_bharat_superadmin_profile', JSON.stringify({ profileName }));
                showToast('Profile updated successfully!');
              }}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-sm"
            >
              Save Changes
            </button>
            <button onClick={onLogout} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-100 cursor-pointer">Secure Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}
