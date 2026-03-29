# K.S Futevôlei Floripa-SC 🏐

App premium PWA de gestão de escolinha de futevôlei.
Stack: Next.js 15 · TypeScript · Tailwind CSS · Supabase · Framer Motion · shadcn/ui

---

## Instalação rápida

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

# 3. Instalar componentes shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card dialog sheet badge input label \
  separator skeleton toast avatar calendar popover select switch \
  textarea table progress scroll-area tabs dropdown-menu alert-dialog tooltip

# 4. Rodar em desenvolvimento
npm run dev
```

## Configurar Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Executar migrations
supabase db push
# ou manualmente no SQL Editor do painel

# Gerar tipos TypeScript
npm run db:types
```

## Estrutura do projeto

```
src/
├── app/
│   ├── (auth)/         # Login e onboarding
│   ├── (student)/      # App do aluno
│   ├── (coach)/        # App do professor
│   └── (super-admin)/  # Painel SaaS
├── components/
│   ├── providers/      # AuthProvider, TenantProvider
│   ├── layout/         # AppShell, BottomNav, CoachShell
│   ├── brand/          # SplashScreen, LogoSection
│   ├── booking/        # SlotCard, BookingModal
│   ├── schedule/       # CalendarCard, DayObservation
│   ├── shared/         # Cards, Badges, Skeleton, Toast
│   └── ui/             # shadcn/ui (gerado)
├── hooks/              # useBooking, useSchedule, useCoachRealtime
├── lib/
│   ├── supabase/       # client, server, admin, middleware
│   ├── tenant/         # resolveTenant, brandingUtils, getTenant
│   └── utils.ts        # cn(), formatters, helpers
├── styles/globals.css
└── types/              # domain.ts, supabase.ts
supabase/
├── migrations/         # SQL schemas
└── functions/          # Edge Functions
```

## Deploy no Hetzner

```bash
# Build
npm run build

# PM2
npm install -g pm2
pm2 start npm --name "ks-futevolei" -- start
pm2 save && pm2 startup

# Nginx (porta 3000 → 80/443)
# Ver MULTITENANT_GUIDE.md para configuração completa
```

## Documentação completa
- FASE_1_PLANEJAMENTO.md — arquitetura, schema SQL, tipos
- MULTITENANT_GUIDE.md — multi-tenant, domínios, branding
- FASE_2_INDICE.md — setup técnico e variáveis de ambiente
