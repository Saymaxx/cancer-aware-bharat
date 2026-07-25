import { useState, useEffect } from 'react';
import { PatientEnquiry, EnquiryStatus, TimelineEvent, AppointmentDetails, AppNotification, UploadedReport } from './types';
import { INITIAL_HOSPITALS } from './data';

const ENQUIRIES_KEY = 'aware_bharat_patient_enquiries';
const NOTIFICATIONS_KEY = 'aware_bharat_notifications';

const EVENT_ENQUIRIES_UPDATED = 'aware_bharat_enquiries_updated';
const EVENT_NOTIFICATIONS_UPDATED = 'aware_bharat_notifications_updated';

// Helper to broadcast custom window events so all UI components update reactively
const notifyEnquiriesChanged = () => {
  window.dispatchEvent(new Event(EVENT_ENQUIRIES_UPDATED));
};

const notifyNotificationsChanged = () => {
  window.dispatchEvent(new Event(EVENT_NOTIFICATIONS_UPDATED));
};

// Seed initial mock enquiries if local storage is empty
const INITIAL_SEED_ENQUIRIES: PatientEnquiry[] = [
  {
    id: 'enq-001',
    enquiryId: 'ENQ-2026-94821',
    referenceNumber: 'PAT-2026-94821',
    patientName: 'Sunita Sharma',
    age: 52,
    gender: 'Female',
    phone: '+91 98112 34567',
    email: 'sunita.sharma@gmail.com',
    address: 'B-4/12, Dwarka Sector 7',
    city: 'New Delhi',
    state: 'Delhi',
    preferredLocation: 'New Delhi',
    reason: 'Free Cancer Screening',
    cancerType: 'Breast Cancer Screening',
    symptoms: 'Painless palpable breast lump noticed 4 weeks ago, fatigue',
    notes: 'Seeking immediate screening camp slot in Delhi NCR region.',
    priority: 'Urgent',
    status: 'Pending Admin Review',
    uploadedReports: [
      { id: 'rep-101', name: 'Blood_Report_CBC_Delhi.pdf', size: '1.2 MB', type: 'application/pdf', uploadedAt: '2026-07-20 10:30 AM' }
    ],
    hospitalId: INITIAL_HOSPITALS[0].id,
    preferredHospitalName: INITIAL_HOSPITALS[0].name,
    timeline: [
      {
        id: 'tl-101',
        stage: 'Patient Submitted',
        description: 'Patient submitted online enquiry form for free screening camp admission.',
        timestamp: '2026-07-20 10:30 AM',
        actor: 'Sunita Sharma (Patient)'
      }
    ],
    date: '2026-07-20',
    createdAt: '2026-07-20T10:30:00Z',
    updatedAt: '2026-07-20T10:30:00Z'
  },
  {
    id: 'enq-002',
    enquiryId: 'ENQ-2026-78102',
    referenceNumber: 'PAT-2026-78102',
    patientName: 'Rajesh Varma',
    age: 61,
    gender: 'Male',
    phone: '+91 98220 54321',
    email: 'r.varma@outlook.com',
    address: 'Flat 302, Kothrud',
    city: 'Pune',
    state: 'Maharashtra',
    preferredLocation: 'Pune',
    reason: 'Clinical Second Opinion',
    cancerType: 'Prostate Cancer',
    symptoms: 'Elevated PSA levels (8.4 ng/mL), dysuria',
    notes: 'Biopsy report attached. Seeking surgical oncologist second opinion.',
    priority: 'Urgent',
    status: 'Approved by Admin',
    uploadedReports: [
      { id: 'rep-102', name: 'PSA_Lab_Analysis_Pune.pdf', size: '2.4 MB', type: 'application/pdf', uploadedAt: '2026-07-21 02:15 PM' },
      { id: 'rep-103', name: 'Biopsy_Histopathology_Report.pdf', size: '3.1 MB', type: 'application/pdf', uploadedAt: '2026-07-21 02:16 PM' }
    ],
    adminDecision: {
      decidedBy: 'Dr. Ramesh Sharma (Admin)',
      decidedAt: '2026-07-21 04:30 PM',
      action: 'Approve',
      remarks: 'Primary lab and biopsy reports verified. Approved for Super Admin board hospital assignment.'
    },
    timeline: [
      {
        id: 'tl-201',
        stage: 'Patient Submitted',
        description: 'Patient submitted online enquiry form for Clinical Second Opinion.',
        timestamp: '2026-07-21 02:15 PM',
        actor: 'Rajesh Varma (Patient)'
      },
      {
        id: 'tl-202',
        stage: 'Admin Approved',
        description: 'Enquiry reviewed and approved by Regional Admin (Dr. Ramesh Sharma). Forwarded for Hospital Assignment.',
        timestamp: '2026-07-21 04:30 PM',
        actor: 'Dr. Ramesh Sharma (Admin)',
        remarks: 'Primary lab and biopsy reports verified.'
      }
    ],
    date: '2026-07-21',
    createdAt: '2026-07-21T14:15:00Z',
    updatedAt: '2026-07-21T16:30:00Z'
  },
  {
    id: 'enq-003',
    enquiryId: 'ENQ-2026-44129',
    referenceNumber: 'PAT-2026-44129',
    patientName: 'Meena Deshmukh',
    age: 48,
    gender: 'Female',
    phone: '+91 97654 88990',
    email: 'm.deshmukh@yahoo.com',
    address: '14, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    preferredLocation: 'Mumbai',
    reason: 'Chemotherapy / Radiotherapy guidance',
    cancerType: 'Cervical Cancer',
    symptoms: 'Post-coital bleeding and pelvic pain',
    notes: 'Referred by NGO caseworker for tertiary hospital admission.',
    priority: 'Critical',
    status: 'Assigned to Hospital',
    uploadedReports: [
      { id: 'rep-104', name: 'MRI_Pelvis_Scan_Mumbai.pdf', size: '4.8 MB', type: 'application/pdf', uploadedAt: '2026-07-22 09:00 AM' }
    ],
    hospitalId: INITIAL_HOSPITALS[0].id, // Rajiv Gandhi Cancer Institute / Center
    assignedHospitalName: INITIAL_HOSPITALS[0].name,
    adminDecision: {
      decidedBy: 'Dr. Ramesh Sharma (Admin)',
      decidedAt: '2026-07-22 10:15 AM',
      action: 'Approve',
      remarks: 'Critical priority flagged.'
    },
    superAdminAssignment: {
      assignedBy: 'Trust Board Admin (Super Admin)',
      assignedAt: '2026-07-22 11:45 AM',
      hospitalId: INITIAL_HOSPITALS[0].id,
      hospitalName: INITIAL_HOSPITALS[0].name,
      remarks: 'Assigned to Center of Excellence with specialized radiation oncology wing.'
    },
    timeline: [
      {
        id: 'tl-301',
        stage: 'Patient Submitted',
        description: 'Patient submitted online enquiry form for Radiotherapy guidance.',
        timestamp: '2026-07-22 09:00 AM',
        actor: 'Meena Deshmukh (Patient)'
      },
      {
        id: 'tl-302',
        stage: 'Admin Approved',
        description: 'Approved by Regional Admin.',
        timestamp: '2026-07-22 10:15 AM',
        actor: 'Dr. Ramesh Sharma (Admin)'
      },
      {
        id: 'tl-303',
        stage: 'Assigned to Hospital',
        description: `Assigned to ${INITIAL_HOSPITALS[0].name} by Super Admin.`,
        timestamp: '2026-07-22 11:45 AM',
        actor: 'Super Admin',
        remarks: 'Assigned to Center of Excellence wing.'
      }
    ],
    date: '2026-07-22',
    createdAt: '2026-07-22T09:00:00Z',
    updatedAt: '2026-07-22T11:45:00Z'
  },
  {
    id: 'enq-004',
    enquiryId: 'ENQ-2026-31088',
    referenceNumber: 'PAT-2026-31088',
    patientName: 'Anil Kumar',
    age: 55,
    gender: 'Male',
    phone: '+91 99887 66554',
    email: 'anil.k@gmail.com',
    address: 'Sector 15, Vashi',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    preferredLocation: 'Mumbai',
    reason: 'Financial Aid / Gov Scheme Assistance',
    cancerType: 'Head & Neck Cancer',
    symptoms: 'Non-healing oral ulcer for over 2 months',
    notes: 'Aayushman Bharat card holder.',
    priority: 'Normal',
    status: 'Appointment Confirmed',
    uploadedReports: [
      { id: 'rep-105', name: 'Oral_Biopsy_Report.pdf', size: '1.8 MB', type: 'application/pdf', uploadedAt: '2026-07-18 11:00 AM' }
    ],
    hospitalId: INITIAL_HOSPITALS[0].id,
    assignedHospitalName: INITIAL_HOSPITALS[0].name,
    adminDecision: {
      decidedBy: 'Dr. Ramesh Sharma (Admin)',
      decidedAt: '2026-07-18 01:00 PM',
      action: 'Approve'
    },
    superAdminAssignment: {
      assignedBy: 'Super Admin',
      assignedAt: '2026-07-18 02:30 PM',
      hospitalId: INITIAL_HOSPITALS[0].id,
      hospitalName: INITIAL_HOSPITALS[0].name
    },
    hospitalDecision: {
      decidedBy: INITIAL_HOSPITALS[0].name,
      decidedAt: '2026-07-19 10:00 AM',
      action: 'Accept',
      remarks: 'Slot scheduled with Head & Neck surgical oncology team.'
    },
    appointment: {
      appointmentId: 'APT-2026-88912',
      hospitalId: INITIAL_HOSPITALS[0].id,
      hospitalName: INITIAL_HOSPITALS[0].name,
      patientName: 'Anil Kumar',
      date: '2026-07-28',
      time: '10:30 AM',
      doctor: 'Dr. Siddharth Roy (Surgical Oncology)',
      status: 'Appointment Confirmed',
      createdAt: '2026-07-19T10:00:00Z'
    },
    timeline: [
      { id: 'tl-401', stage: 'Patient Submitted', description: 'Enquiry form submitted.', timestamp: '2026-07-18 11:00 AM', actor: 'Anil Kumar' },
      { id: 'tl-402', stage: 'Admin Approved', description: 'Approved by Regional Admin.', timestamp: '2026-07-18 01:00 PM', actor: 'Dr. Ramesh Sharma' },
      { id: 'tl-403', stage: 'Assigned to Hospital', description: `Assigned to ${INITIAL_HOSPITALS[0].name}.`, timestamp: '2026-07-18 02:30 PM', actor: 'Super Admin' },
      { id: 'tl-404', stage: 'Hospital Accepted', description: `Accepted by ${INITIAL_HOSPITALS[0].name}.`, timestamp: '2026-07-19 10:00 AM', actor: INITIAL_HOSPITALS[0].name },
      { id: 'tl-405', stage: 'Appointment Created', description: `Appointment Confirmed for 2026-07-28 10:30 AM with Dr. Siddharth Roy.`, timestamp: '2026-07-19 10:00 AM', actor: INITIAL_HOSPITALS[0].name }
    ],
    date: '2026-07-18',
    createdAt: '2026-07-18T11:00:00Z',
    updatedAt: '2026-07-19T10:00:00Z'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'admin',
    title: 'New Patient Enquiry',
    message: 'New enquiry ENQ-2026-94821 received from Sunita Sharma (New Delhi). Status: Pending Admin Review.',
    enquiryId: 'ENQ-2026-94821',
    timestamp: '2026-07-20 10:30 AM',
    read: false
  },
  {
    id: 'notif-2',
    targetRole: 'superadmin',
    title: 'Patient Enquiry Approved by Admin',
    message: 'Regional Admin approved Rajesh Varma (ENQ-2026-78102). Pending hospital assignment.',
    enquiryId: 'ENQ-2026-78102',
    timestamp: '2026-07-21 04:30 PM',
    read: false
  },
  {
    id: 'notif-3',
    targetRole: 'hospital',
    targetHospitalId: INITIAL_HOSPITALS[0].id,
    title: 'New Patient Assigned',
    message: 'Super Admin assigned patient Meena Deshmukh (ENQ-2026-44129) to your facility.',
    enquiryId: 'ENQ-2026-44129',
    timestamp: '2026-07-22 11:45 AM',
    read: false
  }
];

// Data Store Accessors
export const enquiryStore = {
  getEnquiries(): PatientEnquiry[] {
    const raw = localStorage.getItem(ENQUIRIES_KEY);
    if (!raw) {
      localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(INITIAL_SEED_ENQUIRIES));
      return INITIAL_SEED_ENQUIRIES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SEED_ENQUIRIES;
    }
  },

  getNotifications(role?: 'admin' | 'superadmin' | 'hospital' | 'patient' | 'volunteer', hospitalId?: string): AppNotification[] {
    const raw = localStorage.getItem(NOTIFICATIONS_KEY);
    let list: AppNotification[] = [];
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(INITIAL_NOTIFICATIONS));
      list = INITIAL_NOTIFICATIONS;
    } else {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_NOTIFICATIONS;
      }
    }
    if (!role) return list;
    return list.filter(n => {
      if (n.targetRole !== role) return false;
      if (role === 'hospital' && hospitalId && n.targetHospitalId && n.targetHospitalId !== hospitalId) {
        return false;
      }
      return true;
    });
  },

  addNotification(notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      read: false
    };
    list.unshift(newNotif);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    notifyNotificationsChanged();
  },

  markNotificationAsRead(id: string) {
    const list = this.getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    notifyNotificationsChanged();
  },

  // Step 1: Save Patient Enquiry
  saveEnquiry(data: {
    patientName: string;
    age: number;
    gender: string;
    phone: string;
    email?: string;
    address?: string;
    city: string;
    state?: string;
    preferredLocation?: string;
    reason: string;
    cancerType?: string;
    symptoms?: string;
    notes?: string;
    uploadedReports?: UploadedReport[];
    preferredHospitalId?: string;
    preferredDate?: string;
    priority?: 'Normal' | 'Urgent' | 'Critical';
  }): PatientEnquiry {
    const enquiries = this.getEnquiries();

    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const enquiryId = `ENQ-2026-${randomNum}`;
    const referenceNumber = `PAT-2026-${randomNum}`;
    const nowIso = new Date().toISOString();
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    let preferredHospitalName = undefined;
    if (data.preferredHospitalId) {
      const foundHosp = INITIAL_HOSPITALS.find(h => h.id === data.preferredHospitalId);
      if (foundHosp) preferredHospitalName = foundHosp.name;
    }

    const newEnquiry: PatientEnquiry = {
      id: Math.random().toString(36).substr(2, 9),
      enquiryId,
      referenceNumber,
      patientName: data.patientName,
      age: data.age,
      gender: data.gender,
      phone: data.phone,
      email: data.email || '',
      address: data.address || `${data.city}`,
      city: data.city,
      state: data.state || '',
      preferredLocation: data.preferredLocation || data.city,
      reason: data.reason,
      cancerType: data.cancerType || data.reason,
      symptoms: data.symptoms || data.notes || '',
      notes: data.notes || '',
      uploadedReports: data.uploadedReports || [],
      hospitalId: data.preferredHospitalId,
      preferredHospitalName,
      preferredDate: data.preferredDate,
      status: 'Pending Admin Review',
      priority: data.priority || (data.symptoms?.toLowerCase().includes('lump') || data.symptoms?.toLowerCase().includes('stage') ? 'Urgent' : 'Normal'),
      timeline: [
        {
          id: 'tl-' + Date.now(),
          stage: 'Patient Submitted',
          description: `Patient ${data.patientName} submitted enquiry form for ${data.reason}.`,
          timestamp: nowFormatted,
          actor: `${data.patientName} (Patient)`
        }
      ],
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: nowIso,
      updatedAt: nowIso
    };

    enquiries.unshift(newEnquiry);
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));

    // Notification for Admin
    this.addNotification({
      targetRole: 'admin',
      title: 'New Patient Enquiry Received',
      message: `Enquiry ${enquiryId} for ${data.patientName} (${data.city}) submitted. Status: Pending Admin Review.`,
      enquiryId: newEnquiry.enquiryId
    });

    // Notification for Patient
    this.addNotification({
      targetRole: 'patient',
      title: 'Enquiry Received',
      message: `Your enquiry ${enquiryId} (Ref: ${referenceNumber}) has been submitted successfully and is pending admin review.`,
      enquiryId: newEnquiry.enquiryId
    });

    notifyEnquiriesChanged();
    return newEnquiry;
  },

  // Step 2: Admin Approve
  adminApproveEnquiry(id: string, remarks?: string, adminName: string = 'Dr. Ramesh Sharma'): PatientEnquiry | null {
    const enquiries = this.getEnquiries();
    const index = enquiries.findIndex(e => e.id === id || e.enquiryId === id);
    if (index === -1) return null;

    const enquiry = enquiries[index];
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString();

    const updatedTimeline: TimelineEvent[] = [
      ...enquiry.timeline,
      {
        id: 'tl-' + Date.now(),
        stage: 'Admin Approved',
        description: `Enquiry reviewed and approved by Admin (${adminName}). Forwarded for Super Admin hospital assignment.`,
        timestamp: nowFormatted,
        actor: adminName,
        remarks: remarks || 'Approved after document verification.'
      }
    ];

    const updated: PatientEnquiry = {
      ...enquiry,
      status: 'Approved by Admin',
      adminDecision: {
        decidedBy: adminName,
        decidedAt: nowFormatted,
        action: 'Approve',
        remarks: remarks || 'Approved after verification'
      },
      timeline: updatedTimeline,
      updatedAt: nowIso
    };

    enquiries[index] = updated;
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));

    // Notifications
    this.addNotification({
      targetRole: 'superadmin',
      title: 'Enquiry Approved by Admin',
      message: `Patient ${enquiry.patientName} (${enquiry.enquiryId}) approved by Admin ${adminName}. Pending Hospital Assignment.`,
      enquiryId: enquiry.enquiryId
    });

    this.addNotification({
      targetRole: 'patient',
      title: 'Enquiry Approved by Admin',
      message: `Your enquiry ${enquiry.enquiryId} has been approved by Cancer Aware Bharat Admin and is pending hospital assignment.`,
      enquiryId: enquiry.enquiryId
    });

    notifyEnquiriesChanged();
    return updated;
  },

  // Step 2: Admin Reject
  adminRejectEnquiry(id: string, rejectionReason: string, adminName: string = 'Dr. Ramesh Sharma'): PatientEnquiry | null {
    const enquiries = this.getEnquiries();
    const index = enquiries.findIndex(e => e.id === id || e.enquiryId === id);
    if (index === -1) return null;

    const enquiry = enquiries[index];
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString();

    const updatedTimeline: TimelineEvent[] = [
      ...enquiry.timeline,
      {
        id: 'tl-' + Date.now(),
        stage: 'Admin Rejected',
        description: `Enquiry rejected by Admin (${adminName}). Reason: ${rejectionReason}`,
        timestamp: nowFormatted,
        actor: adminName,
        remarks: rejectionReason
      }
    ];

    const updated: PatientEnquiry = {
      ...enquiry,
      status: 'Rejected by Admin',
      adminDecision: {
        decidedBy: adminName,
        decidedAt: nowFormatted,
        action: 'Reject',
        remarks: rejectionReason
      },
      timeline: updatedTimeline,
      updatedAt: nowIso
    };

    enquiries[index] = updated;
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));

    // Notification to Patient
    this.addNotification({
      targetRole: 'patient',
      title: 'Enquiry Decision Notice',
      message: `Your enquiry ${enquiry.enquiryId} was reviewed. Reason: ${rejectionReason}. Please contact support for guidance.`,
      enquiryId: enquiry.enquiryId
    });

    notifyEnquiriesChanged();
    return updated;
  },

  // Step 4: Super Admin Assign to Hospital
  superAdminAssignHospital(
    id: string,
    hospitalId: string,
    hospitalName: string,
    remarks?: string,
    superAdminName: string = 'Board Administrator'
  ): PatientEnquiry | null {
    const enquiries = this.getEnquiries();
    const index = enquiries.findIndex(e => e.id === id || e.enquiryId === id);
    if (index === -1) return null;

    const enquiry = enquiries[index];
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString();

    const updatedTimeline: TimelineEvent[] = [
      ...enquiry.timeline,
      {
        id: 'tl-' + Date.now(),
        stage: 'Assigned to Hospital',
        description: `Patient assigned to ${hospitalName} by Super Admin (${superAdminName}).`,
        timestamp: nowFormatted,
        actor: superAdminName,
        remarks: remarks || `Assigned to ${hospitalName}`
      }
    ];

    const updated: PatientEnquiry = {
      ...enquiry,
      hospitalId,
      assignedHospitalName: hospitalName,
      status: 'Assigned to Hospital',
      superAdminAssignment: {
        assignedBy: superAdminName,
        assignedAt: nowFormatted,
        hospitalId,
        hospitalName,
        remarks: remarks || ''
      },
      timeline: updatedTimeline,
      updatedAt: nowIso
    };

    enquiries[index] = updated;
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));

    // Notification to Hospital
    this.addNotification({
      targetRole: 'hospital',
      targetHospitalId: hospitalId,
      title: 'New Patient Assigned',
      message: `New patient ${enquiry.patientName} (${enquiry.enquiryId}) assigned to your hospital by Super Admin. Please review and respond.`,
      enquiryId: enquiry.enquiryId
    });

    // Notification to Patient
    this.addNotification({
      targetRole: 'patient',
      title: 'Hospital Assigned',
      message: `Your enquiry ${enquiry.enquiryId} has been assigned to ${hospitalName}. The hospital team is reviewing your appointment.`,
      enquiryId: enquiry.enquiryId
    });

    notifyEnquiriesChanged();
    return updated;
  },

  // Step 5 & 6: Hospital Accept Patient & Auto Appointment
  hospitalAcceptEnquiry(
    id: string,
    appointmentDate: string,
    appointmentTime: string,
    doctorName: string,
    remarks?: string,
    hospitalName: string = 'Partner Hospital'
  ): PatientEnquiry | null {
    const enquiries = this.getEnquiries();
    const index = enquiries.findIndex(e => e.id === id || e.enquiryId === id);
    if (index === -1) return null;

    const enquiry = enquiries[index];
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString();

    const appointmentId = `APT-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const appointmentDetails: AppointmentDetails = {
      appointmentId,
      hospitalId: enquiry.hospitalId || 'hosp-001',
      hospitalName: enquiry.assignedHospitalName || hospitalName,
      patientName: enquiry.patientName,
      date: appointmentDate || enquiry.preferredDate || new Date().toISOString().split('T')[0],
      time: appointmentTime || '10:30 AM',
      doctor: doctorName || 'Dr. Specialist (Oncology)',
      status: 'Appointment Confirmed',
      createdAt: nowIso
    };

    const updatedTimeline: TimelineEvent[] = [
      ...enquiry.timeline,
      {
        id: 'tl-' + Date.now(),
        stage: 'Hospital Accepted',
        description: `Accepted by ${hospitalName}. Remarks: ${remarks || 'Patient accepted for clinical evaluation.'}`,
        timestamp: nowFormatted,
        actor: hospitalName,
        remarks: remarks || 'Accepted by hospital'
      },
      {
        id: 'tl-' + (Date.now() + 1),
        stage: 'Appointment Created',
        description: `Appointment (${appointmentId}) confirmed for ${appointmentDetails.date} at ${appointmentDetails.time} with ${appointmentDetails.doctor}.`,
        timestamp: nowFormatted,
        actor: hospitalName
      }
    ];

    const updated: PatientEnquiry = {
      ...enquiry,
      status: 'Appointment Confirmed',
      hospitalDecision: {
        decidedBy: hospitalName,
        decidedAt: nowFormatted,
        action: 'Accept',
        remarks: remarks || 'Accepted by hospital'
      },
      appointment: appointmentDetails,
      timeline: updatedTimeline,
      updatedAt: nowIso
    };

    enquiries[index] = updated;
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));

    // Notifications
    this.addNotification({
      targetRole: 'admin',
      title: 'Patient Appointment Confirmed',
      message: `Hospital ${hospitalName} accepted patient ${enquiry.patientName}. Appointment ${appointmentId} confirmed for ${appointmentDetails.date}.`,
      enquiryId: enquiry.enquiryId
    });

    this.addNotification({
      targetRole: 'superadmin',
      title: 'Patient Appointment Confirmed',
      message: `Hospital ${hospitalName} accepted patient ${enquiry.patientName} (${enquiry.enquiryId}). Appointment confirmed.`,
      enquiryId: enquiry.enquiryId
    });

    this.addNotification({
      targetRole: 'hospital',
      targetHospitalId: enquiry.hospitalId,
      title: 'Appointment Confirmed',
      message: `Appointment ${appointmentId} generated for patient ${enquiry.patientName} on ${appointmentDetails.date} at ${appointmentDetails.time}.`,
      enquiryId: enquiry.enquiryId
    });

    this.addNotification({
      targetRole: 'patient',
      title: 'Appointment Confirmed!',
      message: `Great news! Your appointment (${appointmentId}) at ${hospitalName} is confirmed for ${appointmentDetails.date} at ${appointmentDetails.time} with ${appointmentDetails.doctor}.`,
      enquiryId: enquiry.enquiryId
    });

    notifyEnquiriesChanged();
    return updated;
  },

  // Step 5: Hospital Decline Patient
  hospitalDeclineEnquiry(
    id: string,
    declineReason: string,
    hospitalName: string = 'Partner Hospital'
  ): PatientEnquiry | null {
    const enquiries = this.getEnquiries();
    const index = enquiries.findIndex(e => e.id === id || e.enquiryId === id);
    if (index === -1) return null;

    const enquiry = enquiries[index];
    const nowFormatted = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const nowIso = new Date().toISOString();

    const updatedTimeline: TimelineEvent[] = [
      ...enquiry.timeline,
      {
        id: 'tl-' + Date.now(),
        stage: 'Hospital Declined',
        description: `Declined by ${hospitalName}. Reason: ${declineReason}. Returned to Super Admin queue for reassignment.`,
        timestamp: nowFormatted,
        actor: hospitalName,
        remarks: declineReason
      }
    ];

    const updated: PatientEnquiry = {
      ...enquiry,
      status: 'Declined by Hospital',
      hospitalDecision: {
        decidedBy: hospitalName,
        decidedAt: nowFormatted,
        action: 'Decline',
        remarks: declineReason
      },
      timeline: updatedTimeline,
      updatedAt: nowIso
    };

    enquiries[index] = updated;
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(enquiries));

    // Notification to Super Admin for Reassignment
    this.addNotification({
      targetRole: 'superadmin',
      title: 'Hospital Declined Patient — Reassignment Required',
      message: `Hospital ${hospitalName} declined patient ${enquiry.patientName} (${enquiry.enquiryId}). Reason: "${declineReason}". Reassignment required.`,
      enquiryId: enquiry.enquiryId
    });

    notifyEnquiriesChanged();
    return updated;
  }
};

// React Hook for Enquiries
export function useEnquiries(): PatientEnquiry[] {
  const [enquiries, setEnquiries] = useState<PatientEnquiry[]>(() => enquiryStore.getEnquiries());

  useEffect(() => {
    const handleUpdate = () => {
      setEnquiries(enquiryStore.getEnquiries());
    };
    window.addEventListener(EVENT_ENQUIRIES_UPDATED, handleUpdate);
    return () => {
      window.removeEventListener(EVENT_ENQUIRIES_UPDATED, handleUpdate);
    };
  }, []);

  return enquiries;
}

// React Hook for Notifications
export function useNotifications(role?: 'admin' | 'superadmin' | 'hospital' | 'patient' | 'volunteer', hospitalId?: string): AppNotification[] {
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    enquiryStore.getNotifications(role, hospitalId)
  );

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(enquiryStore.getNotifications(role, hospitalId));
    };
    window.addEventListener(EVENT_NOTIFICATIONS_UPDATED, handleUpdate);
    return () => {
      window.removeEventListener(EVENT_NOTIFICATIONS_UPDATED, handleUpdate);
    };
  }, [role, hospitalId]);


  return notifications;
}

