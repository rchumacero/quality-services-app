# Skill: Next.js, TypeScript & Tailwind Architecture

Apply these rules strictly when developing or modifying frontend code (Next.js App Router, TypeScript, Tailwind CSS):

1. **Server vs Client Components:**
   - Default to **Server Components** for data fetching and static rendering.
   - Use `'use client'` strictly at the top of the file only when interactivity, browser hooks (`useState`, `useEffect`), or event listeners are required.
2. **Strict TypeScript:**
   - **Never** use `any`. Define explicit interfaces or types for all component props, state, and API responses.
   - Enable strict null checks and handle optional types gracefully.
3. **Tailwind CSS Best Practices:**
   - Keep classes clean and organized. Group related utilities logically (layout, spacing, typography, colors).
   - Follow mobile-first responsive design principles (e.g., `sm:`, `md:`, `lg:` prefixes).
   - Reuse common style patterns or components to avoid duplication.