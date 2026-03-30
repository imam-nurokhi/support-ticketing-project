export type Role = 'CUSTOMER' | 'SUPPORT_AGENT' | 'ADMIN';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface Ticket {
  id: string;
  ticketId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  department: string;
  authorId: string;
  assigneeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  author: User;
  assignee: User | null;
  comments: TicketComment[];
  auditLogs: AuditLog[];
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  message: string;
  isInternalNote: boolean;
  createdAt: Date;
  author: User;
}

export interface AuditLog {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  user: User;
}

export const mockUsers: User[] = [
  { id: 'user-1', email: 'alice@example.com', name: 'Alice Johnson', role: 'CUSTOMER', createdAt: new Date('2024-01-15') },
  { id: 'user-2', email: 'bob@example.com', name: 'Bob Smith', role: 'CUSTOMER', createdAt: new Date('2024-02-01') },
  { id: 'user-3', email: 'carol@nexora.com', name: 'Carol Davis', role: 'SUPPORT_AGENT', createdAt: new Date('2023-06-01') },
  { id: 'user-4', email: 'david@nexora.com', name: 'David Wilson', role: 'SUPPORT_AGENT', createdAt: new Date('2023-07-15') },
  { id: 'user-5', email: 'emma@nexora.com', name: 'Emma Brown', role: 'ADMIN', createdAt: new Date('2023-01-01') },
];

export const CURRENT_CUSTOMER = mockUsers[0];
export const CURRENT_AGENT = mockUsers[2];

export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    ticketId: 'NXR-1001',
    title: 'Cannot access my account after password reset',
    description: 'I tried to reset my password but now I cannot log in. The reset link said it was expired but I clicked it within 5 minutes of receiving the email.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    department: 'Technical',
    authorId: 'user-1',
    assigneeId: 'user-3',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
    author: mockUsers[0],
    assignee: mockUsers[2],
    comments: [
      {
        id: 'comment-1',
        ticketId: 'ticket-1',
        authorId: 'user-1',
        message: 'I tried to reset my password but now I cannot log in. The reset link said it was expired but I clicked it within 5 minutes of receiving the email.',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        author: mockUsers[0],
      },
      {
        id: 'comment-2',
        ticketId: 'ticket-1',
        authorId: 'user-3',
        message: 'Hi Alice, thank you for reaching out! I can see your account in our system. Let me check the password reset logs. Can you confirm the email address you used?',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        author: mockUsers[2],
      },
      {
        id: 'comment-3',
        ticketId: 'ticket-1',
        authorId: 'user-3',
        message: 'Checked the logs - there was a clock skew issue on auth server. Need to escalate to backend team.',
        isInternalNote: true,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        author: mockUsers[2],
      },
      {
        id: 'comment-4',
        ticketId: 'ticket-1',
        authorId: 'user-1',
        message: 'Yes, I used alice@example.com. I have tried multiple times now and still getting the same error.',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        author: mockUsers[0],
      },
    ],
    auditLogs: [
      { id: 'audit-1', ticketId: 'ticket-1', userId: 'user-5', action: 'ASSIGNED', oldValue: null, newValue: 'Carol Davis', createdAt: new Date(Date.now() - 1.8 * 60 * 60 * 1000), user: mockUsers[4] },
      { id: 'audit-2', ticketId: 'ticket-1', userId: 'user-3', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), user: mockUsers[2] },
    ],
  },
  {
    id: 'ticket-2',
    ticketId: 'NXR-1002',
    title: 'Incorrect charge on my invoice for March',
    description: 'My invoice for March shows a charge of $299 but I am on the $99/month plan. I have never upgraded and there is no record of any upgrade in my account settings.',
    status: 'OPEN',
    priority: 'URGENT',
    department: 'Billing',
    authorId: 'user-2',
    assigneeId: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    author: mockUsers[1],
    assignee: null,
    comments: [
      {
        id: 'comment-5',
        ticketId: 'ticket-2',
        authorId: 'user-2',
        message: 'My invoice for March shows a charge of $299 but I am on the $99/month plan. I have never upgraded.',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        author: mockUsers[1],
      },
    ],
    auditLogs: [],
  },
  {
    id: 'ticket-3',
    ticketId: 'NXR-1003',
    title: 'Feature request: Dark mode support',
    description: 'Would love to have a dark mode option in the dashboard. Working late nights and the bright white interface is quite straining on the eyes.',
    status: 'OPEN',
    priority: 'LOW',
    department: 'General',
    authorId: 'user-1',
    assigneeId: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    author: mockUsers[0],
    assignee: null,
    comments: [
      {
        id: 'comment-6',
        ticketId: 'ticket-3',
        authorId: 'user-1',
        message: 'Would love to have a dark mode option in the dashboard.',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        author: mockUsers[0],
      },
    ],
    auditLogs: [],
  },
  {
    id: 'ticket-4',
    ticketId: 'NXR-1004',
    title: 'API integration failing with 401 errors',
    description: 'Our integration with the Nexora API started failing yesterday with 401 Unauthorized errors. The API keys have not changed and were working fine last week.',
    status: 'WAITING_ON_CUSTOMER',
    priority: 'HIGH',
    department: 'Technical',
    authorId: 'user-2',
    assigneeId: 'user-4',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    author: mockUsers[1],
    assignee: mockUsers[3],
    comments: [
      {
        id: 'comment-7',
        ticketId: 'ticket-4',
        authorId: 'user-2',
        message: 'Our integration with the Nexora API started failing yesterday with 401 Unauthorized errors.',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        author: mockUsers[1],
      },
      {
        id: 'comment-8',
        ticketId: 'ticket-4',
        authorId: 'user-4',
        message: "Hi Bob, I can see you're using v1 API keys. We rolled out a breaking change last Tuesday that requires v2 keys. Could you please regenerate your API keys from the dashboard?",
        isInternalNote: false,
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
        author: mockUsers[3],
      },
      {
        id: 'comment-9',
        ticketId: 'ticket-4',
        authorId: 'user-4',
        message: 'Verified customer is using deprecated v1 keys. The migration guide was sent via email on March 1st. Waiting for them to regenerate.',
        isInternalNote: true,
        createdAt: new Date(Date.now() - 35 * 60 * 60 * 1000),
        author: mockUsers[3],
      },
    ],
    auditLogs: [
      { id: 'audit-3', ticketId: 'ticket-4', userId: 'user-4', action: 'STATUS_CHANGED', oldValue: 'IN_PROGRESS', newValue: 'WAITING_ON_CUSTOMER', createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), user: mockUsers[3] },
    ],
  },
  {
    id: 'ticket-5',
    ticketId: 'NXR-1005',
    title: 'Inquiry about enterprise pricing',
    description: 'We are a team of 200 and looking to move to Nexora. Can you provide information about enterprise plans, custom integrations, and SLA guarantees?',
    status: 'RESOLVED',
    priority: 'MEDIUM',
    department: 'Sales',
    authorId: 'user-1',
    assigneeId: 'user-3',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    author: mockUsers[0],
    assignee: mockUsers[2],
    comments: [
      {
        id: 'comment-10',
        ticketId: 'ticket-5',
        authorId: 'user-1',
        message: 'We are a team of 200 and looking to move to Nexora. Can you provide information about enterprise plans?',
        isInternalNote: false,
        createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
        author: mockUsers[0],
      },
      {
        id: 'comment-11',
        ticketId: 'ticket-5',
        authorId: 'user-3',
        message: "Hi Alice! Great news - our enterprise plan starts at $2,000/month for up to 250 seats and includes dedicated support, custom SLAs (99.99% uptime), SSO, and API access. I've sent a detailed proposal to your email.",
        isInternalNote: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000),
        author: mockUsers[2],
      },
    ],
    auditLogs: [
      { id: 'audit-4', ticketId: 'ticket-5', userId: 'user-3', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'RESOLVED', createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), user: mockUsers[2] },
    ],
  },
];

export function getTicketById(id: string): Ticket | undefined {
  return mockTickets.find(t => t.id === id || t.ticketId === id);
}

export function getTicketsForCustomer(userId: string): Ticket[] {
  return mockTickets.filter(t => t.authorId === userId);
}

export function getTicketsForAgent(): Ticket[] {
  return mockTickets;
}

export function getTicketStats() {
  return {
    open: mockTickets.filter(t => t.status === 'OPEN').length,
    inProgress: mockTickets.filter(t => t.status === 'IN_PROGRESS').length,
    waitingOnCustomer: mockTickets.filter(t => t.status === 'WAITING_ON_CUSTOMER').length,
    resolved: mockTickets.filter(t => t.status === 'RESOLVED').length,
    closed: mockTickets.filter(t => t.status === 'CLOSED').length,
    urgent: mockTickets.filter(t => t.priority === 'URGENT').length,
    unassigned: mockTickets.filter(t => !t.assigneeId).length,
  };
}
