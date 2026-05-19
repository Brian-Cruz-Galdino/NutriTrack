/**
 * Componente de Providers globais.
 * Encapsula ThemeProvider (dark mode), AuthProvider e TooltipProvider.
 * Separado do layout.tsx porque precisa ser um Client Component.
 */

'use client';

import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/hooks/use-auth';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // ThemeProvider do next-themes: gerencia dark/light mode
    // attribute="class" aplica a classe "dark" no HTML para Tailwind
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {/* AuthProvider: gerencia o estado de autenticação global */}
      <AuthProvider>
        {/* TooltipProvider: necessário para tooltips do shadcn/ui */}
        <TooltipProvider>
          {children}
          {/* Toaster: componente global de notificações (sonner) */}
          <Toaster richColors position="top-right" />
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
