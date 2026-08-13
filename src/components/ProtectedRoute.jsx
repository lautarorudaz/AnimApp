import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0b0f19',
        color: '#f97316'
      }}>
        <h2>Cargando sistema ApexGym...</h2>
      </div>
    );
  }

  // Redirigir a login si no hay usuario autenticado
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Verificar si el rol del usuario está permitido
  if (allowedRoles && userProfile && !allowedRoles.includes(userProfile.rol)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
