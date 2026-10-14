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
}

interface Props {
  report: TestCertificateData;
  scale?: number;
  id?: string;
}

export const defaultSpecifications: TestSpecificationRow[] = [
  { srNo: 1, specification: 'MOC of Material', description: 'FRP' },
  { srNo: 2, specification: 'Load Bearing', description: '12.5 Ton' },
  { srNo: 3, specification: 'Colour', description: 'Black' },
  { srNo: 4, specification: 'RESIN', description: 'Isophthalic Resin' },
  { srNo: 5, specification: 'Filler Content', description: 'NIL' },
  { srNo: 6, specification: 'Outdoor Use', description: 'YES' },
  { srNo: 7, specification: 'Load Testing', description: 'As Per EN 124-5:2015' },
  { srNo: 8, specification: 'UV Resistant', description: 'UV Stabilized' },
  { srNo: 9, specification: 'Testing Code', description: 'EN 124-5:2015' },
  { srNo: 10, specification: 'Testing Code', description: 'EN 124' },
];

export const defaultLoadTestingRows: LoadTestingRow[] = [
  { no: 1, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
  { no: 2, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
  { no: 3, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
  { no: 4, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
  { no: 5, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
  { no: 6, loadApplied: 'Load in Ton', load: '', sequence: 'Gradually Applied', remark: '' },
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

  const cycleStatementText = report.cycleStatement || (
    report.cycleLoadsTon || report.finalLoadTon
      ? `Five cycles of ${report.cycleLoadsTon || '___'} tons were applied & released, followed by the final ${report.finalLoadTon || '___'} tons load maintained for 30secs.`
      : 'Five cycles of _____ tons were applied & released, followed by the final _____ tons load maintained for 30secs.'
  );

  const resultText = report.resultStatement ||
    'Result:- No Cracks or Determination of FRP Cover observed after applying sequence of load and FRP Cover & frame were found satisfactory.';

  const isApproved = report.status === 'Approved';

  return (
    <div className={styles.certWrapper}>
      <div id={id} className={styles.certSheet}>
        {/* ── Top Header ── */}
        <div className={styles.certHeader}>
          <div className={styles.companyTitle}>
            HIMALAYA COMPOSITE &amp; PRECAST PVT. LTD
          </div>

          <div className={styles.logoContainer}>
            <img
              src="/himalaya-logo-mark.png"
              alt="Himalaya"
              className={styles.himalayaLogo}
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (!target.src.includes('himalaya-logo.png')) {
                  target.src = '/himalaya-logo.png';
                }
              }}
            />
            <div className={styles.logoTagline1}>Manhole Covers</div>
            <div className={styles.logoTagline2}>Unbeatable - Unmatchable</div>
          </div>
        </div>

        {/* ── Title Banner ── */}
        <div className={styles.headingBanner}>
          <h1 className={styles.certHeading}>TEST CERTIFICATE</h1>
          {report.revision !== undefined && report.revision > 0 && (
            <div className={styles.revisionSubtitle}>
              REVISION {report.revision} • REF: {report.reportNumber}
            </div>
          )}
        </div>

        {/* ── Info Metadata Block ── */}
        <div className={styles.metaSection}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Date:-</span>
            <span className={styles.metaValue}>{formattedDate}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Client Name :-</span>
            <span className={styles.metaValue}>{report.clientName || '-'}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>P.O. No. :-</span>
            <span className={styles.metaValue}>{report.poNumber || '-'}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Name Of the Products:-</span>
            <span className={styles.metaValue}>{report.productName || '-'}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Clear Opening :-</span>
            <span className={styles.metaValue}>{report.clearOpening || '-'}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Quantity Supply:-</span>
            <span className={styles.metaValue}>{report.quantitySupply || '-'}</span>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Project Name :-</span>
            <span className={styles.metaValue}>{report.projectName || '-'}</span>
          </div>
        </div>

        {/* ── Specifications Table (10 Rows) ── */}
        <div className={styles.tableContainer}>
          <table className={styles.certTable}>
            <thead>
              <tr>
                <th className={styles.colSr}>SR. NO.</th>
                <th className={styles.colSpec}>SPECIFICATION</th>
                <th className={styles.colDesc}>DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {specs.map((item, idx) => (
                <tr key={item.srNo || idx}>
                  <td className={styles.colSr}>{item.srNo}</td>
                  <td className={styles.colSpec}>{item.specification}</td>
                  <td className={styles.colDesc}>{item.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Load Testing Subheading ── */}
        <div className={styles.loadTestingBanner}>
          LOAD TESTING (Testing Code 124 -2015 )
        </div>

        {/* ── Load Testing Table (6 Rows) ── */}
        <div className={styles.tableContainer}>
          <table className={styles.certTable}>
            <thead>
              <tr>
                <th className={styles.loadColNo}>No.</th>
                <th className={styles.loadColApplied}>Load Applied</th>
                <th className={styles.loadColLoad}>Load</th>
                <th className={styles.loadColSequence}>Applied Sequence</th>
                <th className={styles.loadColRemark}>Remark</th>
              </tr>
            </thead>
            <tbody>
              {loadRows.map((row, idx) => (
                <tr key={row.no || idx}>
                  <td className={styles.loadColNo}>{row.no}</td>
                  <td className={styles.loadColApplied}>{row.loadApplied || 'Load in Ton'}</td>
                  <td className={styles.loadColLoad}>{row.load ? `${row.load} Ton` : '-'}</td>
                  <td className={styles.loadColSequence}>{row.sequence || 'Gradually Applied'}</td>
                  <td className={styles.loadColRemark}>{row.remark || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Five Cycles Statement ── */}
        <div className={styles.cycleSection}>
          {cycleStatementText}
        </div>

        {/* ── Result Paragraph ── */}
        <div className={styles.resultSection}>
          {resultText}
        </div>

        {/* ── Two-Column Footer: Tested By / Approved By ── */}
        <div className={styles.certFooter}>
          <div className={styles.footerLeft}>
            <div className={styles.signerTitle}>
              Tested By: {report.testedByTitle || 'Plant Head'}
            </div>
            <div className={styles.signerContent}>
              <div className={styles.signerName}>
                {report.testedByName || 'Sana Konda Reddy'}
              </div>
              {report.testedByStamp !== false && (
                <img
                  src="/himalaya-stamp.png"
                  alt="Himalaya Seal"
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

          <div className={styles.footerRight}>
            <div className={styles.signerTitle}>Approved By:-</div>
            <div className={styles.signerContent}>
              {isApproved ? (
                <div className={styles.approvedMeta}>
                  <div className={styles.signerName}>
                    {report.approvedByName || 'Authorized Approver'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    {report.approvedByTitle || 'Plant Head'}
                  </div>
                  {report.approvedAt && (
                    <div className={styles.approvedDate}>
                      Date: {new Date(report.approvedAt).toLocaleDateString('en-GB')}
                    </div>
                  )}
                </div>
              ) : (
                <div className={styles.pendingNotice}>
                  ({report.status || 'Pending Approval'})
                </div>
              )}

              {isApproved && report.approvedBySignature !== false && (
                <img
                  src="/himalaya-signature.png"
                  alt="Approved Signature"
                  className={styles.signatureImg}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('ref2.png')) {
                      target.src = '/ref2.png';
                    }
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
