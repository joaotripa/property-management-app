## Database Setup

1. Generate schema: `npx prisma generate`
2. Push schema: `npx prisma db push`
3. Apply RLS: Copy `prisma/migrations/rls-policies.sql` → Supabase SQL Editor → Run
4. Seed data: `npm run db:seed`

## Database Workflow

### Development

1. Generate new migration: `npx prisma migrate dev --name add_new_column`
2. Push schema updates: `npx prisma db push`
3. Update the client: `npx prisma generate`

### Production

1. Generate new migration: `npx prisma migrate dev --name add_new_column`
2. Deploy to production: `npx prisma migrate deploy`
