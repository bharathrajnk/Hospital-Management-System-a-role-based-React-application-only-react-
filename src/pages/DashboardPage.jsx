import React from 'react';
import { useHospital } from '../context/HospitalContext.jsx';
import AdminDashboard from './Dashboards/AdminDashboard.jsx';
import DoctorDashboard from './Dashboards/DoctorDashboard.jsx';
import ReceptionistDashboard from './Dashboards/ReceptionistDashboard.jsx';
import PatientDashboard from './Dashboards/PatientDashboard.jsx';

const DashboardPage = () => {
  const { state } = useHospital();
  const role = state.user?.role;

  switch (role) {
    case 'Admin':
      return <AdminDashboard />;
    case 'Doctor':
      return <DoctorDashboard />;
    case 'Receptionist':
      return <ReceptionistDashboard />;
    case 'Patient':
      return <PatientDashboard />;
    default:
      return (
        <div className="page-shell" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Access Denied</h2>
          <p>Please log in with a valid clinical or patient account.</p>
        </div>
      );
  }
};

export default DashboardPage;
