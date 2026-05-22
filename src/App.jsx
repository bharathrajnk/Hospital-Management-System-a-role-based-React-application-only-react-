import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HospitalProvider, useHospital } from './context/HospitalContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import RoleBasedLayout from './components/RoleBasedLayout.jsx';
import LoadingFallback from './components/LoadingFallback.jsx';

const LoginPage = lazy(() => import('./pages/Auth/LoginPage.jsx'));
const SignupPage = lazy(() => import('./pages/Auth/SignupPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const PatientsPage = lazy(() => import('./pages/PatientsPage.jsx'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage.jsx'));
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage.jsx'));
const PharmacyPage = lazy(() => import('./pages/PharmacyPage.jsx'));
const BillingPage = lazy(() => import('./pages/BillingPage.jsx'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const NotAuthorizedPage = lazy(() => import('./pages/NotAuthorizedPage.jsx'));
import './App.css';

const HomeRedirect = () => {
  const { state } = useHospital();
  const user = state.user;
  if (!user) return <Navigate replace to="/login" />;
  if (user.role === 'Admin') return <Navigate replace to="/admin/dashboard" />;
  if (user.role === 'Doctor') return <Navigate replace to="/doctor/dashboard" />;
  if (user.role === 'Receptionist') return <Navigate replace to="/reception/dashboard" />;
  return <Navigate replace to="/patient/dashboard" />;
};

function App() {
  return (
    <HospitalProvider>
      <ToastContainer />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/not-authorized" element={<NotAuthorizedPage />} />
            
            {/* Main Redirector */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/dashboard" element={<HomeRedirect />} />

            {/* Protected Role-Based Layout */}
            <Route element={<RoleBasedLayout />}>
              {/* ADMIN ROUTES */}
              <Route path="/admin/dashboard" element={<ProtectedRoute roles={['Admin']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/admin/doctors" element={<ProtectedRoute roles={['Admin']}><DoctorsPage /></ProtectedRoute>} />
              <Route path="/admin/patients" element={<ProtectedRoute roles={['Admin']}><PatientsPage /></ProtectedRoute>} />
              <Route path="/admin/billing" element={<ProtectedRoute roles={['Admin']}><BillingPage /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute roles={['Admin']}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute roles={['Admin']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/admin/pharmacy" element={<ProtectedRoute roles={['Admin']}><PharmacyPage /></ProtectedRoute>} />
              <Route path="/admin/profile" element={<ProtectedRoute roles={['Admin']}><ProfilePage /></ProtectedRoute>} />

              {/* DOCTOR ROUTES */}
              <Route path="/doctor/dashboard" element={<ProtectedRoute roles={['Doctor']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/doctor/patients" element={<ProtectedRoute roles={['Doctor']}><PatientsPage /></ProtectedRoute>} />
              <Route path="/doctor/appointments" element={<ProtectedRoute roles={['Doctor']}><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/doctor/prescriptions" element={<ProtectedRoute roles={['Doctor']}><PharmacyPage /></ProtectedRoute>} />
              <Route path="/doctor/reports" element={<ProtectedRoute roles={['Doctor']}><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/doctor/profile" element={<ProtectedRoute roles={['Doctor']}><ProfilePage /></ProtectedRoute>} />

              {/* RECEPTIONIST ROUTES */}
              <Route path="/reception/dashboard" element={<ProtectedRoute roles={['Receptionist']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/reception/patients" element={<ProtectedRoute roles={['Receptionist']}><PatientsPage /></ProtectedRoute>} />
              <Route path="/reception/appointments" element={<ProtectedRoute roles={['Receptionist']}><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/reception/billing" element={<ProtectedRoute roles={['Receptionist']}><BillingPage /></ProtectedRoute>} />

              {/* PATIENT ROUTES */}
              <Route path="/patient/dashboard" element={<ProtectedRoute roles={['Patient']}><DashboardPage /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute roles={['Patient']}><AppointmentsPage /></ProtectedRoute>} />
              <Route path="/patient/medical-records" element={<ProtectedRoute roles={['Patient']}><PatientsPage /></ProtectedRoute>} />
              <Route path="/patient/prescriptions" element={<ProtectedRoute roles={['Patient']}><PharmacyPage /></ProtectedRoute>} />
              <Route path="/patient/billing" element={<ProtectedRoute roles={['Patient']}><BillingPage /></ProtectedRoute>} />
              <Route path="/patient/profile" element={<ProtectedRoute roles={['Patient']}><ProfilePage /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </HospitalProvider>
  );
}

export default App;
