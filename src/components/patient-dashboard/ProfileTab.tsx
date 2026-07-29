import { useState, useEffect } from 'react';
import { IdCard, Mail, Phone, Clock, Save } from 'lucide-react';
import { SectionHeader } from '../volunteer-dashboard/shared';
import type { ApiPatient } from '../../api/client';

export default function ProfileTab({
  profileLoading,
  profileError,
  profile,
  patientInitials,
  onSave,
  saving,
}: {
  profileLoading: boolean;
  profileError: string;
  profile: ApiPatient | null;
  patientInitials: string;
  onSave: (name: string, phone: string) => Promise<void>;
  saving: boolean;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(name, phone);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-3xl space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {profileLoading ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-10 shadow-xs flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : profileError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-xs font-semibold">{profileError}</div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-primary">{patientInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-headline-lg text-xl font-bold text-slate-900">{profile?.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {profile?.patientRefId}
                  </span>
                  {profile?.emailVerified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                      Email Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
            <SectionHeader icon={IdCard} title="Account Details" subtitle="Email is your login and can't be changed here" />
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-email" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <Mail className="w-3 h-3 inline mr-1" /> Email
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="profile-created" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <Clock className="w-3 h-3 inline mr-1" /> Member Since
                  </label>
                  <input
                    id="profile-created"
                    type="text"
                    disabled
                    value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="profile-phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    <Phone className="w-3 h-3 inline mr-1" /> Phone
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold text-xs rounded-xl hover:opacity-95 transition-opacity cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saved && <span className="text-xs text-primary font-semibold">Saved.</span>}
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
