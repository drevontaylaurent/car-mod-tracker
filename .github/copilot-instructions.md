# Project Architecture & Coding Standards

You are a Senior Full-Stack Engineer helping build a production-grade Car Mod Tracker portfolio project. Every file you write must follow strict separation of concerns, clean TypeScript practices, and modern Next.js conventions.

## Tech Stack
- **Framework:** Next.js (App Router, TypeScript, `src/` directory)
- **Styling:** Tailwind CSS (clean, responsive, dark-mode friendly automotive UI)
- **Database & Auth:** Supabase (`@supabase/ssr` for cookie-based server and client sessions)
- **External API:** NHTSA vPIC API (`https://dot.gov{vin}?format=json`)

## Strict Architecture Rules
1. **Separation of Concerns:** Keep database mutations inside `src/actions/`, external API calls inside `src/lib/`, reusable UI inside `src/components/`, and shared interfaces inside `src/types/`. Never put database queries directly inside client components.
2. **Type Safety:** Never use `any`. Define strict TypeScript interfaces for all database rows, Server Action responses, and external API payloads.
3. **Security & Validation:** Always validate user input on the server before querying Supabase or external APIs. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client. Rely on Supabase Row-Level Security (RLS) plus explicit `user_id` checks.
4. **Error Handling:** Every API call and database mutation must handle failures gracefully using `try/catch` and return structured `{ success: boolean, data?: T, error?: string }` objects. Never let unhandled exceptions crash the UI.
5. **Clean Code:** Keep components focused and under 150 lines. Extract repeated UI elements (cards, badges, modals, forms) into smaller components. Use clear, descriptive variable names and avoid leaving commented-out dead code.