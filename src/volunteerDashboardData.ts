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

// ---- Upcoming Campaigns ----
export const UPCOMING_CAMPAIGNS: DashboardCampaign[] = [
  {
    id: 'camp-1',
    name: 'Free Oral Cancer Screening Drive',
    type: 'Screening Camp',
    date: 'Sat, 26 Jul 2026',
    time: '8:00 AM – 2:00 PM',
    location: 'Lions Club Grounds, Dwarka, New Delhi',
    volunteersRequired: 30,
    volunteersJoined: 22,
    status: 'Open',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD67aBEzQ4mH7MDO2L157RQifaSnmDCt3cgR1mBA8TH9TrWOEVtfrO-LXwPvszbWFRhSqm0iXQWTAIIR9OboD39r61QZ-YZCeSRPwF1OR5sTAR1C41FQ_vE_bR33rhXQiCFAzEIlwPlVTKJ6O7A3QiRFi1YXJOgUb-9v9v0-kIPjAR44d5XSt4nKwVOsMj6FbMMzo3uXulQG9eN-sMU5SFguVUub1iTlqnnpe1xgdE_2zA6nvpvZSMfIw',
    organizer: 'Dr. Ramesh Sharma',
    description: 'Free oral cavity screening for tobacco/betel nut users. Dental specialists and oncologists will be present for immediate consultations.',
  },
  {
    id: 'camp-2',
    name: 'Community Blood Donation Camp',
    type: 'Blood Donation',
    date: 'Sun, 27 Jul 2026',
    time: '9:00 AM – 4:00 PM',
    location: 'City Hospital Community Hall, Mumbai',
    volunteersRequired: 20,
    volunteersJoined: 18,
    status: 'Filling Fast',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1880QY6OfofO_mmX-rcXHaAug2vtajUZh8wdyvyqOs-NaTEQrISBKKhz9xeQgcTlC5jGjaEbX6dXF-hpCOnnp3qkIBX9FtSLLJSYipUBmqlfLRKOe1YyNGL9eU7xm3UJGGfwfa0hzgZtRm0RApDf0USsey-4LTvHj50vopmZyMZ9I2a3YBFRnEtIlpunCn73x9iJUPbEU_ZqtR-eWf4p9Huxa_-3qA6JOYgrtyM5h8eOk8CROTwZOjg',
    organizer: 'CareWell Cancer Hospital',
    description: 'Quarterly blood and platelet donation drive supporting chemotherapy patients across western India.',
  },
  {
    id: 'camp-3',
    name: 'Women\'s Breast Health Awareness',
    type: 'Awareness Drive',
    date: 'Wed, 30 Jul 2026',
    time: '10:00 AM – 1:00 PM',
    location: 'Sector 12 Community Centre, Noida',
    volunteersRequired: 15,
    volunteersJoined: 7,
    status: 'Open',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4FXV2Dd6jmMTFi2iPnEYwnPBnlna3noopCsiVkX8csJqIRzvs_8sM9KXJFNvLLTFXIupQaBHhKKejejKGV3TdbCbIdGl2qvvFBX7JBhylg5jOL_48iNOY691vu4z79TCldatGuGOO22TJEWAMmwMSbdf2XBARbtJ-nW1ValYq3fbh1tYvwsyrZdSJCcL5V36MLpED3n83SZK-pvi-1bMJ65sV8d9s5Ln1DMJ6SyGFjzfh3-ZktqCxYw',
    organizer: 'Dr. Anjali Deshmukh',
    description: 'Educating women on breast self-examination, mammography guidelines, and early warning signs.',
  },
  {
    id: 'camp-4',
    name: 'Nutrition & Recovery Workshop',
    type: 'Workshop',
    date: 'Fri, 1 Aug 2026',
    time: '4:00 PM – 6:00 PM',
    location: 'Online (Zoom)',
    volunteersRequired: 10,
    volunteersJoined: 10,
    status: 'Full',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFFddb5pzA21ANryP1YyFAiRmDv3cYKLcxSom4PCWLLeWaQ8A9CbdNUwr3WkjBBYOn3LnlsIkQeMOH0pdfIrZhvJPAvTw17EErc46zNEX8ktzX2GaIp4MBMvS_10RSOBY7NyFOgnXVvwb9nDgasMYo7nvtJOitIe-_wl00F8YY3Oq7ScymOSyvjIIKe7LNrvezd0HA_o2odBXvMSfPkLqst0_XXIqta3AqnH3LrGtn46PXutTIuwRPYg',
    organizer: 'Dr. Anjali Deshmukh',
    description: 'Helping caregivers design chemo-friendly meals and manage treatment side effects through targeted nutrition.',
  },
  {
    id: 'camp-5',
    name: 'Rural Village Screening — Haryana',
    type: 'Community Outreach',
    date: 'Sat, 2 Aug 2026',
    time: '7:00 AM – 3:00 PM',
    location: 'Govt. Primary School, Rewari, Haryana',
    volunteersRequired: 25,
    volunteersJoined: 12,
    status: 'Open',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGIjteBD0CWXW7KgteodS7d-DgD-XuVwGItAT-l6I7lGspLnQe-OTq-H8TXiUcjOWdbptTp4-nZIN7FAu9-zdREXhoNTAzOkPjMHZ8RnnYKIM7kYGlLYiE5KpSV4BkFXynSzHEJjwp7VVvMNDw1bDqE-ScPuLJY5TvnYNhOVGZI2eb7vDckiItLiy5vlfchPcRQaoc5WkD9Com-SwmLGUqW1QCP0PViJLWaPZEVivtluQAiRrMYOvypg',
    organizer: 'Amit Kumar',
    description: 'Taking mobile screening units to remote villages. Volunteers assist with registration, crowd management, and patient navigation.',
  },
  {
    id: 'camp-6',
    name: 'Cancer Survivor Support Circle',
    type: 'Workshop',
    date: 'Sun, 3 Aug 2026',
    time: '11:00 AM – 1:00 PM',
    location: 'CareWell Cancer Hospital, Mumbai',
    volunteersRequired: 8,
    volunteersJoined: 5,
    status: 'Open',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiimMIp06okX9NfuejkTXPJloibs626thfTEGbFezWCp9zlLJ-iarNGyegNfBDcii0YegTaf1NZWfFREz3CITpIuLKSe1XAVAGfxHWVf7QuU7aKp9ZmXBXJe-eN6u61iC5aHkE_mfxbjOpOyQpcw7ibDvsLC0qOuFGoO7zyEaH5YaFscbc4b4N2NcVrSeUO64u07Da-Tm4Ln1BWrxmJsVwep4IOn64G6DWOGU_djXvc2IlKXz4KRp-1Q',
    organizer: 'Rajeshwar Sen',
    description: 'A safe, empathetic space for cancer survivors and their families to share experiences and find strength together.',
  },
];

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

// ---- Achievements / Badges ----
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'ach-1', name: 'First Steps', description: 'Complete your first campaign', icon: '🌱', unlocked: true, unlockedDate: 'Mar 2026', progress: 100, requirement: '1 campaign', category: 'milestone' },
  { id: 'ach-2', name: 'Helping Hands', description: 'Complete 5 campaigns', icon: '🤝', unlocked: true, unlockedDate: 'May 2026', progress: 100, requirement: '5 campaigns', category: 'milestone' },
  { id: 'ach-3', name: 'Community Champion', description: 'Complete 10 campaigns', icon: '🏆', unlocked: false, progress: 80, requirement: '10 campaigns (8/10)', category: 'milestone' },
  { id: 'ach-4', name: 'Century Club', description: 'Log 100 volunteer hours', icon: '⏱️', unlocked: false, progress: 96, requirement: '100 hours (96/100)', category: 'milestone' },
  { id: 'ach-5', name: 'Streak Master', description: 'Volunteer 4 weekends in a row', icon: '🔥', unlocked: true, unlockedDate: 'Jun 2026', progress: 100, requirement: '4 consecutive weekends', category: 'streak' },
  { id: 'ach-6', name: 'Educator', description: 'Lead an awareness session', icon: '📚', unlocked: true, unlockedDate: 'Apr 2026', progress: 100, requirement: 'Lead 1 session', category: 'special' },
  { id: 'ach-7', name: 'Lifesaver', description: 'Help 1,000 people get screened', icon: '💗', unlocked: true, unlockedDate: 'Jun 2026', progress: 100, requirement: '1,000 people', category: 'special' },
  { id: 'ach-8', name: 'Iron Will', description: 'Complete a rural outreach campaign', icon: '🏅', unlocked: false, progress: 0, requirement: '1 rural campaign', category: 'special' },
];

// ---- Notifications ----
export const NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', title: 'New Campaign Available', message: 'Free Oral Cancer Screening Drive in Dwarka is now open for enrollment.', time: '2 hours ago', type: 'campaign', read: false },
  { id: 'notif-2', title: 'Training Reminder', message: 'Complete "First Aid Basics" module before this Saturday\'s camp.', time: '5 hours ago', type: 'reminder', read: false },
  { id: 'notif-3', title: 'Certificate Issued', message: 'Your certificate for "Blood Donation Drive — June 2026" is ready for download.', time: '1 day ago', type: 'achievement', read: false },
  { id: 'notif-4', title: 'Campaign Update', message: 'Women\'s Breast Health Awareness campaign location has been updated to Sector 12 Community Centre.', time: '1 day ago', type: 'campaign', read: true },
  { id: 'notif-5', title: 'Announcement', message: 'Cancer Aware Bharat Annual Volunteer Meet 2026 registrations are now open! Mark your calendar for 15th September.', time: '2 days ago', type: 'announcement', read: true },
  { id: 'notif-6', title: 'Achievement Unlocked!', message: 'Congratulations! You earned the "Lifesaver" badge for helping 1,000 people get screened.', time: '3 days ago', type: 'achievement', read: true },
  { id: 'notif-7', title: 'Schedule Change', message: 'Rural Village Screening — Haryana has been moved from 7:00 AM to 7:30 AM.', time: '4 days ago', type: 'campaign', read: true },
  { id: 'notif-8', title: 'New Resource', message: 'A new training video "Effective Patient Communication" has been added to your resources.', time: '5 days ago', type: 'reminder', read: true },
  { id: 'notif-9', title: 'Feedback Request', message: 'Please share your feedback for "Community Screening Camp — Pune" campaign.', time: '1 week ago', type: 'reminder', read: true },
  { id: 'notif-10', title: 'Welcome!', message: 'Welcome to Cancer Aware Bharat volunteer family! Start by exploring upcoming campaigns.', time: '2 weeks ago', type: 'announcement', read: true },
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

// ---- Certificates ----
export const CERTIFICATES: Certificate[] = [
  { id: 'cert-1', title: 'Campaign Volunteer Certificate', issuedDate: 'June 15, 2026', campaignName: 'Blood Donation Drive — June 2026', hours: 8, certificateId: 'CAB-CERT-2026-0891', status: 'Earned' },
  { id: 'cert-2', title: 'Community Outreach Certificate', issuedDate: 'May 22, 2026', campaignName: 'Rural Screening Camp — Rewari', hours: 12, certificateId: 'CAB-CERT-2026-0743', status: 'Earned' },
  { id: 'cert-3', title: 'Training Completion Certificate', issuedDate: 'April 10, 2026', campaignName: 'Volunteer Orientation Program', hours: 6, certificateId: 'CAB-CERT-2026-0512', status: 'Earned' },
];

// ---- Gallery Photos ----
export const GALLERY_PHOTOS: GalleryPhoto[] = [
  { id: 'gal-1', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD67aBEzQ4mH7MDO2L157RQifaSnmDCt3cgR1mBA8TH9TrWOEVtfrO-LXwPvszbWFRhSqm0iXQWTAIIR9OboD39r61QZ-YZCeSRPwF1OR5sTAR1C41FQ_vE_bR33rhXQiCFAzEIlwPlVTKJ6O7A3QiRFi1YXJOgUb-9v9v0-kIPjAR44d5XSt4nKwVOsMj6FbMMzo3uXulQG9eN-sMU5SFguVUub1iTlqnnpe1xgdE_2zA6nvpvZSMfIw', caption: 'Free Screening Camp in action', campaign: 'Oral Cancer Screening Drive', date: 'Jul 2026' },
  { id: 'gal-2', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1880QY6OfofO_mmX-rcXHaAug2vtajUZh8wdyvyqOs-NaTEQrISBKKhz9xeQgcTlC5jGjaEbX6dXF-hpCOnnp3qkIBX9FtSLLJSYipUBmqlfLRKOe1YyNGL9eU7xm3UJGGfwfa0hzgZtRm0RApDf0USsey-4LTvHj50vopmZyMZ9I2a3YBFRnEtIlpunCn73x9iJUPbEU_ZqtR-eWf4p9Huxa_-3qA6JOYgrtyM5h8eOk8CROTwZOjg', caption: 'Blood donation saving lives', campaign: 'Mega Blood Donation Drive', date: 'Jun 2026' },
  { id: 'gal-3', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDFFddb5pzA21ANryP1YyFAiRmDv3cYKLcxSom4PCWLLeWaQ8A9CbdNUwr3WkjBBYOn3LnlsIkQeMOH0pdfIrZhvJPAvTw17EErc46zNEX8ktzX2GaIp4MBMvS_10RSOBY7NyFOgnXVvwb9nDgasMYo7nvtJOitIe-_wl00F8YY3Oq7ScymOSyvjIIKe7LNrvezd0HA_o2odBXvMSfPkLqst0_XXIqta3AqnH3LrGtn46PXutTIuwRPYg', caption: 'Nutrition recovery workshop', campaign: 'Nutrition Post-Treatment', date: 'May 2026' },
  { id: 'gal-4', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4FXV2Dd6jmMTFi2iPnEYwnPBnlna3noopCsiVkX8csJqIRzvs_8sM9KXJFNvLLTFXIupQaBHhKKejejKGV3TdbCbIdGl2qvvFBX7JBhylg5jOL_48iNOY691vu4z79TCldatGuGOO22TJEWAMmwMSbdf2XBARbtJ-nW1ValYq3fbh1tYvwsyrZdSJCcL5V36MLpED3n83SZK-pvi-1bMJ65sV8d9s5Ln1DMJ6SyGFjzfh3-ZktqCxYw', caption: 'Awareness seminar materials', campaign: 'Cancer Awareness Seminars', date: 'Apr 2026' },
  { id: 'gal-5', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAGIjteBD0CWXW7KgteodS7d-DgD-XuVwGItAT-l6I7lGspLnQe-OTq-H8TXiUcjOWdbptTp4-nZIN7FAu9-zdREXhoNTAzOkPjMHZ8RnnYKIM7kYGlLYiE5KpSV4BkFXynSzHEJjwp7VVvMNDw1bDqE-ScPuLJY5TvnYNhOVGZI2eb7vDckiItLiy5vlfchPcRQaoc5WkD9Com-SwmLGUqW1QCP0PViJLWaPZEVivtluQAiRrMYOvypg', caption: 'Survivor story sharing session', campaign: 'Survivor Support Circle', date: 'Mar 2026' },
  { id: 'gal-6', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfAmubkh_DDHQqTm_TOQvS-OuyqwJVwXEzaIxqITTSlmKD1ugZbmSNyRW7z68T7KjhocaKflJtP_YSYj6AXWOnuIuLSIQiynQWZ_WA27x3tUS5Rp5_VUmrBIYgcGhza5pr2uqqkP3SsRcJwE02N0AGuwrRu9-SoWLx0cpTHxZ88nwxsepXOrX9OVmd6f4Q5SHzgzuT4LGyNez84A1p2PuRNTHnkUOiQPFaFoiOrBFfpFvbAvsj6Abq9A', caption: 'Hospital partner coordination', campaign: 'Apex Oncology Screening', date: 'Feb 2026' },
  { id: 'gal-7', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiimMIp06okX9NfuejkTXPJloibs626thfTEGbFezWCp9zlLJ-iarNGyegNfBDcii0YegTaf1NZWfFREz3CITpIuLKSe1XAVAGfxHWVf7QuU7aKp9ZmXBXJe-eN6u61iC5aHkE_mfxbjOpOyQpcw7ibDvsLC0qOuFGoO7zyEaH5YaFscbc4b4N2NcVrSeUO64u07Da-Tm4Ln1BWrxmJsVwep4IOn64G6DWOGU_djXvc2IlKXz4KRp-1Q', caption: 'CareWell team in action', campaign: 'CareWell Community Outreach', date: 'Jan 2026' },
  { id: 'gal-8', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1880QY6OfofO_mmX-rcXHaAug2vtajUZh8wdyvyqOs-NaTEQrISBKKhz9xeQgcTlC5jGjaEbX6dXF-hpCOnnp3qkIBX9FtSLLJSYipUBmqlfLRKOe1YyNGL9eU7xm3UJGGfwfa0hzgZtRm0RApDf0USsey-4LTvHj50vopmZyMZ9I2a3YBFRnEtIlpunCn73x9iJUPbEU_ZqtR-eWf4p9Huxa_-3qA6JOYgrtyM5h8eOk8CROTwZOjg', caption: 'Volunteer appreciation day', campaign: 'Annual Volunteer Meet', date: 'Dec 2025' },
];

// ---- Monthly Impact Data (for charts) ----
export const MONTHLY_IMPACT = [
  { month: 'Jan', hours: 8, campaigns: 1, people: 120 },
  { month: 'Feb', hours: 12, campaigns: 1, people: 180 },
  { month: 'Mar', hours: 10, campaigns: 1, people: 150 },
  { month: 'Apr', hours: 16, campaigns: 2, people: 210 },
  { month: 'May', hours: 14, campaigns: 1, people: 190 },
  { month: 'Jun', hours: 20, campaigns: 2, people: 240 },
  { month: 'Jul', hours: 16, campaigns: 1, people: 150 },
];
