import { Edit2 } from 'lucide-react';
import type { HospitalProfile } from './shared';

export default function ProfileTab({
  profile,
  isEditingProfile,
  setIsEditingProfile,
  editProfileAddress,
  setEditProfileAddress,
  editProfilePhone,
  setEditProfilePhone,
  editProfileEmergency,
  setEditProfileEmergency,
  editProfileWebsite,
  setEditProfileWebsite,
  handleSaveProfile,
}: {
  profile: HospitalProfile;
  isEditingProfile: boolean;
  setIsEditingProfile: (val: boolean) => void;
  editProfileAddress: string;
  setEditProfileAddress: (val: string) => void;
  editProfilePhone: string;
  setEditProfilePhone: (val: string) => void;
  editProfileEmergency: string;
  setEditProfileEmergency: (val: string) => void;
  editProfileWebsite: string;
  setEditProfileWebsite: (val: string) => void;
  handleSaveProfile: (e: React.FormEvent) => void;
}) {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 font-bold text-xl shrink-0">
              {profile.shortName}
            </div>
            <div>
              <h3 className="font-headline-lg text-lg font-bold text-slate-900">{profile.name}</h3>
              <p className="text-xs text-slate-700 font-semibold">{profile.accreditationStatus}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">NABH No: {profile.nabhNo} • Reg: {profile.licenseNo}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" /> {isEditingProfile ? 'Cancel Editing' : 'Edit Profile Details'}
          </button>
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Official Address</label>
                <input
                  type="text"
                  required
                  value={editProfileAddress}
                  onChange={e => setEditProfileAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={editProfilePhone}
                  onChange={e => setEditProfilePhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Emergency Desk Phone</label>
                <input
                  type="text"
                  required
                  value={editProfileEmergency}
                  onChange={e => setEditProfileEmergency(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Official Website</label>
                <input
                  type="text"
                  value={editProfileWebsite}
                  onChange={e => setEditProfileWebsite(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white outline-none text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#063b42] text-white font-bold rounded-xl text-xs hover:bg-[#084c55]"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
              <p className="font-semibold text-slate-800 mt-1">{profile.address}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Contact Phone & Email</p>
              <p className="font-semibold text-slate-800 mt-1">{profile.phone} • {profile.email}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Emergency Desk</p>
              <p className="font-bold text-red-600 mt-1">{profile.emergencyPhone}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-900">Clinical Infrastructure & Facilities</p>
          <div className="flex flex-wrap gap-2">
            {profile.facilities.map((fac, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">{fac}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
