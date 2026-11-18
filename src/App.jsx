import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProfesorDashboard from './pages/ProfesorDashboard';
import ProfesorExercises from './pages/ProfesorExercises';
import ProfesorRoutines from './pages/ProfesorRoutines';
import RecepcionDashboard from './pages/RecepcionDashboard';
import AlumnoDashboard from './pages/AlumnoDashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './constants/appData';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Sitio Informativo Institucional (Estilo Coderhouse / Landing) */}
          <Route path="/" element={<Landing />} />

          {/* Acceso e Iniciar Sesión a la Plataforma */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Rutas Protegidas por Rol Institucional */}
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.PROFESOR, ROLES.ADMIN]} />}>
            <Route path="/profesor" element={<ProfesorDashboard />} />
            <Route path="/profesor/rutinas" element={<ProfesorRoutines />} />
            <Route path="/profesor/ejercicios" element={<ProfesorExercises />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.RECEPCIONISTA, ROLES.ADMIN]} />}>
            <Route path="/recepcion" element={<RecepcionDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[ROLES.ALUMNO, ROLES.ADMIN]} />}>
            <Route path="/alumno" element={<AlumnoDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
