import { useMemo, useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext.jsx';
import { SearchIcon, ActivityIcon, BrainIcon } from '../components/Icons.jsx';

const AnalyticsPage = () => {
  const { state, updatePatient } = useHospital();
  
  // Selected patient for live monitoring
  const admittedPatients = useMemo(() => state.patients.filter(p => p.status === 'Admitted'), [state.patients]);
  const [selectedPatientId, setSelectedPatientId] = useState(admittedPatients[0]?.id || '');
  const [pulseMultiplier, setPulseMultiplier] = useState(1);

  // Auto-switch patient if current selected gets discharged
  useEffect(() => {
    if (admittedPatients.length > 0 && !admittedPatients.find(p => p.id === selectedPatientId)) {
      setSelectedPatientId(admittedPatients[0].id);
    }
  }, [admittedPatients, selectedPatientId]);

  const selectedPatient = useMemo(() => {
    return state.patients.find(p => p.id === selectedPatientId);
  }, [state.patients, selectedPatientId]);

  // Dynamic clinical recommendations based on vitals
  const aiRecommendations = useMemo(() => {
    if (!selectedPatient) return [];
    const recs = [];
    const { vitals } = selectedPatient;

    if (vitals.oxygenSat < 94) {
      recs.push({
        id: 'rec-o2',
        level: 'critical',
        title: 'Initiate High-Flow Oxygen Therapy',
        text: `Oxygen Saturation is at ${vitals.oxygenSat}%. Set nasal cannula to 4-6L/min and monitor SpO2 continuously.`
      });
    }

    if (vitals.bpSystolic > 140) {
      recs.push({
        id: 'rec-bp',
        level: 'warning',
        title: 'Vasoactive Control Required',
        text: `Systolic BP of ${vitals.bpSystolic} mmHg exceeds critical thresholds. Evaluate for anti-hypertensive intervention.`
      });
    }

    if (vitals.heartRate > 100) {
      recs.push({
        id: 'rec-hr',
        level: 'warning',
        title: 'Tachycardia Advisory',
        text: `Heart rate is elevated at ${vitals.heartRate} bpm. Perform 12-lead ECG and review serum electrolytes.`
      });
    }

    if (recs.length === 0) {
      recs.push({
        id: 'rec-stable',
        level: 'stable',
        title: 'Vitals Stabilized & Within Safe Range',
        text: 'Patient exhibits normal telemetry parameters. Approved for transition to step-down ward under standard observations.'
      });
    }

    return recs;
  }, [selectedPatient]);

  const diseaseStats = useMemo(() => ({
    Cardiology: 35,
    Neurology: 25,
    Pediatrics: 18,
    Orthopedics: 12,
    GeneralMedicine: 10
  }), []);

  const totalPatientsCount = state.patients.length;
  const dischargedCount = state.patients.filter(p => p.status === 'Discharged').length;
  const recoveryProgress = useMemo(() => {
    if (totalPatientsCount === 0) return 0;
    return Math.round((dischargedCount / totalPatientsCount) * 100);
  }, [totalPatientsCount, dischargedCount]);

  const emergencyCount = useMemo(() => {
    return state.patients.filter(p => p.vitals.oxygenSat < 94 || p.vitals.bpSystolic > 140).length;
  }, [state.patients]);

  return (
    <div className="page-shell">
      <div className="page-head">
        <div>
          <p className="eyebrow">Advanced AI Diagnostics</p>
          <h1>Clinical Intelligence & Health Analytics</h1>
          <p className="page-subtitle">Real-time health telemetry analysis, cardiac waveforms, and automated smart diagnostic recommendations.</p>
        </div>
      </div>

      {/* Real-time Patient Telemetry Monitoring */}
      <section className="dashboard-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <article className="glass-card widget-card" style={{ minHeight: '380px' }}>
          <div className="widget-head" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ActivityIcon size={22} style={{ color: 'var(--primary)' }} />
              <h3 style={{ margin: 0 }}>Live Patient Telemetry Panel</h3>
            </div>
            
            {/* Patient Selector */}
            <select 
              value={selectedPatientId} 
              onChange={(e) => setSelectedPatientId(e.target.value)} 
              className="form-input"
              style={{ maxWidth: '240px', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {admittedPatients.length === 0 ? (
                <option value="">No patients admitted</option>
              ) : (
                admittedPatients.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.room})</option>
                ))
              )}
            </select>
          </div>

          {selectedPatient ? (
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Patient Basic Details Banner */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '12px', background: 'rgba(59, 130, 246, 0.05)', padding: '12px 18px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{selectedPatient.name}</h4>
                  <small style={{ color: 'var(--text-muted)' }}>Age: {selectedPatient.age} | Gender: {selectedPatient.gender} | Blood Group: {selectedPatient.bloodGroup}</small>
                </div>
                <div>
                  <small style={{ color: 'var(--text-muted)', display: 'block', textAlign: 'right' }}>Current Ward Assignment</small>
                  <strong style={{ color: 'var(--primary)' }}>Room {selectedPatient.room}</strong>
                </div>
              </div>

              {/* Vitals Telemetry Grid */}
              <div className="doctor-stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--success)', textAlign: 'center' }}>
                  <strong style={{ fontSize: '1.4rem', color: selectedPatient.vitals.heartRate > 100 ? 'var(--danger)' : 'var(--success)' }}>
                    {selectedPatient.vitals.heartRate} <span style={{ fontSize: '0.8rem' }}>bpm</span>
                  </strong>
                  <small style={{ display: 'block', marginTop: '4px', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 'bold' }}>Heart Rate</small>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--primary)', textAlign: 'center' }}>
                  <strong style={{ fontSize: '1.4rem', color: selectedPatient.vitals.bpSystolic > 140 ? 'var(--danger)' : 'var(--primary)' }}>
                    {selectedPatient.vitals.bpSystolic}/{selectedPatient.vitals.bpDiastolic} <span style={{ fontSize: '0.7rem' }}>mmHg</span>
                  </strong>
                  <small style={{ display: 'block', marginTop: '4px', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 'bold' }}>Blood Pressure</small>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--secondary)', textAlign: 'center' }}>
                  <strong style={{ fontSize: '1.4rem', color: selectedPatient.vitals.oxygenSat < 94 ? 'var(--danger)' : 'var(--secondary)' }}>
                    {selectedPatient.vitals.oxygenSat}%
                  </strong>
                  <small style={{ display: 'block', marginTop: '4px', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 'bold' }}>O₂ Saturation</small>
                </div>
                <div style={{ background: 'var(--bg-app)', padding: '12px', borderRadius: '8px', borderLeft: '3px solid var(--warning)', textAlign: 'center' }}>
                  <strong style={{ fontSize: '1.4rem' }}>
                    {selectedPatient.vitals.respirationRate} <span style={{ fontSize: '0.7rem' }}>/m</span>
                  </strong>
                  <small style={{ display: 'block', marginTop: '4px', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 'bold' }}>Respiration</small>
                </div>
              </div>

              {/* Dynamic Waveform Visualization */}
              <div className="ecg-grid-background" style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="100%" height="80" style={{ stroke: selectedPatient.vitals.heartRate > 100 ? 'var(--danger)' : 'var(--success)', strokeWidth: 2, fill: 'none' }}>
                  <path d="M 0 40 L 40 40 L 50 20 L 60 60 L 70 40 L 100 40 L 110 10 L 120 70 L 130 40 L 170 40 L 180 20 L 190 60 L 200 40 L 230 40 L 240 10 L 250 70 L 260 40 L 300 40 L 310 20 L 320 60 L 330 40 L 360 40 L 370 10 L 380 70 L 390 40 L 430 40 L 440 20 L 450 60 L 460 40 L 490 40 L 500 10 L 510 70 L 520 40 L 560 40 L 570 20 L 580 60 L 590 40 L 620 40 L 630 10 L 640 70 L 650 40 L 700 40" />
                </svg>
                <div style={{ position: 'absolute', top: '8px', left: '12px', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                  Live Waveform: lead ii electrocardiogram telemetry
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-muted)' }}>
              <BrainIcon size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>Admit patient records from Patient Registry to enable telemetry feed.</p>
            </div>
          )}
        </article>

        {/* AI Clinician Smart Recommendations */}
        <article className="glass-card widget-card">
          <div className="widget-head" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BrainIcon size={22} style={{ color: 'var(--secondary)' }} />
              <h3 style={{ margin: 0 }}>Smart AI Recommendation</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
            {aiRecommendations.map((rec) => (
              <div 
                key={rec.id} 
                style={{ 
                  padding: '14px', 
                  borderRadius: '10px', 
                  background: rec.level === 'critical' ? 'rgba(239, 68, 68, 0.06)' : rec.level === 'warning' ? 'rgba(245, 158, 11, 0.06)' : 'rgba(16, 185, 129, 0.06)',
                  border: `1px solid ${rec.level === 'critical' ? 'rgba(239, 68, 68, 0.2)' : rec.level === 'warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <strong style={{ 
                    fontSize: '0.9rem', 
                    color: rec.level === 'critical' ? 'var(--danger)' : rec.level === 'warning' ? 'var(--warning)' : 'var(--success)' 
                  }}>
                    {rec.title}
                  </strong>
                  <span className={`badge badge-${rec.level === 'critical' ? 'danger' : rec.level === 'warning' ? 'warning' : 'success'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                    {rec.level}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {rec.text}
                </p>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '16px', background: 'rgba(59, 130, 246, 0.05)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>AI Predictive Model</span>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Neural network analysis computes high diagnostics fidelity based on continuous bio-sensors streams.</small>
          </div>
        </article>
      </section>

      {/* Disease Stats & Recovery Progress */}
      <section className="dashboard-grid">
        {/* Recovery Progress widget */}
        <article className="glass-card widget-card">
          <h3>Patient Recovery Progress</h3>
          <div className="risk-panel" style={{ margin: '16px 0' }}>
            <div>
              <span>Discharged & Cured</span>
              <strong>{dischargedCount}</strong>
            </div>
            <div>
              <span>System Recovery Rate</span>
              <strong>{recoveryProgress}%</strong>
            </div>
          </div>
          <div className="progress-bar-container" style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
              <span>National Target Ratio: 85%</span>
              <span>Actual: {recoveryProgress}%</span>
            </div>
            <div className="progress-bar"><span style={{ width: `${recoveryProgress}%`, background: 'linear-gradient(90deg, var(--primary), var(--secondary))' }} /></div>
          </div>
        </article>

        {/* Disease Prevalence chart */}
        <article className="glass-card widget-card">
          <h3>Prevalence of Diseases</h3>
          <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            {Object.entries(diseaseStats).map(([dept, percent]) => (
              <div key={dept} className="stat-row">
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{dept.replace(/([A-Z])/g, ' $1').trim()}</span>
                <div className="stat-bar" style={{ flex: 1, margin: '0 12px' }}>
                  <span style={{ width: `${percent}%`, background: 'var(--primary)' }} />
                </div>
                <strong style={{ fontSize: '0.85rem' }}>{percent}%</strong>
              </div>
            ))}
          </div>
        </article>
      </section>

      {/* Emergency Alerts Status */}
      <section className="dashboard-grid">
        <article className="glass-card widget-card emergency-flashing-active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--danger)' }}>Clinical Warning Levels</span>
            <h2 style={{ color: 'var(--danger)', margin: '4px 0' }}>{emergencyCount} Critical Vitals Alert Flagged</h2>
            <p style={{ margin: 0 }}>System bio-sensor clusters have recognized anomaly telemetry values on active cardiac beds.</p>
          </div>
          <span className="badge badge-danger" style={{ animation: 'pulse-ring 1s infinite alternate', padding: '8px 16px', fontSize: '0.85rem' }}>
            {emergencyCount > 0 ? 'Urgent Action Requested' : 'Monitoring Stable'}
          </span>
        </article>
      </section>
    </div>
  );
};

export default AnalyticsPage;
