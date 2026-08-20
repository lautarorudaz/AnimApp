import React from 'react';
import { MapPin } from 'lucide-react';
import { useAuth } from '../context/auth';

const SedeSwitcher = ({ label = 'Sede activa' }) => {
  const { activeSedeId, availableSedes, setActiveSedeId } = useAuth();

  if (!availableSedes.length) return null;

  return (
    <label className="sede-switcher">
      <MapPin size={16} />
      <span>{label}</span>
      <select
        value={activeSedeId || availableSedes[0].id}
        onChange={(event) => setActiveSedeId(event.target.value)}
        disabled={availableSedes.length === 1}
      >
        {availableSedes.map((sede) => (
          <option key={sede.id} value={sede.id}>
            {sede.nombre}
          </option>
        ))}
      </select>
    </label>
  );
};

export default SedeSwitcher;
