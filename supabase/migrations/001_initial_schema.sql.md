# K.S FUTEVÔLEI FLORIPA-SC — FASE 1: PLANEJAMENTO E ARQUITETURA COMPLETA

---

## 1. VISÃO GERAL DO PRODUTO

### Proposta de Valor
Plataforma premium de gestão para escolinhas de futevôlei. Conecta professor e alunos numa experiência digital sofisticada com agendamentos em tempo real, controle de mensalidades e comunicação integrada — tudo com visual de clube esportivo de alto padrão.

### Tipos de Usuários
| Papel | Descrição |
|-------|-----------|
| `coach` | Professor/treinador — acesso administrativo completo |
| `student` | Aluno — acesso ao app de agendamento e comunicação |
| `super_admin` | Futuro: gestor da plataforma SaaS multi-academia |

### Principais Fluxos

**Fluxo do Aluno:**
1. Login (nome + telefone)
2. Visualiza agenda de treinos abertos
3. Reserva horário disponível
4. Recebe confirmação imediata
5. Visualiza mensalidade e status
6. Envia mensagem ao professor

**Fluxo do Professor:**
1. Login com credenciais
2. Abre dias e horários de treino
3. Define capacidade por slot
4. Recebe notificação de novos agendamentos em tempo real
5. Gerencia mensalidades dos alunos
6. Publica avisos e observações
7. Marca presença nas aulas
8. Responde mensagens dos alunos

**Fluxo de Lista de Espera:**
1. Aluno tenta reservar slot lotado
2. Entra na lista de espera
3. Quando vaga surge (cancelamento), próximo na fila é promovido automaticamente
4. Notificação push imediata para o aluno promovido

### Diferenciais Premium
- Realtime Supabase: vagas atualizam para todos sem recarregar
- Push notifications com som/apito para o professor
- Visual esportivo dark premium com animações Framer Motion
- PWA installable (funciona como app nativo)
- Estrutura white-label para multi-academia
- Histórico de presença e financeiro do aluno
- Chat integrado com contexto de aula

### Versão MVP (Fase Atual)
- Autenticação por nome + telefone
- Agenda de treinos com horários abertos/fechados
- Reserva e cancelamento com realtime
- Lista de espera automática
- Status de mensalidade (manual pelo professor)
- Chat aluno ↔ professor
- Avisos gerais
- PWA installable
- Push via OneSignal

### Versão Futura (Roadmap)
- OTP via WhatsApp/SMS para autenticação
- Pagamentos via Pix integrado
- Multi-academia (white-label SaaS)
- Relatórios financeiros completos
- Vídeos/conteúdo de treino
- App nativo (React Native / Expo)
- IA para sugestão de horários

---

## 2. ARQUITETURA DO PROJETO

### Estrutura de Pastas Completa

```
ks-futevolei/
├── public/
│   ├── icons/                    # PWA icons (72, 96, 128, 144, 152, 192, 384, 512)
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   └── icon-512x512.png
│   ├── logo.png                  # Logo principal
│   ├── logo-dark.png             # Logo para fundo escuro
│   ├── manifest.json             # PWA manifest
│   ├── sw.js                     # Service Worker
│   └── sounds/
│       └── booking-alert.mp3     # Som de notificação para professor
│
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (student)/            # App do aluno
│   │   │   ├── layout.tsx        # Shell com bottom nav
│   │   │   ├── home/
│   │   │   │   └── page.tsx
│   │   │   ├── agenda/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slotId]/
│   │   │   │       └── page.tsx
│   │   │   ├── reservas/
│   │   │   │   └── page.tsx
│   │   │   ├── mensagens/
│   │   │   │   └── page.tsx
│   │   │   ├── plano/
│   │   │   │   └── page.tsx
│   │   │   └── perfil/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (coach)/              # App do professor
│   │   │   ├── layout.tsx        # Shell com sidebar/header
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── agenda/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [date]/
│   │   │   │       └── page.tsx
│   │   │   ├── alunos/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [studentId]/
│   │   │   │       └── page.tsx
│   │   │   ├── mensalidades/
│   │   │   │   └── page.tsx
│   │   │   ├── mensagens/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [conversationId]/
│   │   │   │       └── page.tsx
│   │   │   ├── avisos/
│   │   │   │   └── page.tsx
│   │   │   └── configuracoes/
│   │   │       └── page.tsx
│   │   │
│   │   ├── api/
│   │   │   ├── webhooks/
│   │   │   │   └── onesignal/
│   │   │   │       └── route.ts
│   │   │   ├── notifications/
│   │   │   │   └── route.ts
│   │   │   └── bookings/
│   │   │       └── route.ts
│   │   │
│   │   ├── splash/
│   │   │   └── page.tsx
│   │   ├── layout.tsx            # Root layout
│   │   ├── page.tsx              # Redirect para splash
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components (gerados)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── select.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── table.tsx
│   │   │   └── progress.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── AppShell.tsx
│   │   │   ├── BottomNav.tsx
│   │   │   ├── CoachSidebar.tsx
│   │   │   ├── CoachHeader.tsx
│   │   │   └── PageHeader.tsx
│   │   │
│   │   ├── brand/
│   │   │   ├── LogoSection.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   └── SplashScreen.tsx
│   │   │
│   │   ├── booking/
│   │   │   ├── SlotCard.tsx
│   │   │   ├── BookingModal.tsx
│   │   │   ├── BookingConfirmation.tsx
│   │   │   ├── WaitlistButton.tsx
│   │   │   └── BookingHistory.tsx
│   │   │
│   │   ├── schedule/
│   │   │   ├── CalendarCard.tsx
│   │   │   ├── DayView.tsx
│   │   │   ├── SlotGrid.tsx
│   │   │   └── DayObservation.tsx
│   │   │
│   │   ├── membership/
│   │   │   ├── MembershipCard.tsx
│   │   │   ├── MembershipBadge.tsx
│   │   │   └── MembershipHistory.tsx
│   │   │
│   │   ├── chat/
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   └── MessageThread.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatCard.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── RecentActivity.tsx
│   │   │
│   │   ├── students/
│   │   │   ├── StudentCard.tsx
│   │   │   ├── StudentTable.tsx
│   │   │   └── AttendanceHistory.tsx
│   │   │
│   │   ├── notifications/
│   │   │   ├── NotificationItem.tsx
│   │   │   ├── NotificationBell.tsx
│   │   │   └── AnnouncementBanner.tsx
│   │   │
│   │   └── shared/
│   │       ├── StatusBadge.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSkeleton.tsx
│   │       ├── PremiumToast.tsx
│   │       └── GlassCard.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useRealtime.ts
│   │   ├── useBooking.ts
│   │   ├── useMembership.ts
│   │   ├── useNotifications.ts
│   │   ├── useChat.ts
│   │   ├── useSchedule.ts
│   │   ├── useStudents.ts
│   │   ├── useToast.ts
│   │   └── usePWA.ts
│   │
│   ├── services/
│   │   ├── bookingService.ts
│   │   ├── membershipService.ts
│   │   ├── notificationService.ts
│   │   ├── realtimeService.ts
│   │   ├── chatService.ts
│   │   ├── scheduleService.ts
│   │   ├── studentService.ts
│   │   └── pushService.ts
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   ├── server.ts         # Server client (SSR)
│   │   │   ├── middleware.ts     # Auth middleware
│   │   │   └── admin.ts          # Service role client
│   │   ├── utils.ts              # cn(), formatDate(), etc.
│   │   ├── constants.ts          # App constants
│   │   ├── validations.ts        # Zod schemas
│   │   └── onesignal.ts          # OneSignal SDK init
│   │
│   ├── types/
│   │   ├── database.ts           # Tipos gerados do Supabase
│   │   ├── domain.ts             # Tipos de domínio
│   │   ├── api.ts                # Tipos de request/response
│   │   └── index.ts              # Re-exports
│   │
│   ├── store/                    # Estado local (Zustand futuro)
│   │   ├── authStore.ts
│   │   └── notificationStore.ts
│   │
│   └── styles/
│       └── globals.css
│
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   ├── functions/               # Edge Functions Supabase
│   │   ├── send-push-notification/
│   │   │   └── index.ts
│   │   └── promote-waitlist/
│   │       └── index.ts
│   └── seed.sql
│
├── .env.local.example
├── .env.production.example
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── components.json              # shadcn/ui config
└── package.json
```

---

## 3. DESIGN SYSTEM

### Paleta de Cores — Baseada na Logo

```css
/* tokens de cor — globals.css */

:root {
  /* === BRAND COLORS === */
  --gold-50:  #FFFBEB;
  --gold-100: #FEF3C7;
  --gold-200: #FDE68A;
  --gold-300: #FCD34D;
  --gold-400: #FBBF24;
  --gold-500: #D4A017;   /* DOURADO PRINCIPAL — cor da logo */
  --gold-600: #B8860B;   /* Dourado escuro */
  --gold-700: #92680A;
  --gold-800: #6B4C08;
  --gold-900: #422E05;

  --graphite-50:  #F8F8F8;
  --graphite-100: #EBEBEB;
  --graphite-200: #D1D1D1;
  --graphite-300: #A8A8A8;
  --graphite-400: #717171;
  --graphite-500: #484848;   /* GRAFITE MÉDIO */
  --graphite-600: #333333;
  --graphite-700: #242424;
  --graphite-800: #181818;   /* GRAFITE ESCURO */
  --graphite-900: #0D0D0D;   /* QUASE PRETO */

  /* === SEMANTIC COLORS (light — não usado no app, mas para futuro white-label) === */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-danger:  #DC2626;
  --color-info:    #2563EB;
}

/* === DARK THEME (padrão do app — sempre dark premium) === */
.dark {
  /* Backgrounds */
  --bg-primary:   #0D0D0D;    /* Preto absoluto */
  --bg-secondary: #181818;    /* Cards principais */
  --bg-tertiary:  #242424;    /* Cards secundários, inputs */
  --bg-elevated:  #2E2E2E;    /* Menus, tooltips */
  --bg-glass:     rgba(255, 255, 255, 0.03);  /* Glassmorphism */
  --bg-glass-border: rgba(255, 255, 255, 0.08);

  /* Text */
  --text-primary:   #FFFFFF;
  --text-secondary: #D1D1D1;
  --text-muted:     #717171;
  --text-gold:      #D4A017;
  --text-gold-light:#FBBF24;

  /* Brand */
  --brand-gold:        #D4A017;
  --brand-gold-light:  #FBBF24;
  --brand-gold-glow:   rgba(212, 160, 23, 0.2);
  --brand-gold-border: rgba(212, 160, 23, 0.3);

  /* Borders */
  --border-subtle:  rgba(255, 255, 255, 0.06);
  --border-default: rgba(255, 255, 255, 0.10);
  --border-strong:  rgba(255, 255, 255, 0.18);
  --border-gold:    rgba(212, 160, 23, 0.4);

  /* Status Colors */
  --status-available:  #16A34A;
  --status-full:       #DC2626;
  --status-closed:     #717171;
  --status-waitlist:   #D97706;
  --status-confirmed:  #2563EB;
  --status-paid:       #16A34A;
  --status-due-soon:   #D97706;
  --status-overdue:    #DC2626;
}
```

### Tipografia

```css
/* Fonte principal: Geist Sans (Next.js default + premium) */
/* Fonte de destaque: Geist Mono para números e códigos */

--font-display:  'Geist', 'Inter', system-ui, sans-serif;
--font-body:     'Geist', 'Inter', system-ui, sans-serif;
--font-mono:     'Geist Mono', 'JetBrains Mono', monospace;

/* Escala tipográfica */
--text-xs:   0.75rem;   /* 12px — labels, badges */
--text-sm:   0.875rem;  /* 14px — corpo secundário */
--text-base: 1rem;      /* 16px — corpo principal */
--text-lg:   1.125rem;  /* 18px — subtítulos */
--text-xl:   1.25rem;   /* 20px — títulos de seção */
--text-2xl:  1.5rem;    /* 24px — títulos de página */
--text-3xl:  1.875rem;  /* 30px — hero */
--text-4xl:  2.25rem;   /* 36px — splash */

/* Pesos */
--font-normal:   400;
--font-medium:   500;
--font-semibold: 600;
--font-bold:     700;
--font-black:    900;
```

### Tokens de Espaçamento

```
2px   → gap-0.5  (micro separadores)
4px   → gap-1    (entre ícone e texto)
8px   → gap-2    (padding interno mínimo)
12px  → gap-3    (espaçamento interno cards)
16px  → gap-4    (padding padrão mobile)
20px  → gap-5    (separação de seções)
24px  → gap-6    (padding de cards grandes)
32px  → gap-8    (margem entre blocos)
40px  → gap-10   (espaço de respiro)
48px  → gap-12   (seções maiores)
64px  → gap-16   (hero spacing)
```

### Raio de Borda

```css
--radius-sm:   6px;   /* badges, tags */
--radius-md:   10px;  /* inputs, botões pequenos */
--radius-lg:   14px;  /* cards */
--radius-xl:   18px;  /* cards grandes, modais */
--radius-2xl:  24px;  /* bottom sheet */
--radius-full: 9999px; /* pills, avatares */
```

### Sombras

```css
/* Sombras com toque dourado para elementos de destaque */
--shadow-sm:      0 1px 3px rgba(0, 0, 0, 0.4);
--shadow-md:      0 4px 12px rgba(0, 0, 0, 0.5);
--shadow-lg:      0 8px 24px rgba(0, 0, 0, 0.6);
--shadow-xl:      0 16px 48px rgba(0, 0, 0, 0.7);
--shadow-gold:    0 0 20px rgba(212, 160, 23, 0.3);
--shadow-gold-sm: 0 0 10px rgba(212, 160, 23, 0.2);
--shadow-inset:   inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

### Padrões de Cards

**Glass Card Dark:**
```
background: rgba(255, 255, 255, 0.03)
border: 1px solid rgba(255, 255, 255, 0.08)
backdrop-filter: blur(12px)
border-radius: 14px
padding: 20px
```

**Card Sólido Premium:**
```
background: #181818
border: 1px solid rgba(255, 255, 255, 0.10)
border-radius: 14px
padding: 20px
box-shadow: 0 4px 12px rgba(0,0,0,0.5)
```

**Card Dourado (destaque):**
```
background: linear-gradient(135deg, rgba(212,160,23,0.15), rgba(212,160,23,0.05))
border: 1px solid rgba(212,160,23,0.4)
border-radius: 14px
padding: 20px
box-shadow: 0 0 20px rgba(212,160,23,0.2)
```

### Padrões de Botões

```
Primary:    bg-gold-500 text-black font-bold hover:bg-gold-400 shadow-gold
Secondary:  border border-gold-500/40 text-gold-400 hover:bg-gold-500/10
Ghost:      text-white/70 hover:text-white hover:bg-white/5
Danger:     bg-red-600 text-white hover:bg-red-500
Disabled:   opacity-40 cursor-not-allowed
```

### Padrões de Badges

```
Disponível:    bg-green-500/15 text-green-400 border-green-500/30
Lotado:        bg-red-500/15 text-red-400 border-red-500/30
Fechado:       bg-graphite-600/50 text-graphite-400 border-graphite-600/30
Em dia:        bg-green-500/15 text-green-400 border-green-500/30
Vencendo:      bg-amber-500/15 text-amber-400 border-amber-500/30
Vencido:       bg-red-500/15 text-red-400 border-red-500/30
Confirmado:    bg-blue-500/15 text-blue-400 border-blue-500/30
Lista espera:  bg-amber-500/15 text-amber-400 border-amber-500/30
```

### Animações Principais (Framer Motion)

```typescript
// Entrada de página
export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
}

// Cards escalonados
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } }
}
export const cardReveal = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] }
}

// Confirmação de reserva (sucesso)
export const successPulse = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 400, damping: 20 }
}

// Toast dourado
export const toastSlide = {
  initial: { x: 80, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 80, opacity: 0 },
  transition: { type: 'spring', stiffness: 400, damping: 30 }
}

// Glow dourado (brilho pulsante na splash)
// Implementado via CSS @keyframes + Framer Motion
export const goldGlow = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(212,160,23,0.3)',
      '0 0 60px rgba(212,160,23,0.6)',
      '0 0 20px rgba(212,160,23,0.3)',
    ],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
  }
}
```

---

## 4. BANCO DE DADOS — SCHEMA SQL COMPLETO

```sql
-- ============================================================
-- K.S FUTEVÔLEI FLORIPA-SC — SCHEMA SQL SUPABASE
-- Arquivo: supabase/migrations/001_initial_schema.sql
-- ============================================================

-- ==========================
-- EXTENSIONS
-- ==========================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";  -- Para jobs agendados de mensalidade

-- ==========================
-- ENUMS
-- ==========================

CREATE TYPE user_role AS ENUM ('student', 'coach', 'super_admin');

CREATE TYPE slot_status AS ENUM ('open', 'closed', 'cancelled');

CREATE TYPE booking_status AS ENUM ('confirmed', 'cancelled', 'no_show', 'attended');

CREATE TYPE membership_status AS ENUM ('active', 'due_soon', 'overdue', 'inactive', 'trial');

CREATE TYPE payment_status AS ENUM ('paid', 'pending', 'overdue', 'waived');

CREATE TYPE message_type AS ENUM ('text', 'image', 'system');

CREATE TYPE notification_type AS ENUM (
  'booking_created',
  'booking_cancelled',
  'waitlist_promoted',
  'new_message',
  'membership_due',
  'membership_overdue',
  'new_announcement',
  'slot_opened',
  'slot_closed',
  'attendance_marked'
);

CREATE TYPE announcement_scope AS ENUM ('all', 'slot', 'day');

-- ==========================
-- TABELA: academies (white-label multi-tenant)
-- ==========================
CREATE TABLE academies (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,          -- URL slug: ks-futevolei-floripa
  logo_url      TEXT,
  primary_color TEXT DEFAULT '#D4A017',        -- Cor dourada padrão
  city          TEXT,
  state         TEXT DEFAULT 'SC',
  phone         TEXT,
  instagram     TEXT,
  description   TEXT,
  settings      JSONB DEFAULT '{}'::JSONB,     -- Configurações customizáveis
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- TABELA: profiles (auth.users → profiles)
-- ==========================
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  academy_id    UUID REFERENCES academies(id) ON DELETE SET NULL,
  role          user_role NOT NULL DEFAULT 'student',
  full_name     TEXT NOT NULL,
  phone         TEXT NOT NULL,
  avatar_url    TEXT,
  onesignal_id  TEXT,                          -- ID do player OneSignal para push
  fcm_token     TEXT,                          -- Token FCM alternativo
  is_active     BOOLEAN DEFAULT TRUE,
  last_seen_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- TABELA: coaches (perfil detalhado do professor)
-- ==========================
CREATE TABLE coaches (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  bio             TEXT,
  certifications  TEXT[],
  specialties     TEXT[],
  default_capacity INT NOT NULL DEFAULT 10,   -- Capacidade padrão por slot
  cancel_policy   TEXT DEFAULT '2 horas antes do treino',
  is_accepting    BOOLEAN DEFAULT TRUE,        -- Aceitando novos alunos
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- TABELA: students (perfil detalhado do aluno)
-- ==========================
CREATE TABLE students (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES coaches(id) ON DELETE SET NULL,
  emergency_contact TEXT,
  birth_date      DATE,
  notes           TEXT,                        -- Observações internas do professor
  total_attendances INT DEFAULT 0,
  joined_at       DATE DEFAULT CURRENT_DATE,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- TABELA: training_days (dias de treino)
-- ==========================
CREATE TABLE training_days (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  is_open         BOOLEAN DEFAULT TRUE,        -- Dia aberto para agendamentos
  observation     TEXT,                        -- Observação geral do dia (ex: "Dia de jogo")
  theme           TEXT,                        -- Tema do treino (ex: "Saque e Recepção")
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(academy_id, coach_id, date)
);

-- ==========================
-- TABELA: training_slots (horários por dia)
-- ==========================
CREATE TABLE training_slots (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  training_day_id UUID NOT NULL REFERENCES training_days(id) ON DELETE CASCADE,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  start_time      TIME NOT NULL,               -- Ex: 08:00
  end_time        TIME NOT NULL,               -- Ex: 09:00 (sempre +1h)
  capacity        INT NOT NULL DEFAULT 10,
  booked_count    INT NOT NULL DEFAULT 0,      -- Cache de reservas confirmadas
  status          slot_status NOT NULL DEFAULT 'open',
  observation     TEXT,                        -- Observação específica do horário
  location        TEXT DEFAULT 'Quadra Principal',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT capacity_positive CHECK (capacity > 0),
  CONSTRAINT booked_not_exceed_capacity CHECK (booked_count <= capacity),
  CONSTRAINT booked_not_negative CHECK (booked_count >= 0),
  UNIQUE(training_day_id, start_time)
);

-- ==========================
-- TABELA: bookings (reservas)
-- ==========================
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id         UUID NOT NULL REFERENCES training_slots(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  status          booking_status NOT NULL DEFAULT 'confirmed',
  booked_at       TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(slot_id, student_id)           -- Aluno só pode reservar 1x por slot
);

-- ==========================
-- TABELA: waitlist (lista de espera)
-- ==========================
CREATE TABLE waitlist (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id         UUID NOT NULL REFERENCES training_slots(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  position        INT NOT NULL,                -- Posição na fila (1 = próximo)
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  notified_at     TIMESTAMPTZ,                 -- Quando foi notificado de vaga
  promoted_at     TIMESTAMPTZ,                 -- Quando foi promovido para booking
  is_active       BOOLEAN DEFAULT TRUE,

  UNIQUE(slot_id, student_id),
  UNIQUE(slot_id, position)
);

-- ==========================
-- TABELA: memberships (mensalidades)
-- ==========================
CREATE TABLE memberships (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  reference_month DATE NOT NULL,               -- Mês de referência (sempre dia 1)
  due_date        DATE NOT NULL,               -- Data de vencimento
  amount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  status          payment_status NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMPTZ,
  payment_method  TEXT,                        -- pix, dinheiro, transferência
  receipt_url     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(student_id, reference_month)
);

-- ==========================
-- TABELA: attendance (presença)
-- ==========================
CREATE TABLE attendance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  slot_id         UUID NOT NULL REFERENCES training_slots(id) ON DELETE CASCADE,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  attended        BOOLEAN NOT NULL DEFAULT FALSE,
  marked_at       TIMESTAMPTZ,
  marked_by       UUID REFERENCES profiles(id),  -- Quem marcou (coach)
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_id)
);

-- ==========================
-- TABELA: messages (chat)
-- ==========================
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  type            message_type NOT NULL DEFAULT 'text',
  related_slot_id UUID REFERENCES training_slots(id) ON DELETE SET NULL,
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- TABELA: announcements (avisos)
-- ==========================
CREATE TABLE announcements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  coach_id        UUID NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  scope           announcement_scope NOT NULL DEFAULT 'all',
  slot_id         UUID REFERENCES training_slots(id) ON DELETE CASCADE,
  day_date        DATE,                        -- Para avisos de um dia específico
  is_pinned       BOOLEAN DEFAULT FALSE,
  expires_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- TABELA: notifications (in-app notifications)
-- ==========================
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  academy_id      UUID NOT NULL REFERENCES academies(id) ON DELETE CASCADE,
  type            notification_type NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  data            JSONB DEFAULT '{}'::JSONB,   -- Payload extra (slot_id, booking_id, etc.)
  is_read         BOOLEAN DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  push_sent       BOOLEAN DEFAULT FALSE,
  push_sent_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- TABELA: settings (configurações da academia)
-- ==========================
CREATE TABLE settings (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  academy_id      UUID NOT NULL UNIQUE REFERENCES academies(id) ON DELETE CASCADE,
  default_slot_duration INT DEFAULT 60,        -- Minutos por slot
  default_capacity INT DEFAULT 10,
  cancel_deadline_hours INT DEFAULT 2,         -- Horas antes para cancelar
  auto_waitlist   BOOLEAN DEFAULT TRUE,
  allow_self_checkin BOOLEAN DEFAULT FALSE,
  membership_due_day INT DEFAULT 10,           -- Dia do mês para vencimento
  default_monthly_fee DECIMAL(10,2) DEFAULT 0,
  timezone        TEXT DEFAULT 'America/Sao_Paulo',
  custom_texts    JSONB DEFAULT '{}'::JSONB,   -- Textos customizáveis
  social_links    JSONB DEFAULT '{}'::JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================
-- ÍNDICES
-- ==========================

-- Bookings
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_academy_id ON bookings(academy_id);

-- Training slots
CREATE INDEX idx_slots_training_day_id ON training_slots(training_day_id);
CREATE INDEX idx_slots_coach_id ON training_slots(coach_id);
CREATE INDEX idx_slots_status ON training_slots(status);

-- Training days
CREATE INDEX idx_days_date ON training_days(date);
CREATE INDEX idx_days_academy_coach ON training_days(academy_id, coach_id);

-- Messages
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_academy ON messages(academy_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(receiver_id, is_read) WHERE is_read = FALSE;

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Memberships
CREATE INDEX idx_memberships_student ON memberships(student_id);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_due_date ON memberships(due_date);
CREATE INDEX idx_memberships_reference ON memberships(reference_month);

-- Waitlist
CREATE INDEX idx_waitlist_slot ON waitlist(slot_id);
CREATE INDEX idx_waitlist_student ON waitlist(student_id);
CREATE INDEX idx_waitlist_active ON waitlist(slot_id, is_active, position) WHERE is_active = TRUE;

-- Profiles
CREATE INDEX idx_profiles_academy ON profiles(academy_id);
CREATE INDEX idx_profiles_phone ON profiles(phone);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ==========================
-- FUNCTIONS & TRIGGERS
-- ==========================

-- Atualiza updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_coaches_updated_at BEFORE UPDATE ON coaches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_training_days_updated_at BEFORE UPDATE ON training_days
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_training_slots_updated_at BEFORE UPDATE ON training_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_memberships_updated_at BEFORE UPDATE ON memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_announcements_updated_at BEFORE UPDATE ON announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNCTION: Atualiza booked_count quando booking é criado/cancelado
-- ============================================================
CREATE OR REPLACE FUNCTION sync_booked_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    UPDATE training_slots
    SET booked_count = booked_count + 1
    WHERE id = NEW.slot_id;

  ELSIF TG_OP = 'UPDATE' THEN
    -- De confirmado para cancelado
    IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
      UPDATE training_slots
      SET booked_count = GREATEST(booked_count - 1, 0)
      WHERE id = NEW.slot_id;

    -- De cancelado para confirmado (reativação)
    ELSIF OLD.status = 'cancelled' AND NEW.status = 'confirmed' THEN
      UPDATE training_slots
      SET booked_count = booked_count + 1
      WHERE id = NEW.slot_id;
    END IF;

  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmed' THEN
    UPDATE training_slots
    SET booked_count = GREATEST(booked_count - 1, 0)
    WHERE id = OLD.slot_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_booked_count
  AFTER INSERT OR UPDATE OR DELETE ON bookings
  FOR EACH ROW EXECUTE FUNCTION sync_booked_count();

-- ============================================================
-- FUNCTION: Promove próximo da lista de espera automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION promote_from_waitlist(p_slot_id UUID)
RETURNS VOID AS $$
DECLARE
  v_next_waitlist waitlist%ROWTYPE;
  v_slot training_slots%ROWTYPE;
  v_student_profile_id UUID;
BEGIN
  SELECT * INTO v_slot FROM training_slots WHERE id = p_slot_id;

  -- Só promove se houver vaga
  IF v_slot.booked_count < v_slot.capacity AND v_slot.status = 'open' THEN
    -- Pega o próximo da fila
    SELECT * INTO v_next_waitlist
    FROM waitlist
    WHERE slot_id = p_slot_id AND is_active = TRUE
    ORDER BY position ASC
    LIMIT 1;

    IF FOUND THEN
      -- Cria o booking
      INSERT INTO bookings (slot_id, student_id, academy_id, status)
      SELECT p_slot_id, v_next_waitlist.student_id, v_slot.academy_id, 'confirmed'
      ON CONFLICT (slot_id, student_id) DO UPDATE SET status = 'confirmed';

      -- Remove da waitlist
      UPDATE waitlist
      SET is_active = FALSE, promoted_at = NOW()
      WHERE id = v_next_waitlist.id;

      -- Reordena posições restantes
      UPDATE waitlist
      SET position = position - 1
      WHERE slot_id = p_slot_id AND is_active = TRUE AND position > v_next_waitlist.position;

      -- Pega o profile_id do aluno para notificação
      SELECT p.id INTO v_student_profile_id
      FROM students s
      JOIN profiles p ON p.id = s.profile_id
      WHERE s.id = v_next_waitlist.student_id;

      -- Cria notificação in-app
      INSERT INTO notifications (user_id, academy_id, type, title, body, data)
      VALUES (
        v_student_profile_id,
        v_slot.academy_id,
        'waitlist_promoted',
        'Vaga confirmada! 🎉',
        'Uma vaga abriu e você foi confirmado no treino.',
        jsonb_build_object('slot_id', p_slot_id, 'booking_status', 'confirmed')
      );
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger para chamar promote_from_waitlist após cancelamento
CREATE OR REPLACE FUNCTION after_booking_cancelled()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
    PERFORM promote_from_waitlist(NEW.slot_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_booking_cancelled
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION after_booking_cancelled();

-- ============================================================
-- FUNCTION: Calcula status de mensalidade automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_membership_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-calcula status baseado na data de vencimento (se não foi pago)
  IF NEW.status != 'paid' AND NEW.status != 'waived' THEN
    IF NEW.due_date < CURRENT_DATE THEN
      NEW.status = 'overdue';
    ELSIF NEW.due_date <= CURRENT_DATE + INTERVAL '5 days' THEN
      NEW.status = 'pending';
    ELSE
      NEW.status = 'pending';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Atualiza total_attendances do aluno
-- ============================================================
CREATE OR REPLACE FUNCTION sync_student_attendance_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.attended = TRUE AND OLD.attended = FALSE THEN
    UPDATE students SET total_attendances = total_attendances + 1
    WHERE id = NEW.student_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.attended = FALSE AND OLD.attended = TRUE THEN
    UPDATE students SET total_attendances = GREATEST(total_attendances - 1, 0)
    WHERE id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_attendance_count
  AFTER UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION sync_student_attendance_count();

-- ==========================
-- ROW LEVEL SECURITY (RLS)
-- ==========================

ALTER TABLE academies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Profiles: cada usuário vê apenas seu perfil + coach da sua academia
CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.academy_id = profiles.academy_id
      AND p.role IN ('coach', 'super_admin')
    )
  );

CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Training days & slots: visíveis para todos da academia
CREATE POLICY "training_days_academy_read" ON training_days
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.academy_id = training_days.academy_id
    )
  );

CREATE POLICY "training_days_coach_write" ON training_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.academy_id = training_days.academy_id
      AND p.role IN ('coach', 'super_admin')
    )
  );

CREATE POLICY "training_slots_academy_read" ON training_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.academy_id = training_slots.academy_id
    )
  );

CREATE POLICY "training_slots_coach_write" ON training_slots
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.academy_id = training_slots.academy_id
      AND p.role IN ('coach', 'super_admin')
    )
  );

-- Bookings: aluno vê suas próprias, coach vê todas da academia
CREATE POLICY "bookings_student_read" ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.id = s.profile_id
      WHERE s.id = bookings.student_id AND p.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.academy_id = bookings.academy_id
      AND p.role IN ('coach', 'super_admin')
    )
  );

CREATE POLICY "bookings_student_insert" ON bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.id = s.profile_id
      WHERE s.id = bookings.student_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "bookings_student_cancel" ON bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.id = s.profile_id
      WHERE s.id = bookings.student_id AND p.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.academy_id = bookings.academy_id
      AND p.role IN ('coach', 'super_admin')
    )
  );

-- Memberships: aluno vê sua própria, coach vê todas
CREATE POLICY "memberships_student_read" ON memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN profiles p ON p.id = s.profile_id
      WHERE s.id = memberships.student_id AND p.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.academy_id = memberships.academy_id
      AND p.role IN ('coach', 'super_admin')
    )
  );

CREATE POLICY "memberships_coach_write" ON memberships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.academy_id = memberships.academy_id
      AND p.role IN ('coach', 'super_admin')
    )
  );

-- Messages: apenas sender e receiver veem
CREATE POLICY "messages_participant_read" ON messages
  FOR SELECT USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

CREATE POLICY "messages_participant_insert" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "messages_mark_read" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);

-- Notifications: apenas o destinatário vê
CREATE POLICY "notifications_self" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- Announcements: todos da academia leem, coach escreve
CREATE POLICY "announcements_academy_read" ON announcements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.academy_id = announcements.academy_id
    )
  );

CREATE POLICY "announcements_coach_write" ON announcements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.academy_id = announcements.academy_id
      AND p.role IN ('coach', 'super_admin')
    )
  );

-- ==========================
-- SEED INICIAL (DESENVOLVIMENTO)
-- ==========================

-- Cria a academia K.S Futevôlei
INSERT INTO academies (id, name, slug, primary_color, city, state, phone, instagram)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  'K.S Futevôlei',
  'ks-futevolei-floripa',
  '#D4A017',
  'Florianópolis',
  'SC',
  '+55 48 99999-9999',
  '@ksfutevolei'
);

-- Cria settings padrão
INSERT INTO settings (academy_id, default_capacity, default_monthly_fee, cancel_deadline_hours)
VALUES (
  'a1b2c3d4-0000-0000-0000-000000000001',
  10,
  250.00,
  2
);
```

---

## 5. TIPOS TYPESCRIPT COMPLETOS

```typescript
// ============================================================
// src/types/domain.ts
// K.S Futevôlei — Tipos de Domínio Central
// ============================================================

// ==========================
// ENUMS
// ==========================

export type UserRole = 'student' | 'coach' | 'super_admin'

export type SlotStatus = 'open' | 'closed' | 'cancelled'

export type BookingStatus = 'confirmed' | 'cancelled' | 'no_show' | 'attended'

export type MembershipStatus = 'active' | 'due_soon' | 'overdue' | 'inactive' | 'trial'

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'waived'

export type MessageType = 'text' | 'image' | 'system'

export type NotificationType =
  | 'booking_created'
  | 'booking_cancelled'
  | 'waitlist_promoted'
  | 'new_message'
  | 'membership_due'
  | 'membership_overdue'
  | 'new_announcement'
  | 'slot_opened'
  | 'slot_closed'
  | 'attendance_marked'

export type AnnouncementScope = 'all' | 'slot' | 'day'

// ==========================
// CORE DOMAIN TYPES
// ==========================

export interface Academy {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  city: string | null
  state: string
  phone: string | null
  instagram: string | null
  description: string | null
  settings: Record<string, unknown>
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: string
  academyId: string | null
  role: UserRole
  fullName: string
  phone: string
  avatarUrl: string | null
  onesignalId: string | null
  fcmToken: string | null
  isActive: boolean
  lastSeenAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Coach {
  id: string
  profileId: string
  academyId: string
  bio: string | null
  certifications: string[]
  specialties: string[]
  defaultCapacity: number
  cancelPolicy: string
  isAccepting: boolean
  createdAt: string
  updatedAt: string
  // Joins
  profile?: Profile
  academy?: Academy
}

export interface Student {
  id: string
  profileId: string
  academyId: string
  coachId: string | null
  emergencyContact: string | null
  birthDate: string | null
  notes: string | null
  totalAttendances: number
  joinedAt: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Joins
  profile?: Profile
  coach?: Coach
  currentMembership?: Membership | null
}

export interface TrainingDay {
  id: string
  academyId: string
  coachId: string
  date: string                    // ISO date: 2025-01-15
  isOpen: boolean
  observation: string | null
  theme: string | null
  createdAt: string
  updatedAt: string
  // Joins
  slots?: TrainingSlot[]
  coach?: Coach
}

export interface TrainingSlot {
  id: string
  trainingDayId: string
  academyId: string
  coachId: string
  startTime: string               // HH:MM
  endTime: string                 // HH:MM
  capacity: number
  bookedCount: number
  status: SlotStatus
  observation: string | null
  location: string
  createdAt: string
  updatedAt: string
  // Computed
  availableSpots: number          // capacity - bookedCount
  isFull: boolean                 // bookedCount >= capacity
  // Joins
  trainingDay?: TrainingDay
  bookings?: Booking[]
  waitlist?: WaitlistEntry[]
  userBooking?: Booking | null    // Reserva do usuário atual
  userWaitlistPosition?: number | null
}

export interface Booking {
  id: string
  slotId: string
  studentId: string
  academyId: string
  status: BookingStatus
  bookedAt: string
  cancelledAt: string | null
  cancelReason: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  // Joins
  slot?: TrainingSlot
  student?: Student
}

export interface WaitlistEntry {
  id: string
  slotId: string
  studentId: string
  academyId: string
  position: number
  joinedAt: string
  notifiedAt: string | null
  promotedAt: string | null
  isActive: boolean
  // Joins
  student?: Student
  slot?: TrainingSlot
}

export interface Membership {
  id: string
  studentId: string
  academyId: string
  coachId: string
  referenceMonth: string          // ISO date: primeiro dia do mês
  dueDate: string
  amount: number
  status: PaymentStatus
  paidAt: string | null
  paymentMethod: string | null
  receiptUrl: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  // Computed
  membershipStatus: MembershipStatus
  daysUntilDue: number
  isOverdue: boolean
  isDueSoon: boolean              // Vence em até 5 dias
  // Joins
  student?: Student
}

export interface Attendance {
  id: string
  bookingId: string
  studentId: string
  slotId: string
  academyId: string
  attended: boolean
  markedAt: string | null
  markedBy: string | null
  createdAt: string
  // Joins
  booking?: Booking
  student?: Student
  slot?: TrainingSlot
}

export interface Message {
  id: string
  academyId: string
  senderId: string
  receiverId: string
  content: string
  type: MessageType
  relatedSlotId: string | null
  isRead: boolean
  readAt: string | null
  createdAt: string
  // Joins
  sender?: Profile
  receiver?: Profile
  relatedSlot?: TrainingSlot | null
}

export interface Conversation {
  participantId: string
  participant: Profile
  lastMessage: Message
  unreadCount: number
}

export interface Announcement {
  id: string
  academyId: string
  coachId: string
  title: string
  content: string
  scope: AnnouncementScope
  slotId: string | null
  dayDate: string | null
  isPinned: boolean
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  // Joins
  coach?: Coach
  slot?: TrainingSlot | null
}

export interface Notification {
  id: string
  userId: string
  academyId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>
  isRead: boolean
  readAt: string | null
  pushSent: boolean
  pushSentAt: string | null
  createdAt: string
}

export interface AppSettings {
  id: string
  academyId: string
  defaultSlotDuration: number
  defaultCapacity: number
  cancelDeadlineHours: number
  autoWaitlist: boolean
  allowSelfCheckin: boolean
  membershipDueDay: number
  defaultMonthlyFee: number
  timezone: string
  customTexts: Record<string, string>
  socialLinks: Record<string, string>
  createdAt: string
  updatedAt: string
}

// ==========================
// UI / COMPUTED TYPES
// ==========================

export interface DashboardStats {
  totalStudents: number
  activeStudents: number
  todaySlots: number
  todayBookings: number
  todayCapacity: number
  pendingPayments: number
  overduePayments: number
  unreadMessages: number
  occupancyRate: number           // Percentual de vagas preenchidas hoje
}

export interface StudentWithStatus extends Student {
  membershipStatus: MembershipStatus
  nextBooking: Booking | null
  unreadMessages: number
}

export interface SlotWithContext extends TrainingSlot {
  dayObservation: string | null
  dayTheme: string | null
  dayDate: string
  isToday: boolean
  isPast: boolean
  userBooking: Booking | null
  userWaitlistPosition: number | null
}

// ==========================
// API TYPES
// ==========================

export interface CreateBookingRequest {
  slotId: string
  notes?: string
}

export interface CreateBookingResponse {
  success: boolean
  booking?: Booking
  waitlistEntry?: WaitlistEntry
  waitlistPosition?: number
  message: string
}

export interface CancelBookingRequest {
  bookingId: string
  reason?: string
}

export interface SendMessageRequest {
  receiverId: string
  content: string
  relatedSlotId?: string
}

export interface CreateSlotRequest {
  trainingDayId: string
  startTime: string
  capacity: number
  observation?: string
  location?: string
}

export interface UpdateMembershipRequest {
  studentId: string
  referenceMonth: string
  amount: number
  dueDate: string
  status: PaymentStatus
  paymentMethod?: string
  notes?: string
}

// ==========================
// REALTIME EVENT TYPES
// ==========================

export interface RealtimeBookingEvent {
  eventType: 'booking_created' | 'booking_cancelled' | 'waitlist_promoted'
  slotId: string
  studentId: string
  studentName: string
  slotTime: string
  slotDate: string
  bookedCount: number
  capacity: number
  availableSpots: number
}

export interface RealtimeSlotUpdate {
  slotId: string
  bookedCount: number
  capacity: number
  availableSpots: number
  isFull: boolean
  status: SlotStatus
}

export interface RealtimeMessageEvent {
  messageId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

export interface RealtimeNotificationEvent {
  notificationId: string
  type: NotificationType
  title: string
  body: string
  data: Record<string, unknown>
}

// ==========================
// AUTH TYPES
// ==========================

export interface LoginRequest {
  phone: string
  name: string
}

export interface AuthUser {
  id: string
  profile: Profile
  student?: Student
  coach?: Coach
  academy: Academy
}

// ==========================
// SUPABASE DATABASE TYPES
// (gerado automaticamente — complementado aqui)
// ==========================

export type Tables = {
  academies: Academy
  profiles: Profile
  coaches: Coach
  students: Student
  training_days: TrainingDay
  training_slots: TrainingSlot
  bookings: Booking
  waitlist: WaitlistEntry
  memberships: Membership
  attendance: Attendance
  messages: Message
  announcements: Announcement
  notifications: Notification
  settings: AppSettings
}
```

---

## CHECKLIST DA FASE 1 ✅

- [x] Visão geral do produto definida
- [x] Tipos de usuário mapeados
- [x] Fluxos principais documentados
- [x] Diferenciais premium listados
- [x] MVP vs roadmap definidos
- [x] Estrutura de pastas completa
- [x] Rotas App Router mapeadas
- [x] Componentes organizados por domínio
- [x] Hooks nomeados e organizados
- [x] Services separados por responsabilidade
- [x] Design system completo (cores, tipografia, tokens)
- [x] Paleta baseada na logo (dourado, preto, grafite, branco)
- [x] Padrões de cards, botões, badges definidos
- [x] Animações Framer Motion nomeadas
- [x] Schema SQL completo com 13 tabelas
- [x] Enums, índices e relações criados
- [x] Triggers para booked_count, waitlist, attendance
- [x] RLS configurado por role
- [x] Funções PostgreSQL para lógica de negócio
- [x] Tipos TypeScript completos e tipados
- [x] Tipos de Realtime Events definidos
- [x] Tipos de API (request/response) definidos

---

**PRÓXIMA FASE:** Fase 2 — Setup Técnico (package.json, next.config.ts, tailwind.config.ts, providers, supabase client, PWA manifest, service worker)
