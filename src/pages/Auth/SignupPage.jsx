import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useHospital } from '../../context/HospitalContext.jsx';

const SignupPage = () => {
  const { signup } = useHospital();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'Patient', age: '', gender: 'Female', bloodGroup: 'O+', emergencyContact: '', allergies: '' });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

  const passwordStrength = useMemo(() => {
    const pw = form.password;
    if (!pw) return { score: 0, label: 'Very Weak', color: 'var(--danger)' };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) return { score, label: 'Weak', color: 'var(--danger)' };
    if (score <= 4) return { score, label: 'Medium', color: 'var(--warning)' };
    return { score, label: 'Strong', color: 'var(--success)' };
  }, [form.password]);

  const progressLabel = useMemo(() => {
    return step === 1 ? 'Account Info' : step === 2 ? 'Health Details' : 'Review & Finish';
  }, [step]);

  const updateField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    // Clear validation error when editing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    if (!form.name.trim()) {
      errors.name = 'Full name is required.';
    } else if (form.name.trim().length < 2) {
      errors.name = 'Full name must be at least 2 characters.';
    }

    if (!form.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!form.password) {
      errors.password = 'Password is required.';
    } else if (passwordStrength.score < 3) {
      errors.password = 'Password is too weak. Ensure it is at least 8 characters and includes uppercase, lowercase, numbers, or symbols.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    const parsedAge = parseInt(form.age, 10);
    if (!form.age) {
      errors.age = 'Age is required.';
    } else if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      errors.age = 'Age must be a valid number between 1 and 120.';
    }

    if (!form.emergencyContact.trim()) {
      errors.emergencyContact = 'Emergency contact is required.';
    } else if (!phoneRegex.test(form.emergencyContact.trim())) {
      errors.emergencyContact = 'Contact must be a valid phone number (7-20 digits, spaces/dashes/brackets/"+" allowed).';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!validateStep1()) {
        setError('Please resolve all validation errors in account details.');
        return;
      }
    } else if (step === 2) {
      if (!validateStep2()) {
        setError('Please resolve all validation errors in health details.');
        return;
      }
    }
    setError('');
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleBack = () => {
    setValidationErrors({});
    setError('');
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    
    if (step === 1) {
      if (!validateStep1()) {
        setError('Please resolve account details validation errors.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validateStep2()) {
        setError('Please resolve health details validation errors.');
        return;
      }
      setStep(3);
      return;
    }

    const result = signup({ ...form, age: parseInt(form.age, 10) });
    if (!result.success) {
      setError(result.message);
      return;
    }
    if (form.role === 'Admin') navigate('/admin/dashboard');
    else if (form.role === 'Doctor') navigate('/doctor/dashboard');
    else if (form.role === 'Receptionist') navigate('/reception/dashboard');
    else navigate('/patient/dashboard');
  };

  return (
    <main className="auth-page">
      <style>{`
        .inline-error-msg {
          color: var(--danger);
          font-size: 0.78rem;
          font-weight: 600;
          margin-top: 4px;
          display: block;
          animation: inline-slide-down 0.2s ease-out;
        }
        .input-error {
          border-color: var(--danger) !important;
          box-shadow: 0 0 0 4px var(--danger-glow) !important;
          background-color: rgba(239, 68, 68, 0.05) !important;
        }
        @keyframes inline-slide-down {
          from { transform: translateY(-4px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <section className="auth-card glass-card signup-card">
        <div className="auth-header">
          <h1>Create your account</h1>
          <p>{progressLabel} for Smart Hospital access.</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {step === 1 && (
            <>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input 
                  className={`form-input ${validationErrors.name ? 'input-error' : ''}`} 
                  type="text" 
                  value={form.name} 
                  onChange={updateField('name')} 
                  required 
                  placeholder="Jane Doe" 
                />
                {validationErrors.name && <span className="inline-error-msg">{validationErrors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Email address</label>
                <input 
                  className={`form-input ${validationErrors.email ? 'input-error' : ''}`} 
                  type="email" 
                  value={form.email} 
                  onChange={updateField('email')} 
                  required 
                  placeholder="you@hospital.com" 
                />
                {validationErrors.email && <span className="inline-error-msg">{validationErrors.email}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  className={`form-input ${validationErrors.password ? 'input-error' : ''}`} 
                  type="password" 
                  value={form.password} 
                  onChange={updateField('password')} 
                  required 
                  placeholder="Choose a strong password" 
                />
                {form.password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Complexity:</span>
                      <strong style={{ fontSize: '0.75rem', color: passwordStrength.color }}>{passwordStrength.label}</strong>
                    </div>
                    <div style={{ height: '4px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          width: `${(passwordStrength.score / 5) * 100}%`, 
                          background: passwordStrength.color,
                          transition: 'width var(--transition-normal), background-color var(--transition-normal)'
                        }}
                      />
                    </div>
                    <small style={{ display: 'block', marginTop: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Include uppercase, lowercase, numbers, or symbols. Minimum 8 characters.
                    </small>
                  </div>
                )}
                {validationErrors.password && <span className="inline-error-msg">{validationErrors.password}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Access role</label>
                <select className="form-input" value={form.role} onChange={updateField('role')}>
                  <option value="Patient">Patient</option>
                  <option value="Receptionist">Receptionist</option>
                  <option value="Doctor">Doctor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Age</label>
                  <input 
                    className={`form-input ${validationErrors.age ? 'input-error' : ''}`} 
                    type="number" 
                    value={form.age} 
                    onChange={updateField('age')} 
                    placeholder="32" 
                  />
                  {validationErrors.age && <span className="inline-error-msg">{validationErrors.age}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Blood group</label>
                  <select className="form-input" value={form.bloodGroup} onChange={updateField('bloodGroup')}>
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
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-input" value={form.gender} onChange={updateField('gender')}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Emergency contact</label>
                  <input 
                    className={`form-input ${validationErrors.emergencyContact ? 'input-error' : ''}`} 
                    type="text" 
                    value={form.emergencyContact} 
                    onChange={updateField('emergencyContact')} 
                    placeholder="+91 99999 88888" 
                  />
                  {validationErrors.emergencyContact && <span className="inline-error-msg">{validationErrors.emergencyContact}</span>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Allergies or special notes</label>
                <textarea className="form-input" rows="3" value={form.allergies} onChange={updateField('allergies')} placeholder="E.g. penicillin" />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="review-panel glass-card">
              <h3>Review your account</h3>
              <dl className="review-list">
                <div>
                  <dt>Name</dt>
                  <dd>{form.name}</dd>
                </div>
                <div>
                  <dt>Email</dt>
                  <dd>{form.email}</dd>
                </div>
                <div>
                  <dt>Role</dt>
                  <dd>{form.role}</dd>
                </div>
                <div>
                  <dt>Blood group</dt>
                  <dd>{form.bloodGroup}</dd>
                </div>
                <div>
                  <dt>Emergency contact</dt>
                  <dd>{form.emergencyContact || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={handleBack} disabled={step === 1}>Back</button>
            {step < 3 ? (
              <button type="button" className="btn btn-primary" onClick={handleNext}>Next</button>
            ) : (
              <button type="submit" className="btn btn-primary">Finish Signup</button>
            )}
          </div>
          <p className="form-note">
            Already registered? <Link to="/login">Sign in here</Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default SignupPage;
