import { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext.jsx';

const ProfilePage = () => {
  const { state, logout, addToast, logActivity } = useHospital();
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(`shift-notes-${state.user?.id}`) || '';
  });
  
  // Timer for session countdown (15 minutes = 900 seconds)
  const [timeLeft, setTimeLeft] = useState(900);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          logout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [logout]);

  const handleExtendSession = () => {
    setTimeLeft(900);
    logActivity({
      category: 'Security',
      user: state.user?.name || 'User',
      action: 'Session Extended',
      notes: 'User requested standard clinical token lifetime extension.'
    });
    addToast('Session token successfully extended by 15 minutes.', 'success');
  };

  const handleSaveNotes = () => {
    localStorage.setItem(`shift-notes-${state.user?.id}`, notes);
    addToast('Shift notes successfully saved to offline buffer.', 'success');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-shell">
      <div className="page-head">
        <div>
          <p className="eyebrow">Account Profile & Security</p>
          <h1>{state.user?.name || 'Your Profile'}</h1>
          <p className="page-subtitle">Review your role-based dashboard permissions, encryption keys, and active session details.</p>
        </div>
      </div>

      <div className="dashboard-grid profile-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        {/* Personal Details */}
        <article className="glass-card widget-card">
          <h3>Personal Summary</h3>
          <div className="profile-meta" style={{ marginTop: '16px', display: 'grid', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email/Username</span>
              <strong>{state.user?.email}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Role Assignment</span>
              <strong style={{ color: 'var(--primary)' }}>{state.user?.role}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
              <strong>May 2026</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px' }}>
              <span style={{ color: 'var(--text-muted)' }}>MFA Status</span>
              <strong style={{ color: 'var(--success)' }}>✓ Enforced</strong>
            </div>
          </div>
        </article>

        {/* Security & Session Monitor */}
        <article className="glass-card widget-card" style={{ border: '1px solid var(--primary-glow)' }}>
          <h3>Session & Security Monitor</h3>
          <div style={{ margin: '16px 0', display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)' }}>Session Expiry</span>
              <strong style={{ fontFamily: 'monospace', fontSize: '1.2rem', color: timeLeft < 120 ? 'var(--danger)' : 'var(--text-main)' }}>
                {formatTime(timeLeft)}
              </strong>
            </div>
            
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'grid', gap: '6px', background: 'rgba(59, 130, 246, 0.05)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <div><strong>IP Address:</strong> 192.168.1.104 (Local Network)</div>
              <div><strong>Key Exchange:</strong> ECDH P-256 (TLS 1.3)</div>
              <div><strong>Access Token:</strong> HS256.jwt.shm_v1_live_auth_token</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="button" onClick={handleExtendSession} style={{ flex: 1 }}>
              Extend Session
            </button>
            <button className="btn btn-danger" type="button" onClick={logout} style={{ flex: 1 }}>
              Terminate Session
            </button>
          </div>
        </article>

        {/* Shift Notes */}
        <article className="glass-card widget-card">
          <h3>Active Duty Notepad</h3>
          <div className="profile-progress" style={{ margin: '12px 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Local Shift Notes</span>
            <small style={{ display: 'block', color: 'var(--text-muted)', marginBottom: '8px' }}>These notes persist locally on your web browser cache.</small>
          </div>
          <div className="form-group">
            <textarea 
              className="form-input" 
              rows="4" 
              value={notes} 
              onChange={(event) => setNotes(event.target.value)} 
              placeholder="e.g. Bed 302-B needs BP check at 2:00 PM. Ward 10A requires additional cardiac monitors..."
              style={{ fontSize: '0.85rem' }}
            />
          </div>
          <button className="btn btn-secondary" type="button" onClick={handleSaveNotes} style={{ width: '100%', marginTop: '10px' }}>
            Save Notes Offline
          </button>
        </article>
      </div>
    </div>
  );
};

export default ProfilePage;
