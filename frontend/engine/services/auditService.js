export const createAuditLog = (auditLogs = [], { user, action, orderNo = '', remarks = '' }) => {
  const newLog = {
    id: 'AUD-' + (Date.now() + Math.random().toString().substr(2, 4)),
    user: user || 'System',
    action,
    orderNo,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    remarks
  };
  return [newLog, ...auditLogs];
};
