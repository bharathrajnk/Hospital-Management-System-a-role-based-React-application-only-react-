import React, { useState, useEffect } from 'react';

const TELEMETRY_MESSAGES = [
  'Decrypting secure clinical vaults...',
  'Establishing secure diagnostic sockets...',
  'Hydrating real-time patient biosensor grids...',
  'Loading Dhanvantari pharmacy catalog...',
  'Synchronizing hospital operating ledgers...',
  'Calibrating neural diagnostic models...',
  'Authorizing secure healthcare channels...'
];

const LoadingFallback = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % TELEMETRY_MESSAGES.length);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="telemetry-loader-overlay">
      <style>{`
        .telemetry-loader-overlay {
          position: fixed;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 70%), var(--bg-app);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: var(--font-sans);
          padding: 24px;
        }

        .loader-card {
          width: 100%;
          max-width: 440px;
          text-align: center;
          padding: 40px 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          box-shadow: var(--glass-shadow);
        }

        .spinner-outer {
          position: relative;
          width: 90px;
          height: 90px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .spinner-ring {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: var(--primary);
          border-right-color: var(--secondary);
          border-radius: 50%;
          animation: spin-clockwise 1.5s cubic-bezier(0.53, 0.21, 0.29, 0.87) infinite;
        }

        .spinner-ring-inner {
          position: absolute;
          inset: 12px;
          border: 2px solid transparent;
          border-bottom-color: var(--success);
          border-left-color: var(--warning);
          border-radius: 50%;
          animation: spin-counter-clockwise 1.2s linear infinite;
        }

        .heart-icon-pulse {
          color: var(--danger);
          animation: tele-heartbeat 1.2s infinite;
          font-size: 1.8rem;
          z-index: 5;
        }

        .loader-copy {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .loader-copy h2 {
          font-family: var(--font-title);
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, var(--text-main) 40%, var(--primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin: 0;
        }

        .loader-message {
          font-size: 0.85rem;
          color: var(--text-muted);
          min-height: 20px;
          font-weight: 500;
          animation: loader-fade-in-out 1.2s infinite alternate;
        }

        .loader-progress-bar {
          width: 100%;
          height: 4px;
          background: var(--border-color);
          border-radius: var(--radius-full);
          overflow: hidden;
          position: relative;
        }

        .loader-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary), var(--secondary));
          width: 80%;
          border-radius: var(--radius-full);
          animation: loader-progress-anim 2.5s ease-in-out infinite;
        }

        @keyframes spin-clockwise {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes spin-counter-clockwise {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        @keyframes tele-heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.15); }
          40% { transform: scale(1); }
          55% { transform: scale(1.15); }
        }

        @keyframes loader-fade-in-out {
          0% { opacity: 0.6; }
          100% { opacity: 1; }
        }

        @keyframes loader-progress-anim {
          0% { left: -100%; width: 50%; }
          50% { width: 40%; }
          100% { left: 100%; width: 50%; }
        }
      `}</style>
      <div className="loader-card glass-card">
        <div className="spinner-outer">
          <div className="spinner-ring"></div>
          <div className="spinner-ring-inner"></div>
          <span className="heart-icon-pulse">❤️</span>
        </div>
        <div className="loader-copy">
          <h2>HealthPro Command</h2>
          <p className="loader-message">{TELEMETRY_MESSAGES[msgIdx]}</p>
        </div>
        <div className="loader-progress-bar">
          <div className="loader-progress-fill"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingFallback;
