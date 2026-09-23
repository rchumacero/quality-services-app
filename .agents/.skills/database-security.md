# Skill: Supabase & PostgreSQL Security

Apply these rules strictly when interacting with Supabase, writing database queries, or designing schemas:

1. **Row Level Security (RLS):**
   - RLS **must** be enabled on every table created or modified in Supabase. Explicit policies must be defined for read/write operations based on authenticated roles.
2. **Client Usage Boundaries:**
   - In frontend environments (Next.js), use public Supabase clients respecting user sessions.
   - In backend environments (NestJS), use secure service role keys or authenticated sessions strictly when required by business rules, avoiding unauthorized exposure of administrative tokens.
3. **Query Safety:**
   - Prevent SQL injection by using Supabase's query builder methods properly. Ensure queries are typed using generated database types where applicable.