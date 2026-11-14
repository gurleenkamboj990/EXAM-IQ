import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_sys_1',
    type: 'EXAM_PUBLISHED',
    title: 'New Exam Scheduled',
    message: 'Advanced Java Programming exam is now scheduled for Friday 10:00 UTC.',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    targetRole: 'STUDENT',
  },
  {
    id: 'notif_sys_2',
    type: 'RESULT_AVAILABLE',
    title: 'Result Published',
    message: 'Your Physics exam result is now available. Check your score!',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    targetRole: 'STUDENT',
  },
  {
    id: 'notif_sys_3',
    type: 'CERTIFICATE_ISSUED',
    title: 'Certificate Issued',
    message: 'Your certificate for "Database Management Systems" has been issued.',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    targetRole: 'STUDENT',
  },
  {
    id: 'notif_sys_4',
    type: 'HIGH_RISK_ALERT',
    title: 'High-Risk Alert',
    message: 'Rahul Sharma flagged with HIGH cheating risk during CS301 exam.',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    targetRole: 'TEACHER',
  },
  {
    id: 'notif_sys_5',
    type: 'EXAM_PUBLISHED',
    title: 'Exam Live Now',
    message: 'CS301 Advanced Data Structures exam is currently live with 12 candidates.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    targetRole: 'TEACHER',
  },
  {
    id: 'notif_sys_6',
    type: 'SYSTEM',
    title: 'Platform Audit Clean',
    message: 'Zero security anomalies detected in the last 24-hour monitoring cycle.',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    targetRole: 'ADMIN',
  },
];

const timeAgo = (iso) => {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

export const useNotificationStore = create(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,

      get unreadCount() {
        return get().notifications.filter((n) => !n.isRead).length;
      },

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      clearAll: () => set({ notifications: [] }),

      addNotification: (notif) =>
        set((state) => ({
          notifications: [
            {
              id: `notif_${Date.now()}`,
              isRead: false,
              createdAt: new Date().toISOString(),
              ...notif,
            },
            ...state.notifications,
          ].slice(0, 50), // cap at 50
        })),

      getTimeAgo: (iso) => timeAgo(iso),
    }),
    {
      name: 'examiq_notifications',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);

export default useNotificationStore;

