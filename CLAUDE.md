# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RepurposeAI** - AI-powered content repurposing SaaS that transforms blog posts into platform-optimized content (Twitter threads, LinkedIn posts, Instagram captions, etc.).

**Business Model:**
- Free tier: 3 jobs/month, 5 formats
- Pro tier: $19/month, unlimited jobs, 10 formats

## Tech Stack

- **Framework:** Next.js 16 with App Router, React 19, React Compiler enabled
- **Styling:** Tailwind CSS 4 + shadcn/ui (Radix primitives)
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth (email/password)
- **Payments:** Stripe (subscription mode)
- **AI:** Fallback system - Primary: Gemini 2.0 Flash, Fallback: Groq (llama-3.3-70b-versatile)

## Development Commands

```bash
npm install      # Install dependencies
npm run dev      # Development server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint (next config)
```

## Architecture

### Key Patterns

1. **Server/Client Component Split:** Pages use Server Components for data fetching, with `-client.tsx` files for interactive UI (e.g., `dashboard/page.tsx` + `dashboard-client.tsx`).

2. **Protected Routes:** Middleware at `src/middleware.ts` redirects unauthenticated users from `/dashboard`, `/new-job`, `/job/*`, `/account` to `/login`. Authenticated users on `/login` or `/signup` redirect to `/dashboard`.

3. **Supabase Clients:**
   - `lib/supabase/client.ts` - Browser client
   - `lib/supabase/server.ts` - Server Component client
   - `lib/supabase/middleware.ts` - Middleware client with session refresh

4. **Usage Tracking:** `jobs_this_month` resets when `jobs_reset_date` is passed. Check happens in `/api/jobs/create`.

### API Routes

- `POST /api/jobs/create` - Create repurposing job (validates tier limits, uses AI fallback: Gemini → Groq)
- `POST /api/subscription/create-checkout` - Create Stripe checkout session
- `POST /api/subscription/portal` - Stripe customer portal redirect
- `POST /api/subscription/cancel` - Cancel subscription
- `POST /api/subscription/webhook` - Stripe webhook (handles checkout.session.completed, subscription updates/deletions, payment failures)
- `GET /api/admin/status` - Get user subscription status
- Admin routes: `/api/admin/upgrade`, `/api/admin/downgrade`, `/api/admin/reset-usage`

### Database Schema

Two tables with RLS enabled (see `supabase-schema.sql`):
- `users` - Extends auth.users; fields: subscription_tier, jobs_this_month, jobs_reset_date, stripe_customer_id
- `jobs` - user_id, input_text, brand_voice, selected_formats (text[]), outputs (JSONB)

Auto-create user profile trigger on auth.users insert.

## Environment Variables

Copy `.env.example` to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY (primary AI), GROQ_API_KEY (fallback AI)
FIRECRAWL_API_KEY (URL scraping)
STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRO_PRICE_ID
NEXT_PUBLIC_APP_URL
```

## Platform Formats

Defined in `lib/types.ts`:
- Free: twitter, linkedin, instagram, email, blog_summary
- Pro only: youtube, tiktok, facebook, pinterest, reddit

Prompts for each format in `lib/prompts.ts`.
