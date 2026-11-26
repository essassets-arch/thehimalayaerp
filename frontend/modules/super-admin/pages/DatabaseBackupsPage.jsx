'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  ShieldCheck,
  Lock,
  Mail,
  Calendar,
  Clock,
  Download,
  RefreshCw,
  Play,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Plus,
  Send,
  FileText,
  Check,
  X,
  Server,
  Key,
  Layers,
  Copy,
  Info,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import Swal from 'sweetalert2';
import { databaseBackupService } from '../services/databaseBackup.service';
import './DatabaseBackupsPage.css';

export default function DatabaseBackupsPage() {
  const [activeTab, setActiveTab] = useState('history'); // 'history', 'recipients', 'settings', 'recovery'
  const [loading, setLoading] = useState(true);
  const [runningBackup, setRunningBackup] = useState(false);
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [settings, setSettings] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);

  // New recipient modal state
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [addingRecipient, setAddingRecipient] = useState(false);
  const [inspectRecord, setInspectRecord] = useState(null);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    isEnabled: true,
    scheduleTime: '23:00',
    timezone: 'Asia/Kolkata',
    retentionDays: 30,
    chunkSizeMb: 20,
    smtpHost: '',
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: '',
    smtpPassword: '',
    smtpFrom: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewData, historyData, recipientsData, settingsData] = await Promise.all([
        databaseBackupService.getOverview().catch(() => null),
        databaseBackupService.getHistory(historyPage, 20, statusFilter).catch(() => ({ records: [], total: 0 })),
        databaseBackupService.getRecipients().catch(() => []),
        databaseBackupService.getSettings().catch(() => null),
      ]);

      if (overviewData) setOverview(overviewData);
      if (historyData) {
        setHistory(historyData.records || []);
        setHistoryTotal(historyData.total || 0);
      }
      if (recipientsData) setRecipients(recipientsData);
      if (settingsData) {
        setSettings(settingsData);
        setSettingsForm({
          isEnabled: settingsData.isEnabled ?? true,
          scheduleTime: settingsData.scheduleTime || '23:00',
          timezone: settingsData.timezone || 'Asia/Kolkata',
          retentionDays: settingsData.retentionDays || 30,
          chunkSizeMb: settingsData.chunkSizeMb || 20,
          smtpHost: settingsData.smtpHost || '',
          smtpPort: settingsData.smtpPort || 587,
          smtpSecure: settingsData.smtpSecure || false,
          smtpUser: settingsData.smtpUser || '',
          smtpPassword: '',
          smtpFrom: settingsData.smtpFrom || '',
        });
      }
    } catch (err) {
      console.error('Failed to load backup data:', err);
    } finally {
      setLoading(false);
    }
  }, [historyPage, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Manual Backup Trigger
  const handleRunBackupNow = async () => {
    const result = await Swal.fire({
      title: 'Execute Consistent Database Backup?',
      text: 'This generates a non-blocking PostgreSQL custom-format snapshot (-Fc), encrypts it with AES-256-GCM, computes SHA-256 checksum, attaches manifest.json, and delivers it to all active email recipients. Live ERP operations continue normally.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Run Backup Now',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#24345c',
      cancelButtonColor: '#64748b',
    });

    if (!result.isConfirmed) return;

    setRunningBackup(true);
    try {
      const res = await databaseBackupService.triggerManualBackup();
      await Swal.fire({
        title: 'Backup Completed & Delivered!',
        html: `
          <div style="text-align: left; font-size: 13.5px; line-height: 1.6; color: #24345c;">
            <p><strong>Execution ID:</strong> <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${res.executionId}</code></p>
            <p><strong>Archive Size:</strong> <b>${res.sizeFormatted}</b> (${res.chunksCount} part(s))</p>
            <p><strong>SHA-256 Checksum:</strong><br/><code style="word-break: break-all; font-size: 11.5px; background: #f8fafc; padding: 4px; border: 1px solid #e2e8f0; display: block; margin-top: 4px;">${res.checksumSha256}</code></p>
            <p style="color: #059669; font-weight: bold; margin-top: 10px;">✅ AES-256-GCM authenticated & delivered to configured recipients.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#10b981',
      });
      loadData();
    } catch (err) {
      Swal.fire({
        title: 'Backup Execution Error',
        text: err?.message || 'Failed to complete database backup',
        icon: 'error',
        confirmButtonColor: '#ef4444',
      });
    } finally {
      setRunningBackup(false);
    }
  };

  // Add Recipient
  const handleAddRecipient = async (e) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) {
      Swal.fire('Invalid Email', 'Please enter a valid email address.', 'warning');
      return;
    }

    setAddingRecipient(true);
    try {
      await databaseBackupService.createRecipient({
        email: newEmail.trim(),
        name: newName.trim() || undefined,
        isActive: true,
      });
      setShowAddRecipient(false);
      setNewEmail('');
      setNewName('');
      Swal.fire('Recipient Configured', 'The email recipient has been enrolled for daily backups.', 'success');
      loadData();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Failed to add recipient', 'error');
    } finally {
      setAddingRecipient(false);
    }
  };

  // Toggle Recipient Active
  const handleToggleRecipient = async (recipient) => {
    try {
      await databaseBackupService.updateRecipient(recipient.id, {
        isActive: !recipient.isActive,
      });
      loadData();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Failed to update recipient', 'error');
    }
  };

  // Delete Recipient
  const handleDeleteRecipient = async (recipient) => {
    const result = await Swal.fire({
      title: 'Remove Recipient?',
      text: `Are you sure you want to remove ${recipient.email} from automated backup delivery? Historical delivery records will be preserved.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Remove',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
    });

    if (!result.isConfirmed) return;

    try {
      await databaseBackupService.deleteRecipient(recipient.id);
      Swal.fire('Removed', 'Recipient removed successfully.', 'success');
      loadData();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Failed to delete recipient', 'error');
    }
  };

  // Test Email
  const handleSendTestEmail = async (email) => {
    try {
      Swal.fire({
        title: 'Dispatching Test Email...',
        text: `Sending verification message to ${email}`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const res = await databaseBackupService.sendTestEmail(email);
      if (res.success) {
        Swal.fire('Test Email Sent!', res.message, 'success');
      } else {
        Swal.fire('Delivery Failed', res.message, 'error');
      }
    } catch (err) {
      Swal.fire('Error', err?.message || 'Test email dispatch failed', 'error');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await databaseBackupService.updateSettings(settingsForm);
      Swal.fire('Configuration Saved', 'Backup schedule and SMTP transport settings have been updated.', 'success');
      loadData();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  // Test SMTP connection from settings
  const handleTestSmtpFromSettings = async () => {
    const testRecipient = settingsForm.smtpUser || (recipients[0]?.email) || 'super.admin@himalayaerp.com';
    setTestingSmtp(true);
    try {
      Swal.fire({
        title: 'Testing SMTP Handshake...',
        text: `Connecting to ${settingsForm.smtpHost || 'configured server'}...`,
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      const res = await databaseBackupService.sendTestEmail(testRecipient);
      if (res.success) {
        Swal.fire('SMTP Verified!', `Successfully connected and sent test message to ${testRecipient}.`, 'success');
      } else {
        Swal.fire('SMTP Test Failed', res.message, 'error');
      }
    } catch (err) {
      Swal.fire('SMTP Test Failed', err?.message || 'Connection failed', 'error');
    } finally {
      setTestingSmtp(false);
    }
  };

  // Download Archive
  const handleDownload = async (record) => {
    try {
      await databaseBackupService.downloadBackup(record.id, record.filename);
    } catch (err) {
      Swal.fire('Download Failed', err?.message || 'Failed to stream backup archive', 'error');
    }
  };

  // Copy to Clipboard helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: `${label} copied to clipboard`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const totalPages = Math.max(1, Math.ceil(historyTotal / 20));

  return (
    <div className="dbp-container">
      {/* ─── Header Banner Card ─────────────────────────────────────────── */}
      <div className="dbp-header-card">
        <div className="dbp-header-left">
          <div className="dbp-header-icon">
            <Database size={28} />
          </div>
          <div className="dbp-header-content">
            <div className="dbp-header-badges">
              <span className="dbp-badge-pill dbp-badge-live">
                <span className="dbp-pulse-dot" />
                Live Automated Protection
              </span>
              <span className="dbp-badge-pill dbp-badge-crypto">
                <Lock size={12} />
                AES-256-GCM Encrypted
              </span>
              <span className="dbp-badge-pill dbp-badge-crypto">
                <ShieldCheck size={12} />
                SHA-256 Integrity
              </span>
            </div>
            <h1 className="dbp-header-title">Database Backups & Disaster Recovery</h1>
            <p className="dbp-header-sub">
              Automated PostgreSQL consistent snapshots with Scrypt key derivation, AES-256-GCM encryption, multipart attachment chunking, and daily 11:00 PM IST email delivery.
            </p>
          </div>
        </div>

        <div className="dbp-header-actions">
          <button
            onClick={loadData}
            disabled={loading}
            className="dbp-btn dbp-btn-outline"
            title="Refresh Status"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleRunBackupNow}
            disabled={runningBackup}
            className="dbp-btn dbp-btn-success"
          >
            <Play size={15} className={`fill-current ${runningBackup ? 'animate-spin' : ''}`} />
            <span>{runningBackup ? 'Generating Backup...' : 'Run Backup Now'}</span>
          </button>
        </div>
      </div>

      {/* ─── Overview KPI Metric Cards ─────────────────────────────────── */}
      <div className="dbp-kpi-grid">
        {/* Card 1: Last Successful Backup */}
        <div className="dbp-kpi-card kpi-emerald">
          <div className="dbp-kpi-header">
            <span className="dbp-kpi-label">Latest Recovery Point</span>
            <div className="dbp-kpi-icon-wrap">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="dbp-kpi-value">
            {overview?.lastSuccessfulBackup?.sizeFormatted || '—'}
          </div>
          <div className="dbp-kpi-sub">
            <Clock size={13} />
            <span className="truncate">
              {overview?.lastSuccessfulBackup?.timestamp
                ? new Date(overview.lastSuccessfulBackup.timestamp).toLocaleString('en-GB', {
                    timeZone: 'Asia/Kolkata',
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) + ' IST'
                : 'No backups yet'}
            </span>
          </div>
          <span className="dbp-kpi-chip" style={{ background: '#ecfdf5', color: '#059669' }}>
            <Check size={12} /> AES-256 Verified
          </span>
        </div>

        {/* Card 2: Next Scheduled Backup */}
        <div className="dbp-kpi-card kpi-blue">
          <div className="dbp-kpi-header">
            <span className="dbp-kpi-label">Daily Schedule</span>
            <div className="dbp-kpi-icon-wrap">
              <Calendar size={18} />
            </div>
          </div>
          <div className="dbp-kpi-value">
            {overview?.nextScheduledBackup || '11:00 PM IST'}
          </div>
          <div className="dbp-kpi-sub">
            <span>Timezone: <b>{overview?.timezone || 'Asia/Kolkata'}</b></span>
          </div>
          <span className="dbp-kpi-chip" style={{ background: '#eff6ff', color: '#1e40af' }}>
            <Zap size={12} /> In-Process Cron Active
          </span>
        </div>

        {/* Card 3: Email Delivery Coverage */}
        <div className="dbp-kpi-card kpi-purple">
          <div className="dbp-kpi-header">
            <span className="dbp-kpi-label">Email Recipients</span>
            <div className="dbp-kpi-icon-wrap">
              <Mail size={18} />
            </div>
          </div>
          <div className="dbp-kpi-value">
            {overview?.activeRecipientCount || 0} Active
          </div>
          <div className="dbp-kpi-sub truncate" title={overview?.emailDeliveryStatus}>
            {overview?.emailDeliveryStatus || 'No recipients enrolled'}
          </div>
          <span className="dbp-kpi-chip" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            {overview?.chunkSizeMb || 20} MB Split Threshold
          </span>
        </div>

        {/* Card 4: Retention & Storage */}
        <div className="dbp-kpi-card kpi-amber">
          <div className="dbp-kpi-header">
            <span className="dbp-kpi-label">Archive Retention</span>
            <div className="dbp-kpi-icon-wrap">
              <Server size={18} />
            </div>
          </div>
          <div className="dbp-kpi-value">
            {overview?.retentionDays || 30} Days
          </div>
          <div className="dbp-kpi-sub">
            Total historical: <b>{overview?.totalSuccessfulBackups || 0}</b>
          </div>
          <span className="dbp-kpi-chip" style={{ background: '#fffbeb', color: '#b45309' }}>
            <Lock size={12} /> Latest Point Protected
          </span>
        </div>
      </div>

      {/* ─── Navigation Tabs Bar ────────────────────────────────────────── */}
      <div className="dbp-tabs-bar">
        <button
          onClick={() => setActiveTab('history')}
          className={`dbp-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          <Layers size={16} />
          <span>Execution History & Downloads</span>
          <span className="dbp-tab-count">{historyTotal}</span>
        </button>

        <button
          onClick={() => setActiveTab('recipients')}
          className={`dbp-tab-btn ${activeTab === 'recipients' ? 'active' : ''}`}
        >
          <Mail size={16} />
          <span>Email Recipients</span>
          <span className="dbp-tab-count">{recipients.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`dbp-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
        >
          <Clock size={16} />
          <span>Schedule & SMTP Transport</span>
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`dbp-tab-btn ${activeTab === 'recovery' ? 'active' : ''}`}
        >
          <Key size={16} />
          <span>Disaster Recovery SOP</span>
        </button>
      </div>

      {/* ─── TAB 1: Execution & History ─────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="dbp-card-panel">
          <div className="dbp-panel-header">
            <div className="dbp-panel-title">
              <span>Historical Backups & Telemetry</span>
              <span className="dbp-mono-tag">{historyTotal} total</span>
            </div>

            <div className="dbp-panel-actions">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="dbp-form-select"
                style={{ width: '160px', padding: '6px 10px', fontSize: '12px' }}
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          <div className="dbp-table-wrapper">
            <table className="dbp-table">
              <thead>
                <tr>
                  <th>Execution ID & Date</th>
                  <th>Type</th>
                  <th>Size & Parts</th>
                  <th>Security & Checksum</th>
                  <th>Verification</th>
                  <th>Email Deliveries</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '48px 16px', color: '#8893a7' }}>
                      No backup execution records found. Click <strong>Run Backup Now</strong> to generate your first backup.
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id}>
                      {/* Execution ID & Date */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#24345c', fontFamily: 'monospace' }}>
                          {record.executionId}
                        </div>
                        <div style={{ fontSize: '11px', color: '#5e6b82', marginTop: '2px' }}>
                          {new Date(record.startedAt).toLocaleString('en-GB', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          IST
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span
                          className="dbp-status-badge"
                          style={{
                            background:
                              record.executionType === 'SCHEDULED'
                                ? '#eff6ff'
                                : record.executionType === 'MANUAL'
                                ? '#f5f3ff'
                                : '#fffbeb',
                            color:
                              record.executionType === 'SCHEDULED'
                                ? '#1d4ed8'
                                : record.executionType === 'MANUAL'
                                ? '#6d28d9'
                                : '#b45309',
                          }}
                        >
                          {record.executionType}
                        </span>
                      </td>

                      {/* Size & Parts */}
                      <td>
                        <div style={{ fontWeight: 700, color: '#24345c' }}>{record.sizeFormatted}</div>
                        <div style={{ fontSize: '11px', color: '#5e6b82' }}>
                          {record.chunksCount} part(s) {record.durationMs ? `• ${(record.durationMs / 1000).toFixed(1)}s` : ''}
                        </div>
                      </td>

                      {/* Checksum & Algorithm */}
                      <td>
                        <div className="dbp-mono-tag">
                          <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={record.checksumSha256}>
                            {record.checksumSha256 ? `${record.checksumSha256.substring(0, 14)}...` : '—'}
                          </span>
                          {record.checksumSha256 && (
                            <button
                              onClick={() => copyToClipboard(record.checksumSha256, 'SHA-256 Checksum')}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#64748b' }}
                              title="Copy SHA-256 Checksum"
                            >
                              <Copy size={12} />
                            </button>
                          )}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#059669', fontWeight: 700, marginTop: '3px', textTransform: 'uppercase' }}>
                          {record.encryptionAlgorithm}
                        </div>
                      </td>

                      {/* Verification */}
                      <td>
                        {record.status === 'COMPLETED' ? (
                          <span className="dbp-status-badge dbp-status-completed">
                            <CheckCircle2 size={12} /> Verified Pass
                          </span>
                        ) : record.status === 'IN_PROGRESS' ? (
                          <span className="dbp-status-badge dbp-status-pending">
                            <RefreshCw size={12} className="animate-spin" /> In Progress
                          </span>
                        ) : (
                          <span className="dbp-status-badge dbp-status-failed" title={record.errorMessage}>
                            <AlertTriangle size={12} /> Failed
                          </span>
                        )}
                      </td>

                      {/* Deliveries */}
                      <td>
                        {record.deliveries && record.deliveries.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {record.deliveries.map((del, idx) => (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px' }}>
                                {del.status === 'SENT' ? (
                                  <Check size={12} style={{ color: '#10b981' }} />
                                ) : (
                                  <X size={12} style={{ color: '#ef4444' }} />
                                )}
                                <span style={{ fontFamily: 'monospace', color: '#334155' }}>{del.recipientEmail}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '11px' }}>None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setInspectRecord(record)}
                            className="dbp-btn dbp-btn-sm dbp-btn-outline"
                            title="Inspect Backup Manifest & Verification Details"
                          >
                            <Info size={12} />
                            <span>Details</span>
                          </button>
                          {record.hasFile ? (
                            <button
                              onClick={() => handleDownload(record)}
                              className="dbp-btn dbp-btn-sm dbp-btn-primary"
                              title="Download Encrypted Archive"
                            >
                              <Download size={12} />
                              <span>Download</span>
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '11px', fontStyle: 'italic', padding: '0 4px' }}>Pruned</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="dbp-pagination">
              <span className="dbp-page-indicator">
                Showing page <b>{historyPage}</b> of <b>{totalPages}</b> ({historyTotal} records)
              </span>
              <div className="dbp-page-controls">
                <button
                  disabled={historyPage <= 1}
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  className="dbp-btn dbp-btn-sm dbp-btn-outline"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  disabled={historyPage >= totalPages}
                  onClick={() => setHistoryPage((p) => p + 1)}
                  className="dbp-btn dbp-btn-sm dbp-btn-outline"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: Email Recipients ───────────────────────────────────── */}
      {activeTab === 'recipients' && (
        <div className="dbp-card-panel">
          <div className="dbp-panel-header">
            <div>
              <div className="dbp-panel-title">
                <Mail size={18} style={{ color: '#2563eb' }} />
                <span>Configured Daily Backup Recipients</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5e6b82' }}>
                Each verified recipient receives the encrypted daily PostgreSQL backup attachment at 11:00 PM IST.
              </p>
            </div>

            <button
              onClick={() => setShowAddRecipient(true)}
              className="dbp-btn dbp-btn-primary dbp-btn-sm"
            >
              <Plus size={14} /> Add Recipient
            </button>
          </div>

          {/* Recipients Table */}
          <div className="dbp-table-wrapper">
            <table className="dbp-table">
              <thead>
                <tr>
                  <th>Recipient Email</th>
                  <th>Name / Role</th>
                  <th>Status</th>
                  <th>Last Delivery</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recipients.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px 16px', color: '#8893a7' }}>
                      No recipients registered. Click <strong>Add Recipient</strong> to enroll your first email.
                    </td>
                  </tr>
                ) : (
                  recipients.map((rec) => (
                    <tr key={rec.id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#24345c' }}>{rec.email}</td>
                      <td style={{ color: '#5e6b82' }}>{rec.name || '—'}</td>
                      <td>
                        <button
                          onClick={() => handleToggleRecipient(rec)}
                          className={`dbp-status-badge ${rec.isActive ? 'dbp-status-completed' : 'dbp-status-pending'}`}
                          style={{ cursor: 'pointer', border: 'none' }}
                          title="Click to toggle active status"
                        >
                          {rec.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td style={{ color: '#5e6b82', fontSize: '11.5px' }}>
                        {rec.lastDeliveredAt
                          ? new Date(rec.lastDeliveredAt).toLocaleString('en-GB', {
                              timeZone: 'Asia/Kolkata',
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleSendTestEmail(rec.email)}
                            className="dbp-btn dbp-btn-sm dbp-btn-outline"
                            title="Send Verification Test Email"
                          >
                            <Send size={12} /> Test
                          </button>
                          <button
                            onClick={() => handleDeleteRecipient(rec)}
                            className="dbp-btn dbp-btn-sm dbp-btn-danger"
                            title="Remove Recipient"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 3: Schedule & Settings ─────────────────────────────────── */}
      {activeTab === 'settings' && (
        <div className="dbp-card-panel" style={{ maxWidth: '900px' }}>
          <div className="dbp-panel-header">
            <div>
              <div className="dbp-panel-title">
                <Clock size={18} style={{ color: '#2563eb' }} />
                <span>Backup Scheduler & SMTP Transport Configuration</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5e6b82' }}>
                Configure daily automatic execution, retention periods, multipart thresholds, and SMTP mailer parameters.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className="dbp-form-grid">
              {/* Section 1: Scheduler Controls */}
              <div className="dbp-form-group col-span-full">
                <div className="dbp-form-section-title">Automated Scheduler Parameters</div>
              </div>

              <div className="dbp-form-group col-span-full">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#24345c' }}>
                  <input
                    type="checkbox"
                    checked={settingsForm.isEnabled}
                    onChange={(e) => setSettingsForm({ ...settingsForm, isEnabled: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>Enable Daily Automated PostgreSQL Backup</span>
                </label>
              </div>

              <div className="dbp-form-group">
                <label className="dbp-form-label">Scheduled Time (24h)</label>
                <input
                  type="time"
                  value={settingsForm.scheduleTime}
                  onChange={(e) => setSettingsForm({ ...settingsForm, scheduleTime: e.target.value })}
                  className="dbp-form-input"
                  style={{ fontFamily: 'monospace' }}
                />
                <span className="dbp-form-hint">Default: 23:00 (11:00 PM IST)</span>
              </div>

              <div className="dbp-form-group">
                <label className="dbp-form-label">Timezone (Fixed)</label>
                <input
                  type="text"
                  disabled
                  value={settingsForm.timezone}
                  className="dbp-form-input"
                  style={{ background: '#f8fafc', color: '#64748b' }}
                />
                <span className="dbp-form-hint">Asia/Kolkata (IST Standard)</span>
              </div>

              <div className="dbp-form-group">
                <label className="dbp-form-label">Retention Window (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={settingsForm.retentionDays}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, retentionDays: parseInt(e.target.value, 10) || 30 })
                  }
                  className="dbp-form-input"
                />
                <span className="dbp-form-hint">Archives older than this will be pruned (latest is always protected)</span>
              </div>

              <div className="dbp-form-group">
                <label className="dbp-form-label">Attachment Split Threshold (MB)</label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={settingsForm.chunkSizeMb}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, chunkSizeMb: parseInt(e.target.value, 10) || 20 })
                  }
                  className="dbp-form-input"
                />
                <span className="dbp-form-hint">Archives exceeding this size are split into numbered parts (.part01, .part02)</span>
              </div>

              {/* Section 2: SMTP Mail Transport */}
              <div className="dbp-form-group col-span-full">
                <div className="dbp-form-section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>SMTP Mail Transport Settings</span>
                  <span style={{ fontSize: '11px', textTransform: 'none', color: settings?.hasSmtpPassword ? '#059669' : '#d97706' }}>
                    {settings?.hasSmtpPassword ? '✅ Password configured' : '⚠️ Password not set'}
                  </span>
                </div>
              </div>

              <div className="dbp-form-group">
                <label className="dbp-form-label">SMTP Host</label>
                <input
                  type="text"
                  value={settingsForm.smtpHost}
                  onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                  placeholder="e.g. smtp.gmail.com"
                  className="dbp-form-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="dbp-form-group">
                <label className="dbp-form-label">SMTP Port</label>
                <input
                  type="number"
                  value={settingsForm.smtpPort}
                  onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: parseInt(e.target.value, 10) || 587 })}
                  className="dbp-form-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="dbp-form-group">
                <label className="dbp-form-label">SMTP Username / Email</label>
                <input
                  type="text"
                  value={settingsForm.smtpUser}
                  onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                  placeholder="backups@thehimalaya.cloud"
                  className="dbp-form-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="dbp-form-group">
                <label className="dbp-form-label">SMTP Password / App Key</label>
                <input
                  type="password"
                  value={settingsForm.smtpPassword}
                  onChange={(e) => setSettingsForm({ ...settingsForm, smtpPassword: e.target.value })}
                  placeholder={settings?.hasSmtpPassword ? '••••••••••••••••' : 'Enter SMTP password'}
                  className="dbp-form-input"
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="dbp-form-group col-span-full">
                <label className="dbp-form-label">From Address Header</label>
                <input
                  type="text"
                  value={settingsForm.smtpFrom}
                  onChange={(e) => setSettingsForm({ ...settingsForm, smtpFrom: e.target.value })}
                  placeholder="Himalaya ERP Backups <backups@thehimalaya.cloud>"
                  className="dbp-form-input"
                />
              </div>
            </div>

            <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e5ecf5', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                disabled={testingSmtp}
                onClick={handleTestSmtpFromSettings}
                className="dbp-btn dbp-btn-outline"
              >
                <Send size={14} />
                <span>{testingSmtp ? 'Testing...' : 'Test SMTP Handshake'}</span>
              </button>

              <button
                type="submit"
                disabled={savingSettings}
                className="dbp-btn dbp-btn-primary"
              >
                <span>{savingSettings ? 'Saving Settings...' : 'Save Configuration'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 4: Disaster Recovery SOP ─────────────────────────────── */}
      {activeTab === 'recovery' && (
        <div className="dbp-card-panel" style={{ maxWidth: '960px' }}>
          <div className="dbp-panel-header">
            <div>
              <div className="dbp-panel-title">
                <Key size={18} style={{ color: '#059669' }} />
                <span>Disaster Recovery & Previous-Night Restoration Standard Operating Procedure (SOP)</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#5e6b82' }}>
                Protocol for decrypting, verifying, and restoring the previous night's verified database backup.
              </p>
            </div>
          </div>

          <div className="dbp-sop-wrapper">
            {/* Production Safety Warning Banner */}
            <div className="dbp-callout dbp-callout-amber">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13px' }}>
                <ShieldAlert size={18} style={{ color: '#d97706' }} />
                <span>STRICT PRODUCTION RESTORATION SAFETY DIRECTIVE</span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', lineHeight: 1.5 }}>
                To safeguard live business operations against accidental catastrophic overwrites, this dashboard <strong>deliberately contains zero direct restore buttons targeting the live production database</strong>. Restoration must always be performed in an isolated staging database first, verified by the Database Administrator, and executed via the emergency CLI procedure.
              </p>
            </div>

            {/* Step-by-Step Restoration Procedure */}
            <div className="dbp-step-card">
              <div className="dbp-step-header">
                <div className="dbp-step-number">1</div>
                <h3 className="dbp-step-title">Retrieve Encrypted Backup Archive & Checksum</h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#5e6b82', margin: 0 }}>
                Download the verified backup archive from your email inbox or via the <strong>Execution History</strong> tab. Note the SHA-256 checksum and ensure it matches the email notification manifest.
              </p>
            </div>

            <div className="dbp-step-card">
              <div className="dbp-step-header">
                <div className="dbp-step-number">2</div>
                <h3 className="dbp-step-title">Reassemble Multipart Parts (if applicable)</h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#5e6b82', margin: 0 }}>
                If the backup exceeded the split threshold and was delivered as multiple parts, concatenate them:
              </p>
              <pre className="dbp-code-block">cat himalaya_erp_backup_*.part* &gt; himalaya_erp_backup.sql.enc</pre>
            </div>

            <div className="dbp-step-card">
              <div className="dbp-step-header">
                <div className="dbp-step-number">3</div>
                <h3 className="dbp-step-title">Decrypt with Atomic Staging & Integrity Authentication</h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#5e6b82', margin: 0 }}>
                The backup is decrypted using your offline master secret (<code>BACKUP_ENCRYPTION_KEY</code>). The recovery utility streams decrypted plaintext into an isolated temporary file (<code>.tmp.decrypt</code>), verifies the 16-byte AES-GCM authentication tag and <code>PGDMP</code> magic header, and only atomically renames to the destination file upon 100% cryptographic success (preventing partial or corrupt plaintext from lingering):
              </p>
              <pre className="dbp-code-block">
export BACKUP_ENCRYPTION_KEY="your-offline-master-secret"<br/>
node scripts/recover-backup.js himalaya_erp_backup.sql.enc decrypted_backup.dump
              </pre>
            </div>

            <div className="dbp-step-card">
              <div className="dbp-step-header">
                <div className="dbp-step-number">4</div>
                <h3 className="dbp-step-title">Validate Archive Table of Contents (TOC)</h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#5e6b82', margin: 0 }}>
                Run native PostgreSQL <code>pg_restore --list</code> to inspect the catalog and schema integrity:
              </p>
              <pre className="dbp-code-block">pg_restore --list decrypted_backup.dump | head -n 30</pre>
            </div>

            <div className="dbp-step-card">
              <div className="dbp-step-header">
                <div className="dbp-step-number">5</div>
                <h3 className="dbp-step-title">Restore to Isolated Staging Database & Audit</h3>
              </div>
              <p style={{ fontSize: '12.5px', color: '#5e6b82', margin: 0 }}>
                Execute the audited isolated restoration script to restore into a dedicated staging target (<code>himalaya_erp_isolated_test</code>), verifying table row counts, indexes, and schema constraints:
              </p>
              <pre className="dbp-code-block">bash scripts/verify-isolated-restore.sh --confirm-isolated-test decrypted_backup.dump himalaya_erp_isolated_test</pre>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 1: Enroll Email Recipient ───────────────────────────── */}
      {showAddRecipient && (
        <div className="dbp-modal-backdrop" onClick={() => setShowAddRecipient(false)}>
          <div className="dbp-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dbp-modal-header">
              <div className="dbp-modal-title">
                <Mail size={18} style={{ color: '#0284c7' }} />
                <span>Enroll Daily Backup Recipient</span>
              </div>
              <button
                type="button"
                className="dbp-modal-close"
                onClick={() => setShowAddRecipient(false)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRecipient}>
              <div className="dbp-modal-body">
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748b', lineHeight: 1.5 }}>
                  The recipient will receive an encrypted copy of the daily PostgreSQL database backup attachment at 11:00 PM IST.
                </p>

                <div className="dbp-form-group">
                  <label className="dbp-form-label">Recipient Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="super.admin@himalayaerp.com"
                    className="dbp-form-input"
                  />
                  <span className="dbp-form-hint">Must be an active, monitored administrator email address.</span>
                </div>

                <div className="dbp-form-group">
                  <label className="dbp-form-label">Full Name / Operational Role</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Lead Database Administrator"
                    className="dbp-form-input"
                  />
                </div>
              </div>

              <div className="dbp-modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddRecipient(false)}
                  className="dbp-btn dbp-btn-outline dbp-btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingRecipient}
                  className="dbp-btn dbp-btn-primary dbp-btn-sm"
                >
                  {addingRecipient ? 'Enrolling...' : 'Save Recipient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Inspect Backup Cryptographic Manifest ────────────── */}
      {inspectRecord && (
        <div className="dbp-modal-backdrop" onClick={() => setInspectRecord(null)}>
          <div className="dbp-modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dbp-modal-header">
              <div className="dbp-modal-title">
                <ShieldCheck size={18} style={{ color: '#10b981' }} />
                <span>Backup Cryptographic Manifest & Audit</span>
              </div>
              <button
                type="button"
                className="dbp-modal-close"
                onClick={() => setInspectRecord(null)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="dbp-modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Execution ID</div>
                  <div style={{ fontSize: '12px', fontWeight: 750, color: '#0f172a', fontFamily: 'monospace', marginTop: '2px' }}>
                    {inspectRecord.executionId}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Status & Duration</div>
                  <div style={{ fontSize: '12px', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>
                    {inspectRecord.status} {inspectRecord.durationMs ? `(${(inspectRecord.durationMs / 1000).toFixed(1)}s)` : ''}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Cipher & Key Derivation</div>
                  <div style={{ fontSize: '12px', fontWeight: 750, color: '#047857', marginTop: '2px' }}>
                    {inspectRecord.encryptionAlgorithm} (Scrypt KDF)
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Archive Parts</div>
                  <div style={{ fontSize: '12px', fontWeight: 750, color: '#0f172a', marginTop: '2px' }}>
                    {inspectRecord.chunksCount} part(s) ({inspectRecord.sizeFormatted})
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 750, color: '#334155', marginBottom: '4px' }}>
                  SHA-256 Digest:
                </div>
                <div className="dbp-mono-tag" style={{ width: '100%', boxSizing: 'border-box', justifyContent: 'space-between' }}>
                  <span style={{ wordBreak: 'break-all' }}>{inspectRecord.checksumSha256 || '—'}</span>
                  {inspectRecord.checksumSha256 && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(inspectRecord.checksumSha256, 'SHA-256 Checksum')}
                      className="dbp-copy-btn"
                      title="Copy Checksum"
                    >
                      <Copy size={13} />
                    </button>
                  )}
                </div>
              </div>

              {inspectRecord.errorMessage && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '11px', color: '#b91c1c', fontWeight: 700 }}>Failure Error Log:</div>
                  <div style={{ fontSize: '12px', color: '#991b1b', fontFamily: 'monospace', marginTop: '2px' }}>
                    {inspectRecord.errorMessage}
                  </div>
                </div>
              )}

              <div>
                <div style={{ fontSize: '12px', fontWeight: 750, color: '#334155', marginBottom: '6px' }}>
                  Email Delivery Audit ({inspectRecord.deliveries?.length || 0} Recipients):
                </div>
                {inspectRecord.deliveries && inspectRecord.deliveries.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {inspectRecord.deliveries.map((del, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ fontFamily: 'monospace', color: '#0f172a' }}>{del.recipientEmail}</span>
                        <span
                          className={`dbp-status-badge ${
                            del.status === 'SENT' ? 'dbp-status-completed' : 'dbp-status-failed'
                          }`}
                        >
                          {del.status === 'SENT' ? 'Delivered' : 'Failed'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                    No delivery records logged for this execution.
                  </p>
                )}
              </div>
            </div>

            <div className="dbp-modal-footer">
              <button
                type="button"
                onClick={() => setInspectRecord(null)}
                className="dbp-btn dbp-btn-outline dbp-btn-sm"
              >
                Close
              </button>
              {inspectRecord.hasFile && (
                <button
                  type="button"
                  onClick={() => handleDownload(inspectRecord)}
                  className="dbp-btn dbp-btn-primary dbp-btn-sm"
                >
                  <Download size={13} />
                  <span>Download Archive</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
