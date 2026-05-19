/**
 * Hook de autenticação.
 * Gerencia o estado do usuário logado e fornece funções de login/logout/cadastro.
 * Usa Context API para compartilhar o estado de auth em toda a aplicação.
 */

'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { UserSession } from '@/types';
import { getSession, loginUser, logoutUser, registerUser } from '@/lib/auth';

/**
 * Interface do contexto de autenticação.
 * Define todas as funções e estados disponíveis para os componentes.
 */
interface AuthContextType {
  user: UserSession | null;   // Usuário logado (ou null)
  loading: boolean;           // Estado de carregamento inicial
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Contexto com valor padrão undefined (será preenchido pelo Provider)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticação que envolve toda a aplicação.
 * Carrega a sessão do localStorage na inicialização.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true); // Começa carregando

  // Ao montar, verifica se há sessão salva no localStorage
  useEffect(() => {
    const session = getSession();
    setUser(session);
    setLoading(false);
  }, []);

  // Função de login com feedback de erro
  const login = useCallback(async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.success && result.session) {
      setUser(result.session);
    }
    return { success: result.success, error: result.error };
  }, []);

  // Função de cadastro
  const register = useCallback(async (name: string, email: string, password: string) => {
    const result = await registerUser(name, email, password);
    if (result.success && result.session) {
      setUser(result.session);
    }
    return { success: result.success, error: result.error };
  }, []);

  // Função de logout
  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de autenticação.
 * Deve ser usado dentro de um AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
