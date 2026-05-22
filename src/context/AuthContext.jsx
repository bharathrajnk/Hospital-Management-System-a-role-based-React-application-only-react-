import React, { createContext, useContext } from 'react';
import { useHospital } from './HospitalContext.jsx';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const RoleProvider = ({ children }) => {
  const { state, login, signup, logout } = useHospital();

  const value = {
    user: state.user,
    role: state.user?.role || null,
    login,
    signup,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
export default AuthContext;
