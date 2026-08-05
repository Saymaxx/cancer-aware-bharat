import React from 'react';
import { Calendar, Clock, CheckCircle2, Pencil, Trash2, X, Check, Users } from 'lucide-react';
import type { Event } from '../../types';
import type { ApiVolunteerCampaignEnrollmentAdmin } from '../../api/client';

export default function CampaignsTab({
  campaignSuccessToast,
  handleAddCampaign,
  newCampaignTitle,
  setNewCampaignTitle,
  newCampaignType,
  setNewCampaignType,
  newCampaignDate,
  setNewCampaignDate,
  newCampaignTime,
  setNewCampaignTime,
  newCampaignLocation,
  setNewCampaignLocation,
  newCampaignCapacity,
  setNewCampaignCapacity,
  events,
  editingCampaignId,
  handleEditCampaign,
  handleDeleteCampaign,
  handleCancelEditCampaign,
  pendingEnrollments,
  handleApproveEnrollment,
  handleRejectEnrollment,
}: {
  campaignSuccessToast: boolean;
  handleAddCampaign: (e: React.FormEvent) => void;
  newCampaignTitle: string;
  setNewCampaignTitle: (val: string) => void;
  newCampaignType: string;
  setNewCampaignType: (val: string) => void;
  newCampaignDate: string;
  setNewCampaignDate: (val: string) => void;
  newCampaignTime: string;
  setNewCampaignTime: (val: string) => void;
  newCampaignLocation: string;
  setNewCampaignLocation: (val: string) => void;
  newCampaignCapacity: string;
  setNewCampaignCapacity: (val: string) => void;
  events: Event[];
  editingCampaignId: string | null;
  handleEditCampaign: (event: Event) => void;
  handleDeleteCampaign: (id: string) => void;
  handleCancelEditCampaign: () => void;
  pendingEnrollments: ApiVolunteerCampaignEnrollmentAdmin[];
  handleApproveEnrollment: (id: string) => void;
  handleRejectEnrollment: (id: string) => void;
}) {
  const isEditing = !!editingCampaignId;

  // Minimum date: today in YYYY-MM-DD
  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-[fadeInUp_0.4s_ease-out]">

      {/* ── Pending Volunteer Enrollment Requests ── */}
      {pendingEnrollments.length > 0 && (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4.5 h-4.5 text-primary" />
            Pending Campaign Enrollment Requests
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/15">
              {pendingEnrollments.length}
            </span>
          </h3>
          <div className="space-y-3">
            {pendingEnrollments.map((e) => (
              <div key={e.id} className="p-3.5 border border-outline-variant/40 rounded-xl flex items-center justify-between gap-3 text-xs hover:bg-slate-50 transition-colors">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{e.volunteer.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{e.volunteer.email}</p>
                  <p className="text-slate-600 mt-1.5">
                    wants to join <span className="font-semibold text-slate-900">{e.event.title}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {e.event.date}{e.event.time && e.event.time !== 'TBD' ? ` • ${e.event.time}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleApproveEnrollment(e.id)}
                    className="px-3 py-1.5 bg-primary text-white font-bold rounded-lg text-[10px] hover:opacity-95 cursor-pointer inline-flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Approve
                  </button>
                  <button
                    onClick={() => handleRejectEnrollment(e.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 font-bold rounded-lg text-[10px] hover:bg-red-100 cursor-pointer inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      {/* ── Campaign Schedule / Edit Form ── */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs self-start">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-primary" />
          {isEditing ? 'Edit Campaign' : 'Schedule Awareness Campaign'}
        </h3>

        {campaignSuccessToast && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {isEditing ? 'Campaign Updated Successfully!' : 'Campaign Scheduled Successfully!'}
          </div>
        )}

        <form onSubmit={handleAddCampaign} className="space-y-4 text-xs">

          {/* Campaign Title */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Campaign Title</label>
            <input
              type="text"
              required
              value={newCampaignTitle}
              onChange={e => setNewCampaignTitle(e.target.value)}
              placeholder="e.g. Dwarka Screening Camp"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Campaign Type */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Campaign Type</label>
            <select
              value={newCampaignType}
              onChange={e => setNewCampaignType(e.target.value)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none cursor-pointer"
            >
              <option value="Screening Camp">Screening Camp (On-site)</option>
              <option value="Blood Donation">Blood Donation Drive</option>
              <option value="Awareness Drive">Awareness Campaign</option>
              <option value="Workshop">Recovery Workshop</option>
            </select>
          </div>

          {/* Date + Time Row */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Campaign Date &amp; Time
            </label>

            {/* Date picker */}
            <div className="relative">
              <input
                type="date"
                required
                min={todayISO}
                value={newCampaignDate}
                onChange={e => setNewCampaignDate(e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary transition-colors appearance-none cursor-pointer text-slate-700"
                style={{ colorScheme: 'light' }}
              />
            </div>

            {/* Time picker */}
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="time"
                required
                value={newCampaignTime}
                onChange={e => setNewCampaignTime(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary transition-colors cursor-pointer text-slate-700"
                style={{ colorScheme: 'light' }}
              />
            </div>

            {/* Live preview */}
            {newCampaignDate && (
              <p className="text-[10px] text-primary font-semibold pt-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(`${newCampaignDate}T${newCampaignTime || '00:00'}`).toLocaleDateString('en-IN', {
                  weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                })}
                {' • '}
                {new Date(`${newCampaignDate}T${newCampaignTime || '00:00'}`).toLocaleTimeString('en-IN', {
                  hour: 'numeric', minute: '2-digit', hour12: true,
                }).toUpperCase()}
              </p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Location / Venue</label>
            <input
              type="text"
              required
              value={newCampaignLocation}
              onChange={e => setNewCampaignLocation(e.target.value)}
              placeholder="e.g. Community Center, Dwarka"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Capacity */}
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Registration Capacity</label>
            <input
              type="number"
              min={1}
              required
              value={newCampaignCapacity}
              onChange={e => setNewCampaignCapacity(e.target.value)}
              placeholder="e.g. 150"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Submit / Cancel */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity"
            >
              {isEditing ? 'Update Campaign' : 'Schedule & Broadcast Alert'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={handleCancelEditCampaign}
                className="px-3 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                title="Cancel Edit"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Active Campaigns List ── */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Active &amp; Ongoing Campaigns</h3>

        {events.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No campaigns scheduled yet.</p>
        ) : (
          <div className="space-y-3">
            {events.map((c) => (
              <div
                key={c.id}
                className={`p-4 border rounded-xl transition-colors flex items-start justify-between gap-3 text-xs ${
                  editingCampaignId === c.id
                    ? 'border-primary bg-primary/5'
                    : 'border-outline-variant/40 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/15">
                    {c.type}
                  </span>
                  <h4 className="font-bold text-slate-900 mt-2 truncate">{c.title}</h4>
                  <p className="text-slate-500 mt-1 flex items-center gap-1 flex-wrap">
                    <Calendar className="w-3 h-3 shrink-0" />
                    {c.date}
                    {c.time && c.time !== 'TBD' && (
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3 shrink-0" /> {c.time}
                      </span>
                    )}
                    <span className="text-slate-400">•</span>
                    {c.location}
                  </p>
                </div>

                <div className="text-right flex flex-col items-end gap-2 shrink-0">
                  <p className="font-bold text-primary whitespace-nowrap">
                    {c.registeredCount} / {c.capacity} registered
                  </p>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    c.status === 'Scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    c.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                    'bg-red-50 text-red-600 border-red-200'
                  }`}>
                    {c.status}
                  </span>
                  <div className="flex gap-1.5 mt-1">
                    <button
                      onClick={() => handleEditCampaign(c)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-primary/10 text-slate-500 hover:text-primary transition-colors cursor-pointer"
                      title="Edit Campaign"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(c.id)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
    </div>
  );
}
