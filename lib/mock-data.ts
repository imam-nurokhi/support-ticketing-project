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

// --- Users (sourced from real helpdesk data) ---
export const mockUsers: User[] = [
  // Customers
  { id: 'user-29', email: 'zidky.yacob@cbqaglobal.com', name: 'Zidky Yacob', role: 'CUSTOMER', createdAt: new Date('2025-01-15') },
  { id: 'user-33', email: 'yeremia.krisna@cbqaglobal.com', name: 'Yeremia Krisna', role: 'CUSTOMER', createdAt: new Date('2025-02-01') },
  { id: 'user-67', email: 'shalik.imansyah@cbqaglobal.com', name: 'Shalik Imansyah', role: 'CUSTOMER', createdAt: new Date('2025-03-01') },
  { id: 'user-20', email: 'desty.sari@cbqaglobal.com', name: 'Desty Sari', role: 'CUSTOMER', createdAt: new Date('2025-01-20') },
  { id: 'user-69', email: 'sunny.sulien@cbqaglobal.com', name: 'Sunny Sulien', role: 'CUSTOMER', createdAt: new Date('2025-04-10') },
  // Support Agents
  { id: 'user-23', email: 'ahmad.fauzan@nexora.com', name: 'Ahmad Fauzan', role: 'SUPPORT_AGENT', createdAt: new Date('2023-06-01') },
  { id: 'user-24', email: 'reza.kurniawan@nexora.com', name: 'Reza Kurniawan', role: 'SUPPORT_AGENT', createdAt: new Date('2023-07-15') },
  { id: 'user-59', email: 'frisy.sari@cbqaglobal.com', name: 'Frisy Sari', role: 'SUPPORT_AGENT', createdAt: new Date('2023-08-01') },
  { id: 'user-65', email: 'shifa.maharani@cbqaglobal.com', name: 'Shifa Maharani', role: 'SUPPORT_AGENT', createdAt: new Date('2023-09-01') },
  // Admin
  { id: 'user-6', email: 'imam.nurokhi@nexora.com', name: 'Imam Nurokhi', role: 'ADMIN', createdAt: new Date('2023-01-01') },
];

const u = (id: string): User => mockUsers.find(m => m.id === id)!;

export const CURRENT_CUSTOMER = u('user-29');  // Zidky Yacob
export const CURRENT_AGENT = u('user-23');     // Ahmad Fauzan

// --- Tickets (sourced from real helpdesk data) ---
export const mockTickets: Ticket[] = [
  {
    id: 'ticket-852',
    ticketId: 'NXR-0852',
    title: '[URGENT] Error pada penilaian course di LMS',
    description: 'Terdapat error saat melakukan penilaian course di platform LMS. Proses penilaian tidak dapat diselesaikan dan menampilkan pesan error. Mohon segera ditangani karena menghambat kegiatan training.',
    status: 'CLOSED',
    priority: 'URGENT',
    department: 'LMS',
    authorId: 'user-29',
    assigneeId: 'user-23',
    createdAt: new Date('2026-03-30T09:03:06Z'),
    updatedAt: new Date('2026-03-30T15:41:19Z'),
    author: u('user-29'),
    assignee: u('user-23'),
    comments: [
      {
        id: 'c852-1', ticketId: 'ticket-852', authorId: 'user-29',
        message: 'Terdapat error saat melakukan penilaian course di platform LMS. Proses penilaian tidak dapat diselesaikan dan menampilkan pesan error. Mohon segera ditangani karena menghambat kegiatan training.',
        isInternalNote: false, createdAt: new Date('2026-03-30T09:03:06Z'), author: u('user-29'),
      },
      {
        id: 'c852-2', ticketId: 'ticket-852', authorId: 'user-23',
        message: 'Dear Kak Rafif, sudah kami cek dan temukan root cause-nya. Akan segera diperbaiki.',
        isInternalNote: false, createdAt: new Date('2026-03-30T11:00:00Z'), author: u('user-23'),
      },
      {
        id: 'c852-3', ticketId: 'ticket-852', authorId: 'user-29',
        message: 'Dear Kak Rafif, Solved. Thanks. Zidky',
        isInternalNote: false, createdAt: new Date('2026-03-30T15:41:11Z'), author: u('user-29'),
      },
    ],
    auditLogs: [
      { id: 'a852-1', ticketId: 'ticket-852', userId: 'user-23', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date('2026-03-30T09:30:00Z'), user: u('user-23') },
      { id: 'a852-2', ticketId: 'ticket-852', userId: 'user-23', action: 'STATUS_CHANGED', oldValue: 'IN_PROGRESS', newValue: 'CLOSED', createdAt: new Date('2026-03-30T15:41:19Z'), user: u('user-23') },
    ],
  },
  {
    id: 'ticket-853',
    ticketId: 'NXR-0853',
    title: 'Create Project Extension Audit Client Existing ISCC EU & ISCC PLUS - PT Arkad Niaga Indonesia',
    description: 'Dear IT Team, Please kindly help me. I have Addendum Contract Extension Audit for ISCC EU & ISCC PLUS Revision of Output Material and ISCC PLUS Additional of New Output Material for PT Arkad Niaga Indonesia. Mohon dibuatkan project extension-nya di AUDITQ.',
    status: 'OPEN',
    priority: 'HIGH',
    department: 'AUDITQ',
    authorId: 'user-33',
    assigneeId: null,
    createdAt: new Date('2026-03-30T14:42:03Z'),
    updatedAt: new Date('2026-03-30T14:42:03Z'),
    author: u('user-33'),
    assignee: null,
    comments: [
      {
        id: 'c853-1', ticketId: 'ticket-853', authorId: 'user-33',
        message: 'Dear IT Team, Please kindly help me. I have Addendum Contract Extension Audit for ISCC EU & ISCC PLUS Revision of Output Material and ISCC PLUS Additional of New Output Material for PT Arkad Niaga Indonesia. Mohon dibuatkan project extension-nya di AUDITQ.',
        isInternalNote: false, createdAt: new Date('2026-03-30T14:42:03Z'), author: u('user-33'),
      },
    ],
    auditLogs: [],
  },
  {
    id: 'ticket-851',
    ticketId: 'NXR-0851',
    title: 'Certification tab and nomenclature change',
    description: 'Bismillah, Dear Nexora Brothers. Mohon ubah nama pada taskbar "Training Program" menjadi "CBQA GLOBAL Academy Program" dan "My Membership" diganti jadi "My Certification", serta isi dalamnya mirip My Training.',
    status: 'OPEN',
    priority: 'MEDIUM',
    department: 'LMS',
    authorId: 'user-29',
    assigneeId: 'user-24',
    createdAt: new Date('2026-03-27T09:47:15Z'),
    updatedAt: new Date('2026-03-30T06:24:22Z'),
    author: u('user-29'),
    assignee: u('user-24'),
    comments: [
      {
        id: 'c851-1', ticketId: 'ticket-851', authorId: 'user-29',
        message: 'Bismillah, Dear Nexora Brothers. Mohon ubah nama pada taskbar "Training Program" menjadi "CBQA GLOBAL Academy Program" dan "My Membership" diganti jadi "My Certification", serta isi dalamnya mirip My Training.',
        isInternalNote: false, createdAt: new Date('2026-03-27T09:47:15Z'), author: u('user-29'),
      },
    ],
    auditLogs: [
      { id: 'a851-1', ticketId: 'ticket-851', userId: 'user-6', action: 'ASSIGNED', oldValue: null, newValue: 'Reza Kurniawan', createdAt: new Date('2026-03-27T10:00:00Z'), user: u('user-6') },
    ],
  },
  {
    id: 'ticket-849',
    ticketId: 'NXR-0849',
    title: 'Input no NPWP',
    description: 'Halo tim IT, mohon bantuannya. Saya tidak bisa menginput nomor NPWP di aplikasi CRM. Setiap kali saya masukkan nomor NPWP dan klik simpan, muncul pesan error validasi meskipun format NPWP sudah benar (16 digit).',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    department: 'CRM',
    authorId: 'user-67',
    assigneeId: 'user-23',
    createdAt: new Date('2026-03-27T08:05:12Z'),
    updatedAt: new Date('2026-03-30T03:30:12Z'),
    author: u('user-67'),
    assignee: u('user-23'),
    comments: [
      {
        id: 'c849-1', ticketId: 'ticket-849', authorId: 'user-67',
        message: 'Halo tim IT, mohon bantuannya. Saya tidak bisa menginput nomor NPWP di aplikasi CRM. Setiap kali saya masukkan nomor NPWP dan klik simpan, muncul pesan error validasi meskipun format NPWP sudah benar (16 digit).',
        isInternalNote: false, createdAt: new Date('2026-03-27T08:05:12Z'), author: u('user-67'),
      },
      {
        id: 'c849-2', ticketId: 'ticket-849', authorId: 'user-23',
        message: 'Dear Mas Shalik, sedang kami investigasi. Mohon berikan screenshot error yang muncul ya.',
        isInternalNote: false, createdAt: new Date('2026-03-27T09:00:00Z'), author: u('user-23'),
      },
      {
        id: 'c849-3', ticketId: 'ticket-849', authorId: 'user-23',
        message: 'Field NPWP di CRM menggunakan validasi regex lama yang tidak support format NPWP baru 16 digit. Perlu update validasi di backend.',
        isInternalNote: true, createdAt: new Date('2026-03-27T09:05:00Z'), author: u('user-23'),
      },
      {
        id: 'c849-4', ticketId: 'ticket-849', authorId: 'user-23',
        message: 'Dear Mas Shalik, Boleh dicoba lagi ya mas. Terima Kasih',
        isInternalNote: false, createdAt: new Date('2026-03-30T03:30:12Z'), author: u('user-23'),
      },
    ],
    auditLogs: [
      { id: 'a849-1', ticketId: 'ticket-849', userId: 'user-23', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date('2026-03-27T09:00:00Z'), user: u('user-23') },
    ],
  },
  {
    id: 'ticket-848',
    ticketId: 'NXR-0848',
    title: 'Akun Rizky Amanda',
    description: 'Halo, mohon bantu reset/aktifkan akun Rizky Amanda. Akun tersebut tidak dapat digunakan untuk login ke sistem ONE ALPHA. Sudah dicoba beberapa kali tetapi tetap gagal.',
    status: 'IN_PROGRESS',
    priority: 'MEDIUM',
    department: 'General',
    authorId: 'user-65',
    assigneeId: 'user-23',
    createdAt: new Date('2026-03-27T04:25:24Z'),
    updatedAt: new Date('2026-03-30T02:30:06Z'),
    author: u('user-65'),
    assignee: u('user-23'),
    comments: [
      {
        id: 'c848-1', ticketId: 'ticket-848', authorId: 'user-65',
        message: 'Halo, mohon bantu reset/aktifkan akun Rizky Amanda. Akun tersebut tidak dapat digunakan untuk login ke sistem ONE ALPHA. Sudah dicoba beberapa kali tetapi tetap gagal.',
        isInternalNote: false, createdAt: new Date('2026-03-27T04:25:24Z'), author: u('user-65'),
      },
      {
        id: 'c848-2', ticketId: 'ticket-848', authorId: 'user-23',
        message: 'Dear Mba Aya, boleh cek lagi ya. Thank you',
        isInternalNote: false, createdAt: new Date('2026-03-27T08:08:09Z'), author: u('user-23'),
      },
    ],
    auditLogs: [
      { id: 'a848-1', ticketId: 'ticket-848', userId: 'user-23', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date('2026-03-27T05:00:00Z'), user: u('user-23') },
    ],
  },
  {
    id: 'ticket-850',
    ticketId: 'NXR-0850',
    title: 'Public Training Schedule July - December 2026',
    description: 'Bismillah, Dear Marketing Brothers and Sisters. Mohon dibuatkan public training schedule periode Juli s.d. Desember 2026. Kami harap bisa tayang di website pada tanggal 11 Mei 2026. Terima kasih. Jazakumullahu Khairan.',
    status: 'OPEN',
    priority: 'MEDIUM',
    department: 'Marketing',
    authorId: 'user-29',
    assigneeId: 'user-59',
    createdAt: new Date('2026-03-27T09:39:40Z'),
    updatedAt: new Date('2026-03-27T09:40:34Z'),
    author: u('user-29'),
    assignee: u('user-59'),
    comments: [
      {
        id: 'c850-1', ticketId: 'ticket-850', authorId: 'user-29',
        message: 'Bismillah, Dear Marketing Brothers and Sisters. Mohon dibuatkan public training schedule periode Juli s.d. Desember 2026. Kami harap bisa tayang di website pada tanggal 11 Mei 2026. Terima kasih. Jazakumullahu Khairan.',
        isInternalNote: false, createdAt: new Date('2026-03-27T09:39:40Z'), author: u('user-29'),
      },
    ],
    auditLogs: [
      { id: 'a850-1', ticketId: 'ticket-850', userId: 'user-6', action: 'ASSIGNED', oldValue: null, newValue: 'Frisy Sari', createdAt: new Date('2026-03-27T09:40:34Z'), user: u('user-6') },
    ],
  },
  {
    id: 'ticket-827',
    ticketId: 'NXR-0827',
    title: 'Request Input Prize and service in CRM',
    description: 'Dear IT Team, mohon dibantu untuk menginput data Prize and Service pada modul CRM. Data sudah kami siapkan dan sudah dikirimkan ke email IT. Mohon segera diproses karena dibutuhkan untuk operasional.',
    status: 'OPEN',
    priority: 'HIGH',
    department: 'CRM',
    authorId: 'user-67',
    assigneeId: 'user-23',
    createdAt: new Date('2026-03-09T16:39:23Z'),
    updatedAt: new Date('2026-03-27T08:02:54Z'),
    author: u('user-67'),
    assignee: u('user-23'),
    comments: [
      {
        id: 'c827-1', ticketId: 'ticket-827', authorId: 'user-67',
        message: 'Dear IT Team, mohon dibantu untuk menginput data Prize and Service pada modul CRM. Data sudah kami siapkan dan sudah dikirimkan ke email IT. Mohon segera diproses karena dibutuhkan untuk operasional.',
        isInternalNote: false, createdAt: new Date('2026-03-09T16:39:23Z'), author: u('user-67'),
      },
      {
        id: 'c827-2', ticketId: 'ticket-827', authorId: 'user-23',
        message: 'Dear Mas Shalik, data sudah diterima. Sedang dalam proses input ya.',
        isInternalNote: false, createdAt: new Date('2026-03-10T08:00:00Z'), author: u('user-23'),
      },
      {
        id: 'c827-3', ticketId: 'ticket-827', authorId: 'user-67',
        message: 'Dear Team, baik terima kasih.',
        isInternalNote: false, createdAt: new Date('2026-03-27T08:02:54Z'), author: u('user-67'),
      },
    ],
    auditLogs: [],
  },
  {
    id: 'ticket-847',
    ticketId: 'NXR-0847',
    title: 'Marketing Tools - Blast Email Template',
    description: "Mohon dapat dibantu buatkan Standard Blasting Template untuk Sustainability. Ini contoh dari saya dan minta tolong disesuaikan. Dear Sir/Madam, I hope you are doing well. Across global supply chains, sustainability is no longer optional — it is essential. We at CBQA Global are here to support your organization's journey.",
    status: 'OPEN',
    priority: 'MEDIUM',
    department: 'Marketing',
    authorId: 'user-33',
    assigneeId: 'user-59',
    createdAt: new Date('2026-03-27T02:22:10Z'),
    updatedAt: new Date('2026-03-27T02:23:04Z'),
    author: u('user-33'),
    assignee: u('user-59'),
    comments: [
      {
        id: 'c847-1', ticketId: 'ticket-847', authorId: 'user-33',
        message: "Mohon dapat dibantu buatkan Standard Blasting Template untuk Sustainability. Ini contoh dari saya dan minta tolong disesuaikan. Dear Sir/Madam, I hope you are doing well. Across global supply chains, sustainability is no longer optional — it is essential. We at CBQA Global are here to support your organization's journey.",
        isInternalNote: false, createdAt: new Date('2026-03-27T02:22:10Z'), author: u('user-33'),
      },
    ],
    auditLogs: [
      { id: 'a847-1', ticketId: 'ticket-847', userId: 'user-6', action: 'ASSIGNED', oldValue: null, newValue: 'Frisy Sari', createdAt: new Date('2026-03-27T02:23:04Z'), user: u('user-6') },
    ],
  },
  {
    id: 'ticket-846',
    ticketId: 'NXR-0846',
    title: 'Merubah penulisan CIPDPO training pada features',
    description: 'Dear IT Team, mohon dibantu untuk merubah penulisan "CIPDPO" pada halaman features training menjadi penulisan yang benar sesuai standar yang berlaku.',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    department: 'Website',
    authorId: 'user-59',
    assigneeId: 'user-23',
    createdAt: new Date('2026-03-26T06:45:56Z'),
    updatedAt: new Date('2026-03-26T08:14:24Z'),
    author: u('user-59'),
    assignee: u('user-23'),
    comments: [
      {
        id: 'c846-1', ticketId: 'ticket-846', authorId: 'user-59',
        message: 'Dear IT Team, mohon dibantu untuk merubah penulisan "CIPDPO" pada halaman features training menjadi penulisan yang benar sesuai standar yang berlaku.',
        isInternalNote: false, createdAt: new Date('2026-03-26T06:45:56Z'), author: u('user-59'),
      },
      {
        id: 'c846-2', ticketId: 'ticket-846', authorId: 'user-23',
        message: 'Dear Ci Frissy, Done ya ci. Thank you',
        isInternalNote: false, createdAt: new Date('2026-03-26T08:14:24Z'), author: u('user-23'),
      },
    ],
    auditLogs: [
      { id: 'a846-1', ticketId: 'ticket-846', userId: 'user-23', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date('2026-03-26T07:00:00Z'), user: u('user-23') },
    ],
  },
  {
    id: 'ticket-844',
    ticketId: 'NXR-0844',
    title: 'Merevisi tulisan CIPDPO menjadi DPO di Page website training',
    description: 'Mohon dibantu merevisi penulisan "CIPDPO" menjadi "DPO" pada halaman website training. Perubahan ini perlu dilakukan di semua halaman yang menampilkan nama program tersebut.',
    status: 'IN_PROGRESS',
    priority: 'LOW',
    department: 'Website',
    authorId: 'user-59',
    assigneeId: 'user-23',
    createdAt: new Date('2026-03-20T08:18:29Z'),
    updatedAt: new Date('2026-03-25T12:45:37Z'),
    author: u('user-59'),
    assignee: u('user-23'),
    comments: [
      {
        id: 'c844-1', ticketId: 'ticket-844', authorId: 'user-59',
        message: 'Mohon dibantu merevisi penulisan "CIPDPO" menjadi "DPO" pada halaman website training. Perubahan ini perlu dilakukan di semua halaman yang menampilkan nama program tersebut.',
        isInternalNote: false, createdAt: new Date('2026-03-20T08:18:29Z'), author: u('user-59'),
      },
      {
        id: 'c844-2', ticketId: 'ticket-844', authorId: 'user-23',
        message: 'Dear Ci Frissy, Boleh di cek kembali ya. Thank you',
        isInternalNote: false, createdAt: new Date('2026-03-25T12:45:37Z'), author: u('user-23'),
      },
    ],
    auditLogs: [
      { id: 'a844-1', ticketId: 'ticket-844', userId: 'user-23', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date('2026-03-20T09:00:00Z'), user: u('user-23') },
    ],
  },
  {
    id: 'ticket-845',
    ticketId: 'NXR-0845',
    title: 'Input brosur training kedalam button download full training calendar',
    description: 'Dear IT Team, mohon dibantu untuk menginput brosur training ke dalam button "Download Full Training Calendar" yang ada di website. File brosur sudah saya lampirkan.',
    status: 'CLOSED',
    priority: 'LOW',
    department: 'Website',
    authorId: 'user-59',
    assigneeId: 'user-23',
    createdAt: new Date('2026-03-23T04:36:54Z'),
    updatedAt: new Date('2026-03-25T12:03:16Z'),
    author: u('user-59'),
    assignee: u('user-23'),
    comments: [
      {
        id: 'c845-1', ticketId: 'ticket-845', authorId: 'user-59',
        message: 'Dear IT Team, mohon dibantu untuk menginput brosur training ke dalam button "Download Full Training Calendar" yang ada di website. File brosur sudah saya lampirkan.',
        isInternalNote: false, createdAt: new Date('2026-03-23T04:36:54Z'), author: u('user-59'),
      },
      {
        id: 'c845-2', ticketId: 'ticket-845', authorId: 'user-23',
        message: 'Dear Ci Frissy, Done ya ci. Thank you',
        isInternalNote: false, createdAt: new Date('2026-03-25T12:03:16Z'), author: u('user-23'),
      },
    ],
    auditLogs: [
      { id: 'a845-1', ticketId: 'ticket-845', userId: 'user-23', action: 'STATUS_CHANGED', oldValue: 'IN_PROGRESS', newValue: 'CLOSED', createdAt: new Date('2026-03-25T12:03:16Z'), user: u('user-23') },
    ],
  },
  {
    id: 'ticket-843',
    ticketId: 'NXR-0843',
    title: 'Penambahan Standard ISO 37001:2025',
    description: 'Dear IT Team, mohon dibantu untuk menambahkan Standard ISO 37001:2025 (Anti-bribery management systems) ke dalam sistem training service kami. Data lengkap sudah saya siapkan.',
    status: 'CLOSED',
    priority: 'MEDIUM',
    department: 'Training Service',
    authorId: 'user-20',
    assigneeId: 'user-6',
    createdAt: new Date('2026-03-20T07:49:10Z'),
    updatedAt: new Date('2026-03-23T02:48:41Z'),
    author: u('user-20'),
    assignee: u('user-6'),
    comments: [
      {
        id: 'c843-1', ticketId: 'ticket-843', authorId: 'user-20',
        message: 'Dear IT Team, mohon dibantu untuk menambahkan Standard ISO 37001:2025 (Anti-bribery management systems) ke dalam sistem training service kami. Data lengkap sudah saya siapkan.',
        isInternalNote: false, createdAt: new Date('2026-03-20T07:49:10Z'), author: u('user-20'),
      },
      {
        id: 'c843-2', ticketId: 'ticket-843', authorId: 'user-6',
        message: 'Dear Mba Desty, sudah kami tambahkan Standard ISO 37001:2025 ke dalam sistem. Silakan dicek ya.',
        isInternalNote: false, createdAt: new Date('2026-03-22T10:00:00Z'), author: u('user-6'),
      },
      {
        id: 'c843-3', ticketId: 'ticket-843', authorId: 'user-20',
        message: 'Terima kasih Imam.',
        isInternalNote: false, createdAt: new Date('2026-03-23T02:48:34Z'), author: u('user-20'),
      },
    ],
    auditLogs: [
      { id: 'a843-1', ticketId: 'ticket-843', userId: 'user-6', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date('2026-03-20T09:00:00Z'), user: u('user-6') },
      { id: 'a843-2', ticketId: 'ticket-843', userId: 'user-6', action: 'STATUS_CHANGED', oldValue: 'IN_PROGRESS', newValue: 'CLOSED', createdAt: new Date('2026-03-23T02:48:41Z'), user: u('user-6') },
    ],
  },
  {
    id: 'ticket-831',
    ticketId: 'NXR-0831',
    title: 'Tidak bisa masuk ke website CBQA Global',
    description: 'Halo, saya tidak bisa mengakses website CBQA Global (cbqaglobal.com) dari kantor. Selalu muncul error koneksi atau halaman tidak dapat dijangkau. Dari perangkat lain dan jaringan berbeda bisa diakses.',
    status: 'CLOSED',
    priority: 'HIGH',
    department: 'Website',
    authorId: 'user-59',
    assigneeId: 'user-23',
    createdAt: new Date('2026-03-12T01:39:39Z'),
    updatedAt: new Date('2026-03-20T08:21:01Z'),
    author: u('user-59'),
    assignee: u('user-23'),
    comments: [
      {
        id: 'c831-1', ticketId: 'ticket-831', authorId: 'user-59',
        message: 'Halo, saya tidak bisa mengakses website CBQA Global (cbqaglobal.com) dari kantor. Selalu muncul error koneksi atau halaman tidak dapat dijangkau. Dari perangkat lain dan jaringan berbeda bisa diakses.',
        isInternalNote: false, createdAt: new Date('2026-03-12T01:39:39Z'), author: u('user-59'),
      },
      {
        id: 'c831-2', ticketId: 'ticket-831', authorId: 'user-23',
        message: 'Dear Ci Frissy, Mohon ditunggu ya ci, lagi di follow up ke provider kenapa ga bisa di buka. Sementara kalau mau buka pakai internet pribadi dulu ya ci. Thank you',
        isInternalNote: false, createdAt: new Date('2026-03-12T01:40:44Z'), author: u('user-23'),
      },
    ],
    auditLogs: [
      { id: 'a831-1', ticketId: 'ticket-831', userId: 'user-23', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date('2026-03-12T02:00:00Z'), user: u('user-23') },
      { id: 'a831-2', ticketId: 'ticket-831', userId: 'user-59', action: 'STATUS_CHANGED', oldValue: 'IN_PROGRESS', newValue: 'CLOSED', createdAt: new Date('2026-03-20T08:21:01Z'), user: u('user-59') },
    ],
  },
  {
    id: 'ticket-842',
    ticketId: 'NXR-0842',
    title: 'Request Design Syllabus ESG',
    description: 'Dear Team, mohon dibantu untuk membuat design syllabus untuk program training ESG (Environmental, Social, and Governance). Syllabus ini akan digunakan untuk promosi dan pendaftaran peserta.',
    status: 'CLOSED',
    priority: 'MEDIUM',
    department: 'Marketing',
    authorId: 'user-20',
    assigneeId: 'user-65',
    createdAt: new Date('2026-03-18T06:27:10Z'),
    updatedAt: new Date('2026-03-20T07:49:25Z'),
    author: u('user-20'),
    assignee: u('user-65'),
    comments: [
      {
        id: 'c842-1', ticketId: 'ticket-842', authorId: 'user-20',
        message: 'Dear Team, mohon dibantu untuk membuat design syllabus untuk program training ESG. Syllabus ini akan digunakan untuk promosi dan pendaftaran peserta.',
        isInternalNote: false, createdAt: new Date('2026-03-18T06:27:10Z'), author: u('user-20'),
      },
      {
        id: 'c842-2', ticketId: 'ticket-842', authorId: 'user-59',
        message: 'Sedang tahap review.',
        isInternalNote: false, createdAt: new Date('2026-03-18T08:12:54Z'), author: u('user-59'),
      },
    ],
    auditLogs: [
      { id: 'a842-1', ticketId: 'ticket-842', userId: 'user-65', action: 'STATUS_CHANGED', oldValue: 'OPEN', newValue: 'IN_PROGRESS', createdAt: new Date('2026-03-18T07:00:00Z'), user: u('user-65') },
      { id: 'a842-2', ticketId: 'ticket-842', userId: 'user-20', action: 'STATUS_CHANGED', oldValue: 'IN_PROGRESS', newValue: 'CLOSED', createdAt: new Date('2026-03-20T07:49:25Z'), user: u('user-20') },
    ],
  },
  {
    id: 'ticket-829',
    ticketId: 'NXR-0829',
    title: 'Brosur untuk training KAI ISO 22163',
    description: 'Dear Team, mohon dibuatkan brosur untuk program training KAI ISO 22163 (Railway application – Quality management system). Brosur ini diperlukan untuk keperluan marketing dan pendaftaran peserta.',
    status: 'CLOSED',
    priority: 'MEDIUM',
    department: 'Marketing',
    authorId: 'user-69',
    assigneeId: 'user-65',
    createdAt: new Date('2026-03-11T04:02:43Z'),
    updatedAt: new Date('2026-03-18T08:34:48Z'),
    author: u('user-69'),
    assignee: u('user-65'),
    comments: [
      {
        id: 'c829-1', ticketId: 'ticket-829', authorId: 'user-69',
        message: 'Dear Team, mohon dibuatkan brosur untuk program training KAI ISO 22163 (Railway application – Quality management system). Brosur ini diperlukan untuk keperluan marketing dan pendaftaran peserta.',
        isInternalNote: false, createdAt: new Date('2026-03-11T04:02:43Z'), author: u('user-69'),
      },
      {
        id: 'c829-2', ticketId: 'ticket-829', authorId: 'user-59',
        message: 'Done',
        isInternalNote: false, createdAt: new Date('2026-03-18T08:33:50Z'), author: u('user-59'),
      },
    ],
    auditLogs: [
      { id: 'a829-1', ticketId: 'ticket-829', userId: 'user-65', action: 'STATUS_CHANGED', oldValue: 'IN_PROGRESS', newValue: 'CLOSED', createdAt: new Date('2026-03-18T08:33:50Z'), user: u('user-65') },
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
