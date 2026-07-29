import { UserPlus, Stethoscope } from 'lucide-react';
import type { HospitalDoctor } from '../../hospitalDashboardData';

export default function DoctorsTab({
  doctors,
  setShowAddDoctorModal,
  handleToggleDoctorAvailability,
  showToast,
}: {
  doctors: HospitalDoctor[];
  setShowAddDoctorModal: (val: boolean) => void;
  handleToggleDoctorAvailability: (docId: string) => void;
  showToast: (msg: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80">
        <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Oncologists & Specialists Directory</h3>
        <button onClick={() => setShowAddDoctorModal(true)} className="px-4 py-2 bg-[#063b42] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-sm flex items-center gap-1.5 cursor-pointer">
          <UserPlus className="w-4 h-4" /> Add Doctor
        </button>
      </div>

      {doctors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No Doctors Registered Yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Register your hospital's oncologists, surgeons, and specialists to assign them to incoming patient referrals.
          </p>
          <button onClick={() => setShowAddDoctorModal(true)} className="px-4 py-2 bg-[#063b42] text-white rounded-xl text-xs font-bold hover:bg-[#084c55] cursor-pointer">
            + Add First Doctor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(doc => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-50 text-slate-700 text-[10px] font-bold border border-slate-200">{doc.specialty}</span>
                  <button onClick={() => handleToggleDoctorAvailability(doc.id)} className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer border ${
                    doc.availability === 'Available' ? 'bg-slate-50 text-slate-700 border-slate-200' :
                    doc.availability === 'In Surgery' ? 'bg-slate-50 text-slate-700 border-slate-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {doc.availability}
                  </button>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{doc.name}</h4>
                <p className="text-xs text-slate-500 font-medium">{doc.qualification}</p>
                <p className="text-xs text-slate-500 mt-2 font-mono">Experience: {doc.experienceYears} years</p>
                <p className="text-xs text-slate-500 font-mono">{doc.phone} • {doc.email}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Assigned Patients: <strong>{doc.assignedPatientsCount}</strong></span>
                <button onClick={() => showToast(`Doctor ${doc.name} assigned to clinical schedule.`)} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-200 cursor-pointer">
                  Manage Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
