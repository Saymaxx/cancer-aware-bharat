import { Hospital } from './types';

export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'Apex Oncology Institute',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfAmubkh_DDHQqTm_TOQvS-OuyqwJVwXEzaIxqITTSlmKD1ugZbmSNyRW7z68T7KjhocaKflJtP_YSYj6AXWOnuIuLSIQiynQWZ_WA27x3tUS5Rp5_VUmrBIYgcGhza5pr2uqqkP3SsRcJwE02N0AGuwrRu9-SoWLx0cpTHxZ88nwxsepXOrX9OVmd6f4Q5SHzgzuT4LGyNez84A1p2PuRNTHnkUOiQPFaFoiOrBFfpFvbAvsj6Abq9A',
    type: 'Center of Excellence',
    region: 'north',
    city: 'New Delhi',
    state: 'Delhi',
    specialties: ['Radiation Therapy', 'Surgical Oncology', 'Palliative Care'],
    phone: '+91 11 4055 9200',
    email: 'contact@apexoncology.in',
    address: 'Sector 7, Dwarka, New Delhi, Delhi 110075',
    lat: 28.5921,
    lng: 77.0460,
    description: 'Apex Oncology Institute is a world-class facility dedicated to advanced cancer care. Equipped with state-of-the-art linear accelerators, a robotic surgery suite, and a dedicated team of medical oncologists, it serves as a cornerstone of our high-quality cancer screening and treatment network.'
  },
  {
    id: 'hosp-2',
    name: 'CareWell Cancer Hospital',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiimMIp06okX9NfuejkTXPJloibs626thfTEGbFezWCp9zlLJ-iarNGyegNfBDcii0YegTaf1NZWfFREz3CITpIuLKSe1XAVAGfxHWVf7QuU7aKp9ZmXBXJe-eN6u61iC5aHkE_mfxbjOpOyQpcw7ibDvsLC0qOuFGoO7zyEaH5YaFscbc4b4N2NcVrSeUO64u07Da-Tm4Ln1BWrxmJsVwep4IOn64G6DWOGU_djXvc2IlKXz4KRp-1Q',
    type: 'Community Partner',
    region: 'west',
    city: 'Mumbai',
    state: 'Maharashtra',
    specialties: ['Chemotherapy', 'Support Groups', 'Immunotherapy'],
    phone: '+91 22 2640 4500',
    email: 'care@carewellcancer.org',
    address: 'SV Road, Bandra West, Mumbai, Maharashtra 400050',
    lat: 19.0596,
    lng: 72.8295,
    description: 'CareWell Cancer Hospital specializes in patient-centric care models, bridging clinical excellence with holistic community support programs. They host weekly survivor support circles, psychological counseling sessions, and affordable chemotherapy treatments for families from all backgrounds.'
  },
  {
    id: 'hosp-3',
    name: 'Tata Cancer Care & Research Center',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfAmubkh_DDHQqTm_TOQvS-OuyqwJVwXEzaIxqITTSlmKD1ugZbmSNyRW7z68T7KjhocaKflJtP_YSYj6AXWOnuIuLSIQiynQWZ_WA27x3tUS5Rp5_VUmrBIYgcGhza5pr2uqqkP3SsRcJwE02N0AGuwrRu9-SoWLx0cpTHxZ88nwxsepXOrX9OVmd6f4Q5SHzgzuT4LGyNez84A1p2PuRNTHnkUOiQPFaFoiOrBFfpFvbAvsj6Abq9A',
    type: 'Center of Excellence',
    region: 'east',
    city: 'Kolkata',
    state: 'West Bengal',
    specialties: ['Hematology', 'Bone Marrow Transplant', 'Screening Centers'],
    phone: '+91 33 2432 8000',
    email: 'info@tatacancercare.org',
    address: 'Rajarhat, New Town, Kolkata, West Bengal 700156',
    lat: 22.5726,
    lng: 88.3639,
    description: 'Tata Cancer Care & Research Center is a pioneering institution in Eastern India. It leads groundbreaking clinical trials in pediatric and hematological malignancies, and supports mobile screening clinics operating in rural parts of Bengal and Assam.'
  },
  {
    id: 'hosp-4',
    name: 'Narayana Health City',
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiimMIp06okX9NfuejkTXPJloibs626thfTEGbFezWCp9zlLJ-iarNGyegNfBDcii0YegTaf1NZWfFREz3CITpIuLKSe1XAVAGfxHWVf7QuU7aKp9ZmXBXJe-eN6u61iC5aHkE_mfxbjOpOyQpcw7ibDvsLC0qOuFGoO7zyEaH5YaFscbc4b4N2NcVrSeUO64u07Da-Tm4Ln1BWrxmJsVwep4IOn64G6DWOGU_djXvc2IlKXz4KRp-1Q',
    type: 'Community Partner',
    region: 'south',
    city: 'Bangalore',
    state: 'Karnataka',
    specialties: ['Pediatric Oncology', 'Surgical Oncology', 'Nuclear Medicine'],
    phone: '+91 80 7122 2222',
    email: 'oncology@narayanahealth.org',
    address: 'Hosur Road, Bommasandra, Bangalore, Karnataka 560099',
    lat: 12.9716,
    lng: 77.5946,
    description: 'Narayana Health City represents one of India’s largest specialized cancer campuses. Famous for its high-volume, low-cost operational efficiency, they offer cutting-edge immunotherapy and advanced precision nuclear medicine to thousands of patients annually.'
  }
];

