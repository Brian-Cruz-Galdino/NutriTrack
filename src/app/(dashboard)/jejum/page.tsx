/**
 * Página de Jejum Intermitente.
 * Permite:
 * - Iniciar um novo jejum (selecionando tipo e duração)
 * - Visualizar o jejum ativo com timer em tempo real
 * - Encerrar o jejum ativo
 * Regra: apenas 1 jejum ativo por vez.
 */

'use client';

import { useState, useEffect } from 'react';
import { useFasting } from '@/hooks/use-fasting';
import { fastingSchema } from '@/lib/validators';
import { FastingType, FASTING_TYPE_LABELS, FASTING_DEFAULT_HOURS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Timer, Play, Square, Clock, AlertTriangle, Zap } from 'lucide-react';

export default function JejumPage() {
  const { activeFasting, startFasting, endFasting } = useFasting();

  // Estado do formulário de novo jejum
  const [selectedType, setSelectedType] = useState<FastingType>('16:8');
  const [plannedHours, setPlannedHours] = useState(16);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado do timer em tempo real
  const [elapsed, setElapsed] = useState({ hours: 0, minutes: 0, seconds: 0, total: 0 });

  /**
   * Atualiza as horas planejadas quando o tipo de jejum muda.
   * Tipos pré-definidos têm horas fixas; 'personalizado' permite valor livre.
   */
  useEffect(() => {
    setPlannedHours(FASTING_DEFAULT_HOURS[selectedType]);
  }, [selectedType]);

  /**
   * Timer que atualiza a cada segundo enquanto há um jejum ativo.
   * Calcula horas, minutos e segundos desde o início do jejum.
   * Também verifica se o tempo planejado foi atingido e notifica o usuário.
   */
  useEffect(() => {
    if (!activeFasting) {
      setElapsed({ hours: 0, minutes: 0, seconds: 0, total: 0 });
      return;
    }

    let notified = false; // Flag para evitar notificação duplicada

    const updateTimer = () => {
      const start = new Date(activeFasting.startTime).getTime();
      const now = Date.now();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const totalHours = diff / (1000 * 60 * 60);

      setElapsed({ hours, minutes, seconds, total: totalHours });

      // Notificação quando o tempo planejado é atingido (bônus)
      if (!notified && totalHours >= activeFasting.plannedHours) {
        notified = true;
        toast.success('🎉 Tempo de jejum planejado atingido! Você pode encerrar agora.');

        // Tenta enviar notificação do navegador (se permitido)
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('NutriTrack - Jejum Completo!', {
            body: `Seu jejum de ${activeFasting.plannedHours}h foi concluído.`,
            icon: '/favicon.ico',
          });
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeFasting]);

  /**
   * Solicita permissão para notificações do navegador.
   * Usado como bônus para notificar fim do jejum.
   */
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  /**
   * Inicia um novo jejum após validação com Zod.
   */
  const handleStartFasting = () => {
    setErrors({});

    const result = fastingSchema.safeParse({
      plannedType: selectedType,
      plannedHours,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const success = startFasting(selectedType, plannedHours);
    if (success) {
      toast.success('Jejum iniciado! Boa sorte 💪');
    } else {
      toast.error('Já existe um jejum ativo.');
    }
  };

  /**
   * Encerra o jejum ativo.
   */
  const handleEndFasting = () => {
    endFasting();
    toast.success('Jejum encerrado! Bom trabalho 🎉');
  };

  // Porcentagem de progresso do jejum ativo
  const progressPercent = activeFasting
    ? Math.min((elapsed.total / activeFasting.plannedHours) * 100, 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl flex items-center gap-2">
          <Timer className="h-7 w-7 text-violet-400" />
          Jejum Intermitente
        </h1>
        <p className="text-muted-foreground">
          Controle seus ciclos de jejum e acompanhe o progresso
        </p>
      </div>

      {activeFasting ? (
        /* ==================== JEJUM ATIVO ==================== */
        <div className="space-y-6">
          <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/20 to-purple-950/20">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 animate-pulse">
                <Timer className="h-8 w-8 text-violet-400" />
              </div>
              <CardTitle className="text-xl">Jejum em Andamento</CardTitle>
              <CardDescription>
                Tipo: <Badge variant="outline" className="border-violet-500/50 text-violet-400 ml-1">{activeFasting.plannedType}</Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer grande */}
              <div className="text-center">
                <p className="text-5xl md:text-6xl font-mono font-bold text-violet-400 tracking-wider">
                  {elapsed.hours.toString().padStart(2, '0')}
                  <span className="animate-pulse">:</span>
                  {elapsed.minutes.toString().padStart(2, '0')}
                  <span className="animate-pulse">:</span>
                  {elapsed.seconds.toString().padStart(2, '0')}
                </p>
              </div>

              {/* Barra de progresso */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{Math.round(progressPercent)}%</span>
                </div>
                <Progress value={progressPercent} className="h-3 bg-violet-950/30" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    <Clock className="inline h-3 w-3 mr-1" />
                    Início: {format(new Date(activeFasting.startTime), "dd/MM/yyyy 'às' HH:mm")}
                  </span>
                  <span>Meta: {activeFasting.plannedHours}h</span>
                </div>
              </div>

              {/* Aviso se passou do tempo */}
              {elapsed.total >= activeFasting.plannedHours && (
                <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3 text-sm text-emerald-400">
                  <Zap className="h-4 w-4 flex-shrink-0" />
                  <span>Você atingiu o tempo planejado! Pode encerrar o jejum quando quiser.</span>
                </div>
              )}

              {/* Botão encerrar com confirmação */}
              <AlertDialog>
                <AlertDialogTrigger
                  render={<Button variant="outline" className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300" />}
                >
                  <Square className="mr-2 h-4 w-4" />
                  Encerrar Jejum
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Encerrar jejum?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Seu jejum atual tem {elapsed.hours}h {elapsed.minutes}min de duração.
                      Deseja encerrar agora?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Continuar Jejuando</AlertDialogCancel>
                    <AlertDialogAction onClick={handleEndFasting}>
                      Encerrar Jejum
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          {/* Aviso: apenas 1 jejum ativo */}
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm text-amber-400">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>Você só pode ter um jejum ativo por vez. Encerre o atual para iniciar outro.</span>
          </div>
        </div>
      ) : (
        /* ==================== FORMULÁRIO PARA INICIAR JEJUM ==================== */
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-emerald-400" />
              Iniciar Novo Jejum
            </CardTitle>
            <CardDescription>
              Escolha o tipo de jejum e a duração planejada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tipo de Jejum */}
            <div className="space-y-2">
              <Label htmlFor="fastingType">Tipo de Jejum</Label>
              <select
                id="fastingType"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as FastingType)}
                className={`flex h-10 w-full items-center rounded-lg border bg-background text-foreground px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${errors.plannedType ? 'border-destructive' : 'border-input'}`}
              >
                {(Object.keys(FASTING_TYPE_LABELS) as FastingType[]).map((type) => (
                  <option key={type} value={type}>
                    {FASTING_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              {errors.plannedType && <p className="text-sm text-destructive">{errors.plannedType}</p>}
            </div>

            {/* Horas Planejadas (editável se personalizado) */}
            <div className="space-y-2">
              <Label htmlFor="plannedHours">Duração Planejada (horas)</Label>
              <Input
                id="plannedHours"
                type="number"
                value={plannedHours}
                onChange={(e) => setPlannedHours(Number(e.target.value))}
                disabled={selectedType !== 'personalizado'}
                min={1}
                max={72}
                className={errors.plannedHours ? 'border-destructive' : ''}
              />
              {errors.plannedHours && <p className="text-sm text-destructive">{errors.plannedHours}</p>}
              {selectedType !== 'personalizado' && (
                <p className="text-xs text-muted-foreground">
                  Selecione &quot;Personalizado&quot; para definir uma duração livre.
                </p>
              )}
            </div>

            <Button
              onClick={handleStartFasting}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
            >
              <Play className="mr-2 h-4 w-4" />
              Iniciar Jejum Agora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Dicas sobre jejum */}
      <Card className="border-border/50 bg-card/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            💡 <strong>Sobre jejum intermitente:</strong> O jejum intermitente é uma prática que alterna
            períodos de alimentação e jejum. Os protocolos mais comuns são 16:8 (16h de jejum,
            8h de alimentação), 18:6 e 20:4. Sempre consulte um profissional de saúde antes de
            iniciar qualquer protocolo de jejum.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
