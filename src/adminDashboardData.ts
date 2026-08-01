// ============================================================
// Admin Dashboard — Mock Data
// ============================================================

export interface Patient {
  id: string;
  recordId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  hospitalId: string;
  hospitalName: string;
  assignedVolunteerId?: string;
  assignedVolunteerName?: string;
  financialAidStatus: 'Not Requested' | 'Pending Review' | 'Approved' | 'Disbursed' | 'Rejected';
  financialAidAmount?: number;
  reportUrl?: string;
  status: 'Under Treatment' | 'Recovered' | 'Screened - Healthy' | 'Follow-up';
}

export interface AdminVolunteer {
  id: string;
  name: string;
  email: string;
  phone: string;
  domain: string;
  city: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Suspended';
  assignedCampaignsCount: number;
  hoursLogged: number;
  attendanceRate: number; // percentage
  registeredDate: string;
}

export interface CampaignRequest {
  id: string;
  organizationName: string;
  orgType: 'School' | 'College' | 'NGO' | 'Corporate' | 'Village Council';
  contactPerson: string;
  email: string;
  phone: string;
  requestedDate: string;
  location: string;
  expectedAttendees: number;
  status: 'Pending Scheduling' | 'Scheduled' | 'Declined';
}

export interface PartnerHospital {
  id: string;
  name: string;
  city: string;
  status: 'Active Partner' | 'Pending Tie-up' | 'Recommended to Super Admin' | 'Declined by Admin';
  appliedDate: string;
  documentVerified: boolean;
  contactEmail: string;
  contactPhone: string;
  declineReason?: string;
}

export interface AdminDonation {
  id: string;
  donorName: string;
  donorType: 'Individual' | 'Corporate' | 'Foundation' | 'NGO';
  amount: number;
  date: string;
  paymentMethod: 'UPI' | 'Net Banking' | 'Card' | 'Cheque';
  receiptSent: boolean;
  sponsorshipCampaign?: string;
}

export interface AdminFeedback {
  id: string;
  volunteerName: string;
  campaignName: string;
  date: string;
  rating: number; // 1-5
  comment: string;
  status: 'New' | 'Reviewed' | 'Responded';
  response?: string;
}

// ---- KPI Overview Metrics ----
export const INITIAL_KPI_METRICS = {
  totalPatients: 1420,
  totalVolunteers: 2400,
  partnerHospitals: 4,
  activeCampaigns: 6,
  pendingHospitalTieups: 3,
  financialAidRequests: 12,
  donationsReceived: 840500, // INR
  upcomingEvents: 3,
  recentActivities: [
    { id: 'act-1', text: 'Volunteer "Rahul Verma" approved by Admin', time: '10 mins ago', type: 'volunteer' },
    { id: 'act-2', text: 'New tie-up request submitted by "Fortis Healthcare"', time: '1 hour ago', type: 'hospital' },
    { id: 'act-3', text: 'Free Screening Camp scheduled in Rewari, Haryana', time: '3 hours ago', type: 'campaign' },
    { id: 'act-4', text: 'Donation of ₹25,000 received from "Ananya Mehta"', time: '5 hours ago', type: 'donation' },
    { id: 'act-5', text: 'Patient "Suresh Kumar" assigned to Apex Dwarka', time: '1 day ago', type: 'patient' },
  ]
};

// ---- Mock Patients List ----
export const INITIAL_PATIENTS: Patient[] = [
  { id: 'PAT-001', recordId: 'PAT-001', name: 'Suresh Kumar', age: 48, gender: 'Male', diagnosis: 'Oral Cavity Cancer (Stage II)', hospitalId: 'hosp-1', hospitalName: 'Apex Oncology Institute', assignedVolunteerId: 'V-2026-1022', assignedVolunteerName: 'Rajeshwar Sen', financialAidStatus: 'Approved', financialAidAmount: 50000, status: 'Under Treatment' },
  { id: 'PAT-002', recordId: 'PAT-002', name: 'Priya Sharma', age: 34, gender: 'Female', diagnosis: 'Breast Cancer (Stage I)', hospitalId: 'hosp-2', hospitalName: 'CareWell Cancer Hospital', assignedVolunteerId: 'V-2026-1405', assignedVolunteerName: 'Meera Iyer', financialAidStatus: 'Disbursed', financialAidAmount: 75000, status: 'Recovered' },
  { id: 'PAT-003', recordId: 'PAT-003', name: 'Amit Patel', age: 52, gender: 'Male', diagnosis: 'Lung Cancer (Stage III)', hospitalId: 'hosp-4', hospitalName: 'Narayana Health City', financialAidStatus: 'Pending Review', financialAidAmount: 120000, status: 'Under Treatment' },
  { id: 'PAT-004', recordId: 'PAT-004', name: 'Sunita Devi', age: 41, gender: 'Female', diagnosis: 'Cervical Cancer (Stage II)', hospitalId: 'hosp-3', hospitalName: 'Tata Cancer Care', financialAidStatus: 'Not Requested', status: 'Follow-up' },
  { id: 'PAT-005', recordId: 'PAT-005', name: 'Rajesh Yadav', age: 60, gender: 'Male', diagnosis: 'Oral Lesion (Benign)', hospitalId: 'hosp-1', hospitalName: 'Apex Oncology Institute', financialAidStatus: 'Not Requested', status: 'Screened - Healthy' },
];

// ---- Mock Volunteers List ----
export const INITIAL_ADMIN_VOLUNTEERS: AdminVolunteer[] = [
  { id: 'VOL-001', name: 'Rahul Verma', email: 'rahul.verma@example.com', phone: '+91 99112 23344', domain: 'General Volunteer', city: 'New Delhi', status: 'Pending Approval', assignedCampaignsCount: 0, hoursLogged: 0, attendanceRate: 0, registeredDate: 'Jul 20, 2026' },
  { id: 'VOL-002', name: 'Anjali Singh', email: 'anjali.s@example.com', phone: '+91 98102 34567', domain: 'Medical Student', city: 'Mumbai', status: 'Approved', assignedCampaignsCount: 4, hoursLogged: 32, attendanceRate: 95, registeredDate: 'May 12, 2026' },
  { id: 'VOL-003', name: 'Vikram Malhotra', email: 'vikram.m@example.com', phone: '+91 95603 45678', domain: 'Corporate Professional', city: 'Noida', status: 'Approved', assignedCampaignsCount: 6, hoursLogged: 48, attendanceRate: 88, registeredDate: 'Apr 05, 2026' },
  { id: 'VOL-004', name: 'Dr. Neha Gupta', email: 'neha.gupta@example.com', phone: '+91 98991 23456', domain: 'Nurse / Clinical Assistant', city: 'Gurugram', status: 'Pending Approval', assignedCampaignsCount: 0, hoursLogged: 0, attendanceRate: 0, registeredDate: 'Jul 19, 2026' },
  { id: 'VOL-005', name: 'Kunal Sen', email: 'kunal.sen@example.com', phone: '+91 99712 34567', domain: 'Cancer Survivor Advocate', city: 'Pune', status: 'Approved', assignedCampaignsCount: 8, hoursLogged: 72, attendanceRate: 100, registeredDate: 'Feb 15, 2026' },
];

// ---- Mock Hospital Requests ----
export const INITIAL_HOSPITAL_REQUESTS: PartnerHospital[] = [
  { id: 'REQ-H1', name: 'Fortis Oncology Center', city: 'Gurugram', status: 'Pending Tie-up', appliedDate: 'Jul 18, 2026', documentVerified: false, contactEmail: 'info@fortishospitals.com', contactPhone: '+91 124 496 2200' },
  { id: 'REQ-H2', name: 'Max Super Speciality Hospital', city: 'Saket, New Delhi', status: 'Recommended to Super Admin', appliedDate: 'Jul 10, 2026', documentVerified: true, contactEmail: 'admin@maxhealthcare.com', contactPhone: '+91 11 2651 5050' },
  { id: 'REQ-H3', name: 'Apollo Proton Cancer Centre', city: 'Chennai', status: 'Pending Tie-up', appliedDate: 'Jul 15, 2026', documentVerified: true, contactEmail: 'proton@apollohospitals.com', contactPhone: '+91 44 3333 4444' },
];


// ---- Mock Donations List ----
export const INITIAL_ADMIN_DONATIONS: AdminDonation[] = [
  { id: 'DON-001', donorName: 'Ananya Mehta', donorType: 'Individual', amount: 25000, date: 'Jul 21, 2026', paymentMethod: 'UPI', receiptSent: true, sponsorshipCampaign: 'Free Early Detection Camp' },
  { id: 'DON-002', donorName: 'Ramsay Foundation', donorType: 'Foundation', amount: 200000, date: 'Jul 15, 2026', paymentMethod: 'Cheque', receiptSent: true },
  { id: 'DON-003', donorName: 'Tech Mahindra Ltd.', donorType: 'Corporate', amount: 150000, date: 'Jul 12, 2026', paymentMethod: 'Net Banking', receiptSent: true, sponsorshipCampaign: 'Rural Outreach Haryana' },
  { id: 'DON-004', donorName: 'Rajiv Malhotra', donorType: 'Individual', amount: 10000, date: 'Jul 20, 2026', paymentMethod: 'Card', receiptSent: false },
  { id: 'DON-005', donorName: 'Goonj Social Aid', donorType: 'NGO', amount: 50000, date: 'Jul 18, 2026', paymentMethod: 'Net Banking', receiptSent: true },
];

// ---- Mock Feedbacks List ----
export const INITIAL_ADMIN_FEEDBACKS: AdminFeedback[] = [
  { id: 'FDB-001', volunteerName: 'Meera Iyer', campaignName: 'Mega Blood Donation Drive', date: 'Jul 16, 2026', rating: 5, comment: 'Excellently managed. The hydration stalls and volunteer shifts were perfectly organized.', status: 'Reviewed' },
  { id: 'FDB-002', volunteerName: 'Vikram Malhotra', campaignName: 'Free Early Detection Camp', date: 'Jul 18, 2026', rating: 3, comment: 'The screening line grew too long between 11 AM - 1 PM. We need an extra coordinator for registrations.', status: 'New' },
  { id: 'FDB-003', volunteerName: 'Anjali Singh', campaignName: 'Nutrition Post-Treatment', date: 'Jul 15, 2026', rating: 4, comment: 'Great webinar turnout. The PDF diet sheets should be emailed automatically next time.', status: 'Responded', response: 'Good suggestion. We will link auto-email receipts for webinar guides.' },
];
