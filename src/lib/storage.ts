/**
 * Módulo de acesso ao localStorage com tipagem segura.
 * Centraliza todas as operações de leitura/escrita no localStorage,
 * garantindo que os dados sejam sempre serializados/deserializados corretamente.
 */

import { User, CalorieEntry, FastingEntry, UserSession } from '@/types';

// Chaves usadas no localStorage
const STORAGE_KEYS = {
  USERS: 'nutri_users',               // Lista de todos os usuários cadastrados
  CURRENT_USER: 'nutri_current_user',  // Sessão do usuário logado
  CALORIE_ENTRIES: 'nutri_calorie_entries', // Registros de calorias
  FASTING_ENTRIES: 'nutri_fasting_entries', // Registros de jejum
} as const;

/**
 * Função genérica para ler dados do localStorage.
 * Retorna o valor deserializado ou o valor padrão se não existir.
 * @param key - Chave do localStorage
 * @param defaultValue - Valor padrão caso a chave não exista
 */
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue; // SSR safety
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Função genérica para salvar dados no localStorage.
 * Serializa o valor em JSON antes de salvar.
 */
function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ==================== USUÁRIOS ====================

/** Retorna todos os usuários cadastrados */
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, []);
}

/** Salva a lista completa de usuários */
export function setUsers(users: User[]): void {
  setItem(STORAGE_KEYS.USERS, users);
}

/** Busca um usuário pelo email */
export function getUserByEmail(email: string): User | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

/** Busca um usuário pelo ID */
export function getUserById(id: string): User | undefined {
  return getUsers().find((u) => u.id === id);
}

/** Adiciona um novo usuário à lista */
export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  setUsers(users);
}

/** Atualiza os dados de um usuário existente */
export function updateUser(updatedUser: User): void {
  const users = getUsers().map((u) =>
    u.id === updatedUser.id ? updatedUser : u
  );
  setUsers(users);
}

// ==================== SESSÃO ====================

/** Retorna a sessão do usuário logado (ou null) */
export function getCurrentUser(): UserSession | null {
  return getItem<UserSession | null>(STORAGE_KEYS.CURRENT_USER, null);
}

/** Salva a sessão do usuário logado */
export function setCurrentUser(session: UserSession | null): void {
  setItem(STORAGE_KEYS.CURRENT_USER, session);
}

// ==================== REGISTROS DE CALORIAS ====================

/** Retorna todos os registros de calorias */
export function getCalorieEntries(): CalorieEntry[] {
  return getItem<CalorieEntry[]>(STORAGE_KEYS.CALORIE_ENTRIES, []);
}

/** Salva a lista completa de registros de calorias */
export function setCalorieEntries(entries: CalorieEntry[]): void {
  setItem(STORAGE_KEYS.CALORIE_ENTRIES, entries);
}

/**
 * Retorna apenas os registros de calorias de um usuário específico.
 * Garante que cada usuário veja apenas seus próprios dados.
 */
export function getUserCalorieEntries(userId: string): CalorieEntry[] {
  return getCalorieEntries().filter((e) => e.userId === userId);
}

/** Adiciona um novo registro de calorias */
export function addCalorieEntry(entry: CalorieEntry): void {
  const entries = getCalorieEntries();
  entries.push(entry);
  setCalorieEntries(entries);
}

/** Atualiza um registro de calorias existente */
export function updateCalorieEntry(updatedEntry: CalorieEntry): void {
  const entries = getCalorieEntries().map((e) =>
    e.id === updatedEntry.id ? updatedEntry : e
  );
  setCalorieEntries(entries);
}

/** Remove um registro de calorias pelo ID */
export function deleteCalorieEntry(entryId: string): void {
  const entries = getCalorieEntries().filter((e) => e.id !== entryId);
  setCalorieEntries(entries);
}

// ==================== REGISTROS DE JEJUM ====================

/** Retorna todos os registros de jejum */
export function getFastingEntries(): FastingEntry[] {
  return getItem<FastingEntry[]>(STORAGE_KEYS.FASTING_ENTRIES, []);
}

/** Salva a lista completa de registros de jejum */
export function setFastingEntries(entries: FastingEntry[]): void {
  setItem(STORAGE_KEYS.FASTING_ENTRIES, entries);
}

/** Retorna apenas os registros de jejum de um usuário */
export function getUserFastingEntries(userId: string): FastingEntry[] {
  return getFastingEntries().filter((e) => e.userId === userId);
}

/** Retorna o jejum ativo do usuário (ou null se não houver) */
export function getActiveFasting(userId: string): FastingEntry | null {
  return getUserFastingEntries(userId).find((e) => e.status === 'ativo') || null;
}

/** Adiciona um novo registro de jejum */
export function addFastingEntry(entry: FastingEntry): void {
  const entries = getFastingEntries();
  entries.push(entry);
  setFastingEntries(entries);
}

/** Atualiza um registro de jejum existente */
export function updateFastingEntry(updatedEntry: FastingEntry): void {
  const entries = getFastingEntries().map((e) =>
    e.id === updatedEntry.id ? updatedEntry : e
  );
  setFastingEntries(entries);
}

/** Remove um registro de jejum pelo ID */
export function deleteFastingEntry(entryId: string): void {
  const entries = getFastingEntries().filter((e) => e.id !== entryId);
  setFastingEntries(entries);
}
