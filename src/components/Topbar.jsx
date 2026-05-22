import { useState } from 'react';
import { BellIcon, MoonIcon, SunIcon, SearchIcon, ChevronDownIcon } from './Icons.jsx';
import { useHospital } from '../context/HospitalContext.jsx';
import { useLocalStorage } from '../hooks/useLocalStorage.jsx';

const Topbar = ({ onSearch }) => {
  const { state, markNotificationRead, clearNotifications, searchQuery, setSearchQuery } = useHospital();
  const [theme, setTheme] = useLocalStorage('hospital-theme', 'light');
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = state.notifications.filter((notification) => !notification.read).length;

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
  };

  const handleNotification = (id) => {
    markNotificationRead(id);
  };

  return (
    <header className="topbar glass-card">
      <div className="topbar-left">
        <div className="search-input">
          <SearchIcon size={18} />
          <input type="search" value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); onSearch?.(event.target.value); }} placeholder="Search patients, appointments, doctors..." />
        </div>
      </div>

      <div className="topbar-right">
        <button className="icon-button" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
        </button>

        <div className="notification-menu">
          <button className="icon-button badge-button" onClick={() => setShowNotifications((value) => !value)} aria-label="Notifications">
            <BellIcon size={18} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="notification-panel glass-card">
              <div className="notification-panel-header">
                <h4>Notifications</h4>
                <button type="button" className="btn btn-secondary" onClick={clearNotifications}>Clear</button>
              </div>
              <div className="notification-items">
                {state.notifications.length === 0 ? (
                  <p className="small-text">No notifications yet.</p>
                ) : (
                  state.notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      className={`notification-item ${notification.read ? '' : 'unread'}`}
                      onClick={() => handleNotification(notification.id)}
                    >
                      <div>
                        <p className="notification-title">{notification.title}</p>
                        <p className="notification-message">{notification.message}</p>
                      </div>
                      <span className="notification-time">{notification.timestamp}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-badge">
          <div>
            <p>{state.user?.name || 'Guest'}</p>
            <small>{state.user?.role || 'Visitor'}</small>
          </div>
          <ChevronDownIcon size={18} />
        </div>
      </div>
    </header>
  );
};

export default Topbar;
