import { useEffect } from 'react';

// Was duplicated (with the addEventListener/removeEventListener
// boilerplate copy-pasted each time) across EnquiryModal, VolunteerModal,
// AdminDashboard, SuperAdminDashboard, and VolunteerDashboard. Covers both
// shapes that existed: a single controlled modal (`enabled` = isOpen,
// `onEscape` = onClose) and a dashboard resetting several modal states at
// once (`enabled` defaults to true, `onEscape` closes all of them).
export function useEscapeKey(onEscape: () => void, enabled: boolean = true) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && enabled) {
        onEscape();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, onEscape]);
}
