/**
 * Hook para gerenciar registros de jejum intermitente.
 * Controla iniciar, encerrar, listar e verificar jejum ativo.
 * Garante que apenas um jejum esteja ativo por vez.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FastingEntry, FastingType } from '@/types';
import {
  getUserFastingEntries,
  getActiveFasting,
  addFastingEntry,
  updateFastingEntry,
} from '@/lib/storage';
import { useAuth } from './use-auth';

export function useFasting() {
  const { user } = useAuth();
  const [fastings, setFastings] = useState<FastingEntry[]>([]);
  const [activeFasting, setActiveFasting] = useState<FastingEntry | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Carrega todos os jejuns do usuário e verifica se há jejum ativo.
   */
  const loadFastings = useCallback(() => {
    if (!user) return;
    const entries = getUserFastingEntries(user.id);
    // Ordena por data de início decrescente
    entries.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    setFastings(entries);
    setActiveFasting(getActiveFasting(user.id));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadFastings();
  }, [loadFastings]);

  /**
   * Inicia um novo jejum.
   * Verifica se já há um jejum ativo antes de criar.
   * @returns true se o jejum foi iniciado com sucesso
   */
  const startFasting = useCallback(
    (plannedType: FastingType, plannedHours: number): boolean => {
      if (!user) return false;

      // Verifica se já existe jejum ativo
      const active = getActiveFasting(user.id);
      if (active) return false;

      const entry: FastingEntry = {
        id: uuidv4(),
        userId: user.id,
        startTime: new Date().toISOString(),
        endTime: null,
        plannedType,
        plannedHours,
        status: 'ativo',
        createdAt: new Date().toISOString(),
      };

      addFastingEntry(entry);
      loadFastings();
      return true;
    },
    [user, loadFastings]
  );

  /**
   * Encerra o jejum ativo do usuário.
   * Calcula automaticamente a duração e marca como concluído.
   */
  const endFasting = useCallback(() => {
    if (!user || !activeFasting) return;

    const updatedEntry: FastingEntry = {
      ...activeFasting,
      endTime: new Date().toISOString(),
      status: 'concluido',
    };

    updateFastingEntry(updatedEntry);
    loadFastings();
  }, [user, activeFasting, loadFastings]);

  /**
   * Retorna a lista de jejuns concluídos (para histórico).
   */
  const getCompletedFastings = useCallback((): FastingEntry[] => {
    return fastings.filter((f) => f.status === 'concluido');
  }, [fastings]);

  /**
   * Calcula a duração de um jejum em horas.
   * Se o jejum estiver ativo, usa o horário atual como fim.
   */
  const getFastingDuration = useCallback((fasting: FastingEntry): number => {
    const start = new Date(fasting.startTime).getTime();
    const end = fasting.endTime
      ? new Date(fasting.endTime).getTime()
      : Date.now();
    return (end - start) / (1000 * 60 * 60); // Converte ms para horas
  }, []);

  return {
    fastings,
    activeFasting,
    loading,
    startFasting,
    endFasting,
    getCompletedFastings,
    getFastingDuration,
    refreshFastings: loadFastings,
  };
}
