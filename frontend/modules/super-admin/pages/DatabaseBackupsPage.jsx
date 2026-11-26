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
} from 'lucide-react';
import Swal from 'sweetalert2';
import { databaseBackupService } from '../services/databaseBackup.service';

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

  // New recipient modal state
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [addingRecipient, setAddingRecipient] = useState(false);

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
      title: 'Run PostgreSQL Backup Now?',
      text: 'This will extract a consistent database snapshot, compress, encrypt with AES-256-GCM, verify integrity, and dispatch to all verified email recipients. Live ERP operations will not be interrupted.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Execute Backup',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
    });

    if (!result.isConfirmed) return;

    setRunningBackup(true);
    try {
      const res = await databaseBackupService.triggerManualBackup();
      await Swal.fire({
        title: 'Backup Completed & Dispatched!',
        html: `
          <div style="text-align: left; font-size: 14px;">
            <p><strong>Execution ID:</strong> <code>${res.executionId}</code></p>
            <p><strong>Archive Size:</strong> ${res.sizeFormatted}</p>
            <p><strong>Parts Count:</strong> ${res.chunksCount} part(s)</p>
            <p><strong>SHA-256:</strong> <code style="word-break: break-all;">${res.checksumSha256}</code></p>
            <p style="color: #16a34a; font-weight: bold; margin-top: 10px;">✅ AES-256-GCM encryption verified & dispatched to email recipients.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonColor: '#16a34a',
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
      Swal.fire('Recipient Added', 'The email recipient has been configured for daily backups.', 'success');
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
      Swal.fire('Settings Saved', 'Backup schedule and SMTP configuration updated successfully.', 'success');
      loadData();
    } catch (err) {
      Swal.fire('Error', err?.message || 'Failed to save settings', 'error');
    } finally {
      setSavingSettings(false);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 space-y-6">
      {/* ─── Header & Primary Controls ─────────────────────────────────── */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Enterprise Resilience & High Availability
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-400" />
            Database Backups & Disaster Recovery
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Automated PostgreSQL consistent snapshots with AES-256-GCM encryption, SHA-256 integrity checks, and daily 11:00 PM IST email delivery.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 flex items-center justify-center"
            title="Refresh Status"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleRunBackupNow}
            disabled={runningBackup}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-900/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Play className={`w-4 h-4 fill-current ${runningBackup ? 'animate-spin' : ''}`} />
            {runningBackup ? 'Generating Backup...' : 'Run Backup Now'}
          </button>
        </div>
      </div>

      {/* ─── Overview KPI Metric Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Last Successful Backup */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Latest Recovery Point</span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {overview?.lastSuccessfulBackup?.sizeFormatted || '—'}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {overview?.lastSuccessfulBackup?.timestamp
              ? new Date(overview.lastSuccessfulBackup.timestamp).toLocaleString('en-GB', {
                  timeZone: 'Asia/Kolkata',
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }) + ' IST'
              : 'No completed backups yet'}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
              <Check className="w-3 h-3" /> AES-256 Verified
            </span>
          </div>
        </div>

        {/* Card 2: Next Scheduled Backup */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Next Daily Run</span>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {overview?.nextScheduledBackup || '11:00 PM IST'}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Timezone: <span className="font-medium text-slate-700">{overview?.timezone || 'Asia/Kolkata'}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            Automatic scheduler: <span className="font-semibold text-emerald-700">Active</span>
          </div>
        </div>

        {/* Card 3: Email Delivery Coverage */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Email Recipients</span>
            <Mail className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {overview?.activeRecipientCount || 0} Active
          </div>
          <div className="text-xs text-slate-500 mt-1 truncate">
            {overview?.emailDeliveryStatus || 'No recipients configured'}
          </div>
          <div className="mt-2">
            <span className="text-[11px] bg-purple-50 text-purple-700 font-medium px-2 py-0.5 rounded">
              Multipart split: 20 MB threshold
            </span>
          </div>
        </div>

        {/* Card 4: Retention & Storage */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Local Archive Retention</span>
            <Server className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900">
            {overview?.retentionDays || 30} Days
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Total successful: <span className="font-semibold text-slate-700">{overview?.totalSuccessfulBackups || 0}</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3" /> Protected local volume
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ───────────────────────────────────────────── */}
      <div className="border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Execution History & Downloads
        </button>

        <button
          onClick={() => setActiveTab('recipients')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'recipients'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Mail className="w-4 h-4" />
          Email Recipients ({recipients.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'settings'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Clock className="w-4 h-4" />
          Schedule & SMTP Configuration
        </button>

        <button
          onClick={() => setActiveTab('recovery')}
          className={`py-3 px-4 font-semibold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
            activeTab === 'recovery'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Key className="w-4 h-4" />
          Disaster Recovery Procedure
        </button>
      </div>

      {/* ─── TAB 1: Execution & History ─────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>Historical Backups & Telemetry</span>
              <span className="text-xs bg-slate-200 px-2 py-0.5 rounded-full text-slate-600">
                {historyTotal} total
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setHistoryPage(1);
                }}
                className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/75 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Execution ID & Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size & Parts</th>
                  <th className="py-3 px-4">Security & Checksum</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Email Deliveries</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No backup execution records found. Click <strong>Run Backup Now</strong> to generate your first backup.
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition">
                      {/* Execution ID & Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-semibold text-slate-900">{record.executionId}</div>
                        <div className="text-[11px] text-slate-500 font-sans">
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
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                            record.executionType === 'SCHEDULED'
                              ? 'bg-blue-50 text-blue-700'
                              : record.executionType === 'MANUAL'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {record.executionType}
                        </span>
                      </td>

                      {/* Size & Parts */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{record.sizeFormatted}</div>
                        <div className="text-[11px] text-slate-500">
                          {record.chunksCount} part(s) {record.durationMs ? `• ${(record.durationMs / 1000).toFixed(1)}s` : ''}
                        </div>
                      </td>

                      {/* Checksum & Algorithm */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                          <span className="truncate max-w-[140px]" title={record.checksumSha256}>
                            {record.checksumSha256 ? `${record.checksumSha256.substring(0, 14)}...` : '—'}
                          </span>
                          {record.checksumSha256 && (
                            <button
                              onClick={() => copyToClipboard(record.checksumSha256, 'SHA-256 Checksum')}
                              className="text-slate-400 hover:text-slate-700"
                              title="Copy SHA-256"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold uppercase mt-0.5">
                          {record.encryptionAlgorithm}
                        </div>
                      </td>

                      {/* Verification */}
                      <td className="py-3.5 px-4">
                        {record.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-semibold text-[11px] px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Pass
                          </span>
                        ) : record.status === 'IN_PROGRESS' ? (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 font-semibold text-[11px] px-2 py-0.5 rounded">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 font-semibold text-[11px] px-2 py-0.5 rounded" title={record.errorMessage}>
                            <AlertTriangle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>

                      {/* Deliveries */}
                      <td className="py-3.5 px-4">
                        {record.deliveries && record.deliveries.length > 0 ? (
                          <div className="space-y-1">
                            {record.deliveries.map((del, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                                {del.status === 'SENT' ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <X className="w-3 h-3 text-red-600" />
                                )}
                                <span className="font-mono text-slate-700">{del.recipientEmail}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">None</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {record.hasFile ? (
                          <button
                            onClick={() => handleDownload(record)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-xs transition"
                            title="Download Encrypted Archive"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Pruned (Retention)</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB 2: Email Recipients ───────────────────────────────────── */}
      {activeTab === 'recipients' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Configured Daily Backup Recipients
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Each verified recipient receives the encrypted daily PostgreSQL backup attachment at 11:00 PM IST.
              </p>
            </div>

            <button
              onClick={() => setShowAddRecipient(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" /> Add Recipient
            </button>
          </div>

          {/* Add Recipient Inline/Modal */}
          {showAddRecipient && (
            <form
              onSubmit={handleAddRecipient}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 max-w-lg"
            >
              <h3 className="text-sm font-bold text-slate-800">Add New Backup Recipient</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="admin@himalayaerp.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Name / Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Chief Systems Officer"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={addingRecipient}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition disabled:opacity-50"
                >
                  {addingRecipient ? 'Adding...' : 'Save Recipient'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddRecipient(false)}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Recipients Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-600 uppercase font-bold tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Recipient Email</th>
                  <th className="py-3 px-4">Name / Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Delivery</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recipients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      No recipients registered. Click <strong>Add Recipient</strong> above to register an email.
                    </td>
                  </tr>
                ) : (
                  recipients.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{rec.email}</td>
                      <td className="py-3 px-4 text-slate-600">{rec.name || '—'}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleRecipient(rec)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                            rec.isActive
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {rec.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-slate-500">
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
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleSendTestEmail(rec.email)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-xs transition"
                          title="Send Verification Test Email"
                        >
                          <Send className="w-3 h-3" /> Test
                        </button>
                        <button
                          onClick={() => handleDeleteRecipient(rec)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs transition"
                          title="Remove Recipient"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
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
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 max-w-4xl space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Backup Scheduler & SMTP Delivery Configuration
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure daily automatic execution, retention periods, multipart thresholds, and SMTP mailer parameters.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Scheduler Controls */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
                Automated Scheduler
              </h3>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isEnabled"
                  checked={settingsForm.isEnabled}
                  onChange={(e) => setSettingsForm({ ...settingsForm, isEnabled: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <label htmlFor="isEnabled" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Enable Daily Automated PostgreSQL Backup
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Scheduled Execution Time (24h)
                  </label>
                  <input
                    type="time"
                    value={settingsForm.scheduleTime}
                    onChange={(e) => setSettingsForm({ ...settingsForm, scheduleTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Default: 23:00 (11:00 PM)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Timezone (Fixed)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={settingsForm.timezone}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-xs"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Asia/Kolkata (IST Standard)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Retention Window (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={settingsForm.retentionDays}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, retentionDays: parseInt(e.target.value, 10) || 30 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Archives older than this will be purged</span>
                </div>
              </div>
            </div>

            {/* Attachment Splitting */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs border-b border-slate-100 pb-1">
                Email Multipart Attachment Splitting
              </h3>
              <div className="max-w-xs">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attachment Split Threshold (MB)
                </label>
                <input
                  type="number"
                  min={5}
                  max={50}
                  value={settingsForm.chunkSizeMb}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, chunkSizeMb: parseInt(e.target.value, 10) || 20 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Archives exceeding this size are split into numbered parts (.part01, .part02) with a manifest.json.
                </span>
              </div>
            </div>

            {/* SMTP Transport Settings */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs">
                  SMTP Mail Transport
                </h3>
                <span className="text-[11px] text-slate-500">
                  {settings?.hasSmtpPassword ? '✅ Password configured' : '⚠️ Password not set'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SMTP Host
                  </label>
                  <input
                    type="text"
                    value={settingsForm.smtpHost}
                    onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                    placeholder="e.g. smtp.gmail.com or mail.thehimalaya.cloud"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    value={settingsForm.smtpPort}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, smtpPort: parseInt(e.target.value, 10) || 587 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SMTP Username / Email
                  </label>
                  <input
                    type="text"
                    value={settingsForm.smtpUser}
                    onChange={(e) => setSettingsForm({ ...settingsForm, smtpUser: e.target.value })}
                    placeholder="backups@himalayaerp.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SMTP Password / App Key
                  </label>
                  <input
                    type="password"
                    value={settingsForm.smtpPassword}
                    onChange={(e) => setSettingsForm({ ...settingsForm, smtpPassword: e.target.value })}
                    placeholder={settings?.hasSmtpPassword ? '••••••••••••••••' : 'Enter SMTP password'}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  From Address (Header)
                </label>
                <input
                  type="text"
                  value={settingsForm.smtpFrom}
                  onChange={(e) => setSettingsForm({ ...settingsForm, smtpFrom: e.target.value })}
                  placeholder="Himalaya ERP Backups &lt;backups@himalayaerp.com&gt;"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg text-xs transition shadow disabled:opacity-50"
              >
                {savingSettings ? 'Saving Settings...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── TAB 4: Disaster Recovery Guide ─────────────────────────────── */}
      {activeTab === 'recovery' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              Disaster Recovery & Previous-Night Restoration Standard Operating Procedure (SOP)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Protocol for decrypting, verifying, and restoring the previous night's verified database backup.
            </p>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Production Restoration Safety Directive
            </h4>
            <p className="text-xs text-amber-900 mt-1 leading-relaxed">
              To prevent accidental catastrophic overwrites of live ERP operations, this dashboard <strong>deliberately contains zero direct restore buttons targeting the production database</strong>. Restoration must always be performed in an isolated staging database first, validated by the authorized Database Administrator, and executed via the emergency CLI procedure.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Step-by-Step Restoration Procedure:</h3>

            <ol className="list-decimal list-inside space-y-3 text-xs text-slate-700 leading-relaxed">
              <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Step 1: Retrieve Encrypted Backup Archive & Checksum</strong>
                <p className="text-slate-500 mt-1">
                  Download the latest verified backup archive from your email inbox or via the <strong>Execution History</strong> tab. Note the SHA-256 checksum and ensure it matches the email notification manifest.
                </p>
              </li>

              <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Step 2: Reassemble Multipart Parts (if applicable)</strong>
                <p className="text-slate-500 mt-1">
                  If the backup was split across multiple parts, combine them into the single encrypted archive:
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-2 rounded mt-2 font-mono text-[11px] overflow-x-auto">
cat himalaya_erp_backup_*.part* &gt; himalaya_erp_backup.sql.enc
                </pre>
              </li>

              <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Step 3: Decrypt with Atomic Staging & Integrity Authentication</strong>
                <p className="text-slate-500 mt-1">
                  The backup is decrypted using the AES-256 secret (<code>BACKUP_ENCRYPTION_KEY</code>). The recovery utility decrypts into an isolated temporary file, validates the 16-byte GCM authentication tag and <code>PGDMP</code> magic header, and only atomically renames to the destination file upon 100% cryptographic success (preventing partial or corrupt plaintext from lingering):
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-2 rounded mt-2 font-mono text-[11px] overflow-x-auto">
# Set your offline vault encryption key and run the atomic recovery script:
export BACKUP_ENCRYPTION_KEY="your-offline-master-secret-hex-or-passphrase"
node scripts/recover-backup.js himalaya_erp_backup.sql.enc decrypted_backup.dump
                </pre>
              </li>

              <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Step 4: Validate Archive Table of Contents (TOC)</strong>
                <p className="text-slate-500 mt-1">
                  Run <code>pg_restore --list</code> to verify the archive catalog and schema integrity:
                </p>
                <pre className="bg-slate-900 text-emerald-400 p-2 rounded mt-2 font-mono text-[11px] overflow-x-auto">
pg_restore --list decrypted_backup.dump | head -n 30
                </pre>
              </li>

              <li className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <strong>Step 5: Restore to Isolated Test Database & Audit</strong>
                <p className="text-slate-500 mt-1">
                  Restore into an isolated PostgreSQL database (e.g. <code>himalaya_erp_recovery_test</code>) to verify table row counts and schema integrity before conducting any live switchover.
                </p>
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
