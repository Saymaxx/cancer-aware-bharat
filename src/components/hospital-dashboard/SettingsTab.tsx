export default function SettingsTab() {
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
    </div>
  );
}
