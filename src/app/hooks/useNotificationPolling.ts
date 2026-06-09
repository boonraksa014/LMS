import { useEffect, useRef } from 'react';
import { AppNotification } from '../data/types';
import { apiClient, IS_MOCK } from '../services/apiClient';
import { authService } from '../services/authService';

const POLL_INTERVAL_MS = 30_000;

interface UseNotificationPollingOptions {
  onNewNotifications: (notifs: AppNotification[]) => void;
}

export function useNotificationPolling({ onNewNotifications }: UseNotificationPollingOptions) {
  const lastFetchRef = useRef<string | null>(null);

  useEffect(() => {
    if (IS_MOCK) return;

    const session = authService.getSession();
    if (!session) return;

    const poll = async () => {
      try {
        const params = lastFetchRef.current ? `?after=${encodeURIComponent(lastFetchRef.current)}` : '';
        const data = await apiClient.get<AppNotification[]>(`/notifications/user/${session.userId}${params}`);
        if (data.length > 0) {
          lastFetchRef.current = data[0].timestamp;
          onNewNotifications(data);
        }
      } catch {
        // silently ignore polling errors
      }
    };

    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [onNewNotifications]);
}