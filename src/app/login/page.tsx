/**
 * Página de Login.
 * Formulário com validação Zod para email e senha.
 * Redireciona para o dashboard após login bem-sucedido.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, LoginFormData } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, Utensils } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Manipula o envio do formulário.
   * Valida com Zod, depois tenta autenticar.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Valida os dados com o schema Zod
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      // Mapeia os erros do Zod para o estado
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      setLoading(false);
      return;
    }

    // Tenta fazer login
    const loginResult = await login(formData.email, formData.password);
    if (loginResult.success) {
      toast.success('Login realizado com sucesso!');
      router.push('/dashboard');
    } else {
      toast.error(loginResult.error || 'Erro ao fazer login.');
      setErrors({ general: loginResult.error || 'Erro ao fazer login.' });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/20 p-4">
      <div className="w-full max-w-md">
        {/* Logo e título */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Utensils className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            NutriTrack
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Controle de calorias e jejum intermitente
          </p>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Entrar</CardTitle>
            <CardDescription>Acesse sua conta para continuar</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Campo de Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={errors.email ? 'border-destructive' : ''}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Campo de Senha com toggle de visibilidade */}
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {/* Erro geral (credenciais inválidas) */}
              {errors.general && (
                <p className="text-sm text-destructive text-center">{errors.general}</p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500" disabled={loading}>
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Entrar
                  </>
                )}
              </Button>

              <div className="flex flex-col items-center gap-2 text-sm">
                <Link href="/recuperar-senha" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  Esqueceu a senha?
                </Link>
                <p className="text-muted-foreground">
                  Não tem conta?{' '}
                  <Link href="/cadastro" className="text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Aviso ético obrigatório */}
        <p className="mt-6 text-center text-xs text-muted-foreground/70 max-w-sm mx-auto">
          ⚠️ Esta aplicação é um exercício acadêmico e não substitui orientação médica ou nutricional profissional.
        </p>
      </div>
    </div>
  );
}
