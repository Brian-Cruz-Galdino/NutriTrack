/**
 * Schemas de validação com Zod.
 * Valida os dados no client-side antes de salvar no localStorage.
 * Cada schema define as regras de validação e mensagens de erro em PT-BR.
 */

import { z } from 'zod';

/**
 * Schema de cadastro de usuário.
 * Exige nome, email válido e senha com confirmação.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'O nome deve ter pelo menos 2 caracteres.')
      .max(100, 'O nome deve ter no máximo 100 caracteres.'),
    email: z
      .string()
      .email('Digite um email válido.'),
    password: z
      .string()
      .min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    confirmPassword: z
      .string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'], // Indica em qual campo mostrar o erro
  });

/**
 * Schema de login.
 * Valida apenas formato do email e presença da senha.
 */
export const loginSchema = z.object({
  email: z.string().email('Digite um email válido.'),
  password: z.string().min(1, 'Digite sua senha.'),
});

/**
 * Schema de recuperação de senha.
 */
export const resetPasswordSchema = z
  .object({
    email: z.string().email('Digite um email válido.'),
    newPassword: z.string().min(6, 'A nova senha deve ter pelo menos 6 caracteres.'),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmNewPassword'],
  });

/**
 * Schema de registro de refeição/calorias.
 * Valida descrição, calorias (positivas) e tipo de refeição.
 */
export const calorieEntrySchema = z.object({
  dateTime: z.string().min(1, 'Selecione a data e hora.'),
  description: z
    .string()
    .min(2, 'A descrição deve ter pelo menos 2 caracteres.')
    .max(200, 'A descrição deve ter no máximo 200 caracteres.'),
  calories: z
    .number({ error: 'Digite um número válido.' })
    .min(1, 'As calorias devem ser pelo menos 1.')
    .max(10000, 'Valor máximo de 10.000 calorias.'),
  mealType: z.enum(['cafe', 'almoco', 'lanche', 'jantar', 'ceia'], {
    message: 'Selecione o tipo de refeição.',
  }),
});

/**
 * Schema para iniciar um jejum.
 * Valida tipo e horas planejadas.
 */
export const fastingSchema = z.object({
  plannedType: z.enum(['16:8', '18:6', '20:4', '24h', 'personalizado'], {
    message: 'Selecione o tipo de jejum.',
  }),
  plannedHours: z
    .number({ error: 'Digite um número válido.' })
    .min(1, 'O jejum deve ter pelo menos 1 hora.')
    .max(72, 'O jejum não pode exceder 72 horas.'),
});

/**
 * Schema para meta calórica diária.
 */
export const calorieGoalSchema = z.object({
  calorieGoal: z
    .number({ error: 'Digite um número válido.' })
    .min(500, 'A meta mínima é 500 kcal.')
    .max(10000, 'A meta máxima é 10.000 kcal.'),
});

// Tipos inferidos dos schemas para uso nos formulários
export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type CalorieEntryFormData = z.infer<typeof calorieEntrySchema>;
export type FastingFormData = z.infer<typeof fastingSchema>;
export type CalorieGoalFormData = z.infer<typeof calorieGoalSchema>;
