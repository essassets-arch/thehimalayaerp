import { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, FileText, Percent, ShieldCheck, Truck, Search, ChevronDown, AlertCircle, CheckSquare, Check } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERPStore } from '../shared/context/ERPContext';
import { useAuth } from '../shared/context/AuthContext';
import ProductPicker from '../shared/components/ProductPicker';
import { useFormDraft } from '../shared/hooks/useFormDraft';
import { displayEntityId } from '../store/idGenerator';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { DEFAULT_QUOTATION_TERMS, resolveQuotationTerms } from '../services/sales/quotationTerms';
import { normalizeQuotation } from '../services/sales/quotationNormalizer';

const STANDARD_SPECIFICATIONS = [
  'Color: Grey, Size: M10',
  'Color: Red, Size: M10',
  'Color: Grey, Size: LD5',
  'Color: Grey, Size: MD10',
  'Color: Grey, Size: HD20',
  'Standard Finish',
  'Heavy Duty',
  'Medium Duty'
];

const normalizeQuotationItemIds = (items = []) => {
  const seenIds = new Set();

  return items.map((item, index) => {
    const originalId = item?.id;
    let id = originalId;
    let normalizedId = String(id ?? '').trim();

    if (!normalizedId || seenIds.has(normalizedId)) {
      const baseId = normalizedId
        ? `${normalizedId}-row-${index + 1}`
        : `quotation-row-${index + 1}`;
      normalizedId = baseId;
      let suffix = 2;
      while (seenIds.has(normalizedId)) {
        normalizedId = `${baseId}-${suffix++}`;
      }
      id = normalizedId;
    }

    seenIds.add(normalizedId);
    return id === originalId ? item : { ...item, id };
  });
};

export default function CreateQuotation({ 
  leads = [],
  customers = [],
  prefilledCustomer = '', 
  prefilledProduct = '', 
  prefilledQuantity = 1, 
  prefilledPrice = 100,
  onAddQuotation, 
  onCancel,
  onCreateLead,
  isFromSample = false,
  isSuperSales = false,
  basePath = '/sales',
  mode,
  maxPaymentTermDays,
  editingQuotation = null,
  onUpdateQuotation = null
}) {
  const { user } = useAuth();
  const userRole = user?.role?.trim();
  const isSuperSalesUser = isSuperSales || mode === 'SUPER_SALES' || userRole === 'SUPER_SALES' || userRole === 'SuperSales' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/supersales')) || basePath?.startsWith('/supersales');
  const isSpecialRole = isSuperSalesUser || userRole === 'Super Admin' || userRole === 'Admin';
  const maxDays = maxPaymentTermDays || (isSpecialRole ? 90 : 20);
  const paymentTermOptions = isSuperSalesUser
    ? ['Advance', '7 Days', '15 Days', '20 Days', '30 Days', '90 Days', 'Custom']
    : ['Advance', '7 Days', '15 Days', '20 Days', 'Custom'];
  const predefinedTerms = paymentTermOptions.filter(t => t !== 'Custom');
  const salespersonName = user?.name || user?.fullName || user?.email || 'Sales Executive';
  
  const searchParams = useSearchParams();
  const targetQuotationId = searchParams?.get('quotationId');
  const targetLeadId = searchParams?.get('leadId');

  const erpStore = useERPStore();
  const finalizeQuotation = erpStore.finalizeQuotation;
  const legacyQuotationDraft = useERPStore(s => s.quotationDraft);
  const clearQuotationDraft = useERPStore(s => s.clearQuotationDraft);
  const erpState = useERPStore(s => s.state);
  const router = useRouter();
  const isCompact = useMediaQuery('(max-width: 1024px)');

  const matchedLeadFromProps = useMemo(() => {
    if (!targetLeadId) return null;
    return leads?.find(l => 
      String(l.id) === String(targetLeadId) || 
      String(l.leadId) === String(targetLeadId) || 
      String(l.leadNumber) === String(targetLeadId)
    ) || null;
  }, [leads, targetLeadId]);

  useEffect(() => {
    if (targetLeadId && !targetQuotationId) {
      const draftLeadId = legacyQuotationDraft?.leadId || legacyQuotationDraft?.sourceId;
      if (
        legacyQuotationDraft?.source === 'LEAD' &&
        String(draftLeadId) === String(targetLeadId) &&
        !matchedLeadFromProps
      ) {
        return;
      }

      const allQuotations = erpState?.sales?.quotations || [];
      const leadQuotations = allQuotations.filter(q => (q.leadId === targetLeadId || q.sourceId === targetLeadId) && q.status !== 'CANCELLED' && q.status !== 'DELETED');
      
      const completed = leadQuotations.find(q => q.status !== 'DRAFT');
      if (completed) {
        import('sweetalert2').then(({ default: Swal }) => {
          Swal.fire({
            icon: 'info',
            title: 'Already Completed',
            text: 'A quotation has already been created for this lead.',
            confirmButtonColor: '#0369a1'
          }).then(() => {
            if (onCancel) onCancel();
            else router.push(`${basePath}/quotations`);
          });
        });
        return;
      }

      const draft = leadQuotations.find(q => q.status === 'DRAFT');
      if (draft) {
        router.replace(`${basePath}/create-quotation?quotationId=${draft.id || draft.quotationId}&leadId=${targetLeadId}`);
      } else {
        const res = erpStore.createOrResumeQuotationFromLead(targetLeadId, matchedLeadFromProps);
        if (res.success && res.quotationId) {
          router.replace(`${basePath}/create-quotation?quotationId=${res.quotationId}&leadId=${targetLeadId}`);
        }
      }
    }
  }, [targetLeadId, targetQuotationId, legacyQuotationDraft, erpState, router, erpStore, onCancel, basePath, matchedLeadFromProps]);
  
  const rawQuotationDraft = editingQuotation || (targetQuotationId
    ? erpState?.sales?.quotations?.find((q) => q.id === targetQuotationId || q.quotationId === targetQuotationId)
    : legacyQuotationDraft);

  const quotationDraft = useMemo(() => {
    return rawQuotationDraft ? normalizeQuotation(rawQuotationDraft) : null;
  }, [rawQuotationDraft]);

  const productCatalog = erpState?.productCatalog || [];

  const [activeDropdownRow, setActiveDropdownRow] = useState(null);
  const [activeSpecsDropdownRow, setActiveSpecsDropdownRow] = useState(null);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValidTill = () => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  };

  const formatInputDate = (dateVal) => {
    if (!dateVal) return '';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  };

  const getInitialItems = () => {
    const leadItems = matchedLeadFromProps
      ? (Array.isArray(matchedLeadFromProps.detailedItems) && matchedLeadFromProps.detailedItems.length > 0
          ? matchedLeadFromProps.detailedItems
          : (Array.isArray(matchedLeadFromProps.items) && matchedLeadFromProps.items.length > 0
              ? matchedLeadFromProps.items
              : null))
      : null;

    const sourceItems = leadItems || (quotationDraft
      ? (Array.isArray(quotationDraft.detailedItems) && quotationDraft.detailedItems.length > 0
          ? quotationDraft.detailedItems
          : (Array.isArray(quotationDraft.items) && quotationDraft.items.length > 0
              ? quotationDraft.items
              : null))
      : null);

    if (sourceItems && sourceItems.length > 0) {
      return sourceItems.map((item, idx) => {
        const qty = Number(item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1));
        const price = Number(item.unitPrice !== undefined ? item.unitPrice : (item.price !== undefined ? item.price : item.rate || 0));
        const gross = qty * price;
        
        let discountPct = Number(item.discount ?? item.discountPercent ?? 0);
        if (discountPct > 100) discountPct = 0;

        let taxPct = item.tax !== undefined ? Number(item.tax) : (item.gstRate !== undefined ? Number(item.gstRate) : (item.taxPercent !== undefined ? Number(item.taxPercent) : 18));
        if (taxPct > 100) taxPct = 18;

        const spec = item.specification ?? item.productDetails ?? item.description ?? item.product?.description ?? '';
        const productName = item.productName ?? item.product?.name ?? item.product ?? item.name ?? item.description ?? '';
        const code = item.product?.sku ?? item.productCode ?? item.code ?? item.productId ?? '';
        const productId = item.productId ?? item.product?.id ?? code;

        return {
          id: item.id || `lead-item-${idx + 1}`,
          productName,
          productDetails: spec,
          specification: spec,
          quantity: qty,
          unitPrice: price,
          discount: discountPct,
          tax: taxPct,
          productId,
          code,
        };
      });
    }

    if (matchedLeadFromProps && (matchedLeadFromProps.productInterest || matchedLeadFromProps.product)) {
      return [{
        id: 1,
        productName: matchedLeadFromProps.productInterest || matchedLeadFromProps.product,
        productDetails: 'Standard Specification',
        specification: 'Standard Specification',
        quantity: Number(matchedLeadFromProps.estimatedQuantity) || 1,
        unitPrice: 100,
        discount: 0,
        tax: 18,
        productId: 'PRD-1',
        code: 'PRD-1'
      }];
    }

    return [
      { 
        id: 1, 
        productName: prefilledProduct || '', 
        productDetails: '',
        specification: '',
        quantity: prefilledQuantity || 1, 
        unitPrice: prefilledPrice || 100,
        discount: 0,
        tax: 18
      }
    ];
  };

  const resolvePaymentTerms = (q) => {
    if (!q) return '15 Days';
    return q.paymentTerms ?? q.payment_terms ?? '15 Days';
  };

  const resolveTransportCost = (q) => {
    if (!q) return 0;
    if (q.expectedTransportationCost !== undefined && q.expectedTransportationCost !== null) {
      return Number(q.expectedTransportationCost);
    }
    if (q.transportCharge !== undefined && q.transportCharge !== null) {
      return Number(q.transportCharge);
    }
    return 0;
  };

  const getInitialSelectedTermIds = () => {
    const source = quotationDraft || editingQuotation;
    if (source) {
      const existing = (Array.isArray(source.selectedTerms) && source.selectedTerms.length > 0)
        ? source.selectedTerms
        : (Array.isArray(source.quotationTerms) && source.quotationTerms.length > 0)
          ? source.quotationTerms
          : (Array.isArray(source.terms) && source.terms.length > 0)
            ? source.terms
            : null;

      if (existing && existing.length > 0) {
        return existing
          .map((t) => {
            const rawId = t.termId || t.id;
            if (rawId && DEFAULT_QUOTATION_TERMS.some(m => m.id === rawId)) {
              return rawId;
            }
            const matchedMaster = DEFAULT_QUOTATION_TERMS.find(m => m.label?.toLowerCase() === (t.text || t.label || '').toLowerCase());
            return matchedMaster ? matchedMaster.id : rawId;
          })
          .filter(Boolean);
      }
    }
    return DEFAULT_QUOTATION_TERMS.filter(t => t.active).map(t => t.id);
  };

  const emptyQuotationForm = {
    // A quotation opened with leadId must always show that lead's customer;
    // stale drafts from another lead must never override it.
    customerName: matchedLeadFromProps?.companyName || matchedLeadFromProps?.customerName || matchedLeadFromProps?.projectName || quotationDraft?.customerName || prefilledCustomer || '',
    groupName: matchedLeadFromProps?.groupName || matchedLeadFromProps?.companyName || quotationDraft?.groupName || '',
    isGstRegistered: matchedLeadFromProps ? (matchedLeadFromProps.gstNumber ? 'YES' : 'YES') : (quotationDraft ? (quotationDraft.isGstRegistered || (quotationDraft.gstNumber ? 'YES' : 'NO')) : 'YES'),
    gstNumber: matchedLeadFromProps?.gstNumber || quotationDraft?.gstNumber || '',
    gstName: matchedLeadFromProps?.gstName || matchedLeadFromProps?.companyName || matchedLeadFromProps?.customerName || quotationDraft?.gstName || quotationDraft?.customerName || prefilledCustomer || '',
    validTill: formatInputDate(quotationDraft?.validTill || quotationDraft?.validUntil) || defaultValidTill(),
    paymentTerms: resolvePaymentTerms(quotationDraft),
    items: getInitialItems(),
    transportCharge: resolveTransportCost(quotationDraft),
    notes: quotationDraft?.notes || quotationDraft?.remarks || matchedLeadFromProps?.remarks || matchedLeadFromProps?.notes || '',
    selectedTermIds: getInitialSelectedTermIds()
  };

  const draftKey = `erp_draft_create_quotation_${editingQuotation ? `edit-${editingQuotation.id}` : (targetQuotationId || targetLeadId || 'new')}`;

  const { formData, setFormData, clearDraft } = useFormDraft({
    draftKey,
    initialData: emptyQuotationForm,
    enabled: !editingQuotation,
    erpUpdatedAt: quotationDraft?.updatedAt
  });

  useEffect(() => {
    if (editingQuotation && quotationDraft) {
      setFormData({
        customerName: quotationDraft.customerName || '',
        groupName: quotationDraft.groupName || '',
        isGstRegistered: quotationDraft.isGstRegistered || (quotationDraft.gstNumber ? 'YES' : 'NO'),
        gstNumber: quotationDraft.gstNumber || '',
        gstName: quotationDraft.gstName || quotationDraft.customerName || '',
        validTill: formatInputDate(quotationDraft.validTill || quotationDraft.validUntil) || defaultValidTill(),
        paymentTerms: quotationDraft.paymentTerms || '15 Days',
        items: getInitialItems(),
        transportCharge: Number(quotationDraft.transportCharge ?? quotationDraft.expectedTransportationCost ?? 0),
        notes: quotationDraft.notes || quotationDraft.remarks || '',
        selectedTermIds: getInitialSelectedTermIds()
      });
    }
  }, [editingQuotation?.id]);

  const hasPrefilledRef = useRef(false);

  useEffect(() => {
    if (editingQuotation || hasPrefilledRef.current) return;
    const sourceLead =
      matchedLeadFromProps ||
      (legacyQuotationDraft?.leadId
        ? leads?.find(
            (l) =>
              String(l.id) === String(legacyQuotationDraft.leadId) ||
              String(l.leadId) === String(legacyQuotationDraft.leadId) ||
              String(l.leadNumber) === String(legacyQuotationDraft.leadId)
          )
        : null) ||
      legacyQuotationDraft ||
      null;

    if (
      sourceLead &&
      (sourceLead.companyName ||
        sourceLead.customerName ||
        sourceLead.projectName ||
        sourceLead.customer ||
        sourceLead.company ||
        prefilledCustomer ||
        legacyQuotationDraft?.customer ||
        legacyQuotationDraft?.customerName)
    ) {
      hasPrefilledRef.current = true;
      const sourceItems =
        Array.isArray(legacyQuotationDraft?.detailedItems) && legacyQuotationDraft.detailedItems.length > 0
          ? legacyQuotationDraft.detailedItems
          : Array.isArray(legacyQuotationDraft?.items) && legacyQuotationDraft.items.length > 0
          ? legacyQuotationDraft.items
          : Array.isArray(sourceLead.detailedItems) && sourceLead.detailedItems.length > 0
          ? sourceLead.detailedItems
          : Array.isArray(sourceLead.items) && sourceLead.items.length > 0
          ? sourceLead.items
          : null;

      const parsedItems =
        sourceItems && sourceItems.length > 0
          ? sourceItems.map((item, idx) => {
              const qty = item.quantity !== undefined ? item.quantity : (item.qty !== undefined ? item.qty : 1);
              const price = item.unitPrice !== undefined ? item.unitPrice : (item.price !== undefined ? item.price : item.rate || 0);
              const discountPct = item.discount ?? item.discountPercent ?? 0;
              const taxPct = item.tax !== undefined ? item.tax : (item.gstRate !== undefined ? item.gstRate : 18);
              const spec = item.specification ?? item.productDetails ?? item.description ?? '';
              const productName = item.productName ?? item.product ?? item.name ?? '';
              const code = item.productCode ?? item.code ?? item.productId ?? '';
              const productId = item.productId ?? code;

              return {
                id: item.id || `item-${idx + 1}`,
                productName,
                productDetails: spec,
                specification: spec,
                quantity: qty === '' ? '' : Number(qty),
                unitPrice: price === '' ? '' : Number(price),
                discount: discountPct === '' ? 0 : Number(discountPct),
                tax: taxPct === '' ? 18 : Number(taxPct),
                productId,
                code,
              };
            })
          : (sourceLead.productInterest || sourceLead.product || prefilledProduct ? [{
              id: 'item-1',
              productName: sourceLead.productInterest || sourceLead.product || prefilledProduct,
              productDetails: 'Standard Specification',
              specification: 'Standard Specification',
              quantity: sourceLead.estimatedQuantity ? Number(sourceLead.estimatedQuantity) : (prefilledQuantity || 1),
              unitPrice: 100,
              discount: 0,
              tax: 18,
              productId: 'PRD-1',
              code: 'PRD-1',
            }] : null);

      const targetCust = sourceLead.companyName || sourceLead.customerName || sourceLead.projectName || sourceLead.customer || sourceLead.company || legacyQuotationDraft?.customer || legacyQuotationDraft?.customerName || prefilledCustomer || '';
      const targetGroup = sourceLead.groupName || sourceLead.companyName || targetCust || '';
      const targetGstName = sourceLead.gstName || sourceLead.companyName || sourceLead.customerName || targetCust || '';
      const targetGstNum = sourceLead.gstNumber || sourceLead.gst || legacyQuotationDraft?.gstNumber || '';
      const targetPaymentTerms = sourceLead.paymentTerms || legacyQuotationDraft?.paymentTerms || '15 Days';
      const targetTransportCharge = Number(legacyQuotationDraft?.transportCharge || sourceLead.transportCharge || 0);

      setFormData(prev => ({
        ...prev,
        customerName: targetCust || prev.customerName,
        groupName: targetGroup || prev.groupName,
        gstName: targetGstName || prev.gstName,
        gstNumber: targetGstNum || prev.gstNumber,
        isGstRegistered: targetGstNum ? 'YES' : (prev.isGstRegistered || 'YES'),
        paymentTerms: targetPaymentTerms || prev.paymentTerms,
        transportCharge: targetTransportCharge || prev.transportCharge,
        notes: sourceLead.remarks || sourceLead.notes || legacyQuotationDraft?.notes || prev.notes || '',
        items: (parsedItems && parsedItems.length > 0) ? parsedItems : prev.items
      }));
    }
  }, [matchedLeadFromProps, legacyQuotationDraft, editingQuotation, leads, prefilledCustomer, prefilledProduct, prefilledQuantity]);

  const {
    customerName, groupName, isGstRegistered, gstNumber, gstName, validTill, paymentTerms,
    items: storedItems, transportCharge, notes, selectedTermIds: storedTermIds
  } = formData;

  const items = useMemo(
    () => normalizeQuotationItemIds(storedItems),
    [storedItems]
  );

  const selectedTermIds = useMemo(() => {
    if (Array.isArray(storedTermIds)) return storedTermIds;
    return getInitialSelectedTermIds();
  }, [storedTermIds, editingQuotation, quotationDraft]);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
  };

  const setCustomerName = (val) => updateField('customerName', val);
  const setGroupName = (val) => updateField('groupName', val);
  const setIsGstRegistered = (val) => updateField('isGstRegistered', val);
  const setGstNumber = (val) => updateField('gstNumber', val);
  const setGstName = (val) => updateField('gstName', val);
  const setValidTill = (val) => updateField('validTill', val);
  const setPaymentTerms = (val) => updateField('paymentTerms', val);
  const setSelectedTermIds = (val) => updateField('selectedTermIds', val);
  const handleToggleTerm = (termId) => {
    setSelectedTermIds(prev => {
      const current = Array.isArray(prev) ? prev : [];
      if (current.includes(termId)) {
        return current.filter(id => id !== termId);
      } else {
        return [...current, termId];
      }
    });
  };
  const handleSelectAllTerms = () => {
    setSelectedTermIds(DEFAULT_QUOTATION_TERMS.map(t => t.id));
  };
  const handleDeselectAllTerms = () => {
    setSelectedTermIds([]);
  };
  const setItems = (val) => updateField('items', currentItems => {
    const normalizedCurrentItems = normalizeQuotationItemIds(currentItems);
    const nextItems = typeof val === 'function'
      ? val(normalizedCurrentItems)
      : val;
    return normalizeQuotationItemIds(nextItems);
  });
  const setTransportCharge = (val) => updateField('transportCharge', val);
  const setNotes = (val) => updateField('notes', val);

  const isSampleSource = (quotationDraft && quotationDraft.source === 'SAMPLE') || isFromSample;
  const isLeadSource = !!(quotationDraft && (quotationDraft.leadId || (quotationDraft.source === 'LEAD' && quotationDraft.sourceId)));
  const sourceId = quotationDraft ? quotationDraft.sourceId : null;
  const normalizeText = (value) => String(value || '').trim().toLowerCase();
  const customerOptions = useMemo(() => {
    const options = [
      ...leads.map(lead => ({
        key: `lead-${lead.id}`,
        type: 'Lead',
        id: lead.id,
        name: lead.companyName || lead.customerName || lead.projectName || '',
        subtitle: [lead.groupName || lead.group_name, lead.status ? `Lead - ${lead.status}` : 'Lead'].filter(Boolean).join(' - '),
        groupName: lead.groupName || lead.group_name || '',
        gstNumber: lead.gstNumber || lead.gst_number || '',
        gstName: lead.gstName || lead.companyName || lead.customerName || lead.projectName || '',
      })),
      ...customers.map(customer => ({
        key: `customer-${customer.id}`,
        type: 'Customer',
        id: customer.id,
        name: customer.name || customer.customerName || '',
        subtitle: [customer.groupName || customer.group_name, 'Customer'].filter(Boolean).join(' - '),
        groupName: customer.groupName || customer.group_name || '',
        gstNumber: customer.gst || customer.gstNumber || customer.gstin || '',
        gstName: customer.gstName || customer.name || customer.customerName || '',
      }))
    ].filter(option => option.name);

    const seen = new Set();
    return options.filter(option => {
      const key = `${normalizeText(option.name)}-${option.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [leads, customers]);
  const selectedCustomerRecord = useMemo(() => (
    customerOptions.find(option => normalizeText(option.name) === normalizeText(customerName))
  ), [customerOptions, customerName]);
  const filteredCustomerOptions = useMemo(() => {
    const query = normalizeText(customerName);
    if (!query) return customerOptions.slice(0, 8);
    return customerOptions
      .filter(option => (
        normalizeText(option.name).includes(query) ||
        normalizeText(option.groupName).includes(query) ||
        normalizeText(option.subtitle).includes(query)
      ))
      .slice(0, 8);
  }, [customerOptions, customerName]);
  const shouldRequireExistingCustomer = !isSampleSource && customerOptions.length > 0 && !editingQuotation;
  const canCreateQuotationForCustomer = !shouldRequireExistingCustomer || Boolean(selectedCustomerRecord) || Boolean(editingQuotation) || Boolean(matchedLeadFromProps);

  const selectCustomerOption = (option) => {
    setCustomerName(option.name);
    setGroupName(option.groupName || option.name);
    setGstName(option.gstName || option.name);
    if (option.gstNumber) {
      setGstNumber(option.gstNumber);
      setIsGstRegistered('YES');
    } else {
      setGstNumber('');
      setIsGstRegistered('NO');
    }
    setCustomerSearchOpen(false);
  };

  const formatINR = (value) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)} L`;
    }
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  };

  const itemIdCounter = useRef(0);

  const handleAddItem = () => {
    setItems(currentItems => [
      ...currentItems,
      {
        id: `quotation-row-${Date.now()}-${itemIdCounter.current++}`,
        productName: '',
        productDetails: '',
        quantity: 1,
        unitPrice: 100,
        discount: 0,
        tax: 18
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length === 1) return; // Keep at least one row
    setItems(items.filter(item => item.id !== id));
  };

  const handleRowChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'productName') {
          const matchedProduct = productCatalog.find(p => p.name === value);
          if (matchedProduct) {
            updatedItem.productId = matchedProduct.dbId || matchedProduct.id;
            updatedItem.code = matchedProduct.id || matchedProduct.product_code;
            if (matchedProduct.description) {
              updatedItem.productDetails = matchedProduct.description;
            }
            if (matchedProduct.price) {
              updatedItem.unitPrice = Number(matchedProduct.price);
            }
          }
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleProductSelect = (id, product) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          productName: product.name,
          productId: product.id,
          code: product.code,
          productDetails: product.description || item.productDetails || '',
          unitPrice: Number(product.price || product.selling_price || product.base_price || 100),
          tax: product.gst !== undefined ? product.gst : (item.tax || 18)
        };
      }
      return item;
    }));
  };

  // Calculations
  let subtotal = 0;
  let discountAmtTotal = 0;
  let taxAmtTotal = 0;
  let grandTotal = 0;

  items.forEach(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemDiscountAmt = (itemSubtotal * (item.discount || 0)) / 100;
    const itemTaxable = itemSubtotal - itemDiscountAmt;
    const itemTaxAmt = (itemTaxable * (item.tax || 0)) / 100;
    
    subtotal += itemSubtotal;
    discountAmtTotal += itemDiscountAmt;
    taxAmtTotal += itemTaxAmt;
    grandTotal += (itemTaxable + itemTaxAmt);
  });
  
  grandTotal += (transportCharge || 0);
  const effectiveDiscountPercent = subtotal > 0 ? ((discountAmtTotal / subtotal) * 100).toFixed(1) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canCreateQuotationForCustomer) {
      alert('Please create this lead first, then generate the quotation from the saved lead/customer.');
      return;
    }
    const isGstYes = (isGstRegistered || 'YES') === 'YES';
    if (!customerName.trim() || !groupName.trim() || !gstName.trim() || (isGstYes && !gstNumber.trim())) {
      alert(`Please fill out Customer Name, Group Name, GST Name${isGstYes ? ', and GST Number' : ''}.`);
      return;
    }
    
    if (transportCharge === '' || transportCharge === null || transportCharge === undefined || isNaN(Number(transportCharge)) || Number(transportCharge) < 0) {
      alert('Please specify a valid Expected Transportation Cost (0 or greater).');
      return;
    }
    
    // Ensure all items have names and specifications
    const invalidItemName = items.some(item => !item.productName.trim());
    if (invalidItemName) {
      alert('Please fill out the product name for all items.');
      return;
    }

    const invalidItemDetails = items.some(item => !item.productDetails || !item.productDetails.trim());
    if (invalidItemDetails) {
      alert('Please fill out specifications/color details for all items.');
      return;
    }

    const daysMatch = paymentTerms.match(/^(\d+)\s*Days$/i);
    if (daysMatch) {
      const days = parseInt(daysMatch[1], 10);
      if (days > maxDays) {
        alert(`Payment terms cannot exceed ${maxDays} days.`);
        return;
      }
    } else if (paymentTerms && paymentTerms.trim() !== '') {
      const parsed = parseInt(paymentTerms, 10);
      if (!isNaN(parsed) && parsed > maxDays) {
        alert(`Payment terms cannot exceed ${maxDays} days.`);
        return;
      }
    }

    if (isSubmitting) return;

    if (!selectedCustomerRecord && !(customerName || '').trim()) {
      alert('Please select or specify a Customer/Lead for this proposal.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item to the quotation.');
      return;
    }

    const activeSelectedTerms = DEFAULT_QUOTATION_TERMS
      .filter(term => selectedTermIds.includes(term.id))
      .map((term, index) => ({
        termId: term.id,
        text: term.label,
        sortOrder: index + 1
      }));

    const payload = {
      customerName: selectedCustomerRecord?.name || (customerName || '').trim(),
      groupName: selectedCustomerRecord?.groupName || (groupName || '').trim(),
      isGstRegistered: (isGstRegistered || 'YES') === 'YES',
      gstName: selectedCustomerRecord?.gstName || (gstName || '').trim() || selectedCustomerRecord?.name || (customerName || '').trim(),
      gstNumber: (isGstRegistered || 'YES') === 'YES' ? (selectedCustomerRecord?.gstNumber || (gstNumber || '').trim()) : '',
      salesperson: salespersonName,
      items: items.map((item) => {
        const itemQty = Number(item.quantity) || 0;
        const itemUnitPrice = Number(item.unitPrice) || 0;
        const gross = itemQty * itemUnitPrice;
        const discPct = Number(item.discount) || 0;
        const taxPct = item.tax !== undefined ? Number(item.tax) : 18;
        const discountAmt = gross * (discPct / 100);
        const taxable = gross - discountAmt;
        const taxAmt = taxable * (taxPct / 100);
        return {
          productId: item.productId || item.productCode || `PRD-${Date.now()}`,
          productName: item.name || item.productName || 'Custom Product',
          productCode: item.productCode || item.productId || '',
          description: item.productDetails || item.description || item.specification || '',
          specification: item.productDetails || item.description || item.specification || '',
          productDetails: item.productDetails || item.description || item.specification || '',
          quantity: itemQty,
          unitPrice: itemUnitPrice,
          discount: discPct,
          tax: taxPct,
          amount: Math.round((taxable + taxAmt) * 100) / 100,
        };
      }),
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      price: items.length > 0 ? items[0].unitPrice : 0, // Fallback average pricing indicator
      discount: 0,
      tax: 0,
      transportCharge: transportCharge === '' || transportCharge === null || transportCharge === undefined ? 0 : Number(transportCharge),
      expectedTransportationCost: transportCharge === '' || transportCharge === null || transportCharge === undefined ? 0 : Number(transportCharge),
      totalAmount: Math.round(grandTotal),
      date: new Date().toISOString().split('T')[0],
      validTill,
      validUntil: validTill,
      paymentTerms,
      paymentTermDays: editingQuotation?.paymentTermDays,
      notes: notes.trim(),
      remarks: notes.trim(),
      termsAndNotes: notes.trim(),
      selectedTerms: activeSelectedTerms,
      terms: activeSelectedTerms,
      selectedTermIds: selectedTermIds,
      source: isSampleSource ? 'SAMPLE' : (isLeadSource || selectedCustomerRecord?.type === 'Lead' ? 'LEAD' : (editingQuotation?.leadId ? 'LEAD' : undefined)),
      sourceId: isSampleSource ? sourceId : (isLeadSource ? (quotationDraft?.leadId || quotationDraft?.sourceId) : (selectedCustomerRecord?.type === 'Lead' ? selectedCustomerRecord.id : (editingQuotation?.leadId || undefined))),
      leadId: targetLeadId || (isLeadSource ? (quotationDraft?.leadId || quotationDraft?.sourceId) : (selectedCustomerRecord?.type === 'Lead' ? selectedCustomerRecord.id : (editingQuotation?.leadId || undefined))),
      customerId: selectedCustomerRecord?.type === 'Customer' ? selectedCustomerRecord.id : (editingQuotation?.customerId || undefined)
    };

     setIsSubmitting(true);
    const submitResult = async () => {
      let success = false;
      try {
        if (editingQuotation && onUpdateQuotation) {
          await onUpdateQuotation(editingQuotation.id, {
            ...payload,
            detailedItems: payload.items,
            selectedTerms: activeSelectedTerms,
            terms: activeSelectedTerms
          });
          success = true;
          onCancel();
        } else if (targetQuotationId) {
          const res = finalizeQuotation(targetQuotationId, payload);
          if (res.success) {
            success = true;
            onCancel(); // Navigate back to list
          } else {
            alert(res.message);
          }
        } else {
          const res = await onAddQuotation(payload);
          success = res?.success !== false;
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
      
      if (success) {
        clearDraft();
        if (!editingQuotation) {
          clearQuotationDraft();
        }
      }
    };
    submitResult();
  };

  return (
    <div className="app-card" style={{ flex: 1 }}>
      <div className="module-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            type="button" 
            className="card-top-icon-btn" 
            onClick={() => {
              if (!editingQuotation) {
                clearQuotationDraft();
              }
              onCancel();
            }} 
            style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000' }}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="module-title">{editingQuotation ? 'Edit Quotation Proposal' : 'Compose Full Quotation Proposal'}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {editingQuotation && (
          <div className="lead-source-banner" style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#2563eb',
            fontSize: '13.5px',
            fontWeight: '500',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '16px' }}>📝</span>
            <span>Editing Quotation <strong>#{editingQuotation.quotationNumber || editingQuotation.quotationNo || editingQuotation.id}</strong>{editingQuotation.leadId ? ` (Origin: Lead #${(() => {
              const leadObj = leads.find(l => l.id === editingQuotation.leadId);
              return leadObj?.leadNumber || displayEntityId(editingQuotation.leadId);
            })()})` : ''} — loading complete saved quotation details.</span>
          </div>
        )}

        {!editingQuotation && isSampleSource && (
          <div className="sample-source-banner" style={{
            background: 'rgba(14, 165, 233, 0.1)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#38bdf8',
            fontSize: '13.5px',
            fontWeight: '500'
          }}>
            <span style={{ fontSize: '16px' }}>ℹ️</span>
            <span>Generated from Sample {sourceId ? <strong>#SMP-{String(sourceId).padStart(3, '0')}</strong> : ''}. Customer selection is locked.</span>
          </div>
        )}

        {!editingQuotation && !isSampleSource && isLeadSource && (
          <div className="lead-source-banner" style={{
            background: 'rgba(14, 165, 233, 0.1)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            borderRadius: '12px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#38bdf8',
            fontSize: '13.5px',
            fontWeight: '500',
            marginBottom: '20px'
          }}>
            <span style={{ fontSize: '16px' }}>ℹ️</span>
            <span>Generated from Lead <strong>{(() => {
              const targetId = quotationDraft?.leadId || quotationDraft?.sourceId;
              const leadObj = leads.find(l => l.id === targetId);
              return leadObj?.leadNumber || displayEntityId(targetId);
            })()}</strong>. Pre-filled from lead details — all fields are editable.</span>
          </div>
        )}

        {/* Customer & General Metadata */}
        <div className="quotation-customer-grid">
          <div className="form-group quotation-customer-field" style={{ position: 'relative' }}>
            <label className="form-label">Customer / Corporate Company *</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search existing lead or customer"
                value={customerName}
                onChange={e => {
                  setCustomerName(e.target.value);
                  setCustomerSearchOpen(true);
                }}
                onFocus={() => setCustomerSearchOpen(true)}
                onBlur={() => setTimeout(() => setCustomerSearchOpen(false), 180)}
                required
                disabled={isSampleSource}
                style={{
                  paddingRight: '38px',
                  ...(isSampleSource ? { opacity: 0.65, cursor: 'not-allowed', backgroundColor: 'rgba(255, 255, 255, 0.05)' } : {})
                }}
              />
              <ChevronDown size={15} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#5E6B82', pointerEvents: 'none' }} />
              {customerSearchOpen && !isSampleSource && (
                <div
                  className="smart-search-dropdown"
                  style={{
                    width: '100%',
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    zIndex: 40,
                    maxHeight: '260px',
                    overflowY: 'auto',
                    borderRadius: '10px',
                    boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)'
                  }}
                >
                  {filteredCustomerOptions.length > 0 ? (
                    filteredCustomerOptions.map(option => (
                      <button
                        key={option.key}
                        type="button"
                        className="smart-search-item"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectCustomerOption(option);
                        }}
                        style={{ width: '100%', textAlign: 'left', border: 0, background: 'transparent', display: 'block' }}
                      >
                        <span style={{ display: 'block', fontWeight: 800 }}>{option.name}</span>
                        <span style={{ display: 'block', fontSize: '11.5px', color: '#5E6B82', marginTop: '2px' }}>{option.subtitle}</span>
                      </button>
                    ))
                  ) : (
                    <div style={{ padding: '12px', color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', margin: '6px', fontSize: '12.5px', fontWeight: 700 }}>
                      No lead/customer found. Create the lead first.
                    </div>
                  )}
                </div>
              )}
            </div>
            {customerName.trim() && !canCreateQuotationForCustomer && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '9px 10px', color: '#9a3412', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} /> New company. Create lead first.
                </span>
                {onCreateLead && (
                  <button type="button" onClick={onCreateLead} style={{ border: '1px solid #fdba74', background: '#ffffff', color: '#9a3412', borderRadius: '8px', padding: '5px 9px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Create Lead
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Group Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. NHAI Group, L&T Infrastructure"
              value={groupName}
              onChange={e => setGroupName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">GST Name *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Legal name as per GST registration" 
              value={gstName} 
              onChange={e => setGstName(e.target.value)} 
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">GST Registered? *</label>
            <select
              className="form-select"
              value={isGstRegistered || 'YES'}
              onChange={e => {
                const val = e.target.value;
                setIsGstRegistered(val);
                if (val === 'NO') {
                  setGstNumber('');
                }
              }}
              required
            >
              <option value="YES">Yes (GST Registered)</option>
              <option value="NO">No (Unregistered / Non-GST)</option>
            </select>
          </div>
          {(isGstRegistered || 'YES') === 'YES' && (
            <div className="form-group">
              <label className="form-label">GST Number *</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. 09ABCDE1234F1Z5" 
                value={gstNumber} 
                onChange={e => setGstNumber(e.target.value.toUpperCase())} 
                maxLength={15}
                required
              />
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Quotation Validity Period *</label>
            <input 
              type="date" 
              className="form-input" 
              value={validTill} 
              onChange={e => setValidTill(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Truck size={12} /> Expected Transportation Cost (₹) *
            </label>
            <input 
              type="number" 
              className="form-input" 
              placeholder="e.g. 2500"
              min="0"
              value={transportCharge !== undefined && transportCharge !== null ? transportCharge : ''} 
              onChange={e => setTransportCharge(e.target.value === '' ? '' : Number(e.target.value))} 
              required
            />
          </div>
        </div>

        {/* Dynamic Products Table */}
        <div>
          <h3 style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <FileText size={14} /> Line Items Catalogue
          </h3>

          {isCompact ? (
            <div className="quotation-mobile-items-list" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {items.map((item, index) => {
                const itemSubtotal = item.quantity * item.unitPrice;
                const itemDiscountAmt = (itemSubtotal * (item.discount || 0)) / 100;
                const itemTaxable = itemSubtotal - itemDiscountAmt;
                const itemTaxAmt = (itemTaxable * (item.tax !== undefined ? item.tax : 18)) / 100;
                const lineTotal = itemTaxable + itemTaxAmt;

                return (
                  <div key={item.id} className="quotation-mobile-item-card" style={{
                    background: '#ffffff',
                    border: '1.5px solid #E2E8F0',
                    borderRadius: '14px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Item #{index + 1}
                      </span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          style={{
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            borderRadius: '8px',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          <Trash2 size={12} /> Remove
                        </button>
                      )}
                    </div>

                    {/* Product Picker */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                        Product Selection *
                      </label>
                      <ProductPicker
                        value={item.productName ? {
                          id: item.productId || 'temp-id',
                          product_name: item.productName,
                          product_code: item.code || ''
                        } : null}
                        onChange={(p) => {
                          if (p) {
                            handleProductSelect(item.id, {
                              id: p.id,
                              name: p.product_name,
                              code: p.product_code,
                              price: p.selling_price || p.price || p.base_price || 100,
                              unit: p.unit_of_measure || 'PCS',
                              gst: p.gst_rate || 18,
                              description: p.description
                            });
                          } else {
                            handleRowChange(item.id, 'productId', null);
                            handleRowChange(item.id, 'productName', '');
                            handleRowChange(item.id, 'code', '');
                          }
                        }}
                        placeholder="Search product..."
                        showBadge={false}
                      />
                    </div>

                    {/* Specifications */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                        Specifications / Color details *
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Color: Grey, Size: M10"
                        value={item.productDetails || ''}
                        onChange={e => handleRowChange(item.id, 'productDetails', e.target.value)}
                        required
                        style={{ padding: '9px 12px', fontSize: '13px', width: '100%', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                    </div>

                    {/* Numeric inputs 2x2 grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                          <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>QTY</span>
                          Quantity *
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          value={item.quantity === '' ? '' : item.quantity}
                          onChange={e => handleRowChange(item.id, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                          required
                          style={{ padding: '9px 10px', width: '100%', textAlign: 'center', border: '1.5px solid #93c5fd', background: '#eff6ff', borderRadius: '8px', fontWeight: 700, color: '#1e293b' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>₹</span>
                          Unit Price *
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          min="0.01"
                          step="0.01"
                          value={item.unitPrice === '' ? '' : item.unitPrice}
                          onChange={e => handleRowChange(item.id, 'unitPrice', e.target.value === '' ? '' : Number(e.target.value))}
                          required
                          style={{ padding: '9px 10px', width: '100%', textAlign: 'center', border: '1.5px solid #86efac', background: '#f0fdf4', borderRadius: '8px', fontWeight: 700, color: '#1e293b' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>%</span>
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          max="100"
                          value={item.discount === '' ? '' : (item.discount ?? 0)}
                          onChange={e => handleRowChange(item.id, 'discount', e.target.value === '' ? '' : Number(e.target.value))}
                          style={{ padding: '9px 10px', width: '100%', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, color: '#1e293b' }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 5px', borderRadius: '4px', fontSize: '10px' }}>GST</span>
                          GST Rate (%)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          min="0"
                          max="100"
                          value={item.tax === '' ? '' : (item.tax !== undefined ? item.tax : 18)}
                          onChange={e => handleRowChange(item.id, 'tax', e.target.value === '' ? '' : Number(e.target.value))}
                          style={{ padding: '9px 10px', width: '100%', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 600, color: '#1e293b' }}
                        />
                      </div>
                    </div>

                    {/* Total */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                        Total Amount
                      </span>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>
                        {formatINR(lineTotal)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="crm-table-container" style={{ marginTop: 0, overflow: 'visible' }}>
              <table className="crm-table responsive-table">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>Product & Specification Details *</th>
                    <th style={{ width: '10%' }}>Quantity *</th>
                    <th style={{ width: '12%' }}>Unit Price (₹) *</th>
                    <th style={{ width: '10%' }}>Discount (%)</th>
                    <th style={{ width: '10%' }}>GST (%)</th>
                    <th style={{ width: '13%' }}>Total Amount</th>
                    <th style={{ width: '5%', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td data-label="Product Details">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ position: 'relative' }}>
                            <ProductPicker
                              value={item.productName ? {
                                id: item.productId || 'temp-id',
                                product_name: item.productName,
                                product_code: item.code || ''
                              } : null}
                              onChange={(p) => {
                                if (p) {
                                  handleProductSelect(item.id, {
                                    id: p.id,
                                    name: p.product_name,
                                    code: p.product_code,
                                    price: p.selling_price || p.price || p.base_price || 100,
                                    unit: p.unit_of_measure || 'PCS',
                                    gst: p.gst_rate || 18,
                                    description: p.description
                                  });
                                } else {
                                  handleRowChange(item.id, 'productId', null);
                                  handleRowChange(item.id, 'productName', '');
                                  handleRowChange(item.id, 'code', '');
                                }
                              }}
                              placeholder="Search product..."
                              showBadge={false}
                            />
                          </div>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Specifications / Color details * (e.g. Color: Grey, Size: M10)" 
                              value={item.productDetails || ''} 
                              onChange={e => {
                                handleRowChange(item.id, 'productDetails', e.target.value);
                                setActiveSpecsDropdownRow(item.id);
                              }}
                              onFocus={() => setActiveSpecsDropdownRow(item.id)}
                              onBlur={() => setTimeout(() => setActiveSpecsDropdownRow(null), 200)}
                              required
                              style={{ padding: '6px 12px', fontSize: '12.5px', width: '100%' }}
                            />
                            {activeSpecsDropdownRow === item.id && (
                              <div className="smart-search-dropdown" style={{ width: '100%', position: 'absolute', top: '100%', left: 0, zIndex: 10, marginTop: '4px' }}>
                                {(() => {
                                  const query = (item.productDetails || '').toLowerCase();
                                  const catalogSpecs = Array.from(new Set(
                                    productCatalog
                                      .map(p => p.description)
                                      .filter(d => d && d.trim() !== '')
                                  ));
                                  const allSpecs = Array.from(new Set([
                                    ...catalogSpecs,
                                    ...STANDARD_SPECIFICATIONS
                                  ]));
                                  const filtered = allSpecs.filter(spec => spec.toLowerCase().includes(query));
                                  return (
                                    <>
                                      {filtered.map(spec => (
                                        <div key={spec} className="smart-search-item" onClick={() => {
                                          handleRowChange(item.id, 'productDetails', spec);
                                          setActiveSpecsDropdownRow(null);
                                        }} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                                          <span>{spec}</span>
                                        </div>
                                      ))}
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="Quantity">
                        <input 
                          type="number" 
                          className="form-input" 
                          min="1" 
                          value={item.quantity === '' ? '' : item.quantity} 
                          onChange={e => handleRowChange(item.id, 'quantity', e.target.value === '' ? '' : Number(e.target.value))}
                          required
                          style={{ padding: '8px 10px', width: '100%', maxWidth: '80px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                        />
                      </td>
                      <td data-label="Unit Price">
                        <input 
                          type="number" 
                          className="form-input" 
                          min="0.01" 
                          step="0.01" 
                          value={item.unitPrice === '' ? '' : item.unitPrice} 
                          onChange={e => handleRowChange(item.id, 'unitPrice', e.target.value === '' ? '' : Number(e.target.value))}
                          required
                          style={{ padding: '8px 10px', width: '100%', maxWidth: '120px', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                        />
                      </td>
                      <td data-label="Discount (%)">
                        <input 
                          type="number" 
                          className="form-input" 
                          min="0" 
                          max="100" 
                          value={item.discount === '' ? '' : (item.discount ?? 0)} 
                          onChange={e => handleRowChange(item.id, 'discount', e.target.value === '' ? '' : Number(e.target.value))}
                          style={{ padding: '8px 10px', width: '100%', maxWidth: '85px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                        />
                      </td>
                      <td data-label="GST (%)">
                        <input 
                          type="number" 
                          className="form-input" 
                          min="0" 
                          max="100" 
                          value={item.tax === '' ? '' : (item.tax !== undefined ? item.tax : 18)} 
                          onChange={e => handleRowChange(item.id, 'tax', e.target.value === '' ? '' : Number(e.target.value))}
                          style={{ padding: '8px 10px', width: '100%', maxWidth: '85px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                        />
                      </td>
                      <td data-label="Total Amount" style={{ fontWeight: '700', paddingLeft: '10px' }}>
                        {(() => {
                          const itemSubtotal = item.quantity * item.unitPrice;
                          const itemDiscountAmt = (itemSubtotal * (item.discount || 0)) / 100;
                          const itemTaxable = itemSubtotal - itemDiscountAmt;
                          const itemTaxAmt = (itemTaxable * (item.tax || 0)) / 100;
                          return formatINR(itemTaxable + itemTaxAmt);
                        })()}
                      </td>
                      <td data-label="Action" style={{ textAlign: 'center' }}>
                        <button 
                          type="button" 
                          className="btn-small btn-danger-small" 
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={items.length === 1}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', opacity: items.length === 1 ? 0.4 : 1 }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <button 
            type="button" 
            className="btn-small btn-outline-small" 
            onClick={handleAddItem}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', fontWeight: '700' }}
          >
            <Plus size={14} /> Add Product Row
          </button>
        </div>
 
        {/* Dynamic Totals and Tax Config */}
        <div className="totals-layout">
          {/* Notes and Terms wrapped with Payment Terms below */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Dynamic Selectable Terms & Conditions Section */}
            <div style={{
              background: '#ffffff',
              border: '1px solid var(--color-border, #e2e8f0)',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: '#0284c7', width: '24px', height: '24px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckSquare size={14} color="#ffffff" />
                  </div>
                  <label className="form-label" style={{ fontWeight: '800', margin: 0, fontSize: '13px', color: '#002e5d', letterSpacing: '0.3px' }}>
                    TERMS AND CONDITIONS :-
                  </label>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: selectedTermIds.length > 0 ? '#e0f2fe' : '#f1f5f9', color: selectedTermIds.length > 0 ? '#0284c7' : '#64748b' }}>
                    {selectedTermIds.length} / {DEFAULT_QUOTATION_TERMS.length} Selected
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={handleSelectAllTerms}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      borderRadius: '6px',
                      background: '#f0fdf4',
                      color: '#16a34a',
                      border: '1px solid #bbf7d0',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllTerms}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      borderRadius: '6px',
                      background: '#fef2f2',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Dynamic Term List with sequential badges for selected terms */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                {DEFAULT_QUOTATION_TERMS.map((term) => {
                  const isChecked = selectedTermIds.includes(term.id);
                  // Sequential number among checked items
                  const selectedIndex = isChecked
                    ? selectedTermIds.filter(id => {
                        const m = DEFAULT_QUOTATION_TERMS.find(t => t.id === id);
                        return m && m.sortOrder <= term.sortOrder;
                      }).length
                    : null;

                  return (
                    <label
                      key={term.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 12px',
                        background: isChecked ? '#f0f9ff' : '#f8fafc',
                        border: isChecked ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease, border-color 0.15s ease',
                        userSelect: 'none'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTerm(term.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0284c7' }}
                      />
                      {isChecked && (
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: '#0284c7',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '800',
                          flexShrink: 0
                        }}>
                          {selectedIndex}
                        </div>
                      )}
                      <span style={{
                        fontSize: '12.5px',
                        fontWeight: isChecked ? '600' : '500',
                        color: isChecked ? '#0f172a' : '#64748b',
                        lineHeight: '1.4'
                      }}>
                        {term.label}
                      </span>
                    </label>
                  );
                })}
              </div>

              {/* Optional Custom Instructions / Notes */}
              <div style={{ marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '10px' }}>
                <label className="form-label" style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>
                  Additional Notes / Special Instructions (Optional)
                </label>
                <textarea
                  className="form-textarea"
                  style={{ minHeight: '60px', fontSize: '12px', padding: '8px 12px' }}
                  placeholder="Enter optional ad-hoc instructions, dispatch remarks, or special notices..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                ></textarea>
              </div>
            </div>
 
            {/* Payment Terms Section */}
            <div style={{ background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label className="form-label" style={{ fontWeight: '700', marginBottom: 0 }}>Payment Terms *</label>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                {paymentTermOptions.map((term) => {
                  const isChecked = term === 'Custom' ? !predefinedTerms.includes(paymentTerms) : paymentTerms === term;
                  return (
                    <label key={term} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13.5px', fontWeight: '500', color: 'var(--color-text-primary)' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (term === 'Custom') {
                            setPaymentTerms('');
                          } else {
                            setPaymentTerms(term);
                          }
                        }}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      {term}
                    </label>
                  );
                })}
              </div>
              {!predefinedTerms.includes(paymentTerms) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    max={maxDays}
                    className="form-input"
                    placeholder={`Enter number of days (max ${maxDays})...`}
                    value={paymentTerms.replace(/ Days/gi, '').trim()}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && Number(val) > maxDays) {
                        setPaymentTerms(`${maxDays} Days`);
                      } else {
                        setPaymentTerms(val ? `${val} Days` : '');
                      }
                    }}
                    required
                    style={{ flex: 1 }}
                  />
                  <span style={{ fontSize: '13.5px', fontWeight: '500', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>Days</span>
                </div>
              )}
            </div>
          </div>
 
          {/* Aggregated Totals Panel */}
          <div style={{ background: '#f8f9fa', border: '1px solid var(--color-border)', borderRadius: '18px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '12.5px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
              <ShieldCheck size={14} /> Totals Invoice Summary
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                <span>Subtotal:</span>
                <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>{formatINR(subtotal)}</span>
              </div>

              {discountAmtTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                  <span>Discount Applied ({Number(effectiveDiscountPercent)}%):</span>
                  <span>-{formatINR(discountAmtTotal)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-secondary)' }}>
                <span>GST Tax Value:</span>
                <span style={{ fontWeight: '600', color: 'var(--color-text-primary)' }}>+{formatINR(taxAmtTotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0369a1' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={11} /> Expected Transportation Cost:</span>
                <span style={{ fontWeight: '600' }}>+{formatINR(transportCharge || 0)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: '800', borderTop: '1px solid #e5e7eb', paddingTop: '10px', marginTop: '6px' }}>
                <span>Grand Total (INR):</span>
                <span style={{ color: 'var(--color-text-primary)' }}>{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-actions">
          <button data-testid="quotation-submit" type="submit" className="form-submit-btn">
            {editingQuotation ? 'Update Quotation Proposal' : 'Publish Quotation Proposal'}
          </button>
          <button 
            type="button" 
            className="btn-small btn-outline-small" 
            onClick={() => {
              if (!editingQuotation) {
                clearQuotationDraft();
              }
              onCancel();
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
