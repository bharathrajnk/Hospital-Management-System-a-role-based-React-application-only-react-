import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';

export const ACTIONS = {
  HYDRATE: 'HYDRATE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  SIGNUP: 'SIGNUP',
  ADD_PATIENT: 'ADD_PATIENT',
  EDIT_PATIENT: 'EDIT_PATIENT',
  DELETE_PATIENT: 'DELETE_PATIENT',
  BOOK_APPOINTMENT: 'BOOK_APPOINTMENT',
  APPROVE_APPOINTMENT: 'APPROVE_APPOINTMENT',
  UPDATE_DOCTOR_STATUS: 'UPDATE_DOCTOR_STATUS',
  ADD_DOCTOR: 'ADD_DOCTOR',
  ADD_MEDICINE: 'ADD_MEDICINE',
  PAY_BILLING: 'PAY_BILLING',
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  READ_NOTIFICATION: 'READ_NOTIFICATION',
  CLEAR_NOTIFICATIONS: 'CLEAR_NOTIFICATIONS',
  TOGGLE_WIDGET: 'TOGGLE_WIDGET',
  LOG_ACTIVITY: 'LOG_ACTIVITY',
  DISCHARGE_PATIENT: 'DISCHARGE_PATIENT',
  ADD_TOAST: 'ADD_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
  ADD_INVOICE: 'ADD_INVOICE',
  ADD_EXPENSE: 'ADD_EXPENSE'
};

const INITIAL_USERS = [
  { id: 'U001', name: 'Virat Kohli', email: 'admin', password: 'admin@123', role: 'Admin' },
  { id: 'U002', name: 'Dr. Faf du Plessis', email: 'doctor', password: 'doctor@123', role: 'Doctor' },
  { id: 'U003', name: 'Dinesh Karthik', email: 'reception', password: 'reception@123', role: 'Receptionist' },
  { id: 'U004', name: 'Rajat Patidar', email: 'patient', password: 'patient@123', role: 'Patient' }
];

const INITIAL_DOCTORS = [
  { id: 'D001', name: 'Dr. Faf du Plessis', specialty: 'Cardiology', rating: 4.9, consultations: 1420, status: 'Available', performance: { patientsTreated: 120, avgSessionTime: 18 } },
  { id: 'D002', name: 'Dr. Glenn Maxwell', specialty: 'Neurology', rating: 4.8, consultations: 980, status: 'In Consultation', performance: { patientsTreated: 85, avgSessionTime: 22 } },
  { id: 'D003', name: 'Dr. Mohammed Siraj', specialty: 'Pediatrics', rating: 4.9, consultations: 1650, status: 'Available', performance: { patientsTreated: 154, avgSessionTime: 15 } },
  { id: 'D004', name: 'Dr. Cameron Green', specialty: 'Orthopedics', rating: 4.7, consultations: 1110, status: 'On Leave', performance: { patientsTreated: 95, avgSessionTime: 20 } }
];

const INITIAL_PATIENTS = [
  {
    id: 'P001',
    name: 'Virat Kohli',
    age: 35,
    gender: 'Male',
    bloodGroup: 'A+',
    status: 'Admitted',
    room: '302-B',
    admissionDate: '2026-05-22',
    condition: 'Elite Fitness Optimization Program',
    emergencyContact: 'Anushka Sharma (+91 99999 88888)',
    allergies: 'Penicillin',
    history: [
      { date: '2026-05-22', type: 'Consultation', title: 'Cardiorespiratory Recovery Evaluation', notes: 'Optimal telemetry performance. Standard fitness checks checked.' }
    ],
    prescriptions: [
      { date: '2026-05-22', medicine: 'Aspirin 81mg', dosage: 'Once daily', duration: '30 Days', status: 'Filled' },
      { date: '2026-05-22', medicine: 'Metoprolol 25mg', dosage: 'Twice daily', duration: '90 Days', status: 'Filled' }
    ],
    vitals: { heartRate: 78, bpSystolic: 122, bpDiastolic: 80, oxygenSat: 98, respirationRate: 16 }
  },
  {
    id: 'P002',
    name: 'Rajat Patidar',
    age: 30,
    gender: 'Male',
    bloodGroup: 'O+',
    status: 'Discharged',
    room: 'Outpatient',
    admissionDate: '2026-05-22',
    condition: 'Mild Ankle Sprain rehab',
    emergencyContact: 'Virat Kohli (+91 99999 77777)',
    allergies: 'None',
    history: [
      { date: '2026-05-22', type: 'Consultation', title: 'Physiotherapy Session 1', notes: 'Swelling reduced. Joint stability nominal.' }
    ],
    prescriptions: [
      { date: '2026-05-22', medicine: 'Ibuprofen 600mg', dosage: 'As needed', duration: '10 Days', status: 'Filled' }
    ],
    vitals: { heartRate: 72, bpSystolic: 115, bpDiastolic: 75, oxygenSat: 99, respirationRate: 14 }
  },
  {
    id: 'P003',
    name: 'Yash Dayal',
    age: 26,
    gender: 'Male',
    bloodGroup: 'B+',
    status: 'Admitted',
    room: 'ICU-04',
    admissionDate: '2026-05-22',
    condition: 'Acute Fatigue & Muscle Spasm',
    emergencyContact: 'Glenn Maxwell (+91 99999 66666)',
    allergies: 'Sulfa drugs',
    history: [
      { date: '2026-05-22', type: 'Admission', title: 'Admitted via ED', notes: 'Rehydrated via IV. Initiated vitals telemetry tracking.' }
    ],
    prescriptions: [
      { date: '2026-05-22', medicine: 'Albuterol Nebulizer', dosage: 'Every 4 hours', duration: '5 Days', status: 'Filled' }
    ],
    vitals: { heartRate: 104, bpSystolic: 138, bpDiastolic: 88, oxygenSat: 91, respirationRate: 23 }
  },
  {
    id: 'P004',
    name: 'Mahipal Lomror',
    age: 24,
    gender: 'Male',
    bloodGroup: 'AB+',
    status: 'Admitted',
    room: '104-A',
    admissionDate: '2026-05-22',
    condition: 'Knee Rehab Protocol',
    emergencyContact: 'Dinesh Karthik (+91 99999 55555)',
    allergies: 'Aspirin',
    history: [
      { date: '2026-05-22', type: 'Admission', title: 'Knee flexion monitoring', notes: 'Progressing nicely.' }
    ],
    prescriptions: [
      { date: '2026-05-22', medicine: 'Insulin Glargine', dosage: '12 units nightly', duration: 'Ongoing', status: 'Filled' }
    ],
    vitals: { heartRate: 85, bpSystolic: 128, bpDiastolic: 82, oxygenSat: 97, respirationRate: 18 }
  },
  {
    id: 'P005',
    name: 'Karn Sharma',
    age: 36,
    gender: 'Male',
    bloodGroup: 'O-',
    status: 'Outpatient',
    room: 'Outpatient',
    admissionDate: '2026-05-22',
    condition: 'Routine Physical Exam',
    emergencyContact: 'Siraj (+91 99999 44444)',
    allergies: 'None',
    history: [
      { date: '2026-05-22', type: 'Consultation', title: 'Fitness Assessment', notes: 'Fit to play.' }
    ],
    prescriptions: [
      { date: '2026-05-22', medicine: 'Ibuprofen 600mg', dosage: 'Three times daily', duration: '14 Days', status: 'Filled' }
    ],
    vitals: { heartRate: 70, bpSystolic: 120, bpDiastolic: 80, oxygenSat: 99, respirationRate: 15 }
  }
];

const INITIAL_APPOINTMENTS = [
  { id: 'A001', patientId: 'P001', patientName: 'Virat Kohli', doctorId: 'D001', doctorName: 'Dr. Faf du Plessis', date: '2026-05-22', timeSlot: '09:00 AM', status: 'Approved', type: 'Cardiac Fitness Check' },
  { id: 'A002', patientId: 'P002', patientName: 'Rajat Patidar', doctorId: 'D002', doctorName: 'Dr. Glenn Maxwell', date: '2026-05-22', timeSlot: '11:30 AM', status: 'Approved', type: 'Neurology Consultation' },
  { id: 'A003', patientId: 'P004', patientName: 'Mahipal Lomror', doctorId: 'D003', doctorName: 'Dr. Mohammed Siraj', date: '2026-05-22', timeSlot: '02:00 PM', status: 'Pending', type: 'Pediatric Checkup' },
  { id: 'A004', patientId: 'P005', patientName: 'Karn Sharma', doctorId: 'D001', doctorName: 'Dr. Faf du Plessis', date: '2026-05-22', timeSlot: '10:00 AM', status: 'Pending', type: 'Orthopedic Exam' }
];

const INITIAL_PHARMACY = [
  { id: 'M001', name: 'Aspirin 81mg', category: 'Cardiovascular', stock: 120, threshold: 50, price: 12.5 },
  { id: 'M002', name: 'Metoprolol 25mg', category: 'Cardiovascular', stock: 45, threshold: 50, price: 28.0 },
  { id: 'M003', name: 'Sumatriptan 50mg', category: 'Analgesics', stock: 95, threshold: 30, price: 45.0 },
  { id: 'M004', name: 'Albuterol Nebulizer', category: 'Respiratory', stock: 18, threshold: 20, price: 15.8 },
  { id: 'M005', name: 'Insulin Glargine', category: 'Endocrine', stock: 80, threshold: 25, price: 72.0 },
  { id: 'M006', name: 'Ibuprofen 600mg', category: 'Analgesics', stock: 240, threshold: 100, price: 8.5 }
];

const INITIAL_BILLING = [
  { id: 'INV-1001', patientId: 'P001', patientName: 'Virat Kohli', totalAmount: 4850.0, paidAmount: 4850.0, status: 'Paid', date: '2026-05-15', items: [{ desc: 'Cardiac Consultation', cost: 150.0 }, { desc: 'Fitness Optimization Fee', cost: 4500.0 }, { desc: 'Pharmacy Dispense', cost: 200.0 }] },
  { id: 'INV-1002', patientId: 'P002', patientName: 'Rajat Patidar', totalAmount: 320.0, paidAmount: 0.0, status: 'Unpaid', date: '2026-05-10', items: [{ desc: 'Neurology Consultation', cost: 200.0 }, { desc: 'MRI Imaging Scan Fee', cost: 120.0 }] },
  { id: 'INV-1003', patientId: 'P003', patientName: 'Yash Dayal', totalAmount: 1850.0, paidAmount: 500.0, status: 'Partially Paid', date: '2026-05-19', items: [{ desc: 'ICU Critical Care Day 1', cost: 1500.0 }, { desc: 'Emergency Hydration Therapies', cost: 350.0 }] },
  { id: 'INV-1004', patientId: 'P004', patientName: 'Mahipal Lomror', totalAmount: 640.0, paidAmount: 0.0, status: 'Unpaid', date: '2026-05-20', items: [{ desc: 'Endocrine Consultation', cost: 220.0 }, { desc: 'Insulin Infusion Therapy', cost: 420.0 }] }
];

const INITIAL_LOGS = [
  { id: 'L001', timestamp: '2026-05-22T09:00:15', category: 'System', user: 'System', action: 'Hospital context initialized', notes: 'Seed databases verified.' },
  { id: 'L002', timestamp: '2026-05-22T09:12:45', category: 'Medical', user: 'Dr. Faf du Plessis', action: 'Prescription Written', notes: 'Prescribed Metoprolol 25mg to Virat Kohli (P001).' },
  { id: 'L003', timestamp: '2026-05-22T09:30:00', category: 'Billing', user: 'Dinesh Karthik', action: 'Invoice Generated', notes: 'Generated invoice INV-1004 for Mahipal Lomror.' }
];

const INITIAL_WIDGETS = {
  vitalsPanel: true,
  revenueChart: true,
  bedCounter: true,
  activityFeed: true,
  dailyReport: true,
  diseaseStats: true,
  emergencyBoard: true
};

const INITIAL_EXPENSES = [
  { id: 'EXP-1001', category: 'Medical Equipment', amount: 35000, date: '2026-05-18', description: 'Defibrillator maintenance and telemetry calibration' },
  { id: 'EXP-1002', category: 'Pharmaceutical Supplies', amount: 18500, date: '2026-05-10', description: 'Bulk cardiovascular and analgesic drug replenishment' },
  { id: 'EXP-1003', category: 'Staff Payroll', amount: 85000, date: '2026-05-01', description: 'Consulting and emergency clinical nurse rosters' },
  { id: 'EXP-1004', category: 'Utilities & Facilities', amount: 12500, date: '2026-05-20', description: 'Oxygen tank delivery and hospital wing HVAC service' },
  { id: 'EXP-1005', category: 'Administrative Supplies', amount: 4800, date: '2026-05-15', description: 'Patient admission registration materials and card printing' }
];

const INITIAL_STATE = {
  user: null,
  users: INITIAL_USERS,
  patients: INITIAL_PATIENTS,
  doctors: INITIAL_DOCTORS,
  appointments: INITIAL_APPOINTMENTS,
  pharmacy: INITIAL_PHARMACY,
  billing: INITIAL_BILLING,
  expenses: INITIAL_EXPENSES,
  activityLogs: INITIAL_LOGS,
  widgetSettings: INITIAL_WIDGETS,
  sirenMuted: false,
  toasts: [],
  notifications: [
    { id: 'N001', title: 'System Running', message: 'Hospital monitoring cluster connected.', read: false, type: 'info', timestamp: new Date().toLocaleTimeString() }
  ]
};

const storageKey = 'smart-hospital-state-v1';

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.HYDRATE:
      return { ...state, ...action.payload };
    case ACTIONS.LOGIN:
      return {
        ...state,
        user: action.payload,
        notifications: [
          { id: `N${Date.now()}`, title: 'Welcome Back', message: `Logged in as ${action.payload.name} (${action.payload.role}).`, type: 'success', timestamp: new Date().toLocaleTimeString(), read: false },
          ...state.notifications
        ]
      };
    case ACTIONS.LOGOUT:
      return { ...state, user: null };
    case ACTIONS.SIGNUP:
      return {
        ...state,
        users: [...state.users, action.payload.user],
        patients: action.payload.patient ? [...state.patients, action.payload.patient] : state.patients,
        user: action.payload.user,
        notifications: [{ id: `N${Date.now()}`, title: 'Signup Complete', message: 'Account created successfully.', type: 'success', timestamp: new Date().toLocaleTimeString(), read: false }, ...state.notifications]
      };
    case ACTIONS.ADD_PATIENT:
      return {
        ...state,
        patients: [action.payload, ...state.patients],
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Patient', user: state.user?.name || 'System', action: 'Patient Added', notes: `${action.payload.name} added to profile list.` }, ...state.activityLogs]
      };
    case ACTIONS.EDIT_PATIENT:
      return {
        ...state,
        patients: state.patients.map((patient) => (patient.id === action.payload.id ? { ...patient, ...action.payload.updates } : patient)),
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Patient', user: state.user?.name || 'System', action: 'Patient Updated', notes: `Updated ${action.payload.id}.` }, ...state.activityLogs]
      };
    case ACTIONS.DELETE_PATIENT:
      return {
        ...state,
        patients: state.patients.filter((patient) => patient.id !== action.payload),
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Patient', user: state.user?.name || 'System', action: 'Patient Removed', notes: `${action.payload} removed from records.` }, ...state.activityLogs]
      };
    case ACTIONS.DISCHARGE_PATIENT:
      return {
        ...state,
        patients: state.patients.map((patient) => (patient.id === action.payload ? { ...patient, status: 'Discharged', room: 'Released' } : patient)),
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Patient', user: state.user?.name || 'System', action: 'Patient Discharged', notes: `${action.payload} discharged successfully.` }, ...state.activityLogs]
      };
    case ACTIONS.BOOK_APPOINTMENT:
      return {
        ...state,
        appointments: [action.payload, ...state.appointments],
        notifications: [{ id: `N${Date.now()}`, title: 'Appointment Requested', message: `Appointment requested with ${action.payload.doctorName}.`, type: 'info', timestamp: new Date().toLocaleTimeString(), read: false }, ...state.notifications],
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Appointments', user: state.user?.name || 'System', action: 'Appointment Booked', notes: `${action.payload.patientName} requested ${action.payload.type}.` }, ...state.activityLogs]
      };
    case ACTIONS.APPROVE_APPOINTMENT:
      return {
        ...state,
        appointments: state.appointments.map((appointment) => (appointment.id === action.payload ? { ...appointment, status: 'Approved' } : appointment)),
        notifications: [{ id: `N${Date.now()}`, title: 'Appointment Approved', message: `Appointment ${action.payload} was approved.`, type: 'success', timestamp: new Date().toLocaleTimeString(), read: false }, ...state.notifications]
      };
    case ACTIONS.UPDATE_DOCTOR_STATUS:
      return {
        ...state,
        doctors: state.doctors.map((doctor) => (doctor.id === action.payload.id ? { ...doctor, status: action.payload.status } : doctor)),
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Doctor', user: state.user?.name || 'System', action: 'Doctor Status', notes: `${action.payload.id} status changed to ${action.payload.status}.` }, ...state.activityLogs]
      };
    case ACTIONS.ADD_DOCTOR:
      return {
        ...state,
        doctors: [...state.doctors, action.payload],
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Doctor', user: state.user?.name || 'System', action: 'Doctor Added', notes: `${action.payload.name} added to clinical staff roster.` }, ...state.activityLogs]
      };
    case ACTIONS.ADD_MEDICINE:
      return {
        ...state,
        pharmacy: [action.payload, ...state.pharmacy],
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Pharmacy', user: state.user?.name || 'System', action: 'Inventory Updated', notes: `${action.payload.name} added to inventory.` }, ...state.activityLogs]
      };
    case ACTIONS.PAY_BILLING:
      const targetId = typeof action.payload === 'string' ? action.payload : action.payload.id;
      return {
        ...state,
        billing: state.billing.map((invoice) => (invoice.id === targetId ? { ...invoice, paidAmount: invoice.totalAmount, status: 'Paid' } : invoice)),
        notifications: [{ id: `N${Date.now()}`, title: 'Invoice Paid', message: `${targetId} has been marked paid.`, type: 'success', timestamp: new Date().toLocaleTimeString(), read: false }, ...state.notifications]
      };
    case ACTIONS.ADD_NOTIFICATION:
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case ACTIONS.READ_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.map((notification) => (notification.id === action.payload ? { ...notification, read: true } : notification))
      };
    case ACTIONS.CLEAR_NOTIFICATIONS:
      return { ...state, notifications: [] };
    case ACTIONS.TOGGLE_WIDGET:
      return { ...state, widgetSettings: { ...state.widgetSettings, [action.payload]: !state.widgetSettings[action.payload] } };
    case ACTIONS.LOG_ACTIVITY:
      return { ...state, activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), ...action.payload }, ...state.activityLogs] };
    case ACTIONS.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, { id: Date.now() + Math.random(), message: action.payload.message, type: action.payload.type || 'info' }]
      };
    case ACTIONS.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload)
      };
    case ACTIONS.ADD_INVOICE:
      return {
        ...state,
        billing: [action.payload, ...state.billing],
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Billing', user: state.user?.name || 'System', action: 'Invoice Generated', notes: `Issued invoice ${action.payload.id} for ${action.payload.patientName}.` }, ...state.activityLogs]
      };
    case ACTIONS.ADD_EXPENSE:
      return {
        ...state,
        expenses: [action.payload, ...state.expenses],
        activityLogs: [{ id: `L${Date.now()}`, timestamp: new Date().toISOString(), category: 'Billing', user: state.user?.name || 'System', action: 'Expense Registered', notes: `Registered expense ${action.payload.id} - ${action.payload.category} (₹${action.payload.amount.toLocaleString()}).` }, ...state.activityLogs]
      };
    default:
      return state;
  }
};

const HospitalContext = createContext(null);

export const useHospital = () => useContext(HospitalContext);

export const HospitalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    let shouldReset = false;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if there are patients/doctors with non-RCB names (e.g. Jyoti, Rajesh, Sneha, Devendra, David Miller)
        const hasOldNames = parsed.patients?.some(p => p.name === 'Jyoti Prasad' || p.name === 'Devendra Mishra' || p.name === 'David Miller' || p.name === 'John Doe') ||
                            parsed.doctors?.some(d => d.name === 'Dr. Rajesh Iyer' || d.name === 'Dr. Sneha Patil' || d.name === 'Dr. Ronald Sterling');
        if (hasOldNames) {
          shouldReset = true;
        } else {
        if (!parsed.expenses) {
          parsed.expenses = INITIAL_EXPENSES;
        }
        if (!parsed.users) {
          parsed.users = INITIAL_USERS;
        } else {
            INITIAL_USERS.forEach((defaultUser) => {
              const index = parsed.users.findIndex(
                (u) => u.email.toLowerCase() === defaultUser.email.toLowerCase()
              );
              if (index > -1) {
                // Ensure default credentials and role always match current specifications
                parsed.users[index] = {
                  ...parsed.users[index],
                  password: defaultUser.password,
                  role: defaultUser.role,
                  name: defaultUser.name
                };
              } else {
                parsed.users.push(defaultUser);
              }
            });
          }
          dispatch({ type: ACTIONS.HYDRATE, payload: parsed });
        }
      } catch (error) {
        console.warn('Unable to hydrate state:', error);
        shouldReset = true;
      }
    }
    if (!stored || shouldReset) {
      localStorage.setItem(storageKey, JSON.stringify(INITIAL_STATE));
      dispatch({ type: ACTIONS.HYDRATE, payload: INITIAL_STATE });
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, loaded]);

  const addToast = (message, type = 'info') => {
    dispatch({ type: ACTIONS.ADD_TOAST, payload: { message, type } });
  };
  const removeToast = (id) => {
    dispatch({ type: ACTIONS.REMOVE_TOAST, payload: id });
  };

  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();
    
    // Check local state.users first
    let user = state.users.find(
      (entry) => entry.email.toLowerCase() === cleanEmail && entry.password === cleanPassword
    );

    // Fallback to INITIAL_USERS if state.users doesn't match yet (ensures seed profiles ALWAYS work)
    if (!user) {
      const seedUser = INITIAL_USERS.find(
        (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
      );
      if (seedUser) {
        user = seedUser;
        // Proactively insert or update this user in the state.users so it persists
        const exists = state.users.some((u) => u.email.toLowerCase() === cleanEmail);
        const updatedUsers = exists
          ? state.users.map((u) =>
              u.email.toLowerCase() === cleanEmail
                ? { ...u, password: cleanPassword, role: seedUser.role, name: seedUser.name }
                : u
            )
          : [...state.users, seedUser];
        
        // Sync users list in state
        dispatch({
          type: ACTIONS.HYDRATE,
          payload: { users: updatedUsers }
        });
      }
    }

    if (!user) return { success: false, message: 'Invalid email or password' };
    dispatch({ type: ACTIONS.LOGIN, payload: user });
    addToast(`Welcome back, ${user.name}!`, 'success');
    return { success: true, role: user.role };
  };

  const signup = (newUser) => {
    if (state.users.some((entry) => entry.email.toLowerCase() === newUser.email.toLowerCase())) {
      return { success: false, message: 'Email already registered' };
    }
    const user = { id: `U${Date.now()}`, ...newUser };
    const patient = newUser.role === 'Patient' ? { id: `P${Date.now()}`, name: newUser.name, age: newUser.age || 0, gender: newUser.gender || 'Unknown', bloodGroup: newUser.bloodGroup || 'Unknown', status: 'Outpatient', room: 'Outpatient', admissionDate: new Date().toISOString().slice(0, 10), condition: 'New patient registration', emergencyContact: newUser.emergencyContact || 'N/A', allergies: newUser.allergies || 'Unknown', history: [], prescriptions: [], vitals: { heartRate: 72, bpSystolic: 118, bpDiastolic: 75, oxygenSat: 98, respirationRate: 16 } } : null;
    dispatch({ type: ACTIONS.SIGNUP, payload: { user, patient } });
    addToast('Account created successfully!', 'success');
    return { success: true };
  };

  const logout = () => {
    dispatch({ type: ACTIONS.LOGOUT });
    addToast('You have logged out.', 'info');
  };

  const addPatient = (patient) => {
    dispatch({ type: ACTIONS.ADD_PATIENT, payload: patient });
    addToast(`Patient ${patient.name} admitted successfully.`, 'success');
  };

  const updatePatient = (id, updates) => {
    dispatch({ type: ACTIONS.EDIT_PATIENT, payload: { id, updates } });
    addToast(`Patient record updated.`, 'success');
  };

  const removePatient = (id) => {
    dispatch({ type: ACTIONS.DELETE_PATIENT, payload: id });
    addToast('Patient record deleted.', 'warning');
  };

  const dischargePatient = (id) => {
    dispatch({ type: ACTIONS.DISCHARGE_PATIENT, payload: id });
    addToast('Patient discharged successfully.', 'success');
  };

  const bookAppointment = (appointment) => {
    dispatch({ type: ACTIONS.BOOK_APPOINTMENT, payload: appointment });
    addToast('Appointment slot booked successfully.', 'success');
  };

  const approveAppointment = (id) => {
    dispatch({ type: ACTIONS.APPROVE_APPOINTMENT, payload: id });
    addToast('Appointment approved.', 'success');
  };

  const toggleDoctorStatus = (id, status) => {
    dispatch({ type: ACTIONS.UPDATE_DOCTOR_STATUS, payload: { id, status } });
    addToast(`Doctor status changed to ${status}.`, 'info');
  };

  const addDoctor = (doctor) => {
    dispatch({ type: ACTIONS.ADD_DOCTOR, payload: doctor });
    addToast(`Dr. ${doctor.name} added to medical roster.`, 'success');
  };

  const addMedicine = (medicine) => {
    dispatch({ type: ACTIONS.ADD_MEDICINE, payload: medicine });
    addToast(`${medicine.name} added to pharmacy inventory.`, 'success');
  };

  const payBilling = (invoice) => {
    dispatch({ type: ACTIONS.PAY_BILLING, payload: invoice });
    addToast(`Invoice ${invoice.id || invoice} marked as paid.`, 'success');
  };

  const addInvoice = (invoice) => {
    dispatch({ type: ACTIONS.ADD_INVOICE, payload: invoice });
    addToast(`Billing invoice generated for ${invoice.patientName}.`, 'success');
  };

  const addExpense = (expense) => {
    dispatch({ type: ACTIONS.ADD_EXPENSE, payload: expense });
    addToast(`Operating expense of ₹${expense.amount.toLocaleString()} registered successfully.`, 'success');
  };

  const addNotification = (notification) => dispatch({ type: ACTIONS.ADD_NOTIFICATION, payload: notification });
  const markNotificationRead = (id) => dispatch({ type: ACTIONS.READ_NOTIFICATION, payload: id });
  const clearNotifications = () => dispatch({ type: ACTIONS.CLEAR_NOTIFICATIONS });
  const toggleWidget = (widgetKey) => dispatch({ type: ACTIONS.TOGGLE_WIDGET, payload: widgetKey });
  const logActivity = (entry) => dispatch({ type: ACTIONS.LOG_ACTIVITY, payload: entry });

  const value = {
    state,
    searchQuery,
    setSearchQuery,
    login,
    signup,
    logout,
    addPatient,
    updatePatient,
    removePatient,
    dischargePatient,
    bookAppointment,
    approveAppointment,
    toggleDoctorStatus,
    addDoctor,
    addMedicine,
    payBilling,
    addInvoice,
    addExpense,
    addToast,
    removeToast,
    addNotification,
    markNotificationRead,
    clearNotifications,
    toggleWidget,
    logActivity
  };

  if (!loaded) {
    return null;
  }

  return <HospitalContext.Provider value={value}>{children}</HospitalContext.Provider>;
};


