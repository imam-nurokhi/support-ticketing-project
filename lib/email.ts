import nodemailer from 'nodemailer';

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM_ADDRESS = process.env.SMTP_FROM ?? 'Resolv Support <no-reply@nexoratech.co>';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export function isMailConfigured() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return Boolean(host && user && pass);
}

export function getAppBaseUrl() {
  return (process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://support.nexoratech.co').replace(/\/$/, '');
}

export function getSupportNotificationEmail() {
  return (
    process.env.SUPPORT_NOTIFICATION_EMAIL?.trim() ||
    process.env.SMTP_FROM_EMAIL?.trim() ||
    process.env.SMTP_USER?.trim() ||
    ''
  );
}

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

async function _dispatch(to: string, subject: string, html: string) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email] SMTP not configured — skipping email to ${to}: ${subject}`);
    return;
  }
  try {
    await transporter.sendMail({ from: FROM_ADDRESS, to, subject, html });
  } catch (err) {
    console.error('[Email] Failed to send email:', err);
  }
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const recipients = Array.isArray(to) ? to.join(', ') : to;
  await _dispatch(recipients, subject, html);
}

function baseTemplate(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Resolv Support</title>
  <style>
    body { margin: 0; padding: 0; background: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); padding: 32px 40px; text-align: center; }
    .header h1 { margin: 0; color: #fff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; color: #bfdbfe; font-size: 13px; }
    .body { padding: 32px 40px; }
    .body h2 { margin: 0 0 8px; font-size: 18px; color: #0f172a; }
    .body p { margin: 0 0 16px; color: #475569; font-size: 14px; line-height: 1.6; }
    .ticket-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .ticket-card .label { font-size: 11px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .ticket-card .value { font-size: 14px; color: #1e293b; font-weight: 500; margin-bottom: 12px; }
    .ticket-card .value:last-child { margin-bottom: 0; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .badge-open { background: #dbeafe; color: #1d4ed8; }
    .badge-in-progress { background: #ede9fe; color: #6d28d9; }
    .badge-waiting { background: #fef3c7; color: #b45309; }
    .badge-resolved { background: #dcfce7; color: #15803d; }
    .badge-closed { background: #f1f5f9; color: #64748b; }
    .message-box { background: #f8fafc; border-left: 4px solid #7c3aed; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 16px 0; font-size: 14px; color: #334155; line-height: 1.7; white-space: pre-wrap; }
    .cta-button { display: block; text-align: center; background: #1d4ed8; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-size: 15px; font-weight: 600; margin: 24px 0; }
    .footer { border-top: 1px solid #e2e8f0; padding: 20px 40px; text-align: center; color: #94a3b8; font-size: 12px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎧 Resolv</h1>
      <p>Enterprise Helpdesk by Nexora</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      © 2025 Nexora Inc. &nbsp;·&nbsp; This is an automated message, please do not reply.
    </div>
  </div>
</body>
</html>`;
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'IN_PROGRESS': return 'badge-in-progress';
    case 'WAITING_ON_CUSTOMER': return 'badge-waiting';
    case 'RESOLVED': return 'badge-resolved';
    case 'CLOSED': return 'badge-closed';
    default: return 'badge-open';
  }
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export interface TicketEmailData {
  ticketId: string;
  ticketDbId: string;
  title: string;
  department: string;
  priority: string;
  status: string;
  authorName: string;
  authorEmail: string;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
}

export async function sendTicketCreatedEmails(data: TicketEmailData) {
  const ticketUrl = `${APP_URL}/help/tickets/${data.ticketDbId}`;
  const agentUrl = `${APP_URL}/agent/tickets/${data.ticketDbId}`;

  // Email to customer
  const customerHtml = baseTemplate(`
    <h2>Your ticket has been submitted! 🎉</h2>
    <p>Hi <strong>${data.authorName}</strong>, we've received your support request and our team will get back to you shortly.</p>
    <div class="ticket-card">
      <div class="label">Ticket ID</div>
      <div class="value">${data.ticketId}</div>
      <div class="label">Subject</div>
      <div class="value">${data.title}</div>
      <div class="label">Department</div>
      <div class="value">${data.department}</div>
      <div class="label">Priority</div>
      <div class="value">${data.priority}</div>
      <div class="label">Status</div>
      <div class="value"><span class="badge badge-open">Open</span></div>
    </div>
    <p>You can track the progress of your ticket and reply to our team anytime:</p>
    <a href="${ticketUrl}" class="cta-button">View My Ticket →</a>
    <p style="font-size:13px;color:#94a3b8;">Average response time is within 1 business day. We'll notify you by email when there's an update.</p>
  `);

  await _dispatch(data.authorEmail, `[${data.ticketId}] Ticket Received: ${data.title}`, customerHtml);

  // Email to assignee if assigned
  if (data.assigneeEmail && data.assigneeName) {
    const agentHtml = baseTemplate(`
      <h2>New ticket assigned to you 📋</h2>
      <p>Hi <strong>${data.assigneeName}</strong>, a new support ticket has been assigned to you.</p>
      <div class="ticket-card">
        <div class="label">Ticket ID</div>
        <div class="value">${data.ticketId}</div>
        <div class="label">Subject</div>
        <div class="value">${data.title}</div>
        <div class="label">Submitted by</div>
        <div class="value">${data.authorName} &lt;${data.authorEmail}&gt;</div>
        <div class="label">Department</div>
        <div class="value">${data.department}</div>
        <div class="label">Priority</div>
        <div class="value">${data.priority}</div>
      </div>
      <a href="${agentUrl}" class="cta-button">Open Ticket in Agent Portal →</a>
    `);
    await _dispatch(data.assigneeEmail, `[${data.ticketId}] New Ticket Assigned: ${data.title}`, agentHtml);
  }
}

export interface CommentEmailData {
  ticketId: string;
  ticketDbId: string;
  title: string;
  message: string;
  isInternalNote: boolean;
  authorName: string;
  authorRole: string;
  customerName: string;
  customerEmail: string;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
  attachmentCount?: number;
}

export async function sendCommentEmails(data: CommentEmailData) {
  if (data.isInternalNote) return; // Never email for internal notes

  const customerUrl = `${APP_URL}/help/tickets/${data.ticketDbId}`;
  const agentUrl = `${APP_URL}/agent/tickets/${data.ticketDbId}`;
  const attachmentNote = data.attachmentCount && data.attachmentCount > 0
    ? `<p><em>📎 ${data.attachmentCount} attachment${data.attachmentCount > 1 ? 's' : ''} included — view in the ticket portal.</em></p>`
    : '';

  const isAgentReply = data.authorRole !== 'CUSTOMER';

  if (isAgentReply) {
    // Agent replied → notify customer
    const customerHtml = baseTemplate(`
      <h2>New reply from our support team 💬</h2>
      <p>Hi <strong>${data.customerName}</strong>, <strong>${data.authorName}</strong> from our support team has responded to your ticket.</p>
      <div class="ticket-card">
        <div class="label">Ticket</div>
        <div class="value">${data.ticketId} — ${data.title}</div>
      </div>
      <div class="message-box">${data.message}</div>
      ${attachmentNote}
      <a href="${customerUrl}" class="cta-button">View & Reply →</a>
      <p style="font-size:13px;color:#94a3b8;">You can reply directly from the support portal. Please do not reply to this email.</p>
    `);
    await _dispatch(data.customerEmail, `[${data.ticketId}] Reply from Support: ${data.title}`, customerHtml);
  } else {
    // Customer replied → notify assignee if set
    if (data.assigneeEmail && data.assigneeName) {
      const agentHtml = baseTemplate(`
        <h2>Customer replied to ticket 🔔</h2>
        <p>Hi <strong>${data.assigneeName}</strong>, <strong>${data.customerName}</strong> has replied to the ticket assigned to you.</p>
        <div class="ticket-card">
          <div class="label">Ticket</div>
          <div class="value">${data.ticketId} — ${data.title}</div>
        </div>
        <div class="message-box">${data.message}</div>
        ${attachmentNote}
        <a href="${agentUrl}" class="cta-button">Open Ticket →</a>
      `);
      await _dispatch(data.assigneeEmail, `[${data.ticketId}] Customer Reply: ${data.title}`, agentHtml);
    }
  }
}

export interface StatusChangedEmailData {
  ticketId: string;
  ticketDbId: string;
  title: string;
  oldStatus: string;
  newStatus: string;
  changedByName: string;
  customerName: string;
  customerEmail: string;
  assigneeName?: string | null;
  assigneeEmail?: string | null;
}

export async function sendStatusChangedEmails(data: StatusChangedEmailData) {
  const customerUrl = `${APP_URL}/help/tickets/${data.ticketDbId}`;
  const agentUrl = `${APP_URL}/agent/tickets/${data.ticketDbId}`;
  const badgeClass = statusBadgeClass(data.newStatus);
  const newLabel = statusLabel(data.newStatus);
  const oldLabel = statusLabel(data.oldStatus);

  const isResolved = data.newStatus === 'RESOLVED' || data.newStatus === 'CLOSED';

  // Always notify the customer about status changes
  const customerHtml = baseTemplate(`
    <h2>${isResolved ? '✅ Your ticket has been resolved!' : '🔄 Ticket status updated'}</h2>
    <p>Hi <strong>${data.customerName}</strong>, the status of your support ticket has been updated by <strong>${data.changedByName}</strong>.</p>
    <div class="ticket-card">
      <div class="label">Ticket</div>
      <div class="value">${data.ticketId} — ${data.title}</div>
      <div class="label">Status Changed</div>
      <div class="value">${oldLabel} → <span class="badge ${badgeClass}">${newLabel}</span></div>
    </div>
    ${isResolved
      ? `<p>We hope your issue has been fully resolved! If you need further assistance, you can open a new ticket from the portal.</p>`
      : `<p>Our team is actively working on your request. You can check the full conversation thread anytime:</p>`
    }
    <a href="${customerUrl}" class="cta-button">View Ticket →</a>
  `);
  await _dispatch(data.customerEmail, `[${data.ticketId}] Status Updated: ${newLabel} — ${data.title}`, customerHtml);

  // Notify assignee too if they didn't make the change
  if (data.assigneeEmail && data.assigneeName) {
    const agentHtml = baseTemplate(`
      <h2>Ticket status changed 🔄</h2>
      <p>Hi <strong>${data.assigneeName}</strong>, the ticket assigned to you has a new status.</p>
      <div class="ticket-card">
        <div class="label">Ticket</div>
        <div class="value">${data.ticketId} — ${data.title}</div>
        <div class="label">Updated by</div>
        <div class="value">${data.changedByName}</div>
        <div class="label">New Status</div>
        <div class="value"><span class="badge ${badgeClass}">${newLabel}</span></div>
      </div>
      <a href="${agentUrl}" class="cta-button">Open Ticket →</a>
    `);
    await _dispatch(data.assigneeEmail, `[${data.ticketId}] Status → ${newLabel}: ${data.title}`, agentHtml);
  }
}

export interface AssignedEmailData {
  ticketId: string;
  ticketDbId: string;
  title: string;
  customerName: string;
  customerEmail: string;
  assigneeName: string;
  assigneeEmail: string;
  assignedByName: string;
}

export async function sendAssignedEmail(data: AssignedEmailData) {
  const agentUrl = `${APP_URL}/agent/tickets/${data.ticketDbId}`;

  const agentHtml = baseTemplate(`
    <h2>Ticket assigned to you 📬</h2>
    <p>Hi <strong>${data.assigneeName}</strong>, a support ticket has been assigned to you by <strong>${data.assignedByName}</strong>.</p>
    <div class="ticket-card">
      <div class="label">Ticket</div>
      <div class="value">${data.ticketId} — ${data.title}</div>
      <div class="label">Customer</div>
      <div class="value">${data.customerName} &lt;${data.customerEmail}&gt;</div>
    </div>
    <a href="${agentUrl}" class="cta-button">Open Ticket →</a>
  `);
  await _dispatch(data.assigneeEmail, `[${data.ticketId}] Ticket Assigned to You: ${data.title}`, agentHtml);
}
