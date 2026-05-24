'use client';

import { useState, useEffect, useCallback } from 'react';
import { CalorieEntry, MealType } from '@/types';
import { useAuth } from './use-auth';

export function useMeals() {
  const { user, loading: authLoading } = useAuth();
  const [meals, setMeals] = useState<CalorieEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMeals = useCallback(async () => {
    if (!user) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    try {
      const res = await fetch(`/api/refeicoes?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        
        // HACK DE FUSO HORÁRIO (Timezone Fix)
        // Converte a data UTC do Prisma de volta para a string YYYY-MM-DDTHH:mm local
        const refeicoesFormatadas = data.map((m: CalorieEntry) => {
          const d = new Date(m.dateTime);
          const tzOffset = d.getTimezoneOffset() * 60000;
          const localISOTime = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
          
          return { ...m, dateTime: localISOTime };
        });

        setMeals(refeicoesFormatadas);
      }
    } catch (error) {
      console.error("Erro ao carregar refeições", error);
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadMeals();
    }
  }, [authLoading, loadMeals]);

  const createMeal = useCallback(async (data: { dateTime: string; description: string; calories: number; mealType: MealType }) => {
    if (!user) return;
    await fetch('/api/refeicoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        ...data
      }),
    });
    await loadMeals();
  }, [user, loadMeals]);

  const editMeal = useCallback(async (id: string, data: { dateTime: string; description: string; calories: number; mealType: MealType }) => {
    if (!user) return;
    await fetch(`/api/refeicoes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await loadMeals();
  }, [user, loadMeals]);

  const removeMeal = useCallback(async (id: string) => {
    await fetch(`/api/refeicoes/${id}`, {
      method: 'DELETE',
    });
    await loadMeals();
  }, [loadMeals]);

  const getMealsByDate = useCallback((date: string): CalorieEntry[] => {
    return meals.filter((m) => String(m.dateTime).startsWith(date));
  }, [meals]);

  const getTotalCaloriesByDate = useCallback((date: string): number => {
    return getMealsByDate(date).reduce((sum, m) => sum + m.calories, 0);
  }, [getMealsByDate]);

  return {
    meals,
    loading,
    createMeal,
    editMeal,
    removeMeal,
    getMealsByDate,
    getTotalCaloriesByDate,
    refreshMeals: loadMeals,
  };
}