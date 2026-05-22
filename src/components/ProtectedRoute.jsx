import { Navigate } from 'react-router-dom';
import { useHospital } from '../context/HospitalContext.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { state } = useHospital();
  const user = state.user;

  if (!user) {
    return <Navigate replace to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate replace to="/not-authorized" />;
  }

  return children;
};

export default ProtectedRoute;
