# Baby Tracker 🍼

Aplicação PWA para acompanhamento de bebês: mamadas, fraldas, sono, atividades, crescimento, saúde, consultas médicas e diário.

**🔗 Live:** https://leooliveiraz.github.io/baby-tracker/

## Funcionalidades

| Categoria | O que registra |
|-----------|----------------|
| 🥛 Mamadas | Seio (E/D), fórmula, volume, duração, timer com edição |
| 👶 Fraldas | Xixi, cocô, consistência com swipe to delete |
| 😴 Sono | Início/fim, timer ativo, local, qualidade, entrada manual |
| 🧸 Atividades | Tummy time, banho, leitura, tela com duração |
| 📈 Crescimento | Peso, altura, PC com gráficos e percentis OMS |
| 💉 Saúde | Vacinas (calendário BR), medicamentos, febre |
| 🏥 Consultas | Médico, especialidade, data, local |
| 📖 Diário | Notas diárias sobre o bebê |
| 👶 Modo Babá | Botões gigantes para registro rápido |
| 📋 Timeline | Linha do tempo visual com todos os registros |
| 📊 Relatórios | Exportar dados em PDF/CSV com período customizado |
| 💾 Backup | Exportar/Importar dados em JSON |
| 👥 Compartilhamento | Sincronização multi-cuidador via Supabase |
| 🌙 Modo escuro | Toggle no header, respeita preferência do sistema |
| 🔊 Sons | Feedback sonoro ao registrar (opt-in) |
| 📸 Fotos | Upload de foto do bebê com cache offline |

## Tecnologias

- **Vite** + **React 18** + **TypeScript**
- **React Router** (HashRouter para GitHub Pages)
- **Recharts** — gráficos de crescimento e resumo
- **Supabase** — autenticação, banco de dados e storage
- **jsPDF** + **jspdf-autotable** — exportação de relatórios
- **vite-plugin-pwa** — service worker, manifest e auto-update
- **Paleta lilás** com variáveis CSS e modo escuro
- **IndexedDB** — cache offline de fotos
- **Vitest** + **@testing-library** — testes automatizados

## Pré-requisitos

- Node.js 18+
- yarn

## Como rodar localmente

```bash
# 1. Instalar dependências
yarn

# 2. Iniciar servidor de desenvolvimento
yarn dev
```

Acesse http://localhost:5173

## Build e preview

```bash
# Build de produção
yarn build

# Preview do build localmente
yarn preview
```

## Deploy no GitHub Pages

O deploy é feito via `gh-pages` na branch `gh-pages`.

```bash
yarn deploy
```

Após o deploy, ative o GitHub Pages em **Settings > Pages**:
- Source: `Deploy from a branch`
- Branch: `gh-pages` / `/ (root)`

## Testes

```bash
# Executar testes uma vez
yarn test

# Modo watch (re-executa ao salvar)
yarn test:watch
```

## Supabase (opcional)

O app funciona completamente offline com localStorage. Para ativar sincronização entre dispositivos:

1. Crie um projeto em https://supabase.com
2. Copie a **Project URL** e a **anon public key**
3. Preencha no arquivo `.env`

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

4. Execute o conteúdo de `supabase-schema.sql` no **SQL Editor** do Supabase

### Ambiente de produção

Em produção (GitHub Pages), as variáveis do `.env` são baked no build. Para usar variáveis do sistema (CI/CD), defina:

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

## Ícones PWA

O ícone principal está em `public/favicon.svg` (caderninho com bebê na capa). Para gerar os PNGs:

```bash
yarn generate-icons
```

## Estrutura do projeto

```
src/
├── __tests__/          # Testes automatizados (Vitest)
├── components/
│   ├── layout/         # AppShell, Header, BottomNav
│   └── ui/             # PhotoAvatar, Toast, Spinner, SwipeableCard, ErrorBoundary
├── context/            # BabyContext, RecordsContext, AuthContext, ThemeContext, ToastContext, useSync
├── data/               # Dados de referência OMS
├── lib/                # Supabase client, storage (fotos)
├── pages/              # Todas as páginas do app
├── styles/             # CSS global com paleta lilás + modo escuro
└── utils/              # Time helpers, export CSV/PDF, sounds
```

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `yarn dev` | Inicia servidor de desenvolvimento |
| `yarn build` | Build de produção |
| `yarn preview` | Preview do build |
| `yarn test` | Executa testes |
| `yarn test:watch` | Testes em modo watch |
| `yarn deploy` | Build + deploy no GitHub Pages |
| `yarn generate-icons` | Gera PNGs a partir do SVG |

## Licença

MIT
