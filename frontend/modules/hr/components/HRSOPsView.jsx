'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FileText, CheckCircle2, Clock, ShieldCheck, Plus, Edit3, Trash2, 
  Printer, Download, Search, Filter, RefreshCw, ChevronRight, AlertCircle,
  Eye, Check, X, Calendar, User, Building, Award, History, Layers, 
  Bookmark, ArrowUpRight, HelpCircle, Save, Share2, ClipboardList
} from 'lucide-react';
import styles from './hr-sops.module.css';
import { 
  INITIAL_DOCUMENT_CONTROL, 
  INITIAL_REVISION_HISTORY, 
  INITIAL_HR_FORMS, 
  SOP_CATEGORIES 
} from '../data/hrSopsData';
import { useNotificationStore } from '@/store/notificationStore';
import { 
  FULL_HR_MANUAL_TEXT, 
  getSingleBlankFormText, 
  printSingleBlankForm,
  downloadSingleBlankFormPDF,
  printMasterManual,
  downloadMasterManualPDF,
  printDocControlSpec,
  downloadDocControlSpecPDF,
  printSubmission,
  downloadSubmissionPDF,
  downloadCurrentFormPDF,
  printCurrentForm,
  downloadElementAsPDF,
  printDocumentHtml,
  downloadCSV,
  downloadJSON
} from '../data/hrPhysicalForms';

const STORAGE_KEY_SOPS = 'himalaya_hr_sops_data_v1';
const STORAGE_KEY_REVISIONS = 'himalaya_hr_revision_history_v1';
const STORAGE_KEY_SUBMISSIONS = 'himalaya_hr_form_submissions_v1';
const STORAGE_KEY_DOC_CONTROL = 'himalaya_hr_doc_control_v1';

export default function HRSOPsView() {
  const showToast = useNotificationStore(s => s.showToast);

  // ── States ──
  const [docControl, setDocControl] = useState(INITIAL_DOCUMENT_CONTROL);
  const [revisions, setRevisions] = useState(INITIAL_REVISION_HISTORY);
  const [forms, setForms] = useState(INITIAL_HR_FORMS);
  const [submissions, setSubmissions] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'submissions' | 'doc_control'

  // Modals
  const [fillingForm, setFillingForm] = useState(null); // Form being viewed / filled
  const [formViewMode, setFormViewMode] = useState('digital'); // 'digital' | 'physical'
  const [editingSOP, setEditingSOP] = useState(null); // SOP being edited
  const [isNewSOPModalOpen, setIsNewSOPModalOpen] = useState(false);
  const [isDocControlModalOpen, setIsDocControlModalOpen] = useState(false);
  const [isAddRevisionModalOpen, setIsAddRevisionModalOpen] = useState(false);

  // Printable ref
  const printContainerRef = useRef(null);

  // ── Load / Save to LocalStorage ──
  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem(STORAGE_KEY_DOC_CONTROL);
      if (savedDocs) setDocControl(JSON.parse(savedDocs));

      const savedRevs = localStorage.getItem(STORAGE_KEY_REVISIONS);
      if (savedRevs) setRevisions(JSON.parse(savedRevs));

      const savedForms = localStorage.getItem(STORAGE_KEY_SOPS);
      if (savedForms) setForms(JSON.parse(savedForms));

      const savedSubs = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
      if (savedSubs) setSubmissions(JSON.parse(savedSubs));
    } catch (e) {
      console.error('Error loading SOPs data from localStorage:', e);
    }
  }, []);

  const persistData = (newForms, newRevs, newSubs, newDocControl) => {
    try {
      if (newForms) {
        setForms(newForms);
        localStorage.setItem(STORAGE_KEY_SOPS, JSON.stringify(newForms));
      }
      if (newRevs) {
        setRevisions(newRevs);
        localStorage.setItem(STORAGE_KEY_REVISIONS, JSON.stringify(newRevs));
      }
      if (newSubs) {
        setSubmissions(newSubs);
        localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(newSubs));
      }
      if (newDocControl) {
        setDocControl(newDocControl);
        localStorage.setItem(STORAGE_KEY_DOC_CONTROL, JSON.stringify(newDocControl));
      }
    } catch (e) {
      console.error('Error saving SOPs data to localStorage:', e);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all SOPs and HR Forms to ISO Master factory defaults? Any custom SOPs will be cleared.')) {
      setDocControl(INITIAL_DOCUMENT_CONTROL);
      setRevisions(INITIAL_REVISION_HISTORY);
      setForms(INITIAL_HR_FORMS);
      localStorage.removeItem(STORAGE_KEY_DOC_CONTROL);
      localStorage.removeItem(STORAGE_KEY_REVISIONS);
      localStorage.removeItem(STORAGE_KEY_SOPS);
      showToast('HR Forms & SOPs reset to ISO Master factory defaults.');
    }
  };

  // ── Filtered Forms ──
  const filteredForms = useMemo(() => {
    return forms.filter(f => {
      const matchesCat = selectedCategory === 'All' || f.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        f.formNo.toLowerCase().includes(q) || 
        f.title.toLowerCase().includes(q) || 
        f.description.toLowerCase().includes(q) || 
        f.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [forms, selectedCategory, searchQuery]);

  // ── Print Trigger ──
  const handlePrint = () => {
    window.print();
  };

  // ── Form Filling Handlers ──
  const handleOpenFillForm = (form, mode = 'digital') => {
    // Create deep copy for editing/filling
    setFillingForm(JSON.parse(JSON.stringify(form)));
    setFormViewMode(mode);
  };

  const handleSaveSubmission = () => {
    if (!fillingForm) return;

    const newSubmission = {
      id: `SUB-${Date.now().toString().slice(-6)}`,
      formId: fillingForm.id,
      formNo: fillingForm.formNo,
      title: fillingForm.title,
      category: fillingForm.category,
      revision: fillingForm.revision,
      submittedAt: new Date().toISOString(),
      submittedBy: fillingForm.signatories?.preparedBy?.name || 'HR Executive',
      formData: fillingForm,
      status: 'Recorded'
    };

    const updated = [newSubmission, ...submissions];
    persistData(null, null, updated, null);
    showToast(`Form ${fillingForm.formNo} successfully saved to Submissions Archive.`);
    setFillingForm(null);
  };

  // ── Add New SOP / Form ──
  const [newSOPForm, setNewSOPForm] = useState({
    formNo: `HR-F-${forms.length + 1 < 10 ? '0' : ''}${forms.length + 1}`,
    title: '',
    category: 'Recruitment & Onboarding',
    revision: '00',
    effectiveDate: new Date().toISOString().split('T')[0],
    description: '',
    purpose: '',
    formType: 'custom_checklist',
    checklistItems: [
      { id: 1, item: 'Verify basic employee credentials', required: 'Yes', remarks: '' },
      { id: 2, item: 'Department head endorsement', required: 'Yes', remarks: '' }
    ]
  });

  const handleCreateSOP = (e) => {
    e.preventDefault();
    if (!newSOPForm.title.trim()) {
      alert('Please enter SOP / Form title.');
      return;
    }

    const created = {
      id: newSOPForm.formNo,
      formNo: newSOPForm.formNo,
      title: newSOPForm.title,
      category: newSOPForm.category,
      revision: newSOPForm.revision,
      effectiveDate: newSOPForm.effectiveDate,
      description: newSOPForm.description || 'Standard Operating Procedure and compliance record.',
      purpose: newSOPForm.purpose || 'Establishes structured internal controls.',
      formType: 'custom_checklist',
      items: newSOPForm.checklistItems.map(item => ({
        id: item.id,
        item: item.item,
        required: item.required,
        submitted: false,
        remarks: ''
      })),
      signatories: {
        preparedBy: { name: '', signature: '', date: '' },
        verifiedBy: { name: '', signature: '', date: '' },
        approvedBy: { name: '', signature: '', date: '' }
      }
    };

    const updatedForms = [...forms, created];
    persistData(updatedForms, null, null, null);
    setIsNewSOPModalOpen(false);
    showToast(`New SOP ${created.formNo}: "${created.title}" successfully added.`);

    // Reset create state
    setNewSOPForm({
      formNo: `HR-F-${updatedForms.length + 1 < 10 ? '0' : ''}${updatedForms.length + 1}`,
      title: '',
      category: 'Recruitment & Onboarding',
      revision: '00',
      effectiveDate: new Date().toISOString().split('T')[0],
      description: '',
      purpose: '',
      formType: 'custom_checklist',
      checklistItems: [
        { id: 1, item: 'Initial verification and intake', required: 'Yes', remarks: '' },
        { id: 2, item: 'Managerial signoff and filing', required: 'Yes', remarks: '' }
      ]
    });
  };

  // ── Edit / Update Existing SOP ──
  const handleOpenEditSOP = (form) => {
    setEditingSOP(JSON.parse(JSON.stringify(form)));
  };

  const handleSaveEditedSOP = (e) => {
    e.preventDefault();
    if (!editingSOP) return;

    const oldForm = forms.find(f => f.id === editingSOP.id);
    const revChanged = oldForm && oldForm.revision !== editingSOP.revision;

    const updatedForms = forms.map(f => f.id === editingSOP.id ? editingSOP : f);

    // If revision changed, log in Revision History
    let updatedRevs = revisions;
    if (revChanged) {
      const newRevEntry = {
        revision: editingSOP.revision,
        date: new Date().toISOString().split('T')[0],
        description: `Updated SOP ${editingSOP.formNo}: ${editingSOP.title} revision notes`,
        preparedBy: 'HR Department',
        approvedBy: 'Management'
      };
      updatedRevs = [newRevEntry, ...revisions];
    }

    persistData(updatedForms, updatedRevs, null, null);
    setEditingSOP(null);
    showToast(`SOP ${editingSOP.formNo} successfully updated.`);
  };

  // ── Add Revision Log Entry ──
  const [newRevEntry, setNewRevEntry] = useState({
    revision: '02',
    date: new Date().toISOString().split('T')[0],
    description: '',
    preparedBy: 'HR Department',
    approvedBy: 'Management'
  });

  const handleAddRevision = (e) => {
    e.preventDefault();
    if (!newRevEntry.description.trim()) {
      alert('Please enter description of change.');
      return;
    }
    const updated = [newRevEntry, ...revisions];
    persistData(null, updated, null, null);
    setIsAddRevisionModalOpen(false);
    showToast(`Revision ${newRevEntry.revision} successfully logged in Document Control.`);
  };

  return (
    <div className={styles.pageContainer}>
      {/* ── Top Hero Banner ── */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <div className={styles.heroIconWrap}>
            <Bookmark size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 className={styles.heroTitle}>Human Resources Forms & SOPs</h1>
              <span className={styles.heroTag}>ISO 9001:2015</span>
              <span className={styles.heroTag}>Doc: {docControl.documentNo}</span>
              <span className={styles.heroTag}>Rev: {docControl.revisionNo}</span>
            </div>
            <p className={styles.heroSubtitle}>
              <span>{docControl.company}</span>
              <span>•</span>
              <span>{docControl.department}</span>
              <span>•</span>
              <span style={{ color: '#38bdf8' }}>{forms.length} Standard Operating Formats</span>
            </p>
          </div>
        </div>

        <div className={styles.heroActions}>
          <button 
            className={styles.btnSecondary}
            onClick={() => {
              downloadMasterManualPDF(docControl);
              showToast('Generating Master Blank Forms Manual (PDF)...');
            }}
            title="Download Complete Blank HR Forms Manual as High-Quality PDF"
          >
            <Download size={15} /> Download Master Manual (PDF)
          </button>
          <button 
            className={styles.btnGhost}
            onClick={() => {
              printMasterManual(docControl);
              showToast('Opening Print Preview for Master Forms Manual...');
            }}
            title="Print Complete Blank HR Forms Manual"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.25)' }}
          >
            <Printer size={15} /> Print Master Manual
          </button>
          <button 
            className={styles.btnSecondary}
            onClick={() => setIsDocControlModalOpen(true)}
            title="View Document Control Master Specification"
          >
            <ShieldCheck size={16} /> Document Control
          </button>
          <button 
            className={styles.btnPrimary}
            onClick={() => setIsNewSOPModalOpen(true)}
          >
            <Plus size={16} /> Add New SOP
          </button>
        </div>
      </div>

      {/* ── KPI Stats Row ── */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#f0f9ff', color: '#0284c7' }}>
            <FileText size={22} />
          </div>
          <div>
            <div className={styles.statLabel}>Total Standard Forms</div>
            <div className={styles.statValue}>{forms.length}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#f0fdf4', color: '#16a34a' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className={styles.statLabel}>Active Controlled</div>
            <div className={styles.statValue}>100%</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#fef3c7', color: '#d97706' }}>
            <History size={22} />
          </div>
          <div>
            <div className={styles.statLabel}>Audit Revisions</div>
            <div className={styles.statValue}>{revisions.length}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <Layers size={22} />
          </div>
          <div>
            <div className={styles.statLabel}>Recorded Submissions</div>
            <div className={styles.statValue}>{submissions.length}</div>
          </div>
        </div>
      </div>

      {/* ── Toolbar & Category Tabs ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarTop}>
          <div className={styles.tabBtnGroup}>
            <button 
              className={activeTab === 'catalog' ? styles.btnPrimary : styles.btnSecondary}
              onClick={() => setActiveTab('catalog')}
            >
              <FileText size={15} /> SOP & Forms Catalog ({filteredForms.length})
            </button>
            <button 
              className={activeTab === 'submissions' ? styles.btnPrimary : styles.btnSecondary}
              onClick={() => setActiveTab('submissions')}
            >
              <History size={15} /> Submissions Archive ({submissions.length})
            </button>
          </div>

          <div className={styles.searchRowMobile} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} size={16} />
              <input 
                type="text"
                className={styles.searchInput}
                placeholder="Search by Form No (e.g. HR-F-01), title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              className={styles.btnGhost}
              onClick={handleResetToDefaults}
              title="Reset to ISO master defaults"
              style={{ flexShrink: 0, padding: '7px 10px', fontSize: '12px' }}
            >
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>

        {activeTab === 'catalog' && (
          <div className={styles.categoryPills}>
            {SOP_CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.categoryPill} ${selectedCategory === cat ? styles.categoryPillActive : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Tab 1: Catalog View ── */}
      {activeTab === 'catalog' && (
        <>
          {filteredForms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <AlertCircle size={40} style={{ color: '#94a3b8', margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b', margin: '0 0 6px 0' }}>No Forms Found</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Try clearing search keywords or selecting another category.</p>
            </div>
          ) : (
            <div className={styles.formsGrid}>
              {filteredForms.map((form) => (
                <div key={form.id} className={styles.formCard}>
                  <div>
                    <div className={styles.cardHeader}>
                      <span className={styles.formBadge}>
                        <CheckCircle2 size={12} /> {form.formNo}
                      </span>
                      <span className={styles.revBadge}>Rev: {form.revision}</span>
                    </div>

                    <h3 className={styles.cardTitle}>{form.title}</h3>
                    <div className={styles.cardCategory}>
                      <Bookmark size={12} /> {form.category}
                    </div>

                    <p className={styles.cardDesc} style={{ marginTop: '10px' }}>
                      {form.description}
                    </p>
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.cardActions}>
                      <button 
                        className={styles.btnPrimary}
                        onClick={() => handleOpenFillForm(form, 'digital')}
                        title="Open interactive form to fill and sign online"
                      >
                        <Eye size={13} /> Fill
                      </button>
                      <button 
                        className={styles.btnSecondary}
                        onClick={() => handleOpenFillForm(form, 'physical')}
                        title="View printable physical blank form with ________ lines"
                      >
                        <FileText size={13} /> Physical Blank
                      </button>
                    </div>

                    <div className={styles.cardDownloadRow}>
                      <button 
                        className={styles.btnGhost}
                        onClick={() => handleOpenEditSOP(form)}
                        title="Edit SOP definition & checklist"
                      >
                        <Edit3 size={12} /> Edit
                      </button>
                      <button 
                        className={styles.btnGhost}
                        onClick={() => {
                          downloadSingleBlankFormPDF(form, docControl);
                          showToast(`Generating ${form.formNo} High-Quality PDF...`);
                        }}
                        title="Download Blank Physical Form (High-Quality PDF)"
                      >
                        <Download size={12} /> PDF
                      </button>
                      <button 
                        className={styles.btnGhost}
                        onClick={() => {
                          printSingleBlankForm(form, docControl);
                          showToast(`Opening Print Preview for ${form.formNo}...`);
                        }}
                        title="Print official blank physical template"
                      >
                        <Printer size={12} /> Print
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Tab 2: Submissions Archive ── */}
      {activeTab === 'submissions' && (
        <div className={styles.submissionsContainer}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                HR Form Submissions Archive
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Showing {submissions.length} saved records
              </span>
            </div>
            {submissions.length > 0 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={styles.btnSecondary}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => {
                    downloadCSV(
                      `Himalaya_HR_Submissions_${new Date().toISOString().split('T')[0]}.csv`,
                      ['Submission ID', 'Form Code', 'Form Title', 'Category', 'Revision', 'Date Recorded', 'Recorded By', 'Status'],
                      submissions.map(s => [s.id, s.formNo, s.title, s.category, s.revision || '00', new Date(s.submittedAt).toLocaleDateString(), s.submittedBy, s.status])
                    );
                    showToast('Exported submissions to CSV spreadsheet.');
                  }}
                  title="Export all submissions to CSV spreadsheet (opens in Excel)"
                >
                  <Download size={13} /> Export CSV
                </button>
                <button 
                  className={styles.btnGhost}
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={() => {
                    downloadJSON(`Himalaya_HR_Submissions_${new Date().toISOString().split('T')[0]}.json`, submissions);
                    showToast('Exported submissions to JSON.');
                  }}
                  title="Export all submissions as JSON backup"
                >
                  <Download size={13} /> Export JSON
                </button>
              </div>
            )}
          </div>

          {submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
              <ClipboardList size={36} style={{ color: '#cbd5e1', margin: '0 auto 10px' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>No form submissions recorded yet. Open any form and click "Save Submission" to record here.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className={styles.desktopOnly}>
                <div className={styles.tableResponsive}>
                  <table className={styles.formTable}>
                    <thead>
                      <tr>
                        <th>Submission ID</th>
                        <th>Form Code</th>
                        <th>Form Title</th>
                        <th>Category</th>
                        <th>Date Recorded</th>
                        <th>Recorded By</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map(sub => (
                        <tr key={sub.id}>
                          <td><strong>{sub.id}</strong></td>
                          <td><span className={styles.formBadge}>{sub.formNo}</span></td>
                          <td>{sub.title}</td>
                          <td>{sub.category}</td>
                          <td>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                          <td>{sub.submittedBy}</td>
                          <td><span style={{ color: '#16a34a', fontWeight: '700' }}>✓ {sub.status}</span></td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                              <button 
                                className={styles.btnSecondary}
                                style={{ padding: '4px 8px', fontSize: '11px' }}
                                onClick={() => setFillingForm(sub.formData)}
                              >
                                <Eye size={12} /> View
                              </button>
                              <button 
                                className={styles.btnGhost}
                                style={{ padding: '4px 8px', fontSize: '11px', gap: '3px' }}
                                onClick={() => {
                                  downloadSubmissionPDF(sub, docControl);
                                  showToast(`Generating submission ${sub.id} (PDF)...`);
                                }}
                                title="Download submission as High-Quality PDF"
                              >
                                <Download size={11} /> PDF
                              </button>
                              <button 
                                className={styles.btnGhost}
                                style={{ padding: '4px 8px', color: '#ef4444' }}
                                onClick={() => {
                                  if (confirm(`Delete submission ${sub.id}?`)) {
                                    const updated = submissions.filter(s => s.id !== sub.id);
                                    persistData(null, null, updated, null);
                                    showToast(`Submission ${sub.id} deleted.`);
                                  }
                                }}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Submissions Card View */}
              <div className={styles.mobileOnly}>
                {submissions.map(sub => (
                  <div key={sub.id} className={styles.mobileSubmissionCard}>
                    <div className={styles.mobileSubCardHeader}>
                      <div>
                        <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>{sub.id}</strong>
                        <span className={styles.formBadge} style={{ marginLeft: '6px' }}>{sub.formNo}</span>
                      </div>
                      <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '11px' }}>✓ {sub.status}</span>
                    </div>

                    <div className={styles.mobileSubCardTitle}>{sub.title}</div>

                    <div className={styles.mobileSubMetaGrid}>
                      <div>📁 <strong>Cat:</strong> {sub.category}</div>
                      <div>📅 <strong>Date:</strong> {new Date(sub.submittedAt).toLocaleDateString()}</div>
                      <div style={{ gridColumn: 'span 2' }}>👤 <strong>By:</strong> {sub.submittedBy}</div>
                    </div>

                    <div className={styles.mobileSubActions}>
                      <button 
                        className={styles.btnSecondary}
                        style={{ padding: '6px 10px', fontSize: '11.5px' }}
                        onClick={() => setFillingForm(sub.formData)}
                      >
                        <Eye size={12} /> View
                      </button>
                      <button 
                        className={styles.btnGhost}
                        style={{ padding: '6px 10px', fontSize: '11.5px', gap: '3px' }}
                        onClick={() => {
                          downloadSubmissionPDF(sub, docControl);
                          showToast(`Generating submission ${sub.id} (PDF)...`);
                        }}
                        title="Download submission as High-Quality PDF"
                      >
                        <Download size={12} /> PDF
                      </button>
                      <button 
                        className={styles.btnGhost}
                        style={{ padding: '6px 8px', color: '#ef4444', flex: '0 0 auto' }}
                        onClick={() => {
                          if (confirm(`Delete submission ${sub.id}?`)) {
                            const updated = submissions.filter(s => s.id !== sub.id);
                            persistData(null, null, updated, null);
                            showToast(`Submission ${sub.id} deleted.`);
                          }
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── MODAL: View & Fill Form (Interactive + Physical Blank + Printable) ── */}
      {fillingForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '1080px' }}>
            <div className={`${styles.modalHeader} ${styles.noPrint}`}>
              <div className={styles.modalHeaderTop}>
                <h3 className={styles.modalTitle} style={{ margin: 0 }}>
                  <FileText size={18} style={{ color: '#0284c7' }} />
                  {fillingForm.formNo} -- {fillingForm.title}
                </h3>
                <button 
                  className={styles.btnGhost}
                  style={{ padding: '6px' }}
                  onClick={() => setFillingForm(null)}
                  title="Close Form Modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Row 2: View Mode Switcher + Action Buttons */}
              <div className={styles.modalHeaderControls}>
                <div className={styles.modeToggleGroup}>
                  <button
                    type="button"
                    className={`${styles.modeToggleBtn} ${formViewMode === 'digital' ? styles.modeToggleBtnActive : ''}`}
                    onClick={() => setFormViewMode('digital')}
                  >
                    <Edit3 size={13} /> Digital Form
                  </button>
                  <button
                    type="button"
                    className={`${styles.modeToggleBtn} ${formViewMode === 'physical' ? styles.modeToggleBtnActive : ''}`}
                    onClick={() => setFormViewMode('physical')}
                  >
                    <FileText size={13} /> Physical Blank (________)
                  </button>
                </div>

                <div className={styles.modalHeaderActions}>
                  <button 
                    className={styles.btnSecondary}
                    onClick={async () => {
                      showToast(`Generating ${fillingForm.formNo} High-Quality PDF...`);
                      await downloadCurrentFormPDF(fillingForm, formViewMode, docControl);
                    }}
                    title="Download format as High-Quality PDF"
                  >
                    <Download size={13} /> Download PDF
                  </button>
                  <button 
                    className={styles.btnPrimary}
                    onClick={() => {
                      showToast(`Opening Print Preview for ${fillingForm.formNo}...`);
                      printCurrentForm(fillingForm, formViewMode, docControl);
                    }}
                    title="Print Physical Blank Form"
                  >
                    <Printer size={13} /> Print Physical Blank
                  </button>
                </div>
              </div>
            </div>

            <div className={`${styles.modalBody} ${styles.printableArea}`} ref={printContainerRef}>
              <div className={styles.paperSheet}>
                {/* ISO Document Control Header Box (Identical in both Fill and Physical Blank) */}
                <div className={styles.docControlBox}>
                  <div className={styles.docHeaderGrid}>
                    <div className={styles.docLogoCell}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#0284c7', letterSpacing: '-0.03em' }}>HIMALAYA</div>
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#334155' }}>COMPOSITE & PRECAST</div>
                      </div>
                    </div>
                    <div className={styles.docTitleCell}>
                      <div className={styles.docCompany}>{docControl.company}</div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{docControl.department}</div>
                      <div className={styles.docFormTitle}>{fillingForm.formNo} -- {fillingForm.title}</div>
                    </div>
                    <div className={styles.docMetaCell}>
                      <div><strong>Doc No:</strong> {docControl.documentNo}</div>
                      <div><strong>Form No:</strong> {fillingForm.formNo}</div>
                      <div><strong>Revision:</strong> {fillingForm.revision}</div>
                      <div><strong>Eff. Date:</strong> {fillingForm.effectiveDate || '2024-04-01'}</div>
                    </div>
                  </div>
                  <div className={styles.docWatermarkBar}>
                    CONTROLLED DOCUMENT -- UNCONTROLLED WHEN PRINTED
                  </div>
                </div>

                {/* Dynamic Form Body: renders Fill or Physical Blank based on mode */}
                {renderDynamicFormBody(fillingForm, setFillingForm, formViewMode === 'physical')}

                {/* Standard 3-Level Sign-off Block (3-column layout everywhere) */}
                {formViewMode === 'physical' ? (
                  <div className={styles.signoffGrid}>
                    <div className={styles.signoffBox}>
                      <div className={styles.signoffRole}>Prepared / Submitted By</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>Name: _____________________</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '14px' }}>Signature: ________________</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '14px' }}>Date: ___ / ___ / _____</div>
                    </div>

                    <div className={styles.signoffBox}>
                      <div className={styles.signoffRole}>Verified / Reviewed By</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>Name: _____________________</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '14px' }}>Signature: ________________</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '14px' }}>Date: ___ / ___ / _____</div>
                    </div>

                    <div className={styles.signoffBox}>
                      <div className={styles.signoffRole}>Approved By</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '6px' }}>Name: _____________________</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '14px' }}>Signature: ________________</div>
                      <div style={{ fontSize: '11px', color: '#475569', marginTop: '14px' }}>Date: ___ / ___ / _____</div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.signoffGrid}>
                    <div className={styles.signoffBox}>
                      <div className={styles.signoffRole}>Prepared / Submitted By</div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Name</label>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          value={fillingForm.signatories?.preparedBy?.name || ''}
                          onChange={(e) => {
                            const updated = { ...fillingForm };
                            if (!updated.signatories) updated.signatories = {};
                            if (!updated.signatories.preparedBy) updated.signatories.preparedBy = {};
                            updated.signatories.preparedBy.name = e.target.value;
                            setFillingForm(updated);
                          }}
                          placeholder="Enter submitter name"
                        />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Date</label>
                        <input 
                          type="date" 
                          className={styles.formInput}
                          value={fillingForm.signatories?.preparedBy?.date || ''}
                          onChange={(e) => {
                            const updated = { ...fillingForm };
                            if (!updated.signatories) updated.signatories = {};
                            if (!updated.signatories.preparedBy) updated.signatories.preparedBy = {};
                            updated.signatories.preparedBy.date = e.target.value;
                            setFillingForm(updated);
                          }}
                        />
                      </div>
                      <div className={styles.signatureLine}>
                        Signature: {fillingForm.signatories?.preparedBy?.name ? `✓ Signed by ${fillingForm.signatories?.preparedBy?.name}` : '____________________'}
                      </div>
                    </div>

                    <div className={styles.signoffBox}>
                      <div className={styles.signoffRole}>Verified / Reviewed By</div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Name</label>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          value={fillingForm.signatories?.verifiedBy?.name || ''}
                          onChange={(e) => {
                            const updated = { ...fillingForm };
                            if (!updated.signatories) updated.signatories = {};
                            if (!updated.signatories.verifiedBy) updated.signatories.verifiedBy = {};
                            updated.signatories.verifiedBy.name = e.target.value;
                            setFillingForm(updated);
                          }}
                          placeholder="Dept Head / Reviewer"
                        />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Date</label>
                        <input 
                          type="date" 
                          className={styles.formInput}
                          value={fillingForm.signatories?.verifiedBy?.date || ''}
                          onChange={(e) => {
                            const updated = { ...fillingForm };
                            if (!updated.signatories) updated.signatories = {};
                            if (!updated.signatories.verifiedBy) updated.signatories.verifiedBy = {};
                            updated.signatories.verifiedBy.date = e.target.value;
                            setFillingForm(updated);
                          }}
                        />
                      </div>
                      <div className={styles.signatureLine}>
                        Signature: {fillingForm.signatories?.verifiedBy?.name ? `✓ Verified by ${fillingForm.signatories?.verifiedBy?.name}` : '____________________'}
                      </div>
                    </div>

                    <div className={styles.signoffBox}>
                      <div className={styles.signoffRole}>Approved By</div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Name</label>
                        <input 
                          type="text" 
                          className={styles.formInput} 
                          value={fillingForm.signatories?.approvedBy?.name || ''}
                          onChange={(e) => {
                            const updated = { ...fillingForm };
                            if (!updated.signatories) updated.signatories = {};
                            if (!updated.signatories.approvedBy) updated.signatories.approvedBy = {};
                            updated.signatories.approvedBy.name = e.target.value;
                            setFillingForm(updated);
                          }}
                          placeholder="Managing Director / Plant Head"
                        />
                      </div>
                      <div className={styles.formField}>
                        <label className={styles.formLabel}>Date</label>
                        <input 
                          type="date" 
                          className={styles.formInput}
                          value={fillingForm.signatories?.approvedBy?.date || ''}
                          onChange={(e) => {
                            const updated = { ...fillingForm };
                            if (!updated.signatories) updated.signatories = {};
                            if (!updated.signatories.approvedBy) updated.signatories.approvedBy = {};
                            updated.signatories.approvedBy.date = e.target.value;
                            setFillingForm(updated);
                          }}
                        />
                      </div>
                      <div className={styles.signatureLine}>
                        Signature: {fillingForm.signatories?.approvedBy?.name ? `✓ Approved by ${fillingForm.signatories?.approvedBy?.name}` : '____________________'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`${styles.modalFooter} ${styles.noPrint}`}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className={styles.btnSecondary}
                  onClick={async () => {
                    showToast(`Generating ${fillingForm.formNo} High-Quality PDF...`);
                    await downloadCurrentFormPDF(fillingForm, formViewMode, docControl);
                  }}
                  title="Download as High-Quality PDF"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={styles.btnSecondary} 
                  onClick={() => setFillingForm(null)}
                >
                  Close
                </button>
                {formViewMode === 'physical' ? (
                  <button 
                    className={styles.btnPrimary}
                    onClick={() => {
                      showToast(`Opening Print Preview for ${fillingForm.formNo}...`);
                      printCurrentForm(fillingForm, 'physical', docControl);
                    }}
                  >
                    <Printer size={15} /> Print Physical Blank Form
                  </button>
                ) : (
                  <button 
                    className={styles.btnSuccess}
                    onClick={handleSaveSubmission}
                  >
                    <Save size={15} /> Save Submission & Record
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Add New SOP / Form ── */}
      {isNewSOPModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '680px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Plus size={18} style={{ color: '#0284c7' }} />
                Add New SOP / HR Form
              </h3>
              <button className={styles.btnGhost} onClick={() => setIsNewSOPModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSOP}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Form Number *</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      value={newSOPForm.formNo}
                      onChange={(e) => setNewSOPForm({ ...newSOPForm, formNo: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Revision No *</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      value={newSOPForm.revision}
                      onChange={(e) => setNewSOPForm({ ...newSOPForm, revision: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formField} style={{ marginTop: '12px' }}>
                  <label className={styles.formLabel}>SOP / Form Title *</label>
                  <input 
                    type="text" 
                    className={styles.formInput}
                    placeholder="e.g. Employee Training Needs Assessment"
                    value={newSOPForm.title}
                    onChange={(e) => setNewSOPForm({ ...newSOPForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Category</label>
                    <select 
                      className={styles.formSelect}
                      value={newSOPForm.category}
                      onChange={(e) => setNewSOPForm({ ...newSOPForm, category: e.target.value })}
                    >
                      {SOP_CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Effective Date</label>
                    <input 
                      type="date" 
                      className={styles.formInput}
                      value={newSOPForm.effectiveDate}
                      onChange={(e) => setNewSOPForm({ ...newSOPForm, effectiveDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formField} style={{ marginTop: '12px' }}>
                  <label className={styles.formLabel}>Description / Procedure Summary</label>
                  <textarea 
                    className={styles.formTextarea}
                    rows={2}
                    placeholder="Brief description of when and how this form is executed..."
                    value={newSOPForm.description}
                    onChange={(e) => setNewSOPForm({ ...newSOPForm, description: e.target.value })}
                  />
                </div>

                {/* Dynamic Checklist Items */}
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className={styles.formLabel}>Checklist Items / Evaluation Steps</label>
                    <button 
                      type="button" 
                      className={styles.btnSecondary}
                      style={{ padding: '3px 8px', fontSize: '11px' }}
                      onClick={() => {
                        const nextId = newSOPForm.checklistItems.length + 1;
                        setNewSOPForm({
                          ...newSOPForm,
                          checklistItems: [
                            ...newSOPForm.checklistItems,
                            { id: nextId, item: `Check item ${nextId}`, required: 'Yes', remarks: '' }
                          ]
                        });
                      }}
                    >
                      + Add Item
                    </button>
                  </div>

                  {newSOPForm.checklistItems.map((item, idx) => (
                    <div key={item.id} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', fontWeight: 'bold', width: '20px' }}>{idx + 1}.</span>
                      <input 
                        type="text" 
                        className={styles.formInput} 
                        style={{ flex: 1 }}
                        value={item.item}
                        onChange={(e) => {
                          const updated = [...newSOPForm.checklistItems];
                          updated[idx].item = e.target.value;
                          setNewSOPForm({ ...newSOPForm, checklistItems: updated });
                        }}
                      />
                      <select
                        className={styles.formSelect}
                        style={{ width: '100px' }}
                        value={item.required}
                        onChange={(e) => {
                          const updated = [...newSOPForm.checklistItems];
                          updated[idx].required = e.target.value;
                          setNewSOPForm({ ...newSOPForm, checklistItems: updated });
                        }}
                      >
                        <option value="Yes">Required</option>
                        <option value="Optional">Optional</option>
                      </select>
                      {newSOPForm.checklistItems.length > 1 && (
                        <button 
                          type="button" 
                          className={styles.btnGhost}
                          onClick={() => {
                            const updated = newSOPForm.checklistItems.filter((_, i) => i !== idx);
                            setNewSOPForm({ ...newSOPForm, checklistItems: updated });
                          }}
                        >
                          <Trash2 size={14} style={{ color: '#ef4444' }} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsNewSOPModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save & Publish SOP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit / Update SOP Definition ── */}
      {editingSOP && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '680px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Edit3 size={18} style={{ color: '#0284c7' }} />
                Update SOP: {editingSOP.formNo}
              </h3>
              <button className={styles.btnGhost} onClick={() => setEditingSOP(null)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSOP}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Form Number</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={editingSOP.formNo}
                      onChange={(e) => setEditingSOP({ ...editingSOP, formNo: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Revision No</label>
                    <input 
                      type="text" 
                      className={styles.formInput} 
                      value={editingSOP.revision}
                      onChange={(e) => setEditingSOP({ ...editingSOP, revision: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formField} style={{ marginTop: '12px' }}>
                  <label className={styles.formLabel}>Title</label>
                  <input 
                    type="text" 
                    className={styles.formInput} 
                    value={editingSOP.title}
                    onChange={(e) => setEditingSOP({ ...editingSOP, title: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Category</label>
                    <select 
                      className={styles.formSelect}
                      value={editingSOP.category}
                      onChange={(e) => setEditingSOP({ ...editingSOP, category: e.target.value })}
                    >
                      {SOP_CATEGORIES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Effective Date</label>
                    <input 
                      type="date" 
                      className={styles.formInput}
                      value={editingSOP.effectiveDate || ''}
                      onChange={(e) => setEditingSOP({ ...editingSOP, effectiveDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className={styles.formField} style={{ marginTop: '12px' }}>
                  <label className={styles.formLabel}>Description</label>
                  <textarea 
                    className={styles.formTextarea} 
                    rows={2}
                    value={editingSOP.description || ''}
                    onChange={(e) => setEditingSOP({ ...editingSOP, description: e.target.value })}
                  />
                </div>

                <div className={styles.formField} style={{ marginTop: '12px' }}>
                  <label className={styles.formLabel}>Operational Purpose / Scope</label>
                  <textarea 
                    className={styles.formTextarea} 
                    rows={2}
                    value={editingSOP.purpose || ''}
                    onChange={(e) => setEditingSOP({ ...editingSOP, purpose: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setEditingSOP(null)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Document Control & Revision History ── */}
      {isDocControlModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '850px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <ShieldCheck size={18} style={{ color: '#0284c7' }} />
                Master Document Control Specification
              </h3>
              <button className={styles.btnGhost} onClick={() => setIsDocControlModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div style={{ marginBottom: '20px' }}>
                <h4 className={styles.sectionHeading}>Document Control Specification</h4>
                <table className={styles.formTable}>
                  <tbody>
                    <tr>
                      <td style={{ width: '30%', fontWeight: 'bold', background: '#f8fafc' }}>Company</td>
                      <td>{docControl.company}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Department</td>
                      <td>{docControl.department}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Master Document No.</td>
                      <td><span className={styles.formBadge}>{docControl.documentNo}</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Master Revision No.</td>
                      <td><span className={styles.revBadge}>{docControl.revisionNo}</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Effective Date</td>
                      <td>{docControl.effectiveDate}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Review Date</td>
                      <td>{docControl.reviewDate}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Prepared By</td>
                      <td>{docControl.preparedBy}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Checked By</td>
                      <td>{docControl.checkedBy}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Approved By</td>
                      <td>{docControl.approvedBy}</td>
                    </tr>
                    <tr>
                      <td style={{ fontWeight: 'bold', background: '#f8fafc' }}>Controlled Status</td>
                      <td><span style={{ color: '#b91c1c', fontWeight: 'bold' }}>{docControl.watermarkText}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Revision History Log */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 className={styles.sectionHeading} style={{ margin: 0, border: 'none' }}>
                    Document Revision Control Log
                  </h4>
                  <button 
                    className={styles.btnPrimary}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                    onClick={() => setIsAddRevisionModalOpen(true)}
                  >
                    + Add Revision Log
                  </button>
                </div>

                <table className={styles.formTable}>
                  <thead>
                    <tr>
                      <th>Revision</th>
                      <th>Date</th>
                      <th>Description of Change</th>
                      <th>Prepared By</th>
                      <th>Approved By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisions.map((r, i) => (
                      <tr key={i}>
                        <td><strong>Rev {r.revision}</strong></td>
                        <td>{r.date}</td>
                        <td>{r.description}</td>
                        <td>{r.preparedBy}</td>
                        <td>{r.approvedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p style={{ fontSize: '11px', color: '#64748b', marginTop: '8px', fontStyle: 'italic' }}>
                  Only the latest approved revision of each form shall be used. Completed records shall be retained and protected according to the company's record-control requirements.
                </p>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  className={styles.btnSecondary}
                  onClick={() => {
                    downloadDocControlSpecPDF(docControl, revisions);
                    showToast('Generating Document Control Specification (PDF)...');
                  }}
                  title="Download Document Control Specification as High-Quality PDF"
                >
                  <Download size={14} /> Download Spec (PDF)
                </button>
                <button 
                  className={styles.btnGhost}
                  onClick={() => {
                    printDocControlSpec(docControl, revisions);
                    showToast('Opening Print Preview for Document Control Specification...');
                  }}
                  title="Print Document Control Specification"
                >
                  <Printer size={14} /> Print Spec
                </button>
              </div>
              <button className={styles.btnSecondary} onClick={() => setIsDocControlModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Add Revision Log ── */}
      {isAddRevisionModalOpen && (
        <div className={styles.modalOverlay} style={{ zIndex: 10000 }}>
          <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add Revision Log Entry</h3>
              <button className={styles.btnGhost} onClick={() => setIsAddRevisionModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRevision}>
              <div className={styles.modalBody}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Revision No</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      value={newRevEntry.revision}
                      onChange={(e) => setNewRevEntry({ ...newRevEntry, revision: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Date</label>
                    <input 
                      type="date" 
                      className={styles.formInput}
                      value={newRevEntry.date}
                      onChange={(e) => setNewRevEntry({ ...newRevEntry, date: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className={styles.formField} style={{ marginTop: '12px' }}>
                  <label className={styles.formLabel}>Description of Change *</label>
                  <textarea 
                    className={styles.formTextarea}
                    rows={3}
                    placeholder="Describe specific modifications or ISO clauses updated..."
                    value={newRevEntry.description}
                    onChange={(e) => setNewRevEntry({ ...newRevEntry, description: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Prepared By</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      value={newRevEntry.preparedBy}
                      onChange={(e) => setNewRevEntry({ ...newRevEntry, preparedBy: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Approved By</label>
                    <input 
                      type="text" 
                      className={styles.formInput}
                      value={newRevEntry.approvedBy}
                      onChange={(e) => setNewRevEntry({ ...newRevEntry, approvedBy: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsAddRevisionModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Save Revision Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper to render dynamic form body for each of the 16 forms ──
function renderDynamicFormBody(form, setForm) {
  const updateField = (fieldKey, value) => {
    setForm(prev => ({
      ...prev,
      fields: {
        ...(prev.fields || {}),
        [fieldKey]: value
      }
    }));
  };

  switch (form.formNo) {
    // ── HR-F-01: Manpower Requisition Form ──
    case 'HR-F-01': {
      const f = form.fields || {};
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>1. Position & Requisition Details</div>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={f.department || ''} onChange={(e) => updateField('department', e.target.value)} placeholder="e.g. Production / Quality" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Position / Designation</label>
              <input type="text" className={styles.formInput} value={f.positionDesignation || ''} onChange={(e) => updateField('positionDesignation', e.target.value)} placeholder="e.g. Precast Quality Specialist" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>No. of Positions</label>
              <input type="number" className={styles.formInput} value={f.noOfPositions || '1'} onChange={(e) => updateField('noOfPositions', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>New / Replacement</label>
              <select className={styles.formSelect} value={f.requirementType || 'New'} onChange={(e) => updateField('requirementType', e.target.value)}>
                <option value="New">New Position</option>
                <option value="Replacement">Replacement</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reason for Requirement</label>
              <input type="text" className={styles.formInput} value={f.reasonForRequirement || ''} onChange={(e) => updateField('reasonForRequirement', e.target.value)} placeholder="Expansion / Attrition" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Required Joining Date</label>
              <input type="date" className={styles.formInput} value={f.requiredJoiningDate || ''} onChange={(e) => updateField('requiredJoiningDate', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reporting To</label>
              <input type="text" className={styles.formInput} value={f.reportingTo || ''} onChange={(e) => updateField('reportingTo', e.target.value)} placeholder="Reporting Manager" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employment Type</label>
              <select className={styles.formSelect} value={f.employmentType || 'Permanent'} onChange={(e) => updateField('employmentType', e.target.value)}>
                <option value="Permanent">Permanent</option>
                <option value="Contract">Contract</option>
                <option value="Temporary">Temporary</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Required Qualification</label>
              <input type="text" className={styles.formInput} value={f.requiredQualification || ''} onChange={(e) => updateField('requiredQualification', e.target.value)} placeholder="e.g. B.Tech Civil / Diploma" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Required Experience</label>
              <input type="text" className={styles.formInput} value={f.requiredExperience || ''} onChange={(e) => updateField('requiredExperience', e.target.value)} placeholder="e.g. 3-5 Years Precast" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Proposed Salary / CTC</label>
              <input type="text" className={styles.formInput} value={f.proposedSalaryCtc || ''} onChange={(e) => updateField('proposedSalaryCtc', e.target.value)} placeholder="e.g. ₹4.50 - 6.00 LPA" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Key Skills / Competencies</label>
              <input type="text" className={styles.formInput} value={f.keySkillsCompetencies || ''} onChange={(e) => updateField('keySkillsCompetencies', e.target.value)} placeholder="Concrete mix, batching, testing" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Budget Available</label>
              <select className={styles.formSelect} value={f.budgetAvailable || 'Yes'} onChange={(e) => updateField('budgetAvailable', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Priority</label>
              <select className={styles.formSelect} value={f.priority || 'Normal'} onChange={(e) => updateField('priority', e.target.value)}>
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Job Description Attached</label>
              <select className={styles.formSelect} value={f.jobDescriptionAttached || 'Yes'} onChange={(e) => updateField('jobDescriptionAttached', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Requested By</label>
              <input type="text" className={styles.formInput} value={f.requestedBy || ''} onChange={(e) => updateField('requestedBy', e.target.value)} placeholder="HOD Name" />
            </div>
          </div>

          <div className={styles.formField} style={{ marginTop: '12px' }}>
            <label className={styles.formLabel}>Justification / Additional Requirement</label>
            <textarea className={styles.formTextarea} rows={3} value={f.justification || ''} onChange={(e) => updateField('justification', e.target.value)} placeholder="State operational impact and justification for requisition..." />
          </div>
        </div>
      );
    }

    // ── HR-F-02: Employee Joining Checklist ──
    case 'HR-F-02': {
      const items = form.items || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Employee Details & Onboarding Checklist</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={form.employeeInfo?.employeeName || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...form.employeeInfo, employeeName: e.target.value } })} placeholder="Full Name" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={form.employeeInfo?.employeeId || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...form.employeeInfo, employeeId: e.target.value } })} placeholder="EMP-XXX" />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={form.employeeInfo?.department || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...form.employeeInfo, department: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date of Joining</label>
              <input type="date" className={styles.formInput} value={form.employeeInfo?.dateOfJoining || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...form.employeeInfo, dateOfJoining: e.target.value } })} />
            </div>
          </div>

          <table className={styles.formTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th>Item / Document</th>
                <th style={{ width: '130px' }}>Required</th>
                <th style={{ width: '150px', textAlign: 'center' }}>Submitted / Verified</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{item.item}</strong></td>
                  <td>{item.required}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      checked={item.submitted || false}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].submitted = e.target.checked;
                        setForm({ ...form, items: updated });
                      }}
                    />
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={item.remarks || ''}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].remarks = e.target.value;
                        setForm({ ...form, items: updated });
                      }}
                      placeholder="Remarks / verification notes"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '14px', background: '#f8fafc', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}>
            <strong>Employee Declaration:</strong> {form.declaration || 'I confirm that the information/documents submitted by me are true to the best of my knowledge.'}
          </div>
        </div>
      );
    }

    // ── HR-F-03: Employee Induction Checklist ──
    case 'HR-F-03': {
      const topics = form.topics || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Employee Orientation & Induction Checklist</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={form.employeeInfo?.employeeName || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...form.employeeInfo, employeeName: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={form.employeeInfo?.employeeId || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...form.employeeInfo, employeeId: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={form.employeeInfo?.department || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...form.employeeInfo, department: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date of Joining</label>
              <input type="date" className={styles.formInput} value={form.employeeInfo?.dateOfJoining || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...form.employeeInfo, dateOfJoining: e.target.value } })} />
            </div>
          </div>

          <table className={styles.formTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th>Topic</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Completed</th>
                <th style={{ width: '200px' }}>Trainer / Responsible</th>
                <th>Date / Remarks</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{t.topic}</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox"
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      checked={t.completed || false}
                      onChange={(e) => {
                        const updated = [...topics];
                        updated[idx].completed = e.target.checked;
                        setForm({ ...form, topics: updated });
                      }}
                    />
                  </td>
                  <td>
                    <input 
                      type="text"
                      value={t.trainer || ''}
                      onChange={(e) => {
                        const updated = [...topics];
                        updated[idx].trainer = e.target.value;
                        setForm({ ...form, topics: updated });
                      }}
                      placeholder="Trainer name"
                    />
                  </td>
                  <td>
                    <input 
                      type="text"
                      value={t.dateRemarks || ''}
                      onChange={(e) => {
                        const updated = [...topics];
                        updated[idx].dateRemarks = e.target.value;
                        setForm({ ...form, topics: updated });
                      }}
                      placeholder="Date & remarks"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '14px', background: '#f8fafc', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}>
            <strong>Employee Acknowledgement:</strong> {form.acknowledgement || 'I have received and understood the induction topics relevant to my role.'}
          </div>
        </div>
      );
    }

    // ── HR-F-04: Probation / Confirmation Evaluation ──
    case 'HR-F-04': {
      const f = form.fields || {};
      const criteria = form.criteria || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Employee Details</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={f.employeeName || ''} onChange={(e) => updateField('employeeName', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={f.employeeId || ''} onChange={(e) => updateField('employeeId', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={f.department || ''} onChange={(e) => updateField('department', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Designation</label>
              <input type="text" className={styles.formInput} value={f.designation || ''} onChange={(e) => updateField('designation', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date of Joining</label>
              <input type="date" className={styles.formInput} value={f.dateOfJoining || ''} onChange={(e) => updateField('dateOfJoining', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Probation End Date</label>
              <input type="date" className={styles.formInput} value={f.probationEndDate || ''} onChange={(e) => updateField('probationEndDate', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reporting Manager</label>
              <input type="text" className={styles.formInput} value={f.reportingManager || ''} onChange={(e) => updateField('reportingManager', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Evaluation Date</label>
              <input type="date" className={styles.formInput} value={f.evaluationDate || ''} onChange={(e) => updateField('evaluationDate', e.target.value)} />
            </div>
          </div>

          <div className={styles.sectionHeading}>Evaluation Criteria (1 = Poor, 5 = Excellent)</div>
          <table className={styles.formTable}>
            <thead>
              <tr>
                <th>Criteria</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Rating (1-5)</th>
                <th>Comments / Evidence</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, idx) => (
                <tr key={c.id}>
                  <td><strong>{c.criteria}</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <select 
                      value={c.rating || 4} 
                      onChange={(e) => {
                        const updated = [...criteria];
                        updated[idx].rating = Number(e.target.value);
                        setForm({ ...form, criteria: updated });
                      }}
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star</option>)}
                    </select>
                  </td>
                  <td>
                    <input 
                      type="text" 
                      value={c.comments || ''}
                      onChange={(e) => {
                        const updated = [...criteria];
                        updated[idx].comments = e.target.value;
                        setForm({ ...form, criteria: updated });
                      }}
                      placeholder="Enter performance evidence..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Recommendation</label>
              <select 
                className={styles.formSelect}
                value={form.recommendation || 'Confirm'}
                onChange={(e) => setForm({ ...form, recommendation: e.target.value })}
              >
                <option value="Confirm">Confirm Permanent Employment</option>
                <option value="Extend Probation">Extend Probation (3 Months)</option>
                <option value="Other action">Other action as per policy</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reason / Development Requirements</label>
              <input 
                type="text" 
                className={styles.formInput}
                value={form.reasonDevelopmentRequirements || ''}
                onChange={(e) => setForm({ ...form, reasonDevelopmentRequirements: e.target.value })}
                placeholder="Specific training or improvement requirements..."
              />
            </div>
          </div>
        </div>
      );
    }

    // ── HR-F-05: Attendance Register ──
    case 'HR-F-05': {
      const rows = form.rows || [];
      const meta = form.meta || {};
      return (
        <div className={styles.formSection}>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Month</label>
              <input type="text" className={styles.formInput} value={meta.month || ''} onChange={(e) => setForm({ ...form, meta: { ...meta, month: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Year</label>
              <input type="text" className={styles.formInput} value={meta.year || ''} onChange={(e) => setForm({ ...form, meta: { ...meta, year: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={meta.department || ''} onChange={(e) => setForm({ ...form, meta: { ...meta, department: e.target.value } })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className={styles.sectionHeading} style={{ margin: 0, border: 'none' }}>Attendance Log Sheet</div>
            <button 
              type="button" 
              className={styles.btnSecondary}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => {
                const nextId = rows.length + 1;
                setForm({
                  ...form,
                  rows: [
                    ...rows,
                    { id: nextId, date: '2025-04-01', employeeId: `EMP-0${nextId < 10 ? '0' : ''}${nextId}`, employeeName: '', dept: meta.department || 'Operations', shift: 'A', inTime: '08:30', outTime: '17:30', status: 'Present', otHrs: '0.0', remarks: '' }
                  ]
                });
              }}
            >
              + Add Entry Row
            </button>
          </div>

          <table className={styles.formTable}>
            <thead>
              <tr>
                <th style={{ width: '100px' }}>Date</th>
                <th style={{ width: '90px' }}>Emp ID</th>
                <th>Employee Name</th>
                <th style={{ width: '110px' }}>Dept</th>
                <th style={{ width: '60px' }}>Shift</th>
                <th style={{ width: '70px' }}>In</th>
                <th style={{ width: '70px' }}>Out</th>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ width: '65px' }}>OT Hrs</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={r.id}>
                  <td><input type="date" value={r.date} onChange={(e) => { const u = [...rows]; u[idx].date = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                  <td><input type="text" value={r.employeeId} onChange={(e) => { const u = [...rows]; u[idx].employeeId = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                  <td><input type="text" value={r.employeeName} onChange={(e) => { const u = [...rows]; u[idx].employeeName = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                  <td><input type="text" value={r.dept} onChange={(e) => { const u = [...rows]; u[idx].dept = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                  <td><input type="text" value={r.shift} onChange={(e) => { const u = [...rows]; u[idx].shift = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                  <td><input type="text" value={r.inTime} onChange={(e) => { const u = [...rows]; u[idx].inTime = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                  <td><input type="text" value={r.outTime} onChange={(e) => { const u = [...rows]; u[idx].outTime = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                  <td>
                    <select value={r.status} onChange={(e) => { const u = [...rows]; u[idx].status = e.target.value; setForm({ ...form, rows: u }); }}>
                      {['Present', 'Absent', 'Weekly Off', 'Holiday', 'Leave', 'Half Day', 'Late', 'Unauthorized Absence'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td><input type="text" value={r.otHrs} onChange={(e) => { const u = [...rows]; u[idx].otHrs = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                  <td><input type="text" value={r.remarks} onChange={(e) => { const u = [...rows]; u[idx].remarks = e.target.value; setForm({ ...form, rows: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // ── HR-F-06: Overtime Approval Form ──
    case 'HR-F-06': {
      const f = form.fields || {};
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Overtime Requisition & Certification Details</div>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={f.employeeName || ''} onChange={(e) => updateField('employeeName', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={f.employeeId || ''} onChange={(e) => updateField('employeeId', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={f.department || ''} onChange={(e) => updateField('department', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date</label>
              <input type="date" className={styles.formInput} value={f.date || ''} onChange={(e) => updateField('date', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Shift</label>
              <input type="text" className={styles.formInput} value={f.shift || 'Shift A'} onChange={(e) => updateField('shift', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>OT Start / End</label>
              <input type="text" className={styles.formInput} value={f.otStartEnd || '17:30 - 20:30'} onChange={(e) => updateField('otStartEnd', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Total OT Hours</label>
              <input type="text" className={styles.formInput} value={f.totalOtHours || '3.0'} onChange={(e) => updateField('totalOtHours', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Normal / Holiday OT</label>
              <select className={styles.formSelect} value={f.normalHolidayOt || 'Normal OT'} onChange={(e) => updateField('normalHolidayOt', e.target.value)}>
                <option value="Normal OT">Normal Working Day OT</option>
                <option value="Holiday OT">Weekly Off / Holiday OT</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Prior Approval Granted</label>
              <select className={styles.formSelect} value={f.priorApproval || 'Yes'} onChange={(e) => updateField('priorApproval', e.target.value)}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Emergency</label>
              <select className={styles.formSelect} value={f.emergency || 'No'} onChange={(e) => updateField('emergency', e.target.value)}>
                <option value="No">No (Scheduled)</option>
                <option value="Yes">Yes (Breakdown / Urgent dispatch)</option>
              </select>
            </div>
          </div>

          <div className={styles.formField} style={{ marginTop: '12px' }}>
            <label className={styles.formLabel}>Reason / Work Details</label>
            <textarea className={styles.formTextarea} rows={3} value={f.reasonWorkDetails || ''} onChange={(e) => updateField('reasonWorkDetails', e.target.value)} placeholder="Specify production orders, machine repair, or urgent dispatches addressed during overtime..." />
          </div>
        </div>
      );
    }

    // ── HR-F-07: Training Attendance Register ──
    case 'HR-F-07': {
      const f = form.fields || {};
      const attendees = form.attendees || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Training Session Details</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Training Title</label>
              <input type="text" className={styles.formInput} value={f.trainingTitle || ''} onChange={(e) => updateField('trainingTitle', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Trainer</label>
              <input type="text" className={styles.formInput} value={f.trainer || ''} onChange={(e) => updateField('trainer', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date</label>
              <input type="date" className={styles.formInput} value={f.date || ''} onChange={(e) => updateField('date', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department / Location</label>
              <input type="text" className={styles.formInput} value={f.departmentLocation || ''} onChange={(e) => updateField('departmentLocation', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Training Type</label>
              <input type="text" className={styles.formInput} value={f.trainingType || ''} onChange={(e) => updateField('trainingType', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Duration</label>
              <input type="text" className={styles.formInput} value={f.duration || ''} onChange={(e) => updateField('duration', e.target.value)} />
            </div>
          </div>

          <div className={styles.formField} style={{ marginBottom: '14px' }}>
            <label className={styles.formLabel}>Training Objective / Key Topics</label>
            <input type="text" className={styles.formInput} value={f.objectiveTopics || ''} onChange={(e) => updateField('objectiveTopics', e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className={styles.sectionHeading} style={{ margin: 0, border: 'none' }}>Attendee Attendance Log</div>
            <button 
              type="button" 
              className={styles.btnSecondary}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => {
                const nextSl = attendees.length + 1;
                setForm({
                  ...form,
                  attendees: [
                    ...attendees,
                    { sl: nextSl, employeeId: '', employeeName: '', department: '', signature: 'Signed', remarks: 'Attended' }
                  ]
                });
              }}
            >
              + Add Attendee
            </button>
          </div>

          <table className={styles.formTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th style={{ width: '100px' }}>Employee ID</th>
                <th>Employee Name</th>
                <th style={{ width: '130px' }}>Department</th>
                <th style={{ width: '130px' }}>Signature</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {attendees.map((a, idx) => (
                <tr key={idx}>
                  <td>{a.sl || idx + 1}</td>
                  <td><input type="text" value={a.employeeId || ''} onChange={(e) => { const u = [...attendees]; u[idx].employeeId = e.target.value; setForm({ ...form, attendees: u }); }} /></td>
                  <td><input type="text" value={a.employeeName || ''} onChange={(e) => { const u = [...attendees]; u[idx].employeeName = e.target.value; setForm({ ...form, attendees: u }); }} /></td>
                  <td><input type="text" value={a.department || ''} onChange={(e) => { const u = [...attendees]; u[idx].department = e.target.value; setForm({ ...form, attendees: u }); }} /></td>
                  <td><input type="text" value={a.signature || ''} onChange={(e) => { const u = [...attendees]; u[idx].signature = e.target.value; setForm({ ...form, attendees: u }); }} /></td>
                  <td><input type="text" value={a.remarks || ''} onChange={(e) => { const u = [...attendees]; u[idx].remarks = e.target.value; setForm({ ...form, attendees: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // ── HR-F-08: Training Evaluation Form ──
    case 'HR-F-08': {
      const f = form.fields || {};
      const questions = form.questions || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Program & Participant Details</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Training Title</label>
              <input type="text" className={styles.formInput} value={f.trainingTitle || ''} onChange={(e) => updateField('trainingTitle', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date</label>
              <input type="date" className={styles.formInput} value={f.date || ''} onChange={(e) => updateField('date', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={f.employeeName || ''} onChange={(e) => updateField('employeeName', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={f.department || ''} onChange={(e) => updateField('department', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Trainer</label>
              <input type="text" className={styles.formInput} value={f.trainer || ''} onChange={(e) => updateField('trainer', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Duration</label>
              <input type="text" className={styles.formInput} value={f.duration || ''} onChange={(e) => updateField('duration', e.target.value)} />
            </div>
          </div>

          <div className={styles.sectionHeading}>Evaluation Questions (1 = Strongly Disagree, 5 = Strongly Agree)</div>
          <table className={styles.formTable}>
            <thead>
              <tr>
                <th>Evaluation Question</th>
                <th style={{ width: '130px', textAlign: 'center' }}>Rating (1-5)</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q, idx) => (
                <tr key={q.id}>
                  <td><strong>{q.question}</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <select value={q.rating || 5} onChange={(e) => { const u = [...questions]; u[idx].rating = Number(e.target.value); setForm({ ...form, questions: u }); }}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} / 5</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="text" value={q.comments || ''} onChange={(e) => { const u = [...questions]; u[idx].comments = e.target.value; setForm({ ...form, questions: u }); }} placeholder="Participant comments..." />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.formGrid} style={{ marginTop: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Overall Effectiveness</label>
              <select className={styles.formSelect} value={form.overallEffectiveness || 'Excellent'} onChange={(e) => setForm({ ...form, overallEffectiveness: e.target.value })}>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Satisfactory">Satisfactory</option>
                <option value="Needs Improvement">Needs Improvement</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Recommended Follow-up / Competency Assessment</label>
              <input type="text" className={styles.formInput} value={form.recommendedFollowUp || ''} onChange={(e) => setForm({ ...form, recommendedFollowUp: e.target.value })} />
            </div>
          </div>
        </div>
      );
    }

    // ── HR-F-09: Annual Training Matrix ──
    case 'HR-F-09': {
      const matrix = form.matrix || [];
      return (
        <div className={styles.formSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div className={styles.sectionHeading} style={{ margin: 0, border: 'none' }}>
              Competency Matrix & Annual Scheduling (Review: Monthly / Quarterly)
            </div>
            <button 
              type="button" 
              className={styles.btnSecondary}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => {
                const nextId = matrix.length + 1;
                setForm({
                  ...form,
                  matrix: [
                    ...matrix,
                    { id: nextId, employeeRole: '', requiredTraining: '', frequency: 'Annual', plannedDate: '', completedDate: '', status: 'Planned', remarks: '' }
                  ]
                });
              }}
            >
              + Add Matrix Row
            </button>
          </div>

          <table className={styles.formTable}>
            <thead>
              <tr>
                <th>Employee / Target Role</th>
                <th>Required Training Module</th>
                <th style={{ width: '100px' }}>Frequency</th>
                <th style={{ width: '105px' }}>Planned Date</th>
                <th style={{ width: '105px' }}>Completed Date</th>
                <th style={{ width: '100px' }}>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((m, idx) => (
                <tr key={m.id}>
                  <td><input type="text" value={m.employeeRole || ''} onChange={(e) => { const u = [...matrix]; u[idx].employeeRole = e.target.value; setForm({ ...form, matrix: u }); }} /></td>
                  <td><input type="text" value={m.requiredTraining || ''} onChange={(e) => { const u = [...matrix]; u[idx].requiredTraining = e.target.value; setForm({ ...form, matrix: u }); }} /></td>
                  <td>
                    <select value={m.frequency || 'Annual'} onChange={(e) => { const u = [...matrix]; u[idx].frequency = e.target.value; setForm({ ...form, matrix: u }); }}>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Bi-Annual">Bi-Annual</option>
                      <option value="Annual">Annual</option>
                    </select>
                  </td>
                  <td><input type="date" value={m.plannedDate || ''} onChange={(e) => { const u = [...matrix]; u[idx].plannedDate = e.target.value; setForm({ ...form, matrix: u }); }} /></td>
                  <td><input type="date" value={m.completedDate || ''} onChange={(e) => { const u = [...matrix]; u[idx].completedDate = e.target.value; setForm({ ...form, matrix: u }); }} /></td>
                  <td>
                    <select value={m.status || 'Planned'} onChange={(e) => { const u = [...matrix]; u[idx].status = e.target.value; setForm({ ...form, matrix: u }); }}>
                      <option value="Planned">Planned</option>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                  <td><input type="text" value={m.remarks || ''} onChange={(e) => { const u = [...matrix]; u[idx].remarks = e.target.value; setForm({ ...form, matrix: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // ── HR-F-10: Performance Appraisal -- KRA / KPI ──
    case 'HR-F-10': {
      const f = form.fields || {};
      const kraList = form.kraList || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Employee Appraisal Details</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={f.employeeName || ''} onChange={(e) => updateField('employeeName', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={f.employeeId || ''} onChange={(e) => updateField('employeeId', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={f.department || ''} onChange={(e) => updateField('department', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Designation</label>
              <input type="text" className={styles.formInput} value={f.designation || ''} onChange={(e) => updateField('designation', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Appraisal Period</label>
              <input type="text" className={styles.formInput} value={f.appraisalPeriod || 'FY 2024-25'} onChange={(e) => updateField('appraisalPeriod', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reporting Manager</label>
              <input type="text" className={styles.formInput} value={f.reportingManager || ''} onChange={(e) => updateField('reportingManager', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className={styles.sectionHeading} style={{ margin: 0, border: 'none' }}>Key Result Areas (KRAs) & Performance Targets</div>
            <button 
              type="button" 
              className={styles.btnSecondary}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => {
                const nextId = kraList.length + 1;
                setForm({
                  ...form,
                  kraList: [
                    ...kraList,
                    { id: nextId, kraKpi: '', weight: '20%', target: '', achievement: '', rating: '4', comments: '' }
                  ]
                });
              }}
            >
              + Add KRA Row
            </button>
          </div>

          <table className={styles.formTable}>
            <thead>
              <tr>
                <th>KRA / KPI Goal</th>
                <th style={{ width: '80px' }}>Weight %</th>
                <th>Target</th>
                <th>Achievement</th>
                <th style={{ width: '80px' }}>Rating (1-5)</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {kraList.map((k, idx) => (
                <tr key={k.id}>
                  <td><input type="text" value={k.kraKpi || ''} onChange={(e) => { const u = [...kraList]; u[idx].kraKpi = e.target.value; setForm({ ...form, kraList: u }); }} /></td>
                  <td><input type="text" value={k.weight || ''} onChange={(e) => { const u = [...kraList]; u[idx].weight = e.target.value; setForm({ ...form, kraList: u }); }} /></td>
                  <td><input type="text" value={k.target || ''} onChange={(e) => { const u = [...kraList]; u[idx].target = e.target.value; setForm({ ...form, kraList: u }); }} /></td>
                  <td><input type="text" value={k.achievement || ''} onChange={(e) => { const u = [...kraList]; u[idx].achievement = e.target.value; setForm({ ...form, kraList: u }); }} /></td>
                  <td>
                    <select value={k.rating || '4'} onChange={(e) => { const u = [...kraList]; u[idx].rating = e.target.value; setForm({ ...form, kraList: u }); }}>
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </td>
                  <td><input type="text" value={k.comments || ''} onChange={(e) => { const u = [...kraList]; u[idx].comments = e.target.value; setForm({ ...form, kraList: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Overall Rating</label>
              <select className={styles.formSelect} value={form.overallRating || 'Meets Expectations'} onChange={(e) => setForm({ ...form, overallRating: e.target.value })}>
                <option value="Outstanding">Outstanding</option>
                <option value="Exceeds Expectations">Exceeds Expectations</option>
                <option value="Meets Expectations">Meets Expectations</option>
                <option value="Needs Improvement">Needs Improvement</option>
                <option value="Unsatisfactory">Unsatisfactory</option>
              </select>
            </div>
            <div className={styles.formField} style={{ marginTop: '8px' }}>
              <label className={styles.formLabel}>Development / Training Needs</label>
              <input type="text" className={styles.formInput} value={form.developmentNeeds || ''} onChange={(e) => setForm({ ...form, developmentNeeds: e.target.value })} />
            </div>
            <div className={styles.formField} style={{ marginTop: '8px' }}>
              <label className={styles.formLabel}>Employee Comments</label>
              <input type="text" className={styles.formInput} value={form.employeeComments || ''} onChange={(e) => setForm({ ...form, employeeComments: e.target.value })} />
            </div>
          </div>
        </div>
      );
    }

    // ── HR-F-11: Employee Grievance Form / Register ──
    case 'HR-F-11': {
      const f = form.fields || {};
      const nog = form.natureOfGrievance || {};
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Grievance Registration</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Grievance No.</label>
              <input type="text" className={styles.formInput} value={f.grievanceNo || ''} onChange={(e) => updateField('grievanceNo', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date Received</label>
              <input type="date" className={styles.formInput} value={f.dateReceived || ''} onChange={(e) => updateField('dateReceived', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={f.employeeName || ''} onChange={(e) => updateField('employeeName', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={f.employeeId || ''} onChange={(e) => updateField('employeeId', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={f.department || ''} onChange={(e) => updateField('department', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Received By</label>
              <input type="text" className={styles.formInput} value={f.receivedBy || ''} onChange={(e) => updateField('receivedBy', e.target.value)} />
            </div>
          </div>

          <div className={styles.sectionHeading}>Nature of Grievance (Select applicable)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginBottom: '14px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            {['salaryPayroll', 'attendance', 'leave', 'supervisorManager', 'workplace', 'safety', 'behaviour', 'welfare', 'other'].map(key => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={nog[key] || false}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      natureOfGrievance: {
                        ...nog,
                        [key]: e.target.checked
                      }
                    });
                  }}
                />
                <span style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
              </label>
            ))}
          </div>

          <div className={styles.formField} style={{ marginBottom: '12px' }}>
            <label className={styles.formLabel}>Details of Grievance</label>
            <textarea className={styles.formTextarea} rows={3} value={form.detailsOfGrievance || ''} onChange={(e) => setForm({ ...form, detailsOfGrievance: e.target.value })} placeholder="Comprehensive description of the grievance..." />
          </div>

          <div className={styles.formField} style={{ marginBottom: '12px' }}>
            <label className={styles.formLabel}>Fact-finding / Action Taken</label>
            <textarea className={styles.formTextarea} rows={3} value={form.factFindingActionTaken || ''} onChange={(e) => setForm({ ...form, factFindingActionTaken: e.target.value })} placeholder="Inquiry findings and remedial actions decided..." />
          </div>

          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Acknowledged Date</label>
              <input type="date" className={styles.formInput} value={form.acknowledgedDate || ''} onChange={(e) => setForm({ ...form, acknowledgedDate: e.target.value })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Target / Actual Closure Date</label>
              <input type="date" className={styles.formInput} value={form.targetActualClosureDate || ''} onChange={(e) => setForm({ ...form, targetActualClosureDate: e.target.value })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Status</label>
              <select className={styles.formSelect} value={form.status || 'Open'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Outcome Communicated to Employee</label>
              <select className={styles.formSelect} value={form.outcomeCommunicated || 'Yes'} onChange={(e) => setForm({ ...form, outcomeCommunicated: e.target.value })}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not applicable">Not applicable</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    // ── HR-F-12: Employee Asset Issue & Handover Form ──
    case 'HR-F-12': {
      const assets = form.assets || [];
      return (
        <div className={styles.formSection}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div className={styles.sectionHeading} style={{ margin: 0, border: 'none' }}>Company Assets Issue & Return Registry</div>
            <button 
              type="button" 
              className={styles.btnSecondary}
              style={{ padding: '3px 8px', fontSize: '11px' }}
              onClick={() => {
                const nextId = assets.length + 1;
                setForm({
                  ...form,
                  assets: [
                    ...assets,
                    { id: nextId, assetItem: '', assetIdSerial: '', qty: '1', condition: 'Good', issueDate: '', returnDate: '', remarks: '' }
                  ]
                });
              }}
            >
              + Add Asset Row
            </button>
          </div>

          <table className={styles.formTable}>
            <thead>
              <tr>
                <th>Asset / Item</th>
                <th>Asset ID / Serial No.</th>
                <th style={{ width: '70px' }}>Qty</th>
                <th style={{ width: '90px' }}>Condition</th>
                <th style={{ width: '105px' }}>Issue Date</th>
                <th style={{ width: '105px' }}>Return Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a, idx) => (
                <tr key={a.id}>
                  <td><input type="text" value={a.assetItem || ''} onChange={(e) => { const u = [...assets]; u[idx].assetItem = e.target.value; setForm({ ...form, assets: u }); }} /></td>
                  <td><input type="text" value={a.assetIdSerial || ''} onChange={(e) => { const u = [...assets]; u[idx].assetIdSerial = e.target.value; setForm({ ...form, assets: u }); }} /></td>
                  <td><input type="text" value={a.qty || '1'} onChange={(e) => { const u = [...assets]; u[idx].qty = e.target.value; setForm({ ...form, assets: u }); }} /></td>
                  <td><input type="text" value={a.condition || 'Good'} onChange={(e) => { const u = [...assets]; u[idx].condition = e.target.value; setForm({ ...form, assets: u }); }} /></td>
                  <td><input type="date" value={a.issueDate || ''} onChange={(e) => { const u = [...assets]; u[idx].issueDate = e.target.value; setForm({ ...form, assets: u }); }} /></td>
                  <td><input type="date" value={a.returnDate || ''} onChange={(e) => { const u = [...assets]; u[idx].returnDate = e.target.value; setForm({ ...form, assets: u }); }} /></td>
                  <td><input type="text" value={a.remarks || ''} onChange={(e) => { const u = [...assets]; u[idx].remarks = e.target.value; setForm({ ...form, assets: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '14px', background: '#f8fafc', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '12px' }}>
            <strong>Employee Acknowledgement:</strong> {form.acknowledgement || 'I acknowledge receipt/return of the above company property and agree to follow applicable company controls.'}
          </div>
        </div>
      );
    }

    // ── HR-F-13: Exit Clearance Form ──
    case 'HR-F-13': {
      const depts = form.departments || [];
      const empInfo = form.employeeInfo || {};
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Employee Exit Details</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={empInfo.employeeName || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...empInfo, employeeName: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={empInfo.employeeId || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...empInfo, employeeId: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Last Working Date</label>
              <input type="date" className={styles.formInput} value={empInfo.lastWorkingDate || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...empInfo, lastWorkingDate: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reason</label>
              <select className={styles.formSelect} value={empInfo.reason || 'Resignation'} onChange={(e) => setForm({ ...form, employeeInfo: { ...empInfo, reason: e.target.value } })}>
                <option value="Resignation">Resignation</option>
                <option value="Termination">Termination</option>
                <option value="Retirement">Retirement</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className={styles.sectionHeading}>Departmental Clearance Signoff Matrix</div>
          <table className={styles.formTable}>
            <thead>
              <tr>
                <th>Department / Area</th>
                <th>Responsible Person</th>
                <th style={{ width: '130px' }}>Clearance Status</th>
                <th style={{ width: '140px' }}>Signature / Date</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {depts.map((d, idx) => (
                <tr key={d.id}>
                  <td><strong>{d.area}</strong></td>
                  <td><input type="text" value={d.responsiblePerson || ''} onChange={(e) => { const u = [...depts]; u[idx].responsiblePerson = e.target.value; setForm({ ...form, departments: u }); }} /></td>
                  <td>
                    <select value={d.status || 'Cleared'} onChange={(e) => { const u = [...depts]; u[idx].status = e.target.value; setForm({ ...form, departments: u }); }}>
                      <option value="Cleared">Cleared</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                  <td><input type="text" value={d.signatureDate || ''} onChange={(e) => { const u = [...depts]; u[idx].signatureDate = e.target.value; setForm({ ...form, departments: u }); }} placeholder="Signed & Date" /></td>
                  <td><input type="text" value={d.remarks || ''} onChange={(e) => { const u = [...depts]; u[idx].remarks = e.target.value; setForm({ ...form, departments: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.formField} style={{ marginTop: '12px' }}>
            <label className={styles.formLabel}>Pending Items / Outstanding Remarks</label>
            <input type="text" className={styles.formInput} value={empInfo.pendingItemsRemarks || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...empInfo, pendingItemsRemarks: e.target.value } })} placeholder="List any unresolved dues, assets, or projects..." />
          </div>
        </div>
      );
    }

    // ── HR-F-14: Exit Interview Form ──
    case 'HR-F-14': {
      const f = form.fields || {};
      const topics = form.topics || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Exit Interview Details</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={f.employeeName || ''} onChange={(e) => updateField('employeeName', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={f.employeeId || ''} onChange={(e) => updateField('employeeId', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Department</label>
              <input type="text" className={styles.formInput} value={f.department || ''} onChange={(e) => updateField('department', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Designation</label>
              <input type="text" className={styles.formInput} value={f.designation || ''} onChange={(e) => updateField('designation', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date of Joining</label>
              <input type="date" className={styles.formInput} value={f.dateOfJoining || ''} onChange={(e) => updateField('dateOfJoining', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Last Working Date</label>
              <input type="date" className={styles.formInput} value={f.lastWorkingDate || ''} onChange={(e) => updateField('lastWorkingDate', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reporting Manager</label>
              <input type="text" className={styles.formInput} value={f.reportingManager || ''} onChange={(e) => updateField('reportingManager', e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Interview Date</label>
              <input type="date" className={styles.formInput} value={f.interviewDate || ''} onChange={(e) => updateField('interviewDate', e.target.value)} />
            </div>
          </div>

          <div className={styles.sectionHeading}>Topic Evaluation</div>
          <table className={styles.formTable}>
            <thead>
              <tr>
                <th>Topic</th>
                <th style={{ width: '180px' }}>Rating / Response</th>
                <th>Comments</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t, idx) => (
                <tr key={t.id}>
                  <td><strong>{t.topic}</strong></td>
                  <td><input type="text" value={t.ratingResponse || ''} onChange={(e) => { const u = [...topics]; u[idx].ratingResponse = e.target.value; setForm({ ...form, topics: u }); }} /></td>
                  <td><input type="text" value={t.comments || ''} onChange={(e) => { const u = [...topics]; u[idx].comments = e.target.value; setForm({ ...form, topics: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.formGrid} style={{ marginTop: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Suggestions for Improvement</label>
              <input type="text" className={styles.formInput} value={form.suggestionsForImprovement || ''} onChange={(e) => setForm({ ...form, suggestionsForImprovement: e.target.value })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Would Employee Consider Rejoining?</label>
              <select className={styles.formSelect} value={form.considerRejoining || 'Yes'} onChange={(e) => setForm({ ...form, considerRejoining: e.target.value })}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Maybe">Maybe</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    // ── HR-F-15: Full & Final Checklist ──
    case 'HR-F-15': {
      const checks = form.checks || [];
      const empInfo = form.employeeInfo || {};
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Employee Details</div>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee Name</label>
              <input type="text" className={styles.formInput} value={empInfo.employeeName || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...empInfo, employeeName: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Employee ID</label>
              <input type="text" className={styles.formInput} value={empInfo.employeeId || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...empInfo, employeeId: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Last Working Date</label>
              <input type="date" className={styles.formInput} value={empInfo.lastWorkingDate || ''} onChange={(e) => setForm({ ...form, employeeInfo: { ...empInfo, lastWorkingDate: e.target.value } })} />
            </div>
          </div>

          <div className={styles.sectionHeading}>Full & Final Verification Checkpoints</div>
          <table className={styles.formTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th>Check Item</th>
                <th style={{ width: '130px' }}>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c, idx) => (
                <tr key={c.id}>
                  <td>{idx + 1}</td>
                  <td><strong>{c.checkItem}</strong></td>
                  <td>
                    <select value={c.status || 'Complete'} onChange={(e) => { const u = [...checks]; u[idx].status = e.target.value; setForm({ ...form, checks: u }); }}>
                      <option value="Complete">Complete</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </td>
                  <td><input type="text" value={c.remarks || ''} onChange={(e) => { const u = [...checks]; u[idx].remarks = e.target.value; setForm({ ...form, checks: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    // ── HR-F-16: Monthly HR Report ──
    case 'HR-F-16': {
      const meta = form.meta || {};
      const manpower = form.manpowerTable || [];
      const kpis = form.kpisTable || [];
      const activities = form.activitiesTable || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.formGrid} style={{ marginBottom: '14px' }}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Reporting Month</label>
              <input type="text" className={styles.formInput} value={meta.reportingMonth || 'March 2025'} onChange={(e) => setForm({ ...form, meta: { ...meta, reportingMonth: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Prepared By</label>
              <input type="text" className={styles.formInput} value={meta.preparedBy || ''} onChange={(e) => setForm({ ...form, meta: { ...meta, preparedBy: e.target.value } })} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Date</label>
              <input type="date" className={styles.formInput} value={meta.date || ''} onChange={(e) => setForm({ ...form, meta: { ...meta, date: e.target.value } })} />
            </div>
          </div>

          {/* Table 1: Manpower Headcount */}
          <div className={styles.sectionHeading}>1. Total Manpower Breakdown</div>
          <table className={styles.formTable} style={{ marginBottom: '16px' }}>
            <thead>
              <tr>
                <th>HR Indicator / Function</th>
                <th style={{ width: '80px' }}>Opening</th>
                <th style={{ width: '80px' }}>Additions</th>
                <th style={{ width: '80px' }}>Exits</th>
                <th style={{ width: '80px' }}>Closing</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {manpower.map((m, idx) => (
                <tr key={m.id}>
                  <td><strong>{m.indicator}</strong></td>
                  <td><input type="number" value={m.opening || 0} onChange={(e) => { const u = [...manpower]; u[idx].opening = Number(e.target.value); setForm({ ...form, manpowerTable: u }); }} /></td>
                  <td><input type="number" value={m.additions || 0} onChange={(e) => { const u = [...manpower]; u[idx].additions = Number(e.target.value); setForm({ ...form, manpowerTable: u }); }} /></td>
                  <td><input type="number" value={m.exits || 0} onChange={(e) => { const u = [...manpower]; u[idx].exits = Number(e.target.value); setForm({ ...form, manpowerTable: u }); }} /></td>
                  <td><input type="number" value={m.closing || 0} onChange={(e) => { const u = [...manpower]; u[idx].closing = Number(e.target.value); setForm({ ...form, manpowerTable: u }); }} /></td>
                  <td><input type="text" value={m.remarks || ''} onChange={(e) => { const u = [...manpower]; u[idx].remarks = e.target.value; setForm({ ...form, manpowerTable: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table 2: Monthly KPIs */}
          <div className={styles.sectionHeading}>2. Monthly KPI Performance</div>
          <table className={styles.formTable} style={{ marginBottom: '16px' }}>
            <thead>
              <tr>
                <th>Monthly KPI Parameter</th>
                <th style={{ width: '130px' }}>Target</th>
                <th style={{ width: '110px' }}>Actual</th>
                <th style={{ width: '110px' }}>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {kpis.map((k, idx) => (
                <tr key={k.id}>
                  <td><strong>{k.kpi}</strong></td>
                  <td><input type="text" value={k.target || ''} onChange={(e) => { const u = [...kpis]; u[idx].target = e.target.value; setForm({ ...form, kpisTable: u }); }} /></td>
                  <td><input type="text" value={k.actual || ''} onChange={(e) => { const u = [...kpis]; u[idx].actual = e.target.value; setForm({ ...form, kpisTable: u }); }} /></td>
                  <td><input type="text" value={k.status || ''} onChange={(e) => { const u = [...kpis]; u[idx].status = e.target.value; setForm({ ...form, kpisTable: u }); }} /></td>
                  <td><input type="text" value={k.remarks || ''} onChange={(e) => { const u = [...kpis]; u[idx].remarks = e.target.value; setForm({ ...form, kpisTable: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Table 3: Monthly Activities */}
          <div className={styles.sectionHeading}>3. Monthly Activity Summary</div>
          <table className={styles.formTable} style={{ marginBottom: '16px' }}>
            <thead>
              <tr>
                <th>Monthly Activity</th>
                <th style={{ width: '180px' }}>Count / Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((act, idx) => (
                <tr key={act.id}>
                  <td><strong>{act.activity}</strong></td>
                  <td><input type="text" value={act.countStatus || ''} onChange={(e) => { const u = [...activities]; u[idx].countStatus = e.target.value; setForm({ ...form, activitiesTable: u }); }} /></td>
                  <td><input type="text" value={act.remarks || ''} onChange={(e) => { const u = [...activities]; u[idx].remarks = e.target.value; setForm({ ...form, activitiesTable: u }); }} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.formField}>
            <label className={styles.formLabel}>Management Remarks / Action Points</label>
            <textarea className={styles.formTextarea} rows={3} value={form.managementRemarks || ''} onChange={(e) => setForm({ ...form, managementRemarks: e.target.value })} />
          </div>
        </div>
      );
    }

    // ── Default / Custom SOPs Checklist ──
    default: {
      const items = form.items || [];
      return (
        <div className={styles.formSection}>
          <div className={styles.sectionHeading}>Standard Operating Procedure & Verification Items</div>
          <table className={styles.formTable}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>Sl</th>
                <th>Procedure / Checklist Item</th>
                <th style={{ width: '120px' }}>Requirement</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Completed</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>{idx + 1}</td>
                  <td><strong>{item.item}</strong></td>
                  <td>{item.required || 'Required'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox"
                      style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
                      checked={item.submitted || false}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].submitted = e.target.checked;
                        setForm({ ...form, items: updated });
                      }}
                    />
                  </td>
                  <td>
                    <input 
                      type="text"
                      value={item.remarks || ''}
                      onChange={(e) => {
                        const updated = [...items];
                        updated[idx].remarks = e.target.value;
                        setForm({ ...form, items: updated });
                      }}
                      placeholder="Notes / evidence"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }
}
