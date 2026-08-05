import React from 'react';
import { Calendar, Clock, Download, Pencil, Trash2, Plus, X, CheckCircle2 } from 'lucide-react';

interface SuperAdminCampaign {
  id: string;
  title: string;
  date: string;
  type: string;
  loc: string;
  registrations: string;
  status: string;
}

interface CampaignFormData {
  title: string;
  type: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  location: string;
  capacity: string;
}

export default function CampaignsTab({
  campaigns,
  handleExportCampaignsCSV,
  handleAddCampaign,
  handleEditCampaign,
  handleDeleteCampaign,
  handleCancelEdit,
  editingCampaignId,
  formData,
  setFormData,
  successToast,
}: {
  campaigns: SuperAdminCampaign[];
  handleExportCampaignsCSV: () => void;
  handleAddCampaign?: (e: React.FormEvent) => void;
  handleEditCampaign?: (campaign: SuperAdminCampaign) => void;
  handleDeleteCampaign?: (id: string) => void;
  handleCancelEdit?: () => void;
  editingCampaignId?: string | null;
  formData?: CampaignFormData;
  setFormData?: (data: CampaignFormData) => void;
  successToast?: boolean;
}) {
  const showForm = !!(handleAddCampaign && formData && setFormData);
  const isEditing = !!(editingCampaignId && showForm);
  const todayISO = new Date().toISOString().split('T')[0];

  return (
    <div className={`gap-6 animate-[fadeInUp_0.4s_ease-out] ${showForm ? 'grid grid-cols-1 lg:grid-cols-3' : 'space-y-4'}`}>

      {/* ── Campaign Form ── */}
      {showForm && handleAddCampaign && formData && setFormData && (
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/60 p-6 shadow-xs self-start">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            {isEditing
              ? <><Pencil className="w-4 h-4 text-indigo-600" /> Edit Campaign</>
              : <><Plus className="w-4 h-4 text-indigo-600" /> Schedule Campaign</>
            }
          </h3>

          {successToast && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {isEditing ? 'Campaign Updated!' : 'Campaign Scheduled!'}
            </div>
          )}

          <form onSubmit={handleAddCampaign} className="space-y-4 text-xs">

            {/* Title */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Campaign Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. National Cancer Screening Drive"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Type */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Campaign Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none cursor-pointer"
              >
                <option value="Screening Camp">Screening Camp (On-site)</option>
                <option value="Blood Donation">Blood Donation Drive</option>
                <option value="Awareness Drive">Awareness Campaign</option>
                <option value="Workshop">Recovery Workshop</option>
              </select>
            </div>

            {/* Date + Time */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 block flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Campaign Date &amp; Time
              </label>

              {/* Date picker */}
              <input
                type="date"
                required
                min={todayISO}
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-400 transition-colors cursor-pointer text-slate-700"
                style={{ colorScheme: 'light' }}
              />

              {/* Time picker */}
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="time"
                  required
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-400 transition-colors cursor-pointer text-slate-700"
                  style={{ colorScheme: 'light' }}
                />
              </div>

              {/* Live preview */}
              {formData.date && (
                <p className="text-[10px] text-indigo-600 font-semibold pt-0.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(`${formData.date}T${formData.time || '00:00'}`).toLocaleDateString('en-IN', {
                    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
                  })}
                  {' • '}
                  {new Date(`${formData.date}T${formData.time || '00:00'}`).toLocaleTimeString('en-IN', {
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
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. AIIMS New Delhi"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            {/* Capacity */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 block">Registration Capacity</label>
              <input
                type="number"
                min={1}
                required
                value={formData.capacity}
                onChange={e => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:opacity-95 shadow-sm transition-opacity text-xs"
              >
                {isEditing ? 'Update Campaign' : 'Schedule Campaign'}
              </button>
              {isEditing && handleCancelEdit && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 font-bold rounded-lg hover:bg-slate-200 transition-colors"
                  title="Cancel Edit"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── Campaign list section ── */}
      <div className={showForm ? 'lg:col-span-2 space-y-4' : 'space-y-4'}>
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Drives', value: String(campaigns.length), color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
            { label: 'Scheduled', value: String(campaigns.filter(c => c.status === 'Scheduled').length), color: 'text-purple-700 bg-purple-50 border-purple-200' },
            { label: 'Completed', value: String(campaigns.filter(c => c.status === 'Completed').length), color: 'text-slate-700 bg-slate-50 border-slate-200' },
          ].map((s, i) => (
            <div key={i} className={`${s.color} rounded-2xl border p-4 text-center`}>
              <p className="text-2xl font-black">{s.value}</p>
              <p className="text-[10px] font-bold mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/60">
          <h3 className="text-sm font-bold text-slate-900">National Healthcare Campaigns &amp; Screening Drives</h3>
          <button
            onClick={handleExportCampaignsCSV}
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-indigo-600" /> Export CSV
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-200">
                  <th className="px-5 py-3">Campaign Title</th>
                  <th className="px-5 py-3">Schedule Date</th>
                  <th className="px-5 py-3">Drive Type</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3 text-right">Registrations</th>
                  {(handleEditCampaign || handleDeleteCampaign) && (
                    <th className="px-5 py-3 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className={`hover:bg-slate-50/50 transition-colors ${editingCampaignId === c.id ? 'bg-indigo-50/40' : ''}`}
                  >
                    <td className="px-5 py-4 font-bold text-slate-900">{c.title}</td>
                    <td className="px-5 py-4 text-indigo-700 font-semibold">{c.date}</td>
                    <td className="px-5 py-4 font-medium text-slate-700">{c.type}</td>
                    <td className="px-5 py-4 text-slate-600">{c.loc}</td>
                    <td className="px-5 py-4 text-right font-bold text-purple-700">{c.registrations}</td>
                    {(handleEditCampaign || handleDeleteCampaign) && (
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {handleEditCampaign && (
                            <button
                              onClick={() => handleEditCampaign(c)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                              title="Edit Campaign"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          )}
                          {handleDeleteCampaign && (
                            <button
                              onClick={() => handleDeleteCampaign(c.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Campaign"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
