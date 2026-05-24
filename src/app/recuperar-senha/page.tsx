/**
 * Página de Recuperação de Senha (Firebase).
 * O usuário informa o email e o Firebase envia um link de redefinição.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth'; // Atualizado para usar o hook
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, KeyRound, Utensils } from 'lucide-react';

export default function RecuperarSenhaPage() {
  const { resetPassword } = useAuth(); // Puxa a nova função do Firebase
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validação simples de email direto no componente
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Por favor, insira um e-mail válido.');
      return;
    }

    setLoading(true);

    // Dispara a função do Firebase
    const resetResult = await resetPassword(email);
    
    if (resetResult.success) {
      toast.success('E-mail de recuperação enviado!');
      setSuccess(true);
    } else {
      toast.error(resetResult.error || 'Erro ao redefinir senha.');
      setError(resetResult.error || 'Erro ao redefinir senha.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-emerald-950/20 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Utensils className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            NutriTrack
          </h1>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Recuperar Senha</CardTitle>
            <CardDescription>
              {success
                ? 'Verifique sua caixa de entrada (ou spam) para redefinir sua senha.'
                : 'Informe seu email cadastrado para receber um link de redefinição.'}
            </CardDescription>
          </CardHeader>

          {success ? (
            <CardFooter>
              <Link href="/login" className="w-full">
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Ir para o Login
                </Button>
              </Link>
            </CardFooter>
          ) : (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email cadastrado</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={error ? 'border-destructive' : ''}
                  />
                  {error && <p className="text-sm text-destructive">{error}</p>}
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500" disabled={loading}>
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </Button>

                <Link href="/login" className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline transition-colors">
                  <ArrowLeft className="inline mr-1 h-3 w-3" />
                  Voltar ao login
                </Link>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}