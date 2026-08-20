import React, { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { ROLES, SEDE_IDS, SEDES, getRoleHomePath, normalizeSedeIds } from '../constants/appData';
import { AuthContext } from './auth';
const ACTIVE_SEDE_STORAGE_KEY = 'animapp.activeSedeId';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [activeSedeId, setActiveSedeIdState] = useState(() => {
    return localStorage.getItem(ACTIVE_SEDE_STORAGE_KEY) || null;
  });
  const [loading, setLoading] = useState(true);

  const normalizeProfile = (user, data = {}) => {
    const rol = data.rol || data.role || null;
    const sedes = rol === ROLES.ADMIN
      ? SEDE_IDS
      : normalizeSedeIds(data.sedes || data.sedeIds || data.sede || []);
    const activo = data.activo ?? data.active ?? true;

    return {
      ...data,
      uid: user.uid,
      nombre: data.nombre || user.displayName || user.email || 'Usuario',
      email: data.email || user.email,
      rol,
      role: rol,
      sedes,
      sedeIds: sedes,
      activo,
      active: activo,
      perfilCompleto: Boolean(rol)
    };
  };

  const loadUserProfile = async (user) => {
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    if (!docSnap.exists()) {
      return normalizeProfile(user, {
        rol: null,
        sedes: [],
        activo: false,
        perfilCompleto: false
      });
    }

    return normalizeProfile(user, docSnap.data());
  };

  const availableSedes = useMemo(() => {
    if (!userProfile?.perfilCompleto || !userProfile?.activo) return [];
    if (userProfile.rol === ROLES.ADMIN) return SEDES;

    const allowedSedeIds = normalizeSedeIds(userProfile.sedes || userProfile.sedeIds);
    return SEDES.filter((sede) => allowedSedeIds.includes(sede.id));
  }, [userProfile]);

  const activeSede = useMemo(() => {
    return availableSedes.find((sede) => sede.id === activeSedeId) || availableSedes[0] || null;
  }, [activeSedeId, availableSedes]);

  const setActiveSedeId = (sedeId) => {
    if (!SEDE_IDS.includes(sedeId)) return;
    setActiveSedeIdState(sedeId);
    localStorage.setItem(ACTIVE_SEDE_STORAGE_KEY, sedeId);
  };

  const login = async (email, password) => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const profile = await loadUserProfile(res.user);

    if (!profile.perfilCompleto) {
      await signOut(auth);
      throw new Error('Tu cuenta todavia no tiene un rol asignado.');
    }

    if (!profile.activo) {
      await signOut(auth);
      throw new Error('Tu cuenta esta desactivada.');
    }

    setUserProfile(profile);
    return { user: res.user, profile };
  };

  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  const saveUserRoleProfile = async (uid, email, nombre, rol, sedes = []) => {
    const normalizedSedes = normalizeSedeIds(sedes);
    const profileData = {
      uid,
      nombre,
      email,
      rol,
      role: rol,
      sedes: normalizedSedes,
      sedeIds: normalizedSedes,
      activo: true,
      active: true
    };

    await setDoc(doc(db, 'users', uid), profileData, { merge: true });
    return profileData;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profile = await loadUserProfile(user);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error al cargar perfil de Firestore:', error);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!availableSedes.length) {
      setActiveSedeIdState(null);
      return;
    }

    const savedSedeId = localStorage.getItem(ACTIVE_SEDE_STORAGE_KEY);
    const savedSedeIsAllowed = availableSedes.some((sede) => sede.id === savedSedeId);
    const currentSedeIsAllowed = availableSedes.some((sede) => sede.id === activeSedeId);

    if (savedSedeIsAllowed && !currentSedeIsAllowed) {
      setActiveSedeIdState(savedSedeId);
      return;
    }

    if (!currentSedeIsAllowed) {
      const defaultSedeId = availableSedes[0].id;
      setActiveSedeIdState(defaultSedeId);
      localStorage.setItem(ACTIVE_SEDE_STORAGE_KEY, defaultSedeId);
    }
  }, [activeSedeId, availableSedes]);

  const value = {
    currentUser,
    userProfile,
    activeSede,
    activeSedeId,
    availableSedes,
    getRoleHomePath,
    login,
    logout,
    saveUserRoleProfile,
    setActiveSedeId,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
