import { IdCard, Mail, Phone, MapPin, Clock, Calendar, Heart } from 'lucide-react';
import { SectionHeader } from './shared';
import type { ApiVolunteer } from '../../api/client';

export default function ProfileTab({
  profileLoading,
  profileError,
  profile,
  volunteerName,
  volunteerInitials,
  volunteerId,
  volunteerDomain,
  volunteerCity,
  volunteerEmail,
}: {
  profileLoading: boolean;
  profileError: string;
  profile: ApiVolunteer | null;
  volunteerName: string;
  volunteerInitials: string;
  volunteerId: string;
  volunteerDomain: string;
  volunteerCity: string;
  volunteerEmail?: string;
}) {
  return (
    <div className="max-w-3xl space-y-6 animate-[fadeInUp_0.4s_ease-out]">
      {profileLoading ? (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-10 shadow-xs flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : profileError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-5 text-xs font-semibold">
          {profileError}
        </div>
      ) : (
        <>
          {/* Identity Card */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <span className="text-2xl font-black text-primary">{volunteerInitials}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-headline-lg text-xl font-bold text-slate-900">{profile?.name || volunteerName}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {profile?.volunteerId || volunteerId}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
                    {volunteerDomain}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
            <SectionHeader icon={IdCard} title="Contact & Location" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                  <p className="font-semibold text-slate-800 mt-0.5 break-all">{profile?.email || volunteerEmail}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{profile?.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Area / City</p>
                  <p className="font-semibold text-slate-800 mt-0.5">{profile?.area || volunteerCity}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Member Since</p>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          {profile && profile.availableDays.length > 0 && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
              <SectionHeader icon={Calendar} title="Availability" subtitle="Days you're generally free for campaign duty" />
              <div className="flex flex-wrap gap-2">
                {profile.availableDays.map(day => (
                  <span key={day} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-xs font-bold text-primary">
                    {day}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Motivation / Bio */}
          {profile?.motivation && (
            <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 sm:p-8 shadow-xs">
              <SectionHeader icon={Heart} title="Motivation" />
              <p className="text-xs text-slate-600 leading-relaxed">{profile.motivation}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
