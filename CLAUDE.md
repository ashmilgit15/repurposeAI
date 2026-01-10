# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**RepurposeAI** - An AI-powered content repurposing SaaS that transforms blog posts into platform-optimized content (Twitter threads, LinkedIn posts, Instagram captions, etc.) in 60 seconds.

**Business Model:**
- Free tier: 3 jobs/month, 5 formats
- Pro tier: $19/month, unlimited jobs, 10 formats

## Tech Stack

- **Framework:** Next.js 14+ with App Router (TypeScript)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Supabase Auth (email/password)
- **Payments:** Stripe (subscription mode)
- **AI:** Google Gemini API

## Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint
```

## Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── jobs/          # Job creation endpoint
│   │   └── subscription/  # Stripe checkout, portal, webhook, cancel
│   ├── account/           # Account settings page
│   ├── auth/callback/     # OAuth callback handler
│   ├── dashboard/         # Main dashboard
│   ├── job/[id]/          # Job results page
│   ├── login/             # Login page
│   ├── new-job/           # Create new job page
│   └── signup/            # Signup page
├── components/ui/         # shadcn/ui components
└── lib/
    ├── supabase/          # Supabase client utilities
    ├── prompts.ts         # AI prompt templates for each platform
    ├── types.ts           # TypeScript types and constants
    └── utils.ts           # Utility functions
```

### Key Patterns

1. **Server/Client Component Split:** Pages use Server Components for data fetching, with `-client.tsx` files for interactive UI.

2. **Protected Routes:** Middleware (`src/middleware.ts`) handles auth redirects for `/dashboard`, `/new-job`, `/job/*`, `/account`.

3. **Supabase RLS:** Row Level Security ensures users can only access their own data.

4. **Usage Tracking:** Jobs reset monthly. Free users limited to 3 jobs/month.

### Database Tables

- `users` - Extends auth.users with subscription_tier, jobs_this_month, stripe_customer_id
- `jobs` - Stores repurposing jobs with input_text, selected_formats, outputs (JSONB)

## Setup

1. Copy `.env.example` to `.env.local` and fill in:
   - Supabase URL, anon key, service role key
   - Gemini API key
   - Stripe keys (secret, publishable, webhook secret, Pro price ID)

2. Run `supabase-schema.sql` in Supabase SQL Editor

3. Create Stripe product "Pro Plan" at $19/month

4. Configure Stripe webhook endpoint: `/api/subscription/webhook`

## Platform Formats

Free: twitter, linkedin, instagram, email, blog_summary
Pro only: youtube, tiktok, facebook, pinterest, reddit
