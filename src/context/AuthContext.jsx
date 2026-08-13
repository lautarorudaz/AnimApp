import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login de usuarios
  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Cierre de sesión
  const logout = () => {
    setUserProfile(null);
    return signOut(auth);
  };

  // Crear usuario con datos extendidos (rol y sedes)
  const registerUserWithRole = async (email, password, nombre, rol, sedes = []) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    const profileData = {
      uid: user.uid,
      nombre,
      email,
      rol, // 'admin' | 'profesor' | 'recepcionista'
      sedes, // Array de IDs de sedes asignadas ej: ['sede_norte', 'sede_centro']
      creadoEn: new Date().toISOString(),
      activo: true
    };

    // Guardar perfil en Firestore
    await setDoc(doc(db, 'users', user.uid), profileData);
    return user;
  };

  // Escuchar estado de autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Intentar obtener el perfil guardado en Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // Perfil por defecto si no existe aún en Firestore
            setUserProfile({
              uid: user.uid,
              email: user.email,
              nombre: user.displayName || 'Usuario Staff',
              rol: 'admin', // Valor demostrativo por defecto
              sedes: ['sede_norte', 'sede_centro', 'sede_sur']
            });
          }
        } catch (error) {
          console.error("Error al cargar perfil de Firestore:", error);
          setUserProfile({
            uid: user.uid,
            email: user.email,
            nombre: 'Usuario Staff',
            rol: 'admin',
            sedes: ['sede_norte', 'sede_centro', 'sede_sur']
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    logout,
    registerUserWithRole,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
