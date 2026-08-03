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
  paymentMethod: 'UPI' | 'Net Banking' | 'Card' | 'Cheque' | 'Razorpay';
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

