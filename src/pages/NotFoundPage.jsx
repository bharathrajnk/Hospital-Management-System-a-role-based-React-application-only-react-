import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <main className="auth-page">
    <section className="auth-card glass-card">
      <div className="auth-header">
        <h1>404 — Page not found</h1>
        <p>The route you are looking for doesn’t exist or you may not have permission.</p>
      </div>
      <Link className="btn btn-primary" to="/dashboard">Return to dashboard</Link>
    </section>
  </main>
);

export default NotFoundPage;
