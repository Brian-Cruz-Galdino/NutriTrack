/**
 * Página de Histórico de Jejuns.
 * Exibe uma tabela com todos os jejuns concluídos do usuário,
 * ordenados do mais recente ao mais antigo.
 * Mostra: data, tipo, início, fim, duração e status.
 */

'use client';

import { useFasting } from '@/hooks/use-fasting';
import { FASTING_TYPE_LABELS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { History, Timer, Clock, Trophy } from 'lucide-react';

export default function HistoricoPage() {
  const { fastings, getFastingDuration, loading } = useFasting();

  // Filtra apenas jejuns concluídos e ordena por data
  const completedFastings = fastings
    .filter((f) => f.status === 'concluido')
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  /**
   * Formata a duração em horas e minutos de forma legível.
   */
  const formatDuration = (hours: number): string => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}min`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl flex items-center gap-2">
          <History className="h-7 w-7 text-violet-400" />
          Histórico de Jejuns
        </h1>
        <p className="text-muted-foreground">
          Veja todos os seus jejuns concluídos
        </p>
      </div>

      {/* Resumo rápido */}
      {completedFastings.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/15">
                <Trophy className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Jejuns</p>
                <p className="text-xl font-bold">{completedFastings.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/15">
                <Clock className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-xl font-bold">
                  {formatDuration(
                    completedFastings.reduce((sum, f) => sum + getFastingDuration(f), 0) /
                      completedFastings.length
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/15">
                <Timer className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Maior Jejum</p>
                <p className="text-xl font-bold">
                  {formatDuration(
                    Math.max(...completedFastings.map((f) => getFastingDuration(f)))
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de jejuns */}
      {completedFastings.length === 0 ? (
        // Estado vazio
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Nenhum jejum concluído
            </p>
            <p className="text-sm text-muted-foreground/70">
              Inicie e conclua um jejum para ver o histórico aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {completedFastings.map((fasting) => {
            const duration = getFastingDuration(fasting);
            const reachedGoal = duration >= fasting.plannedHours;

            return (
              <Card key={fasting.id} className="border-border/50 hover:border-violet-500/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        reachedGoal ? 'bg-emerald-500/15' : 'bg-amber-500/15'
                      }`}>
                        {reachedGoal ? (
                          <Trophy className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Timer className="h-5 w-5 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {format(new Date(fasting.startTime), 'dd/MM/yyyy')}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {FASTING_TYPE_LABELS[fasting.plannedType]?.split(' ')[0] || fasting.plannedType}
                          </Badge>
                          {reachedGoal && (
                            <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                              Meta atingida ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(fasting.startTime), 'HH:mm')}
                          {' → '}
                          {fasting.endTime && format(new Date(fasting.endTime), 'HH:mm')}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-violet-400">
                        {formatDuration(duration)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Planejado: {fasting.plannedHours}h
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
