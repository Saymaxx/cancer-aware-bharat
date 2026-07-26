import { useCallback, useEffect, useState } from 'react';
import { listEnquiries, listHospitals, listNotifications } from './client';
import { mapApiEnquiry, mapApiHospital, mapApiNotification } from './mappers';
import { AppNotification, Hospital, PatientEnquiry } from '../types';

const POLL_INTERVAL_MS = 20000;

/** Enquiries visible to the logged-in staff member. Refetches on an interval
 * and exposes `refetch` so action handlers can force an immediate refresh
 * right after a mutation (approve/reject/assign) succeeds. */
export function useApiEnquiries(token: string | null) {
  const [enquiries, setEnquiries] = useState<PatientEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listEnquiries(token);
      setEnquiries(data.map(mapApiEnquiry));
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load enquiries');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  return { enquiries, loading, error, refetch };
}

export function useApiNotifications(token: string | null) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const refetch = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listNotifications(token);
      setNotifications(data.map(mapApiNotification));
    } catch {
      // Notifications are non-critical; fail silently rather than blocking the dashboard.
    }
  }, [token]);

  useEffect(() => {
    refetch();
    const interval = setInterval(refetch, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refetch]);

  return { notifications, refetch };
}

/** Public hospital directory -- used by the patient enquiry form and the
 * Super Admin hospital-assignment picker. */
export function useApiHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listHospitals()
      .then(data => { if (!cancelled) setHospitals(data.map(mapApiHospital)); })
      .catch(() => { /* leave hospitals empty on failure */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { hospitals, loading };
}
