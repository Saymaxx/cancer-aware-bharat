// ============================================================
// Volunteer Dashboard — Mock Data
// ============================================================

export interface DashboardCampaign {
  id: string;
  name: string;
  type: 'Screening Camp' | 'Blood Donation' | 'Awareness Drive' | 'Workshop' | 'Community Outreach';
  date: string;
  time: string;
  location: string;
  volunteersRequired: number;
  volunteersJoined: number;
  status: 'Open' | 'Filling Fast' | 'Full' | 'Completed';
  image: string;
  organizer: string;
  description: string;
}

export interface ActiveCampaign {
  id: string;
  name: string;
  type: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizerPhone: string;
  attendanceStatus: 'Confirmed' | 'Pending' | 'Checked In';
  targetDate: string; // ISO string for countdown
  image: string;
}

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  location: string;
  status: 'completed' | 'current' | 'upcoming';
  type: 'campaign' | 'training' | 'meeting' | 'break';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
  progress?: number; // 0-100
  requirement: string;
  category: 'milestone' | 'special' | 'streak';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'campaign' | 'announcement' | 'reminder' | 'achievement';
  read: boolean;
}

export interface TrainingResource {
  id: string;
  title: string;
  description: string;
  type: 'PDF Guide' | 'Video' | 'Quiz' | 'Handbook';
  category: 'First Aid' | 'Cancer Awareness' | 'Volunteer Guide' | 'Communication';
  duration: string;
  progress: number; // 0-100
  link: string;
}

export interface Certificate {
  id: string;
  title: string;
  issuedDate: string;
  campaignName: string;
  hours: number;
  certificateId: string;
  status: 'Earned' | 'Pending';
}

export interface GalleryPhoto {
  id: string;
  image: string;
  caption: string;
  campaign: string;
  date: string;
}

// ---- Motivational Quotes ----
export const MOTIVATIONAL_QUOTES = [
  { text: "Every person you help, every screening you support — you're saving lives before they need saving.", author: "Dr. Ramesh Sharma" },
  { text: "The greatest reward of volunteering is the silent thank you in a patient's eyes.", author: "Meera Iyer, Volunteer Lead" },
  { text: "You don't need to be a doctor to heal. Your presence and compassion are medicine.", author: "Cancer Aware Bharat" },
  { text: "One volunteer can change a village. Imagine what 2,400 can do.", author: "Amit Kumar, Program Director" },
  { text: "Early detection is not just a medical protocol — it's a human right we fight for.", author: "Dr. Anjali Deshmukh" },
  { text: "In the fight against cancer, your time is the most precious donation.", author: "Cancer Aware Bharat" },
  { text: "Screening saves. Education empowers. Volunteers make it all happen.", author: "Dr. Ramesh Sharma" },
  { text: "Every camp, every conversation, every pamphlet — ripples that save lives.", author: "Rajeshwar Sen, Survivor Advocate" },
  { text: "When you volunteer, you don't just give your time — you give someone hope.", author: "Cancer Aware Bharat" },
  { text: "The best way to find yourself is to lose yourself in the service of others.", author: "Mahatma Gandhi" },
];

// ---- Volunteer Quick Stats (default for new volunteer) ----
export const DEFAULT_VOLUNTEER_STATS = {
  campaignsJoined: 12,
  campaignsCompleted: 8,
  volunteerHours: 96,
  peopleReached: 1240,
  certificatesEarned: 3,
};

// ---- My Active (Enrolled) Campaigns ----
export const MY_ACTIVE_CAMPAIGNS: ActiveCampaign[] = [
  {
    id: 'active-1',
    name: 'Free Oral Cancer Screening Drive',
    type: 'Screening Camp',
    date: 'Sat, 26 Jul 2026',
    time: '8:00 AM – 2:00 PM',
    location: 'Lions Club Grounds, Dwarka, New Delhi',
    organizer: 'Dr. Ramesh Sharma',
    organizerPhone: '+91 98765 43210',
    attendanceStatus: 'Confirmed',
    targetDate: '2026-07-26T08:00:00+05:30',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD67aBEzQ4mH7MDO2L157RQifaSnmDCt3cgR1mBA8TH9TrWOEVtfrO-LXwPvszbWFRhSqm0iXQWTAIIR9OboD39r61QZ-YZCeSRPwF1OR5sTAR1C41FQ_vE_bR33rhXQiCFAzEIlwPlVTKJ6O7A3QiRFi1YXJOgUb-9v9v0-kIPjAR44d5XSt4nKwVOsMj6FbMMzo3uXulQG9eN-sMU5SFguVUub1iTlqnnpe1xgdE_2zA6nvpvZSMfIw',
  },
  {
    id: 'active-2',
    name: 'Rural Village Screening — Haryana',
    type: 'Community Outreach',
    date: 'Sat, 2 Aug 2026',
    time: '7:00 AM – 3:00 PM',
    location: 'Govt. Primary School, Rewari, Haryana',
    organizer: 'Amit Kumar',
    organizerPhone: '+91 98765 12345',
    attendanceStatus: 'Pending',
    targetDate: '2026-08-02T07:00:00+05:30',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGIjteBD0CWXW7KgteodS7d-DgD-XuVwGItAT-l6I7lGspLnQe-OTq-H8TXiUcjOWdbptTp4-nZIN7FAu9-zdREXhoNTAzOkPjMHZ8RnnYKIM7kYGlLYiE5KpSV4BkFXynSzHEJjwp7VVvMNDw1bDqE-ScPuLJY5TvnYNhOVGZI2eb7vDckiItLiy5vlfchPcRQaoc5WkD9Com-SwmLGUqW1QCP0PViJLWaPZEVivtluQAiRrMYOvypg',
  },
  {
    id: 'active-3',
    name: 'Cancer Survivor Support Circle',
    type: 'Workshop',
    date: 'Sun, 3 Aug 2026',
    time: '11:00 AM – 1:00 PM',
    location: 'CareWell Cancer Hospital, Mumbai',
    organizer: 'Rajeshwar Sen',
    organizerPhone: '+91 98765 67890',
    attendanceStatus: 'Confirmed',
    targetDate: '2026-08-03T11:00:00+05:30',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiimMIp06okX9NfuejkTXPJloibs626thfTEGbFezWCp9zlLJ-iarNGyegNfBDcii0YegTaf1NZWfFREz3CITpIuLKSe1XAVAGfxHWVf7QuU7aKp9ZmXBXJe-eN6u61iC5aHkE_mfxbjOpOyQpcw7ibDvsLC0qOuFGoO7zyEaH5YaFscbc4b4N2NcVrSeUO64u07Da-Tm4Ln1BWrxmJsVwep4IOn64G6DWOGU_djXvc2IlKXz4KRp-1Q',
  },
];

// ---- Today's Schedule ----
export const TODAYS_SCHEDULE: ScheduleItem[] = [
  { id: 'sch-1', time: '8:00 AM', title: 'Morning Briefing — Screening Camp Prep', location: 'Lions Club Grounds', status: 'completed', type: 'meeting' },
  { id: 'sch-2', time: '9:00 AM', title: 'Patient Registration & Documentation', location: 'Registration Desk', status: 'completed', type: 'campaign' },
  { id: 'sch-3', time: '11:00 AM', title: 'Crowd Management & Queue Flow', location: 'Main Screening Area', status: 'current', type: 'campaign' },
  { id: 'sch-4', time: '1:00 PM', title: 'Lunch & Hydration Break', location: 'Volunteer Lounge', status: 'upcoming', type: 'break' },
  { id: 'sch-5', time: '2:00 PM', title: 'Data Entry & Follow-up Calls', location: 'Operations Room', status: 'upcoming', type: 'campaign' },
];

// ---- Training Resources ----
export const TRAINING_RESOURCES: TrainingResource[] = [
  { id: 'res-1', title: 'Volunteer Orientation Handbook', description: 'Complete guide to volunteer protocols, ethics, and safety procedures.', type: 'PDF Guide', category: 'Volunteer Guide', duration: '45 min read', progress: 100, link: '#' },
  { id: 'res-2', title: 'First Aid Basics for Camp Volunteers', description: 'Essential first aid skills including CPR, wound care, and emergency response.', type: 'Video', category: 'First Aid', duration: '30 min video', progress: 75, link: '#' },
  { id: 'res-3', title: 'Cancer Warning Signs — Complete Guide', description: 'Visual guide to recognizing early warning signs of oral, breast, and cervical cancers.', type: 'PDF Guide', category: 'Cancer Awareness', duration: '20 min read', progress: 100, link: '#' },
  { id: 'res-4', title: 'Effective Patient Communication', description: 'How to communicate with empathy, handle emotional situations, and provide comfort.', type: 'Video', category: 'Communication', duration: '25 min video', progress: 30, link: '#' },
  { id: 'res-5', title: 'Volunteer Safety & Emergency Protocol', description: 'Safety procedures, emergency contacts, and incident reporting guidelines.', type: 'Handbook', category: 'Volunteer Guide', duration: '15 min read', progress: 50, link: '#' },
  { id: 'res-6', title: 'Cancer Awareness Quiz', description: 'Test your knowledge on cancer prevention, screening, and early detection.', type: 'Quiz', category: 'Cancer Awareness', duration: '10 min quiz', progress: 0, link: '#' },
];
