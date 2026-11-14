export const ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STUDENT: 'STUDENT',
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.TEACHER]: 'Teacher / Educator',
  [ROLES.STUDENT]: 'Student',
};

export const ROLE_DASHBOARDS = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.TEACHER]: '/teacher/dashboard',
  [ROLES.STUDENT]: '/student/dashboard',
};

export const API_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
};

export const APP_CONFIG = {
  NAME: 'ExamIQ',
  TAGLINE: 'Intelligent Online Examination Platform',
  DESCRIPTION: 'Empowering institutions, educators, and learners with modern, secure, and insightful assessment tools.',
  DEMO_PASSWORD: 'Demo@123',
};

export const DEMO_CREDENTIALS = [
  {
    role: ROLES.ADMIN,
    label: 'Admin',
    email: 'admin@examiq.com',
    password: APP_CONFIG.DEMO_PASSWORD,
    badgeColor: 'primary',
  },
  {
    role: ROLES.TEACHER,
    label: 'Teacher',
    email: 'teacher@examiq.com',
    password: APP_CONFIG.DEMO_PASSWORD,
    badgeColor: 'emerald',
  },
  {
    role: ROLES.STUDENT,
    label: 'Student',
    email: 'student@examiq.com',
    password: APP_CONFIG.DEMO_PASSWORD,
    badgeColor: 'brand',
  },
];

