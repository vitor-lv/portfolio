# Portfolio — vitorlv

## Stack
- React 18 + TypeScript + Vite 5
- React Router v7
- CSS puro por componente (sem Tailwind, sem CSS-in-JS)
- Sem backend — dados persistem em localStorage/sessionStorage

## Estrutura de rotas
- `/` → portfolio público (Layout.tsx com header/nav)
- `/about`, `/contact`, `/case/:slug` → páginas públicas
- `/cases-admin` → CMS de cases (acessível via 3 cliques no botão Login do header)
- `/workspace/login` → senha via `VITE_WORKSPACE_PASSWORD`
- `/workspace/*` → protegido por WorkspaceGuard (sessionStorage `lv:ws_auth`)

## Arquivos principais
- `src/App.tsx` — rotas
- `src/App.css` — variáveis globais CSS e classes compartilhadas do portfolio
- `src/components/Layout.tsx/css` — header fixo com scroll-hide, nav, logo
- `src/contexts/ColorSchemeContext.tsx` — paleta de cores (easter egg no logo)
- `src/data/cases.ts` + `casesStorage.ts` — dados dos cases

## Workspace — src/pages/Workspace/
- `WorkspaceGuard.tsx` — checa sessionStorage, redireciona para login
- `WorkspaceLogin.tsx/css` — tela de senha
- `WorkspaceLayout.tsx/css` — sidebar (desktop) + hamburger (mobile), botão Sair
  - Classes de badge compartilhadas aqui: `.wsBadge--green/amber/red/blue/purple/teal`
  - Classe base de card: `.wsCard`
  - Classes de header/seção: `.wsPageHeader`, `.wsPageTitle`, `.wsPageSubtitle`, `.wsSectionTitle`, `.wsDivider`
- `Home.tsx/css` — banner ritual, 3 métricas, streak 8 semanas, checklist
- `Semana.tsx/css` — 5 perguntas + chamada Anthropic API direta do browser
- `Planos.tsx/css` — PDI, chegada 2 semanas, tabela 90 dias (tudo estático)
- `Benchmarks.tsx/css` — chips clicáveis, salva apps em localStorage
- `Historico.tsx/css` — lista de rituais + detalhe inline

## localStorage keys
- `lv:tasks` — `{ id, week_id, text, done }[]`
- `lv:rituals` — `{ id, week_id, date, q1-q5, analysis }[]`
- `lv:saved_apps` — `string[]`

## Variáveis de ambiente (.env.local)
- `VITE_WORKSPACE_PASSWORD`
- `VITE_ANTHROPIC_API_KEY`

## CSS — padrão de variáveis
```css
--bg: #000000
--surface: rgba(255,255,255,0.04)
--surface-hover: rgba(255,255,255,0.07)
--text: rgba(255,255,255,0.92)
--muted: rgba(255,255,255,0.6)
--border: rgba(255,255,255,0.1)
```

## Deploy
1. Commitar todas as mudanças antes de deployar (`git add` + `git commit`)
2. Fazer push pro GitHub (`git push origin main`)
3. Deployar com `npx vercel --prod` (projeto `vite-react`, domínio `vitorlv.com`)

> ⚠️ Nunca deployar sem commitar antes — o source real do site está no git,
> e deploys sem commit deixam o código fora de sincronia com o que está no ar.

## Convenções
- Dark theme, flat, sem gradientes, sem sombras
- Border-radius: 8–12px em cards, 999px em badges/chips
- Font-weight: 400 regular, 500 medium apenas
- Paleta de badges: verde `#EAF3DE/#3B6D11`, âmbar `#FAEEDA/#854F0B`, vermelho `#FCEBEB/#A32D2D`, azul `#E6F1FB/#185FA5`, roxo `#EEEDFE/#3C3489`, teal `#E1F5EE/#0F6E56`
- Prefixo de classes: `ws` para workspace, sem prefixo para portfolio
