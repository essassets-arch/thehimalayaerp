import { useState, useRef, useEffect, useMemo } from 'react';
import { ArrowLeft, Plus, Trash2, FileText, Percent, ShieldCheck, Truck, Search, ChevronDown, AlertCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useERPStore } from '../shared/context/ERPContext';
import { useAuth } from '../shared/context/AuthContext';
import ProductPicker from '../shared/components/ProductPicker';
import { useFormDraft } from '../shared/hooks/useFormDraft';
import { displayEntityId } from '../store/idGenerator';

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
  maxPaymentTermDays
}) {
  const { user } = useAuth();
  const userRole = user?.role?.trim();
  const isSuperSalesUser = isSuperSales || mode === 'SUPER_SALES' || userRole === 'SUPER_SALES' || userRole === 'SuperSales' || (typeof window !== 'undefined' && window.location.pathname.startsWith('/supersales')) || basePath?.startsWith('/supersales');
  const isSpecialRole = isSuperSalesUser || userRole === 'Super Admin' || userRole === 'Admin';
  const maxDays = maxPaymentTermDays || (isSpecialRole ? 90 : 20);
  const paymentTermOptions = isSuperSalesUser
    ? ['7 Days', '15 Days', '20 Days', '30 Days', '90 Days', 'Custom']
    : ['7 Days', '15 Days', '20 Days', 'Custom'];
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

  useEffect(() => {
    if (targetLeadId && !targetQuotationId) {
      const draftLeadId = legacyQuotationDraft?.leadId || legacyQuotationDraft?.sourceId;
      if (
        legacyQuotationDraft?.source === 'LEAD' &&
        String(draftLeadId) === String(targetLeadId)
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
            else router.push('/sales/quotations');
          });
        });
        return;
      }

      const draft = leadQuotations.find(q => q.status === 'DRAFT');
      if (draft) {
        router.replace(`/sales/create-quotation?quotationId=${draft.id || draft.quotationId}&leadId=${targetLeadId}`);
      } else {
        const res = erpStore.createOrResumeQuotationFromLead(targetLeadId);
        if (res.success && res.quotationId) {
          router.replace(`/sales/create-quotation?quotationId=${res.quotationId}&leadId=${targetLeadId}`);
        }
      }
    }
  }, [targetLeadId, targetQuotationId, legacyQuotationDraft, erpState, router, erpStore, onCancel]);
  
  const quotationDraft = targetQuotationId
    ? erpState?.sales?.quotations?.find((q) => q.id === targetQuotationId || q.quotationId === targetQuotationId)
    : legacyQuotationDraft;

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

  const getInitialItems = () => {
    if (quotationDraft && Array.isArray(quotationDraft.items) && quotationDraft.items.length > 0) {
      return quotationDraft.items.map((item, idx) => ({
        id: idx + 1,
        productName: item.name || item.productName || '',
        productDetails: item.description || item.productDetails || '',
        quantity: item.qty || item.quantity || 1,
        unitPrice: item.rate || item.price || item.unitPrice || 100,
        discount: item.discount || 0,
        tax: item.tax !== undefined ? item.tax : 18,
        productId: item.productId,
        code: item.code
      }));
    }
    return [
      { 
        id: 1, 
        productName: prefilledProduct || '', 
        productDetails: '',
        quantity: prefilledQuantity || 1, 
        unitPrice: prefilledPrice || 100,
        discount: 0,
        tax: 18
      }
    ];
  };

  const emptyQuotationForm = {
    customerName: quotationDraft ? (quotationDraft.customer || quotationDraft.company || '') : prefilledCustomer,
    groupName: quotationDraft ? (quotationDraft.groupName || quotationDraft.group_name || '') : '',
    isGstRegistered: quotationDraft && quotationDraft.gstNumber === '' ? 'NO' : 'YES',
    gstNumber: quotationDraft ? (quotationDraft.gstNumber || '') : '',
    gstName: quotationDraft ? (quotationDraft.gstName || quotationDraft.customer || quotationDraft.company || '') : prefilledCustomer,
    validTill: defaultValidTill(),
    paymentTerms: '15 Days',
    items: getInitialItems(),
    transportCharge: quotationDraft ? (quotationDraft.transportCharge !== undefined && quotationDraft.transportCharge !== null ? quotationDraft.transportCharge : (quotationDraft.expectedTransportationCost !== undefined && quotationDraft.expectedTransportationCost !== null ? quotationDraft.expectedTransportationCost : '')) : '',
    notes: quotationDraft?.notes || ''
  };

  const draftKey = `erp_draft_create_quotation_${targetQuotationId || targetLeadId || 'new'}`;

  const { formData, setFormData, clearDraft } = useFormDraft({
    draftKey,
    initialData: emptyQuotationForm,
    erpUpdatedAt: quotationDraft?.updatedAt
  });

  const {
    customerName, groupName, isGstRegistered, gstNumber, gstName, validTill, paymentTerms,
    items: storedItems, transportCharge, notes
  } = formData;
  const items = useMemo(
    () => normalizeQuotationItemIds(storedItems),
    [storedItems]
  );

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
  const shouldRequireExistingCustomer = !isSampleSource && customerOptions.length > 0;
  const canCreateQuotationForCustomer = !shouldRequireExistingCustomer || Boolean(selectedCustomerRecord);

  const selectCustomerOption = (option) => {
    setCustomerName(option.name);
    setGroupName(option.groupName || '');
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

  useEffect(() => {
    if (!customerName.trim()) {
      if (gstNumber !== '') setGstNumber('');
      if (gstName !== '') setGstName('');
      return;
    }

    const trimmedCust = customerName.trim();
    if (!gstName.trim() || gstName === (quotationDraft?.customer || quotationDraft?.company || '')) {
      if (gstName !== trimmedCust) {
        setGstName(trimmedCust);
      }
    }
    
    // Maintain pre-filled GST if we are loading the original draft customer
    if (quotationDraft && quotationDraft.gstNumber && customerName === (quotationDraft.customer || quotationDraft.company)) {
      if (gstNumber !== quotationDraft.gstNumber) {
        setGstNumber(quotationDraft.gstNumber);
      }
      return;
    }

    const matchedLead = leads.find(l => 
      l.companyName?.toLowerCase() === customerName.trim().toLowerCase() ||
      l.projectName?.toLowerCase() === customerName.trim().toLowerCase()
    );
    if (matchedLead) {
      const leadGroup = matchedLead.groupName || matchedLead.group_name || '';
      if (!groupName.trim() && leadGroup) {
        setGroupName(leadGroup);
      }
      if (matchedLead.gstNumber && gstNumber !== matchedLead.gstNumber) {
        setGstNumber(matchedLead.gstNumber);
      }

      // Auto-fetch product from lead
      if (matchedLead.requiredProducts) {
        setItems(prevItems => {
          // Only auto-fill if the user hasn't explicitly added items yet
          if (prevItems.length === 1 && !prevItems[0].productName.trim()) {
            const prodName = matchedLead.requiredProducts;
            const matchedProduct = productCatalog.find(p => p.name === prodName);
            
            return [{
              ...prevItems[0],
              productName: prodName,
              quantity: matchedLead.expectedQuantities ? parseInt(matchedLead.expectedQuantities) || 1 : 1,
              productId: matchedProduct ? (matchedProduct.dbId || matchedProduct.id) : undefined,
              code: matchedProduct ? (matchedProduct.id || matchedProduct.product_code) : undefined,
              productDetails: matchedProduct?.description || '',
              unitPrice: matchedProduct?.price ? Number(matchedProduct.price) : 100
            }];
          }
          return prevItems;
        });
      }

      if (matchedLead.gstNumber) return;
    }

    const matchedCustomer = customers.find(c => 
      c.name?.toLowerCase() === customerName.trim().toLowerCase()
    );
    if (matchedCustomer && (matchedCustomer.gst || matchedCustomer.gstNumber)) {
      const custGst = matchedCustomer.gst || matchedCustomer.gstNumber;
      if (gstNumber !== custGst) {
        setGstNumber(custGst);
      }
    }
  }, [customerName, groupName, leads, customers, quotationDraft, productCatalog, gstNumber, gstName]);
  
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
    
    if (transportCharge === '' || transportCharge === null || transportCharge === undefined || Number(transportCharge) <= 0) {
      alert('Please specify a valid Expected Transportation Cost (greater than 0).');
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
          specification: item.description || item.specification || '',
          productDetails: item.description || item.specification || '',
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
      transportCharge: transportCharge || 0,
      expectedTransportationCost: transportCharge || 0,
      totalAmount: Math.round(grandTotal),
      date: new Date().toISOString().split('T')[0],
      validTill,
      paymentTerms,
      notes: notes.trim(),
      source: isSampleSource ? 'SAMPLE' : (isLeadSource || selectedCustomerRecord?.type === 'Lead' ? 'LEAD' : undefined),
      sourceId: isSampleSource ? sourceId : (isLeadSource ? (quotationDraft?.leadId || quotationDraft?.sourceId) : (selectedCustomerRecord?.type === 'Lead' ? selectedCustomerRecord.id : undefined)),
      leadId: targetLeadId || (isLeadSource ? (quotationDraft?.leadId || quotationDraft?.sourceId) : (selectedCustomerRecord?.type === 'Lead' ? selectedCustomerRecord.id : undefined)),
      customerId: selectedCustomerRecord?.type === 'Customer' ? selectedCustomerRecord.id : undefined
    };

    setIsSubmitting(true);
    const submitResult = async () => {
      let success = false;
      try {
        if (targetQuotationId) {
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
        clearQuotationDraft();
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
              clearQuotationDraft();
              onCancel();
            }} 
            style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000' }}
          >
            <ArrowLeft size={16} />
          </button>
          <h2 className="module-title">Compose Full Quotation Proposal</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {isSampleSource && (
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

        {isLeadSource && (
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
            <span>Generated from Lead <strong>{displayEntityId(quotationDraft?.leadId || quotationDraft?.sourceId)}</strong>. Pre-filled from lead details — all fields are editable.</span>
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
                  const nextValue = e.target.value;
                  const nextMatch = customerOptions.find(option => normalizeText(option.name) === normalizeText(nextValue));
                  setCustomerName(nextValue);
                  setCustomerSearchOpen(true);
                  if (!nextMatch) {
                    setGroupName('');
                  }
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
                        value={item.quantity} 
                        onChange={e => handleRowChange(item.id, 'quantity', Number(e.target.value))}
                        required
                        style={{ padding: '8px 12px' }}
                      />
                    </td>
                    <td data-label="Unit Price">
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0.01" 
                        step="0.01"
                        value={item.unitPrice} 
                        onChange={e => handleRowChange(item.id, 'unitPrice', Number(e.target.value))}
                        required
                        style={{ padding: '8px 12px' }}
                      />
                    </td>
                    <td data-label="Discount (%)">
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0" 
                        max="100"
                        value={item.discount || 0} 
                        onChange={e => handleRowChange(item.id, 'discount', Number(e.target.value))}
                        style={{ padding: '8px 12px' }}
                      />
                    </td>
                    <td data-label="GST (%)">
                      <input 
                        type="number" 
                        className="form-input" 
                        min="0" 
                        max="100"
                        value={item.tax !== undefined ? item.tax : 18} 
                        onChange={e => handleRowChange(item.id, 'tax', Number(e.target.value))}
                        style={{ padding: '8px 12px' }}
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
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Terms / Notes</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: '135px' }} 
                placeholder="Enter quotation instructions, custom bank details, dispatch terms..." 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
              ></textarea>
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
          <button data-testid="quotation-submit" type="submit" className="form-submit-btn">Publish Quotation Proposal</button>
          <button 
            type="button" 
            className="btn-small btn-outline-small" 
            onClick={() => {
              clearQuotationDraft();
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
