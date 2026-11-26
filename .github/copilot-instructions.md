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





# Phase 2: Product Design & Production Polish

The Car Mod Tracker core MVP is complete, working, tested, deployed, and connected to production services.

Phase 2 focuses on transforming the functional MVP into a polished, futuristic automotive product and portfolio-quality software project.

## Primary Rule

Preserve all working Phase 1 functionality.

Do not rewrite, replace, or unnecessarily refactor working:
- Authentication
- Sign up / Sign in / Sign out
- Supabase integration
- PostgreSQL database structure
- Row Level Security
- Server Actions
- Vehicle CRUD
- VIN decoding
- NHTSA integration
- Duplicate VIN prevention
- Vehicle modification tracking
- Cost calculations
- Protected routing
- Git/Vercel deployment behavior

Visual missions must not silently change business logic.

## Product Vision

Car Mod Tracker should feel like a futuristic automotive command center.

The experience should be:
- Visual
- Futuristic
- Automotive
- Technical
- Easy to understand
- Fast to operate
- Mobile-first
- Data-driven
- Purposeful
- Forward-looking

The vehicle itself should be the visual hero.

The application should not feel like a generic CRUD application or ordinary SaaS dashboard.

## Visual Direction

Primary palette:
- Near-black / black
- White
- Electric / acid green

Semantic colors:
- Green = Installed, Completed, Healthy, Successful
- Yellow = Ordered, Pending, Attention
- Red = Error, Critical, Serious vehicle-health issue
- Neutral gray = Secondary information
- White = Primary information and high-contrast typography

Electric green should be used intentionally for emphasis, interaction, status, progress, and important system information.

Do not flood the interface with green.

## Visual Inspiration

Take inspiration from:
- Futuristic automotive interfaces
- Performance vehicle dashboards
- Automotive configurators
- Vehicle telemetry systems
- Technical HUD interfaces
- Cyber-industrial interfaces
- Premium vehicle software
- High-performance instrumentation

References are inspiration only.

Never directly copy another product, brand, interface, composition, or visual asset.

## Interface Principles

Prefer:
- Strong visual hierarchy
- Large vehicle imagery
- Technical grid systems
- Thin borders and dividers
- Restrained surfaces
- High-contrast typography
- Large numerical displays
- Compact metadata
- Clear system/status indicators
- Purposeful whitespace
- Technical section labels
- Responsive layouts
- Clear information density

Avoid:
- Generic SaaS dashboards
- Excessive rounded cards
- Excessive gradients
- Excessive neon glow
- Random glassmorphism
- Decorative animations without purpose
- Clutter
- Unnecessary shadows
- Repeated visual containers
- Visual effects that reduce readability

Function should remain more important than decoration.

## Vehicle-First Design

The vehicle should become the center of the application experience.

Future Garage and Build experiences should prioritize:

1. Vehicle image
2. Vehicle identity
3. Build status
4. Modification status
5. Investment totals
6. Build progress
7. Vehicle specifications
8. Fast actions

Vehicle information should feel like automotive telemetry rather than database fields.

## Modification Status System

Use a consistent status language throughout the application.

Installed:
- Green
- Completed
- Active on vehicle
- Money already invested

Ordered:
- Yellow
- Purchased
- Pending arrival
- Pending installation

Wishlist:
- Neutral white / gray
- Planned modification
- Potential future spending

Do not change existing modification data behavior while implementing visual status presentation.

## Future Vehicle Health System

The design system must be extensible for future OBD / vehicle-health functionality.

Reserve semantic meaning:

Green:
- Healthy
- Resolved
- Cleared

Yellow:
- Pending
- Attention needed
- Moderate issue

Red:
- Active issue
- Serious fault
- Critical attention

Do NOT implement OBD functionality unless a future mission explicitly requests it.

## Typography Hierarchy

Vehicle/model names:
- Large
- Confident
- High visual priority

Financial/statistical totals:
- Large numerical treatment
- Easy to scan

Section labels:
- Compact
- Technical
- Clearly separated

VIN/specification data:
- Readable
- Secondary hierarchy
- Never visually dominant

Supporting metadata:
- Restrained
- Lower contrast while remaining accessible

## Mobile-First Experience

Mobile is a first-class product experience.

Critical mobile workflow:

Garage
→ Vehicle
→ Modifications

Do not design desktop first and merely shrink it.

For mobile:
- Use touch-friendly controls
- Maintain readable type
- Avoid horizontal overflow
- Keep primary actions obvious
- Prioritize vehicle identity and important data
- Reduce unnecessary secondary information
- Make forms comfortable to complete
- Preserve strong visual hierarchy

Target usability down to approximately 320px wide screens.

## Accessibility

Visual polish must not reduce accessibility.

Maintain:
- Semantic HTML
- Proper labels
- Keyboard navigation
- Visible focus states
- Sufficient color contrast
- Clear error messages
- Touch-friendly controls
- Accessible status communication

Never communicate important status using color alone.

## Component Architecture

Continue respecting existing separation of concerns.

src/actions/
- Server Actions only

src/lib/
- External services and utilities

src/components/
- Reusable UI components

src/types/
- Shared TypeScript types

src/app/
- Routing and page composition

Prefer reusable design components and patterns rather than repeating large Tailwind class strings.

Keep components small and focused according to existing project rules.

## Engineering Guardrails

Never weaken:
- Authentication
- Authorization
- Supabase RLS
- Server-side validation
- Database constraints
- User ownership checks

Never move security decisions exclusively to the browser.

Do not introduce dependencies unless clearly necessary.

Do not perform broad architectural refactors during visual missions.

## Change Strategy

Before modifying an existing feature:

1. Inspect the current implementation.
2. Understand the existing behavior.
3. Identify reusable components.
4. Explain the intended change.
5. Make the smallest safe change.
6. Preserve existing behavior unless the mission explicitly changes it.

Do not rewrite working files solely for stylistic preference.

## Phase 2 Mission Boundaries

Mission 5:
Design System + Application Shell

Mission 6:
Visual Garage + Vehicle Imagery

Mission 7:
Hero Vehicle Build Experience

Mission 8:
Mobile UX + Accessibility

Mission 9:
Automated Testing + Production Hardening

Mission 10:
GitHub README + Portfolio + Resume Packaging

Mission 11:
Future Vehicle Health / OBD System

Do not begin the next mission automatically.

## Verification Requirements

After every implementation mission run:

npm run lint

npx tsc --noEmit

npm run build

Fix errors introduced by the current mission.

Then manually test the affected workflow.

## Completion Report

At the end of every mission, STOP and summarize:

1. Files created
2. Files modified
3. Visual behavior changed
4. Functional behavior changed
5. Existing behavior intentionally preserved
6. Manual tests required
7. Any production/deployment considerations
8. Recommended Git commit message

Do not automatically commit, push, deploy, or begin another mission unless explicitly requested.

## Product Philosophy

Car Mod Tracker exists to provide a more visual, futuristic, easy-to-use, automatic, and forward-thinking way to manage a vehicle build.

Instead of treating vehicle modifications like rows in a spreadsheet, the vehicle itself should become the center of the experience.

The build, modifications, investment, progress, specifications, and future vehicle-health information should feel organized around the vehicle.

The finished product should demonstrate both strong software engineering and intentional product/design thinking.



# Current Phase: Mockup-Driven Vehicle Build Redesign

The current My Garage experience is approved and frozen.

Do not redesign, restructure, or visually recompose /garage unless a future mission explicitly requests it.

The current focus is the individual Vehicle Build / Open Build experience.

User-created mockups are the primary UX specification for this phase.

When implementing a supplied mockup:

1. Inspect the current implementation first.
2. Preserve all working functionality.
3. Reuse existing components and real application data.
4. Follow the mockup's information hierarchy.
5. Remove unnecessary repeated information.
6. Do not invent additional dashboard sections.
7. Do not fabricate data simply to fill the mockup.
8. Make the smallest safe changes necessary.

## Open Build Direction

Open Build represents ONE selected vehicle.

The experience should communicate:

THIS IS MY CAR.
THIS IS MY BUILD.

The visual hierarchy should prioritize:

1. Large vehicle hero visual
2. Vehicle nickname and identity
3. Year / Make / Model / Trim
4. Tracked build progress
5. Installed investment
6. Planned investment
7. Installed / Ordered / Wishlist status
8. Modification categories
9. PROFILE / BUILD / PARTS organization
10. Dedicated electric-green + ADD MOD action
11. Edit Vehicle as a secondary action
12. Back to Garage

The vehicle must remain the visual hero.

Supporting information should feel like automotive telemetry rather than a traditional SaaS dashboard.

Avoid repeating the same statistics in multiple nearby sections.

## Vehicle Build Organization

Preserve the primary organization:

PROFILE
BUILD
PARTS

Only the selected section should receive primary emphasis.

Do not return to one extremely long page containing every major section at once.

Keep + ADD MOD separate from the navigation tabs.

+ ADD MOD remains an electric-green primary action.

## Vehicle Media

Vehicle visuals use progressive enhancement.

Priority:

1. User-uploaded photo of the actual vehicle
2. Generic or AI-generated representative vehicle visual
3. Existing futuristic fallback
4. Future optional GLB / glTF interactive 3D vehicle

The application should still provide a strong vehicle visual when the owner has not uploaded a personal photo.

Representative vehicle imagery is illustrative.

Never claim or imply that a generic or AI-generated vehicle visual is a photograph of the user's actual vehicle.

Where appropriate, identify it as:

Representative Visual
Vehicle Representation
Illustrative Vehicle

A user-uploaded vehicle photo always takes priority over a representative visual.

Users must remain able to:

- Upload My Car
- Replace My Photo
- Remove My Photo
- Return to the 
