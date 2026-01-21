# Next.js Project Setup & Structure

## 1. Create Project
To initialize the project, run the following command:

```bash
npx create-next-app@latest frontend
```

### Configuration Settings
During setup, select the following options:
- **Tailwind CSS**: `Yes`
- **App Router**: `Yes`
- **TypeScript**: `Yes`
- **ESLint**: `No`
- **Src Directory**: `No`
- **Import Alias**: `No`

## 2. Dependencies
Install additional required packages (e.g., Mongoose for MongoDB if needed):

```bash
npm install mongoose
```

## 3. Route Handlers vs Pages
- **API Routes (TypeScript)**: Create a `route.ts` file inside the standard API folder structure.
- **UI Pages (TypeScript + JSX)**: Create a `page.tsx` file for frontend views.

## 4. Routing Concepts

### Route Groups
Adding parentheses around a folder name excludes it from the URL path.
- Example: `(auth)` -> the URL will skip `auth` (e.g., `/login` instead of `/auth/login`).

### Dynamic Routes
Use square brackets `[]` for dynamic path segments.
- Example: `blogs/[slug]/page.tsx` handles URLs like `/blogs/my-first-post`.

### Project Structure Overview

```bash
app/
├── layout.tsx                 # Root layout (Navbar, Footer)
├── page.tsx                   # Home page
├── globals.css                # Tailwind styles
│
├── blogs/
│   ├── page.tsx               # /blogs (Listing)
│   └── [slug]/
│       └── page.tsx           # /blogs/:slug (Detail)
│
├── (auth)/                    # Route Group (Hidden from URL)
│   ├── login/
│   │   └── page.tsx           # /login
│   └── signup/
│       └── page.tsx           # /signup
│
├── dashboard/
│   └── page.tsx               # /dashboard (Protected)
│
├── api/                       # API Route Handlers
│   └── health/
│       └── route.ts           # /api/health
│
├── not-found.tsx              # Global 404 Page
├── loading.tsx                # Global Loading State
└── error.tsx                  # Global Error Boundary
```

### Frontend Architecture
Industry standard organization for supporting files:

#### Components
`components/`
- **ui/**: Reusable, atomic UI components (e.g., `Button.tsx`, `Input.tsx`).
- **layout/**: Structural components (e.g., `Navbar.tsx`, `Footer.tsx`).

#### Libraries
`lib/`
- **api.ts**: API client (Fetch/Axios) for backend communication.
- **auth.ts**: Authentication helpers and token management.
- **config.ts**: Configuration constants (e.g., Backend URLs).


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