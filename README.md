# 🥗 NutriTrack — Sistema de Registro de Calorias e Jejum

Aplicação web para acompanhamento de consumo calórico e jejum intermitente, desenvolvida como trabalho acadêmico.

> ⚠️ **Aviso:** Esta aplicação é um exercício acadêmico e **não substitui orientação médica ou nutricional profissional**.

---

## 🚀 Como Rodar em Outra Máquina

### Pré-requisitos (o que precisa ter instalado)

| Software | Versão Mínima | Como Instalar |
|---|---|---|
| **Node.js** | 18.0+ | [nodejs.org](https://nodejs.org) — baixe o LTS |
| **npm** | 9.0+ | Já vem junto com o Node.js |
| **Git** | Qualquer | [git-scm.com](https://git-scm.com) |

> 💡 **Dica:** Para verificar se já tem instalado, abra o terminal e digite:
> ```bash
> node --version    # deve mostrar v18.x.x ou superior
> npm --version     # deve mostrar 9.x.x ou superior
> git --version     # deve mostrar git version x.x.x
> ```

### Passo a Passo

```bash
# 1. Clone o repositório (troque pela URL do seu repositório)
git clone https://github.com/seu-usuario/nutritrack.git

# 2. Entre na pasta do projeto
cd nutritrack

# 3. Instale todas as dependências (pode demorar 1-2 minutos)
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

Após o passo 4, abra o navegador em **http://localhost:3000** 🎉

### O que o `npm install` faz?

Ele lê o arquivo `package.json` e baixa todas as bibliotecas que o projeto precisa para funcionar (React, Next.js, Recharts, etc.) para a pasta `node_modules/`. Essa pasta **não** é enviada ao GitHub (está no `.gitignore`), por isso o `npm install` é obrigatório em toda máquina nova.

### Arquivos que NÃO vão pro GitHub (e por quê)

| Pasta/Arquivo | Motivo |
|---|---|
| `node_modules/` | Dependências — recriadas com `npm install` |
| `.next/` | Cache de build do Next.js — recriado automaticamente |
| `.env` e `.env.local` | Variáveis de ambiente secretas (neste projeto não usamos) |

### Arquivos que DEVEM ir pro GitHub

| Arquivo | Função |
|---|---|
| `package.json` | Lista de dependências e scripts |
| `package-lock.json` | Versões exatas das dependências (garante reprodutibilidade) |
| `tsconfig.json` | Configuração do TypeScript |
| `next.config.ts` | Configuração do Next.js |
| `.env.example` | Exemplo de variáveis de ambiente (referência) |
| `src/` | Todo o código-fonte |
| `public/` | Arquivos estáticos (favicon, imagens) |

---

## 🛠️ Stack Técnica

| Tecnologia | Para quê serve | Versão |
|---|---|---|
| **Next.js** | Framework React com roteamento e SSR | 16.2.5 |
| **React** | Biblioteca para construir interfaces | 19.2.4 |
| **TypeScript** | JavaScript com tipagem estática | 5.x |
| **Tailwind CSS** | Estilização via classes utilitárias | 4.x |
| **shadcn/ui** | Componentes prontos (botões, cards, modals) | 4.7 |
| **Recharts** | Gráficos de barras e linhas | 3.8 |
| **Zod** | Validação de formulários com schemas | 4.4 |
| **date-fns** | Manipulação de datas | 4.1 |
| **next-themes** | Dark/Light mode | 0.4 |
| **Lucide React** | Ícones SVG | 1.14 |
| **uuid** | Geração de IDs únicos | 14.0 |
| **sonner** | Notificações toast | 2.0 |
| **localStorage** | Armazenamento local do navegador | Nativo |

---

## ✨ Funcionalidades

### Autenticação
- ✅ Cadastro com email e senha (hash SHA-256 via Web Crypto API)
- ✅ Login e logout
- ✅ Recuperação de senha (redefinição local)
- ✅ Rotas protegidas — redireciona para login se não autenticado
- ✅ Isolamento de dados por usuário

### Registro de Calorias (CRUD Completo)
- ✅ **C**riar — registro com data/hora, descrição, calorias e tipo de refeição
- ✅ **R**ead/Listar — lista com filtro por data e barra de progresso
- ✅ **U**pdate/Editar — abre modal preenchido para edição
- ✅ **D**elete/Excluir — confirmação antes de excluir (AlertDialog)

### Meta Calórica
- ✅ Definir meta diária (500–10.000 kcal)
- ✅ Editar a qualquer momento
- ✅ Barra de progresso visual no dashboard e em refeições

### Jejum Intermitente
- ✅ Iniciar jejum (16:8, 18:6, 20:4, 24h, personalizado)
- ✅ Timer em tempo real (atualiza a cada segundo com setInterval)
- ✅ Encerrar com diálogo de confirmação
- ✅ Apenas 1 jejum ativo por vez (validação no hook)
- ✅ Notificação do navegador ao atingir meta (Notification API)

### Dashboard
- ✅ 4 cards com indicadores: calorias hoje, meta, média semanal, jejuns
- ✅ Barra de progresso diária
- ✅ Card de jejum ativo com timer
- ✅ Gráfico de barras — calorias dos últimos 7 dias (Recharts)
- ✅ Gráfico de linha — horas de jejum dos últimos 7 dias (Recharts)

### Histórico
- ✅ Lista de jejuns concluídos com data, tipo e duração
- ✅ Indicadores: total, tempo médio, maior jejum

### Configurações + Bônus
- ✅ Editar meta calórica com validação Zod
- ✅ Alternar tema (dark/light mode)
- ✅ **Exportar dados em JSON** (todos os dados do usuário)
- ✅ **Exportar dados em CSV** (refeições — compatível com Excel)

---

## 📁 Estrutura do Projeto

```
projeto/
├── package.json              # Dependências e scripts npm
├── tsconfig.json             # Configuração TypeScript
├── next.config.ts            # Configuração Next.js
├── .env.example              # Exemplo de variáveis de ambiente
├── .gitignore                # Arquivos ignorados pelo Git
│
├── public/                   # Arquivos estáticos (favicon)
│
└── src/                      # Código-fonte da aplicação
    ├── types/
    │   └── index.ts          # Interfaces (User, CalorieEntry, FastingEntry) e constantes
    │
    ├── lib/                  # Módulos utilitários (sem React)
    │   ├── storage.ts        # CRUD genérico no localStorage
    │   ├── auth.ts           # Login, cadastro, hash SHA-256
    │   ├── validators.ts     # Schemas Zod para validação
    │   └── utils.ts          # Função cn() para classes Tailwind
    │
    ├── hooks/                # Custom Hooks (lógica de negócio React)
    │   ├── use-auth.tsx      # Context API de autenticação
    │   ├── use-meals.ts      # CRUD de refeições
    │   ├── use-fasting.ts    # Controle de jejum
    │   └── use-calorie-goal.ts  # Meta calórica diária
    │
    ├── components/ui/        # Componentes visuais shadcn/ui
    │
    └── app/                  # Páginas (App Router do Next.js)
        ├── layout.tsx        # Layout raiz (fontes + providers)
        ├── providers.tsx     # ThemeProvider + AuthProvider
        ├── globals.css       # Estilos globais + paleta de cores
        ├── page.tsx          # Redirect condicional (/ → dashboard ou login)
        ├── login/            # Página de login
        ├── cadastro/         # Página de cadastro
        ├── recuperar-senha/  # Redefinição de senha
        └── (dashboard)/      # Grupo de rotas protegidas
            ├── layout.tsx    # Sidebar + bottom nav + proteção
            ├── dashboard/    # Dashboard com gráficos
            ├── refeicoes/    # CRUD de refeições
            ├── jejum/        # Timer de jejum
            ├── historico/    # Histórico de jejuns
            └── configuracoes/ # Meta + tema + exportação
```

---

## 🔐 Sobre o Armazenamento

Este projeto usa **localStorage** do navegador, ou seja:
- Os dados ficam salvos **apenas no navegador** onde foram criados
- **Não há servidor/banco de dados externo** — tudo é local
- Se limpar os dados do navegador, os dados são perdidos
- Para um sistema real, usaríamos Firebase, Supabase ou um backend próprio

### Por que localStorage?
É a solução mais simples para um projeto acadêmico — não precisa de servidor, chaves de API, nem configuração de banco de dados. Basta abrir e funciona.

---

## 📹 Comandos Úteis

```bash
npm run dev      # Inicia o servidor de desenvolvimento (http://localhost:3000)
npm run build    # Gera o build de produção (verifica erros de TypeScript)
npm run start    # Roda o build de produção localmente
npm run lint     # Verifica erros de código com ESLint
```

---

## 📝 Licença

Projeto acadêmico — uso educacional.
