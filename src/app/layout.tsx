/**
 * Layout raiz da aplicação.
 * Configura os providers globais: tema (next-themes), autenticação e tooltips.
 * Define a fonte Inter do Google Fonts e metadados SEO.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// Fonte Inter - moderna e legível, usada em toda a aplicação
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Metadados SEO da aplicação
export const metadata: Metadata = {
  title: "NutriTrack - Controle de Calorias e Jejum",
  description:
    "Acompanhe seu consumo calórico e jejum intermitente de forma simples e visual. Sistema educacional que não substitui orientação médica.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning é necessário para o next-themes funcionar sem erros
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
