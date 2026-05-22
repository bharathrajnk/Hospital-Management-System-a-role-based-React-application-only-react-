import { useMemo, useState } from 'react';
import { useHospital } from '../../context/HospitalContext.jsx';
import { SearchIcon, CalendarIcon, PharmacyIcon, BillingIcon, ReportIcon, ClockIcon } from '../../components/Icons.jsx';

const PatientDashboard = () => {
  const { state, bookAppointment, payBilling, addToast, updatePatient } = useHospital();
  const user = state.user;

  // Active modal state: null | 'pulse' | 'bp' | 'o2' | 'resp' | 'ai' | 'appointments' | 'billing' | 'prescriptions' | 'history'
  const [activeModal, setActiveModal] = useState(null);
  
  // Custom checklist for prescription intake alarms simulation
  const [prescriptionChecklist, setPrescriptionChecklist] = useState({});

  // Appointment scheduling local form states
  const [appDoctorId, setAppDoctorId] = useState('');
  const [appDate, setAppDate] = useState('');
  const [appTimeSlot, setAppTimeSlot] = useState('10:00 AM');
  const [appType, setAppType] = useState('General Consultation');

  // Checkout billing simulation state
  const [payingInvoice, setPayingInvoice] = useState(null); // invoice object
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi' | 'card'
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Find or fallback patient details
  const patientDetails = useMemo(() => {
    if (!user) return null;
    const match = state.patients.find(
      (p) => p.name.toLowerCase() === user.name.toLowerCase()
    );
    return match || state.patients[0]; // Fallback to Jyoti Prasad (first seed patient)
  }, [state.patients, user]);

  // Appointments
  const appointments = useMemo(() => {
    if (!patientDetails) return [];
    return state.appointments.filter(
      (app) => app.patientName.toLowerCase() === patientDetails.name.toLowerCase()
    );
  }, [state.appointments, patientDetails]);

  // Invoices
  const invoices = useMemo(() => {
    if (!patientDetails) return [];
    return state.billing.filter(
      (inv) => inv.patientName.toLowerCase() === patientDetails.name.toLowerCase()
    );
  }, [state.billing, patientDetails]);

  // AI Recommendation logic based on vitals
  const aiHealthRecs = useMemo(() => {
    if (!patientDetails) return [];
    const recs = [];
    const { vitals } = patientDetails;
    if (vitals.oxygenSat < 94) {
      recs.push("Initiate low-flow oxygen: SpO2 is below normal limits. Contact your physician.");
    }
    if (vitals.bpSystolic > 140) {
      recs.push("Advisory: Elevated blood pressure detected. Reduce sodium intake and monitor daily.");
    }
    if (vitals.heartRate > 100) {
      recs.push("Cardiac alert: Rest pulse is high. Avoid caffeine and check reading in 15 minutes.");
    }
    if (recs.length === 0) {
      recs.push("Nominal wellness check: All vitals telemetry levels are within healthy ranges. Keep up the great work!");
    }
    return recs;
  }, [patientDetails]);

  const handlePaySimulation = (e) => {
    e.preventDefault();
    if (!payingInvoice) return;
    setIsProcessingPayment(true);
    
    // Simulate API delay
    setTimeout(() => {
      payBilling(payingInvoice.id);
      addToast(`Invoice ${payingInvoice.id} paid successfully via ${paymentMethod.toUpperCase()}!`, 'success');
      setIsProcessingPayment(false);
      setPayingInvoice(null);
      // If we are currently in the billing modal, keep it open but update state
    }, 1200);
  };

  const handleBookAppointmentSubmit = (e) => {
    e.preventDefault();
    if (!appDoctorId) {
      addToast('Please select a doctor.', 'warning');
      return;
    }
    if (!appDate) {
      addToast('Please choose a consultation date.', 'warning');
      return;
    }

    const doctor = state.doctors.find(d => d.id === appDoctorId);
    if (!doctor) return;

    const newApp = {
      id: `A${Date.now()}`,
      patientId: patientDetails.id,
      patientName: patientDetails.name,
      doctorId: doctor.id,
      doctorName: doctor.name,
      date: appDate,
      timeSlot: appTimeSlot,
      type: appType,
      status: 'Pending'
    };

    bookAppointment(newApp);
    // Reset booking state
    setAppDoctorId('');
    setAppDate('');
    setAppTimeSlot('10:00 AM');
    setAppType('General Consultation');
    setActiveModal('appointments'); // Keep appointments modal open to see the updated list
  };

  const handlePillComplianceToggle = (medName, timeSlot) => {
    const key = `${medName}-${timeSlot}`;
    setPrescriptionChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    addToast(`${medName} (${timeSlot}) compliance checklist updated.`, 'success');
  };

  const triggerBiosensorDiagnostics = () => {
    addToast('Contacting remote wireless biosensors... Sending telemetry payload...', 'info');
    setTimeout(() => {
      // Stabilize/Randomize vitals in a healthy range
      updatePatient(patientDetails.id, {
        vitals: {
          heartRate: Math.floor(Math.random() * (85 - 68) + 68),
          bpSystolic: Math.floor(Math.random() * (125 - 115) + 115),
          bpDiastolic: Math.floor(Math.random() * (82 - 75) + 75),
          oxygenSat: Math.floor(Math.random() * (100 - 97) + 97),
          respirationRate: Math.floor(Math.random() * (18 - 14) + 14)
        }
      });
      addToast('Patient biosensors telemetry scan complete. Vitals updated!', 'success');
    }, 1500);
  };

  if (!patientDetails) {
    return (
      <div className="page-shell" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Loading patient dashboard data...</h2>
      </div>
    );
  }

  return (
    <div className="page-shell">
      {/* Scope component inline CSS */}
      <style>{`
        .patient-interactive-card {
          cursor: pointer;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .patient-interactive-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px -10px rgba(59,130,246,0.3);
          border-color: var(--primary) !important;
        }
        .ecg-line-animation {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: ecg-pulse-draw 4s linear infinite;
        }
        @keyframes ecg-pulse-draw {
          to { stroke-dashoffset: 0; }
        }
        .compliance-pill {
          padding: 6px 12px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-card);
        }
        .compliance-pill.taken {
          background: var(--success-glow);
          color: var(--success);
          border-color: var(--success);
        }
      `}</style>

      <div className="page-head">
        <div>
          <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Patient Portal</p>
          <h1>Health Summary: {patientDetails.name}</h1>
          <p className="page-subtitle">View your real-time telemetry metrics, prescriptions, and pending clinic invoices.</p>
        </div>
      </div>

      {/* Vitals Telemetry Row - CLICKABLE */}
      <section className="dashboard-grid">
        <article 
          className="glass-card widget-card patient-interactive-card" 
          onClick={() => setActiveModal('pulse')}
          style={{ padding: '16px', borderLeft: '4px solid var(--success)', textAlign: 'center' }}
        >
          <strong>{patientDetails.vitals.heartRate} bpm</strong>
          <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)' }}>Pulse Rate (Heart Rate)</small>
        </article>
        <article 
          className="glass-card widget-card patient-interactive-card" 
          onClick={() => setActiveModal('bp')}
          style={{ padding: '16px', borderLeft: '4px solid var(--primary)', textAlign: 'center' }}
        >
          <strong>{patientDetails.vitals.bpSystolic}/{patientDetails.vitals.bpDiastolic} mmHg</strong>
          <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)' }}>Blood Pressure (BP)</small>
        </article>
        <article 
          className="glass-card widget-card patient-interactive-card" 
          onClick={() => setActiveModal('o2')}
          style={{ padding: '16px', borderLeft: '4px solid var(--secondary)', textAlign: 'center' }}
        >
          <strong>{patientDetails.vitals.oxygenSat}%</strong>
          <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)' }}>O₂ Saturation (SpO₂)</small>
        </article>
        <article 
          className="glass-card widget-card patient-interactive-card" 
          onClick={() => setActiveModal('resp')}
          style={{ padding: '16px', borderLeft: '4px solid var(--warning)', textAlign: 'center' }}
        >
          <strong>{patientDetails.vitals.respirationRate} /min</strong>
          <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)' }}>Respiration Rate</small>
        </article>
      </section>

      {/* AI Recommendation Alert - CLICKABLE */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        <article 
          className="glass-card widget-card patient-interactive-card" 
          onClick={() => setActiveModal('ai')}
          style={{ border: '1px solid var(--primary-glow)', background: 'rgba(59, 130, 246, 0.04)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ margin: 0, color: 'var(--primary)' }}>🧠 AI Health Advisor</h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>Click for Detailed Health Plan & Diagnostics &rarr;</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {aiHealthRecs.map((rec, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{rec}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Left column: Appointments & Invoices */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Scheduled Appointments Card - CLICKABLE */}
          <article className="glass-card widget-card patient-interactive-card" onClick={() => setActiveModal('appointments')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>My Scheduled Appointments</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>Schedule Slot &rarr;</span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {appointments.length === 0 ? (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No upcoming appointments scheduled.</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'underline', display: 'block', marginTop: '6px' }}>Book your first appointment now</span>
                </div>
              ) : (
                appointments.slice(0, 3).map(app => (
                  <div key={app.id} style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>{app.doctorName}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{app.date} • {app.timeSlot}</div>
                    </div>
                    <span className={`badge badge-${app.status === 'Approved' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                      {app.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </article>

          {/* Invoices & Billing Card - CLICKABLE */}
          <article className="glass-card widget-card patient-interactive-card" onClick={() => setActiveModal('billing')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Invoices & Billing</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>View Ledger &rarr;</span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {invoices.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0', margin: 0 }}>No bills issued for your account.</p>
              ) : (
                invoices.slice(0, 3).map(inv => (
                  <div key={inv.id} style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <div>
                      <strong>{inv.id}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Date: {inv.date} | ₹{inv.totalAmount.toLocaleString('en-IN')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className={`badge badge-${inv.status === 'Paid' ? 'success' : 'danger'}`} style={{ fontSize: '0.65rem' }}>
                        {inv.status}
                      </span>
                      {inv.status !== 'Paid' && (
                        <button 
                          className="btn btn-primary btn-sm" 
                          onClick={() => setPayingInvoice(inv)}
                          style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                        >
                          Pay
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        {/* Right column: Prescriptions & Medical History */}
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* Active Prescriptions Card - CLICKABLE */}
          <article className="glass-card widget-card patient-interactive-card" onClick={() => setActiveModal('prescriptions')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>My Active Prescriptions</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>Compliance Wizard &rarr;</span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {patientDetails.prescriptions.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0', margin: 0 }}>No active prescriptions found.</p>
              ) : (
                patientDetails.prescriptions.slice(0, 3).map((rx, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{rx.medicine}</strong>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Dosage: {rx.dosage} | Duration: {rx.duration}</div>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem', alignSelf: 'center' }}>{rx.status}</span>
                  </div>
                ))
              )}
            </div>
          </article>

          {/* Medical History Log Card - CLICKABLE */}
          <article className="glass-card widget-card patient-interactive-card" onClick={() => setActiveModal('history')}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0 }}>Medical History Log</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>Clinical Timeline &rarr;</span>
            </div>
            <div style={{ display: 'grid', gap: '8px' }}>
              {patientDetails.history.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px 0', margin: 0 }}>No historical entries log recorded.</p>
              ) : (
                patientDetails.history.slice(0, 3).map((log, idx) => (
                  <div key={idx} style={{ background: 'var(--bg-app)', padding: '10px', borderRadius: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong>{log.title}</strong>
                      <small style={{ color: 'var(--text-muted)' }}>{log.date}</small>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>{log.notes}</p>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>
      </section>

      {/* =========================================
          INTERACTIVE OVERLAY GLASSMODAL STRUCTURES
          ========================================= */}
      
      {/* 1. VITALS DETAILS MODAL */}
      {(activeModal === 'pulse' || activeModal === 'bp' || activeModal === 'o2' || activeModal === 'resp') && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Bio-Sensors Telemetry Hub</p>
                <h2>
                  {activeModal === 'pulse' && '💓 Pulse Rate Analysis'}
                  {activeModal === 'bp' && '🩸 Blood Pressure Analytics'}
                  {activeModal === 'o2' && '🌬️ Oxygen Saturation Monitor (SpO₂)'}
                  {activeModal === 'resp' && '🫁 Respiration Frequency'}
                </h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveModal(null)} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Simulated Heart Rate Waveform */}
              <div className="ecg-grid-background" style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="100" viewBox="0 0 400 100" style={{ stroke: 'var(--danger)', strokeWidth: '2.5', fill: 'none' }}>
                  <path 
                    className="ecg-line-animation"
                    d="M 0 50 L 50 50 L 60 30 L 70 70 L 80 50 L 120 50 L 130 50 L 135 15 L 142 90 L 150 50 L 190 50 L 200 50 L 210 30 L 220 70 L 230 50 L 270 50 L 280 50 L 285 15 L 292 90 L 300 50 L 350 50 L 400 50" 
                  />
                </svg>
              </div>

              {/* Status breakdown */}
              <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '12px' }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Diagnostics Summary</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.9rem' }}>
                  <div>• Current Reading: <strong>
                    {activeModal === 'pulse' && `${patientDetails.vitals.heartRate} bpm`}
                    {activeModal === 'bp' && `${patientDetails.vitals.bpSystolic}/${patientDetails.vitals.bpDiastolic} mmHg`}
                    {activeModal === 'o2' && `${patientDetails.vitals.oxygenSat}%`}
                    {activeModal === 'resp' && `${patientDetails.vitals.respirationRate} /min`}
                  </strong></div>
                  <div>• Threshold Range: <strong style={{ color: 'var(--success)' }}>
                    {activeModal === 'pulse' && '60 - 100 bpm (Normal)'}
                    {activeModal === 'bp' && '120/80 mmHg (Ideal)'}
                    {activeModal === 'o2' && '95% - 100% SpO₂ (Ideal)'}
                    {activeModal === 'resp' && '12 - 18 bpm (Normal)'}
                  </strong></div>
                  <div>• Patient Ward ID: <strong>{patientDetails.room}</strong></div>
                  <div>• Telemetry Device: <strong>Wireless Sensor Array {patientDetails.id}</strong></div>
                </div>
              </div>

              {/* Vital logs over time */}
              <div>
                <h4 style={{ marginBottom: '8px' }}>Telemetry Readings Log</h4>
                <div style={{ display: 'grid', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                    <span>Today, 10:00 AM</span>
                    <strong>
                      {activeModal === 'pulse' && `${patientDetails.vitals.heartRate} bpm`}
                      {activeModal === 'bp' && `${patientDetails.vitals.bpSystolic}/${patientDetails.vitals.bpDiastolic} mmHg`}
                      {activeModal === 'o2' && `${patientDetails.vitals.oxygenSat}%`}
                      {activeModal === 'resp' && `${patientDetails.vitals.respirationRate} /min`}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', opacity: 0.85 }}>
                    <span>Yesterday, 02:00 PM</span>
                    <strong>
                      {activeModal === 'pulse' && `${patientDetails.vitals.heartRate - 2} bpm`}
                      {activeModal === 'bp' && `${patientDetails.vitals.bpSystolic - 4}/${patientDetails.vitals.bpDiastolic - 2} mmHg`}
                      {activeModal === 'o2' && `${patientDetails.vitals.oxygenSat}%`}
                      {activeModal === 'resp' && `${patientDetails.vitals.respirationRate - 1} /min`}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.85rem', opacity: 0.7 }}>
                    <span>2 days ago, 09:00 AM</span>
                    <strong>
                      {activeModal === 'pulse' && `${patientDetails.vitals.heartRate + 5} bpm`}
                      {activeModal === 'bp' && `${patientDetails.vitals.bpSystolic + 6}/${patientDetails.vitals.bpDiastolic + 3} mmHg`}
                      {activeModal === 'o2' && `${patientDetails.vitals.oxygenSat - 1}%`}
                      {activeModal === 'resp' && `${patientDetails.vitals.respirationRate + 2} /min`}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                <button className="btn btn-secondary" type="button" onClick={triggerBiosensorDiagnostics}>
                  🔄 Sync Live Telemetry Vitals
                </button>
                <button className="btn btn-primary" type="button" onClick={() => setActiveModal(null)}>
                  Close Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. AI HEALTH ADVISOR MODAL */}
      {activeModal === 'ai' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Clinical AI Assistant</p>
                <h2>🧠 AI Health Assessment & Wellness Plan</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveModal(null)} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div style={{ padding: '16px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                <strong style={{ color: 'var(--primary)', fontSize: '1rem', display: 'block', marginBottom: '8px' }}>🤖 Neural Analytics Diagnostic:</strong>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
                  Aarav, your bio-telemetry reports nominal homeostasis readings. Cardiac telemetry shows low HR variability which is positive. 
                  Respiration signals are well-correlated with Blood Oxygenation indexes. 
                  Below is your tailored wellness plan:
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--primary)' }}>❤️ Cardiovascular Plan</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    <li>Maintain light physical therapy 20 mins a day.</li>
                    <li>Avoid high-sodium packaged diet foods.</li>
                    <li>Schedule regular BP monitor checks.</li>
                  </ul>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '10px' }}>
                  <h4 style={{ margin: '0 0 6px 0', color: 'var(--success)' }}>🍏 Nutrition & Diet</h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                    <li>Increase leafy green vegetables intake.</li>
                    <li>Ensure hydration of minimum 3L/day.</li>
                    <li>Limit processed carbohydrates.</li>
                  </ul>
                </div>
              </div>

              <div style={{ background: 'var(--bg-app)', padding: '14px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 6px 0', color: 'var(--secondary)' }}>🩺 Treatment Advisory Notes</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  If respiration breaches 22 /min or oxygen saturation drops below 94%, the on-duty receptionist and cardiology emergency boards will trigger a critical alert automatically. 
                  Continue medications as detailed in your pharmacy prescriptions guide.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '10px' }}>
                <button className="btn btn-secondary" type="button" onClick={triggerBiosensorDiagnostics}>
                  🔄 Fetch Live Vitals Diagnostics
                </button>
                <button className="btn btn-primary" type="button" onClick={() => setActiveModal(null)}>
                  Acknowledge Wellness Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. APPOINTMENTS MODAL & SCHEDULER FORM */}
      {activeModal === 'appointments' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Clinic Booking Desk</p>
                <h2>My Appointments Scheduler</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveModal(null)} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
              {/* Left Column: Scheduled Appointments List */}
              <div>
                <h4 style={{ marginBottom: '12px' }}>Current Appointments</h4>
                <div style={{ display: 'grid', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                  {appointments.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0' }}>
                      No upcoming appointments scheduled.
                    </p>
                  ) : (
                    appointments.map(app => (
                      <div key={app.id} style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                        <div>
                          <strong style={{ fontSize: '0.9rem' }}>{app.doctorName}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                            {app.date} • {app.timeSlot}
                          </div>
                          <div style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '2px' }}>
                            {app.type}
                          </div>
                        </div>
                        <span className={`badge badge-${app.status === 'Approved' ? 'success' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                          {app.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: New Appointment Booking Form */}
              <div className="glass-card" style={{ padding: '16px', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <h4 style={{ marginBottom: '14px', color: 'var(--primary)' }}>📅 Book a Consultation</h4>
                <form onSubmit={handleBookAppointmentSubmit} style={{ display: 'grid', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Select Specialist</label>
                    <select 
                      className="form-input" 
                      value={appDoctorId} 
                      onChange={(e) => setAppDoctorId(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      required
                    >
                      <option value="">-- Choose Doctor --</option>
                      {state.doctors.map(d => (
                        <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Consultation Date</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      value={appDate} 
                      onChange={(e) => setAppDate(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Time Slot Selection</label>
                    <select 
                      className="form-input" 
                      value={appTimeSlot} 
                      onChange={(e) => setAppTimeSlot(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    >
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:30 AM</option>
                      <option>02:00 PM</option>
                      <option>03:30 PM</option>
                      <option>04:30 PM</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Consultation Reason</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={appType} 
                      onChange={(e) => setAppType(e.target.value)}
                      placeholder="e.g. Heart Checkup"
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      required
                    />
                  </div>

                  <button className="btn btn-primary" type="submit" style={{ width: '100%', padding: '10px', fontSize: '0.85rem', marginTop: '6px' }}>
                    Confirm Booking Request
                  </button>
                </form>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-secondary" type="button" onClick={() => setActiveModal(null)}>
                Close Desk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. INVOICES & BILLING LEDGER MODAL */}
      {activeModal === 'billing' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Accounts Department</p>
                <h2>Invoices & Billing Ledger</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveModal(null)} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Invoice Breakdown Lists */}
              <div style={{ display: 'grid', gap: '10px' }}>
                {invoices.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', background: 'var(--bg-app)', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>No billing invoice records found for your account.</p>
                  </div>
                ) : (
                  invoices.map(inv => (
                    <div key={inv.id} style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'grid', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{inv.id}</strong>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Issued on: {inv.date}</div>
                        </div>
                        <span className={`badge badge-${inv.status === 'Paid' ? 'success' : 'danger'}`}>
                          {inv.status}
                        </span>
                      </div>

                      {/* Line items breakdown */}
                      <div style={{ display: 'grid', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '8px', borderLeft: '2px solid var(--border-color)' }}>
                        {inv.items && inv.items.map((it, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>• {it.desc}</span>
                            <span>₹{it.cost.toLocaleString('en-IN')}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '4px' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Outstanding Balance:</span>
                          <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginLeft: '8px' }}>
                            ₹{(inv.status === 'Paid' ? 0 : inv.totalAmount).toLocaleString('en-IN')}
                          </strong>
                        </div>
                        {inv.status !== 'Paid' && (
                          <button 
                            className="btn btn-primary" 
                            type="button"
                            onClick={() => setPayingInvoice(inv)}
                            style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                          >
                            Pay Outstanding Amount
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setActiveModal(null)}>
                  Close Ledger
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPI/CARD BILL PAYMENT GATEWAY MODAL (SUB-MODAL) */}
      {payingInvoice && (
        <div className="modal-overlay" style={{ zIndex: 11000 }} onClick={() => setPayingInvoice(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ marginBottom: '16px' }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Secure Payment Gateway</p>
                <h4>Settle Invoice {payingInvoice.id}</h4>
              </div>
              <button className="icon-button" type="button" onClick={() => setPayingInvoice(null)} style={{ fontSize: '1.25rem' }}>&times;</button>
            </div>

            <form onSubmit={handlePaySimulation} style={{ display: 'grid', gap: '14px' }}>
              <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.15)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Amount Due:</span>
                <strong>₹{payingInvoice.totalAmount.toLocaleString('en-IN')}</strong>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Payment Gateway Method</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="radio" name="paymethod" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} />
                    <span>UPI (GPay / PhonePe)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input type="radio" name="paymethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    <span>Debit/Credit Card</span>
                  </label>
                </div>
              </div>

              {paymentMethod === 'upi' ? (
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>UPI Address ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="aarav@okhdfcbank" 
                    value={upiId} 
                    onChange={(e) => setUpiId(e.target.value)} 
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                    required 
                  />
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '10px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Card Number</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="4321 0987 6543 2109" 
                      value={cardNumber} 
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                      required 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Expiry Date</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="MM/YY" 
                        value={cardExpiry} 
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        required 
                      />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>CVV Code</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        placeholder="123" 
                        value={cardCVV} 
                        onChange={(e) => setCardCVV(e.target.value)}
                        maxLength="3"
                        style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary" 
                type="submit" 
                disabled={isProcessingPayment}
                style={{ width: '100%', padding: '10px', fontSize: '0.85rem', marginTop: '4px' }}
              >
                {isProcessingPayment ? 'Processing Safe Transaction...' : `Simulate Instant Settle (₹${payingInvoice.totalAmount.toLocaleString('en-IN')})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5. ACTIVE PRESCRIPTIONS MODAL & COMPLIANCE WIZARD */}
      {activeModal === 'prescriptions' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Pharmacy Clinic</p>
                <h2>My Active Prescriptions & Compliance</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveModal(null)} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>
                Maintain high compliance to speed up clinical recovery. Mark each dose taken in the scheduler below:
              </p>

              <div style={{ display: 'grid', gap: '14px' }}>
                {patientDetails.prescriptions.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-app)', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No active drug prescriptions registered.</p>
                  </div>
                ) : (
                  patientDetails.prescriptions.map((rx, idx) => (
                    <div key={idx} style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'grid', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{rx.medicine}</strong>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Duration: {rx.duration} | Status: {rx.status}</div>
                        </div>
                        <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Active</span>
                      </div>

                      {/* Daily intake checklists */}
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '4px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', marginRight: '6px' }}>Daily Alarms Check:</span>
                        
                        <button 
                          type="button"
                          className={`compliance-pill ${prescriptionChecklist[`${rx.medicine}-Morning`] ? 'taken' : ''}`}
                          onClick={() => handlePillComplianceToggle(rx.medicine, 'Morning')}
                        >
                          🌅 Morning {prescriptionChecklist[`${rx.medicine}-Morning`] ? '✓ Taken' : '• Pending'}
                        </button>
                        
                        <button 
                          type="button"
                          className={`compliance-pill ${prescriptionChecklist[`${rx.medicine}-Noon`] ? 'taken' : ''}`}
                          onClick={() => handlePillComplianceToggle(rx.medicine, 'Noon')}
                        >
                          ☀️ Afternoon {prescriptionChecklist[`${rx.medicine}-Noon`] ? '✓ Taken' : '• Pending'}
                        </button>
                        
                        <button 
                          type="button"
                          className={`compliance-pill ${prescriptionChecklist[`${rx.medicine}-Night`] ? 'taken' : ''}`}
                          onClick={() => handlePillComplianceToggle(rx.medicine, 'Night')}
                        >
                          🌙 Night {prescriptionChecklist[`${rx.medicine}-Night`] ? '✓ Taken' : '• Pending'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-primary" type="button" onClick={() => setActiveModal(null)}>
                  Save Checklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MEDICAL HISTORY TIMELINE LOG MODAL */}
      {activeModal === 'history' && (
        <div className="modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="modal-header" style={{ marginBottom: '20px' }}>
              <div>
                <p className="eyebrow" style={{ color: 'var(--primary)' }}>Electronic Medical Records (EMR)</p>
                <h2>Interactive Health History Log</h2>
              </div>
              <button className="icon-button" type="button" onClick={() => setActiveModal(null)} style={{ fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Allergy and profile block */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: 'var(--bg-app)', padding: '14px', borderRadius: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Blood Group:</span>
                  <strong style={{ display: 'block', fontSize: '1.1rem', color: 'var(--danger)' }}>{patientDetails.bloodGroup}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Allergies & Contraindications:</span>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)' }}>{patientDetails.allergies || 'None Recorded'}</strong>
                </div>
                <div style={{ gridColumn: 'span 2', marginTop: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emergency Contact Roster:</span>
                  <strong style={{ display: 'block', fontSize: '0.85rem' }}>{patientDetails.emergencyContact}</strong>
                </div>
              </div>

              {/* Timeline list */}
              <div>
                <h4 style={{ marginBottom: '12px' }}>Clinical Timeline Entries</h4>
                <div style={{ display: 'grid', gap: '12px', maxHeight: '260px', overflowY: 'auto', paddingLeft: '8px' }}>
                  {patientDetails.history.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>No clinical entries logged yet.</p>
                  ) : (
                    patientDetails.history.map((log, idx) => (
                      <div key={idx} style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--primary)' }}>
                        {/* Bullet point node */}
                        <span style={{ position: 'absolute', left: '-5px', top: '2px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '0.9rem' }}>{log.title}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.date}</span>
                        </div>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          {log.notes}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button className="btn btn-primary" type="button" onClick={() => setActiveModal(null)}>
                  Close Records File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
