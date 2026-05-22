import { useState, useMemo } from 'react';
import { useHospital } from '../../context/HospitalContext.jsx';
import { SearchIcon, CalendarIcon, UsersIcon } from '../../components/Icons.jsx';

const DoctorDashboard = () => {
  const { state, updatePatient, approveAppointment, addToast } = useHospital();
  const user = state.user;

  // Modal patient selection state
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [newMed, setNewMed] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newDuration, setNewDuration] = useState('');

  // Filter today's appointments for this doctor
  const appointments = useMemo(() => {
    if (!user) return [];
    return state.appointments.filter(
      (app) => 
        app.doctorName.toLowerCase().includes(user.name.toLowerCase()) ||
        app.doctorId === user.id
    );
  }, [state.appointments, user]);

  // Extract unique patients assigned to this doctor
  const assignedPatients = useMemo(() => {
    const patientNames = new Set(appointments.map(a => a.patientName));
    return state.patients.filter(p => patientNames.has(p.name) || p.prescriptions.some(pr => pr.doctorName === user?.name));
  }, [state.patients, appointments, user]);

  // Telemetry alerts
  const criticalAlerts = useMemo(() => {
    return state.patients.filter(p => p.vitals.oxygenSat < 94 || p.vitals.bpSystolic > 140);
  }, [state.patients]);

  const handleAddNote = (event) => {
    event.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim() || !selectedPatient) return;

    const newLog = {
      date: new Date().toISOString().slice(0, 10),
      type: 'Consultation',
      title: noteTitle,
      notes: noteContent
    };

    updatePatient(selectedPatient.id, {
      history: [newLog, ...selectedPatient.history]
    });

    addToast(`Added clinical note for ${selectedPatient.name}.`, 'success');
    setNoteTitle('');
    setNoteContent('');
    // Refresh modal patient data
    setSelectedPatient(prev => state.patients.find(p => p.id === prev.id));
  };

  const handleAddPrescription = (event) => {
    event.preventDefault();
    if (!newMed.trim() || !newDosage.trim() || !newDuration.trim() || !selectedPatient) return;

    const newRx = {
      date: new Date().toISOString().slice(0, 10),
      medicine: newMed,
      dosage: newDosage,
      duration: newDuration,
      status: 'Filled',
      doctorName: user?.name || 'Dr. Faf du Plessis'
    };

    updatePatient(selectedPatient.id, {
      prescriptions: [newRx, ...selectedPatient.prescriptions]
    });

    addToast(`Prescribed ${newMed} to ${selectedPatient.name}.`, 'success');
    setNewMed('');
    setNewDosage('');
    setNewDuration('');
    // Refresh modal patient data
    setSelectedPatient(prev => state.patients.find(p => p.id === prev.id));
  };

  const handleStabilize = (patientId) => {
    updatePatient(patientId, {
      vitals: {
        heartRate: 72,
        bpSystolic: 120,
        bpDiastolic: 80,
        oxygenSat: 98,
        respirationRate: 16
      }
    });
    addToast('Patient vitals stabilized.', 'success');
  };

  return (
    <div className="page-shell">
      <header className="page-head">
        <p className="eyebrow">Medical Portal</p>
        <h1>Clinical Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name || 'Doctor'}. Manage your clinical roster and track telemetry alerts.</p>
      </header>

      {/* Metrics Section */}
      <section className="metrics-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <article className="glass-card metric-card">
          <CalendarIcon size={24} style={{ color: 'var(--primary)' }} />
          <div>
            <p className="metric-label">Today's Schedule</p>
            <h2 className="metric-value">{appointments.filter(a => a.status === 'Approved').length}</h2>
          </div>
          <small className="metric-trend success" style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
            {appointments.filter(a => a.status === 'Pending').length} pending approvals
          </small>
        </article>

        <article className="glass-card metric-card">
          <UsersIcon size={24} style={{ color: 'var(--success)' }} />
          <div>
            <p className="metric-label">My Active Patients</p>
            <h2 className="metric-value">{assignedPatients.length}</h2>
          </div>
          <small className="metric-trend success" style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
            patients in your care circle
          </small>
        </article>

        <article className="glass-card metric-card" style={{ borderColor: criticalAlerts.length > 0 ? 'var(--danger)' : 'var(--border-color)' }}>
          <div className={`telemetry-ping ${criticalAlerts.length > 0 ? 'active' : ''}`} style={{ width: '12px', height: '12px', borderRadius: '50%', background: criticalAlerts.length > 0 ? 'var(--danger)' : 'var(--success)', boxShadow: criticalAlerts.length > 0 ? '0 0 10px var(--danger)' : 'none' }}></div>
          <div>
            <p className="metric-label">Emergency Telemetry Alerts</p>
            <h2 className="metric-value">{criticalAlerts.length}</h2>
          </div>
          <small className="metric-trend danger" style={{ alignSelf: 'flex-end', marginLeft: 'auto' }}>
            {criticalAlerts.length > 0 ? 'Urgent care response flagged' : 'Vitals telemetry stable'}
          </small>
        </article>
      </section>

      <section className="dashboard-grid" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
        {/* Today's appointments schedule list */}
        <article className="glass-card widget-card">
          <h3>Daily Consultation Schedule</h3>
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            {appointments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>No appointments scheduled for today.</p>
            ) : (
              appointments.map((app) => (
                <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
                  <div>
                    <strong style={{ display: 'block' }}>{app.patientName}</strong>
                    <small style={{ color: 'var(--text-muted)' }}>{app.timeSlot} • {app.type}</small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge badge-${app.status === 'Approved' ? 'success' : app.status === 'Pending' ? 'warning' : 'secondary'}`} style={{ fontSize: '0.7rem' }}>
                      {app.status}
                    </span>
                    {app.status === 'Pending' && (
                      <button 
                        className="btn btn-primary btn-sm" 
                        type="button" 
                        onClick={() => approveAppointment(app.id)}
                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        {/* Roster list */}
        <article className="glass-card widget-card">
          <h3>Patient Care Roster</h3>
          <div className="table-container" style={{ marginTop: '16px' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age/Gender</th>
                  <th>Blood Group</th>
                  <th>Condition</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignedPatients.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No patient records assigned.</td>
                  </tr>
                ) : (
                  assignedPatients.map((patient) => (
                    <tr key={patient.id} className="table-row">
                      <td><strong>{patient.name}</strong></td>
                      <td>{patient.age} yrs / {patient.gender}</td>
                      <td>{patient.bloodGroup}</td>
                      <td>{patient.condition}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-primary btn-sm" 
                          type="button" 
                          onClick={() => setSelectedPatient(patient)}
                        >
                          Open Chart &rarr;
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      {/* Emergency Alerts Feed */}
      {criticalAlerts.length > 0 && (
        <section className="dashboard-grid" style={{ marginTop: '20px' }}>
          <article className="glass-card widget-card emergency-flashing-active">
            <h3 style={{ color: 'var(--danger)' }}>🚨 Urgent Telemetry Triggers</h3>
            <div style={{ display: 'grid', gap: '14px', marginTop: '16px' }}>
              {criticalAlerts.map(patient => (
                <div key={patient.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div>
                    <strong>{patient.name} (Room {patient.room})</strong>
                    <br />
                    <small style={{ color: 'var(--danger)' }}>
                      SpO₂: {patient.vitals.oxygenSat}% | BP: {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                    </small>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPatient(patient)}>Open Chart</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleStabilize(patient.id)}>Stabilize</button>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      )}

      {/* PATIENT CHART DETAIL MODAL */}
      {selectedPatient && (
        <div className="modal-overlay" onClick={() => setSelectedPatient(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Patient Clinical Chart</p>
                <h2>{selectedPatient.name}</h2>
                <small style={{ color: 'var(--text-muted)' }}>ID: {selectedPatient.id} • Room: {selectedPatient.room}</small>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedPatient(null)}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
              {/* Left Column: Vitals and Diagnosis Forms */}
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Telemetry Vitals</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                    <div>Pulse: <strong>{selectedPatient.vitals.heartRate} bpm</strong></div>
                    <div>BP: <strong>{selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic}</strong></div>
                    <div>O₂ Sat: <strong>{selectedPatient.vitals.oxygenSat}%</strong></div>
                    <div>Respiration: <strong>{selectedPatient.vitals.respirationRate}/m</strong></div>
                  </div>
                  {selectedPatient.allergies && (
                    <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--danger)', fontWeight: 'bold' }}>Allergies: </span>
                      <strong style={{ fontSize: '0.8rem' }}>{selectedPatient.allergies}</strong>
                    </div>
                  )}
                </div>

                {/* Add Clinical Note Form */}
                <form onSubmit={handleAddNote} className="glass-card" style={{ padding: '12px', display: 'grid', gap: '8px', background: 'var(--bg-app)' }}>
                  <h4 style={{ margin: 0 }}>Add Consultation Note</h4>
                  <input 
                    className="form-input" 
                    placeholder="Note Title (e.g. Follow-up Exam)" 
                    value={noteTitle} 
                    onChange={e => setNoteTitle(e.target.value)} 
                    required 
                    style={{ fontSize: '0.82rem', padding: '6px' }}
                  />
                  <textarea 
                    className="form-input" 
                    placeholder="Detailed clinical observation notes..." 
                    value={noteContent} 
                    onChange={e => setNoteContent(e.target.value)} 
                    required 
                    rows="3" 
                    style={{ fontSize: '0.82rem', padding: '6px' }}
                  />
                  <button className="btn btn-primary btn-sm" type="submit">Log Consultation</button>
                </form>

                {/* Add Prescription Form */}
                <form onSubmit={handleAddPrescription} className="glass-card" style={{ padding: '12px', display: 'grid', gap: '8px', background: 'var(--bg-app)' }}>
                  <h4 style={{ margin: 0 }}>Write Prescription</h4>
                  <input 
                    className="form-input" 
                    placeholder="Medicine Name" 
                    value={newMed} 
                    onChange={e => setNewMed(e.target.value)} 
                    required 
                    style={{ fontSize: '0.82rem', padding: '6px' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      className="form-input" 
                      placeholder="Dosage (e.g. 1-0-1)" 
                      value={newDosage} 
                      onChange={e => setNewDosage(e.target.value)} 
                      required 
                      style={{ fontSize: '0.82rem', padding: '6px', width: '50%' }}
                    />
                    <input 
                      className="form-input" 
                      placeholder="Duration" 
                      value={newDuration} 
                      onChange={e => setNewDuration(e.target.value)} 
                      required 
                      style={{ fontSize: '0.82rem', padding: '6px', width: '50%' }}
                    />
                  </div>
                  <button className="btn btn-success btn-sm" type="submit">Issue RX</button>
                </form>
              </div>

              {/* Right Column: Historical logs and prescriptions list */}
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Historical Timeline */}
                <div>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Consultation & History Timeline</h4>
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedPatient.history.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No clinical logs registered.</p>
                    ) : (
                      selectedPatient.history.map((log, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <strong>{log.title}</strong>
                            <small style={{ color: 'var(--text-muted)' }}>{log.date} ({log.type})</small>
                          </div>
                          <p style={{ margin: 0, color: 'var(--text-muted)' }}>{log.notes}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Prescriptions List */}
                <div>
                  <h4 style={{ color: 'var(--success)', marginBottom: '8px' }}>Active Prescribed Medications</h4>
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedPatient.prescriptions.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No active prescriptions written.</p>
                    ) : (
                      selectedPatient.prescriptions.map((rx, idx) => (
                        <div key={idx} style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                          <div>
                            <strong>{rx.medicine}</strong>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Dosage: {rx.dosage} | Duration: {rx.duration}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{rx.status}</span>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>{rx.date}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
