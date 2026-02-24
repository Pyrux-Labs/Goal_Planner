# Goal Planner

A goal-focused calendar app where you define annual objectives and link them to tasks and daily habits. Track your progress over time and turn long-term plans into concrete actions, all in one place.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **UI:** React 19, Tailwind CSS 3.4, Radix UI primitives
- **Auth & DB:** Supabase (Auth + PostgreSQL)
- **Icons:** Lucide React, React Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- A Supabase project

### Installation

```bash
cd goal_planner
npm install
```

### Environment Variables

Create a `.env.local` file inside `goal_planner/`:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Start development server |
| `npm run build` | Create production build  |
| `npm run start` | Serve production build   |
| `npm run lint`  | Run ESLint               |

## Project Structure

```
goal_planner/
├── app/                        # Next.js App Router pages
│   ├── (authenticated)/        # Route group with shared Navbar layout
│   │   ├── anual-goals/        # Annual goals overview
│   │   ├── calendar/           # Calendar views (monthly & weekly)
│   │   ├── edit-goal/          # Edit existing goal
│   │   ├── new-goal/           # Create new goal
│   │   ├── profile/            # User profile
│   │   ├── settings/           # User settings
│   │   └── stats/              # Statistics
│   ├── change-password/        # Password change (public)
│   ├── forgot-password/        # Password reset request
│   ├── landing/                # Landing page
│   ├── onboarding/             # Post-registration onboarding
│   ├── register/               # Sign up
│   └── verify/                 # Email verification
├── components/
│   ├── auth/                   # Authentication components
│   ├── Calendar/               # Calendar-specific components
│   ├── common/                 # Shared components (GoalCard, GoalForm, etc.)
│   ├── LandingPage/            # Landing page components
│   ├── Layout/                 # Navbar, Top bar
│   ├── Onboarding/             # Onboarding flow components
│   └── ui/                     # Base UI primitives (Button, Modal, Toast, etc.)
├── hooks/                      # Custom React hooks
├── lib/
│   ├── constants/              # Shared constants (categories, colors, validation)
│   ├── supabase/               # Supabase client/server/middleware helpers
│   └── utils.ts                # cn() utility
├── types/                      # TypeScript type definitions
└── utils/                      # Utility functions (date, delete operations)
```

## User Flow

1. **Landing** → Register → Email Verification → Onboarding
2. **Calendar** (default authenticated view) → Create/Edit Goals → Add Tasks & Habits
3. **Annual Goals** → View all goals with progress tracking
4. **Settings** → Manage preferences | **Profile** → Account info

## Design

[Figma Design](https://www.figma.com/design/n3KV1qsUe7WAUo9LyHf69o/Goal-Planner?node-id=0-1&t=pdHh0mdMvi8nDdEI-1)
