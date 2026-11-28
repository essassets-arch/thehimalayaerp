const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateHtmlReport() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Himalaya ERP - Complete Production Security Audit Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 16mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page);
        font-family: 'Inter', sans-serif;
        font-size: 8pt;
        color: #94a3b8;
      }
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.5;
      font-size: 9.5pt;
      margin: 0;
      padding: 0;
    }

    .page {
      page-break-after: always;
      position: relative;
      padding-top: 5px;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* Cover Page */
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      min-height: 255mm;
      padding: 24mm 18mm 20mm 18mm;
      background: linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%);
      color: #ffffff;
      border-radius: 4px;
      page-break-after: always;
    }

    .cover-badge-row {
      display: flex;
      gap: 10px;
    }

    .cover-badge {
      display: inline-block;
      padding: 5px 14px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid #ef4444;
      color: #fca5a5;
      font-weight: 700;
      font-size: 8pt;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      border-radius: 4px;
    }

    .cover-badge.safe {
      background: rgba(16, 185, 129, 0.2);
      border: 1px solid #10b981;
      color: #6ee7b7;
    }

    .cover-title-group {
      margin-top: 30px;
    }

    .cover-title {
      font-size: 26pt;
      font-weight: 900;
      line-height: 1.15;
      color: #ffffff;
      margin: 0 0 12px 0;
      letter-spacing: -0.5px;
    }

    .cover-title span {
      color: #38bdf8;
    }

    .cover-subtitle {
      font-size: 13pt;
      font-weight: 400;
      color: #94a3b8;
      line-height: 1.4;
      margin: 0 0 25px 0;
    }

    .cover-meta-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
      font-size: 9pt;
      margin-bottom: 25px;
    }

    .cover-meta-item {
      display: flex;
      flex-direction: column;
    }

    .cover-meta-item span:first-child {
      color: #64748b;
      font-size: 7.5pt;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
      margin-bottom: 2px;
    }

    .cover-meta-item span:last-child {
      color: #e2e8f0;
      font-weight: 600;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
    }

    .cover-metrics {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 6px;
    }

    .metric-box {
      text-align: left;
    }

    .metric-val {
      font-size: 20pt;
      font-weight: 900;
      color: #ef4444;
      line-height: 1;
    }

    .metric-val.high { color: #f97316; }
    .metric-val.medium { color: #f59e0b; }
    .metric-val.success { color: #10b981; }

    .metric-label {
      font-size: 7pt;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 5px;
      font-weight: 600;
    }

    .cover-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.12);
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 8pt;
      color: #94a3b8;
    }

    /* Headings */
    h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
      letter-spacing: -0.3px;
    }

    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: #1e293b;
      margin-top: 16px;
      margin-bottom: 8px;
      border-left: 4px solid #0284c7;
      padding-left: 8px;
    }

    h3 {
      font-size: 10pt;
      font-weight: 700;
      color: #334155;
      margin-top: 10px;
      margin-bottom: 4px;
    }

    p {
      margin: 0 0 8px 0;
      color: #334155;
      font-size: 9pt;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 16px 0;
      font-size: 8.5pt;
    }

    th {
      background-color: #0f172a;
      color: #ffffff;
      text-align: left;
      padding: 6px 10px;
      font-weight: 600;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid #0f172a;
    }

    td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    /* Cards */
    .vuln-card {
      border: 1px solid #cbd5e1;
      border-radius: 5px;
      margin-bottom: 14px;
      background: #ffffff;
      page-break-inside: avoid;
      overflow: hidden;
    }

    .vuln-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }

    .vuln-header.critical {
      border-left: 5px solid #dc2626;
      background: #fef2f2;
    }

    .vuln-header.high {
      border-left: 5px solid #ea580c;
      background: #fff7ed;
    }

    .vuln-header.medium {
      border-left: 5px solid #d97706;
      background: #fffbeb;
    }

    .vuln-header.low {
      border-left: 5px solid #2563eb;
      background: #eff6ff;
    }

    .vuln-title {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
    }

    .badge {
      display: inline-block;
      padding: 2px 7px;
      font-size: 7pt;
      font-weight: 700;
      border-radius: 3px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .badge.critical { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
    .badge.high { background: #ffedd5; color: #9a3412; border: 1px solid #fb923c; }
    .badge.medium { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
    .badge.low { background: #dbeafe; color: #1e40af; border: 1px solid #60a5fa; }
    .badge.info { background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
    .badge.verified { background: #ecfdf5; color: #065f46; border: 1px solid #34d399; }

    .vuln-body {
      padding: 10px 12px;
      font-size: 8.5pt;
    }

    .vuln-row {
      display: grid;
      grid-template-columns: 110px 1fr;
      margin-bottom: 5px;
    }

    .vuln-label {
      font-weight: 600;
      color: #64748b;
    }

    .vuln-val {
      color: #0f172a;
    }

    pre, code {
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 8pt;
    }

    code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }

    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px 12px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 8px 0;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-all;
    }

    .alert-box {
      padding: 8px 12px;
      border-radius: 4px;
      margin: 8px 0;
      font-size: 8.5pt;
    }

    .alert-box.danger {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      color: #991b1b;
    }

    .alert-box.warning {
      background: #fffbeb;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }

    .alert-box.info {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      color: #065f46;
    }

    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 6px;
      margin-bottom: 14px;
      font-size: 8pt;
      color: #64748b;
    }
  </style>
</head>
<body>

  <!-- ==================== COVER PAGE ==================== -->
  <div class="cover-page">
    <div class="cover-header">
      <div class="cover-badge-row">
        <span class="cover-badge">FORENSIC SECURITY AUDIT</span>
        <span class="cover-badge safe">ZERO DATA LOSS VERIFIED</span>
      </div>
      <div class="cover-title-group">
        <div class="cover-title">HIMALAYA ERP<br><span>SECURITY AUDIT</span></div>
        <div class="cover-subtitle">Complete Production Security Assessment, Threat Modeling, Multi-Tenant Analysis & Defensive Remediation Blueprint</div>
      </div>
      <div class="cover-meta-grid">
        <div class="cover-meta-item">
          <span>Target Production Application</span>
          <span>https://thehimalaya.cloud</span>
        </div>
        <div class="cover-meta-item">
          <span>Repository & Workspaces</span>
          <span>D:\\projects\\thehimalayaerp</span>
        </div>
        <div class="cover-meta-item">
          <span>Audit Protocol & Mode</span>
          <span>Strictly Read-Only (Non-Destructive)</span>
        </div>
        <div class="cover-meta-item">
          <span>Audit Date & Scope</span>
          <span>27-Nov-2026 / Complete System</span>
        </div>
      </div>
    </div>

    <div class="cover-center">
      <div class="cover-metrics">
        <div class="metric-box">
          <div class="metric-val">17</div>
          <div class="metric-label">Total Findings</div>
        </div>
        <div class="metric-box">
          <div class="metric-val">5</div>
          <div class="metric-label">Critical Vulnerabilities</div>
        </div>
        <div class="metric-box">
          <div class="metric-val high">5</div>
          <div class="metric-label">High Severity</div>
        </div>
        <div class="metric-box">
          <div class="metric-val success">0</div>
          <div class="metric-label">Production Records Modified</div>
        </div>
      </div>
    </div>

    <div class="cover-footer">
      <div>Enterprise Security Engineering & Penetration Testing Certification</div>
      <div>Confidential & Proprietary Document</div>
    </div>
  </div>

  <!-- ==================== PAGE 1: EXECUTIVE SUMMARY ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>HIMALAYA ERP — COMPLETE SECURITY AUDIT</span>
      <span>EXECUTIVE SUMMARY</span>
    </div>

    <h1>1. Executive Summary & Audit Scorecard</h1>
    <p>A comprehensive, strictly read-only security audit of <strong>Himalaya ERP</strong> (https://thehimalaya.cloud) was conducted on November 27, 2026. The inspection analyzed all source code, backend NestJS controllers, frontend Next.js App Router handlers, PostgreSQL database architecture via Prisma ORM, VPS Docker Compose orchestration, Caddy/Nginx configurations, deployment automation scripts, and passive public domain/SSL parameters.</p>

    <div class="alert-box danger">
      <strong>CRITICAL READINESS STATUS: IMMEDIATE REMEDIATION REQUIRED</strong><br>
      The platform contains severe architectural flaws in authentication, multi-tenant scoping, and file uploads. Attackers or rogue insiders can achieve complete administrative takeover via hardcoded credentials, access other organizations' business records via client header injection, and upload arbitrary 50MB files without authentication.
    </div>

    <h2>Audit Scope & Metrics Breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Category</th>
          <th>Inspected Entities</th>
          <th>Findings Breakdown</th>
          <th>Safety Guarantee</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Backend API Architecture</strong></td>
          <td>36 Modules, 65 Controllers</td>
          <td>5 Findings (BFLA, Missing RBAC, Open Static Files)</td>
          <td>Zero production API state changes</td>
        </tr>
        <tr>
          <td><strong>Frontend App Router</strong></td>
          <td>88 API Routes, 2 Layouts</td>
          <td>3 Findings (Missing middleware.ts, LocalStorage JWT, /api/upload)</td>
          <td>Zero client state disruption</td>
        </tr>
        <tr>
          <td><strong>PostgreSQL & Prisma ORM</strong></td>
          <td>170 Models, Schema & Mappers</td>
          <td>3 Findings (Boot-time partition overwrite, PII key fallback, deploy script delete)</td>
          <td>Zero DB records modified or deleted</td>
        </tr>
        <tr>
          <td><strong>Multi-Tenant Isolation</strong></td>
          <td>17 Controllers with Header Scopes</td>
          <td>2 Findings (x-company-id header injection, un-scoped sales orders)</td>
          <td>Zero cross-tenant records accessed</td>
        </tr>
        <tr>
          <td><strong>Domain, DNS & SSL/TLS</strong></td>
          <td>thehimalaya.cloud (200.97.162.71)</td>
          <td>2 Findings (Missing CSP header, Missing DNSSEC)</td>
          <td>Passive non-intrusive DNS/TLS queries</td>
        </tr>
        <tr>
          <td><strong>VPS Infrastructure & Docker</strong></td>
          <td>Docker Compose, Caddyfile, Scripts</td>
          <td>2 Findings (Plaintext SMTP credentials, exposed management subdomains)</td>
          <td>Zero container restarts or redeployments</td>
        </tr>
      </tbody>
    </table>

    <h2>Findings Severity Distribution</h2>
    <table>
      <thead>
        <tr>
          <th>Severity Level</th>
          <th>Count</th>
          <th>CVSS Range</th>
          <th>Core Identified Weaknesses</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="badge critical">CRITICAL</span></td>
          <td><strong>5</strong></td>
          <td>8.9 – 9.8</td>
          <td>Hardcoded credentials; x-company-id header injection; boot-time partition collapse; unauthenticated /api/upload; Payroll BFLA.</td>
        </tr>
        <tr>
          <td><span class="badge high">HIGH</span></td>
          <td><strong>5</strong></td>
          <td>7.5 – 8.6</td>
          <td>Un-scoped sales orders; plaintext SMTP credentials; 30-day JWT in localStorage; exposed management subdomains; universal user.read permission bypass.</td>
        </tr>
        <tr>
          <td><span class="badge medium">MEDIUM</span></td>
          <td><strong>4</strong></td>
          <td>5.3 – 6.8</td>
          <td>Missing CSP headers; open static /uploads; sensitive PII encryption key fallback; frontend client role tampering.</td>
        </tr>
        <tr>
          <td><span class="badge low">LOW</span></td>
          <td><strong>2</strong></td>
          <td>3.7 – 3.8</td>
          <td>Missing DNSSEC on domain; known prototype pollution in xlsx@0.18.5.</td>
        </tr>
        <tr>
          <td><span class="badge info">INFORMATIONAL</span></td>
          <td><strong>1</strong></td>
          <td>N/A</td>
          <td>Destructive raw material DELETE statement in deployment script.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 2: TOP CRITICAL FINDINGS ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>HIMALAYA ERP — COMPLETE SECURITY AUDIT</span>
      <span>CRITICAL VULNERABILITIES (PART 1)</span>
    </div>

    <h1>2. Critical Vulnerability Profiles</h1>

    <!-- VULN 1 -->
    <div class="vuln-card">
      <div class="vuln-header critical">
        <span class="vuln-title">SEC-AUTH-001: Hardcoded Master Credentials & Automatic Database Password Overwrite</span>
        <div class="vuln-meta">
          <span class="badge critical">CRITICAL</span>
          <span class="badge">CVSS 9.8</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected File:</span><span class="vuln-val"><code>backend/src/modules/auth/auth.service.ts</code> (Lines 22–51, 138–172, 488–561) & <code>scripts/sync-all-credentials.sql</code></span></div>
        <div class="vuln-row"><span class="vuln-label">Vulnerability Type:</span><span class="vuln-val">CWE-798: Use of Hard-coded Credentials / CWE-287: Improper Authentication</span></div>
        <p><strong>Technical Mechanics:</strong> <code>AuthService</code> defines an object <code>OFFICIAL_CREDENTIALS</code> containing static passwords for 25 production accounts (Super Admin, HR Manager, Finance Manager, Plant Head, Sales Executives, Dispatch, Store). When an official email is entered with the static password, the backend intercepts the verification:</p>
<pre>if (!isMatch && officialCred && cleanPassword === officialCred.password) {
  const rounds = this.configService.get<number>('bcryptRounds') || 12;
  const newHash = await hashAsync(officialCred.password, rounds);
  await this.prisma.user.update({
    where: { id: user.id },
    data: { password: newHash, failedLoginAttempts: 0, lockedUntil: null, isActive: true },
  });
  user.password = newHash;
  isMatch = true;
}</pre>
        <p><strong>Business Impact:</strong> Complete administrative takeover. Anyone with repository read access possesses the master credentials for every operational role. Legitimate administrator password rotations are neutralized because logging in with the hardcoded password automatically overwrites the stored hash in PostgreSQL.</p>
        <p><strong>Remediation:</strong> Remove <code>OFFICIAL_CREDENTIALS</code> and <code>autoProvisionOfficialUser</code> from <code>auth.service.ts</code>. Authenticate exclusively against the stored bcrypt hash in PostgreSQL. Rotate all 25 account passwords immediately.</p>
      </div>
    </div>

    <!-- VULN 2 -->
    <div class="vuln-card">
      <div class="vuln-header critical">
        <span class="vuln-title">SEC-TENANT-001: Client-Controlled Tenant Header Injection (x-company-id) Bypasses Multi-Tenancy</span>
        <div class="vuln-meta">
          <span class="badge critical">CRITICAL</span>
          <span class="badge">CVSS 9.6</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected Files:</span><span class="vuln-val"><code>frontend/app/api/backend/[...path]/route.ts</code> (Line 96) & 17 Backend Controllers</span></div>
        <div class="vuln-row"><span class="vuln-label">Vulnerability Type:</span><span class="vuln-val">CWE-639: Authorization Bypass Through User-Controlled Key</span></div>
        <p><strong>Technical Mechanics:</strong> The Next.js API bridge forwards client headers directly: <code>'x-company-id': request.headers.get('x-company-id')</code>. In 17 backend controllers (leads, payments, expense, leave, dispatch, qc, complaints, etc.), the tenant ID is resolved by checking the client header first:</p>
<pre>// Example: backend/src/modules/crm/leads.controller.ts (Lines 34, 50, 66)
const companyId = req.user?.companyId || req.headers['x-company-id'];
// Example: backend/src/modules/leave/leave.controller.ts (Lines 22-25)
const companyId = req.headers['x-company-id'] || req.user?.companyId || 'd039cfa4-e78b-4138-adfc-1b0f14cffa91';</pre>
        <p><strong>Business Impact:</strong> Any authenticated user belonging to Company A can supply Company B's UUID in the <code>x-company-id</code> header to read, create, modify, or delete Company B's leads, customer complaints, expenses, payment entries, leave requests, and dispatch records.</p>
        <p><strong>Remediation:</strong> Derive <code>companyId</code> strictly from <code>req.user.companyId</code> in verified JWT claims. Strip <code>x-company-id</code> forwarding in the Next.js bridge.</p>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 3: CRITICAL FINDINGS (PART 2) ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>HIMALAYA ERP — COMPLETE SECURITY AUDIT</span>
      <span>CRITICAL VULNERABILITIES (PART 2)</span>
    </div>

    <!-- VULN 3 -->
    <div class="vuln-card">
      <div class="vuln-header critical">
        <span class="vuln-title">SEC-DB-001: Multi-Tenant Partition Destruction on Application Boot</span>
        <div class="vuln-meta">
          <span class="badge critical">CRITICAL</span>
          <span class="badge">CVSS 9.3</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected File:</span><span class="vuln-val"><code>backend/src/database/prisma.service.ts</code> (Lines 125–150, 155–305, 330–353)</span></div>
        <div class="vuln-row"><span class="vuln-label">Vulnerability Type:</span><span class="vuln-val">CWE-284: Improper Access Control / Automated Data Corruption</span></div>
        <p><strong>Technical Mechanics:</strong> Inside <code>PrismaService.onModuleInit()</code>, NestJS executes destructive boot-time operations on every container start:</p>
<pre>const companyId = '88c57ebc-b3b7-49e3-8d5d-6321a0e89015';
await this.user.updateMany({ where: { companyId: { not: companyId } }, data: { companyId } });
await this.employee.updateMany({ where: { companyId: { not: companyId } }, data: { companyId } });
await this.workLocation.updateMany({ where: { companyId: { not: companyId } }, data: { companyId } });
await this.attendance.updateMany({ where: { companyId: { not: companyId } }, data: { companyId } });</pre>
        <p>Furthermore, it executes unmanaged DDL (<code>ALTER TABLE</code>) and injects dummy records (<code>"Default Client"</code>, <code>"SO-AUTO-..."</code>, <code>"PP-AUTO-..."</code>, <code>"WO-AUTO-..."</code>) if unposted production reports exist.</p>
        <p><strong>Business Impact:</strong> Total collapse of multi-tenancy upon service restart; every user and employee is forcibly moved into a single hardcoded company partition. Production data is polluted with synthetic test orders.</p>
        <p><strong>Remediation:</strong> Remove lines 125–353 completely from <code>PrismaService</code>. Database schema must be managed exclusively through <code>prisma migrate deploy</code>.</p>
      </div>
    </div>

    <!-- VULN 4 -->
    <div class="vuln-card">
      <div class="vuln-header critical">
        <span class="vuln-title">SEC-API-001: Completely Unauthenticated Public File Upload Endpoint (/api/upload)</span>
        <div class="vuln-meta">
          <span class="badge critical">CRITICAL</span>
          <span class="badge">CVSS 9.1</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected File:</span><span class="vuln-val"><code>frontend/app/api/upload/route.ts</code> (Lines 20–74)</span></div>
        <div class="vuln-row"><span class="vuln-label">Vulnerability Type:</span><span class="vuln-val">CWE-306: Missing Authentication for Critical Function / CWE-434: Unrestricted File Upload</span></div>
        <p><strong>Technical Mechanics:</strong> <code>POST /api/upload</code> contains zero authentication or session checks. It accepts files up to 50MB and writes them directly into <code>frontend/public/uploads/{category}</code> and <code>backend/uploads/{category}</code> on the VPS disk:</p>
<pre>export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  const extension = EXTENSIONS[file.type] || path.extname(file.name).replace('.', '') || "jpg";
  const fileName = \`\${randomUUID()}.\${extension}\`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(frontendDir, fileName), buffer);
}</pre>
        <p><strong>Business Impact:</strong> Denial of service via storage exhaustion; hosting malware, phishing pages, or executable content on the enterprise domain.</p>
        <p><strong>Remediation:</strong> Enforce JWT token verification on <code>POST /api/upload</code>. Restrict allowed extensions strictly to a whitelist (<code>.jpg</code>, <code>.png</code>, <code>.pdf</code>) and validate magic bytes.</p>
      </div>
    </div>

    <!-- VULN 5 -->
    <div class="vuln-card">
      <div class="vuln-header critical">
        <span class="vuln-title">SEC-RBAC-001: Broken Function-Level Authorization in Payroll Management</span>
        <div class="vuln-meta">
          <span class="badge critical">CRITICAL</span>
          <span class="badge">CVSS 8.9</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected Files:</span><span class="vuln-val"><code>backend/src/modules/payroll/payroll.controller.ts</code> (Lines 18–200) & <code>payroll.service.ts</code></span></div>
        <div class="vuln-row"><span class="vuln-label">Vulnerability Type:</span><span class="vuln-val">CWE-285: Improper Authorization / Broken Function Level Authorization (BFLA)</span></div>
        <p><strong>Technical Mechanics:</strong> <code>PayrollController</code> contains zero <code>@Roles</code> or <code>@RequirePermissions</code> guards. Under <code>PermissionsGuard</code>, endpoints lacking permission decorators allow any authenticated caller through. In <code>PayrollService.approve()</code>, the service updates the status to <code>SUPER_ADMIN_APPROVED</code> and records <code>user.sub</code> without verifying that the caller holds the Super Admin role.</p>
        <p><strong>Business Impact:</strong> Any authenticated user (e.g., Sales Executive, Plant Laborer, Dispatch Driver) can list full company salary registers and execute payroll approvals and disbursements.</p>
        <p><strong>Remediation:</strong> Decorate administrative payroll endpoints with <code>@Roles('SUPER_ADMIN', 'ADMIN')</code> and enforce role checks in <code>PayrollService</code>.</p>
      </div>
    </div>
  </div>

  <!-- ==================== PAGE 4: HIGH & MEDIUM VULNERABILITIES ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>HIMALAYA ERP — COMPLETE SECURITY AUDIT</span>
      <span>HIGH & MEDIUM SEVERITY VULNERABILITIES</span>
    </div>

    <h1>3. High & Medium Severity Findings</h1>

    <!-- VULN 6 -->
    <div class="vuln-card">
      <div class="vuln-header high">
        <span class="vuln-title">SEC-TENANT-002: Missing Company Scoping on Core Sales Orders & Quotations</span>
        <div class="vuln-meta">
          <span class="badge high">HIGH</span>
          <span class="badge">CVSS 8.6</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected Files:</span><span class="vuln-val"><code>backend/src/modules/sales/sales.service.ts</code> (Lines 132–172) & <code>prisma/schema.prisma</code></span></div>
        <p><strong>Explanation:</strong> <code>SalesOrder</code> lacks a direct <code>companyId</code> column. In <code>SalesService.listOrders()</code>, query scoping only applies to salespersons filtering by their own user ID. For non-sales roles (Finance Manager, Plant Head, Store Manager, Admin), the query scope is empty (<code>{}</code>). Consequently, any Finance Manager or Store Manager sees all sales orders across all tenant companies.</p>
        <p><strong>Remediation:</strong> Enforce <code>where.customer = { companyId }</code> in <code>listOrders()</code>.</p>
      </div>
    </div>

    <!-- VULN 7 -->
    <div class="vuln-card">
      <div class="vuln-header high">
        <span class="vuln-title">SEC-VPS-001: Plaintext Hostinger SMTP Credentials Committed in Version Control</span>
        <div class="vuln-meta">
          <span class="badge high">HIGH</span>
          <span class="badge">CVSS 8.4</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected File:</span><span class="vuln-val"><code>docker-compose.yml</code> (Lines 121–126; Git Commit <code>3009af3f</code>)</span></div>
        <p><strong>Explanation:</strong> Production SMTP username (<code>himalaya@emperorsmartsolutions.com</code>) and active password (<code>Johnthedon07#</code>) are hardcoded as defaults in <code>docker-compose.yml</code> and committed into Git history.</p>
        <p><strong>Remediation:</strong> Rotate SMTP password in Hostinger webmail. Remove default password from <code>docker-compose.yml</code> and inject strictly via server <code>.env</code>.</p>
      </div>
    </div>

    <!-- VULN 8 -->
    <div class="vuln-card">
      <div class="vuln-header high">
        <span class="vuln-title">SEC-AUTH-002: Excessive 30-Day JWT Expiry Stored in Browser localStorage</span>
        <div class="vuln-meta">
          <span class="badge high">HIGH</span>
          <span class="badge">CVSS 8.2</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected Files:</span><span class="vuln-val"><code>docker-compose.yml</code> (Line 98), <code>deploy-vps.sh</code> (Line 37), <code>frontend/store/authStore.ts</code></span></div>
        <p><strong>Explanation:</strong> Access token lifetime is set to 30 days and written to unencrypted browser <code>localStorage</code>. Without Content-Security-Policy (CSP), any XSS vulnerability enables immediate exfiltration of a 30-day valid session token.</p>
        <p><strong>Remediation:</strong> Reduce access token expiration to 15 minutes. Store access tokens in memory or secure HttpOnly cookies.</p>
      </div>
    </div>

    <!-- VULN 9 -->
    <div class="vuln-card">
      <div class="vuln-header high">
        <span class="vuln-title">SEC-VPS-002: Public Management Subdomains Without IP Restrictions in Caddy</span>
        <div class="vuln-meta">
          <span class="badge high">HIGH</span>
          <span class="badge">CVSS 8.1</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected Files:</span><span class="vuln-val"><code>Caddyfile</code> (Lines 40–89), <code>docker-compose.management.yml</code>, <code>dozzle-users.yml</code></span></div>
        <p><strong>Explanation:</strong> Caddy reverse proxies <code>dbadmin</code> (pgAdmin), <code>portainer</code>, and <code>logs</code> (Dozzle) without IP whitelisting. Dozzle has default credentials committed to Git. Portainer and Dozzle mount <code>/var/run/docker.sock</code> directly.</p>
        <p><strong>Remediation:</strong> Remove public subdomain reverse proxying. Bind management tools to <code>127.0.0.1</code> and access via SSH tunneling.</p>
      </div>
    </div>

    <!-- VULN 10 -->
    <div class="vuln-card">
      <div class="vuln-header high">
        <span class="vuln-title">SEC-RBAC-002: Permission Aliasing Escalation via Universal user.read</span>
        <div class="vuln-meta">
          <span class="badge high">HIGH</span>
          <span class="badge">CVSS 7.8</span>
          <span class="badge verified">VERIFIED</span>
        </div>
      </div>
      <div class="vuln-body">
        <div class="vuln-row"><span class="vuln-label">Affected File:</span><span class="vuln-val"><code>backend/src/common/guards/permissions.guard.ts</code> (Lines 243, 310, 2635, 2648)</span></div>
        <p><strong>Explanation:</strong> Every role receives <code>user.read</code> by default. In <code>PERMISSION_ALIASES</code>, <code>user.read</code> is included as an alias for <code>production.reports.read</code>, <code>admin.productionreports.read</code>, and <code>hr.departments.read</code>, allowing any authenticated user to bypass departmental boundaries.</p>
        <p><strong>Remediation:</strong> Remove <code>'user.read'</code> from all administrative and operational permission alias sets.</p>
      </div>
    </div>

    <!-- VULN 11-14 SUMMARY -->
    <h2>Medium Severity Summaries</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Title</th>
          <th>Location</th>
          <th>Core Risk & Remediation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>SEC-FRONT-001</strong></td>
          <td>Missing Content-Security-Policy (CSP)</td>
          <td><code>backend/src/main.ts</code>, <code>Caddyfile</code></td>
          <td>CSP explicitly disabled in Helmet and missing in live headers. Implement strict CSP header in Nginx/Caddy.</td>
        </tr>
        <tr>
          <td><strong>SEC-API-002</strong></td>
          <td>Static Public Uploads with Wildcard CORS</td>
          <td><code>backend/src/main.ts</code> (Lines 105–154)</td>
          <td>Static routes serve <code>/uploads</code> publicly without auth. Serve attachments exclusively via authenticated endpoints.</td>
        </tr>
        <tr>
          <td><strong>SEC-DB-002</strong></td>
          <td>PII Encryption Key Fallback to JWT Secret</td>
          <td><code>employees.service.ts</code> (Lines 88–93)</td>
          <td>Aadhaar/Bank encryption falls back to JWT secret. Rotating JWT secret corrupts data. Enforce dedicated key.</td>
        </tr>
        <tr>
          <td><strong>SEC-FRONT-002</strong></td>
          <td>Client-Side Role Tampering in AuthGuard</td>
          <td><code>frontend/shared/components/AuthGuard.tsx</code></td>
          <td>Role read from mutable localStorage. Implement server-side Next.js <code>middleware.ts</code> token decoding.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 5: DOMAIN & INFRASTRUCTURE AUDIT ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>HIMALAYA ERP — COMPLETE SECURITY AUDIT</span>
      <span>PERIMETER & INFRASTRUCTURE</span>
    </div>

    <h1>4. Domain, DNS & Infrastructure Security</h1>

    <h2>Live Perimeter Audit Results</h2>
    <table>
      <thead>
        <tr>
          <th>Security Dimension</th>
          <th>Observed Live Parameter</th>
          <th>Security Assessment</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Domain Apex</strong></td>
          <td><code>thehimalaya.cloud</code> (A: <code>200.97.162.71</code>)</td>
          <td><span class="badge verified">PASS</span> Registered and correctly mapped to Hostinger VPS.</td>
        </tr>
        <tr>
          <td><strong>DNSSEC Status</strong></td>
          <td>DS Records Absent (NSEC3 returned)</td>
          <td><span class="badge low">FAIL</span> DNSSEC is not configured. Enable in Hostinger DNS.</td>
        </tr>
        <tr>
          <td><strong>TLS Protocol</strong></td>
          <td><strong>TLS 1.3</strong></td>
          <td><span class="badge verified">PASS</span> Modern TLS 1.3 enforced; TLS 1.0/1.1 disabled.</td>
        </tr>
        <tr>
          <td><strong>Cipher Suite</strong></td>
          <td>AES-256 (256-bit, SHA-384)</td>
          <td><span class="badge verified">PASS</span> High cryptographic strength cipher suite.</td>
        </tr>
        <tr>
          <td><strong>SSL Certificate</strong></td>
          <td>CN=thehimalaya.cloud (Let's Encrypt YE2)</td>
          <td><span class="badge verified">PASS</span> Valid through January 3, 2027.</td>
        </tr>
        <tr>
          <td><strong>HTTP Redirection</strong></td>
          <td>HTTP 301 Moved Permanently to HTTPS</td>
          <td><span class="badge verified">PASS</span> Plain HTTP traffic redirected immediately.</td>
        </tr>
        <tr>
          <td><strong>Strict-Transport-Security</strong></td>
          <td><code>max-age=31536000; includeSubDomains</code></td>
          <td><span class="badge verified">PASS</span> Strong 1-year HSTS active. Recommend adding <code>preload</code>.</td>
        </tr>
        <tr>
          <td><strong>X-Frame-Options</strong></td>
          <td><code>SAMEORIGIN</code></td>
          <td><span class="badge verified">PASS</span> Clickjacking protection enabled.</td>
        </tr>
        <tr>
          <td><strong>X-Content-Type-Options</strong></td>
          <td><code>nosniff</code></td>
          <td><span class="badge verified">PASS</span> MIME sniffing disabled.</td>
        </tr>
        <tr>
          <td><strong>Content-Security-Policy</strong></td>
          <td><strong>MISSING</strong></td>
          <td><span class="badge medium">FAIL</span> Vulnerable to XSS token exfiltration.</td>
        </tr>
      </tbody>
    </table>

    <h2>VPS Container Hardening Assessment</h2>
    <table>
      <thead>
        <tr>
          <th>Container / Service</th>
          <th>Configuration File</th>
          <th>Observed Security State</th>
          <th>Remediation Required</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>himalaya-postgres</strong></td>
          <td><code>docker-compose.yml</code></td>
          <td>Bound to <code>127.0.0.1:5435:5432</code></td>
          <td>Secure loopback binding. Not exposed to public internet.</td>
        </tr>
        <tr>
          <td><strong>himalaya-backend</strong></td>
          <td><code>backend/Dockerfile</code></td>
          <td><code># USER nestjs</code> (Commented out)</td>
          <td>Runs as root inside container. Uncomment non-root user.</td>
        </tr>
        <tr>
          <td><strong>himalaya-frontend</strong></td>
          <td><code>frontend/Dockerfile</code></td>
          <td><code># USER nextjs</code> (Commented out)</td>
          <td>Runs as root inside container. Uncomment non-root user.</td>
        </tr>
        <tr>
          <td><strong>himalaya-portainer</strong></td>
          <td><code>docker-compose.management.yml</code></td>
          <td>Mounts <code>/var/run/docker.sock</code></td>
          <td>Container escape risk. Remove public exposure; access via SSH tunnel.</td>
        </tr>
        <tr>
          <td><strong>himalaya-dozzle</strong></td>
          <td><code>docker-compose.management.yml</code></td>
          <td>Mounts <code>/var/run/docker.sock</code></td>
          <td>Container escape risk. Remove public exposure; access via SSH tunnel.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 6: REMEDIATION ROADMAP ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>HIMALAYA ERP — COMPLETE SECURITY AUDIT</span>
      <span>REMEDIATION ROADMAP</span>
    </div>

    <h1>5. Phased Remediation Roadmap</h1>
    <p>All remediation activities must adhere to the <strong>Fixing Policy</strong>: zero automated production modifications, targeted minimal code fixes, staging-first validation, and zero disruption to operational data.</p>

    <h2>Phase 1: Immediate Critical Hotfixes (Days 1–2)</h2>
    <table>
      <thead>
        <tr>
          <th>Target Vulnerability</th>
          <th>Affected File</th>
          <th>Exact Remediation Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>SEC-AUTH-001</strong></td>
          <td><code>backend/src/modules/auth/auth.service.ts</code></td>
          <td>Delete <code>OFFICIAL_CREDENTIALS</code> (lines 22–51) and database overwrite logic (lines 162–172). Enforce pure bcrypt database verification. Rotate all 25 account passwords.</td>
        </tr>
        <tr>
          <td><strong>SEC-TENANT-001</strong></td>
          <td><code>[...path]/route.ts</code> & 17 controllers</td>
          <td>Remove <code>x-company-id</code> header forwarding in bridge. Enforce <code>const companyId = req.user.companyId;</code> in all standard business controllers.</td>
        </tr>
        <tr>
          <td><strong>SEC-API-001</strong></td>
          <td><code>frontend/app/api/upload/route.ts</code></td>
          <td>Add JWT authentication gate. Validate file extensions against strict whitelist (<code>.jpg</code>, <code>.png</code>, <code>.pdf</code>).</td>
        </tr>
        <tr>
          <td><strong>SEC-DB-001</strong></td>
          <td><code>backend/src/database/prisma.service.ts</code></td>
          <td>Delete partition collapse batch queries (lines 330–353) and raw startup DDL statements (lines 125–150).</td>
        </tr>
        <tr>
          <td><strong>SEC-VPS-001</strong></td>
          <td><code>docker-compose.yml</code></td>
          <td>Rotate Hostinger SMTP password for <code>himalaya@emperorsmartsolutions.com</code>. Remove default password from version control.</td>
        </tr>
      </tbody>
    </table>

    <h2>Phase 2: High-Severity Access & Infrastructure Hardening (Days 3–5)</h2>
    <table>
      <thead>
        <tr>
          <th>Target Vulnerability</th>
          <th>Affected File</th>
          <th>Exact Remediation Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>SEC-RBAC-001</strong></td>
          <td><code>payroll.controller.ts</code></td>
          <td>Add <code>@Roles('SUPER_ADMIN', 'ADMIN')</code> and <code>@RequirePermissions('hr.payroll.approve')</code> to all approval and disbursement endpoints.</td>
        </tr>
        <tr>
          <td><strong>SEC-TENANT-002</strong></td>
          <td><code>sales.service.ts</code></td>
          <td>Pass <code>companyId</code> to <code>listOrders()</code> and enforce <code>where.customer = { companyId }</code>.</td>
        </tr>
        <tr>
          <td><strong>SEC-AUTH-002</strong></td>
          <td><code>docker-compose.yml</code>, <code>authStore.ts</code></td>
          <td>Reduce <code>JWT_ACCESS_EXPIRES_IN</code> to 15 minutes (<code>15m</code>). Move token storage from localStorage to in-memory store.</td>
        </tr>
        <tr>
          <td><strong>SEC-VPS-002</strong></td>
          <td><code>Caddyfile</code></td>
          <td>Remove management subdomain blocks (<code>dbadmin</code>, <code>portainer</code>, <code>logs</code>). Access management tools strictly via SSH tunnel.</td>
        </tr>
        <tr>
          <td><strong>SEC-OPS-001</strong></td>
          <td><code>scripts/deploy-vps.sh</code></td>
          <td>Delete line 90 executing destructive <code>DELETE FROM "RawMaterial"</code> during automated deployments.</td>
        </tr>
      </tbody>
    </table>

    <h2>Phase 3 & 4: Defense-in-Depth & Compliance (Weeks 2–3)</h2>
    <table>
      <thead>
        <tr>
          <th>Target</th>
          <th>Action</th>
          <th>Target Outcome</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Content-Security-Policy</strong></td>
          <td>Add CSP header in Nginx/Caddy and Next.js</td>
          <td>Neutralizes script injection and token exfiltration vectors.</td>
        </tr>
        <tr>
          <td><strong>Next.js Middleware</strong></td>
          <td>Create <code>frontend/middleware.ts</code></td>
          <td>Server-side route protection before client JavaScript execution.</td>
        </tr>
        <tr>
          <td><strong>Container Privileges</strong></td>
          <td>Uncomment <code>USER nestjs</code> and <code>USER nextjs</code></td>
          <td>Non-root container execution mitigating breakout risks.</td>
        </tr>
        <tr>
          <td><strong>DNSSEC</strong></td>
          <td>Enable DNSSEC in Hostinger DNS console</td>
          <td>Cryptographic origin validation preventing DNS cache poisoning.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ==================== PAGE 7: SIGN-OFF & CERTIFICATION ==================== -->
  <div class="page">
    <div class="header-bar">
      <span>HIMALAYA ERP — COMPLETE SECURITY AUDIT</span>
      <span>SAFETY LOG & AUDITOR SIGN-OFF</span>
    </div>

    <h1>6. Production Safety Certification & Sign-Off</h1>

    <h2>Production Integrity Statement</h2>
    <p>This audit was executed strictly under non-destructive read-only protocols. All forensic discovery, code tracing, and API analyses were conducted without writing to production databases, running destructive queries, modifying source files, altering environment configurations, or interrupting live manufacturing, sales, or logistics operations.</p>

    <table>
      <thead>
        <tr>
          <th>Integrity Verification Check</th>
          <th>Target Scope</th>
          <th>Verified Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>PostgreSQL Database Records</td>
          <td><code>himalaya_erp</code> (PostgreSQL 16)</td>
          <td><span class="badge verified">0 RECORDS MODIFIED / 0 DELETED</span></td>
        </tr>
        <tr>
          <td>Prisma Schema Migrations</td>
          <td><code>backend/prisma/migrations</code></td>
          <td><span class="badge verified">0 MIGRATIONS EXECUTED</span></td>
        </tr>
        <tr>
          <td>Production Source Code</td>
          <td>Next.js Frontend & NestJS Backend</td>
          <td><span class="badge verified">0 CODE FILES MODIFIED</span></td>
        </tr>
        <tr>
          <td>Production Environment Files</td>
          <td><code>.env</code>, Secrets, Passwords</td>
          <td><span class="badge verified">0 CREDENTIALS CHANGED</span></td>
        </tr>
        <tr>
          <td>VPS Services & Containers</td>
          <td>Docker Engine, Nginx, Caddy</td>
          <td><span class="badge verified">0 SERVICE RESTARTS / ZERO DOWNTIME</span></td>
        </tr>
      </tbody>
    </table>

    <h2>Audit Archive Inventory</h2>
    <p>The complete forensic audit suite is documented across 16 markdown records in the <code>audit/</code> folder:</p>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Document Name</th>
          <th>Primary Forensic Focus</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>1</td><td><code>SECURITY_AUDIT_EXECUTIVE_SUMMARY.md</code></td><td>Leadership overview, metrics, and risk scorecard.</td></tr>
        <tr><td>2</td><td><code>SECURITY_AUDIT_FULL_REPORT.md</code></td><td>Exhaustive technical findings catalog (17 vulnerabilities).</td></tr>
        <tr><td>3</td><td><code>DOMAIN_DNS_SSL_SECURITY_REPORT.md</code></td><td>Perimeter DNS, DNSSEC, TLS 1.3, and HTTP headers.</td></tr>
        <tr><td>4</td><td><code>AUTHENTICATION_SESSION_SECURITY_REPORT.md</code></td><td>Bcrypt hashing, JWT lifecycle, and session security.</td></tr>
        <tr><td>5</td><td><code>RBAC_PERMISSION_AUDIT.md</code></td><td>Guard hierarchy, role evaluation, and permission aliases.</td></tr>
        <tr><td>6</td><td><code>API_ENDPOINT_SECURITY_AUDIT.md</code></td><td>Inventory of 153 endpoints and proxy bridge behavior.</td></tr>
        <tr><td>7</td><td><code>DATABASE_POSTGRESQL_SECURITY_AUDIT.md</code></td><td>Prisma query safety, boot-time DDL, and PII keys.</td></tr>
        <tr><td>8</td><td><code>MULTI_TENANT_ISOLATION_AUDIT.md</code></td><td>Header injection vulnerabilities and tenant scoping.</td></tr>
        <tr><td>9</td><td><code>FRONTEND_SECURITY_AUDIT.md</code></td><td>Next.js middleware, client route protection, and XSS.</td></tr>
        <tr><td>10</td><td><code>VPS_INFRASTRUCTURE_SECURITY_AUDIT.md</code></td><td>Docker privileges, socket mounts, and management tools.</td></tr>
        <tr><td>11</td><td><code>HACKER_ACTIVITY_INVESTIGATION.md</code></td><td>Indicators of compromise and backdoor risk assessment.</td></tr>
        <tr><td>12</td><td><code>DEPENDENCY_SECURITY_REPORT.md</code></td><td>Supply chain integrity and npm package CVEs.</td></tr>
        <tr><td>13</td><td><code>BACKUP_RECOVERY_SECURITY_REPORT.md</code></td><td>Host and application backup encryption and retention.</td></tr>
        <tr><td>14</td><td><code>SECURITY_REMEDIATION_ROADMAP.md</code></td><td>Prioritized 4-phase code-level remediation blueprint.</td></tr>
        <tr><td>15</td><td><code>STAGING_PENETRATION_TEST_PLAN.md</code></td><td>Isolated staging test cases (TC-01 through TC-06).</td></tr>
        <tr><td>16</td><td><code>PRODUCTION_SAFETY_AND_CHANGE_LOG.md</code></td><td>Timestamped verification of zero production changes.</td></tr>
      </tbody>
    </table>

    <div style="margin-top: 24px; padding: 14px; border: 1px solid #cbd5e1; border-radius: 4px; background: #f8fafc; font-size: 8pt; color: #475569;">
      <strong>Auditor Certification:</strong><br>
      This audit was completed in strict adherence to defensive ethical auditing standards. All findings represent verified technical realities of the repository codebase and runtime environment as of November 27, 2026. No automatic fixes have been applied. Remediation is awaiting explicit stakeholder approval.
    </div>
  </div>

</body>
</html>`;
}

async function run() {
  console.log('[PDF] Generating HTML forensic report template...');
  const html = generateHtmlReport();
  const htmlPath = path.resolve(__dirname, 'audit-full-report.html');
  fs.writeFileSync(htmlPath, html, 'utf8');

  const rootPdfPath = path.resolve(__dirname, '..', 'HIMALAYA_ERP_MASTER_SECURITY_AUDIT_REPORT.pdf');
  const auditPdfPath = path.resolve(__dirname, '..', 'audit', 'HIMALAYA_ERP_MASTER_SECURITY_AUDIT_REPORT.pdf');

  console.log('[PDF] Rendering master PDF using Microsoft Edge headless engine...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

  // Render to root
  const cmdRoot = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${rootPdfPath}" "${htmlPath}"`;
  execSync(cmdRoot, { stdio: 'inherit' });

  // Copy to audit directory as well
  fs.copyFileSync(rootPdfPath, auditPdfPath);

  // Clean up temporary HTML
  if (fs.existsSync(htmlPath)) {
    fs.unlinkSync(htmlPath);
  }

  const stats = fs.statSync(rootPdfPath);
  console.log(`[PDF] SUCCESS! Master forensic PDF generated at:`);
  console.log(`  ↳ ${rootPdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
  console.log(`  ↳ ${auditPdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

run().catch(err => {
  console.error('[PDF] FATAL ERROR:', err);
  process.exit(1);
});
