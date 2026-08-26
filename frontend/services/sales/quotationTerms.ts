export interface QuotationMasterTerm {
  id: string;
  label: string;
  active: boolean;
  sortOrder: number;
}

export interface QuotationSelectedTerm {
  id?: string;
  termId?: string;
  text: string;
  sortOrder: number;
}

export const DEFAULT_QUOTATION_TERMS: QuotationMasterTerm[] = [
  {
    id: 'payment-terms',
    label: 'Payment Terms',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'unloading-breakage',
    label: 'Unloading at Client scope & breakage risk & responsibility',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'delivery-timeline',
    label: 'Delivery timeline',
    active: true,
    sortOrder: 3,
  },
  {
    id: 'jurisdiction',
    label: 'Any Dispute Shall Be Subject To Ahmedabad Jurisdiction',
    active: true,
    sortOrder: 4,
  },
  {
    id: 'manufacturer-test-report',
    label: 'Manufacturer Test Report shall be provided',
    active: true,
    sortOrder: 5,
  },
  {
    id: 'colour-options',
    label: 'Different Colour Options available at additional 10% cost',
    active: true,
    sortOrder: 6,
  },
];

/**
 * Resolves the quotation's selected terms dataset.
 * - Uses persisted `selectedTerms` snapshot if available.
 * - Dynamically renumbers terms sequentially from 1..N.
 * - Provides seamless backward compatibility fallback for legacy quotations with no saved terms.
 */
export function resolveQuotationTerms(quotation: any): QuotationSelectedTerm[] {
  const rawTerms = (Array.isArray(quotation?.selectedTerms) && quotation.selectedTerms.length > 0)
    ? quotation.selectedTerms
    : (Array.isArray(quotation?.quotationTerms) && quotation.quotationTerms.length > 0)
      ? quotation.quotationTerms
      : (Array.isArray(quotation?.terms) && quotation.terms.length > 0)
        ? quotation.terms
        : null;

  if (rawTerms && rawTerms.length > 0) {
    return rawTerms
      .slice()
      .sort((a: any, b: any) => (Number(a.sortOrder ?? 0) - Number(b.sortOrder ?? 0)))
      .map((term: any, index: number) => ({
        id: term.id || `term-${index + 1}`,
        termId: term.termId || term.id || `term-${index + 1}`,
        text: String(term.text || term.label || term.title || '').trim(),
        sortOrder: index + 1,
      }))
      .filter((t: any) => Boolean(t.text));
  }

  // Legacy quotation fallback
  return DEFAULT_QUOTATION_TERMS
    .filter((term) => term.active)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((term, index) => ({
      id: term.id,
      termId: term.id,
      text: term.label,
      sortOrder: index + 1,
    }));
}
