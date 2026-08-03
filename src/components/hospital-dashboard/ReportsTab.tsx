import { Upload, FileText, Download } from 'lucide-react';
import type { HospitalReport } from '../../hospitalDashboardData';

export default function ReportsTab({
  reports,
  setShowUploadReportModal,
  onDownload,
}: {
  reports: HospitalReport[];
  setShowUploadReportModal: (val: boolean) => void;
  onDownload: (reportId: string, fileName: string) => void;
}) {
  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200/80">
        <h3 className="font-headline-lg text-base font-bold text-slate-900">Hospital Prescription & Lab Repository</h3>
        <button onClick={() => setShowUploadReportModal(true)} className="px-4 py-2 bg-[#063b42] text-white rounded-xl text-xs font-bold hover:opacity-95 shadow-sm flex items-center gap-1.5 cursor-pointer">
          <Upload className="w-4 h-4" /> Upload New Medical Report
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
            <FileText className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm">No Medical Reports Uploaded</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click "Upload New Medical Report" above to attach prescriptions, biopsy reports, or lab results for patient records.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 border-b">
                  <th className="p-4">Report Name & File</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Report Type</th>
                  <th className="p-4">Uploaded Date</th>
                  <th className="p-4">Doctor</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map(rpt => (
                  <tr key={rpt.id} className="hover:bg-slate-50/60">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{rpt.fileName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{rpt.fileSize}</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{rpt.patientName}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">{rpt.reportType}</span>
                    </td>
                    <td className="p-4 text-slate-500">{rpt.uploadDate}</td>
                    <td className="p-4 font-medium text-slate-700">{rpt.uploadedByDoctor}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => onDownload(rpt.id, rpt.fileName)} className="px-3 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 text-[10px] cursor-pointer inline-flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
