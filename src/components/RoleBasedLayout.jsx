import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext.jsx';
import DynamicSidebar from './DynamicSidebar.jsx';
import Topbar from './Topbar.jsx';

const RoleBasedLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { state } = useHospital();
  const role = state.user?.role || 'Patient';

  return (
    <div className="app-container" data-role={role}>
      <DynamicSidebar collapsed={collapsed} onCollapse={() => setCollapsed((value) => !value)} />
      <div className="main-content-area">
        <Topbar />
        <div className="content-wrapper">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RoleBasedLayout;
