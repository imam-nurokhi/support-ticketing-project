# Resolv — Enterprise Helpdesk by Nexora

A complete Next.js 15 enterprise helpdesk ticketing system for Nexora customers.

## Features

- **Landing Page** — Hero, features, and CTA sections
- **Customer Help Center** — FAQ accordion, category navigation, recent tickets sidebar
- **Ticket Submission Wizard** — 3-step wizard (category → details → priority)
- **Customer Ticket Views** — List and chat-style detail views
- **Agent Dashboard** — Stats grid, filterable ticket table with SLA indicators
- **Agent Ticket Detail** — Split-pane with public/internal reply console, audit log

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS** — System font stack (no external font dependencies)
- **Prisma 5** + SQLite — Schema ready for production database integration
- **Mock Data Layer** — 5 realistic tickets, 5 users across customer/agent/admin roles
- **lucide-react** — Icons
- **zod** — Schema validation (ready for forms)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/help` | Customer help center |
| `/help/tickets` | Customer ticket list |
| `/help/tickets/new` | Submit new ticket wizard |
| `/help/tickets/[id]` | Customer ticket detail |
| `/agent` | Agent dashboard |
| `/agent/tickets/[id]` | Agent ticket detail |

## Database

```bash
npx prisma generate
npx prisma db push
```

The app currently uses a mock data layer (`lib/mock-data.ts`). The Prisma schema is ready to wire up real persistence.
