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

```

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

```

## Current Folder Structure

```
rest-apis-nextjs/
├── app/
│   ├── (auth)/             # Authentication Group (Login/Signup)
│   │   ├── login/
│   │   └── signup/
│   ├── api/                # API Routes
│   │   └── health/         # Health Check Endpoint
│   ├── blogs/              # Application Routes
│   │   ├── [slug]/         # Blog Detail Page
│   │   └── page.tsx        # Blog List Page
│   ├── components/         # Shared Components
│   │   ├── ui/             # UI Library
│   │   ├── Footer.tsx
│   │   └── Navbar.tsx
│   ├── dashboard/          # Dashboard (Protected)
│   ├── lib/                # Utilities
│   │   ├── api.ts          # API Client
│   │   └── types.ts        # TypeScript Interfaces
│   ├── globals.css         # Global Styles
│   ├── layout.tsx          # Root Layout (Navbar + Footer)
│   └── page.tsx            # Landing Page
├── public/                 # Static Assets
├── next.config.ts          # Next.js Configuration
├── package.json            # Dependencies
├── postcss.config.mjs      # Tailwind/PostCSS Config
├── README.md               # Documentation
└── tsconfig.json           # TypeScript Configuration
```


Command to show folder structure

```
tree /F /A
```