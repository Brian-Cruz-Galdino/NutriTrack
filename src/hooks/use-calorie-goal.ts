/**
 * Hook para gerenciar a meta calórica diária do usuário.
 * Lê e atualiza a meta no registro do usuário no localStorage.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getUserById, updateUser } from '@/lib/storage';
import { useAuth } from './use-auth';

export function useCalorieGoal() {
  const { user } = useAuth();
  const [calorieGoal, setCalorieGoal] = useState<number>(2000); // Padrão: 2000 kcal
  const [loading, setLoading] = useState(true);

  /**
   * Carrega a meta calórica do usuário logado.
   */
  const loadGoal = useCallback(() => {
    if (!user) return;
    const fullUser = getUserById(user.id);
    if (fullUser) {
      setCalorieGoal(fullUser.calorieGoal);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadGoal();
  }, [loadGoal]);

  /**
   * Atualiza a meta calórica diária do usuário.
   * Salva imediatamente no localStorage.
   */
  const updateGoal = useCallback(
    (newGoal: number) => {
      if (!user) return;
      const fullUser = getUserById(user.id);
      if (fullUser) {
        updateUser({ ...fullUser, calorieGoal: newGoal });
        setCalorieGoal(newGoal);
      }
    },
    [user]
  );

  return { calorieGoal, loading, updateGoal };
}
