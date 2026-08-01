import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import type { Event } from '../../types';

export default function CampaignsTab({
  campaignSuccessToast,
  handleAddCampaign,
  newCampaignTitle,
  setNewCampaignTitle,
  newCampaignType,
  setNewCampaignType,
  newCampaignDate,
  setNewCampaignDate,
  newCampaignLocation,
  setNewCampaignLocation,
  newCampaignCapacity,
  setNewCampaignCapacity,
  events,
}: {
  campaignSuccessToast: boolean;
  handleAddCampaign: (e: React.FormEvent) => void;
  newCampaignTitle: string;
  setNewCampaignTitle: (val: string) => void;
  newCampaignType: string;
  setNewCampaignType: (val: string) => void;
  newCampaignDate: string;
  setNewCampaignDate: (val: string) => void;
  newCampaignLocation: string;
  setNewCampaignLocation: (val: string) => void;
  newCampaignCapacity: string;
  setNewCampaignCapacity: (val: string) => void;
  events: Event[];
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeInUp_0.4s_ease-out]">

      {/* Campaign Schedule Form */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs self-start">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-4.5 h-4.5 text-primary" /> Schedule Awareness Campaign
        </h3>

        {campaignSuccessToast && (
          <div className="mb-4 p-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4.5 h-4.5" /> Campaign Scheduled Successfully!
          </div>
        )}

        <form onSubmit={handleAddCampaign} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Campaign Title</label>
            <input
              type="text"
              required
              value={newCampaignTitle}
              onChange={e => setNewCampaignTitle(e.target.value)}
              placeholder="e.g. Dwarka Screening Camp"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>

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

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Campaign Date / Time</label>
            <input
              type="text"
              required
              value={newCampaignDate}
              onChange={e => setNewCampaignDate(e.target.value)}
              placeholder="e.g. Sat, 15 Aug 2026 • 9:00 AM"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Location / Coordinates</label>
            <input
              type="text"
              required
              value={newCampaignLocation}
              onChange={e => setNewCampaignLocation(e.target.value)}
              placeholder="e.g. Community Center, Dwarka"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-600 block">Registration Capacity</label>
            <input
              type="number"
              min={1}
              required
              value={newCampaignCapacity}
              onChange={e => setNewCampaignCapacity(e.target.value)}
              placeholder="e.g. 150"
              className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-slate-50 outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity"
          >
            Schedule & Broadcast Alert
          </button>
        </form>
      </div>

      {/* Scheduled active list */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-outline-variant/30 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Active & Ongoing Campaigns</h3>

        {events.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No campaigns scheduled yet.</p>
        ) : (
          <div className="space-y-4">
            {events.map((c) => (
              <div key={c.id} className="p-4 border border-outline-variant/40 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between text-xs">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/15">{c.type}</span>
                  <h4 className="font-bold text-slate-900 mt-2">{c.title}</h4>
                  <p className="text-slate-500 mt-1">{c.date} • {c.location}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{c.registeredCount} / {c.capacity} registered</p>
                  <span className="mt-1 inline-block text-[10px] font-bold text-slate-500">{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
