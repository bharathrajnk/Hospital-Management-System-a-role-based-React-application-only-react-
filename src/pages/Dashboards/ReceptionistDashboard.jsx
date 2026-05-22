import { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext.jsx';
import { PlusIcon, CalendarIcon, UsersIcon } from '../../components/Icons.jsx';

const ReceptionistDashboard = () => {
  const { state, addPatient, bookAppointment, toggleDoctorStatus, addToast } = useHospital();
  
  // Tab selector: 'register' | 'book'
  const [activeTab, setActiveTab] = useState('register');

  // Form: Patient Registration
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState('Female');
  const [regBlood, setRegBlood] = useState('O+');
  const [regCond, setRegCond] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regAllergies, setRegAllergies] = useState('None');

  // Form: Appointment Booking
  const [bookPatName, setBookPatName] = useState('');
  const [bookDocId, setBookDocId] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('10:00 AM');
  const [bookType, setBookType] = useState('General Consultation');

  // Calculations
  const queueCount = useMemo(() => {
    return state.appointments.filter(app => app.status === 'Pending').length;
  }, [state.appointments]);

  const activeAdmissions = useMemo(() => {
    return state.patients.filter(p => p.status === 'Admitted').length;
  }, [state.patients]);

  const handleRegisterPatient = (event) => {
    event.preventDefault();
    if (!regName.trim() || !regAge.trim() || !regCond.trim()) return;

    const newPatient = {
      id: `P${Date.now()}`,
      name: regName.trim(),
      age: parseInt(regAge),
      gender: regGender,
      bloodGroup: regBlood,
      status: 'Admitted',
      room: 'Ward 10A',
      admissionDate: new Date().toISOString().slice(0, 10),
      condition: regCond.trim(),
      emergencyContact: regContact.trim() || 'N/A',
      allergies: regAllergies.trim() || 'None',
      history: [
        { date: new Date().toISOString().slice(0, 10), type: 'Admission', title: 'Admitted via Front Desk', notes: `Registered: ${regCond}` }
      ],
      prescriptions: [],
      vitals: { heartRate: 72, bpSystolic: 120, bpDiastolic: 80, oxygenSat: 98, respirationRate: 16 }
    };

    addPatient(newPatient);
    addToast(`Registered patient ${regName}.`, 'success');

    // Reset Form
    setRegName('');
    setRegAge('');
    setRegCond('');
    setRegContact('');
    setRegAllergies('None');
  };

  const handleBookAppointment = (event) => {
    event.preventDefault();
    if (!bookPatName.trim() || !bookDocId || !bookDate) return;

    const selectedDoc = state.doctors.find(d => d.id === bookDocId);
    if (!selectedDoc) return;

    const newApp = {
      id: `A${Date.now()}`,
      patientId: `P_WALK_${Date.now()}`,
      patientName: bookPatName.trim(),
      doctorId: bookDocId,
      doctorName: selectedDoc.name,
      date: bookDate,
      timeSlot: bookTime,
      status: 'Pending',
      type: bookType
    };

    bookAppointment(newApp);
    addToast(`Booked appointment for ${bookPatName}.`, 'success');

    // Reset Form
    setBookPatName('');
    setBookDocId('');
    setBookDate('');
  };

  return (
    <div className="page-shell">
      <div className="page-head">
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Front Desk System</p>
          <h1>Receptionist Dashboard</h1>
          <p className="page-subtitle">Register new admissions, schedule clinic appointments, and coordinate doctor availability.</p>
        </div>
      </div>

      <section className="dashboard-grid">
        {/* Admitted Count */}
        <article className="glass-card metric-card">
          <span className="metric-label">Active Admissions</span>
          <p className="metric-value">{activeAdmissions}</p>
          <small>beds currently occupied</small>
        </article>

        {/* Queue Count */}
        <article className="glass-card metric-card">
          <span className="metric-label">Pending Appointments</span>
          <p className="metric-value">{queueCount}</p>
          <small>appointments awaiting approval</small>
        </article>

        {/* Total Doctors */}
        <article className="glass-card metric-card">
          <span className="metric-label">Available Doctors</span>
          <p className="metric-value">{state.doctors.filter(d => d.status === 'Available').length}</p>
          <small>out of {state.doctors.length} on clinical roster</small>
        </article>
      </section>

      <section className="dashboard-grid" style={{ gridTemplateColumns: '1.6fr 1.4fr' }}>
        {/* Left Column: Interactive operational forms */}
        <article className="glass-card widget-card">
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <button 
              className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setActiveTab('register')}
              style={{ flex: 1 }}
            >
              📝 Register Admission
            </button>
            <button 
              className={`btn ${activeTab === 'book' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setActiveTab('book')}
              style={{ flex: 1 }}
            >
              📅 Schedule Appointment
            </button>
          </div>

          {activeTab === 'register' ? (
            <form onSubmit={handleRegisterPatient} className="appointment-form" style={{ padding: 0 }}>
              <h3 style={{ marginBottom: '12px' }}>New Patient Admission</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Patient full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" value={regAge} onChange={e => setRegAge(e.target.value)} required placeholder="Age in years" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={regGender} onChange={e => setRegGender(e.target.value)}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <select className="form-input" value={regBlood} onChange={e => setRegBlood(e.target.value)}>
                    <option>O+</option>
                    <option>O-</option>
                    <option>A+</option>
                    <option>A-</option>
                    <option>B+</option>
                    <option>B-</option>
                    <option>AB+</option>
                    <option>AB-</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Admission Condition</label>
                <input className="form-input" value={regCond} onChange={e => setRegCond(e.target.value)} required placeholder="Primary medical complaint" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Emergency Contact Info</label>
                  <input className="form-input" value={regContact} onChange={e => setRegContact(e.target.value)} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-group">
                  <label className="form-label">Allergies</label>
                  <input className="form-input" value={regAllergies} onChange={e => setRegAllergies(e.target.value)} placeholder="e.g. Sulfa drugs, None" />
                </div>
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '14px' }}>Register Admission Card</button>
            </form>
          ) : (
            <form onSubmit={handleBookAppointment} className="appointment-form" style={{ padding: 0 }}>
              <h3 style={{ marginBottom: '12px' }}>Book Appointment Slot</h3>
              <div className="form-group">
                <label className="form-label">Patient Name</label>
                <input className="form-input" value={bookPatName} onChange={e => setBookPatName(e.target.value)} required placeholder="Patient full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Select Medical Practitioner</label>
                <select className="form-input" value={bookDocId} onChange={e => setBookDocId(e.target.value)} required>
                  <option value="">-- Choose Doctor --</option>
                  {state.doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.specialty}) - {d.status}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={bookDate} onChange={e => setBookDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Time Slot</label>
                  <select className="form-input" value={bookTime} onChange={e => setBookTime(e.target.value)}>
                    <option>09:00 AM</option>
                    <option>10:00 AM</option>
                    <option>11:00 AM</option>
                    <option>02:00 PM</option>
                    <option>03:00 PM</option>
                    <option>04:00 PM</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Consultation Category</label>
                <select className="form-input" value={bookType} onChange={e => setBookType(e.target.value)}>
                  <option>General Consultation</option>
                  <option>Routine Checkup</option>
                  <option>Emergency Evaluation</option>
                  <option>Specialty Followup</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: '100%', marginTop: '14px' }}>Book Appointment Slot</button>
            </form>
          )}
        </article>

        {/* Right Column: Live Doctor Status & Operations Queue */}
        <div style={{ display: 'grid', gap: '20px' }}>
          <article className="glass-card widget-card">
            <h3>Doctor Availability Status</h3>
            <div style={{ display: 'grid', gap: '8px', marginTop: '12px', maxHeight: '250px', overflowY: 'auto' }}>
              {state.doctors.map(doctor => (
                <div key={doctor.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '10px', borderRadius: '8px' }}>
                  <div>
                    <strong>{doctor.name}</strong>
                    <br />
                    <small style={{ color: 'var(--text-muted)' }}>{doctor.specialty}</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={`badge badge-${doctor.status === 'Available' ? 'success' : doctor.status === 'On Leave' ? 'secondary' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                      {doctor.status}
                    </span>
                    <button 
                      className="btn btn-secondary btn-sm" 
                      onClick={() => toggleDoctorStatus(doctor.id, doctor.status === 'Available' ? 'On Leave' : 'Available')}
                      style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                    >
                      Toggle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass-card widget-card">
            <h3>Pending Walk-ins Queue ({queueCount})</h3>
            <div style={{ display: 'grid', gap: '8px', marginTop: '12px', maxHeight: '200px', overflowY: 'auto' }}>
              {state.appointments.filter(app => app.status === 'Pending').length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '10px' }}>Front desk clinic queue is clear.</p>
              ) : (
                state.appointments.filter(app => app.status === 'Pending').map(app => (
                  <div key={app.id} style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{app.patientName}</strong>
                      <div style={{ color: 'var(--text-muted)' }}>Doctor: {app.doctorName} | Time: {app.timeSlot}</div>
                    </div>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Waiting</span>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};

export default ReceptionistDashboard;
