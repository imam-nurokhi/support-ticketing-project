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

/**
 * Parse the RTF source file and extract the embedded JSON ticket array.
 */
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
  if (start === -1 || end <= start) {
    throw new Error('Could not locate JSON array in RTF source file.');
  }

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
    case 'open':
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
  if (
    text.includes('urgent') ||
    text.includes('critical') ||
    (text.includes('tidak bisa') && text.includes('penting'))
  ) return 'URGENT';
  if (
    (ticket.status === 'open' && (ticket.replies_count ?? 0) > 3) ||
    text.includes('error') ||
    text.includes('gagal') ||
    text.includes('tidak bisa')
  ) return 'HIGH';
  if (ticket.status === 'pending' || ticket.status === 'hold') return 'LOW';
  return 'MEDIUM';
}

function toTicketId(sourceId) {
  return `NXR-${String(sourceId).padStart(4, '0')}`;
}

/**
 * CONFIRMED agent identities from thorough analysis of ticket reply patterns:
 *
 * Source ID 6  = M. Imam Nurokhi  — customers write "Dear Mas Imam" 42x; 308 agent replies
 * Source ID 23 = Muhammad Rafif   — customers write "Dear Mas Rafif" 20x; signs "Muhammad"; 148 agent replies
 * Source ID 24 = Daniel Pratama   — customers write "Dear Daniel" 2x; signs "Daniel" 11x; 85 agent replies
 *
 * All other assigned_to IDs (40, 41, 42, 59, 65) are NOT IT support agents:
 *   ID 40 = Tri Yuliani       — regular customer, only 1 ticket ever assigned (data artifact)
 *   ID 41 = dessy.oktaviani   — regular customer, only 1 ticket ever assigned (data artifact)
 *   ID 42 = mochammad.perbowo — regular customer, only 1 ticket ever assigned (data artifact)
 *   ID 59 = Frisy Sari        — internal marketing/design, appears primarily as a ticket CREATOR
 *   ID 65 = shifa.maharani    — internal marketing/design, appears primarily as a ticket CREATOR
 *
 * Shalik (user_id=67, shalik.imansyah) = CUSTOMER who creates tickets (NOT an agent).
 *   Agents (Rafif) address him as "Dear Mas Shalik" in replies.
 */
const AGENT_NAMES = {
  6:  { name: 'M. Imam Nurokhi', email: 'imam.nurokhi@nexora.local' },
  23: { name: 'Muhammad Rafif',  email: 'rafif@nexora.local' },
  24: { name: 'Daniel Pratama',  email: 'daniel.pratama@nexora.local' },
};

async function main() {
  const rtfPath =
    process.env.SOURCE_DATA_PATH ??
    path.resolve(__dirname, 'data', 'tickets.rtf');

  if (!fs.existsSync(rtfPath)) {
    throw new Error(
      `Source data not found at: ${rtfPath}\n` +
      `Copy the RTF data file to prisma/data/tickets.rtf and re-run.`
    );
  }

  console.log(`Parsing ticket data from: ${rtfPath}`);
  const rawTickets = loadTicketsFromRtf(rtfPath);
  console.log(`Loaded ${rawTickets.length} tickets from source`);

  const statusCounts = {};
  for (const t of rawTickets) {
    statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
  }
  console.log('Status distribution:', statusCounts);

  // ── Wipe in dependency order ──────────────────────────────────────
  await prisma.passwordResetToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.ticketComment.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin account ─────────────────────────────────────────────────
  const admin = await prisma.user.create({
    data: {
      email: 'admin@nexora.local',
      name: 'Admin Nexora',
      role: 'ADMIN',
      passwordHash: hashPassword('Admin123!'),
    },
  });
  console.log('Created admin:', admin.email);

  // ── Agent accounts — ONLY the 3 confirmed IT support agents ──────
  const agentsBySourceId = new Map(); // sourceId → prisma User

  for (const [sourceIdStr, info] of Object.entries(AGENT_NAMES)) {
    const sourceId = parseInt(sourceIdStr, 10);
    const agentUser = await prisma.user.create({
      data: {
        email: info.email,
        name: info.name,
        role: 'SUPPORT_AGENT',
        passwordHash: hashPassword('Agent123!'),
        externalUserId: sourceId + 10000, // offset to avoid collision with customer IDs
      },
    });
    agentsBySourceId.set(sourceId, agentUser);
    console.log(`Created agent: ${info.name} (source ID: ${sourceId})`);
  }

  // Generic demo agent account for easy login testing
  await prisma.user.create({
    data: {
      email: 'agent@nexora.local',
      name: 'Demo Agent',
      role: 'SUPPORT_AGENT',
      passwordHash: hashPassword('Agent123!'),
    },
  });

  // Primary agent for re-assignment fallback (Imam handles the most tickets)
  const primaryAgent = agentsBySourceId.get(6);

  // ── Customer accounts from source data ───────────────────────────
  const usersByExternalId = new Map();
  const DEMO_CUSTOMER_EMAIL = 'customer@nexora.local';

  // Pick the user with the most tickets as the demo customer
  const ticketCountByUser = {};
  for (const ticket of rawTickets) {
    if (ticket.user?.id) {
      ticketCountByUser[ticket.user.id] = (ticketCountByUser[ticket.user.id] || 0) + 1;
    }
  }
  const demoCustomerId = parseInt(
    Object.entries(ticketCountByUser).sort(([, a], [, b]) => b - a)[0]?.[0] ?? '0',
    10
  );
  console.log('Demo customer external ID:', demoCustomerId);

  const agentSourceIds = new Set(Object.keys(AGENT_NAMES).map(Number));

  for (const ticket of rawTickets) {
    const sourceUser = ticket.user;
    if (!sourceUser || usersByExternalId.has(sourceUser.id)) continue;

    // Skip if this external ID is already an agent (avoid duplicate externalUserId)
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

  // ── Import tickets ────────────────────────────────────────────────
  let imported = 0;
  let skipped = 0;
  let reassigned = 0; // tickets where assigned_to had no agent account → re-assigned to Imam

  for (const ticket of rawTickets) {
    const author = usersByExternalId.get(ticket.user?.id);
    if (!author) { skipped++; continue; }

    const latestReplyBody = stripHtml(ticket.latest_reply?.body);
    const description = latestReplyBody || ticket.subject || 'Imported support ticket.';
    const status = mapStatus(ticket.status);

    // Map assigned_to to a real agent; fall back to Imam for any non-agent IDs
    let assigneeUser = null;
    if (ticket.assigned_to) {
      if (agentsBySourceId.has(ticket.assigned_to)) {
        assigneeUser = agentsBySourceId.get(ticket.assigned_to);
      } else {
        assigneeUser = primaryAgent; // re-assign to Imam
        reassigned++;
      }
    }

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
            ...(assigneeUser
              ? [{
                  userId:   admin.id,
                  action:   'ASSIGNED',
                  newValue: assigneeUser.name,
                  createdAt: updatedAt,
                }]
              : []),
            ...(closedAt && status === 'CLOSED'
              ? [{
                  userId:   admin.id,
                  action:   'STATUS_CHANGED',
                  oldValue: 'OPEN',
                  newValue: 'CLOSED',
                  createdAt: closedAt,
                }]
              : []),
          ],
        },
      },
    });

    imported++;
  }

  console.log(`\n✅ Seed complete:`);
  console.log(`   Tickets imported:  ${imported}`);
  console.log(`   Tickets skipped:   ${skipped}`);
  console.log(`   Tickets reassigned to Imam (non-agent IDs): ${reassigned}`);
  console.log(`   Agents created:    ${agentsBySourceId.size + 1} (+ demo)`);
  console.log(`   Customers created: ${usersByExternalId.size}`);
  console.log(`\n📧 Login credentials:`);
  console.log(`   Admin:    admin@nexora.local    / Admin123!`);
  console.log(`   Agent:    agent@nexora.local    / Agent123!`);
  console.log(`   Customer: customer@nexora.local / Customer123!`);
  console.log(`\n🔑 Agent team accounts (password: Agent123!):`);
  for (const info of Object.values(AGENT_NAMES)) {
    console.log(`   ${info.email}  (${info.name})`);
  }
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
