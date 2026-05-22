import { useMemo, useState } from 'react';
import { useHospital } from '../../context/HospitalContext.jsx';
import { SearchIcon, UsersIcon, DoctorIcon, CalendarIcon } from '../../components/Icons.jsx';

const AdminDashboard = () => {
  const { state, toggleWidget, dischargePatient, toggleDoctorStatus, approveAppointment, updatePatient } = useHospital();
  
  // Modal toggle state
  const [activeModal, setActiveModal] = useState(null); // 'patients' | 'doctors' | 'appointments' | 'emergencies' | 'report' | null
  const [modalSearch, setModalSearch] = useState('');
  const [showWorkspaceConfig, setShowWorkspaceConfig] = useState(false);

  const totals = useMemo(() => ({
    patients: state.patients.length,
    doctors: state.doctors.filter((doctor) => doctor.status === 'Available').length,
    appointments: state.appointments.length,
    emergencies: state.patients.filter((patient) => patient.vitals.oxygenSat < 94 || patient.vitals.bpSystolic > 140).length,
    revenue: state.billing.reduce((sum, invoice) => sum + invoice.totalAmount, 0),
    bedsAvailable: 54 - state.patients.filter((patient) => patient.status === 'Admitted').length
  }), [state.patients, state.doctors, state.appointments, state.billing]);

  const topDoctor = useMemo(() => state.doctors.reduce((best, doctor) => (!best || doctor.rating > best.rating ? doctor : best), null), [state.doctors]);

  // Vitals stabilizer helper for simulated treatment inside emergency modal
  const handleStabilizeVitals = (patientId) => {
    updatePatient(patientId, {
      vitals: {
        heartRate: 74,
        bpSystolic: 120,
        bpDiastolic: 80,
        oxygenSat: 99,
        respirationRate: 16
      }
    });
  };

  return (
    <div className="page-shell">
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Admin Dashboard</p>
          <h1>Enterprise Health Operations</h1>
          <p className="page-subtitle">Live monitoring, appointment insights, and analytics from the hospital command center.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-primary" 
            type="button" 
            onClick={() => setActiveModal('report')}
          >
            📊 Generate Operations Report
          </button>
          <button 
            className="btn btn-secondary" 
            type="button" 
            onClick={() => setShowWorkspaceConfig(!showWorkspaceConfig)}
          >
            ⚙️ Configure Workspace
          </button>
        </div>
      </div>

      {/* WORKSPACE CONFIGURATION CARD */}
      {showWorkspaceConfig && (
        <article className="glass-card" style={{ marginBottom: '20px', padding: '20px', border: '1px solid var(--primary-glow)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ margin: 0 }}>⚙️ Configure Dashboard Widgets</h3>
            <button className="btn btn-sm btn-secondary" type="button" onClick={() => setShowWorkspaceConfig(false)}>Close</button>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Toggle which operational modules are rendered on your main dashboard layout.</p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={!!state.widgetSettings.revenueChart} onChange={() => toggleWidget('revenueChart')} />
              <span>Revenue Analytics Chart</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={!!state.widgetSettings.bedCounter} onChange={() => toggleWidget('bedCounter')} />
              <span>Bed Availability Card</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
              <input type="checkbox" checked={!!state.widgetSettings.activityFeed} onChange={() => toggleWidget('activityFeed')} />
              <span>Hospital Activity Feed</span>
            </label>
          </div>
        </article>
      )}

      <section className="dashboard-grid">
        <article 
          className="glass-card metric-card" 
          onClick={() => { setActiveModal('patients'); setModalSearch(''); }} 
          style={{ cursor: 'pointer' }}
        >
          <span className="metric-label">Total Patients</span>
          <p className="metric-value">{totals.patients}</p>
          <small style={{ color: 'var(--primary)', fontWeight: 'bold' }}>
            {state.patients.filter((patient) => patient.status === 'Admitted').length} admitted now &rarr;
          </small>
        </article>

        <article 
          className="glass-card metric-card" 
          onClick={() => { setActiveModal('doctors'); setModalSearch(''); }} 
          style={{ cursor: 'pointer' }}
        >
          <span className="metric-label">Available Doctors</span>
          <p className="metric-value">{totals.doctors}</p>
          <small style={{ color: 'var(--success)', fontWeight: 'bold' }}>
            View clinical staff roster &rarr;
          </small>
        </article>

        <article 
          className="glass-card metric-card" 
          onClick={() => { setActiveModal('appointments'); setModalSearch(''); }} 
          style={{ cursor: 'pointer' }}
        >
          <span className="metric-label">Appointments</span>
          <p className="metric-value">{totals.appointments}</p>
          <small style={{ color: 'var(--warning)', fontWeight: 'bold' }}>
            {state.appointments.filter((appointment) => appointment.status === 'Pending').length} pending approvals &rarr;
          </small>
        </article>

        <article 
          className="glass-card metric-card emergency-flashing-active" 
          onClick={() => { setActiveModal('emergencies'); setModalSearch(''); }} 
          style={{ cursor: 'pointer' }}
        >
          <span className="metric-label">Emergency Alerts</span>
          <p className="metric-value">{totals.emergencies}</p>
          <small style={{ color: 'var(--danger)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {totals.emergencies > 0 ? 'CRITICAL ACTION REQUIRED ⚡' : 'All systems normal &rarr;'}
          </small>
        </article>
      </section>

      <section className="dashboard-grid">
        {state.widgetSettings.revenueChart && (
          <article className="glass-card widget-card">
            <div className="widget-head">
              <h3>Revenue Analytics</h3>
              <button className="btn btn-secondary" type="button" onClick={() => toggleWidget('revenueChart')}>Hide Widget</button>
            </div>
            <div className="analytics-chart">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May'].map((month, index) => {
                const value = [72000, 82000, 76000, 91000, 98000][index];
                return (
                  <div key={month} className="chart-column">
                    <span>{month}</span>
                    <div className="chart-bar" style={{ height: `${Math.min(100, value / 1200)}%` }} />
                    <small>₹{(value / 1000).toFixed(0)}k</small>
                  </div>
                );
              })}
            </div>
          </article>
        )}

        {state.widgetSettings.bedCounter && (
          <article className="glass-card widget-card">
            <div className="widget-head">
              <h3>Bed Availability</h3>
              <button className="btn btn-secondary" type="button" onClick={() => toggleWidget('bedCounter')}>Hide Widget</button>
            </div>
            <div className="bed-availability">
              <p className="metric-value">{totals.bedsAvailable}</p>
              <small>beds currently free in ward network (out of 54 total capacity)</small>
              <div className="progress-bar-container" style={{ marginTop: '16px' }}>
                <div className="progress-bar">
                  <span style={{ width: `${((54 - totals.bedsAvailable) / 54) * 100}%`, background: 'var(--primary)' }} />
                </div>
              </div>
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>Occupancy Rate: {Math.round(((54 - totals.bedsAvailable) / 54) * 100)}%</small>
            </div>
          </article>
        )}
      </section>

      <section className="dashboard-grid">
        {state.widgetSettings.activityFeed && (
          <article className="glass-card widget-card">
            <div className="widget-head">
              <h3>Activity Feed</h3>
              <button className="btn btn-secondary" type="button" onClick={() => toggleWidget('activityFeed')}>Hide Widget</button>
            </div>
            <div className="activity-feed" style={{ display: 'grid', gap: '10px' }}>
              {state.activityLogs.slice(0, 5).map((entry) => (
                <div key={entry.id} className="activity-item">
                  <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <p>{entry.action}</p>
                  <small>{entry.notes}</small>
                </div>
              ))}
            </div>
          </article>
        )}

        <article className="glass-card widget-card">
          <div className="widget-head">
            <h3>Top Doctor Spotlight</h3>
          </div>
          <div className="doctor-spotlight" style={{ width: '100%' }}>
            <h2>{topDoctor?.name || 'No data'}</h2>
            <p style={{ color: 'var(--primary)', fontWeight: '600', marginBottom: '8px' }}>{topDoctor?.specialty}</p>
            <div className="doctor-stats">
              <div>
                <strong>★ {topDoctor?.rating}</strong>
                <small>Rating</small>
              </div>
              <div>
                <strong>{topDoctor?.consultations}</strong>
                <small>Cases</small>
              </div>
              <div>
                <strong style={{ color: 'var(--success)' }}>Available</strong>
                <small>Status</small>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* DASHBOARD CARD DETAIL WINDOW MODALS */}
      {activeModal && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: activeModal === 'report' ? '700px' : '800px' }}>
            <div className="modal-header">
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Command Center Window</p>
                <h2>
                  {activeModal === 'patients' && 'Total Patient Registry'}
                  {activeModal === 'doctors' && 'Clinical Staff Directory'}
                  {activeModal === 'appointments' && 'Appointment Approval Desk'}
                  {activeModal === 'emergencies' && 'Emergency AI Vitals Monitor'}
                  {activeModal === 'report' && 'Daily Operations & Clinical Report'}
                </h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveModal(null)} style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</button>
            </div>

            {/* Modal Internal Search */}
            {activeModal !== 'emergencies' && activeModal !== 'report' && (
              <div className="glass-card search-panel" style={{ marginBottom: '16px', padding: '10px 16px' }}>
                <SearchIcon size={18} />
                <input 
                  value={modalSearch} 
                  onChange={(e) => setModalSearch(e.target.value)} 
                  placeholder={
                    activeModal === 'patients' ? "Search by patient name, condition or status..." :
                    activeModal === 'doctors' ? "Search by clinical provider name or specialty..." :
                    "Search by patient name or doctor name..."
                  }
                  style={{ width: '100%', fontSize: '0.9rem' }}
                />
              </div>
            )}

            {/* Patients Modal */}
            {activeModal === 'patients' && (
              <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="custom-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Status</th>
                      <th>Room</th>
                      <th>Current Condition</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.patients
                      .filter(patient => 
                        patient.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        patient.condition.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        patient.status.toLowerCase().includes(modalSearch.toLowerCase())
                      )
                      .map((patient) => (
                        <tr key={patient.id} className="table-row">
                          <td>
                            <strong>{patient.name}</strong>
                            <br />
                            <small>{patient.age} yrs • {patient.gender}</small>
                          </td>
                          <td>
                            <span className={`badge badge-${patient.status === 'Admitted' ? 'success' : 'secondary'}`}>
                              {patient.status}
                            </span>
                          </td>
                          <td>{patient.room}</td>
                          <td>{patient.condition}</td>
                          <td style={{ textAlign: 'right' }}>
                            {patient.status === 'Admitted' && (
                              <button 
                                className="btn btn-secondary btn-sm" 
                                type="button" 
                                onClick={() => dischargePatient(patient.id)}
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                Discharge
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Doctors Modal */}
            {activeModal === 'doctors' && (
              <div className="dashboard-grid doctor-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', maxHeight: '400px', overflowY: 'auto', gap: '12px' }}>
                {state.doctors
                  .filter(doctor => 
                    doctor.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
                    doctor.specialty.toLowerCase().includes(modalSearch.toLowerCase())
                  )
                  .map((doctor) => (
                    <div key={doctor.id} className="glass-card doctor-card" style={{ padding: '16px', background: 'var(--bg-app)' }}>
                      <div className="doctor-card-top" style={{ marginBottom: '8px' }}>
                        <div>
                          <h4 style={{ margin: 0 }}>{doctor.name}</h4>
                          <small style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{doctor.specialty}</small>
                        </div>
                        <span className={`badge badge-${doctor.status === 'Available' ? 'success' : doctor.status === 'On Leave' ? 'secondary' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                          {doctor.status}
                        </span>
                      </div>
                      <div className="doctor-stats" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', marginBottom: '12px' }}>
                        <div>
                          <strong>★ {doctor.rating}</strong>
                          <small>Rating</small>
                        </div>
                        <div>
                          <strong>{doctor.consultations}</strong>
                          <small>Cases</small>
                        </div>
                      </div>
                      <button 
                        className="btn btn-secondary" 
                        type="button" 
                        onClick={() => toggleDoctorStatus(doctor.id, doctor.status === 'Available' ? 'On Leave' : 'Available')}
                        style={{ width: '100%', padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        {doctor.status === 'Available' ? 'Set On Leave' : 'Set Available'}
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* Appointments Modal */}
            {activeModal === 'appointments' && (
              <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <table className="custom-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Assigned Doctor</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.appointments
                      .filter(app => 
                        app.patientName.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        app.doctorName.toLowerCase().includes(modalSearch.toLowerCase())
                      )
                      .map((app) => (
                        <tr key={app.id} className="table-row">
                          <td>
                            <strong>{app.patientName}</strong>
                            <br />
                            <small>{app.type}</small>
                          </td>
                          <td>{app.doctorName}</td>
                          <td>{app.date} • {app.timeSlot}</td>
                          <td>
                            <span className={`badge badge-${app.status === 'Approved' ? 'success' : 'warning'}`}>
                              {app.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            {app.status === 'Pending' && (
                              <button 
                                className="btn btn-primary" 
                                type="button" 
                                onClick={() => approveAppointment(app.id)}
                                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Emergencies Modal */}
            {activeModal === 'emergencies' && (
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {state.patients.filter((p) => p.vitals.oxygenSat < 94 || p.vitals.bpSystolic > 140).length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '1.1rem' }}>🎉 All patient vitals are stabilized! No active emergency alerts.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '16px' }}>
                    {state.patients
                      .filter((patient) => patient.vitals.oxygenSat < 94 || patient.vitals.bpSystolic > 140)
                      .map((patient) => {
                        const isO2Low = patient.vitals.oxygenSat < 94;
                        const isBPHigh = patient.vitals.bpSystolic > 140;
                        return (
                          <div key={patient.id} className="glass-card emergency-flashing-active" style={{ padding: '18px', background: 'var(--bg-app)', display: 'grid', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div>
                                <h3 style={{ margin: 0, color: 'var(--danger)' }}>🚨 {patient.name}</h3>
                                <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem' }}>Room {patient.room} • {patient.condition}</p>
                              </div>
                              <span className="badge badge-danger">Critical</span>
                            </div>
                            
                            {/* Live Telemetry Display */}
                            <div className="doctor-stats" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                              <div>
                                <strong style={{ color: patient.vitals.heartRate > 100 ? 'var(--danger)' : 'var(--text-main)' }}>
                                  {patient.vitals.heartRate} bpm
                                </strong>
                                <small>Pulse</small>
                              </div>
                              <div>
                                <strong style={{ color: isBPHigh ? 'var(--danger)' : 'var(--text-main)' }}>
                                  {patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}
                                </strong>
                                <small>Blood Pressure</small>
                              </div>
                              <div>
                                <strong style={{ color: isO2Low ? 'var(--danger)' : 'var(--text-main)' }}>
                                  {patient.vitals.oxygenSat}%
                                </strong>
                                <small>O₂ Saturation</small>
                              </div>
                              <div>
                                <strong>{patient.vitals.respirationRate}/m</strong>
                                <small>Respiration</small>
                              </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <small style={{ color: 'var(--text-muted)' }}>
                                Emergency contact: {patient.emergencyContact}
                              </small>
                              <button 
                                className="btn btn-danger" 
                                type="button" 
                                onClick={() => handleStabilizeVitals(patient.id)}
                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                              >
                                Stabilize Vitals ⚡
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            )}

            {/* Operations Report Modal */}
            {activeModal === 'report' && (
              <div>
                <div id="printable-area" style={{ border: '1px solid var(--border-color)', padding: '24px', borderRadius: '12px', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                    <div>
                      <h2 style={{ margin: 0, color: 'var(--primary)' }}>HealthPro Clinical Command Center</h2>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>DAILY CLINICAL & OPERATIONS REPORT</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <strong>Date:</strong> {new Date().toLocaleDateString('en-IN')}<br />
                      <strong>Time:</strong> {new Date().toLocaleTimeString('en-IN')}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>Patient Registry Status</h4>
                      <div>• Total Patients Registered: <strong>{totals.patients}</strong></div>
                      <div>• Currently Admitted: <strong>{state.patients.filter(p => p.status === 'Admitted').length}</strong></div>
                      <div>• Discharged to Date: <strong>{state.patients.filter(p => p.status === 'Discharged').length}</strong></div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--success)' }}>Clinical Staff Status</h4>
                      <div>• Available Doctors: <strong>{totals.doctors}</strong></div>
                      <div>• Total Medical Personnel: <strong>{state.doctors.length}</strong></div>
                      <div>• Active Consultations: <strong>{state.doctors.filter(d => d.status === 'In Consultation').length}</strong></div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--warning)' }}>Bed Occupancy metrics</h4>
                      <div>• Bed Allocation Capacity: <strong>54 Beds</strong></div>
                      <div>• Available Free Beds: <strong>{totals.bedsAvailable}</strong></div>
                      <div>• Occupancy Percentage: <strong>{Math.round(((54 - totals.bedsAvailable) / 54) * 100)}%</strong></div>
                    </div>
                    <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary)' }}>Revenue & Financials</h4>
                      <div>• Total Gross Invoiced: <strong>₹{totals.revenue.toLocaleString('en-IN')}</strong></div>
                      <div>• Outstanding Invoices: <strong>{state.billing.filter(b => b.status !== 'Paid').length}</strong></div>
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                    <h4 style={{ margin: '0 0 8px 0', color: 'var(--danger)' }}>Active System Emergency Indicators</h4>
                    <div>• Active Critical Alerts: <strong>{totals.emergencies}</strong></div>
                    {totals.emergencies > 0 ? (
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--danger)' }}>🚨 Attention: Bio-sensors report threshold breaches on cardiac telemetry beds.</p>
                    ) : (
                      <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--success)' }}>✓ All patient bio-telemetry arrays reporting nominal readings.</p>
                    )}
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '12px', textAlign: 'center' }}>
                    This operations sheet was generated automatically by HealthPro ERP systems. Authorized personnel signature required.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button className="btn btn-secondary" type="button" onClick={() => setActiveModal(null)}>Cancel</button>
                  <button className="btn btn-primary" type="button" onClick={() => window.print()}>🖨️ Print Operations Sheet</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
