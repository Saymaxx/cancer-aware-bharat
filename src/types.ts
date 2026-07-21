export interface Hospital {
  id: string;
  name: string;
  logo: string;
  type: 'Center of Excellence' | 'Community Partner';
  region: 'north' | 'south' | 'east' | 'west';
  city: string;
  state: string;
  specialties: string[];
  phone: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  type: 'Blood Donation' | 'Screening Camp' | 'Workshop' | 'Awareness';
  image: string;
  date: string;
  time: string;
  location: string;
  description: string;
  category: string;
  registeredCount: number;
  capacity: number;
}

export interface BlogArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  role: string;
  date: string;
  readTime: string;
  category: 'Prevention' | 'Nutrition' | 'Survivors' | 'Research';
  image: string;
  tags: string[];
}

export interface VolunteerRegistration {
  id: string;
  name: string;
  email: string;
  phone: string;
  area: string;
  availableDays: string[];
  motivation: string;
  date: string;
  volunteerId: string;
}

export interface PatientEnquiry {
  id: string;
  patientName: string;
  age: number;
  gender: string;
  city: string;
  phone: string;
  reason: string;
  hospitalId: string;
  preferredDate: string;
  status: 'Pending' | 'Confirmed' | 'Completed';
  referenceNumber: string;
  date: string;
}

export interface HospitalPartnerRequest {
  id: string;
  hospitalName: string;
  contactName: string;
  designation: string;
  email: string;
  phone: string;
  city: string;
  specialties: string;
  motivation: string;
  date: string;
  status: 'Pending' | 'Approved';
}
