import { useEffect, useMemo, useState } from 'react';
import { Bell, X } from 'lucide-react';

export default function ReminderModal({
  open,
  onClose,
  onSave,
  customerName = '',
  initialValues = null,
  title = 'Create Reminder'
}) {
  const tomorrowStr = useMemo(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const [reminderDate, setReminderDate] = useState(
    initialValues?.reminderDate || tomorrowStr
  );
  const [remarks, setRemarks] = useState(initialValues?.remarks || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReminderDate(initialValues?.reminderDate || tomorrowStr);
    setRemarks(initialValues?.remarks || '');
    setSaving(false);
  }, [open, initialValues, tomorrowStr]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reminderDate) {
      alert('Reminder date is required.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        reminderDate,
        reminderTime: initialValues?.reminderTime || null,
        reminderType: initialValues?.reminderType || 'Follow-up',
        priority: initialValues?.priority || 'Medium',
        remarks: remarks.trim()
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay active" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ width: '480px', maxWidth: '95vw' }}>
        <div className="modal-header-row">
          <h3 className="modal-title-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} /> {title}
          </h3>
          <button type="button" className="modal-close-btn" onClick={onClose}><X size={16} /></button>
        </div>

        {customerName && (
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '0 0 16px 0' }}>
            Customer: <strong style={{ color: 'var(--color-text-primary)' }}>{customerName}</strong>
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Reminder Date *</label>
            <input
              type="date"
              className="form-input"
              value={reminderDate}
              onChange={(e) => setReminderDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Remarks</label>
            <textarea
              className="form-textarea"
              style={{ minHeight: '90px' }}
              placeholder="Add context for this follow-up..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="form-actions" style={{ marginTop: '8px' }}>
            <button type="submit" className="form-submit-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Reminder'}
            </button>
            <button type="button" className="btn-small btn-outline-small" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
