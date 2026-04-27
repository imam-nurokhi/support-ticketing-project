const fs = require('node:fs');
const path = require('node:path');
const { PrismaClient } = require('@prisma/client');
const { randomBytes, scryptSync } = require('node:crypto');

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/(^\.|\.$)/g, '')
    .slice(0, 48);
}

function stripHtml(value) {
  return (value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function loadTicketsFromRtf(rtfPath) {
  const content = fs.readFileSync(rtfPath, 'latin1');
  let text = content
    .replace(/\\\{/g, '{')
    .replace(/\\\}/g, '}')
    .replace(/\\\\/g, '\\')
    .replace(/\\\n/g, '');
  text = text.replace(/\\[a-zA-Z]+\d*[ ]?/g, '');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']') + 1;
  if (start === -1 || end <= start) throw new Error('Could not locate JSON array in RTF.');
  let jsonText = text.slice(start, end);
  jsonText = jsonText.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
  return JSON.parse(jsonText);
}

function mapStatus(status) {
  switch (status) {
    case 'in_progress': return 'IN_PROGRESS';
    case 'pending':     return 'WAITING_ON_CUSTOMER';
    case 'hold':        return 'WAITING_ON_CUSTOMER';
    case 'closed':      return 'CLOSED';
    default:            return 'OPEN';
  }
}

function normalizeCategory(tagName) {
  const map = {
    'auditq application': 'AUDITQ Application',
    'auditq':             'AUDITQ Application',
    'audit service':      'Audit Service',
    'audit_service':      'Audit Service',
    'crm application':    'CRM Application',
    'crm':                'CRM Application',
    'lms':                'LMS',
    'website':            'Website',
    'marketing':          'Marketing',
    'hardware':           'Hardware',
    'email':              'Email',
    'network':            'Network',
    'training service':   'Training Service',
    'training-service':   'Training Service',
    'other':              'General',
    'others':             'General',
    'one_alpha':          'One Alpha',
    'one-alpha':          'One Alpha',
    'one alpha':          'One Alpha',
    'one alpha (oa)':     'One Alpha',
    'pm-tools':           'PM Tools',
    'pm tools':           'PM Tools',
    'certification service':  'Certification Service',
    'sustainability service': 'Sustainability Service',
    'legality':           'Legality',
    'ga-vehicle booking': 'GA Vehicle Booking',
    'bugs':               'Bug Report',
  };
  const key = (tagName ?? '').toLowerCase().trim();
  return map[key] || tagName || 'General';
}

function mapPriority(ticket) {
  const text = `${ticket.subject ?? ''} ${ticket.latest_reply?.body ?? ''}`.toLowerCase();
  if (text.includes('urgent') || text.includes('critical') ||
      (text.includes('tidak bisa') && text.includes('penting'))) return 'URGENT';
  if ((ticket.status === 'open' && (ticket.replies_count ?? 0) > 3) ||
      text.includes('error') || text.includes('gagal') || text.includes('tidak bisa')) return 'HIGH';
  if (ticket.status === 'pending' || ticket.status === 'hold') return 'LOW';
  return 'MEDIUM';
}

function toTicketId(sourceId) {
  return `NXR-${String(sourceId).padStart(4, '0')}`;
}

/**
 * All agents derived directly from assigned_to IDs in the source data.
 * Names taken from display_name in source; confirmed via reply-body analysis.
 *
 *   ID  6 (474 tickets) – Imam Nurokhi       → confirmed "Dear Mas Imam" 42x, 308 agent replies
 *   ID 23 (217 tickets) – Muhammad Rafif     → confirmed "Dear Mas Rafif" 20x, signs "Muhammad"
 *   ID 24 (107 tickets) – Daniel             → confirmed signs "Daniel" 11x
 *   ID 59 ( 51 tickets) – Frisy Sari         → handles sustainability/marketing tickets
 *   ID 65 ( 27 tickets) – Shifa Maharani     → addressed as "Ci Frissy" handler in design tickets
 *   ID 40 (  1 ticket ) – Tri Yuliani        → appears in data as assigned agent
 *   ID 41 (  1 ticket ) – Dessy Oktaviani    → appears in data as assigned agent
 *   ID 42 (  1 ticket ) – Mochammad Perbowo  → appears in data as assigned agent
 */
const AGENT_NAMES = {
  6:  { name: 'M. Imam Nurokhi',    email: 'imam.nurokhi@nexora.local' },
  23: { name: 'Muhammad Rafif',     email: 'rafif@nexora.local' },
  24: { name: 'Daniel Pratama',     email: 'daniel.pratama@nexora.local' },
  59: { name: 'Frisy Sari',         email: 'frisy.sari@nexora.local' },
  65: { name: 'Shifa Maharani',     email: 'shifa.maharani@nexora.local' },
  40: { name: 'Tri Yuliani',        email: 'tri.yuliani@nexora.local' },
  41: { name: 'Dessy Oktaviani',    email: 'dessy.oktaviani@nexora.local' },
  42: { name: 'Mochammad Perbowo',  email: 'mochammad.perbowo@nexora.local' },
};

async function main() {
  const rtfPath =
    process.env.SOURCE_DATA_PATH ??
    path.resolve(__dirname, 'data', 'tickets.rtf');

  const hasRtfData = fs.existsSync(rtfPath);

  if (!hasRtfData) {
    console.log(`ℹ️  No RTF source data found at: ${rtfPath}`);
    console.log(`   Running in demo-only mode (no ticket import).`);
  }

  const rawTickets = hasRtfData ? loadTicketsFromRtf(rtfPath) : [];

  if (hasRtfData) {
    console.log(`Parsing ticket data from: ${rtfPath}`);
    console.log(`Loaded ${rawTickets.length} tickets from source`);
    const statusCounts = {};
    for (const t of rawTickets) statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    console.log('Status distribution:', statusCounts);
  }

  // ── Wipe in dependency order ──────────────────────────────────────
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin ────────────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexora.local',
      name: 'Admin Nexora',
      role: 'ADMIN',
      passwordHash: hashPassword('Admin123!'),
    },
  });
  console.log('Created admin:', admin.email);

  // ── Agent accounts — all unique assigned_to IDs from source data ─
  const agentsBySourceId = new Map();
  const agentSourceIds = new Set(Object.keys(AGENT_NAMES).map(Number));

  for (const [sourceIdStr, info] of Object.entries(AGENT_NAMES)) {
    const sourceId = parseInt(sourceIdStr, 10);
    const agentUser = await prisma.user.create({
      data: {
        email: info.email,
        name: info.name,
        role: 'SUPPORT_AGENT',
        passwordHash: hashPassword('Agent123!'),
        externalUserId: sourceId + 10000, // offset to avoid collision with customer externalUserId
      },
    });
    agentsBySourceId.set(sourceId, agentUser);
    console.log(`Created agent: ${info.name} (source ID: ${sourceId})`);
  }

  // Generic demo agent for easy login
  await prisma.user.create({
    data: {
      email: 'agent@nexora.local',
      name: 'Demo Agent',
      role: 'SUPPORT_AGENT',
      passwordHash: hashPassword('Agent123!'),
    },
  });

  // Primary agent for fallback (Imam — highest ticket volume)
  const primaryAgent = agentsBySourceId.get(6);

  // ── Customer accounts from source data ───────────────────────────
  const usersByExternalId = new Map();
  const DEMO_CUSTOMER_EMAIL = 'customer@nexora.local';

  if (hasRtfData && rawTickets.length > 0) {
    const ticketCountByUser = {};
    for (const ticket of rawTickets) {
      if (ticket.user?.id) ticketCountByUser[ticket.user.id] = (ticketCountByUser[ticket.user.id] || 0) + 1;
    }
    const demoCustomerId = parseInt(
      Object.entries(ticketCountByUser).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '0', 10
    );
    console.log('Demo customer external ID:', demoCustomerId);

    for (const ticket of rawTickets) {
      const sourceUser = ticket.user;
      if (!sourceUser || usersByExternalId.has(sourceUser.id)) continue;
      // Skip IDs that are already created as agents
      if (agentSourceIds.has(sourceUser.id)) continue;

      const isDemoCustomer = sourceUser.id === demoCustomerId;
      const displayName = sourceUser.display_name || `User-${sourceUser.id}`;

      const user = await prisma.user.create({
        data: {
          externalUserId: sourceUser.id,
          email: isDemoCustomer
            ? DEMO_CUSTOMER_EMAIL
            : `${slugify(displayName)}.${sourceUser.id}@imported.local`,
          name: displayName,
          role: 'CUSTOMER',
          avatarUrl: sourceUser.avatar || null,
          passwordHash: isDemoCustomer ? hashPassword('Customer123!') : null,
        },
      });

      usersByExternalId.set(sourceUser.id, user);
    }

    console.log(`Created ${usersByExternalId.size} customer accounts`);
  } else {
    // No RTF data — create a standalone demo customer account
    const demoCustomer = await prisma.user.create({
      data: {
        email: DEMO_CUSTOMER_EMAIL,
        name: 'Demo Customer',
        role: 'CUSTOMER',
        passwordHash: hashPassword('Customer123!'),
      },
    });
    usersByExternalId.set('demo', demoCustomer);
    console.log('Created demo customer:', demoCustomer.email);
  }

  // ── Import tickets ────────────────────────────────────────────────
  let imported = 0, skipped = 0;

  if (hasRtfData) {
    for (const ticket of rawTickets) {
      // Author may be a customer OR an agent who also submits tickets
      const author =
        usersByExternalId.get(ticket.user?.id) ??
        agentsBySourceId.get(ticket.user?.id);
      if (!author) { skipped++; continue; }

      const latestReplyBody = stripHtml(ticket.latest_reply?.body);
      const description = latestReplyBody || ticket.subject || 'Imported support ticket.';
      const status = mapStatus(ticket.status);

      const assigneeUser = ticket.assigned_to
        ? (agentsBySourceId.get(ticket.assigned_to) ?? primaryAgent)
        : null;

      const createdAt = ticket.created_at ? new Date(ticket.created_at) : new Date();
      const updatedAt = ticket.updated_at ? new Date(ticket.updated_at) : createdAt;
      const closedAt  = ticket.closed_at  ? new Date(ticket.closed_at)  : null;

      const isCustomerReply =
        !ticket.latest_reply?.user_id || ticket.latest_reply.user_id === ticket.user?.id;
      const replyAuthor = isCustomerReply ? author : (assigneeUser ?? admin);

      const rawCategory = ticket.tags?.[0]?.display_name || ticket.tags?.[0]?.name || null;
      const department = rawCategory ? normalizeCategory(rawCategory) : 'General';

      await prisma.ticket.create({
        data: {
          ticketId:           toTicketId(ticket.id),
          sourceId:           ticket.id,
          sourceSystem:       'ticket-dashboard',
          title:              ticket.subject || `Ticket #${ticket.id}`,
          description,
          status,
          priority:           mapPriority(ticket),
          department,
          requesterAvatarUrl: ticket.user?.avatar || null,
          authorId:           author.id,
          assigneeId:         assigneeUser?.id ?? null,
          createdAt,
          updatedAt,
          closedAt,
          comments: latestReplyBody
            ? {
                create: {
                  authorId:       replyAuthor.id,
                  message:        latestReplyBody,
                  isInternalNote: false,
                  createdAt:      ticket.latest_reply?.created_at
                                    ? new Date(ticket.latest_reply.created_at)
                                    : createdAt,
                },
              }
            : undefined,
          auditLogs: {
            create: [
              {
                userId:   admin.id,
                action:   'IMPORTED',
                newValue: `Imported from ticket-dashboard #${ticket.id} (${ticket.status})`,
                createdAt,
              },
              ...(assigneeUser ? [{
                userId:   admin.id,
                action:   'ASSIGNED',
                newValue: assigneeUser.name,
                createdAt: updatedAt,
              }] : []),
              ...(closedAt && status === 'CLOSED' ? [{
                userId:   admin.id,
                action:   'STATUS_CHANGED',
                oldValue: 'OPEN',
                newValue: 'CLOSED',
                createdAt: closedAt,
              }] : []),
            ],
          },
        },
      });

      imported++;
    }
  }

  console.log(`\n✅ Seed complete:`);
  console.log(`   Tickets imported:  ${imported}`);
  console.log(`   Tickets skipped:   ${skipped}`);
  console.log(`   Agents created:    ${agentsBySourceId.size + 1} (+ demo)`);
  console.log(`   Customers created: ${usersByExternalId.size}`);
  console.log(`\n📧 Login credentials:`);
  console.log(`   Admin:    admin@nexora.local    / Admin123!`);
  console.log(`   Agent:    agent@nexora.local    / Agent123!`);
  console.log(`   Customer: customer@nexora.local / Customer123!`);
  console.log(`\n🔑 All agent accounts (password: Agent123!):`);
  for (const info of Object.values(AGENT_NAMES)) {
    console.log(`   ${info.email}  (${info.name})`);
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error('Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
