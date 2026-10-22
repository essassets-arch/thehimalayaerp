'use client';

import React from 'react';
import styles from './TestCertificateDocument.module.css';

export interface TestSpecificationRow {
  srNo: number;
  specification: string;
  description: string;
}

export interface LoadTestingRow {
  no: number;
  loadApplied: string;
  load: string | number;
  sequence: string;
  remark: string;
}

export interface TestCertificateData {
  id?: string;
  reportNumber: string;
  revision?: number;
  reportDate?: string | Date;
  clientName: string;
  poNumber?: string | null;
  productName: string;
  clearOpening?: string | null;
  quantitySupply?: string | null;
  projectName?: string | null;
  specifications: TestSpecificationRow[];
  loadTestingRows: LoadTestingRow[];
  cycleLoadsTon?: string | null;
  finalLoadTon?: string | null;
  cycleStatement?: string | null;
  resultStatement?: string | null;
  testedByName?: string;
  testedByTitle?: string;
  testedByStamp?: boolean;
  testedBySignature?: boolean;
  approvedByName?: string | null;
  approvedByTitle?: string | null;
  approvedAt?: string | Date | null;
  approvedBySignature?: boolean;
  status?: string;
  remarks?: string | null;
  certificateType?: string | null;
}

interface Props {
  report: TestCertificateData;
  scale?: number;
  id?: string;
}

export const defaultSpecifications: TestSpecificationRow[] = [
  { srNo: 1, specification: 'MOC of Material', description: 'FRP (Fiber Reinforced Polymer)' },
  { srNo: 2, specification: 'Load Bearing Capacity', description: '12.5 Ton (Class B125)' },
  { srNo: 3, specification: 'Colour', description: 'Black (Carbon Stabilized)' },
  { srNo: 4, specification: 'RESIN Polymer', description: 'Isophthalic Unsaturated Polyester Resin' },
  { srNo: 5, specification: 'Filler Content', description: 'NIL (Virgin Structural Composite)' },
  { srNo: 6, specification: 'Outdoor Use / Weathering', description: 'YES (All-Weather Resistant)' },
  { srNo: 7, specification: 'Load Testing Standard', description: 'As Per BS EN 124-5:2015 Clause 8.3' },
  { srNo: 8, specification: 'UV Resistance', description: 'UV Stabilized (High Resistance)' },
  { srNo: 9, specification: 'Testing Code Standard', description: 'EN 124-5:2015' },
  { srNo: 10, specification: 'Compliance Classification', description: 'EN 124 Standard (Class Certified)' },
];

export const defaultLoadTestingRows: LoadTestingRow[] = [
  { no: 1, loadApplied: 'Stage 1 Proof Load', load: '12.5', sequence: 'Gradually Applied', remark: 'Satisfactory' },
  { no: 2, loadApplied: 'Stage 2 Proof Load', load: '25.0', sequence: 'Gradually Applied', remark: 'Satisfactory' },
  { no: 3, loadApplied: 'Stage 3 Proof Load', load: '37.5', sequence: 'Gradually Applied', remark: 'Satisfactory' },
  { no: 4, loadApplied: 'Stage 4 Proof Load', load: '40.0', sequence: 'Gradually Applied', remark: 'Satisfactory' },
  { no: 5, loadApplied: 'Stage 5 Peak Load', load: '40.0', sequence: 'Maintained 30 Secs', remark: 'No Deflection' },
];

export default function TestCertificateDocument({ report, id = 'test-certificate-document' }: Props) {
  const formattedDate = report.reportDate
    ? new Date(report.reportDate).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  const specs = report.specifications && report.specifications.length > 0
    ? report.specifications
    : defaultSpecifications;

  const loadRows = report.loadTestingRows && report.loadTestingRows.length > 0
    ? report.loadTestingRows
    : defaultLoadTestingRows;

  const cycleLoadsTon = report.cycleLoadsTon || '40';
  const finalLoadTon = report.finalLoadTon || '40';

  const cycleStatementText = report.cycleStatement || (
    report.cycleLoadsTon || report.finalLoadTon
      ? `Five cycles of ${report.cycleLoadsTon || '40'} tons were applied & released, followed by the final ${report.finalLoadTon || '40'} tons load maintained for 30secs.`
      : 'Five cycles of 40 tons were applied & released, followed by the final 40 tons load maintained for 30secs.'
  );

  const resultText = report.resultStatement ||
    'Result:- No Cracks or Determination of FRP Cover observed after applying sequence of load and FRP Cover & frame were found satisfactory.';

  const isApproved = report.status === 'Approved';

  return (
    <div className={styles.certWrapper}>
      <div id={id} className={styles.certSheet}>
        {/* ── Inner Gold Ornamental Frame ── */}
        <div className={styles.innerBorder} aria-hidden="true" />
        <div className={styles.cornerBracketTL} aria-hidden="true" />
        <div className={styles.cornerBracketTR} aria-hidden="true" />
        <div className={styles.cornerBracketBL} aria-hidden="true" />
        <div className={styles.cornerBracketBR} aria-hidden="true" />

        {/* ── Subtle Background Watermark Seal ── */}
        <div className={styles.watermarkBg} aria-hidden="true">
          <svg viewBox="0 0 400 400" width="360" height="360" fill="none" stroke="#0e2f50" strokeWidth="2">
            <circle cx="200" cy="200" r="180" strokeDasharray="6 4" strokeWidth="3" />
            <circle cx="200" cy="200" r="162" strokeWidth="1.5" />
            <polygon points="200,60 220,130 290,130 235,175 255,245 200,205 145,245 165,175 110,130 180,130" strokeWidth="1.5" fill="none" opacity="0.3" />
            <circle cx="200" cy="200" r="115" strokeDasharray="4 4" strokeWidth="1" />
            <path d="M 120 200 A 80 80 0 0 1 280 200" strokeWidth="2" />
            <path d="M 120 200 A 80 80 0 0 0 280 200" strokeWidth="2" />
          </svg>
        </div>

        <div className={styles.certContent}>
          {/* ── Top Header ── */}
          <header className={styles.certHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.brandMark} aria-hidden="true">H</div>
              <div className={styles.companyTitleBlock}>
                <span className={styles.companyTitle}>HIMALAYA COMPOSITE &amp; PRECAST PVT. LTD.</span>
                <span className={styles.companySubtitle}>CENTRAL QUALITY ASSURANCE &amp; MATERIALS TESTING LABORATORY</span>
                <span className={styles.companyFacility}>
                  ISO 9001:2015 CERTIFIED • FACTORY: PLOT 34-35, SARDAR PATEL IND. ESTATE, HATHIJAN, AHMEDABAD - 382445
                </span>
              </div>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.logoContainer}>
                <img
                  src="/himalaya-logo.png"
                  alt="Himalaya Composites"
                  className={styles.himalayaLogo}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('himalaya-logo-mark.png')) {
                      target.src = '/himalaya-logo-mark.png';
                    }
                  }}
                />
                <div className={styles.logoTagline1}>Manhole Covers</div>
                <div className={styles.logoTagline2}>Unbeatable • Unmatchable</div>
              </div>
            </div>
          </header>

          {/* ── Title Banner ── */}
          <section className={styles.headingBanner}>
            <div className={styles.headingMain}>
              <h1 className={styles.certHeading}>MTC - Material Test Certificate</h1>
              <div className={styles.standardSubtitle}>
                MECHANICAL PROOF LOAD CONFORMANCE REPORT • ACCORDING TO BS EN 124-1 &amp; EN 124-5:2015
              </div>
            </div>

            <div className={styles.certIdBadge}>
              CERT NO: {report.reportNumber || 'TC-2026-LIVE'}
              {report.revision !== undefined && report.revision > 0 && ` • REV 0${report.revision}`}
            </div>
          </section>

          {/* ── Structured Customer & Order Dossier (8 Fields) ── */}
          <section className={styles.metaSection} aria-label="Certificate Metadata">
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Date of Testing:</span>
              <span className={styles.metaValue}>{formattedDate}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Client / Consignee:</span>
              <span className={styles.metaValue}>{report.clientName || 'Valued Client'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>P.O. Reference No.:</span>
              <span className={styles.metaValueHighlight}>{report.poNumber || 'PO-RECORDED'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Product Description:</span>
              <span className={styles.metaValue}>{report.productName || 'FRP Manhole Cover & Frame Assembly'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Clear Opening Size:</span>
              <span className={styles.metaValue}>{report.clearOpening || 'Standard Production Size'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Quantity Supplied:</span>
              <span className={styles.metaValue}>
                {report.quantitySupply ? `${report.quantitySupply} Sets / Units` : 'Lot Supply'}
              </span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Project Reference:</span>
              <span className={styles.metaValue}>{report.projectName || 'Infrastructure Project Site'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Certificate Number:</span>
              <span className={styles.metaValueHighlight}>{report.reportNumber || 'TC-2026-4174'}</span>
            </div>
          </section>

          {/* ── Specifications Table (10 Rows) ── */}
          <section className={styles.tableContainer} aria-label="Technical Specifications">
            <table className={styles.certTable}>
              <thead>
                <tr>
                  <th className={styles.colSr}>SR.</th>
                  <th className={styles.colSpec}>TECHNICAL SPECIFICATION / PARAMETER</th>
                  <th className={styles.colDesc}>OBSERVED VALUE / STANDARD COMPLIANCE</th>
                </tr>
              </thead>
              <tbody>
                {specs.map((item, idx) => {
                  const isStandard = item.specification.toLowerCase().includes('testing') || item.specification.toLowerCase().includes('code');
                  const isLoad = item.specification.toLowerCase().includes('load');
                  return (
                    <tr key={item.srNo || idx}>
                      <td className={styles.colSr}>{String(item.srNo).padStart(2, '0')}</td>
                      <td className={styles.colSpec}>{item.specification}</td>
                      <td className={styles.colDesc}>
                        {isStandard ? (
                          <span className={styles.pillBadge}>{item.description || 'EN 124-5:2015'}</span>
                        ) : isLoad ? (
                          <span className={styles.pillSuccess}>{item.description || '-'}</span>
                        ) : (
                          item.description || '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* ── Load Testing Protocol Header ── */}
          <div className={styles.loadTestingBanner}>
            <span>PROOF LOAD TESTING PROTOCOL (BS EN 124-1 &amp; EN 124-5:2015)</span>
            <span className={styles.loadTestingStandard}>METHOD CLAUSE 8.3 • CALIBRATED RIG</span>
          </div>

          {/* ── Load Testing Sequence Table (6 Rows) ── */}
          <section className={styles.tableContainer} aria-label="Load Testing Measurements">
            <table className={styles.certTable}>
              <thead>
                <tr>
                  <th className={styles.loadColNo}>STAGE</th>
                  <th className={styles.loadColApplied}>LOAD DESCRIPTION</th>
                  <th className={styles.loadColLoad}>APPLIED LOAD</th>
                  <th className={styles.loadColSequence}>LOADING SEQUENCE</th>
                  <th className={styles.loadColRemark}>INSPECTION REMARK</th>
                </tr>
              </thead>
              <tbody>
                {loadRows.map((row, idx) => {
                  const rawLoad = row.load != null && String(row.load).trim() !== '' ? String(row.load) : '';
                  const displayLoad = rawLoad ? (rawLoad.toLowerCase().includes('ton') ? rawLoad : `${rawLoad} Ton`) : '-';
                  return (
                    <tr key={row.no || idx}>
                      <td className={styles.loadColNo}>0{row.no || idx + 1}</td>
                      <td className={styles.loadColApplied}>{row.loadApplied || 'Load in Ton'}</td>
                      <td className={styles.loadColLoad}>{displayLoad}</td>
                      <td className={styles.loadColSequence}>{row.sequence || 'Gradually Applied'}</td>
                      <td className={styles.loadColRemark}>{row.remark || 'Satisfactory'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* ── Five Cycles Endurance Callout ── */}
          <div className={styles.cycleSection}>
            <span className={styles.cycleIcon}>⚡</span>
            <span>
              <strong>Proof Load Endurance Cycle:</strong> {cycleStatementText}
            </span>
          </div>

          {/* ── Final Result & Compliance Verdict ── */}
          <section className={styles.resultSection}>
            <div className={styles.resultTitleRow}>
              <span>COMPLIANCE VERDICT:</span>
              <span className={styles.resultPassBadge}>APPROVED / SATISFACTORY</span>
            </div>
            <div className={styles.resultText}>
              {resultText}
            </div>
          </section>

          {/* ── Signatories & Authentication Seals ── */}
          <footer className={styles.certFooter}>
            {/* Left Signatory Box: Tested By */}
            <div className={styles.footerBox}>
              <div className={styles.signerTitleHeader}>
                <span className={styles.signerTitle}>
                  Tested By (Plant Head Name)
                </span>
                <span className={styles.approvedBadge}>QA/QC LAB</span>
              </div>
              <div className={styles.signerContent}>
                <div className={styles.signerMeta}>
                  <span className={styles.signerName}>
                    {report.testedByName || 'Sana Konda Reddy'}
                  </span>
                  <span className={styles.signerDesignation}>
                    Certified Testing Engineer
                  </span>
                  <span className={styles.signerDate}>
                    Test Date: {formattedDate}
                  </span>
                </div>
                {report.testedByName?.toLowerCase().includes('moksha') && (
                  <img
                    src="/moksha_sign.png"
                    alt="Moksha Naik Signature"
                    className={styles.signatureImg}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('moksha-signature.png')) {
                        target.src = '/moksha-signature.png';
                      }
                    }}
                  />
                )}
                {report.testedByStamp !== false && (
                  <img
                    src="/himalaya-stamp.png"
                    alt="Himalaya Official Seal"
                    className={styles.stampImg}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('ref3.png')) {
                        target.src = '/ref3.png';
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Right Signatory Box: Approved By */}
            <div className={styles.footerBox}>
              <div className={styles.signerTitleHeader}>
                <span className={styles.signerTitle}>Approved By:-</span>
                {isApproved ? (
                  <span className={styles.approvedBadge}>✓ VERIFIED &amp; APPROVED</span>
                ) : (
                  <span className={styles.pendingNotice}>({report.status || 'Pending Approval'})</span>
                )}
              </div>
              <div className={styles.signerContent}>
                <div className={styles.signerMeta}>
                  <span className={styles.signerName}>
                    {report.approvedByName || (isApproved ? 'Authorized Approver' : 'Plant Head / Factory Director')}
                  </span>
                  <span className={styles.signerDesignation}>
                    {report.approvedByTitle || 'Head of Manufacturing Operations'}
                  </span>
                  <span className={styles.signerDate}>
                    {isApproved && report.approvedAt
                      ? `Approved: ${new Date(report.approvedAt).toLocaleDateString('en-GB')}`
                      : `Issue Date: ${formattedDate}`}
                  </span>
                </div>

                {isApproved && report.approvedBySignature !== false ? (
                  <img
                    src="/moksha_sign.png"
                    alt="Authorized Signature"
                    className={styles.signatureImg}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('moksha-signature.png')) {
                        target.src = '/moksha-signature.png';
                      } else if (!target.src.includes('himalaya-signature.png')) {
                        target.src = '/himalaya-signature.png';
                      }
                    }}
                  />
                ) : (
                  <div style={{ width: '80px', height: '36px', borderBottom: '1px dashed #cbd5e1' }} />
                )}
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
