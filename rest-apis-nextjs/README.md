### Create Next Project

npx create-next-app@latest frontend

settings

Tailwind: YES
App Router: YES
TypeScript: YES
ESLint: NO
Src Directory: NO
Import Alias: NO


Adding paranthesis infront of folder excludes from API routes

npm install mongoose

if using TypeScript
the  create route.ts file

if using TypeScript + JSX
the  create page.tsx file


## For Dynamic Folder

create folder name with []


app/
├─ layout.tsx                 # Root layout (Navbar, Footer)
├─ page.tsx                   # Home page
├─ globals.css                # Tailwind styles
│
├─ blogs/
│  ├─ page.tsx                # /blogs (list)
│  ├─ [slug]/
│  │  └─ page.tsx             # /blogs/:slug
│
├─ auth/
│  ├─ login/
│  │  └─ page.tsx
│  └─ register/
│     └─ page.tsx
│
├─ dashboard/
│  └─ page.tsx
│
├─ api/                       # OPTIONAL (Next.js route handlers)
│  └─ health/
│     └─ route.ts
│
├─ not-found.tsx              # Global 404
├─ loading.tsx                # Global loading
├─ error.tsx                  # Global error boundary



📦 Frontend-Only Supporting Folders (Industry Standard)
components/
├─ ui/                        # Reusable UI components
│  ├─ Button.tsx
│  └─ Input.tsx
├─ layout/
│  ├─ Navbar.tsx
│  └─ Footer.tsx

lib/
├─ api.ts                     # FastAPI calls (Axios / Fetch)
├─ auth.ts                    # Token helpers
├─ config.ts                  # Backend URLs