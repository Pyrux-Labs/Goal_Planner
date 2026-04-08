# Goal Planner

A goal-focused calendar app where you define annual objectives and link them to tasks and daily habits. Track your progress over time and turn long-term plans into concrete actions, all in one place.

**Production:** https://www.goalplanner.com.ar

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5 (strict mode)
- **UI:** React 19, Tailwind CSS 3.4, Radix UI primitives
- **Auth & DB:** Supabase (Auth + PostgreSQL)
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A Supabase project

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file at the repo root:

```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
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
app/
  (authenticated)/        # Route group: Navbar + bg shell
    calendar/             # Full-bleed calendar (monthly & weekly views)
    (pages)/              # Route group: content padding wrapper
      anual-goals/        # Annual goals overview
      edit-goal/          # Edit existing goal
      new-goal/           # Create new goal
      profile/            # User profile
      settings/           # User settings
      stats/              # Analytics & statistics
  auth/callback/          # OAuth PKCE callback
  change-password/        # Password change (public)
  forgot-password/        # Password reset request
  landing/                # Landing page
  onboarding/             # Post-registration onboarding
  register/               # Sign up
  verify/                 # Email verification

components/
  analytics/              # CompletionDonut, ProductiveDays, StreakCard
  anual-goals/            # GoalsStatisticsBar, GoalsFilters
  auth/                   # sign-in modal
  calendar/               # CalendarUI, CalendarGrid, CalendarCard, CalendarWeeklyView, etc.
  common/                 # Shared: GoalCard, GoalForm, AddTask, AddHabit, SidebarContent, etc.
  landing/                # Landing page sections
  layout/                 # Navbar, Top, PageTransition, UserAvatar
  onboarding/             # NavigationButtons, ProgressBar, StepHeader
  settings/               # DangerZone
  stats/                  # StatsPeriodSelector, StatsLoadingSkeleton
  ui/                     # Design system: Button, Modal, InputField, Toast, GoogleIcon, etc.

hooks/                    # use-analytics-data, use-calendar-events, use-goals-data, etc.
contexts/                 # UserContext
lib/
  constants/              # categories, colors, days, routes
  services/               # auth, event, goal, habit, log, task
  supabase/               # client, server, auth-client, middleware
  validations/            # auth, goal, habit, task, repeat-days
  date-utils.ts / format-utils.ts / goal-data-utils.ts / utils.ts
types/                    # calendar, goal, habit, log, sidebar, task
```

## User Flow

1. **Landing** → Register → Email Verification → Onboarding
2. **Calendar** (default authenticated view) → Create/Edit Goals → Add Tasks & Habits
3. **Annual Goals** → View all goals with progress tracking
4. **Stats** → Analytics by week / month / all time
5. **Settings** → Manage account and danger zone

## Design

[Figma Design](https://www.figma.com/design/n3KV1qsUe7WAUo9LyHf69o/Goal-Planner?node-id=0-1&t=pdHh0mdMvi8nDdEI-1)
