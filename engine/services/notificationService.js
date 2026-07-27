export const createNotification = (notifications = [], { title, message, department, priority = 'Medium', referenceId = '' }) => {
  const newNotif = {
    id: Date.now() + Math.random(),
    title,
    message,
    department,
    priority,
    date: new Date().toISOString().split('T')[0],
    read: false,
    referenceId
  };
  return [newNotif, ...notifications];
};
