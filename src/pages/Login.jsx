import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Dumbbell, LogIn } from 'lucide-react';
import { useAuth } from '../context/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { getRoleHomePath, login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { profile } = await login(email, password);
      navigate(getRoleHomePath(profile.rol), { replace: true });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Credenciales invalidas o cuenta no registrada.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Link to="/" style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
        textDecoration: 'none'
      }}>
        <ArrowLeft size={18} /> Volver al sitio informativo
      </Link>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-icon" style={{ margin: '0 auto', width: '48px', height: '48px' }}>
            <Dumbbell size={28} />
          </div>
          <h2 className="auth-title">Plataforma <span className="text-gradient">AnimApp</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Ingrese sus credenciales de acceso a la plataforma
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '0.8rem 1rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electronico</label>
            <input
              type="email"
              className="form-input"
              placeholder="nombre@animapp.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contrasena</label>
            <input
              type="password"
              className="form-input"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary btn-full" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Iniciando sesion...' : 'Ingresar a Plataforma AnimApp'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
