'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { UserSession } from '@/types';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail // <-- Importamos a função do Firebase aqui
} from 'firebase/auth';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>; // <-- Adicionamos na interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Observador do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || 'Usuário',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Função de login via Firebase
  const login = useCallback(async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Email ou senha incorretos.' };
    }
  }, []);

  // Função de cadastro via Firebase + Salvar no SQLite
  const register = useCallback(async (name: string, email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });

      // Atualiza o estado manualmente com o nome correto,
      // porque o onAuthStateChanged pode disparar antes do updateProfile terminar
      setUser({
        id: userCredential.user.uid,
        email: email,
        name: name,
      });

      await fetch('/api/usuario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userCredential.user.uid,
          email: email,
          name: name,
        }),
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: 'Erro ao criar conta. O email já pode estar em uso.' };
    }
  }, []);

  // Função de logout via Firebase
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  }, []);

  // NOVA FUNÇÃO: Recuperar Senha via Firebase
  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      console.error("Erro ao recuperar senha:", error);
      return { success: false, error: 'Erro ao enviar email. Verifique se o endereço está correto e cadastrado.' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}