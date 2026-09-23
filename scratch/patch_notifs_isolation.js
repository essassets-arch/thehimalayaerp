const fs = require('fs');
const path = require('path');

// 1. Patch SuperAdminPortal.jsx
const saPath = path.resolve(__dirname, '../frontend/modules/super-admin/pages/SuperAdminPortal.jsx');
let saContent = fs.readFileSync(saPath, 'utf8');
const saIsCRLF = saContent.includes('\r\n');
saContent = saContent.replace(/\r\n/g, '\n');

// 1a. Update fetchBroadcastHistory URL
saContent = saContent.replace(
  "const res = await apiClient.get('/notifications/broadcast-history');",
  "const res = await apiClient.get('/notifications/broadcast-history?sender=SUPER_ADMIN');"
);

// 1b. Update payload in handleSendNotification
const saPayloadTarget = `      const payload = {
        title: notifComposer.title.trim(),
        message: notifComposer.message.trim(),
        priority: notifComposer.priority || 'High',
        route: notifComposer.route || '/notifications'
      };`;
const saPayloadReplacement = `      const payload = {
        title: notifComposer.title.trim(),
        message: notifComposer.message.trim(),
        priority: notifComposer.priority || 'High',
        route: notifComposer.route || '/notifications',
        sender: 'SUPER_ADMIN',
        module: 'SUPER_ADMIN'
      };`;
if (saContent.includes(saPayloadTarget)) {
  saContent = saContent.replace(saPayloadTarget, saPayloadReplacement);
} else {
  console.log('saPayloadTarget not found, checking alternatives...');
}

// 1c. Update filteredBroadcastHistory
const saFilterTarget = `    const filteredBroadcastHistory = (broadcastHistory || []).filter(item => {
      if (notifHistoryFilter === 'ALL') return true;
      if (notifHistoryFilter === 'READ') return item.status === 'READ' || item.isRead;
      if (notifHistoryFilter === 'UNREAD') return item.status !== 'READ' && !item.isRead;
      return true;
    });`;
const saFilterReplacement = `    const filteredBroadcastHistory = (broadcastHistory || []).filter(item => {
      if (item.type && item.type !== 'BROADCAST') return false;
      if (item.module && item.module !== 'SUPER_ADMIN' && item.module !== 'SYSTEM') return false;
      if (notifHistoryFilter === 'ALL') return true;
      if (notifHistoryFilter === 'READ') return item.status === 'READ' || item.isRead;
      if (notifHistoryFilter === 'UNREAD') return item.status !== 'READ' && !item.isRead;
      return true;
    });`;
if (saContent.includes(saFilterTarget)) {
  saContent = saContent.replace(saFilterTarget, saFilterReplacement);
} else {
  console.log('saFilterTarget not found!');
}

// 1d. Empty state text
saContent = saContent.replace('No notifications logged yet.', 'No announcements dispatched yet by Super Admin.');

// 1e. Recipient badge
const saCardFooterTarget = `                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                        <div>
                          Recipient: <strong style={{ color: '#334155' }}>{recipientNameStr}</strong> {recipientRoleStr ? \`(\${recipientRoleStr})\` : ''}
                        </div>`;
const saCardFooterReplacement = `                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span>Recipient: <strong style={{ color: '#334155' }}>{recipientNameStr}</strong> {recipientRoleStr ? \`(\${recipientRoleStr})\` : ''}</span>
                          <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            Super Admin
                          </span>
                        </div>`;
if (saContent.includes(saCardFooterTarget)) {
  saContent = saContent.replace(saCardFooterTarget, saCardFooterReplacement);
}

if (saIsCRLF) saContent = saContent.replace(/\n/g, '\r\n');
fs.writeFileSync(saPath, saContent, 'utf8');
console.log('Successfully patched SuperAdminPortal.jsx');

// 2. Patch HRNotificationsView.jsx
const hrPath = path.resolve(__dirname, '../frontend/modules/hr/components/HRNotificationsView.jsx');
let hrContent = fs.readFileSync(hrPath, 'utf8');
const hrIsCRLF = hrContent.includes('\r\n');
hrContent = hrContent.replace(/\r\n/g, '\n');

// 2a. Update fetchBroadcastHistory URL
hrContent = hrContent.replace(
  "const res = await apiClient.get('/notifications/broadcast-history');",
  "const res = await apiClient.get('/notifications/broadcast-history?sender=HR');"
);

// 2b. Update payload in handleSendNotification
const hrPayloadTarget = `      const payload = {
        title: notifComposer.title.trim(),
        message: notifComposer.message.trim(),
        priority: notifComposer.priority || 'High',
        route: notifComposer.route || '/notifications'
      };`;
const hrPayloadReplacement = `      const payload = {
        title: notifComposer.title.trim(),
        message: notifComposer.message.trim(),
        priority: notifComposer.priority || 'High',
        route: notifComposer.route || '/notifications',
        sender: 'HR',
        module: 'HR'
      };`;
if (hrContent.includes(hrPayloadTarget)) {
  hrContent = hrContent.replace(hrPayloadTarget, hrPayloadReplacement);
} else {
  console.log('hrPayloadTarget not found!');
}

// 2c. Update filteredHistory
const hrFilterTarget = `  const filteredHistory = broadcastHistory.filter(item => {
    if (historyFilter === 'ALL') return true;
    if (historyFilter === 'READ') return item.status === 'READ' || item.isRead;
    if (historyFilter === 'UNREAD') return item.status !== 'READ' && !item.isRead;
    return true;
  });`;
const hrFilterReplacement = `  const filteredHistory = (broadcastHistory || []).filter(item => {
    if (item.type && item.type !== 'BROADCAST') return false;
    if (item.module && item.module !== 'HR') return false;
    if (historyFilter === 'ALL') return true;
    if (historyFilter === 'READ') return item.status === 'READ' || item.isRead;
    if (historyFilter === 'UNREAD') return item.status !== 'READ' && !item.isRead;
    return true;
  });`;
if (hrContent.includes(hrFilterTarget)) {
  hrContent = hrContent.replace(hrFilterTarget, hrFilterReplacement);
} else {
  console.log('hrFilterTarget not found!');
}

// 2d. Update empty state
hrContent = hrContent.replace('No notification history records found.', 'No announcements dispatched yet by HR.');

// 2e. Update card rendering
const hrCardRenderOld = `                  {filteredHistory.map((notif, idx) => {
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

const hrCardRenderNew = `                  {filteredHistory.map((notif, idx) => {
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
                          <strong style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '800' }}>{notif.title || 'Announcement'}</strong>
                          <span style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: '600', whiteSpace: 'nowrap' }}>
                            {dateStr}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, lineHeight: '1.4', wordBreak: 'break-word' }}>
                          {notif.message || '—'}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '4px', fontSize: '11.5px', color: '#64748b', fontWeight: '600' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span>Recipient: <strong style={{ color: '#334155' }}>{recipientNameStr}</strong> {recipientRoleStr ? \`(\${recipientRoleStr})\` : ''}</span>
                            <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                              HR Broadcast
                            </span>
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

if (hrContent.includes(hrCardRenderOld)) {
  hrContent = hrContent.replace(hrCardRenderOld, hrCardRenderNew);
} else {
  console.log('hrCardRenderOld not found!');
}

if (hrIsCRLF) hrContent = hrContent.replace(/\n/g, '\r\n');
fs.writeFileSync(hrPath, hrContent, 'utf8');
console.log('Successfully patched HRNotificationsView.jsx');
