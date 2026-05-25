/**
 * Página principal do Dashboard.
 * Exibe:
 * - Barra de progresso de calorias (consumo vs meta)
 * - Gráfico semanal de calorias com linha de meta
 * - Gráfico/indicadores de horas de jejum por dia
 * - Cards com indicadores agregados (média, total de jejuns, tempo médio)
 * - Resumo do jejum ativo (se houver)
 */

'use client';

import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useMeals } from '@/hooks/use-meals';
import { useFasting } from '@/hooks/use-fasting';
import { useCalorieGoal } from '@/hooks/use-calorie-goal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Flame,
  Target,
  Timer,
  TrendingUp,
  Award,
  Clock,
  Utensils,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { meals } = useMeals();
  const { activeFasting, fastings, getFastingDuration, getCompletedFastings } = useFasting();
  const { calorieGoal } = useCalorieGoal();

  // Estado para o timer do jejum ativo (atualiza a cada segundo)
  const [fastingElapsed, setFastingElapsed] = useState('00:00:00');

  /**
   * Timer que atualiza a cada segundo mostrando a duração do jejum ativo.
   * Usa setInterval para atualizar em tempo real.
   */
  useEffect(() => {
    if (!activeFasting) {
      setFastingElapsed('00:00:00');
      return;
    }

    const updateTimer = () => {
      const start = new Date(activeFasting.startTime).getTime();
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setFastingElapsed(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval); // Limpa o interval ao desmontar
  }, [activeFasting]);

  /**
   * Calcula os dados dos últimos 7 dias para o gráfico de calorias.
   * Para cada dia, soma todas as calorias registradas naquele dia.
   */
  const weeklyCalorieData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMeals = meals.filter((m) => m.dateTime.startsWith(dateStr));
      const totalCalories = dayMeals.reduce((sum, m) => sum + m.calories, 0);

      data.push({
        dia: format(date, 'EEE', { locale: ptBR }), // Nome abreviado do dia
        calorias: totalCalories,
        meta: calorieGoal,
      });
    }
    return data;
  }, [meals, calorieGoal]);

  /**
   * Calcula as horas de jejum por dia nos últimos 7 dias.
   * Considera jejuns concluídos e o jejum ativo (parcial).
   */
  const weeklyFastingData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date).getTime();
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;

      // Filtra jejuns que intersectam com este dia
      let totalHours = 0;
      fastings.forEach((f) => {
        const fStart = new Date(f.startTime).getTime();
        const fEnd = f.endTime ? new Date(f.endTime).getTime() : Date.now();

        // Calcula a interseção entre o jejum e o dia
        const overlapStart = Math.max(fStart, dayStart);
        const overlapEnd = Math.min(fEnd, dayEnd);

        if (overlapStart < overlapEnd) {
          totalHours += (overlapEnd - overlapStart) / (1000 * 60 * 60);
        }
      });

      data.push({
        dia: format(date, 'EEE', { locale: ptBR }),
        horas: Math.round(totalHours * 10) / 10, // Arredonda para 1 decimal
      });
    }
    return data;
  }, [fastings]);

  /**
   * Indicadores agregados da semana.
   */
  const weeklyStats = useMemo(() => {
    // Média diária de calorias na semana
    const totalCalories = weeklyCalorieData.reduce((sum, d) => sum + d.calorias, 0);
    const avgCalories = Math.round(totalCalories / 7);

    // Total de jejuns concluídos na semana
    const sevenDaysAgo = subDays(new Date(), 7).toISOString();
    const weekFastings = getCompletedFastings().filter(
      (f) => f.endTime && f.endTime >= sevenDaysAgo
    );

    // Tempo médio de jejum na semana
    const avgFastingHours =
      weekFastings.length > 0
        ? weekFastings.reduce((sum, f) => sum + getFastingDuration(f), 0) / weekFastings.length
        : 0;

    return {
      avgCalories,
      totalFastings: weekFastings.length,
      avgFastingHours: Math.round(avgFastingHours * 10) / 10,
    };
  }, [weeklyCalorieData, getCompletedFastings, getFastingDuration]);

  // Calorias consumidas hoje
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayCalories = meals
    .filter((m) => m.dateTime.startsWith(todayStr))
    .reduce((sum, m) => sum + m.calories, 0);
  const progressPercent = Math.min((todayCalories / calorieGoal) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Saudação */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">
          Olá, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground">
          Acompanhe seu progresso de hoje e da semana.
        </p>
      </div>

      {/* Cards de indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card: Calorias Hoje */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-emerald-950/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Calorias Hoje</p>
                <p className="text-2xl font-bold">{todayCalories}</p>
                <p className="text-xs text-muted-foreground">de {calorieGoal} kcal</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/15">
                <Flame className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Meta Diária */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-teal-950/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Meta Diária</p>
                <p className="text-2xl font-bold">{calorieGoal}</p>
                <p className="text-xs text-muted-foreground">kcal</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/15">
                <Target className="h-6 w-6 text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Média Semanal */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-cyan-950/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Semanal</p>
                <p className="text-2xl font-bold">{weeklyStats.avgCalories}</p>
                <p className="text-xs text-muted-foreground">kcal/dia</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/15">
                <TrendingUp className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Jejuns da Semana */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-violet-950/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jejuns na Semana</p>
                <p className="text-2xl font-bold">{weeklyStats.totalFastings}</p>
                <p className="text-xs text-muted-foreground">
                  ~{weeklyStats.avgFastingHours}h média
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15">
                <Award className="h-6 w-6 text-violet-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de progresso do dia */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Utensils className="h-4 w-4 text-emerald-400" />
            Progresso de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{todayCalories} kcal consumidas</span>
              <span className="text-muted-foreground">{calorieGoal} kcal meta</span>
            </div>
            <Progress
              value={progressPercent}
              className="h-3 bg-muted"
            />
            <p className="text-xs text-muted-foreground text-right">
              {todayCalories >= calorieGoal
                ? '✅ Meta atingida!'
                : `Faltam ${calorieGoal - todayCalories} kcal`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Jejum Ativo */}
      {activeFasting && (
        <Card className="border-violet-500/30 bg-gradient-to-r from-violet-950/20 to-purple-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4 text-violet-400 animate-pulse" />
              Jejum em Andamento
              <Badge variant="outline" className="ml-auto border-violet-500/50 text-violet-400">
                {activeFasting.plannedType}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-mono font-bold text-violet-400">
                  {fastingElapsed}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <Clock className="inline h-3 w-3 mr-1" />
                  Início: {format(new Date(activeFasting.startTime), "dd/MM 'às' HH:mm")}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Planejado</p>
                <p className="text-lg font-bold">{activeFasting.plannedHours}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Gráfico de Calorias Semanal */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-emerald-400" />
              Calorias — Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyCalorieData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={12} tick={{ fill: 'var(--color-muted-foreground)' }} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tick={{ fill: 'var(--color-muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                    formatter={(value) => [`${value} kcal`, 'Calorias']}
                  />
                  {/* Barra de calorias com gradiente verde */}
                  <Bar dataKey="calorias" fill="#10b981" radius={[4, 4, 0, 0]} />
                  {/* Linha de referência da meta */}
                  <ReferenceLine
                    y={calorieGoal}
                    stroke="#f59e0b"
                    strokeDasharray="5 5"
                    label={{
                      value: `Meta: ${calorieGoal}`,
                      position: 'right',
                      fill: '#f59e0b',
                      fontSize: 11,
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Horas de Jejum Semanal */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Timer className="h-4 w-4 text-violet-400" />
              Horas de Jejum — Últimos 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyFastingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="dia" stroke="var(--color-muted-foreground)" fontSize={12} tick={{ fill: 'var(--color-muted-foreground)' }} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tick={{ fill: 'var(--color-muted-foreground)' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)' }}
                    formatter={(value) => [`${value}h`, 'Jejum']}
                  />
                  <Line
                    type="monotone"
                    dataKey="horas"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
