/**
 * Módulo de autenticação com localStorage.
 * Usa SHA-256 (Web Crypto API) para hash de senhas.
 * NOTA: Este é um sistema educacional — em produção, use bcrypt + backend real.
 */

import { v4 as uuidv4 } from 'uuid';
import { User, UserSession } from '@/types';
import {
  getUsers,
  addUser,
  getUserByEmail,
  setCurrentUser,
  getCurrentUser,
  updateUser,
} from './storage';

/**
 * Gera um hash SHA-256 de uma string usando a Web Crypto API.
 * Converte o resultado em string hexadecimal.
 * @param text - Texto a ser hashado (ex: senha do usuário)
 */
async function hashPassword(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Cadastra um novo usuário no sistema.
 * Verifica se o email já existe antes de criar.
 * @returns Objeto com sucesso/erro e dados da sessão
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: UserSession }> {
  // Verifica se já existe um usuário com este email
  const existingUser = getUserByEmail(email);
  if (existingUser) {
    return { success: false, error: 'Este email já está cadastrado.' };
  }

  // Gera hash da senha e cria o novo usuário
  const passwordHash = await hashPassword(password);
  const newUser: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    name,
    passwordHash,
    calorieGoal: 2000, // Meta padrão de 2000 kcal
    createdAt: new Date().toISOString(),
  };

  // Salva no localStorage e cria a sessão
  addUser(newUser);
  const session: UserSession = { id: newUser.id, email: newUser.email, name: newUser.name };
  setCurrentUser(session);

  return { success: true, session };
}

/**
 * Realiza o login do usuário.
 * Compara o hash da senha informada com o hash armazenado.
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; session?: UserSession }> {
  const user = getUserByEmail(email);
  if (!user) {
    return { success: false, error: 'Email ou senha incorretos.' };
  }

  // Gera hash da senha digitada e compara com o armazenado
  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) {
    return { success: false, error: 'Email ou senha incorretos.' };
  }

  // Cria a sessão do usuário
  const session: UserSession = { id: user.id, email: user.email, name: user.name };
  setCurrentUser(session);

  return { success: true, session };
}

/**
 * Realiza o logout limpando a sessão do localStorage.
 */
export function logoutUser(): void {
  setCurrentUser(null);
}

/**
 * Verifica se há um usuário logado.
 * Retorna a sessão atual ou null.
 */
export function getSession(): UserSession | null {
  return getCurrentUser();
}

/**
 * "Recuperação de senha" — como usamos localStorage, apenas
 * permite redefinir a senha se o usuário informar o email correto.
 */
export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, error: 'Email não encontrado.' };
  }

  // Atualiza o hash da senha
  const newHash = await hashPassword(newPassword);
  updateUser({ ...user, passwordHash: newHash });

  return { success: true };
}
