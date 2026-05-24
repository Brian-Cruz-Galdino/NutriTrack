'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

export function useCalorieGoal() {
  const { user, loading: authLoading } = useAuth();
  const [calorieGoal, setCalorieGoal] = useState<number>(2000);
  const [loading, setLoading] = useState(true);

  const loadGoal = useCallback(async () => {
    if (!user) {
      setTimeout(() => setLoading(false), 0);
      return;
    }
    
    try {
      const res = await fetch(`/api/usuario?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.calorieGoal) {
          setCalorieGoal(data.calorieGoal);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar meta calórica", error);
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadGoal();
    }
  }, [authLoading, loadGoal]);

  const updateGoal = useCallback(async (newGoal: number) => {
    if (!user) return;
    try {
      const res = await fetch('/api/usuario', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, calorieGoal: newGoal }),
      });
      if (res.ok) {
        setCalorieGoal(newGoal);
      }
    } catch (error) {
      console.error("Erro ao atualizar meta calórica", error);
    }
  }, [user]);

  return { calorieGoal, loading, updateGoal };
}