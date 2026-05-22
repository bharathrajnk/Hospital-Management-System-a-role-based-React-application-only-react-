import { NavLink } from 'react-router-dom';
import { DashboardIcon, UsersIcon, DoctorIcon, CalendarIcon, PharmacyIcon, BillingIcon, AIAnalyticsIcon, SettingsIcon } from './Icons.jsx';
import { useHospital } from '../context/HospitalContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: DashboardIcon, roles: ['Admin', 'Doctor', 'Receptionist', 'Patient'] },
  { to: '/patients', label: 'Patients', icon: UsersIcon, roles: ['Admin', 'Doctor', 'Receptionist'] },
  { to: '/doctors', label: 'Doctors', icon: DoctorIcon, roles: ['Admin', 'Receptionist'] },
  { to: '/appointments', label: 'Appointments', icon: CalendarIcon, roles: ['Admin', 'Doctor', 'Receptionist', 'Patient'] },
  { to: '/pharmacy', label: 'Pharmacy', icon: PharmacyIcon, roles: ['Admin', 'Receptionist'] },
  { to: '/billing', label: 'Billing', icon: BillingIcon, roles: ['Admin', 'Receptionist'] },
  { to: '/analytics', label: 'AI Analytics', icon: AIAnalyticsIcon, roles: ['Admin', 'Doctor'] },
  { to: '/profile', label: 'Profile', icon: SettingsIcon, roles: ['Admin', 'Doctor', 'Receptionist', 'Patient'] }
];

const Sidebar = ({ collapsed, onCollapse }) => {
  const { state, logout } = useHospital();
  const user = state.user;

  return (
    <aside className={`glass-card sidebar-panel ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="logo-mark">H</div>
        <div className="brand-copy">
          <p>HealthPro</p>
          <span>Elite Control</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems
          .filter((item) => user && item.roles.includes(user.role))
          .map((item) => {
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
              <small>{user.role}</small>
            </div>
            <button className="btn btn-secondary sidebar-logout" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <div className="sidebar-user">Guest mode</div>
        )}
      </div>
      <button type="button" className="sidebar-collapse" onClick={onCollapse}>
        {collapsed ? 'Expand' : 'Collapse'}
      </button>
    </aside>
  );
};

export default Sidebar;
