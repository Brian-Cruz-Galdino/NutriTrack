/**
 * Tipos e interfaces do sistema de calorias e jejum.
 * Centraliza todos os tipos usados no projeto para manter consistência.
 */

// Tipos de refeição disponíveis no sistema
export type MealType = 'cafe' | 'almoco' | 'lanche' | 'jantar' | 'ceia';

// Tipos de jejum intermitente suportados
export type FastingType = '16:8' | '18:6' | '20:4' | '24h' | 'personalizado';

// Status possíveis de um jejum
export type FastingStatus = 'ativo' | 'concluido';

/**
 * Interface do usuário armazenado no localStorage.
 * O passwordHash é gerado via SHA-256 no momento do cadastro.
 */
export interface User {
  id: string;           // UUID único gerado no cadastro
  email: string;        // Email do usuário (usado como login)
  name: string;         // Nome de exibição
  passwordHash: string; // Hash SHA-256 da senha
  calorieGoal: number;  // Meta diária de calorias (padrão: 2000)
  createdAt: string;    // Data de criação no formato ISO
}

/**
 * Dados da sessão do usuário logado.
 * Armazenados separadamente para não expor o hash da senha.
 */
export interface UserSession {
  id: string;
  email: string;
  name: string;
}

/**
 * Registro de uma refeição/alimento consumido.
 * Cada entrada pertence a um usuário (userId) e tem data/hora específica.
 */
export interface CalorieEntry {
  id: string;           // UUID único do registro
  userId: string;       // ID do usuário dono do registro
  dateTime: string;     // Data e hora da refeição (ISO string)
  description: string;  // Descrição do alimento (ex: "Arroz com feijão")
  calories: number;     // Quantidade de calorias
  mealType: MealType;   // Tipo da refeição (café, almoço, etc.)
  createdAt: string;    // Data de criação do registro
}

/**
 * Registro de um ciclo de jejum intermitente.
 * Apenas um jejum pode estar ativo por vez por usuário.
 */
export interface FastingEntry {
  id: string;              // UUID único do registro
  userId: string;          // ID do usuário
  startTime: string;       // Horário de início do jejum (ISO string)
  endTime: string | null;  // Horário de fim (null se ainda ativo)
  plannedType: FastingType; // Tipo de jejum planejado
  plannedHours: number;    // Duração planejada em horas
  status: FastingStatus;   // 'ativo' ou 'concluido'
  createdAt: string;       // Data de criação
}

/**
 * Labels amigáveis para os tipos de refeição (em português).
 */
export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  cafe: 'Café da Manhã',
  almoco: 'Almoço',
  lanche: 'Lanche',
  jantar: 'Jantar',
  ceia: 'Ceia',
};

/**
 * Emojis para cada tipo de refeição (usado na UI).
 */
export const MEAL_TYPE_EMOJIS: Record<MealType, string> = {
  cafe: '☕',
  almoco: '🍽️',
  lanche: '🥪',
  jantar: '🍛',
  ceia: '🌙',
};

/**
 * Labels amigáveis para os tipos de jejum.
 */
export const FASTING_TYPE_LABELS: Record<FastingType, string> = {
  '16:8': '16:8 (16h jejum, 8h alimentação)',
  '18:6': '18:6 (18h jejum, 6h alimentação)',
  '20:4': '20:4 (20h jejum, 4h alimentação)',
  '24h': '24 horas',
  'personalizado': 'Personalizado',
};

/**
 * Horas padrão para cada tipo de jejum.
 */
export const FASTING_DEFAULT_HOURS: Record<FastingType, number> = {
  '16:8': 16,
  '18:6': 18,
  '20:4': 20,
  '24h': 24,
  'personalizado': 12,
};
