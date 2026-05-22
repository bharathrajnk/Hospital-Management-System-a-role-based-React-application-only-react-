import { Link } from 'react-router-dom';

const NotAuthorizedPage = () => (
  <main className="auth-page">
    <section className="auth-card glass-card">
      <div className="auth-header">
        <h1>Access Denied</h1>
        <p>Your account does not have permission to view this page.</p>
      </div>
      <Link className="btn btn-primary" to="/dashboard">Go Back</Link>
    </section>
  </main>
);

export default NotAuthorizedPage;
