import React from 'react';

// Common base wrapper
const IconWrapper = ({ children, size = 20, className = "", onClick }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block ${className}`}
    onClick={onClick}
    style={onClick ? { cursor: 'pointer' } : undefined}
  >
    {children}
  </svg>
);

export const DashboardIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </IconWrapper>
);

export const UsersIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconWrapper>
);

export const DoctorIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M4.8 2.2C6 1 7.5 1 9.5 2.5c2.3 1.7 1.8 3.5 3.2 4.9s3.2.9 4.9 3.2c1.5 2 1.5 3.5.3 4.7L18.3 19c-1.2 1.2-3.1 1.2-4.3 0L3.1 8.1c-1.2-1.2-1.2-3.1 0-4.3l1.7-1.6z" />
    <path d="m14 14 3.5 3.5M9.5 9.5l3.5 3.5" />
    <circle cx="12" cy="5" r="1.5" />
  </IconWrapper>
);

export const CalendarIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

export const PharmacyIcon = (props) => (
  <IconWrapper {...props}>
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </IconWrapper>
);

export const BillingIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="12" y1="1" x2="12" y2="23" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </IconWrapper>
);

export const AIAnalyticsIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5" />
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </IconWrapper>
);

export const AlertIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </IconWrapper>
);

export const BellIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </IconWrapper>
);

export const MoonIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </IconWrapper>
);

export const SunIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </IconWrapper>
);

export const ClockIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconWrapper>
);

export const LogOutIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </IconWrapper>
);

export const ChevronLeftIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="15 18 9 12 15 6" />
  </IconWrapper>
);

export const ChevronRightIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="9 18 15 12 9 6" />
  </IconWrapper>
);

export const ChevronDownIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconWrapper>
);

export const UserIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconWrapper>
);

export const SettingsIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrapper>
);

export const CheckIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);

export const SearchIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </IconWrapper>
);

export const PlusIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

export const TrashIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </IconWrapper>
);

export const EditIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </IconWrapper>
);

export const CloseIcon = (props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

export const InfoIcon = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </IconWrapper>
);

export const HeartIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </IconWrapper>
);

export const PrintIcon = (props) => (
  <IconWrapper {...props}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </IconWrapper>
);

export const LockIcon = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </IconWrapper>
);

export const HeartbeatIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </IconWrapper>
);

export const BedIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M2 4v16M2 11h18M22 9v11M2 8h8M22 11h-4" />
  </IconWrapper>
);

export const ReportIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </IconWrapper>
);

export const ActivityIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </IconWrapper>
);

export const BrainIcon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
    <path d="M12 6a6 6 0 0 0-6 6c0 2.2.8 4 2 5.5" />
    <path d="M12 6a6 6 0 0 1 6 6c0 2.2-.8 4-2 5.5" />
    <path d="M12 18v-6" />
    <circle cx="12" cy="9" r="1" />
  </IconWrapper>
);

