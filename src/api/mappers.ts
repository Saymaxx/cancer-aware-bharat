// Reshapes backend API responses into the frontend's existing src/types.ts
// interfaces, so AdminDashboard/SuperAdminDashboard/EnquiryTimelineModal
// keep working unmodified against real data.

import { ApiBlogArticle, ApiCampaignRequest, ApiEvent, ApiHospital, ApiNotification, ApiPatientEnquiry } from './client';
import { AppNotification, BlogArticle, Event, Hospital, PatientEnquiry } from '../types';
import { CampaignRequest } from '../adminDashboardData';

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

export function mapApiEnquiry(api: ApiPatientEnquiry): PatientEnquiry {
  return {
    id: api.id,
    enquiryId: api.enquiryId,
    referenceNumber: api.referenceNumber,
    patientName: api.patientName,
    age: api.age,
    gender: api.gender,
    phone: api.phone,
    email: api.email || undefined,
    address: api.address || undefined,
    city: api.city,
    state: api.state || undefined,
    preferredLocation: api.preferredLocation || undefined,
    reason: api.reason,
    cancerType: api.cancerType || undefined,
    symptoms: api.symptoms || undefined,
    notes: api.notes || undefined,
    uploadedReports: api.uploadedReports.map(r => ({
      id: r.id,
      name: r.name,
      size: r.size || '',
      type: r.type || '',
      uploadedAt: formatTimestamp(r.uploadedAt),
      url: r.url,
    })),
    hospitalId: api.hospitalId || undefined,
    preferredHospitalName: api.preferredHospitalName || undefined,
    assignedHospitalName: api.assignedHospitalName || undefined,
    preferredDate: api.preferredDate || undefined,
    status: api.status as PatientEnquiry['status'],
    priority: api.priority as PatientEnquiry['priority'],

    adminDecision: api.adminDecidedBy ? {
      decidedBy: api.adminDecidedBy,
      decidedAt: api.adminDecidedAt || '',
      action: api.adminAction as 'Approve' | 'Reject',
      remarks: api.adminRemarks || undefined,
    } : undefined,
    superAdminAssignment: api.superAdminAssignedBy ? {
      assignedBy: api.superAdminAssignedBy,
      assignedAt: api.superAdminAssignedAt || '',
      hospitalId: api.hospitalId || '',
      hospitalName: api.assignedHospitalName || '',
      remarks: api.superAdminRemarks || undefined,
    } : undefined,
    hospitalDecision: api.hospitalDecidedBy ? {
      decidedBy: api.hospitalDecidedBy,
      decidedAt: api.hospitalDecidedAt || '',
      action: api.hospitalAction as 'Accept' | 'Decline',
      remarks: api.hospitalRemarks || undefined,
    } : undefined,

    appointment: api.appointment ? {
      appointmentId: api.appointment.appointmentId,
      hospitalId: api.appointment.hospitalId,
      hospitalName: api.appointment.hospitalName,
      patientName: api.appointment.patientName,
      date: api.appointment.date,
      time: api.appointment.time,
      doctor: api.appointment.doctor,
      status: api.appointment.status as 'Appointment Confirmed' | 'Completed' | 'Cancelled',
      createdAt: api.appointment.createdAt,
    } : undefined,

    timeline: api.timeline.map(t => ({
      id: t.id,
      stage: t.stage,
      description: t.description,
      timestamp: formatTimestamp(t.createdAt),
      actor: t.actor || undefined,
      remarks: t.remarks || undefined,
    })),
    date: api.date,
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
  };
}

export function mapApiHospital(api: ApiHospital): Hospital {
  return {
    id: api.id,
    name: api.name,
    logo: api.logo || '',
    type: api.type as Hospital['type'],
    region: api.region as Hospital['region'],
    city: api.city,
    state: api.state,
    specialties: api.specialties,
    phone: api.phone,
    email: api.email,
    address: api.address,
    lat: api.lat,
    lng: api.lng,
    description: api.description,
  };
}

export function mapApiBlog(api: ApiBlogArticle): BlogArticle {
  return {
    id: api.id,
    title: api.title,
    summary: api.summary,
    content: api.content,
    author: api.author,
    role: api.role ?? '',
    date: api.date,
    readTime: api.readTime ?? '',
    category: api.category as BlogArticle['category'],
    image: api.image ?? '',
    tags: api.tags,
  };
}

export function mapApiEvent(api: ApiEvent): Event {
  return {
    id: api.id,
    title: api.title,
    type: api.type as Event['type'],
    image: api.image ?? '',
    date: api.date,
    time: api.time,
    location: api.location,
    description: api.description,
    category: api.category,
    registeredCount: api.registeredCount,
    capacity: api.capacity,
    status: api.status,
  };
}

export function mapApiCampaignRequest(api: ApiCampaignRequest): CampaignRequest {
  return {
    id: api.id,
    organizationName: api.organizationName,
    orgType: api.orgType,
    contactPerson: api.contactPerson,
    email: api.email,
    phone: api.phone,
    requestedDate: api.requestedDate,
    location: api.location,
    expectedAttendees: api.expectedAttendees,
    status: api.status,
  };
}

export function mapApiNotification(api: ApiNotification): AppNotification {
  return {
    id: api.id,
    targetRole: api.targetRole as AppNotification['targetRole'],
    targetHospitalId: api.targetHospitalId || undefined,
    title: api.title,
    message: api.message,
    enquiryId: api.enquiryId || undefined,
    timestamp: formatTimestamp(api.createdAt),
    read: api.read,
  };
}
