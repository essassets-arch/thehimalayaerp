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
  // If report has explicit specifications matching Cert 2 keys, use them directly
  const existingSpecs = report.specifications || [];
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

  // Extract dimensions like 600x600, 450x600, 750x750, 900x900
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
    derivedLoad = '2.5 / 5.0 TON (Class A15 / Light Duty)';
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
      description: getVal(['frame size'], derivedFrame),
    },
    {
      srNo: 5,
      specification: 'Load Bearing',
      description: getVal(['load bearing', 'capacity'], derivedLoad),
    },
    {
      srNo: 6,
      specification: 'Colour',
      description: getVal(['colour', 'color'], pName ? 'Black' : ''),
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

  return (
    <div className={styles.certWrapper}>
      <div id={id} className={styles.certSheet}>
        {/* ── Top Header ── */}
        <header className={styles.certHeader}>
          <div className={styles.headerLeft}>
            <h2 className={styles.companyTitle}>
              HIMALAYA COMPOSITE &amp; PRECAST PVT. LTD.
            </h2>
            <div className={styles.headerBlueLine} />
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
              <div className={styles.logoTagline2}>Unbeatable - Unmatchable</div>
            </div>
          </div>
        </header>

        {/* ── Main Subtitle ── */}
        <div className={styles.certSubheading}>
          HIMALAYA FRP COVER &amp; FRAME
        </div>

        {/* ── 11-Row Specification Table & Footer ── */}
        <div className={styles.tableContainer}>
          <table className={styles.specTable}>
            <thead>
              <tr>
                <th className={styles.colSr}>Sr. No</th>
                <th className={styles.colSpec}>Specification</th>
                <th className={styles.colDesc}>description</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.srNo}>
                  <td className={styles.colSr}>{row.srNo}</td>
                  <td className={styles.colSpec}>{row.specification}</td>
                  <td className={styles.colDesc}>{row.description || ''}</td>
                </tr>
              ))}
              {/* ── Bottom Footer Row with R&D Quality Engineer and Stamp ── */}
              <tr>
                <td colSpan={2} className={styles.footerLeftCell}>
                  <div className={styles.signatureContainer}>
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
                    <div className={styles.engineerTitle}>{displayTitle}</div>
                  </div>
                </td>
                <td className={styles.footerRightCell}>
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
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
