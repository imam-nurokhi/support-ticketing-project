type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

function renderLayout(preheader: string, title: string, body: string) {
  return `
<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
    <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <div style="border-radius:24px;background:#ffffff;border:1px solid #e2e8f0;overflow:hidden;">
        <div style="padding:28px 32px;background:linear-gradient(135deg,#1d4ed8,#7c3aed);color:#ffffff;">
          <div style="font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;opacity:.85;">Support by Nexora</div>
          <h1 style="margin:12px 0 0;font-size:28px;line-height:1.2;">${title}</h1>
        </div>
        <div style="padding:28px 32px;font-size:15px;line-height:1.7;color:#334155;">
          ${body}
        </div>
      </div>
      <p style="margin:16px 4px 0;color:#64748b;font-size:12px;line-height:1.6;">
        Email ini dikirim otomatis oleh Support by Nexora. Mohon jangan membalas email ini jika tidak diperlukan.
      </p>
    </div>
  </body>
</html>`;
}

function renderButton(href: string, label: string) {
  return `
    <div style="margin:24px 0;">
      <a href="${href}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:700;">
        ${label}
      </a>
    </div>`;
}

export function buildWelcomeEmail({
  name,
  loginUrl,
}: {
  name: string;
  loginUrl: string;
}): EmailTemplate {
  const subject = 'Welcome to Support by Nexora';
  const html = renderLayout(
    'Akun support Anda sudah aktif.',
    'Welcome to Support by Nexora',
    `
      <p>Halo <strong>${name}</strong>,</p>
      <p>Akun Anda berhasil dibuat dan sudah siap digunakan untuk mengirim tiket, memantau progres, serta berkomunikasi dengan tim support.</p>
      <p>Silakan login menggunakan email dan password yang baru saja Anda daftarkan.</p>
      ${renderButton(loginUrl, 'Masuk ke Portal Support')}
      <p style="margin-top:24px;">Jika Anda merasa tidak pernah melakukan pendaftaran, segera hubungi tim support.</p>
    `,
  );
  const text = `Halo ${name}, akun Anda berhasil dibuat. Login ke ${loginUrl} untuk mulai menggunakan Support by Nexora.`;
  return { subject, html, text };
}

export function buildSupportSignupAlertEmail({
  name,
  email,
  loginUrl,
}: {
  name: string;
  email: string;
  loginUrl: string;
}): EmailTemplate {
  const subject = `New customer signup: ${name}`;
  const html = renderLayout(
    'Ada customer baru yang baru saja mendaftar.',
    'Customer Signup Notification',
    `
      <p>Customer baru telah melakukan pendaftaran pada portal support.</p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;">Nama</td><td style="padding:8px 0;"><strong>${name}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Email</td><td style="padding:8px 0;"><strong>${email}</strong></td></tr>
      </table>
      ${renderButton(loginUrl, 'Buka Portal Support')}
    `,
  );
  const text = `Customer baru mendaftar: ${name} <${email}>. Portal: ${loginUrl}`;
  return { subject, html, text };
}

export function buildPasswordResetEmail({
  name,
  resetUrl,
  expiresAt,
}: {
  name: string;
  resetUrl: string;
  expiresAt: string;
}): EmailTemplate {
  const subject = 'Reset your Support by Nexora password';
  const html = renderLayout(
    'Gunakan link ini untuk reset password Anda.',
    'Reset Password',
    `
      <p>Halo <strong>${name}</strong>,</p>
      <p>Kami menerima permintaan untuk mereset password akun Support by Nexora Anda.</p>
      ${renderButton(resetUrl, 'Reset Password')}
      <p>Link ini berlaku sampai <strong>${expiresAt}</strong>.</p>
      <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
    `,
  );
  const text = `Halo ${name}, reset password Anda melalui link berikut: ${resetUrl}. Berlaku sampai ${expiresAt}.`;
  return { subject, html, text };
}

export function buildCustomerTicketCreatedEmail({
  name,
  ticketId,
  title,
  department,
  priority,
  ticketUrl,
}: {
  name: string;
  ticketId: string;
  title: string;
  department: string;
  priority: string;
  ticketUrl: string;
}): EmailTemplate {
  const subject = `Ticket received: ${ticketId}`;
  const html = renderLayout(
    'Tiket Anda sudah berhasil diterima.',
    'Ticket Created Successfully',
    `
      <p>Halo <strong>${name}</strong>,</p>
      <p>Tiket Anda sudah berhasil diterima oleh tim support.</p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;">Ticket ID</td><td style="padding:8px 0;"><strong>${ticketId}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Judul</td><td style="padding:8px 0;"><strong>${title}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Kategori</td><td style="padding:8px 0;"><strong>${department}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Prioritas</td><td style="padding:8px 0;"><strong>${priority}</strong></td></tr>
      </table>
      ${renderButton(ticketUrl, 'Lihat Detail Ticket')}
      <p>Anda akan menerima update berikutnya melalui portal support dan email notifikasi.</p>
    `,
  );
  const text = `Halo ${name}, tiket ${ticketId} (${title}) sudah diterima. Lihat detail: ${ticketUrl}`;
  return { subject, html, text };
}

export function buildSupportTicketCreatedEmail({
  ticketId,
  title,
  department,
  priority,
  customerName,
  customerEmail,
  ticketUrl,
}: {
  ticketId: string;
  title: string;
  department: string;
  priority: string;
  customerName: string;
  customerEmail: string;
  ticketUrl: string;
}): EmailTemplate {
  const subject = `New support ticket: ${ticketId}`;
  const html = renderLayout(
    'Ada tiket baru yang masuk ke portal support.',
    'New Ticket Notification',
    `
      <p>Tiket baru masuk dan perlu ditinjau oleh tim support.</p>
      <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;">Ticket ID</td><td style="padding:8px 0;"><strong>${ticketId}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Judul</td><td style="padding:8px 0;"><strong>${title}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Kategori</td><td style="padding:8px 0;"><strong>${department}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Prioritas</td><td style="padding:8px 0;"><strong>${priority}</strong></td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Customer</td><td style="padding:8px 0;"><strong>${customerName}</strong> (${customerEmail})</td></tr>
      </table>
      ${renderButton(ticketUrl, 'Buka Ticket di Portal')}
    `,
  );
  const text = `Tiket baru ${ticketId} dari ${customerName} <${customerEmail}>. Buka: ${ticketUrl}`;
  return { subject, html, text };
}
