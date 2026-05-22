import { NavLink } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext.jsx';
import { 
  DashboardIcon, 
  UsersIcon, 
  DoctorIcon, 
  CalendarIcon, 
  PharmacyIcon, 
  BillingIcon, 
  AIAnalyticsIcon, 
  SettingsIcon,
  BellIcon,
  ReportIcon,
  InfoIcon,
  ClockIcon,
  LogOutIcon
} from './Icons.jsx';

const roleMenus = {
  Admin: [
    { to: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/admin/doctors', label: 'Doctors', icon: DoctorIcon },
    { to: '/admin/patients', label: 'Patients', icon: UsersIcon },
    { to: '/admin/billing', label: 'Billing', icon: BillingIcon },
    { to: '/admin/analytics', label: 'AI Analytics', icon: AIAnalyticsIcon },
    { to: '/admin/reports', label: 'Reports', icon: ReportIcon },
    { to: '/admin/pharmacy', label: 'Pharmacy', icon: PharmacyIcon },
    { to: '/admin/profile', label: 'Settings', icon: SettingsIcon }
  ],
  Doctor: [
    { to: '/doctor/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/doctor/patients', label: 'My Patients', icon: UsersIcon },
    { to: '/doctor/appointments', label: 'Appointments', icon: CalendarIcon },
    { to: '/doctor/prescriptions', label: 'Prescriptions', icon: PharmacyIcon },
    { to: '/doctor/reports', label: 'Reports', icon: ReportIcon },
    { to: '/doctor/profile', label: 'Availability', icon: ClockIcon }
  ],
  Receptionist: [
    { to: '/reception/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/reception/patients', label: 'Register Patient', icon: UsersIcon },
    { to: '/reception/appointments', label: 'Appointments', icon: CalendarIcon },
    { to: '/reception/billing', label: 'Billing', icon: BillingIcon }
  ],
  Patient: [
    { to: '/patient/dashboard', label: 'Dashboard', icon: DashboardIcon },
    { to: '/patient/appointments', label: 'Appointments', icon: CalendarIcon },
    { to: '/patient/medical-records', label: 'Medical Records', icon: ReportIcon },
    { to: '/patient/prescriptions', label: 'Prescriptions', icon: PharmacyIcon },
    { to: '/patient/billing', label: 'Billing', icon: BillingIcon },
    { to: '/patient/profile', label: 'Profile', icon: SettingsIcon }
  ]
};

const DynamicSidebar = ({ collapsed, onCollapse }) => {
  const { state, logout } = useHospital();
  const user = state.user;
  const role = user?.role || 'Patient';
  const menuItems = roleMenus[role] || roleMenus.Patient;

  return (
    <aside className={`glass-card sidebar-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="logo-mark" style={{ background: 'var(--primary)' }}>H</div>
        <div className="brand-copy">
          <p>HealthPro</p>
          <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{role} Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              aria-label={item.label}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {user ? (
          <>
            <div className="sidebar-user">
              <span>{user.name}</span>
              <small style={{ color: 'var(--text-muted)' }}>{user.role}</small>
            </div>
            <button className="btn btn-secondary sidebar-logout" onClick={logout} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <LogOutIcon size={14} /> {!collapsed && 'Logout'}
            </button>
          </>
        ) : (
          <div className="sidebar-user">Guest Mode</div>
        )}
      </div>
      <button type="button" className="sidebar-collapse" onClick={onCollapse}>
        {collapsed ? 'Expand' : 'Collapse'}
      </button>
    </aside>
  );
};

export default DynamicSidebar;
