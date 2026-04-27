export const USER_ROLES = ['CUSTOMER', 'SUPPORT_AGENT', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'RESOLVED', 'CLOSED'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type Priority = (typeof PRIORITIES)[number];

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl: string | null;
}

export interface AttachmentView {
  id: string;
  filename: string;
  storedName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface TicketCommentView {
  id: string;
  message: string;
  isInternalNote: boolean;
  createdAt: string;
  author: SessionUser;
  attachments: AttachmentView[];
}

export interface AuditLogView {
  id: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  user: SessionUser;
}

export interface TicketView {
  id: string;
  ticketId: string;
  sourceId: number | null;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  department: string;
  requesterAvatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  author: SessionUser;
  assignee: SessionUser | null;
  comments: TicketCommentView[];
  auditLogs: AuditLogView[];
  attachments: AttachmentView[];
  latestReply: string | null;
  preview: string;
}

export interface AdminDashboardTicket {
  id: string;
  ticketId: string;
  sourceId: number | null;
  title: string;
  status: 'open' | 'in_progress' | 'pending' | 'closed' | 'hold';
  statusLabel: string;
  priority: Priority;
  department: string;
  requester: string;
  requesterAvatarUrl: string | null;
  assignee: string | null;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  preview: string;
}

export interface DashboardSummary {
  total: number;
  resolveRate: number;
  byStatus: {
    open: number;
    in_progress: number;
    pending: number;
    closed: number;
    hold: number;
  };
  byCategory: Array<{ name: string; count: number }>;
  byMonth: Array<{ month: string; label: string; count: number }>;
  topRequesters: Array<{ name: string; count: number }>;
}

export interface AgentPerformance {
  id: string;
  name: string;
  email: string;
  total: number;
  closed: number;
  open: number;
  inProgress: number;
  resolveRate: number;
}


export interface AdminDashboardTicket {
  id: string;
  ticketId: string;
  sourceId: number | null;
  title: string;
  status: 'open' | 'in_progress' | 'pending' | 'closed' | 'hold';
  statusLabel: string;
  priority: Priority;
  department: string;
  requester: string;
  requesterAvatarUrl: string | null;
  assignee: string | null;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  preview: string;
}

export interface DashboardSummary {
  total: number;
  resolveRate: number;
  byStatus: {
    open: number;
    in_progress: number;
    pending: number;
    closed: number;
    hold: number;
  };
  byCategory: Array<{ name: string; count: number }>;
  byMonth: Array<{ month: string; label: string; count: number }>;
  topRequesters: Array<{ name: string; count: number }>;
}

export interface AgentPerformance {
  id: string;
  name: string;
  email: string;
  total: number;
  closed: number;
  open: number;
  inProgress: number;
  resolveRate: number;
}
