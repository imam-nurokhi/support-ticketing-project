import type { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import type {
  AdminDashboardTicket,
  AgentPerformance,
  DashboardSummary,
  Priority,
  SessionUser,
  TicketStatus,
  TicketView,
} from '@/lib/types';

export const ticketInclude = {
  author: true,
  assignee: true,
  comments: {
    include: {
      author: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  },
  auditLogs: {
    include: {
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  },
} satisfies Prisma.TicketInclude;

export type TicketRecord = Prisma.TicketGetPayload<{ include: typeof ticketInclude }>;

export function toTicketId(sourceId: number | null, id: string) {
  if (sourceId) {
    return `NXR-${String(sourceId).padStart(4, '0')}`;
  }

  return `TK-${id.slice(-6).toUpperCase()}`;
}

export function mapImportedStatus(status: string): TicketStatus {
  switch (status) {
    case 'in_progress':
      return 'IN_PROGRESS';
    case 'pending':
      return 'WAITING_ON_CUSTOMER';
    case 'closed':
      return 'CLOSED';
    default:
      return 'OPEN';
  }
}

export function mapDashboardStatus(status: TicketStatus): AdminDashboardTicket['status'] {
  switch (status) {
    case 'IN_PROGRESS':
      return 'in_progress';
    case 'WAITING_ON_CUSTOMER':
      return 'pending';
    case 'RESOLVED':
    case 'CLOSED':
      return 'closed';
    default:
      return 'open';
  }
}

export function formatStatusLabel(status: TicketStatus) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function serializeUser(user: TicketRecord['author']): SessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as SessionUser['role'],
    avatarUrl: user.avatarUrl,
  };
}

export function serializeTicket(ticket: TicketRecord): TicketView {
  const latestPublicReply =
    [...ticket.comments].reverse().find((comment) => !comment.isInternalNote)?.message ?? null;

  return {
    id: ticket.id,
    ticketId: ticket.ticketId,
    sourceId: ticket.sourceId,
    title: ticket.title,
    description: ticket.description,
    status: ticket.status as TicketStatus,
    priority: ticket.priority as Priority,
    department: ticket.department,
    requesterAvatarUrl: ticket.requesterAvatarUrl,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    closedAt: ticket.closedAt?.toISOString() ?? null,
    author: serializeUser(ticket.author),
    assignee: ticket.assignee ? serializeUser(ticket.assignee) : null,
    comments: ticket.comments.map((comment) => ({
      id: comment.id,
      message: comment.message,
      isInternalNote: comment.isInternalNote,
      createdAt: comment.createdAt.toISOString(),
      author: serializeUser(comment.author),
    })),
    auditLogs: ticket.auditLogs.map((log) => ({
      id: log.id,
      action: log.action,
      oldValue: log.oldValue,
      newValue: log.newValue,
      createdAt: log.createdAt.toISOString(),
      user: serializeUser(log.user),
    })),
    latestReply: latestPublicReply,
    preview: (latestPublicReply ?? ticket.description).slice(0, 180),
  };
}

export function toAdminDashboardTicket(ticket: TicketView): AdminDashboardTicket {
  return {
    id: ticket.id,
    ticketId: ticket.ticketId,
    sourceId: ticket.sourceId,
    title: ticket.title,
    status: mapDashboardStatus(ticket.status),
    statusLabel: formatStatusLabel(ticket.status),
    priority: ticket.priority,
    department: ticket.department,
    requester: ticket.author.name,
    requesterAvatarUrl: ticket.requesterAvatarUrl,
    assignee: ticket.assignee?.name ?? null,
    repliesCount: ticket.comments.filter((comment) => !comment.isInternalNote).length,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    closedAt: ticket.closedAt,
    preview: ticket.preview,
  };
}

export function buildDashboardSummary(tickets: TicketView[]): DashboardSummary {
  const byStatus: DashboardSummary['byStatus'] = {
    open: 0,
    in_progress: 0,
    pending: 0,
    closed: 0,
    hold: 0,
  };
  const byCategory = new Map<string, number>();
  const byMonth = new Map<string, number>();
  const byRequester = new Map<string, number>();

  for (const ticket of tickets) {
    const dashboardStatus = mapDashboardStatus(ticket.status);
    byStatus[dashboardStatus] += 1;
    byCategory.set(ticket.department, (byCategory.get(ticket.department) ?? 0) + 1);
    byRequester.set(ticket.author.name, (byRequester.get(ticket.author.name) ?? 0) + 1);

    const createdAt = new Date(ticket.createdAt);
    const monthKey = `${createdAt.getUTCFullYear()}-${String(createdAt.getUTCMonth() + 1).padStart(2, '0')}`;
    byMonth.set(monthKey, (byMonth.get(monthKey) ?? 0) + 1);
  }

  return {
    total: tickets.length,
    resolveRate: tickets.length === 0 ? 0 : Number(((byStatus.closed / tickets.length) * 100).toFixed(1)),
    byStatus,
    byCategory: [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count })),
    byMonth: [...byMonth.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({
        month,
        label: new Date(`${month}-01T00:00:00Z`).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
          timeZone: 'UTC',
        }),
        count,
      })),
    topRequesters: [...byRequester.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count]) => ({ name, count })),
  };
}

export async function getCustomerTickets(userId: string) {
  const tickets = await db.ticket.findMany({
    where: { authorId: userId },
    include: ticketInclude,
    orderBy: { updatedAt: 'desc' },
  });

  return tickets.map(serializeTicket);
}

export async function getAgentTickets(userId: string, isAdmin = false) {
  const tickets = await db.ticket.findMany({
    where: isAdmin ? undefined : { OR: [{ assigneeId: userId }, { assigneeId: null }] },
    include: ticketInclude,
    orderBy: { updatedAt: 'desc' },
    take: 50,
  });

  return tickets.map(serializeTicket);
}

export async function getTicketForCustomer(ticketId: string, userId: string) {
  const ticket = await db.ticket.findFirst({
    where: {
      id: ticketId,
      authorId: userId,
    },
    include: ticketInclude,
  });

  return ticket ? serializeTicket(ticket) : null;
}

export async function getTicketForStaff(ticketId: string) {
  const ticket = await db.ticket.findUnique({
    where: { id: ticketId },
    include: ticketInclude,
  });

  return ticket ? serializeTicket(ticket) : null;
}

export async function getAdminDashboardData() {
  const tickets = await db.ticket.findMany({
    include: ticketInclude,
    orderBy: { updatedAt: 'desc' },
  });

  const serialized = tickets.map(serializeTicket);

  // Agent performance: query all support agents and their ticket stats
  const agents = await db.user.findMany({
    where: { role: 'SUPPORT_AGENT' },
    include: {
      assignedTickets: { select: { status: true } },
    },
    orderBy: { name: 'asc' },
  });

  const agentPerformance: AgentPerformance[] = agents
    .filter((a) => a.assignedTickets.length > 0)
    .map((agent) => {
      const total = agent.assignedTickets.length;
      const closed = agent.assignedTickets.filter(
        (t) => t.status === 'CLOSED' || t.status === 'RESOLVED',
      ).length;
      const inProgress = agent.assignedTickets.filter(
        (t) => t.status === 'IN_PROGRESS',
      ).length;
      const open = agent.assignedTickets.filter(
        (t) => t.status === 'OPEN',
      ).length;
      return {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        total,
        closed,
        open,
        inProgress,
        resolveRate: total === 0 ? 0 : Number(((closed / total) * 100).toFixed(1)),
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    tickets: serialized.map(toAdminDashboardTicket),
    summary: buildDashboardSummary(serialized),
    details: serialized,
    agentPerformance,
  };
}
