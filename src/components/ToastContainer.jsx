import { useEffect } from 'react';
import { useHospital } from '../context/HospitalContext.jsx';

const ToastItem = ({ toast }) => {
  const { removeToast } = useHospital();

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  const getStyle = () => {
    switch (toast.type) {
      case 'success':
        return { borderLeft: '4px solid var(--success)', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'warning':
        return { borderLeft: '4px solid var(--warning)', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'danger':
        return { borderLeft: '4px solid var(--danger)', bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { borderLeft: '4px solid var(--primary)', bg: 'rgba(59, 130, 246, 0.1)' };
    }
  };

  const styleConfig = getStyle();

  return (
    <div 
      className="glass-card toast-item" 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        marginBottom: '10px',
        minWidth: '280px',
        maxWidth: '380px',
        background: 'var(--bg-sidebar)',
        border: '1px solid var(--border-color)',
        borderLeft: styleConfig.borderLeft,
        borderRadius: '10px',
        boxShadow: 'var(--glass-shadow)',
        backdropFilter: 'blur(12px)',
        pointerEvents: 'auto',
        animation: 'toast-slide-in 0.3s ease forwards'
      }}
    >
      <div style={{ marginRight: '12px', fontSize: '0.88rem', fontWeight: '500' }}>
        {toast.message}
      </div>
      <button 
        type="button" 
        onClick={() => removeToast(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          fontSize: '1.2rem',
          cursor: 'pointer',
          lineHeight: 1
        }}
      >
        &times;
      </button>
    </div>
  );
};

export const ToastContainer = () => {
  const { state } = useHospital();
  const toasts = state?.toasts || [];

  return (
    <div 
      className="toast-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

export default ToastContainer;
