/**
 * Página de Configurações.
 * Permite:
 * - Editar meta calórica diária
 * - Alternar tema (dark/light)
 * - Exportar dados em CSV ou JSON (bônus)
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useCalorieGoal } from '@/hooks/use-calorie-goal';
import { useMeals } from '@/hooks/use-meals';
import { useFasting } from '@/hooks/use-fasting';
import { useTheme } from 'next-themes';
import { calorieGoalSchema } from '@/lib/validators';
import { MEAL_TYPE_LABELS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Settings, Target, Sun, Moon, Download, FileJson, FileSpreadsheet } from 'lucide-react';

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { calorieGoal, updateGoal } = useCalorieGoal();
  const { meals } = useMeals();
  const { fastings } = useFasting();
  const { theme, setTheme } = useTheme();

  const [goalInput, setGoalInput] = useState('');
  const [goalError, setGoalError] = useState('');
  const [mounted, setMounted] = useState(false);

  // Necessário para evitar mismatch de hydration com next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  // Inicializa o input com a meta atual
  useEffect(() => {
    setGoalInput(calorieGoal.toString());
  }, [calorieGoal]);

  /**
   * Salva a nova meta calórica após validação com Zod.
   */
  const handleSaveGoal = () => {
    setGoalError('');
    const result = calorieGoalSchema.safeParse({ calorieGoal: Number(goalInput) });

    if (!result.success) {
      setGoalError(result.error.issues[0]?.message || 'Valor inválido.');
      return;
    }

    updateGoal(result.data.calorieGoal);
    toast.success('Meta calórica atualizada!');
  };

  /**
   * Exporta os dados do usuário em formato JSON.
   * Usa os dados já carregados pelos hooks (da API/banco de dados).
   */
  const exportJSON = () => {
    if (!user) return;
    const data = {
      usuario: { nome: user.name, email: user.email },
      refeicoes: meals,
      jejuns: fastings,
      metaCalórica: calorieGoal,
      exportadoEm: new Date().toISOString(),
    };

    // Cria blob e aciona o download
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritrack_${user.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados em JSON!');
  };

  /**
   * Exporta os registros de refeições em formato CSV.
   * Usa os dados já carregados pelo hook useMeals (da API/banco de dados).
   */
  const exportCSV = () => {
    if (!user) return;

    // Cabeçalho do CSV
    const headers = ['Data/Hora', 'Descrição', 'Calorias', 'Tipo de Refeição'];

    // Converte cada registro em uma linha CSV
    const rows = meals.map((m) => [
      m.dateTime,
      `"${m.description}"`, // Aspas para evitar problemas com vírgulas
      m.calories.toString(),
      MEAL_TYPE_LABELS[m.mealType] || m.mealType,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    // BOM (Byte Order Mark) para garantir encoding UTF-8 no Excel
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutritrack_refeicoes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Refeições exportadas em CSV!');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl flex items-center gap-2">
          <Settings className="h-7 w-7 text-muted-foreground" />
          Configurações
        </h1>
        <p className="text-muted-foreground">Personalize sua experiência</p>
      </div>

      {/* Meta Calórica */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-400" />
            Meta Calórica Diária
          </CardTitle>
          <CardDescription>
            Defina quantas calorias você deseja consumir por dia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="calorieGoal">Meta (kcal)</Label>
              <Input
                id="calorieGoal"
                type="number"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                min={500}
                max={10000}
                className={goalError ? 'border-destructive' : ''}
              />
              {goalError && <p className="text-sm text-destructive">{goalError}</p>}
            </div>
            <div className="flex items-end">
              <Button onClick={handleSaveGoal} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
                Salvar
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            A meta atual é <strong>{calorieGoal} kcal</strong>. Valores recomendados variam
            entre 1.500 e 3.000 kcal dependendo do seu perfil. Consulte um nutricionista.
          </p>
        </CardContent>
      </Card>

      {/* Tema */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {mounted && theme === 'dark' ? (
              <Moon className="h-5 w-5 text-violet-400" />
            ) : (
              <Sun className="h-5 w-5 text-amber-400" />
            )}
            Aparência
          </CardTitle>
          <CardDescription>Escolha entre modo claro e escuro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={mounted && theme === 'light' ? 'default' : 'outline'}
              onClick={() => setTheme('light')}
              className="flex-1"
            >
              <Sun className="mr-2 h-4 w-4" />
              Claro
            </Button>
            <Button
              variant={mounted && theme === 'dark' ? 'default' : 'outline'}
              onClick={() => setTheme('dark')}
              className="flex-1"
            >
              <Moon className="mr-2 h-4 w-4" />
              Escuro
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator className="opacity-50" />

      {/* Exportação de Dados (Bônus) */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-cyan-400" />
            Exportar Dados
          </CardTitle>
          <CardDescription>
            Baixe seus dados em formato JSON ou CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={exportJSON} className="flex-1">
              <FileJson className="mr-2 h-4 w-4 text-emerald-400" />
              Exportar JSON
            </Button>
            <Button variant="outline" onClick={exportCSV} className="flex-1">
              <FileSpreadsheet className="mr-2 h-4 w-4 text-teal-400" />
              Exportar CSV (Refeições)
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            O JSON contém todos os dados (refeições + jejuns). O CSV contém apenas refeições,
            compatível com Excel e Google Sheets.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
