import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

// Layouts
import { SuperAdminLayout } from '../components/layout/SuperAdminLayout';
import { SchoolAdminLayout } from '../layouts/SchoolAdminLayout';
import { HeadMasterLayout } from '../layouts/HeadMasterLayout';
import { OfficeAdminLayout } from '../layouts/OfficeAdminLayout';
import { TeacherLayout } from '../layouts/TeacherLayout';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage';

// 1. Super Admin Platform Pages
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { SchoolsListPage } from '../pages/schools/SchoolsListPage';
import { SubscriptionsListPage } from '../pages/subscriptions/SubscriptionsListPage';
import { PlansPage } from '../pages/plans/PlansPage';
import { PaymentsPage } from '../pages/payments/PaymentsPage';
import { PlatformUsersPage } from '../pages/users/PlatformUsersPage';
import { FeaturesPage } from '../pages/modules/FeaturesPage';
import { NotificationsPage } from '../pages/notifications/NotificationsPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { SupportPage } from '../pages/support/SupportPage';
import { AuditLogsPage } from '../pages/audit/AuditLogsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { OrganizationTreePage } from '../pages/hierarchy/OrganizationTreePage';

// 2. School Admin Pages
import { SchoolAdminDashboardPage } from '../pages/school-admin/SchoolAdminDashboardPage';
import { SchoolStudentsPage } from '../pages/school-admin/SchoolStudentsPage';
import { SchoolStaffPage } from '../pages/school-admin/SchoolStaffPage';
import { SchoolClassesPage } from '../pages/school-admin/SchoolClassesPage';
import { SchoolFeesOverviewPage } from '../pages/school-admin/SchoolFeesOverviewPage';
import { SchoolAttendanceOverviewPage } from '../pages/school-admin/SchoolAttendanceOverviewPage';
import { SchoolProfilePage } from '../pages/school-admin/SchoolProfilePage';

// 3. Head Master Pages
import { HeadMasterDashboardPage } from '../pages/head-master/HeadMasterDashboardPage';
import { TeacherLeavesPage as HeadMasterLeavesPage } from '../pages/head-master/TeacherLeavesPage';
import { HeadMasterClassesPage } from '../pages/head-master/HeadMasterClassesPage';
import { TeacherAllocationsPage } from '../pages/head-master/TeacherAllocationsPage';
import { TimetableManagementPage } from '../pages/head-master/TimetableManagementPage';
import { AttendanceSupervisionPage } from '../pages/head-master/AttendanceSupervisionPage';
import { MarksModerationPage } from '../pages/head-master/MarksModerationPage';

// 4. Office Admin Pages
import { OfficeDashboardPage } from '../pages/office-admin/OfficeDashboardPage';
import { AdmissionsWorkflowPage } from '../pages/office-admin/AdmissionsWorkflowPage';
import { FeeCollectionPage } from '../pages/office-admin/FeeCollectionPage';
import { FeeStructuresPage } from '../pages/office-admin/FeeStructuresPage';
import { DocumentsRepositoryPage } from '../pages/office-admin/DocumentsRepositoryPage';
import { CertificatesPage } from '../pages/office-admin/CertificatesPage';

// 5. Teacher Portal Pages
import { TeacherDashboardPage } from '../pages/teacher/TeacherDashboardPage';
import { TakeAttendancePage } from '../pages/teacher/TakeAttendancePage';
import { InternalMarksEntryPage } from '../pages/teacher/InternalMarksEntryPage';
import { TeacherTimetablePage } from '../pages/teacher/TeacherTimetablePage';
import { TeacherHomeworkPage } from '../pages/teacher/TeacherHomeworkPage';
import { TeacherLeavesPage } from '../pages/teacher/TeacherLeavesPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactElement; requiredUserType?: string; requiredRole?: string }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const AppRoutes: React.FC = () => {
  const { user } = useAuthStore();

  const getDefaultRedirect = () => {
    if (!user) return '/login';
    if (user.userType === 'PLATFORM') return '/dashboard';
    if (user.role === 'SCHOOL_ADMIN') return '/school-admin/dashboard';
    if (user.role === 'HEAD_MASTER') return '/head-master/dashboard';
    if (user.role === 'OFFICE_ADMIN') return '/office-admin/dashboard';
    if (user.role === 'TEACHER') return '/teacher/dashboard';
    return '/login';
  };

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* 1. Super Admin Platform Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <SuperAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="schools" element={<SchoolsListPage />} />
        <Route path="tree" element={<OrganizationTreePage />} />
        <Route path="subscriptions" element={<SubscriptionsListPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="users" element={<PlatformUsersPage />} />
        <Route path="modules" element={<FeaturesPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="support" element={<SupportPage />} />
        <Route path="audit-logs" element={<AuditLogsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* 2. School Admin Portal Routes */}
      <Route
        path="/school-admin"
        element={
          <ProtectedRoute>
            <SchoolAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/school-admin/dashboard" replace />} />
        <Route path="dashboard" element={<SchoolAdminDashboardPage />} />
        <Route path="tree" element={<OrganizationTreePage />} />
        <Route path="students" element={<SchoolStudentsPage />} />
        <Route path="staff" element={<SchoolStaffPage />} />
        <Route path="classes" element={<HeadMasterClassesPage />} />
        <Route path="allocations" element={<TeacherAllocationsPage />} />
        <Route path="fees" element={<SchoolFeesOverviewPage />} />
        <Route path="attendance" element={<SchoolAttendanceOverviewPage />} />
        <Route path="profile" element={<SchoolProfilePage />} />
      </Route>

      {/* 3. Head Master Portal Routes */}
      <Route
        path="/head-master"
        element={
          <ProtectedRoute>
            <HeadMasterLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/head-master/dashboard" replace />} />
        <Route path="dashboard" element={<HeadMasterDashboardPage />} />
        <Route path="tree" element={<OrganizationTreePage />} />
        <Route path="leaves" element={<HeadMasterLeavesPage />} />
        <Route path="classes" element={<HeadMasterClassesPage />} />
        <Route path="allocations" element={<TeacherAllocationsPage />} />
        <Route path="timetable" element={<TimetableManagementPage />} />
        <Route path="attendance" element={<AttendanceSupervisionPage />} />
        <Route path="marks-review" element={<MarksModerationPage />} />
      </Route>

      {/* 4. Office Admin Portal Routes */}
      <Route
        path="/office-admin"
        element={
          <ProtectedRoute>
            <OfficeAdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/office-admin/dashboard" replace />} />
        <Route path="dashboard" element={<OfficeDashboardPage />} />
        <Route path="tree" element={<OrganizationTreePage />} />
        <Route path="admissions" element={<AdmissionsWorkflowPage />} />
        <Route path="classes" element={<HeadMasterClassesPage />} />
        <Route path="allocations" element={<TeacherAllocationsPage />} />
        <Route path="fees" element={<FeeCollectionPage />} />
        <Route path="fee-structures" element={<FeeStructuresPage />} />
        <Route path="documents" element={<DocumentsRepositoryPage />} />
        <Route path="certificates" element={<CertificatesPage />} />
      </Route>

      {/* 5. Teacher Portal Routes */}
      <Route
        path="/teacher"
        element={
          <ProtectedRoute>
            <TeacherLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/teacher/dashboard" replace />} />
        <Route path="dashboard" element={<TeacherDashboardPage />} />
        <Route path="tree" element={<OrganizationTreePage />} />
        <Route path="attendance" element={<TakeAttendancePage />} />
        <Route path="marks" element={<InternalMarksEntryPage />} />
        <Route path="timetable" element={<TeacherTimetablePage />} />
        <Route path="homework" element={<TeacherHomeworkPage />} />
        <Route path="leaves" element={<TeacherLeavesPage />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
    </Routes>
  );
};
