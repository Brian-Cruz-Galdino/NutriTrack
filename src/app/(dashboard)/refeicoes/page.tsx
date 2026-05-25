/**
 * Página de Refeições — CRUD completo.
 * Permite criar, listar (com filtro por data), editar e excluir registros de refeições.
 * Cada registro contém: data/hora, descrição, calorias e tipo de refeição.
 */

'use client';

import { useState, useMemo } from 'react';
import { useMeals } from '@/hooks/use-meals';
import { useCalorieGoal } from '@/hooks/use-calorie-goal';
import { calorieEntrySchema } from '@/lib/validators';
import { CalorieEntry, MealType, MEAL_TYPE_LABELS, MEAL_TYPE_EMOJIS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Plus, Pencil, Trash2, Utensils, Search, Flame } from 'lucide-react';

export default function RefeicoesPage() {
  const { meals, createMeal, editMeal, removeMeal } = useMeals();
  const { calorieGoal } = useCalorieGoal();

  // Estado do filtro de data
  const [filterDate, setFilterDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Estados do modal de criar/editar
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<CalorieEntry | null>(null);
  const [formData, setFormData] = useState({
    dateTime: '',
    description: '',
    calories: '',
    mealType: '' as MealType | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Filtra as refeições pela data selecionada.
   * Usa useMemo para evitar recálculos desnecessários.
   */
  const filteredMeals = useMemo(() => {
    return meals.filter((m) => m.dateTime.startsWith(filterDate));
  }, [meals, filterDate]);

  // Total de calorias do dia filtrado
  const dayTotal = filteredMeals.reduce((sum, m) => sum + m.calories, 0);
  const progressPercent = Math.min((dayTotal / calorieGoal) * 100, 100);

  /**
   * Abre o modal para criar uma nova refeição.
   * Preenche a data/hora com o valor atual.
   */
  const openCreateDialog = () => {
    setEditingMeal(null);
    setFormData({
      dateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      description: '',
      calories: '',
      mealType: '',
    });
    setErrors({});
    setDialogOpen(true);
  };

  /**
   * Abre o modal para editar uma refeição existente.
   * Preenche o formulário com os dados atuais.
   */
  const openEditDialog = (meal: CalorieEntry) => {
    setEditingMeal(meal);
    setFormData({
      dateTime: meal.dateTime.slice(0, 16), // Formata para input datetime-local
      description: meal.description,
      calories: meal.calories.toString(),
      mealType: meal.mealType,
    });
    setErrors({});
    setDialogOpen(true);
  };

  /**
   * Salva (cria ou edita) uma refeição.
   * Valida com Zod antes de salvar.
   */
  const handleSave = () => {
    const dataToValidate = {
      dateTime: formData.dateTime,
      description: formData.description,
      calories: Number(formData.calories),
      mealType: formData.mealType as MealType,
    };

    // Validação com Zod
    const result = calorieEntrySchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (editingMeal) {
      // Modo edição: atualiza o registro existente
      editMeal(editingMeal.id, result.data);
      toast.success('Refeição atualizada!');
    } else {
      // Modo criação: cria novo registro
      createMeal(result.data);
      toast.success('Refeição registrada!');
    }

    setDialogOpen(false);
  };

  /**
   * Exclui uma refeição (chamado após confirmação no AlertDialog).
   */
  const handleDelete = (id: string) => {
    removeMeal(id);
    toast.success('Refeição excluída.');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl flex items-center gap-2">
            <Utensils className="h-7 w-7 text-emerald-400" />
            Refeições
          </h1>
          <p className="text-muted-foreground">Registre e acompanhe suas refeições</p>
        </div>

        {/* Botão de nova refeição */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger
            onClick={openCreateDialog}
            render={<Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500" />}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Refeição
          </DialogTrigger>

          {/* Modal de criar/editar refeição */}
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMeal ? 'Editar Refeição' : 'Nova Refeição'}
              </DialogTitle>
              <DialogDescription>
                {editingMeal
                  ? 'Atualize os dados da refeição.'
                  : 'Preencha os dados da refeição para registrar.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Data e Hora */}
              <div className="space-y-2">
                <Label htmlFor="dateTime">Data e Hora</Label>
                <Input
                  id="dateTime"
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                  className={errors.dateTime ? 'border-destructive' : ''}
                />
                {errors.dateTime && <p className="text-sm text-destructive">{errors.dateTime}</p>}
              </div>

              {/* Descrição do Alimento */}
              <div className="space-y-2">
                <Label htmlFor="description">Alimento / Descrição</Label>
                <Input
                  id="description"
                  placeholder="Ex: Arroz com feijão e salada"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={errors.description ? 'border-destructive' : ''}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
              </div>

              {/* Calorias */}
              <div className="space-y-2">
                <Label htmlFor="calories">Calorias (kcal)</Label>
                <Input
                  id="calories"
                  type="number"
                  placeholder="Ex: 450"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  className={errors.calories ? 'border-destructive' : ''}
                  min="1"
                  max="10000"
                />
                {errors.calories && <p className="text-sm text-destructive">{errors.calories}</p>}
              </div>

              {/* Tipo de Refeição */}
              <div className="space-y-2">
                <Label htmlFor="mealType">Tipo de Refeição</Label>
                <select
                  id="mealType"
                  value={formData.mealType}
                  onChange={(e) => setFormData({ ...formData, mealType: e.target.value as MealType })}
                  className={`flex h-10 w-full items-center rounded-lg border bg-background text-foreground px-3 py-2 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ${errors.mealType ? 'border-destructive' : 'border-input'}`}
                >
                  <option value="">Selecione o tipo</option>
                  {(Object.keys(MEAL_TYPE_LABELS) as MealType[]).map((type) => (
                    <option key={type} value={type}>
                      {MEAL_TYPE_EMOJIS[type]} {MEAL_TYPE_LABELS[type]}
                    </option>
                  ))}
                </select>
                {errors.mealType && <p className="text-sm text-destructive">{errors.mealType}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
                {editingMeal ? 'Salvar Alterações' : 'Registrar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtro por data + resumo do dia */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="filterDate" className="text-sm text-muted-foreground">
                Filtrar por data:
              </Label>
              <Input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total do dia</p>
                <p className="text-lg font-bold flex items-center gap-1">
                  <Flame className="h-4 w-4 text-emerald-400" />
                  {dayTotal} / {calorieGoal} kcal
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={progressPercent} className="h-2 bg-muted" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de refeições */}
      {filteredMeals.length === 0 ? (
        // Estado vazio
        <Card className="border-border/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Utensils className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Nenhuma refeição registrada
            </p>
            <p className="text-sm text-muted-foreground/70 mb-4">
              Comece registrando sua primeira refeição do dia.
            </p>
            <Button onClick={openCreateDialog} variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Refeição
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredMeals.map((meal) => (
            <Card key={meal.id} className="border-border/50 hover:border-emerald-500/30 transition-colors group">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Emoji do tipo de refeição */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-lg">
                      {MEAL_TYPE_EMOJIS[meal.mealType]}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{meal.description}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary" className="text-xs">
                          {MEAL_TYPE_LABELS[meal.mealType]}
                        </Badge>
                        <span>
                          {format(new Date(meal.dateTime), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Calorias */}
                    <span className="font-bold text-emerald-400 whitespace-nowrap">
                      {meal.calories} kcal
                    </span>

                    {/* Botão Editar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(meal)}
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Editar refeição"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    {/* Botão Excluir com confirmação */}
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Excluir refeição"
                          />
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir refeição?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir &quot;{meal.description}&quot;?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(meal.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
