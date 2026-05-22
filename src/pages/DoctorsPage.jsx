import { useMemo, useState } from 'react';
import { useHospital } from '../context/HospitalContext.jsx';
import { SearchIcon, PlusIcon } from '../components/Icons.jsx';

const DoctorsPage = () => {
  const { state, toggleDoctorStatus, addDoctor, searchQuery, setSearchQuery } = useHospital();
  const [query, setQuery] = useState('');
  
  // Add provider form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');

  // Selected Doctor Detail State
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const visibleDoctors = useMemo(() => {
    const q = searchQuery || query;
    return state.doctors.filter((doctor) => 
      doctor.name.toLowerCase().includes(q.toLowerCase()) || 
      doctor.specialty.toLowerCase().includes(q.toLowerCase())
    );
  }, [state.doctors, query, searchQuery]);

  const handleSaveProvider = (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    addDoctor({
      id: `D${Date.now()}`,
      name: name.startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`,
      specialty,
      rating: 5.0,
      consultations: 0,
      status: 'Available',
      performance: { patientsTreated: 0, avgSessionTime: 15 }
    });

    setShowAddForm(false);
    setName('');
    setSpecialty('Cardiology');
  };

  // Find active appointments for selected doctor
  const doctorAppointments = useMemo(() => {
    if (!selectedDoctor) return [];
    return state.appointments.filter(app => 
      app.doctorId === selectedDoctor.id ||
      app.doctorName.toLowerCase().includes(selectedDoctor.name.toLowerCase())
    );
  }, [state.appointments, selectedDoctor]);

  return (
    <div className="page-shell">
      <div className="page-head page-head-actions">
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Doctor Operations</p>
          <h1>Clinical Staff Roster</h1>
          <p className="page-subtitle">Manage department allocations, availability status, and daily performance dashboards.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
          <PlusIcon size={16} /> New Provider
        </button>
      </div>

      <div className="glass-card search-panel">
        <SearchIcon size={18} />
        <input 
          value={searchQuery || query} 
          onChange={(event) => {
            if (searchQuery !== '') {
              setSearchQuery(event.target.value);
            } else {
              setQuery(event.target.value);
            }
          }} 
          placeholder="Search by doctor or specialty..." 
        />
      </div>

      <div className="dashboard-grid doctor-grid">
        {visibleDoctors.map((doctor) => (
          <div 
            key={doctor.id} 
            className={`glass-card doctor-card ${doctor.status === 'Available' ? 'emergency-flashing-active' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedDoctor(doctor)}
          >
            <div className="doctor-card-top">
              <div>
                <h3>{doctor.name}</h3>
                <p style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>{doctor.specialty}</p>
              </div>
              <span className={`badge badge-${doctor.status === 'Available' ? 'success' : doctor.status === 'On Leave' ? 'secondary' : 'warning'}`}>{doctor.status}</span>
            </div>
            <div className="doctor-stats" style={{ margin: '14px 0' }}>
              <div>
                <strong>{doctor.consultations}</strong>
                <small>consultations</small>
              </div>
              <div>
                <strong>{doctor.performance.patientsTreated}</strong>
                <small>treated</small>
              </div>
              <div>
                <strong>{doctor.performance.avgSessionTime}m</strong>
                <small>avg consult</small>
              </div>
            </div>
            <div className="doctor-actions" onClick={(e) => e.stopPropagation()}>
              <button 
                className="btn btn-secondary" 
                type="button" 
                onClick={() => toggleDoctorStatus(doctor.id, doctor.status === 'Available' ? 'On Leave' : 'Available')}
                style={{ width: '100%' }}
              >
                {doctor.status === 'Available' ? 'Set Leave' : 'Set Available'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NEW CLINICAL STAFF PROVIDER MODAL */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>Add Clinical Provider</h2>
              <button className="icon-button" type="button" onClick={() => setShowAddForm(false)}>&times;</button>
            </div>
            <form className="auth-form" onSubmit={handleSaveProvider}>
              <div className="form-group">
                <label className="form-label">Doctor Name</label>
                <input 
                  className="form-input" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Sanjay Gupta" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Specialty Department</label>
                <select 
                  className="form-input" 
                  value={specialty} 
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option>Cardiology</option>
                  <option>Neurology</option>
                  <option>Pediatrics</option>
                  <option>Orthopedics</option>
                  <option>General Medicine</option>
                  <option>Oncology</option>
                  <option>Gynaecology</option>
                </select>
              </div>
              <div className="form-actions" style={{ marginTop: '20px' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button className="btn btn-primary" type="submit">Save Provider</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED CLINICAL STAFF PERFORMANCE OVERLAY MODAL */}
      {selectedDoctor && (
        <div className="modal-overlay" onClick={() => setSelectedDoctor(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Staff Profile & Analytics</p>
                <h2>{selectedDoctor.name}</h2>
                <small style={{ color: 'var(--text-muted)' }}>{selectedDoctor.specialty} Department</small>
              </div>
              <button className="icon-button" type="button" onClick={() => setSelectedDoctor(null)}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Performance Indicator Cards */}
              <div className="doctor-stats" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>★ {selectedDoctor.rating.toFixed(1)}</strong>
                  <small style={{ display: 'block', color: 'var(--text-muted)' }}>Roster Score</small>
                </div>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--success)' }}>{selectedDoctor.performance.patientsTreated}</strong>
                  <small style={{ display: 'block', color: 'var(--text-muted)' }}>Cured Patients</small>
                </div>
                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--warning)' }}>{selectedDoctor.performance.avgSessionTime} mins</strong>
                  <small style={{ display: 'block', color: 'var(--text-muted)' }}>Avg session time</small>
                </div>
              </div>

              {/* Consultation History Table */}
              <div>
                <h4 style={{ marginBottom: '10px', color: 'var(--primary)' }}>Current Patient Consultation Schedule</h4>
                <div className="table-container" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Slot</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctorAppointments.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '12px' }}>No consultations assigned in this slot.</td>
                        </tr>
                      ) : (
                        doctorAppointments.map(app => (
                          <tr key={app.id} className="table-row">
                            <td><strong>{app.patientName}</strong></td>
                            <td>{app.date} • {app.timeSlot}</td>
                            <td>{app.type}</td>
                            <td style={{ textAlign: 'right' }}>
                              <span className={`badge badge-${app.status === 'Approved' ? 'success' : 'warning'}`}>{app.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setSelectedDoctor(null)}>Close Profile</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorsPage;
