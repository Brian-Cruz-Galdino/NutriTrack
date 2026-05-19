/**
 * Hook para gerenciar registros de refeições (CRUD completo).
 * Fornece funções para criar, listar, editar e excluir refeições,
 * sempre filtradas pelo usuário logado.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { CalorieEntry, MealType } from '@/types';
import {
  getUserCalorieEntries,
  addCalorieEntry,
  updateCalorieEntry,
  deleteCalorieEntry,
} from '@/lib/storage';
import { useAuth } from './use-auth';

export function useMeals() {
  const { user } = useAuth();
  const [meals, setMeals] = useState<CalorieEntry[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Carrega os registros do usuário logado.
   * Chamado na montagem e após cada operação CRUD.
   */
  const loadMeals = useCallback(() => {
    if (!user) return;
    const entries = getUserCalorieEntries(user.id);
    // Ordena por data/hora decrescente (mais recente primeiro)
    entries.sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
    setMeals(entries);
    setLoading(false);
  }, [user]);

  // Carrega os dados quando o componente monta ou o usuário muda
  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  /**
   * Cria um novo registro de refeição.
   * Gera UUID automático e timestamp de criação.
   */
  const createMeal = useCallback(
    (data: { dateTime: string; description: string; calories: number; mealType: MealType }) => {
      if (!user) return;
      const entry: CalorieEntry = {
        id: uuidv4(),
        userId: user.id,
        dateTime: data.dateTime,
        description: data.description,
        calories: data.calories,
        mealType: data.mealType,
        createdAt: new Date().toISOString(),
      };
      addCalorieEntry(entry);
      loadMeals(); // Recarrega a lista após inserção
    },
    [user, loadMeals]
  );

  /**
   * Atualiza um registro existente.
   * Mantém o ID, userId e createdAt originais.
   */
  const editMeal = useCallback(
    (id: string, data: { dateTime: string; description: string; calories: number; mealType: MealType }) => {
      if (!user) return;
      const existing = meals.find((m) => m.id === id);
      if (!existing) return;
      updateCalorieEntry({
        ...existing,
        ...data,
      });
      loadMeals(); // Recarrega a lista após atualização
    },
    [user, meals, loadMeals]
  );

  /**
   * Remove um registro de refeição pelo ID.
   */
  const removeMeal = useCallback(
    (id: string) => {
      deleteCalorieEntry(id);
      loadMeals(); // Recarrega a lista após remoção
    },
    [loadMeals]
  );

  /**
   * Filtra refeições por uma data específica (formato YYYY-MM-DD).
   */
  const getMealsByDate = useCallback(
    (date: string): CalorieEntry[] => {
      return meals.filter((m) => m.dateTime.startsWith(date));
    },
    [meals]
  );

  /**
   * Calcula o total de calorias consumidas em uma data específica.
   */
  const getTotalCaloriesByDate = useCallback(
    (date: string): number => {
      return getMealsByDate(date).reduce((sum, m) => sum + m.calories, 0);
    },
    [getMealsByDate]
  );

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
