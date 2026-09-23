const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../frontend/modules/super-admin/pages/SuperAdminPortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure User and Send are imported
if (!content.includes('User,') && !content.includes(', User,')) {
  content = content.replace("Users,", "Users, User, Send,");
}

// 1. Sanitize selectableStaff creation
const target1 = `    (backendUsers || []).forEach(u => {
      const code = (u.employeeCode || u.publicId || '').trim();
      const email = (u.email || '').toLowerCase().trim();
      const uid = u.id || u.userId || u.employeeId;

      if (code) seenCodes.add(code.toLowerCase());
      if (email && email.includes('@')) seenEmails.add(email);
      if (uid) seenIds.add(uid);

      selectableStaff.push({
        id: u.id,
        employeeId: u.employeeId || u.id,
        name: u.name || u.fullName || (email ? email.split('@')[0] : 'User'),
        code: u.employeeCode || u.publicId || \`USR-\${String(u.id).slice(0, 4)}\`,
        role: u.role?.name || u.role || u.jobTitle || 'Staff',
        department: typeof u.department === 'object' ? (u.department?.name || 'Operations') : (u.department || u.role?.name || 'Staff')
      });
    });

    (employees || []).forEach(emp => {
      const code = (emp.employeeCode || emp.id || '').trim();
      const email = (emp.workEmail || emp.email || '').toLowerCase().trim();
      const uid = emp.userId || emp.id;

      const isSeen =
        (code && seenCodes.has(code.toLowerCase())) ||
        (email && email.includes('@') && seenEmails.has(email)) ||
        (uid && seenIds.has(uid));

      if (!isSeen) {
        if (code) seenCodes.add(code.toLowerCase());
        if (email && email.includes('@')) seenEmails.add(email);
        if (uid) seenIds.add(uid);

        selectableStaff.push({
          id: emp.userId || emp.id,
          employeeId: emp.id,
          name: emp.name || emp.fullName || \`\${emp.firstName || ''} \${emp.lastName || ''}\`.trim() || 'Staff Member',
          code: emp.employeeCode || emp.id,
          role: emp.jobTitle || emp.role || 'Staff',
          department: typeof emp.department === 'object' ? (emp.department?.name || 'Operations') : (emp.department || 'Operations')
        });
      }
    });

    const getNum = (code) => {
      if (!code) return 999999;
      const m = String(code).match(/(\\d+)/);
      return m ? parseInt(m[1], 10) : 999999;
    };

    selectableStaff.sort((a, b) => getNum(a.code) - getNum(b.code));

    const filteredSelectableStaff = selectableStaff.filter(s => {
      if (!notifUserSearchQuery.trim()) return true;
      const q = notifUserSearchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.role.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    });`;

const replacement1 = `    (backendUsers || []).forEach(u => {
      if (!u) return;
      const code = String(u.employeeCode || u.publicId || '').trim();
      const email = String(u.email || '').toLowerCase().trim();
      const uid = String(u.id || u.userId || u.employeeId || '');

      if (code) seenCodes.add(code.toLowerCase());
      if (email && email.includes('@')) seenEmails.add(email);
      if (uid) seenIds.add(uid);

      const roleStr = typeof u.role === 'object' ? (u.role?.name || u.role?.title || 'Staff') : (u.role || u.jobTitle || 'Staff');
      const deptStr = typeof u.department === 'object' ? (u.department?.name || u.department?.title || 'Operations') : (u.department || roleStr || 'Staff');
      const nameStr = typeof u.name === 'string' ? u.name : typeof u.fullName === 'string' ? u.fullName : (email ? email.split('@')[0] : 'User');
      const codeStr = code || (uid ? \`USR-\${uid.slice(0, 4)}\` : 'USR');

      selectableStaff.push({
        id: uid || \`staff-\${selectableStaff.length}\`,
        employeeId: u.employeeId || u.id,
        name: String(nameStr),
        code: String(codeStr),
        role: String(roleStr),
        department: String(deptStr)
      });
    });

    (employees || []).forEach(emp => {
      if (!emp) return;
      const code = String(emp.employeeCode || emp.id || '').trim();
      const email = String(emp.workEmail || emp.email || '').toLowerCase().trim();
      const uid = String(emp.userId || emp.id || '');

      const isSeen =
        (code && seenCodes.has(code.toLowerCase())) ||
        (email && email.includes('@') && seenEmails.has(email)) ||
        (uid && seenIds.has(uid));

      if (!isSeen) {
        if (code) seenCodes.add(code.toLowerCase());
        if (email && email.includes('@')) seenEmails.add(email);
        if (uid) seenIds.add(uid);

        const roleStr = typeof emp.role === 'object' ? (emp.role?.name || emp.role?.title || 'Staff') : (emp.jobTitle || emp.role || 'Staff');
        const deptStr = typeof emp.department === 'object' ? (emp.department?.name || emp.department?.title || 'Operations') : (emp.department || 'Operations');
        const nameStr = typeof emp.name === 'string' ? emp.name : typeof emp.fullName === 'string' ? emp.fullName : \`\${emp.firstName || ''} \${emp.lastName || ''}\`.trim() || 'Staff Member';

        selectableStaff.push({
          id: uid || \`emp-\${selectableStaff.length}\`,
          employeeId: emp.id,
          name: String(nameStr),
          code: code || 'EMP',
          role: String(roleStr),
          department: String(deptStr)
        });
      }
    });

    const getNum = (code) => {
      if (!code) return 999999;
      const m = String(code).match(/(\\d+)/);
      return m ? parseInt(m[1], 10) : 999999;
    };

    selectableStaff.sort((a, b) => getNum(a.code) - getNum(b.code));

    const filteredSelectableStaff = selectableStaff.filter(s => {
      if (!notifUserSearchQuery.trim()) return true;
      const q = notifUserSearchQuery.toLowerCase();
      const sName = typeof s.name === 'string' ? s.name.toLowerCase() : '';
      const sCode = typeof s.code === 'string' ? s.code.toLowerCase() : '';
      const sRole = typeof s.role === 'string' ? s.role.toLowerCase() : '';
      const sDept = typeof s.department === 'string' ? s.department.toLowerCase() : '';
      return (
        sName.includes(q) ||
        sCode.includes(q) ||
        sRole.includes(q) ||
        sDept.includes(q)
      );
    });`;

// 2. Sanitize date and recipient in broadcast history
const target2 = `                {filteredBroadcastHistory.map((notif, idx) => {
                  const isRead = notif.status === 'READ' || notif.isRead;
                  return (
                    <div key={idx} style={{ padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', background: isRead ? '#f8fafc' : '#ffffff', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 'fit-content', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <strong style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800' }}>{notif.title}</strong>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: '1.4', wordBreak: 'break-word' }}>
                        {notif.message}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                        <div>
                          Recipient: <strong style={{ color: '#334155' }}>{notif.recipientName || 'Staff Member'}</strong> {notif.recipientRole ? \`(\${notif.recipientRole})\` : ''}
                        </div>
                        <div>
                          <span style={{ background: isRead ? '#dcfce7' : '#fee2e2', color: isRead ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                            {isRead ? '✓ Read' : '● Unread'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}`;

const replacement2 = `                {filteredBroadcastHistory.map((notif, idx) => {
                  if (!notif) return null;
                  const isRead = notif.status === 'READ' || notif.isRead;
                  const createdAtDate = notif.createdAt ? new Date(notif.createdAt) : null;
                  const dateStr = createdAtDate && !isNaN(createdAtDate.getTime())
                    ? createdAtDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
                    : '—';
                  const recipientNameStr = typeof notif.recipientName === 'object' ? (notif.recipientName?.name || 'Staff Member') : String(notif.recipientName || 'Staff Member');
                  const recipientRoleStr = typeof notif.recipientRole === 'object' ? (notif.recipientRole?.name || '') : String(notif.recipientRole || '');

                  return (
                    <div key={idx} style={{ padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '10px', background: isRead ? '#f8fafc' : '#ffffff', display: 'flex', flexDirection: 'column', gap: '6px', minHeight: 'fit-content', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <strong style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800' }}>{notif.title || 'Notification'}</strong>
                        <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>
                          {dateStr}
                        </span>
                      </div>
                      <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: '1.4', wordBreak: 'break-word' }}>
                        {notif.message || '—'}
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                        <div>
                          Recipient: <strong style={{ color: '#334155' }}>{recipientNameStr}</strong> {recipientRoleStr ? \`(\${recipientRoleStr})\` : ''}
                        </div>
                        <div>
                          <span style={{ background: isRead ? '#dcfce7' : '#fee2e2', color: isRead ? '#15803d' : '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                            {isRead ? '✓ Read' : '● Unread'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}`;

// Normalize line endings for replacement
const isCRLF = content.includes('\r\n');
const normContent = content.replace(/\r\n/g, '\n');
const normTarget1 = target1.replace(/\r\n/g, '\n');
const normTarget2 = target2.replace(/\r\n/g, '\n');

if (!normContent.includes(normTarget1)) {
  console.error('Target 1 not found in file!');
  process.exit(1);
}
if (!normContent.includes(normTarget2)) {
  console.error('Target 2 not found in file!');
  process.exit(1);
}

let patched = normContent.replace(normTarget1, replacement1.replace(/\r\n/g, '\n'));
patched = patched.replace(normTarget2, replacement2.replace(/\r\n/g, '\n'));

if (isCRLF) {
  patched = patched.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, patched, 'utf8');
console.log('Successfully patched SuperAdminPortal.jsx!');
