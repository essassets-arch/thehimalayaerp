'use client';

import React from 'react';
import styles from './TestCertificateDocument2.module.css';
import { TestCertificateData, TestSpecificationRow } from './TestCertificateDocument';

export const defaultSpecificationsCert2: TestSpecificationRow[] = [
  { srNo: 1, specification: 'MOC of Material', description: 'FRP (Fiber Reinforced Polymer)' },
  { srNo: 2, specification: 'Clear Opening', description: '600 X 600 MM' },
  { srNo: 3, specification: 'Cover Size', description: '650 X 650 MM' },
  { srNo: 4, specification: 'Frame Size', description: '710 X 710 MM' },
  { srNo: 5, specification: 'Load Bearing', description: '12.5 TON (B125)' },
  { srNo: 6, specification: 'Colour', description: 'Black' },
  { srNo: 7, specification: 'Resin', description: 'Isopthalic' },
  { srNo: 8, specification: 'Filer Content', description: 'NIL' },
  { srNo: 9, specification: 'Outdoor use', description: 'Yes' },
  { srNo: 10, specification: 'Testing Code', description: 'As per EN124-5:2015' },
  { srNo: 11, specification: 'UV Resistant', description: 'UV Stabilizer' },
];

export function resolveCertificate2Rows(report: TestCertificateData): TestSpecificationRow[] {
  const existingSpecs = report.specifications || [];

  // If report already has explicit Cert 2 specification rows saved, use them directly!
  if (
    existingSpecs.length >= 10 &&
    existingSpecs.some((s) => (s.specification || '').toLowerCase().includes('cover size'))
  ) {
    return existingSpecs.map((s, idx) => ({
      srNo: s.srNo || idx + 1,
      specification: s.specification,
      description: s.description ?? '',
    }));
  }

  const findExisting = (keywords: string[]) => {
    const match = existingSpecs.find((s) => {
      const name = (s.specification || '').toLowerCase();
      return keywords.some((k) => name.includes(k.toLowerCase()));
    });
    return match ? match.description : undefined;
  };

  // Derive sizes & capacities from product name or clear opening if available
  const pName = report.productName || '';
  const clearOp = report.clearOpening || '';

  // Extract dimensions like 300x700, 600x600, 450x600, 750x750, 900x900
  const sizeMatch = (clearOp + ' ' + pName).match(/(\d{3,4})\s*[xX*]\s*(\d{3,4})/);
  let derivedClear = clearOp || (sizeMatch ? `${sizeMatch[1]} X ${sizeMatch[2]} MM` : '');
  if (derivedClear && !derivedClear.toUpperCase().includes('MM') && !derivedClear.toUpperCase().includes('X')) {
    derivedClear = `${derivedClear} MM`;
  }

  let derivedCover = '';
  let derivedFrame = '';
  if (sizeMatch) {
    const w = parseInt(sizeMatch[1], 10);
    const h = parseInt(sizeMatch[2], 10);
    derivedCover = `${w + 50} X ${h + 50} MM`;
    derivedFrame = `${w + 110} X ${h + 110} MM`;
  }

  // Extract load rating like B125, C250, D400, 12.5T, 25T, 40T
  let derivedLoad = '';
  if (pName.includes('D400') || pName.includes('40T') || pName.includes('40 T')) {
    derivedLoad = '40.0 TON (Class D400)';
  } else if (pName.includes('C250') || pName.includes('25T') || pName.includes('25 T')) {
    derivedLoad = '25.0 TON (Class C250)';
  } else if (pName.includes('B125') || pName.includes('12.5T') || pName.includes('12.5 T')) {
    derivedLoad = '12.5 TON (Class B125)';
  } else if (pName.includes('A15') || pName.includes('2.5T') || pName.includes('5T')) {
    derivedLoad = '2.5 / 5.0 TON (Class A15)';
  }

  const getVal = (keywords: string[], fallback: string) => {
    const val = findExisting(keywords);
    return val !== undefined ? val : fallback;
  };

  return [
    {
      srNo: 1,
      specification: 'MOC of Material',
      description: getVal(['moc', 'material'], pName ? 'FRP (Fiber Reinforced Polymer)' : ''),
    },
    {
      srNo: 2,
      specification: 'Clear Opening',
      description: getVal(['clear opening'], derivedClear),
    },
    {
      srNo: 3,
      specification: 'Cover Size',
      description: getVal(['cover size'], derivedCover),
    },
    {
      srNo: 4,
      specification: 'Frame Size',
      description: getVal(['frame size'], derivedFrame || '-'),
    },
    {
      srNo: 5,
      specification: 'Load Bearing',
      description: getVal(['load bearing', 'capacity'], derivedLoad || '12.5 TON (B125)'),
    },
    {
      srNo: 6,
      specification: 'Colour',
      description: getVal(['colour', 'color'], pName ? 'Grey' : 'GREY'),
    },
    {
      srNo: 7,
      specification: 'Resin',
      description: getVal(['resin'], 'Isopthalic'),
    },
    {
      srNo: 8,
      specification: 'Filer Content',
      description: getVal(['filer', 'filler'], 'NIL'),
    },
    {
      srNo: 9,
      specification: 'Outdoor use',
      description: getVal(['outdoor'], 'Yes'),
    },
    {
      srNo: 10,
      specification: 'Testing Code',
      description: getVal(['testing code', 'code'], 'As per EN124-5:2015'),
    },
    {
      srNo: 11,
      specification: 'UV Resistant',
      description: getVal(['uv'], 'UV Stabilizer'),
    },
  ];
}

interface Props {
  report: TestCertificateData;
  id?: string;
  engineerTitle?: string;
}

export default function TestCertificateDocument2({
  report,
  id = 'test-certificate-document-2',
  engineerTitle = 'R&D QUALITY ENGINEER',
}: Props) {
  const rows = resolveCertificate2Rows(report);
  const displayTitle = report.testedByTitle?.trim() || engineerTitle;

  const formattedDate = report.reportDate
    ? new Date(report.reportDate).toLocaleDateString('en-GB')
    : new Date().toLocaleDateString('en-GB');

  // Render value cell with intelligent badges & clean styling
  const renderSpecValue = (specName: string, desc: string | undefined | null) => {
    const val = (desc || '').trim();
    if (!val || val === '-') {
      return <span className={styles.dashMuted}>—</span>;
    }

    const sLower = (specName || '').toLowerCase();
    const vLower = val.toLowerCase();

    // Load Bearing rating
    if (sLower.includes('load') || sLower.includes('bearing') || sLower.includes('capacity')) {
      return <span className={styles.loadBadge}>{val}</span>;
    }

    // Testing Code / Standard
    if (
      sLower.includes('testing') ||
      sLower.includes('code') ||
      sLower.includes('standard') ||
      vLower.includes('en124') ||
      vLower.includes('en 124')
    ) {
      return <span className={styles.codeBadge}>{val}</span>;
    }

    // Outdoor use
    if (sLower.includes('outdoor')) {
      const isYes = vLower.includes('yes') || vLower.includes('true');
      return isYes ? (
        <span className={styles.outdoorBadge}>
          <span className={styles.checkIcon}>✓</span>
          <span>{val.length <= 4 ? `${val} (All-Weather)` : val}</span>
        </span>
      ) : (
        <span className={styles.normalVal}>{val}</span>
      );
    }

    // UV Resistant
    if (sLower.includes('uv')) {
      return (
        <span className={styles.uvBadge}>
          <span>☀️</span>
          <span>{val}</span>
        </span>
      );
    }

    // Filler / Filer Content
    if (sLower.includes('filer') || sLower.includes('filler')) {
      if (vLower === 'nil' || vLower === 'none' || vLower === '0' || vLower === '0%') {
        return (
          <span className={styles.nilBadge}>
            <span>NIL</span>
            <span className={styles.nilSub}>(100% Virgin Polymer)</span>
          </span>
        );
      }
    }

    // Dimensions: Clear Opening, Cover Size, Frame Size
    if (sLower.includes('opening') || sLower.includes('cover size') || sLower.includes('frame size')) {
      return <span className={styles.dimensionVal}>{val}</span>;
    }

    // Colour
    if (sLower.includes('colour') || sLower.includes('color')) {
      const isGrey = vLower.includes('grey') || vLower.includes('gray');
      const isBlack = vLower.includes('black');
      return (
        <span className={styles.colorVal}>
          <span
            className={styles.colorDot}
            style={{
              backgroundColor: isGrey ? '#64748b' : isBlack ? '#0f172a' : '#0284c7',
            }}
          />
          <span>{val}</span>
        </span>
      );
    }

    // MOC of Material
    if (sLower.includes('moc') || sLower.includes('material')) {
      return <span className={styles.mocVal}>{val}</span>;
    }

    // Resin
    if (sLower.includes('resin')) {
      return <span className={styles.resinVal}>{val}</span>;
    }

    return <span className={styles.normalVal}>{val}</span>;
  };

  return (
    <div className={styles.certWrapper}>
      <div id={id} className={styles.certSheet}>
        {/* ── Inner Gold Ornamental Frame with Corner Brackets ── */}
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
            <polygon
              points="200,60 220,130 290,130 235,175 255,245 200,205 145,245 165,175 110,130 180,130"
              strokeWidth="1.5"
              fill="none"
              opacity="0.3"
            />
            <circle cx="200" cy="200" r="115" strokeDasharray="4 4" strokeWidth="1" />
            <path d="M 120 200 A 80 80 0 0 1 280 200" strokeWidth="2" />
            <path d="M 120 200 A 80 80 0 0 0 280 200" strokeWidth="2" />
          </svg>
        </div>

        <div className={styles.certContent}>
          {/* ── Top Masthead Header ── */}
          <header className={styles.certHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.brandMark} aria-hidden="true">
                H
              </div>
              <div className={styles.companyTitleBlock}>
                <span className={styles.companyTitle}>HIMALAYA COMPOSITE &amp; PRECAST PVT. LTD.</span>
                <span className={styles.companySubtitle}>CENTRAL QUALITY ASSURANCE &amp; TECHNICAL SPECIFICATION DIVISION</span>
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
              <div className={styles.verificationBadge}>
                <span className={styles.verificationDot} />
                <span>EN-124 VALIDATED TDS</span>
              </div>
            </div>
          </header>

          {/* ── Title Banner ── */}
          <section className={styles.headingBanner}>
            <div className={styles.headingMain}>
              <h1 className={styles.certHeading}>TECHNICAL DATA SPECIFICATION (TDS)</h1>
              <div className={styles.standardSubtitle}>
                HIMALAYA FRP COVER &amp; FRAME • COMPOSITE INFRASTRUCTURE PRODUCTS
              </div>
            </div>

            <div className={styles.certIdBadge}>
              DOC REF: {report.reportNumber || 'TDS-2026-LIVE'}
              {report.revision !== undefined && report.revision > 0 && ` • REV 0${report.revision}`}
            </div>
          </section>

          {/* ── Product & Order Dossier (8-Cell Executive Grid) ── */}
          <section className={styles.metaSection} aria-label="Specification Metadata">
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Date of Issue:</span>
              <span className={styles.metaValue}>{formattedDate}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Client / Consignee:</span>
              <span className={styles.metaValue}>{report.clientName || 'Standard Technical Specification'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Product Description:</span>
              <span className={styles.metaValue}>{report.productName || 'Himalaya FRP Cover & Frame Assembly'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Clear Opening Size:</span>
              <span className={styles.metaValue}>{report.clearOpening || 'Standard Production Size'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>P.O. Reference:</span>
              <span className={styles.metaValueHighlight}>{report.poNumber || 'Standard TDS Issue'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Project Reference:</span>
              <span className={styles.metaValue}>{report.projectName || 'Infrastructure Project Site'}</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Testing Code Standard:</span>
              <span className={styles.metaValue}>BS EN 124-5:2015 (Clause 8.3 Proof Load)</span>
            </div>

            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Certificate Number:</span>
              <span className={styles.metaValueHighlight}>{report.reportNumber || 'TDS-2026-4174'}</span>
            </div>
          </section>

          {/* ── 11-Row Specification Matrix Table ── */}
          <section className={styles.tableContainer} aria-label="Technical Specifications Matrix">
            <table className={styles.specTable}>
              <thead>
                <tr>
                  <th className={styles.colSr}>SR.</th>
                  <th className={styles.colSpec}>TECHNICAL SPECIFICATION / PARAMETER</th>
                  <th className={styles.colDesc}>SPECIFIED VALUE / DESIGNATION</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.srNo}>
                    <td className={styles.colSr}>{String(row.srNo).padStart(2, '0')}</td>
                    <td className={styles.colSpec}>{row.specification}</td>
                    <td className={styles.colDesc}>{renderSpecValue(row.specification, row.description)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* ── Material & Engineering Compliance Callout Box ── */}
          <section className={styles.complianceBox} aria-label="Compliance Declaration">
            <div className={styles.complianceHeader}>
              <span className={styles.complianceIcon}>🛡️</span>
              <span className={styles.complianceTitle}>MATERIAL &amp; PERFORMANCE CONFORMANCE DECLARATION</span>
              <span className={styles.complianceStandard}>BS EN 124-5:2015 COMPLIANT</span>
            </div>
            <div className={styles.complianceText}>
              This Technical Data Specification confirms that the FRP Cover &amp; Frame assembly specified above is
              manufactured using 100% virgin unsaturated Isophthalic resin reinforced with E-Glass fibers and UV
              stabilizers. Nominal performance meets or exceeds BS EN 124-5:2015 standards for mechanical proof load,
              weathering resistance, zero filler content (NIL), and complete chemical inertness in municipal drainage.
            </div>
          </section>

          {/* ── Signatories & Authentication Footer ── */}
          <footer className={styles.certFooter}>
            {/* Left Signatory Box: Tested By / R&D Quality Engineer */}
            <div className={styles.footerBox}>
              <div className={styles.signerTitleHeader}>
                <span className={styles.signerTitle}>Tested &amp; Verified By:</span>
                <span className={styles.badgeNeutral}>R&amp;D / QA LAB</span>
              </div>
              <div className={styles.signerContent}>
                <div className={styles.signerMeta}>
                  <span className={styles.signerName}>{report.testedByName || 'Moksha Naik'}</span>
                  <span className={styles.signerDesignation}>{displayTitle}</span>
                  <span className={styles.signerDate}>Test Date: {formattedDate}</span>
                </div>
                <img
                  src="/moksha_sign.png"
                  alt="R&D Quality Engineer Signature"
                  className={styles.engineerSignatureImg}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('moksha-signature.png')) {
                      target.src = '/moksha-signature.png';
                    }
                  }}
                />
              </div>
            </div>

            {/* Right Signatory Box: Manufacturer Official Seal */}
            <div className={styles.footerBox}>
              <div className={styles.signerTitleHeader}>
                <span className={styles.signerTitle}>Manufacturer Seal &amp; Authentication:</span>
                <span className={styles.approvedBadge}>✓ VALIDATED</span>
              </div>
              <div className={styles.signerContent}>
                <div className={styles.signerMeta}>
                  <span className={styles.signerName}>HIMALAYA COMPOSITE &amp; PRECAST PVT. LTD.</span>
                  <span className={styles.signerDesignation}>Central Quality Assurance Division</span>
                  <span className={styles.signerDate}>Official Seal • Authentic Document</span>
                </div>
                <img
                  src="/himalaya-stamp.png"
                  alt="Himalaya Composites & Precast Pvt. Ltd. Official Seal"
                  className={styles.stampImg}
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('ref3.png')) {
                      target.src = '/ref3.png';
                    }
                  }}
                />
              </div>
            </div>
          </footer>

          {/* ── Micro Security Traceability Bar ── */}
          <div className={styles.securityBar}>
            <span className={styles.securityDocHash}>
              REF: HCL/QA/TDS-{report.reportNumber || '2026'} • REVISION {(report.revision || 0)} • ISO 9001:2015 CERTIFIED
            </span>
            <span>HIMALAYA COMPOSITE &amp; PRECAST PVT. LTD.</span>
            <span>PAGE 1 OF 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
