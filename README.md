# 🎧 Resolv — Enterprise Helpdesk by Nexora

> A full-featured, production-ready helpdesk ticketing platform built with **Next.js 16**, **Prisma**, and **Tailwind CSS**.  
> Live at: [support.nexoratech.co](https://support.nexoratech.co)

---

## ✨ Features

### 🏠 Public / Customer
| Feature | Description |
|---|---|
| **Landing Page** | Hero, feature highlights, stats, and CTA sections |
| **Help Center** | Browse FAQs and knowledge base by category |
| **Ticket Submission Wizard** | 3-step flow: category → details → priority |
| **Ticket List** | View all submitted tickets with status badges |
| **Ticket Detail** | Chat-style conversation thread with the support team |

### 🛡️ Agent Portal
| Feature | Description |
|---|---|
| **Agent Dashboard** | Stats grid with ticket counts, SLA indicators, and filters |
| **Ticket Management** | Filterable ticket table with priority and status controls |
| **Ticket Detail** | Split-pane view: public replies + internal notes + full audit log |
| **Customer Management** | Browse and manage customer accounts |
| **Reports** | Performance and ticket analytics |
| **Settings** | Agent account and notification preferences |

### 🔐 Authentication
| Feature | Description |
|---|---|
| **Login / Register** | Session-based authentication with hashed passwords |
| **Forgot Password** | Self-service password reset flow |
| **Reset Password** | Secure token-based password recovery |
| **Role-based Access** | `CUSTOMER`, `AGENT`, and `ADMIN` roles |

### 👑 Admin
| Feature | Description |
|---|---|
| **Admin Dashboard** | Full visibility across all users and tickets |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) — App Router, TypeScript, Server Components |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) — System font stack, no external fonts |
| **Database** | [Prisma 5](https://prisma.io) + SQLite (swappable to PostgreSQL/MySQL) |
| **Auth** | Custom session-based auth with `bcrypt` password hashing |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Icons** | [lucide-react](https://lucide.dev) |
| **Validation** | [Zod](https://zod.dev) |
| **Deployment** | Docker + [Traefik](https://traefik.io) reverse proxy with auto-HTTPS |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js ≥ 20
- npm

### 1. Install dependencies

```bash
npm install
```

### 2. Set up the database

```bash
# Push schema to SQLite and seed with sample data
npm run setup
```

> This runs `prisma db push` + `prisma/seed.js` to create the database and populate it with sample users and tickets.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🗺️ Routes

### Public
| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/register` | Create account |
| `/forgot-password` | Request password reset |
| `/reset-password` | Confirm password reset |

### Customer
| Route | Description |
|---|---|
| `/help` | Help center & FAQ |
| `/help/tickets` | Your ticket list |
| `/help/tickets/new` | Submit a new ticket |
| `/help/tickets/[id]` | Ticket conversation detail |

### Agent Portal
| Route | Description |
|---|---|
| `/agent` | Agent dashboard |
| `/agent/tickets/[id]` | Ticket detail with reply console |
| `/agent/customers` | Customer list |
| `/agent/reports` | Analytics & reports |
| `/agent/settings` | Agent settings |

### Admin
| Route | Description |
|---|---|
| `/admin` | Admin dashboard |

---

## 🗄️ Database Schema

The app uses **Prisma 5** with SQLite (file-based). Key models:

- **`User`** — email, hashed password, role (`CUSTOMER` / `AGENT` / `ADMIN`), avatar
- **`Ticket`** — title, description, status, priority, department, SLA data
- **`TicketComment`** — public replies and internal agent notes
- **`AuditLog`** — immutable log of every ticket action (who changed what, when)
- **`Session`** — server-side sessions with token hashes and expiry
- **`PasswordResetToken`** — secure, single-use password reset tokens

```bash
# Regenerate Prisma client after schema changes
npx prisma generate

# Apply schema changes to the database
npx prisma db push

# Re-seed sample data
npm run db:seed
```

---

## 🐳 Docker Deployment

The app ships with a multi-stage `Dockerfile` and a `docker-compose.yml` pre-configured for **Traefik** with automatic HTTPS.

```bash
# Build and start
docker compose up -d
```

**Environment variables (set in `docker-compose.yml` or `.env`):**

| Variable | Example | Description |
|---|---|---|
| `DATABASE_URL` | `file:/data/prod.db` | Path to SQLite database file |
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Server port |

The entrypoint script (`docker-entrypoint.sh`) automatically runs database migrations and seeding on container startup.

---

## 📁 Project Structure

```
.
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── login/              # Authentication pages
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   ├── help/               # Customer portal
│   ├── agent/              # Agent portal
│   ├── admin/              # Admin dashboard
│   └── api/                # API route handlers
├── components/             # Shared UI components
├── lib/                    # Utilities and server-side helpers
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Sample data seeder
├── public/                 # Static assets
├── Dockerfile              # Multi-stage Docker build
└── docker-compose.yml      # Production deployment config
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Lint the codebase |
| `npm run db:push` | Apply Prisma schema to database |
| `npm run db:seed` | Seed the database with sample data |
| `npm run setup` | `db:push` + `db:seed` (first-time setup) |

---

<div align="center">
  <sub>© 2025 Nexora Inc. — Built with ❤️ using Next.js & Prisma</sub>
</div>
