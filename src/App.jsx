import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Landing from './pages/Landing';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ProfesorDashboard from './pages/ProfesorDashboard';
import RecepcionDashboard from './pages/RecepcionDashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';

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
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['profesor', 'admin']} />}>
            <Route path="/profesor" element={<ProfesorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['recepcionista', 'admin']} />}>
            <Route path="/recepcion" element={<RecepcionDashboard />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
