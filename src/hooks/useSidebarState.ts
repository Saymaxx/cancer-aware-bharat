import { useState } from 'react';

// The collapsed/mobile-open state pair and the toggle handler that picks
// between them by viewport width were declared identically in all four
// dashboards (AdminDashboard, SuperAdminDashboard, HospitalDashboard,
// VolunteerDashboard).
export function useSidebarState() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen((open) => !open);
    } else {
      setSidebarCollapsed((collapsed) => !collapsed);
    }
  };

  return { sidebarCollapsed, mobileSidebarOpen, setMobileSidebarOpen, toggleSidebar };
}
