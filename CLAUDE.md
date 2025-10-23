# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About Domari

Domari is a simple, powerful **property finance management tool** designed specifically for small landlords and property managers. We eliminate spreadsheet chaos by providing an intuitive platform to **track rental income, expenses, and generate tax-ready reports** — all in one place.

This document establishes coding conventions and best practices to ensure **clarity, consistency, and maintainability** across the entire project.

## Development Commands

Working Directory: All commands must be run from `/client` directory

### Database Operations

- Generate Prisma client: `npm run db:generate`
- Push schema changes to dev DB: `npm run db:push`
- Create new migration: `npm run db:migrate -- --name migration_name`
- Deploy migrations to production: `npx prisma migrate deploy`
- Open database browser: `npm run db:studio`
- Seed database: `npm run db:seed`

### Development Server

- Start development: `npm run dev` (runs on port 3000)
- Build application: `npm run build`
- Start production: `npm run start`
- Lint code: `npm run lint`
- Format code: `npx prettier --write .`
- Add shadcn/ui component: `npx shadcn@latest add [component-name]`

### Database Setup Process

1. Generate schema: `npm run db:generate`
2. Push schema: `npm run db:push`
3. Apply RLS policies: Copy `prisma/migrations/rls-policies.sql` to Supabase SQL Editor and run
4. Seed data: `npm run db:seed`

Important: Always ask before running database migration commands. Never reset the database.

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js v5 with Google OAuth and credentials
- **UI**: TailwindCSS v4 (no config file needed) with Radix UI primitives and shadcn/ui
- **Storage**: Supabase for file uploads and AWS S3
- **Analytics**: Umami Cloud (privacy-focused, client-side tracking only)
- **Payments**: Stripe for subscription management
- **Validation**: Zod schemas
- **Forms**: react-hook-form with Zod resolvers

### Project Structure

- **Frontend**: Located in `/client` directory
- **Database**: Prisma schema at `/client/prisma/schema.prisma`
- **App Router**: Uses Next.js App Router with route groups
- **API Routes**: Located in `/client/src/app/api`
- **Services Layer**: API calls handled in `/client/src/lib/services`
- **Components**: Reusable UI elements in `/client/src/components`
- **Database Layer**: Prisma queries in `/client/src/lib/db`
- **Assets**: Images & media stored in Supabase Storage
- **Feature-based organization**: Group related files by domain (transactions, properties, users)

### Key Route Groups

- `(auth)`: Authentication pages (login, signup, etc.)
- `(nondashboard)`: Public pages (landing page, contact)
- `dashboard`: Protected user dashboard pages

### Database Schema

Core entities:

- **User**: Authentication and user management
- **Property**: Real estate properties with soft delete support
- **Transaction**: Income/expense tracking linked to properties
- **Category**: Transaction categorization system
- **Subscription**: Stripe subscription management with property limits
- **MonthlyMetrics**: Aggregated financial data per property/month
- **UserSettings**: Currency and timezone preferences
- **Account/Session**: NextAuth.js authentication tables

Key relationships:

- Users own multiple Properties (1:N)
- Properties have multiple Transactions (1:N)
- Transactions belong to Categories (N:1)
- Users have one Subscription (1:1)
- Soft delete implemented via `deletedAt` timestamps

### Authentication Flow

- NextAuth.js with JWT strategy
- Supports Google OAuth and credentials authentication
- Custom sign-in pages at `/login`
- Prisma adapter for session management
- User creation events logged via AuthLogger

### API Layer Architecture

#### Services Layer Pattern

All API operations use dedicated service functions:

- `transactionsService.ts`: Transaction CRUD and stats
- `propertiesService.ts`: Property management
- `categoriesService.ts`: Category operations
- `analyticsService.ts`: Analytics operations
- `imageService.ts`: Image operations
- `activityService.ts`: Activities operations

#### Stripe Integration

- Direct SDK usage (no custom wrappers)
- Files in `/lib/stripe/`: client.ts, plans.ts, subscription.ts, webhooks.ts, init.ts
- Webhook handling at `/api/billing/webhooks`
- Subscription management at `/api/billing/checkout` and `/api/billing/portal`

#### Validation Layer

- Zod schemas in `/lib/validations/` for type-safe validation
- Form validation with `@hookform/resolvers/zod`
- API request/response validation

#### Database Layer

- Queries and mutations separated in `/lib/db/[entity]/`
- Database operations abstracted from API routes
- Proper error handling and transaction support

### Frontend Rules & Patterns

#### UI Components

- **UI Library**: Use [shadcn/ui](https://ui.shadcn.com) - add with `npx shadcn@latest add [component]`
- **TailwindCSS v4**: Always prefer utility classes over custom CSS (no config file needed)
- **Theme Colors**: Always use theme colors from Tailwind's built-in design system
- **Modularity**: Build components for reuse across contexts
- **Accessibility**: Ensure ARIA labels and keyboard navigation
- **Code Formatting**: Use Prettier for consistent formatting
- **Comments**: No comments allowed except for line comments explaining calculations (e.g., `// Convert Sunday=0 to Monday=0`). Code should be self-explanatory through clear naming and structure
- **Function Complexity**: Any longer and complex function should be split into smaller, modular and simpler functions to avoid complexity and make it easier to read, with clear structure and self-explanatory naming. Ask yourself if the code is self-explanatory - if not, restructure it to be

#### Form Components

- Built with shadcn/ui Form components
- `react-hook-form` for form state management
- `zod` resolvers for validation
- Consistent error handling patterns

#### Dialog Components

- Create/Edit/Delete dialogs for each entity
- Props-based data passing to avoid redundant API calls
- Proper loading states and error handling

#### Data Flow

- Parent components fetch shared data (categories, properties)
- Data passed as props to child dialogs to eliminate duplicate API calls
- Custom hooks for data fetching and state management
- Prefer server components and Next.js caching where possible

### File Upload System

- Supabase Storage for image uploads
- Supabase AWS S3 integration via `/lib/supabase/s3-client.ts`
- Property image management with CRUD operations

### Subscription & Billing System

- **Payment Provider**: Stripe for subscription management
- **Plans**: STARTER (10 properties), PRO (50 properties), BUSINESS (999 properties)
- **Trial**: 14-day free trial with Business plan features
- **Implementation**: Direct Stripe SDK usage in `/lib/stripe/` (client, plans, subscription, webhooks, init)
- **Webhooks**: Handles subscription lifecycle events (created, updated, deleted)
- **Property Limits**: Enforced based on subscription plan
- **Contact Email**: `support@domari.app` for all inquiries (billing, privacy, general support)

### Analytics System (Umami)

- **Provider**: Umami Cloud for privacy-focused analytics and event tracking
- **Implementation**: Pure client-side tracking (no server-side API calls)
- **Architecture**: Single file approach in `/lib/analytics/`
  - `tracker.ts`: Client-side tracking only (simple, honest implementation)
  - `events.ts`: Event name constants (AUTH_EVENTS, BILLING_EVENTS, etc.)
  - `AnalyticsIdentifier.tsx`: User identification and trial tracking
- **Script Integration**: Umami script tag in `app/layout.tsx` head
- **Environment Variables**:
  - `NEXT_PUBLIC_UMAMI_WEBSITE_ID`: Your Umami website ID
  - `NEXT_PUBLIC_UMAMI_SCRIPT_URL`: Umami Cloud URL (https://cloud.umami.is/script.js)
- **Key Events**:
  - Auth: SIGNUP_STARTED, SIGNUP_COMPLETED, LOGIN_COMPLETED, EMAIL_VERIFIED
  - Billing: TRIAL_STARTED, TRIAL_ENDING_SOON, SUBSCRIPTION_UPGRADED, etc.
  - Properties: PROPERTY_CREATED, PROPERTY_DELETED
  - Transactions: TRANSACTION_CREATED, TRANSACTION_DELETED, TRANSACTION_EXPORTED
- **Note**: Critical events tracked client-side after user actions complete
  - Settings: PREFERENCES_UPDATED, PASSWORD_CHANGED, ACCOUNT_DELETED
- **Best Practices**:
  - Client-side tracking via `window.umami.track()`
  - Server-side tracking via direct Umami API calls
  - Privacy-first (no PII collection, GDPR compliant)
  - Zero dependencies (script tag only)
  - Type-safe event constants prevent errors

### Backend Rules & Patterns

#### API Architecture

- **API Routes**: Must be inside `/client/src/app/api`
- **Services Layer**: All API calls from frontend go through `/client/src/lib/services`
- **Database Queries**: Prisma queries defined in `/client/src/lib/db`
- **Validation**: Use `zod` in API routes to validate inputs before database queries
- **Error Handling**: Always handle errors gracefully - return consistent error shapes

#### Database Rules

- Prisma schema and client in `/client/prisma`
- Always run `npm run db:migrate` for schema changes (ASK FIRST)
- Never reset the database
- Handle drift/errors properly
- Query reuse: Make queries modular and reusable across services

#### Supabase Integration

- Use Supabase DB for structured data
- Use Supabase Storage for image/file uploads
- Always sanitize and validate uploaded files

### General Development Rules

#### Organization

- Group code by domain (transactions/, properties/), not just by type
- Feature-based component structure in `/components/[feature]/`
- Barrel exports for clean imports
- Reusable UI components in `/components/ui/`

#### Type Safety & Code Quality

- Strict TypeScript configuration
- Prisma-generated types for database entities
- Zod schemas for runtime validation + TypeScript inference
- Explicit typing for inputs/outputs
- **No `any` or `unknown` types** - always use proper type definitions
- Remove unused imports, variables, and dead code

#### Naming Conventions

- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Variables & functions: `camelCase`

#### Import Conventions

- **Always use `@/` alias for imports** when the file is inside the `src` directory
- Only use relative imports for files outside `src` (e.g., configuration files)
- Examples:
  - ✅ `import { Button } from "@/components/ui/button"`
  - ✅ `import { ImageServiceError } from "@/lib/services/shared/imageUtils"`
  - ❌ `import { Button } from "../../../components/ui/button"`

#### Error Handling

- Service layer catches and transforms errors
- Consistent error response format
- Client-side error boundaries and toast notifications
- Never trust client input without validation

### Environment & Security

**Environment Files:**

- **Development**: `.env.local` (never commit to git)
- **Production**: Deployment platform environment variables (Vercel dashboard)
- **Git**: Add `.env*` to `.gitignore` (except `.env.example`)

**Required Variables:**

- See `/client/.env.example` for complete list and descriptions
- Copy `.env.example` to `.env.local` and fill in your actual values

**Security:**

- Protect API routes with proper auth (middleware)
- Never expose secrets in client-side code
- Use `NEXT_PUBLIC_` prefix only for safe client-side variables

### Key Files to Understand

- `/client/src/auth.ts`: NextAuth.js configuration with analytics tracking
- `/client/src/auth.config.ts`: Edge-safe NextAuth configuration (used by middleware)
- `/client/prisma/schema.prisma`: Database schema
- `/client/src/lib/db/`: Database operation layers
- `/client/src/lib/services/`: API service layers
- `/client/src/lib/validations/`: Zod validation schemas
- `/client/src/lib/stripe/`: Stripe subscription and billing logic
- `/client/src/lib/analytics/`: Umami analytics implementation
  - `tracker.ts`: Unified client + server event tracking
  - `events.ts`: Event name constants
- `/client/src/lib/analytics/AnalyticsIdentifier.tsx`: User identification and trial tracking
- `/client/prisma/seed.ts`: Database seeding with property categories
- `/client/src/app/(nondashboard)/privacy-policy/page.tsx`: Privacy Policy (GDPR/CCPA compliant)
- `/client/src/app/(nondashboard)/terms-of-service/page.tsx`: Terms of Service with refund policy

### Migration Workflow

1. Modify Prisma schema
2. Run `npm run db:migrate -- --name descriptive_name` (⚠️ ASK FIRST)
3. Update Prisma client: `npm run db:generate`
4. For production: `npx prisma migrate deploy`
5. Apply any RLS policies manually in Supabase if needed

## Deployment

- **Hosting Platform**: Vercel (production deployment)
- **Database**: Supabase (PostgreSQL)
- **File Storage**: Supabase Storage + AWS S3
- **Payment Processing**: Stripe
- **Analytics**: Umami Cloud (privacy-focused, client-side tracking only)
- **Domain**: domari.app
- **Support Email**: support@domari.app

## Compliance & Legal

- **Privacy Policy**: Located at `/privacy-policy` - GDPR and CCPA compliant
- **Terms of Service**: Located at `/terms-of-service` - includes 14-day trial and refund policy
- **Cookie Policy**: Uses session cookies for authentication (strictly necessary) and Umami analytics cookies for privacy-focused insights
- **Refund Policy**: 14-day trial for exploration, no refunds after purchase except for billing errors
- **Data Ownership**: Users retain full ownership of their data
- **Contact**: All legal/privacy/billing inquiries go to `support@domari.app`

## Production Readiness Guidelines

- Code must be maintainable, readable, and production-ready
- Follow Next.js and React best practices for SSR and static generation
- Optimize queries and components for performance
- Ensure error logging and monitoring are in place
- Never over-engineer - favor clarity and readability

  ## Anti-Over-Engineering Principles

  **CRITICAL**: Do not over-engineer any implementation. Follow these strict guidelines:

  **IMPORTANT DISTINCTION**: Industry best practices are NOT over-engineering. Always follow proven industry standards (Next.js Image components, semantic HTML, proper TypeScript patterns, etc.). Over-engineering is when we create unnecessarily complex solutions that don't follow industry standards and provide no real value.

  ### Architecture

  - **Follow industry best practices**: Use Next.js Image components, semantic HTML, proper component patterns, etc.
  - **Keep it flat**: Avoid unnecessary abstraction layers (core/, services/, config/, utils/) when they don't add value
  - **Colocation**: Keep related code together in the same file when it makes sense for small features
  - **Single file solutions**: If a feature can be implemented in 1 file instead of 5, use 1 file
  - **No premature abstraction**: Only abstract when you have 3+ concrete use cases
  - **Question every layer**: Before adding a new layer/directory/pattern, ask "Is this truly necessary?"
  - **Accept necessary complexity**: When domain complexity is inherent (e.g., payment flows, multi-step workflows), structure appropriately with clear separation of concerns

  ### Code Structure

  - **Follow industry standards**: Use Next.js Image components, semantic HTML, proper TypeScript patterns, Zod validation, etc.
  - **Direct over indirect**: Use Stripe SDK directly, don't wrap it in custom classes unless you need to abstract multiple payment providers
  - **Standard over custom**: Prefer built-in types over custom error classes
  - **Minimal files**: Aim for fewer, well-organized files rather than many small ones
  - **Inline simple logic**: Don't extract 3-line functions into separate utilities
  - **No factory patterns**: Unless absolutely required for dependency injection or testing
  - **Modularity when it matters**: For larger features (5+ operations), organize into logical modules for maintainability and testability

  ### Type System

  - **Follow TypeScript best practices**: Use proper typing, avoid `any`, use strict mode
  - **Use library types**: Don't recreate types that already exist (e.g., Stripe types)
  - **Extend, don't replace**: If you need custom types, extend existing ones with `interface` or type intersection
  - **No custom error hierarchies**: Use standard Error class with descriptive messages
  - **Type inference**: Let TypeScript infer types when obvious; don't over-specify
  - **Domain modeling**: Use TypeScript's type system to model complex domain logic when it prevents runtime errors

  ### Logic

  - **Follow React/Next.js patterns**: Use proper hooks, server components, proper data fetching patterns
  - **Straightforward flow**: Avoid complex state machines unless truly necessary
  - **Direct database access**: Don't abstract Prisma queries behind repositories unless you have multiple data sources
  - **Simple validation**: Zod schemas are enough; don't add validation layers
  - **No excessive middleware**: Only add middleware when you need to reuse logic across 5+ routes
  - **Complex domains require structure**: When business logic is inherently complex, organize it clearly rather than cramming everything into one file

  ### Practical Guidelines

  - **File count**: If a feature needs >5 files, reconsider the architecture (but accept it if domain complexity requires it)
  - **Line count**: 200-300 lines in a single file is OK if it's cohesive; split when a file does multiple unrelated things
  - **Dependencies**: Before adding a package, check if the standard library can do it
  - **Patterns**: Only use design patterns when the problem clearly demands them
  - **Refactoring**: Refactor when it significantly improves clarity, maintainability, or testability—not just for aesthetics

  ### Red Flags (Signs of Over-Engineering)

  - ❌ Creating interfaces for single implementations
  - ❌ Building custom error hierarchies with multiple error classes
  - ❌ Adding "Manager", "Handler", "Service", "Provider" suffixes everywhere
  - ❌ Wrapping third-party SDKs in custom classes without clear benefit
  - ❌ Creating config objects for values used in one place
  - ❌ Building plugin systems that have 1 plugin
  - ❌ Implementing event buses for simple function calls
  - ❌ Using dependency injection containers for simple imports
  - ❌ Avoiding industry best practices because they seem "too complex"
  - ❌ Reinventing solutions that already exist and are proven

  ### Examples of Good Simplicity

  - ✅ Stripe integration: 4-5 files, direct SDK usage, ~500 lines total
  - ✅ Umami analytics: Script tag + direct API calls, Edge/Node.js separation via auth.config.ts vs auth.ts
  - ✅ API routes: Directly call Prisma, validate with Zod, return JSON
  - ✅ Components: Colocate state, handlers, and JSX in same file
  - ✅ Types: Import from `@prisma/client`, `stripe`, extend only when needed
  - ✅ Blog images: Next.js Image component with semantic HTML (industry best practice)
  - ✅ MDX setup: Custom components for consistency and optimization

  ### When Complexity Is Justified

  - ✅ Multi-step workflows with state transitions (e.g., onboarding, checkout flows)
  - ✅ Domain logic that requires clear separation (e.g., pricing calculations, tax rules)
  - ✅ Features that need comprehensive testing (organize for testability)
  - ✅ Abstractions that prevent widespread breaking changes (e.g., wrapping external APIs you don't control)

  **Golden Rule**: Always follow industry best practices - they provide real value and are not over-engineering. Prefer simplicity, but never sacrifice correctness, scalability, clarity, or industry standards when complexity is truly required by the problem domain. Complexity is a liability when avoidable, but following proven patterns is always justified.

## Quality Checklist

When working on this codebase:

- ✅ Use shadcn/ui components instead of building custom ones (Unless strictly necessary to accomplish the requirements)
- ✅ Validate all inputs with Zod schemas
- ✅ Use react-hook-form for all forms
- ✅ Pass data as props to avoid redundant API calls
- ✅ Follow feature-based organization
- ✅ Use TypeScript strictly - no `any` types
- ✅ Handle errors gracefully with consistent patterns
- ✅ Ask before running database migrations
- ✅ Use TailwindCSS utilities (no custom CSS)
- ✅ Keep components modular and reusable

---

**Remember**: Domari's success depends on a clean, consistent, and reliable codebase. When in doubt: **Keep it simple, modular, validated, and consistent with the theme.**
