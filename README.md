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
| **Ticket Submission Wizard** | 3-step flow: category → details + attachments → priority |
| **File Attachments** | Attach images, PDFs, Office files, ZIP (up to 10 MB each, 5 files max) |
| **Ticket List** | View all submitted tickets with status badges |
| **Ticket Detail** | Chat-style conversation thread with the support team |
| **Email Notifications** | Confirmation on submission, updates on replies and status changes |
| **Welcome Guide** | Friendly interactive tour for first-time users (skippable) |

### 🛡️ Agent Portal
| Feature | Description |
|---|---|
| **Agent Dashboard** | Stats grid with ticket counts, SLA indicators, and filters |
| **Ticket Management** | Filterable ticket table with priority and status controls |
| **Ticket Detail** | Split-pane view: public replies + internal notes + full audit log |
| **File Attachments** | Attach files to replies and internal notes |
| **Email Notifications** | Auto-email to customers on replies, status changes, and resolution |
| **Customer Management** | Browse and manage customer accounts |
| **Reports** | Performance and ticket analytics |
| **Settings** | Agent account and notification preferences |
| **Welcome Guide** | Agent-specific onboarding tour (skippable) |

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
| **Email** | [Nodemailer 7](https://nodemailer.com) — SMTP-based transactional email |
| **File Upload** | Native `File` API + filesystem storage via custom upload handler |
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

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your settings. **Minimum required:**

```env
DATABASE_URL=file:./prisma/dev.db
```

To enable email notifications, also set the `SMTP_*` variables (see below).

### 3. Set up the database

```bash
# Push schema to SQLite and seed with sample data
npm run setup
```

> This runs `prisma db push` + `prisma/seed.js` to create the database and populate it with sample users and tickets.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📧 Email Notifications

Resolv sends automated email notifications for:

| Event | Recipients |
|---|---|
| **Ticket Created** | Customer (confirmation) |
| **Agent Replied** | Customer |
| **Customer Replied** | Assigned agent |
| **Status Changed** | Customer + assigned agent |
| **Ticket Assigned** | New assignee |

To enable emails, configure SMTP in your `.env`:

```env
SMTP_HOST=smtp.gmail.com       # or your SMTP provider
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your_app_password
SMTP_FROM=Resolv Support <no-reply@yourdomain.com>
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

> **Gmail tip:** Use an [App Password](https://myaccount.google.com/apppasswords) if you have 2FA enabled.  
> **Production:** If SMTP is not configured, emails are silently skipped and a log message is printed.

---

## 📎 File Attachments

Users can attach files when:
- **Submitting a new ticket** (step 2 of the wizard)
- **Replying to a ticket** (customer & agent)
- **Adding internal agent notes**

**Allowed types:** Images (JPG, PNG, GIF, WebP, SVG), PDF, Word, Excel, PowerPoint, TXT, CSV, ZIP  
**Limits:** 10 MB per file, max 5 files per message

Files are stored in the `./uploads/` directory (configurable via `UPLOAD_DIR` env var).  
In Docker, mount a persistent volume to `/data` and set:

```env
UPLOAD_DIR=/data/uploads
```

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
| `/help/tickets/new` | Submit a new ticket (with file attachments) |
| `/help/tickets/[id]` | Ticket conversation detail (with file attachments) |

### Agent Portal
| Route | Description |
|---|---|
| `/agent` | Agent dashboard |
| `/agent/tickets/[id]` | Ticket detail with reply console + file attachments |
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
- **`TicketAttachment`** — file metadata linked to tickets or comments
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
| `UPLOAD_DIR` | `/data/uploads` | Directory for uploaded attachments |
| `NODE_ENV` | `production` | Node environment |
| `PORT` | `3000` | Server port |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `you@example.com` | SMTP auth username |
| `SMTP_PASS` | `***` | SMTP auth password / app password |
| `SMTP_FROM` | `Support <no-reply@co.com>` | From address in sent emails |
| `NEXT_PUBLIC_APP_URL` | `https://support.nexoratech.co` | Public URL (used in email links) |

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
│       ├── tickets/        # Ticket CRUD + comments + status + assign
│       ├── upload/         # File upload endpoint (POST)
│       └── uploads/        # File serving endpoint (GET by filename)
├── components/
│   ├── agent/              # Agent-specific components
│   ├── auth/               # Auth buttons
│   └── ui/
│       ├── FileUploader.tsx    # Drag-and-drop file upload component
│       ├── AttachmentList.tsx  # Renders attached files in conversations
│       ├── WelcomeGuide.tsx    # First-time user onboarding modal
│       ├── StatusBadge.tsx
│       ├── PriorityBadge.tsx
│       └── SlaIndicator.tsx
├── lib/
│   ├── auth.ts             # Session auth helpers
│   ├── db.ts               # Prisma client singleton
│   ├── email.ts            # Nodemailer email sending + HTML templates
│   ├── tickets.ts          # Ticket queries and serialization
│   ├── types.ts            # Shared TypeScript types
│   ├── upload.ts           # File storage utilities
│   └── utils.ts            # Date formatting, etc.
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.js             # Sample data seeder
├── public/                 # Static assets
├── uploads/                # Uploaded attachments (created at runtime)
├── .env.example            # Environment variable template
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

## 👋 First-Time User Guide

When you first access the portal, a friendly **Welcome Guide** will appear automatically:

- **Customers** see a 5-step tour covering: submitting tickets, attaching files, tracking replies, and email notifications.
- **Agents** see a 4-step tour covering: managing tickets, replying with internal notes, file attachments, and automated emails.

The guide can be **skipped** at any time. It won't show again once completed.  
To reset it (e.g. for demos), clear `localStorage` key `resolv_welcome_seen_v2` in browser DevTools.

---

<div align="center">
  <sub>© 2025 Nexora Inc. — Built with ❤️ using Next.js & Prisma</sub>
</div>
