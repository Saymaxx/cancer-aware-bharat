import { useState } from 'react';
import { Download } from 'lucide-react';
import { csvCell, downloadCsv } from '../../utils/csvExport';
import { REPORT_CARDS, type HospitalApplication, type SuperAdminAccount } from '../../superAdminDashboardData';
import type { Patient, AdminVolunteer, AdminDonation } from '../../adminDashboardData';

interface Campaign {
  id: string;
  title: string;
  date: string;
  type: string;
  loc: string;
  registrations: string;
  status: string;
}

export default function ReportsTab({
  patients,
  volunteers,
  donations,
  hospitals,
  admins,
  campaigns,
  showToast,
}: {
  patients: Patient[];
  volunteers: AdminVolunteer[];
  donations: AdminDonation[];
  hospitals: HospitalApplication[];
  admins: SuperAdminAccount[];
  campaigns: Campaign[];
  showToast: (msg: string) => void;
}) {
  const [lastExported, setLastExported] = useState<Record<string, string>>({});

  const exporters: Record<string, () => boolean> = {
    'RPT-001': () => {
      if (donations.length === 0) return false;
      downloadCsv(
        ['Receipt ID', 'Donor Entity', 'Donor Type', 'Amount (INR)', 'Date', 'Payment Method', '80G Receipt', 'Sponsorship Campaign'],
        donations.map(d => [d.id, csvCell(d.donorName), d.donorType, d.amount, d.date, d.paymentMethod, d.receiptSent ? 'Sent' : 'Pending', csvCell(d.sponsorshipCampaign)]),
        'CAB_Donation_Summary_Report'
      );
      return true;
    },
    'RPT-002': () => {
      if (patients.length === 0) return false;
      downloadCsv(
        ['Patient Code', 'Name', 'Age', 'Gender', 'Diagnosis', 'Clinic Partner', 'Financial Aid Status', 'Aid Amount (INR)', 'Case Status'],
        patients.map(p => [p.recordId, csvCell(p.name), p.age, p.gender, csvCell(p.diagnosis), csvCell(p.hospitalName), p.financialAidStatus, p.financialAidAmount || 0, p.status]),
        'CAB_Patient_Assistance_Report'
      );
      return true;
    },
    'RPT-003': () => {
      if (campaigns.length === 0) return false;
      downloadCsv(
        ['Campaign', 'Type', 'Date', 'Location', 'Registrations', 'Status'],
        campaigns.map(c => [csvCell(c.title), csvCell(c.type), c.date, csvCell(c.loc), csvCell(c.registrations), c.status]),
        'CAB_Campaign_Impact_Report'
      );
      return true;
    },
    'RPT-004': () => {
      if (hospitals.length === 0) return false;
      downloadCsv(
        ['Hospital Name', 'City', 'Contact Email', 'Contact Phone', 'Applied Date', 'Status'],
        hospitals.map(h => [csvCell(h.name), csvCell(h.city), h.contactEmail, h.contactPhone, h.appliedDate, h.status]),
        'CAB_Hospital_Partnership_Report'
      );
      return true;
    },
    'RPT-005': () => {
      if (volunteers.length === 0) return false;
      downloadCsv(
        ['Volunteer ID', 'Name', 'Email', 'Phone', 'Domain', 'Registered Date', 'Status'],
        volunteers.map(v => [v.id, csvCell(v.name), v.email, v.phone, csvCell(v.domain), v.registeredDate, v.status]),
        'CAB_Volunteer_Performance_Report'
      );
      return true;
    },
    'RPT-006': () => {
      const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
      downloadCsv(
        ['Category', 'Metric'],
        [
          ['Total Patients', patients.length],
          ['Total Volunteers', volunteers.length],
          ['Approved Partner Hospitals', hospitals.filter(h => h.status === 'Approved').length],
          ['Admin Accounts', admins.length],
          ['Campaigns Scheduled', campaigns.length],
          ['Total Donations (INR)', totalDonations],
        ],
        'CAB_Annual_NGO_Performance_Report'
      );
      return true;
    },
  };

  const handleExport = (reportId: string, title: string) => {
    const exporter = exporters[reportId];
    const exported = exporter ? exporter() : false;
    if (!exported) {
      showToast(`${title} — no data to export yet.`);
      return;
    }
    setLastExported(prev => ({ ...prev, [reportId]: new Date().toLocaleString('en-IN') }));
    showToast(`${title} — CSV exported.`);
  };

  return (
    <div className="space-y-4 animate-[fadeInUp_0.4s_ease-out]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORT_CARDS.map(report => (
          <div key={report.id} className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-xs hover:shadow-md transition-all">
            <div className="text-3xl mb-3">{report.icon}</div>
            <h4 className="text-sm font-bold text-slate-900">{report.title}</h4>
            <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{report.description}</p>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
              <span className="text-[10px] text-slate-400">{lastExported[report.id] ? `Last: ${lastExported[report.id]}` : 'Not yet exported'}</span>
              <button onClick={() => handleExport(report.id, report.title)} className="px-2.5 py-1 rounded-lg bg-slate-50 text-primary-container text-[10px] font-bold border border-slate-200 hover:bg-slate-100 cursor-pointer flex items-center gap-0.5">
                <Download className="w-3 h-3" /> Export CSV
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
