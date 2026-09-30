# Skillo

A social network where people exchange skills and grow together.

Skillo helps someone who knows Python and wants to learn photography find someone who knows photography and wants to learn Python. It gives both people a clear proposal, an editable learning plan, a shared workspace, session confirmation, progress, reputation, and a Skill Credit ledger.

## What was in the repository

The starting repository contained only a one-line README. There was no application, package manifest, database schema, API, authentication, or reusable UI to preserve. This implementation therefore establishes the first working product architecture rather than replacing existing code.

## Product included in this MVP

- Public landing page that explains direct exchanges and Skill Chains
- Public skill directory, Privacy Policy, Terms & Conditions, logo, favicon, and web manifest
- Email and password sign-up and sign-in with bcrypt password hashing
- HTTP-only signed session cookie
- Fast two-skill onboarding
- Social home feed with skill-focused posts and meaningful reactions
- Explore interface for people, skills, exchange opportunities, and private communities
- Follow people and skills
- Editable exchange proposals
- Accept and low-pressure decline flows
- Deterministic AI boundary that generates editable proposals and learning plans without sending data to a third party
- Two-person plan approval before activation
- Exchange workspace with plans, tasks, sessions, progress, and text conversation
- Dual session completion, teacher marks complete and learner confirms
- Transaction-ledger Skill Credits
- Completion celebration and learner progress updates
- Exchange completion and multi-dimensional ratings
- Direct messages, notifications, and private communities
- Skill Wallet and reputation profile
- Responsive desktop, tablet, and mobile navigation
- Authorization, validation, same-origin mutation checks, and practical in-memory rate limits

## Technology

- Next.js 16 App Router
- React 19 and TypeScript
- Tailwind CSS
- Prisma 7 generated client
- libSQL driver adapter with a local SQLite file for the zero-configuration demo
- Zod validation
- bcrypt password hashing
- JOSE signed sessions
- Lucide SVG icons
- Vitest

## Run locally

Requirements:

- Node.js 22.12 or newer
- npm 10 or newer

```bash
npm install
cp .env.example .env
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Demo account:

```text
Email: demo@skillo.app
Password: demo1234
```

The sign-in page also has an **Explore the demo workspace** action.

## Useful commands

```bash
npm run dev          # development server on 0.0.0.0
npm run build        # production build
npm run start        # production server
npm run lint         # ESLint
npm run typecheck    # TypeScript
npm run format       # Prettier check
npm test             # Vitest
npm run db:init      # create missing local tables
npm run db:seed      # reset and seed realistic demo data
npm run db:reset     # same deterministic reset
npm run db:generate  # regenerate Prisma client after schema changes
```

The generated Prisma client is committed so a normal build does not need to download a schema engine.

## Data architecture

`prisma/schema.prisma` defines a normalized model for:

- users, profiles, skills, subskills, and user skill confidence
- learning goals, posts, reactions, and follows
- exchange proposals, plans, plan items, sessions, tasks, and progress
- append-only Skill Credit transactions
- ratings and endorsements
- communities and Skill Chains
- messages, notifications, and reports

`prisma/schema.sql` is the executable local schema. `prisma/seed.ts` initializes it, clears records in foreign-key-safe order, and adds development-only data.

### PostgreSQL production migration

No managed PostgreSQL connection was supplied with the repository. To keep the product immediately runnable and verifiable, local development uses the Prisma libSQL adapter and an ignored `prisma/dev.db` file. The data model is intentionally limited to relational types that map directly to PostgreSQL.

Before production deployment:

1. Create a managed PostgreSQL database.
2. Change the Prisma datasource provider from `sqlite` to `postgresql`.
3. Install `@prisma/adapter-pg` and `pg`.
4. Replace `PrismaLibSql` in `lib/db.ts` with `PrismaPg`.
5. Set `DATABASE_URL` to the managed PostgreSQL connection string.
6. Generate and review an initial migration from `prisma/schema.prisma`.
7. Run the migration in staging before production.
8. Configure backups, connection limits, monitoring, and retention.

Do not deploy the local SQLite file as the production database.

## AI architecture

All AI-facing behavior is isolated in `lib/ai/index.ts`:

- `generateExchangeProposal()`
- `generateLearningPlan()`
- `recommendMatches()`
- `analyzeSkill()`
- `suggestNextStep()`
- `findSkillChains()`

The MVP uses deterministic, editable suggestions. This keeps the full flow working without an API key and avoids pretending an external model succeeded. A provider can be added inside this server-only boundary with `AI_API_KEY`. Keys must never be exposed to browser code.

## API design

The application uses Next.js Route Handlers under `app/api` for:

- authentication and onboarding
- profile and Skill Wallet updates
- posts, reactions, follows, and communities
- proposals, exchange decisions, plan approval, exchange completion, and ratings
- session dual-confirmation and task progress
- messages and notifications

Every mutation validates input and checks the signed-in user's ownership or participation on the server.

## Security notes

Implemented:

- bcrypt password hashes
- signed HTTP-only, same-site session cookies
- server-side authorization on protected records
- Zod request validation
- output escaping through React
- basic text cleaning and strict length limits
- same-origin checks on cookie-authenticated mutations
- rate limits on high-risk and high-volume endpoints
- no arbitrary uploads, external-link UI, voice, or video
- unique ledger transaction per confirmed session
- private exchange decline reason

`DEMO_MODE` is for development and product review only. Set it to `false`, do not run the demo seed, and use a unique production `AUTH_SECRET` before launch.

Before a public launch, use a shared rate-limit store, add email verification and password reset, configure security headers at the deployment edge, run an independent security review, and add moderator tooling.

## Verification performed

The implementation has been checked with:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --audit-level=moderate
```

Manual HTTP integration checks covered:

- public pages and legal links
- sign-up, onboarding, sign-in, demo sign-in, and sign-out
- authenticated page rendering
- post creation and reaction
- proposal acceptance
- both learning-plan approvals
- active workspace creation
- session confirmation and duplicate-credit prevention
- profile ownership rejection
- cross-site mutation rejection

## Production launch items that require owner infrastructure

The code includes the favicon, legal pages, and production build configuration. These items cannot be truthfully completed from the repository alone:

- purchase or choose the final custom domain
- connect its DNS to the selected deployment provider
- configure production PostgreSQL and secrets
- verify email addresses used for privacy and support
- run staging and production browser checks on the deployed origin

A temporary preview URL is useful for review but is not a final custom-domain launch.
