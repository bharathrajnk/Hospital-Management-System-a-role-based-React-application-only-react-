import { useMemo, useState } from 'react';
import { useHospital } from '../context/HospitalContext.jsx';
import { PlusIcon, TrashIcon, EditIcon, SearchIcon } from '../components/Icons.jsx';

const PatientsPage = () => {
  const { state, addPatient, updatePatient, removePatient, dischargePatient, searchQuery, setSearchQuery, addToast } = useHospital();
  
  // State variables
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editPatient, setEditPatient] = useState(null);
  const [formState, setFormState] = useState({ name: '', age: '', gender: 'Female', bloodGroup: 'O+', condition: '', emergencyContact: '', allergies: '' });
  
  // Clinical History Detail Modal State
  const [selectedHistoryPatient, setSelectedHistoryPatient] = useState(null);
  const [logTitle, setLogTitle] = useState('');
  const [logContent, setLogContent] = useState('');
  const [rxMed, setRxMed] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxDuration, setRxDuration] = useState('');

  // Pagination & Loading States
  const [limit, setLimit] = useState(4);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const filteredPatients = useMemo(() => {
    const q = searchQuery || search;
    let basePatients = state.patients;
    if (state.user?.role === 'Patient' && state.user?.name) {
      basePatients = state.patients.filter(p => p.name.toLowerCase() === state.user.name.toLowerCase());
    }
    return basePatients.filter((patient) => 
      patient.name.toLowerCase().includes(q.toLowerCase()) || 
      patient.condition.toLowerCase().includes(q.toLowerCase()) ||
      patient.room.toLowerCase().includes(q.toLowerCase())
    );
  }, [state.patients, search, searchQuery, state.user]);

  const records = useMemo(() => {
    return filteredPatients.slice(0, limit);
  }, [filteredPatients, limit]);

  const openNew = () => {
    setEditPatient(null);
    setFormState({ name: '', age: '', gender: 'Female', bloodGroup: 'O+', condition: '', emergencyContact: '', allergies: '' });
    setShowForm(true);
  };

  const handleSave = (event) => {
    event.preventDefault();
    const payload = {
      ...formState,
      id: editPatient?.id || `P${Date.now()}`,
      status: 'Admitted',
      room: editPatient?.room || 'Ward 10A',
      admissionDate: editPatient?.admissionDate || new Date().toISOString().slice(0, 10),
      name: formState.name || 'Unnamed Patient',
      history: editPatient?.history || [],
      prescriptions: editPatient?.prescriptions || [],
      vitals: editPatient?.vitals || { heartRate: 72, bpSystolic: 118, bpDiastolic: 77, oxygenSat: 98, respirationRate: 16 }
    };
    if (editPatient) {
      updatePatient(editPatient.id, payload);
    } else {
      addPatient(payload);
    }
    setShowForm(false);
  };

  // Pagination trigger
  const handleLoadMore = () => {
    setIsLoadingMore(true);
    setTimeout(() => {
      setLimit((prev) => prev + 4);
      setIsLoadingMore(false);
    }, 1200);
  };

  // Add a history event log entry
  const handleAddLog = (event) => {
    event.preventDefault();
    if (!logTitle.trim() || !logContent.trim() || !selectedHistoryPatient) return;

    const newLog = {
      date: new Date().toISOString().slice(0, 10),
      type: 'Medical Note',
      title: logTitle.trim(),
      notes: logContent.trim()
    };

    updatePatient(selectedHistoryPatient.id, {
      history: [newLog, ...selectedHistoryPatient.history]
    });

    addToast(`Appended history log for ${selectedHistoryPatient.name}.`, 'success');
    setLogTitle('');
    setLogContent('');
    setSelectedHistoryPatient(prev => state.patients.find(p => p.id === prev.id));
  };

  // Add prescription entry
  const handleAddPrescription = (event) => {
    event.preventDefault();
    if (!rxMed.trim() || !rxDosage.trim() || !rxDuration.trim() || !selectedHistoryPatient) return;

    const newRx = {
      date: new Date().toISOString().slice(0, 10),
      medicine: rxMed.trim(),
      dosage: rxDosage.trim(),
      duration: rxDuration.trim(),
      status: 'Filled'
    };

    updatePatient(selectedHistoryPatient.id, {
      prescriptions: [newRx, ...selectedHistoryPatient.prescriptions]
    });

    addToast(`Prescribed ${rxMed} for ${selectedHistoryPatient.name}.`, 'success');
    setRxMed('');
    setRxDosage('');
    setRxDuration('');
    setSelectedHistoryPatient(prev => state.patients.find(p => p.id === prev.id));
  };

  return (
    <div className="page-shell">
      <div className="page-head page-head-actions">
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Patient Management</p>
          <h1>Patient Records</h1>
          <p className="page-subtitle">Search, update, and track patient admissions with one unified workflow.</p>
        </div>
        {state.user?.role !== 'Patient' && (
          <button className="btn btn-primary" onClick={openNew}>
            <PlusIcon size={16} /> Add Patient
          </button>
        )}
      </div>

      <div className="glass-card search-panel">
        <SearchIcon size={18} />
        <input 
          value={searchQuery || search} 
          onChange={(event) => {
            if (searchQuery !== '') {
              setSearchQuery(event.target.value);
            } else {
              setSearch(event.target.value);
            }
          }} 
          placeholder="Search patient by name, condition, room..." 
        />
      </div>

      <div className="table-container glass-card">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Status</th>
              <th>Room</th>
              <th>Condition</th>
              <th>Contact</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((patient) => (
              <tr className="table-row" key={patient.id}>
                <td>
                  <strong>{patient.name}</strong>
                  <br />
                  <small>{patient.age} yrs • {patient.gender}</small>
                </td>
                <td><span className={`badge badge-${patient.status === 'Admitted' ? 'success' : patient.status === 'Discharged' ? 'secondary' : 'warning'}`}>{patient.status}</span></td>
                <td>{patient.room}</td>
                <td>{patient.condition}</td>
                <td>{patient.emergencyContact}</td>
                <td className="action-cell">
                  <button 
                    className="btn btn-primary btn-sm" 
                    type="button" 
                    onClick={() => setSelectedHistoryPatient(patient)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    Clinical Chart &rarr;
                  </button>
                  {state.user?.role !== 'Patient' && (
                    <>
                      <button className="icon-button" type="button" onClick={() => { setEditPatient(patient); setFormState(patient); setShowForm(true); }}>
                        <EditIcon size={18} />
                      </button>
                      <button className="icon-button danger" type="button" onClick={() => removePatient(patient.id)}>
                        <TrashIcon size={18} />
                      </button>
                      <button className="btn btn-secondary" type="button" onClick={() => dischargePatient(patient.id)}>Discharge</button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {/* Skeleton Loading Rows */}
            {isLoadingMore && (
              <>
                {[1, 2].map((i) => (
                  <tr key={`skeleton-${i}`}>
                    <td>
                      <div className="skeleton-line" style={{ width: '120px', height: '14px' }} />
                      <div className="skeleton-line" style={{ width: '80px', height: '10px', marginTop: '6px' }} />
                    </td>
                    <td><div className="skeleton-box" style={{ width: '80px', height: '24px' }} /></td>
                    <td><div className="skeleton-line" style={{ width: '60px' }} /></td>
                    <td><div className="skeleton-line" style={{ width: '150px' }} /></td>
                    <td><div className="skeleton-line" style={{ width: '110px' }} /></td>
                    <td><div className="skeleton-box" style={{ width: '180px', height: '32px' }} /></td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Load More trigger */}
      {filteredPatients.length > limit && !isLoadingMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <button className="btn btn-secondary" type="button" onClick={handleLoadMore}>
            Load More Patient Records &darr;
          </button>
        </div>
      )}

      {/* NEW/EDIT PATIENT PROFILE MODAL */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editPatient ? 'Edit Patient Profile' : 'New Patient Entry'}</h2>
              <button className="icon-button" type="button" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form className="auth-form" onSubmit={handleSave}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" value={formState.name} onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" value={formState.age} onChange={(event) => setFormState((prev) => ({ ...prev, age: event.target.value }))} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={formState.gender} onChange={(event) => setFormState((prev) => ({ ...prev, gender: event.target.value }))}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Blood group</label>
                  <select className="form-input" value={formState.bloodGroup} onChange={(event) => setFormState((prev) => ({ ...prev, bloodGroup: event.target.value }))}>
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
                <label className="form-label">Current condition</label>
                <input className="form-input" value={formState.condition} onChange={(event) => setFormState((prev) => ({ ...prev, condition: event.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Emergency contact</label>
                <input className="form-input" value={formState.emergencyContact} onChange={(event) => setFormState((prev) => ({ ...prev, emergencyContact: event.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Allergies</label>
                <input className="form-input" value={formState.allergies} onChange={(event) => setFormState((prev) => ({ ...prev, allergies: event.target.value }))} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPREHENSIVE CLINICAL CHART DETAIL OVERLAY MODAL */}
      {selectedHistoryPatient && (
        <div className="modal-overlay" onClick={() => setSelectedHistoryPatient(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Advanced Clinical Chart</p>
                <h2>{selectedHistoryPatient.name}</h2>
                <small style={{ color: 'var(--text-muted)' }}>ID: {selectedHistoryPatient.id} • Room: {selectedHistoryPatient.room}</small>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedHistoryPatient(null)}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '20px', maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
              {/* Left Column: Vitals and Diagnosis Forms */}
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: 'var(--primary)' }}>Patient Telemetry Array</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem' }}>
                    <div>Pulse: <strong>{selectedHistoryPatient.vitals.heartRate} bpm</strong></div>
                    <div>BP: <strong>{selectedHistoryPatient.vitals.bpSystolic}/{selectedHistoryPatient.vitals.bpDiastolic}</strong></div>
                    <div>O₂ Sat: <strong>{selectedHistoryPatient.vitals.oxygenSat}%</strong></div>
                    <div>Respiration: <strong>{selectedHistoryPatient.vitals.respirationRate}/m</strong></div>
                  </div>
                  {selectedHistoryPatient.allergies && (
                    <div style={{ marginTop: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--danger)', fontWeight: 'bold' }}>Allergies: </span>
                      <strong style={{ fontSize: '0.8rem' }}>{selectedHistoryPatient.allergies}</strong>
                    </div>
                  )}
                </div>

                {/* Add Clinical Note Form */}
                <form onSubmit={handleAddLog} className="glass-card" style={{ padding: '12px', display: 'grid', gap: '8px', background: 'var(--bg-app)' }}>
                  <h4 style={{ margin: 0 }}>Add Medical Note</h4>
                  <input 
                    className="form-input" 
                    placeholder="Event/Action Title" 
                    value={logTitle} 
                    onChange={e => setLogTitle(e.target.value)} 
                    required 
                    style={{ fontSize: '0.82rem', padding: '6px' }}
                  />
                  <textarea 
                    className="form-input" 
                    placeholder="Clinical notes context..." 
                    value={logContent} 
                    onChange={e => setLogContent(e.target.value)} 
                    required 
                    rows="3" 
                    style={{ fontSize: '0.82rem', padding: '6px' }}
                  />
                  <button className="btn btn-primary btn-sm" type="submit">Append Log</button>
                </form>

                {/* Add Prescription Form */}
                <form onSubmit={handleAddPrescription} className="glass-card" style={{ padding: '12px', display: 'grid', gap: '8px', background: 'var(--bg-app)' }}>
                  <h4 style={{ margin: 0 }}>Issue Live Prescription</h4>
                  <input 
                    className="form-input" 
                    placeholder="Medicine Name" 
                    value={rxMed} 
                    onChange={e => setRxMed(e.target.value)} 
                    required 
                    style={{ fontSize: '0.82rem', padding: '6px' }}
                  />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      className="form-input" 
                      placeholder="Dosage (e.g. 1-0-1)" 
                      value={rxDosage} 
                      onChange={e => setRxDosage(e.target.value)} 
                      required 
                      style={{ fontSize: '0.82rem', padding: '6px', width: '50%' }}
                    />
                    <input 
                      className="form-input" 
                      placeholder="Duration" 
                      value={rxDuration} 
                      onChange={e => setRxDuration(e.target.value)} 
                      required 
                      style={{ fontSize: '0.82rem', padding: '6px', width: '50%' }}
                    />
                  </div>
                  <button className="btn btn-success btn-sm" type="submit">Prescribe Rx</button>
                </form>
              </div>

              {/* Right Column: Historical logs and prescriptions list */}
              <div style={{ display: 'grid', gap: '16px' }}>
                {/* Historical Timeline */}
                <div>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Consultation & History Timeline</h4>
                  <div style={{ display: 'grid', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {selectedHistoryPatient.history.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No clinical logs registered.</p>
                    ) : (
                      selectedHistoryPatient.history.map((log, idx) => (
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
                    {selectedHistoryPatient.prescriptions.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No active prescriptions written.</p>
                    ) : (
                      selectedHistoryPatient.prescriptions.map((rx, idx) => (
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

export default PatientsPage;
