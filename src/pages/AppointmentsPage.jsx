import { useMemo, useState } from 'react';
import { useHospital } from '../context/HospitalContext.jsx';
import { CalendarIcon, PlusIcon } from '../components/Icons.jsx';

const TIMESLOTS = ['08:00 AM', '09:30 AM', '11:00 AM', '01:30 PM', '03:00 PM', '04:30 PM'];

const AppointmentsPage = () => {
  const { state, bookAppointment, approveAppointment, searchQuery } = useHospital();
  const user = state.user;
  const isPatient = user?.role === 'Patient';
  
  // Form and Calendar states
  const [selectedDoctor, setSelectedDoctor] = useState(state.doctors[0]?.id || '');
  const [selectedPatient, setSelectedPatient] = useState(state.patients[0]?.id || '');
  const [selectedTime, setSelectedTime] = useState(TIMESLOTS[0]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState('General Consultation');
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDateFilter, setCalendarDateFilter] = useState('all');

  const upcoming = useMemo(() => {
    let baseApps = state.appointments;
    if (isPatient && user?.name) {
      baseApps = state.appointments.filter(a => a.patientName.toLowerCase() === user.name.toLowerCase());
    }
    return baseApps.filter((appointment) => {
      if (appointment.status === 'Cancelled') return false;
      if (!searchQuery) return true;
      return (
        appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [state.appointments, searchQuery, isPatient, user?.name]);

  // Unique list of dates in appointments for visual calendar filter
  const calendarDates = useMemo(() => {
    const dates = state.appointments.map(a => a.date);
    return ['all', ...new Set(dates)].sort();
  }, [state.appointments]);

  const handleBook = (event) => {
    event.preventDefault();
    let patient;
    if (isPatient) {
      patient = state.patients.find((row) => row.name.toLowerCase() === user.name.toLowerCase());
    } else {
      patient = state.patients.find((row) => row.id === selectedPatient);
    }
    const doctor = state.doctors.find((row) => row.id === selectedDoctor);
    if (!patient || !doctor) return;

    bookAppointment({ 
      id: `A${Date.now()}`, 
      patientId: patient.id, 
      patientName: patient.name, 
      doctorId: doctor.id, 
      doctorName: doctor.name, 
      date, 
      timeSlot: selectedTime, 
      status: 'Pending', 
      type 
    });
  };

  return (
    <div className="page-shell">
      <div className="page-head page-head-actions">
        <div>
          <p className="eyebrow">Appointment Center</p>
          <h1>Schedule & Approval</h1>
          <p className="page-subtitle">Simulate real booking workflows, approvals, and calendar-based planning.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCalendar(true)}>
          <CalendarIcon size={16} /> View Duty Calendar
        </button>
      </div>

      <div className="glass-card appointment-grid">
        <form className="appointment-form" onSubmit={handleBook}>
          <h3 style={{ marginBottom: '10px' }}>Book New Slot</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Patient</label>
              {isPatient ? (
                <input className="form-input" value={user?.name || ''} disabled />
              ) : (
                <select className="form-input" value={selectedPatient} onChange={(event) => setSelectedPatient(event.target.value)}>
                  {state.patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name}</option>)}
                </select>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Doctor</label>
              <select className="form-input" value={selectedDoctor} onChange={(event) => setSelectedDoctor(event.target.value)}>
                {state.doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input className="form-input" type="date" value={date} onChange={(event) => setDate(event.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time slot</label>
              <select className="form-input" value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                {TIMESLOTS.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Appointment Type</label>
            <input className="form-input" value={type} onChange={(event) => setType(event.target.value)} placeholder="Follow-up, Consultation, Lab Review" />
          </div>
          <button className="btn btn-primary" type="submit"><PlusIcon size={16} /> Book Appointment</button>
        </form>

        <div className="appointment-panel glass-card">
          <h3>Upcoming Bookings</h3>
          <div className="appointment-list" style={{ maxHeight: '350px', overflowY: 'auto', marginTop: '10px' }}>
            {upcoming.length === 0 ? (
              <p className="small-text" style={{ color: 'var(--text-muted)' }}>No matching upcoming appointments.</p>
            ) : (
              upcoming.map((appointment) => (
                <div key={appointment.id} className="appointment-item" style={{ background: 'var(--bg-app)' }}>
                  <div>
                    <strong>{appointment.patientName}</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--primary)' }}>{appointment.doctorName}</p>
                    <small style={{ color: 'var(--text-muted)' }}>Type: {appointment.type}</small>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.8rem' }}>{appointment.date} · {appointment.timeSlot}</span>
                    <span className={`badge badge-${appointment.status === 'Approved' ? 'success' : appointment.status === 'Pending' ? 'warning' : 'secondary'}`} style={{ alignSelf: 'flex-end' }}>
                      {appointment.status}
                    </span>
                    {appointment.status === 'Pending' && !isPatient && (
                      <button className="btn btn-secondary" type="button" onClick={() => approveAppointment(appointment.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '4px' }}>Approve</button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/*Duty Visual Calendar Modal Overlay */}
      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Duty Roster & Bookings</p>
                <h2>Clinical Scheduler Calendar</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setShowCalendar(false)} style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            {/* Date Filters */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
              {calendarDates.map((d) => (
                <button 
                  key={d} 
                  type="button" 
                  className={`btn ${calendarDateFilter === d ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setCalendarDateFilter(d)}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}
                >
                  {d === 'all' ? 'Show All Dates' : d}
                </button>
              ))}
            </div>

            {/* Calendar Slots Grid */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {state.appointments
                .filter((app) => calendarDateFilter === 'all' || app.date === calendarDateFilter)
                .length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No clinical duties booked for the selected date filter.</p>
                ) : (
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {state.appointments
                      .filter((app) => calendarDateFilter === 'all' || app.date === calendarDateFilter)
                      .map((app) => (
                        <div 
                          key={app.id} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '12px 16px', 
                            borderRadius: '8px', 
                            background: app.status === 'Approved' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(245, 158, 11, 0.06)',
                            border: `1px solid ${app.status === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>
                              📅 {app.date} • 🕒 {app.timeSlot}
                            </span>
                            <strong style={{ fontSize: '1rem' }}>{app.patientName}</strong>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> with </span>
                            <strong style={{ color: 'var(--text-main)', fontSize: '0.9rem' }}>{app.doctorName}</strong>
                            <small style={{ display: 'block', marginTop: '2px', color: 'var(--text-muted)' }}>{app.type}</small>
                          </div>
                          <div>
                            <span className={`badge badge-${app.status === 'Approved' ? 'success' : 'warning'}`}>
                              {app.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPage;
