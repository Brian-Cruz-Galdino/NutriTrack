'use client';

import { useState, useEffect, useCallback } from 'react';
import { FastingEntry, FastingType } from '@/types';
import { useAuth } from './use-auth';

export function useFasting() {
  const { user, loading: authLoading } = useAuth();
  const [fastings, setFastings] = useState<FastingEntry[]>([]);
  const [activeFasting, setActiveFasting] = useState<FastingEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFastings = useCallback(async () => {
    if (!user) {
      setTimeout(() => setLoading(false), 0);
      return;
    }

    try {
      const res = await fetch(`/api/jejum?userId=${user.id}`);
      if (res.ok) {
        const data: FastingEntry[] = await res.json();
        setFastings(data);
        
        const active = data.find((f) => f.status === 'ativo');
        setActiveFasting(active || null);
      }
    } catch (error) {
      console.error("Erro ao carregar jejuns", error);
    } finally {
      setTimeout(() => setLoading(false), 0);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      loadFastings();
    }
  }, [authLoading, loadFastings]);

  const startFasting = useCallback(async (plannedType: FastingType, plannedHours: number): Promise<boolean> => {
    if (!user || activeFasting) return false;

    const res = await fetch('/api/jejum', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        startTime: new Date().toISOString(),
        plannedType,
        plannedHours,
        status: 'ativo'
      }),
    });

    if (res.ok) {
      await loadFastings();
      return true;
    }
    return false;
  }, [user, activeFasting, loadFastings]);

  const endFasting = useCallback(async () => {
    if (!user || !activeFasting) return;

    await fetch(`/api/jejum/${activeFasting.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endTime: new Date().toISOString(),
        status: 'concluido'
      }),
    });

    await loadFastings();
  }, [user, activeFasting, loadFastings]);

  const getCompletedFastings = useCallback((): FastingEntry[] => {
    return fastings.filter((f) => f.status === 'concluido');
  }, [fastings]);

  const getFastingDuration = useCallback((fasting: FastingEntry): number => {
    const start = new Date(fasting.startTime).getTime();
    const end = fasting.endTime
      ? new Date(fasting.endTime).getTime()
      : Date.now();
    return (end - start) / (1000 * 60 * 60);
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