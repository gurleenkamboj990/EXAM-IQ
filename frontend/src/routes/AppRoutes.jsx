import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES } from '../utils/constants';

import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Public Pages
const Landing = lazy(() => import('../pages/public/Landing'));
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword'));
const NotFound = lazy(() => import('../pages/public/NotFound'));
const VerifyCertificate = lazy(() => import('../pages/public/VerifyCertificate'));

// Layouts
const AdminLayout = lazy(() => import('../components/layout/AdminLayout'));
const TeacherLayout = lazy(() => import('../components/layout/TeacherLayout'));
const StudentLayout = lazy(() => import('../components/layout/StudentLayout'));

// Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const AllExams = lazy(() => import('../pages/admin/AllExams'));

// Teacher Pages
const TeacherDashboard = lazy(() => import('../pages/teacher/TeacherDashboard'));
const QuestionBank = lazy(() => import('../pages/teacher/QuestionBank'));
const ExamList = lazy(() => import('../pages/teacher/ExamList'));
const ExamWizard = lazy(() => import('../pages/teacher/ExamWizard'));
const AiQuestionGenerator = lazy(() => import('../pages/teacher/AiQuestionGenerator'));
const LiveMonitor = lazy(() => import('../pages/teacher/LiveMonitor'));
const ExamAnalytics = lazy(() => import('../pages/teacher/ExamAnalytics'));
const SubjectiveReview = lazy(() => import('../pages/teacher/SubjectiveReview'));

// Student Pages
const StudentDashboard = lazy(() => import('../pages/student/StudentDashboard'));
const AvailableExams = lazy(() => import('../pages/student/AvailableExams'));
const ExamAttempt = lazy(() => import('../pages/student/ExamAttempt'));
const MyResults = lazy(() => import('../pages/student/MyResults'));
const ExamResult = lazy(() => import('../pages/student/ExamResult'));
const Leaderboard = lazy(() => import('../pages/student/Leaderboard'));
const MyCertificates = lazy(() => import('../pages/student/MyCertificates'));

// Loading Fallback Component
export const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
    <div className="relative flex items-center justify-center">
      <div className="w-14 h-14 rounded-2xl border-4 border-brand-200 dark:border-brand-900 border-t-brand-600 dark:border-t-brand-400 animate-spin" />
      <div className="absolute font-bold text-xs text-brand-600 dark:text-brand-400">IQ</div>
    </div>
    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 animate-pulse">
      Loading Workspace...
    </p>
  </div>
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public Certificate Verification – no auth required */}
        <Route path="/verify" element={<VerifyCertificate />} />
        <Route path="/verify/:certificateId" element={<VerifyCertificate />} />

        {/* Administrator Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="exams" element={<AllExams />} />
        </Route>

        {/* Teacher Routes */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.TEACHER]}>
                <TeacherLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/teacher/dashboard" replace />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="questions" element={<QuestionBank />} />
          <Route path="exams" element={<ExamList />} />
          <Route path="exams/new" element={<ExamWizard />} />
          <Route path="exams/:id/edit" element={<ExamWizard />} />
          <Route path="ai-generator" element={<AiQuestionGenerator />} />
          <Route path="monitor" element={<LiveMonitor />} />
          <Route path="monitor/:examId" element={<LiveMonitor />} />
          <Route path="exams/:id/analytics" element={<ExamAnalytics />} />
          <Route path="exams/:id/review" element={<SubjectiveReview />} />
          <Route path="review" element={<SubjectiveReview />} />
        </Route>

        {/* Distraction-Free Exam Attempt (No Sidebar Layout) */}
        <Route
          path="/student/exams/:id/attempt"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <ExamAttempt />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Student Shell Routes (With Sidebar & Mobile Bottom Nav) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.STUDENT]}>
                <StudentLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="exams" element={<AvailableExams />} />
          <Route path="results" element={<MyResults />} />
          <Route path="results/:attemptId" element={<ExamResult />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="certificates" element={<MyCertificates />} />
        </Route>

        {/* Fallback & 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
