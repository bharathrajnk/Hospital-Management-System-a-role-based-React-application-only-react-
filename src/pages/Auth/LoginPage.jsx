import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext.jsx';

const LoginPage = () => {
  const { state, login } = useHospital();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const seedUsernames = ['admin', 'doctor', 'reception', 'patient'];

  const handleQuickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');

    const result = login(demoEmail, demoPassword);
    if (!result.success) {
      setError(result.message);
      return;
    }
    const role = result.role;
    if (role === 'Admin') navigate('/admin/dashboard');
    else if (role === 'Doctor') navigate('/doctor/dashboard');
    else if (role === 'Receptionist') navigate('/reception/dashboard');
    else if (role === 'Patient') navigate('/patient/dashboard');
    else navigate('/dashboard');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail) {
      setError('Username or Email address is required.');
      return;
    }

    // Gracefully bypass strict email check for seed usernames
    const isSeedUser = seedUsernames.includes(cleanEmail.toLowerCase());
    if (!isSeedUser && !emailRegex.test(cleanEmail)) {
      setError('Please enter a valid email address (e.g. name@domain.com).');
      return;
    }

    if (!cleanPassword) {
      setError('Password is required.');
      return;
    }

    if (cleanPassword.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    const result = login(cleanEmail, cleanPassword);
    if (!result.success) {
      setError(result.message);
      return;
    }
    const role = result.role;
    if (role === 'Admin') navigate('/admin/dashboard');
    else if (role === 'Doctor') navigate('/doctor/dashboard');
    else if (role === 'Receptionist') navigate('/reception/dashboard');
    else if (role === 'Patient') navigate('/patient/dashboard');
    else navigate('/dashboard');
  };

  return (
    <main className="auth-page">
      {/* Component level premium inline layout overrides */}
      <style>{`
        .auth-page {
          background: radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                      radial-gradient(circle at 90% 90%, rgba(139, 92, 246, 0.08) 0%, transparent 40%),
                      var(--bg-app);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .quick-login-section {
          margin-top: 24px;
          border-top: 1px dashed var(--border-color, rgba(255, 255, 255, 0.1));
          padding-top: 20px;
        }

        .quick-login-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 16px;
          text-align: center;
        }

        .quick-login-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .quick-login-card {
          padding: 12px;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease-in-out;
          border: 1px solid transparent;
        }

        .quick-login-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        /* Light Mode Colors matching user screenshot */
        .quick-login-card.admin {
          background: #f0f7ff;
          border-color: #dbeafe;
        }
        .quick-login-card.admin:hover {
          border-color: #3b82f6;
          background: #e0f2fe;
        }
        .quick-login-card.admin .role-title {
          color: #2563eb;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .quick-login-card.doctor {
          background: #faf5ff;
          border-color: #f3e8ff;
        }
        .quick-login-card.doctor:hover {
          border-color: #a855f7;
          background: #f3e8ff;
        }
        .quick-login-card.doctor .role-title {
          color: #9333ea;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .quick-login-card.receptionist {
          background: #f0fdf4;
          border-color: #dcfce7;
        }
        .quick-login-card.receptionist:hover {
          border-color: #22c55e;
          background: #dcfce7;
        }
        .quick-login-card.receptionist .role-title {
          color: #16a34a;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .quick-login-card.patient {
          background: #fffbeb;
          border-color: #fef3c7;
        }
        .quick-login-card.patient:hover {
          border-color: #f59e0b;
          background: #fef3c7;
        }
        .quick-login-card.patient .role-title {
          color: #d97706;
          font-weight: 700;
          font-size: 0.95rem;
        }

        .quick-login-card .name-label {
          color: #64748b;
          font-size: 0.85rem;
          margin-top: 4px;
          font-weight: 500;
        }

        /* Dark Mode Theme Overrides */
        :root[data-theme="dark"] .quick-login-title {
          color: #94a3b8;
        }
        :root[data-theme="dark"] .quick-login-card .name-label {
          color: #94a3b8;
        }

        :root[data-theme="dark"] .quick-login-card.admin {
          background: rgba(59, 130, 246, 0.06);
          border-color: rgba(59, 130, 246, 0.2);
        }
        :root[data-theme="dark"] .quick-login-card.admin:hover {
          background: rgba(59, 130, 246, 0.12);
          border-color: #3b82f6;
        }
        :root[data-theme="dark"] .quick-login-card.admin .role-title {
          color: #60a5fa;
        }

        :root[data-theme="dark"] .quick-login-card.doctor {
          background: rgba(139, 92, 246, 0.06);
          border-color: rgba(139, 92, 246, 0.2);
        }
        :root[data-theme="dark"] .quick-login-card.doctor:hover {
          background: rgba(139, 92, 246, 0.12);
          border-color: #c084fc;
        }
        :root[data-theme="dark"] .quick-login-card.doctor .role-title {
          color: #c084fc;
        }

        :root[data-theme="dark"] .quick-login-card.receptionist {
          background: rgba(34, 197, 94, 0.06);
          border-color: rgba(34, 197, 94, 0.2);
        }
        :root[data-theme="dark"] .quick-login-card.receptionist:hover {
          background: rgba(34, 197, 94, 0.12);
          border-color: #4ade80;
        }
        :root[data-theme="dark"] .quick-login-card.receptionist .role-title {
          color: #4ade80;
        }

        :root[data-theme="dark"] .quick-login-card.patient {
          background: rgba(245, 158, 11, 0.06);
          border-color: rgba(245, 158, 11, 0.2);
        }
        :root[data-theme="dark"] .quick-login-card.patient:hover {
          background: rgba(245, 158, 11, 0.12);
          border-color: #fbbf24;
        }
        :root[data-theme="dark"] .quick-login-card.patient .role-title {
          color: #fbbf24;
        }
      `}</style>

      <section className="auth-card glass-card">
        <div className="auth-header">
          <h1>Hospital Sign In</h1>
          <p>Secure access to the Smart Hospital Management System.</p>
        </div>
        
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Username or Email address</label>
            <input 
              className="form-input" 
              type="text" 
              value={email} 
              onChange={(event) => setEmail(event.target.value)} 
              required 
              placeholder="e.g. admin or you@hospital.com" 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              className="form-input" 
              type="password" 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              required 
              placeholder="Enter secure password" 
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Sign In</button>

          <p className="form-note" style={{ marginTop: '16px', textAlign: 'center' }}>
            New user? <Link to="/signup">Create an account</Link>
          </p>
        </form>

        <div className="quick-login-section">
          <h2 className="quick-login-title">
            <span>⚡</span> Quick Demo Login Profiles (Click to enter instantly)
          </h2>
          <div className="quick-login-grid">
            <div 
              className="quick-login-card admin" 
              onClick={() => handleQuickLogin('admin', 'admin@123')}
            >
              <div className="role-title">Admin</div>
              <div className="name-label">Aditya Sharma</div>
            </div>
            <div 
              className="quick-login-card doctor" 
              onClick={() => handleQuickLogin('doctor', 'doctor@123')}
            >
              <div className="role-title">Doctor</div>
              <div className="name-label">Dr. Sneha Patil</div>
            </div>
            <div 
              className="quick-login-card receptionist" 
              onClick={() => handleQuickLogin('reception', 'reception@123')}
            >
              <div className="role-title">Receptionist</div>
              <div className="name-label">Rita Patel</div>
            </div>
            <div 
              className="quick-login-card patient" 
              onClick={() => handleQuickLogin('patient', 'patient@123')}
            >
              <div className="role-title">Patient</div>
              <div className="name-label">Aarav Sharma</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
