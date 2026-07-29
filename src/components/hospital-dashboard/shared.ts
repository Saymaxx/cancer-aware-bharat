// ===========================
// Shared types for Hospital Dashboard tabs/modals
// ===========================

// Structural shape returned by HospitalDashboard.tsx's getInitialHospitalProfile().
// Kept here (rather than imported) so tab components can be typed without
// reaching into the controller file.
export interface HospitalProfile {
  name: string;
  shortName: string;
  licenseNo: string;
  nabhNo: string;
  accreditationStatus: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  website: string;
  bedCount: number;
  oncologyBeds: number;
  icuBeds: number;
  workingHours: string;
  departments: string[];
  facilities: string[];
}
