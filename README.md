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
git clone [https://github.com/seu-usuario/nutritrack.git](https://github.com/seu-usuario/nutritrack.git)

# 2. Entre na pasta do projeto
cd nutritrack

# 3. Instale todas as dependências (pode demorar 1-2 minutos)
npm install

# 4. Configure o arquivo de ambiente
# Crie um arquivo chamado .env na raiz do projeto e cole as configurações do .env.example
# (Ele precisa conter a DATABASE_URL="file:./dev.db")

# 5. Crie e sincronize o banco de dados local
npx prisma db push

# 6. Inicie o servidor de desenvolvimento
npm run dev

```

Após o passo 6, abra o navegador em **http://localhost:3000** 🎉

> 🗄️ **Dica de Banco de Dados:** Para visualizar, editar ou apagar os dados salvos no banco local direto pelo navegador, abra um novo terminal na pasta do projeto e rode o comando:
> `npx prisma studio`

### O que o `npm install` faz?

Ele lê o arquivo `package.json` e baixa todas as bibliotecas que o projeto precisa para funcionar (React, Next.js, Prisma, etc.) para a pasta `node_modules/`. Essa pasta **não** é enviada ao GitHub (está no `.gitignore`), por isso o `npm install` é obrigatório em toda máquina nova.

### Arquivos que NÃO vão pro GitHub (e por quê)

| Pasta/Arquivo | Motivo |
| --- | --- |
| `node_modules/` | Dependências — recriadas com `npm install` |
| `.next/` | Cache de build do Next.js — recriado automaticamente |
| `.env` | Variáveis de ambiente secretas e chaves de banco de dados |
| `prisma/*.db` | Arquivos do banco de dados local (SQLite) |

### Arquivos que DEVEM ir pro GitHub

| Arquivo | Função |
| --- | --- |
| `package.json` | Lista de dependências e scripts |
| `package-lock.json` | Versões exatas das dependências (garante reprodutibilidade) |
| `tsconfig.json` | Configuração do TypeScript |
| `next.config.ts` | Configuração do Next.js |
| `.env.example` | Exemplo de variáveis de ambiente (referência para o avaliador) |
| `prisma/schema.prisma` | Modelagem do banco de dados |
| `src/` | Todo o código-fonte (Frontend e Backend) |
| `public/` | Arquivos estáticos (favicon, imagens) |

---

## 🛠️ Stack Técnica

| Tecnologia | Para quê serve | Versão |
| --- | --- | --- |
| **Next.js** | Framework React com roteamento, SSR e API Routes | 14+ |
| **React** | Biblioteca para construir interfaces | 18+ |
| **TypeScript** | JavaScript com tipagem estática | 5.x |
| **Prisma ORM** | Modelagem e integração com o banco de dados | 6.x |
| **SQLite** | Banco de dados local para desenvolvimento | Nativo |
| **Firebase Auth** | Sistema de autenticação e segurança de sessão | 10.x |
| **Tailwind CSS** | Estilização via classes utilitárias | 4.x |
| **shadcn/ui** | Componentes prontos (botões, cards, modals) | 4.x |
| **Recharts** | Gráficos de barras e linhas | 3.x |
| **Zod** | Validação de formulários com schemas | 4.x |
| **date-fns** | Manipulação de datas | 4.x |

---

## ✨ Funcionalidades

### Autenticação (Firebase)

* ✅ Cadastro com email e senha
* ✅ Login e logout
* ✅ Recuperação de senha via e-mail oficial
* ✅ Rotas protegidas — redireciona para login se não autenticado
* ✅ Isolamento de dados por usuário no banco relacional

### Registro de Calorias (CRUD Completo na API)

* ✅ **C**riar — registro com data/hora, descrição, calorias e tipo de refeição
* ✅ **R**ead/Listar — lista com filtro por data e barra de progresso
* ✅ **U**pdate/Editar — abre modal preenchido para edição
* ✅ **D**elete/Excluir — confirmação antes de excluir (AlertDialog)

### Meta Calórica

* ✅ Definir meta diária (500–10.000 kcal) salva no perfil do usuário
* ✅ Editar a qualquer momento
* ✅ Barra de progresso visual no dashboard e em refeições

### Jejum Intermitente

* ✅ Iniciar jejum (16:8, 18:6, 20:4, 24h, personalizado) persistido no banco
* ✅ Timer em tempo real (atualiza a cada segundo com setInterval)
* ✅ Encerrar com diálogo de confirmação
* ✅ Apenas 1 jejum ativo por vez (validação no hook)
* ✅ Notificação do navegador ao atingir meta (Notification API)

### Dashboard e Histórico

* ✅ 4 cards com indicadores: calorias hoje, meta, média semanal, jejuns
* ✅ Gráfico de barras — calorias dos últimos 7 dias (Recharts)
* ✅ Gráfico de linha — horas de jejum dos últimos 7 dias (Recharts)
* ✅ Lista de jejuns concluídos com data, tipo e duração

---

## 🗄️ Estrutura e API do Backend

O projeto utiliza uma arquitetura full-stack integrada, aproveitando os recursos de Route Handlers do Next.js.

### 📐 Modelo de Dados (Prisma)

* **User:** Registra o UID do Firebase, nome, e-mail e a meta calórica.
* **Meal:** Histórico de refeições (data, descrição, calorias e tipo), vinculado ao usuário.
* **Fasting:** Registra os ciclos de jejum (horário de início, fim, tipo e status).

### 🛣️ Endpoints da API

Todas as requisições aceitam e retornam JSON.

**👤 Usuário e Configurações (`/api/usuario`)**

* `POST /api/usuario`: Cria ou sincroniza os metadados do usuário localmente após o registro no Firebase.
* `GET /api/usuario?userId={id}`: Retorna o perfil e a meta calórica ativa.
* `PUT /api/usuario`: Atualiza a meta calórica diária do usuário.

**🍽️ Registro de Calorias (`/api/refeicoes`)**

* `GET /api/refeicoes?userId={id}`: Retorna todas as refeições ordenadas.
* `POST /api/refeicoes`: Cria uma nova entrada de caloria.
* `PUT /api/refeicoes/[id]`: Altera os dados de uma refeição existente.
* `DELETE /api/refeicoes/[id]`: Remove permanentemente o registro.

**⏱️ Jejum Intermitente (`/api/jejum`)**

* `GET /api/jejum?userId={id}`: Busca o histórico de ciclos de jejum.
* `POST /api/jejum`: Inicializa um novo jejum com status `ativo`.
* `PUT /api/jejum/[id]`: Finaliza o ciclo, registrando o horário de término e alterando o status para `concluido`.

---

## 📁 Estrutura do Projeto

```text
projeto/
├── prisma/                   # Banco de dados e ORM
│   ├── schema.prisma         # Modelagem das tabelas
│   └── dev.db                # Arquivo local do SQLite (Ignorado no Git)
│
├── package.json              # Dependências e scripts npm
├── next.config.ts            # Configuração Next.js
├── .env.example              # Exemplo de variáveis de ambiente
│
├── public/                   # Arquivos estáticos (favicon)
│
└── src/                      # Código-fonte da aplicação
    ├── types/                # Interfaces TypeScript globais
    │
    ├── lib/                  # Utilitários, validações Zod e config do Firebase
    │
    ├── hooks/                # Custom Hooks (Comunicação com a API e Firebase)
    │   ├── use-auth.tsx      
    │   ├── use-meals.ts      
    │   ├── use-fasting.ts    
    │   └── use-calorie-goal.ts 
    │
    ├── components/ui/        # Componentes visuais shadcn/ui
    │
    └── app/                  # Páginas e API (App Router do Next.js)
        ├── api/              # ⚙️ BACKEND (Route Handlers)
        │   ├── usuario/      # Endpoints de usuário e meta calórica
        │   ├── refeicoes/    # Endpoints do CRUD de calorias
        │   └── jejum/        # Endpoints de controle de jejum
        │
        ├── login/            # Página de login
        ├── cadastro/         # Página de cadastro
        ├── recuperar-senha/  # Redefinição de senha
        └── (dashboard)/      # Telas protegidas (Dashboard, Histórico, etc.)

```

---

## 📹 Comandos Úteis

```bash
npm run dev      # Inicia o servidor de desenvolvimento (http://localhost:3000)
npx prisma push  # Sincroniza o banco de dados com a modelagem atual
npx prisma studio # Abre a interface visual do banco de dados
npm run build    # Gera o build de produção

```

---

## 📝 Licença

Projeto acadêmico — uso educacional.
