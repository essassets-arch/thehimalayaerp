import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, User, MapPin, FlaskConical, Package, Search, AlertCircle, Trash2, Plus, Truck } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../shared/context/AuthContext';
import { useERPStore } from '../shared/context/ERPContext';
import ProductPicker from '../shared/components/ProductPicker';
import { useFormDraft } from '../shared/hooks/useFormDraft';
import { displayEntityId } from '../store/idGenerator';

const PRODUCT_CATALOG = {
  'FRC Manhole Covers': {
    'Square Frame Round Cover': [
      { name: 'Square Frame Round Cover 24x24', code: 'FRCSQRC2424' },
      { name: 'Square Frame Round Cover 30x30', code: 'FRCSQRC3030' }
    ],
    'Round Frame Round Cover': [
      { name: 'Round Frame Round Cover 18 Dia', code: 'FRCRFRC18' },
      { name: 'Round Frame Round Cover 24 Dia', code: 'FRCRFRC24' }
    ],
    'Square Frame Square Cover': [
      { name: 'Square Frame Square Cover 12x12', code: 'FRCSFSC1212' },
      { name: 'Square Frame Square Cover 18x18', code: 'FRCSFSC1818' },
      { name: 'Square Frame Square Cover 24x24', code: 'FRCSFSC2424' }
    ],
    'Round Covers': [
      { name: 'Round Cover 18 Dia', code: 'FRCROFROC18' },
      { name: 'Round Cover 24 Dia', code: 'FRCROFROC24' }
    ],
    'Cover Plates': [
      { name: 'Cover Plate Standard', code: 'FRCCP-STD' }
    ],
    'Gully Tops': [
      { name: 'Gully Top Standard', code: 'FRCGT-STD' }
    ],
    'Trench Covers (Open Channel)': [
      { name: 'Trench Cover (Open Channel) Standard', code: 'FRCTSOC-STD' }
    ],
    'Trench Covers (Precast)': [
      { name: 'Trench Cover (Precast) Standard', code: 'FRCTPEC-STD' }
    ]
  },
  'Concrete Cover Blocks': {
    'Wall Cover Blocks': [
      { name: 'Wall Cover Block 20mm', code: 'WCB-20' },
      { name: 'Wall Cover Block 25mm', code: 'WCB-25' }
    ],
    'Pile Cover Blocks': [
      { name: 'Pile Cover Block 50mm', code: 'PCB-50' },
      { name: 'Pile Cover Block 75mm', code: 'PCB-75' }
    ],
    'Heavy Duty Cover Blocks': [
      { name: 'Heavy Duty Cover Block 40mm', code: 'HTCB-40' },
      { name: 'Heavy Duty Cover Block 50mm', code: 'HTCB-50' }
    ],
    'Double Tie Cover Blocks': [
      { name: 'Double Tie Cover Block 35mm', code: 'DTCB-35' },
      { name: 'Double Tie Cover Block 40mm', code: 'DTCB-40' }
    ]
  },
  'FRP Manhole Covers': {
    'Square Manhole Covers': [
      { name: 'FRP Square Manhole Cover 24x24', code: 'FRPMHC2424' },
      { name: 'HIMALAYA FRP Square Manhole Cover 30x30', code: 'HIM-FRP-MHC3030' }
    ],
    'Round Manhole Covers': [
      { name: 'FRP Round Manhole Cover 18 Dia', code: 'FRPMHC18DIA' },
      { name: 'FRP Round Manhole Cover 24 Dia', code: 'FRPMHC24DIA' }
    ]
  },
  'FRP Rainwater Covers': {
    'Rainwater Covers': [
      { name: 'HIMALAYA FRP Rainwater Cover Standard', code: 'HIM-FRP-RCS-STD' }
    ]
  },
  'FRP Water Gully Covers': {
    'Water Gully Covers': [
      { name: 'HIMALAYA FRP Water Gully Cover Standard', code: 'HIM-FRP-WGC-STD' }
    ]
  },
  'FRP Open Drain Covers': {
    'Open Drain Covers': [
      { name: 'HIMALAYA FRP Open Drain Cover Standard', code: 'HIM-FRP-ONGC-STD' }
    ]
  },
  'FRP Gratings': {
    'Moulded Gratings': [
      { name: 'FRP Moulded Grating 38mm', code: 'FRP-MOULDED-GRATING-38' }
    ]
  }
};

export default function CreateLead({ onAddLead, onGenerateQuotation, onCancel, editingLead, onDeleteLead, leads = [] }) {
  const { user } = useAuth();
  const erpState = useERPStore(s => s.state);
  const dbCatalog = erpState?.productCatalog || [];
  const currentCatalog = dbCatalog.length > 0
    ? dbCatalog.map(p => ({
        name: p.name,
        code: p.id || p.code,
        price: Number(p.price || p.selling_price || 100),
        gst: Number(p.gst || p.gst_rate || 18),
        description: p.description || ''
      }))
    : Object.values(PRODUCT_CATALOG).flatMap(subCats => Object.values(subCats).flat()).map(p => ({
        ...p,
        price: 100,
        gst: 18,
        description: ''
      }));

  const getDefaultSpecification = (productName, catalogProduct) => {
    if (catalogProduct?.description?.trim()) return catalogProduct.description.trim();
    const thicknessMatch = productName.match(/(\d+)\s*mm/i);
    const parts = [];
    if (thicknessMatch) parts.push(`Thickness: ${thicknessMatch[1]}mm`);
    parts.push('Color: Grey');
    if (productName.toLowerCase().includes('cover block')) parts.push('Grade: M10');
    return parts.join('\n');
  };

  const createEmptyItem = (id) => ({
    id,
    productName: '',
    productCode: '',
    specification: '',
    quantity: 1,
    unitPrice: 100,
    discount: 0,
    tax: 18,
    additionalCharges: 0
  });

  const [activeDropdownRow, setActiveDropdownRow] = useState(null);
  const [loginTime, setLoginTime] = useState(null);

  useEffect(() => {
    const now = new Date();
    setLoginTime({
      date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    });
  }, []);

  // Form states - Unified via useFormDraft
  const getInitialItems = () => {
    if (editingLead?.detailedItems?.length > 0) {
      return editingLead.detailedItems.map((item, idx) => ({
        id: idx + 1,
        productName: item.productName || '',
        productCode: item.productCode || item.code || '',
        specification: item.specification || '',
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 100,
        discount: item.discount || 0,
        tax: item.tax || 18,
        additionalCharges: item.additionalCharges || 0
      }));
    }
    if (editingLead && (editingLead.productInterested || editingLead.requirements)) {
      return [{
        id: 1,
        productName: editingLead.productInterested || editingLead.requirements,
        productCode: '',
        specification: '',
        quantity: editingLead.estimatedQuantity || 1,
        unitPrice: 100,
        discount: 0,
        tax: 18,
        additionalCharges: 0
      }];
    }
    return [createEmptyItem(1)];
  };

  const getInitialSampleItems = (baseItems) => {
    const existingMap = {};
    (editingLead?.sampleItems || []).forEach(si => { existingMap[si.id] = si; });
    const itms = editingLead?.detailedItems?.length > 0
      ? editingLead.detailedItems.map((it, idx) => ({ id: idx + 1, productName: it.productName || '' }))
      : [{ id: 1, productName: editingLead?.productInterested || 'Uni Paver 60mm' }];
    return itms.map(it => existingMap[it.id] || {
      id: it.id,
      productName: it.productName,
      enabled: false,
      quantity: 1,
      expectedDate: ''
    });
  };

  const initialItems = getInitialItems();
  const emptyLeadForm = {
    projectName: editingLead?.projectName || '',
    groupName: editingLead?.groupName || '',
    companyName: editingLead?.companyName || '',
    gstNumber: editingLead?.gstNumber || '',
    siteInchargeName: editingLead?.siteInchargeName || editingLead?.contactPerson || '',
    siteInchargeMobile: editingLead?.siteInchargeMobile || editingLead?.phone || '',
    officeContact: editingLead?.officeContact || '',
    email: editingLead?.email || '',
    remarks: editingLead?.notes || editingLead?.requirements || '',
    addressLine1: editingLead?.address?.line1 || '',
    city: editingLead?.address?.city || '',
    stateName: editingLead?.address?.state || 'Uttar Pradesh',
    pincode: editingLead?.address?.pincode || '',
    sampleRequired: editingLead?.sampleRequired || false,
    expectedTransportationCost: Number(editingLead?.expectedTransportationCost || 0),
    items: initialItems,
    sampleItems: getInitialSampleItems(initialItems),
    submitAction: 'lead'
  };

  const { formData, setFormData, clearDraft } = useFormDraft({
    draftKey: editingLead ? `erp_draft_edit_lead_${editingLead.id}` : 'erp_draft_create_lead_new',
    initialData: emptyLeadForm
  });

  const {
    projectName, groupName, companyName, gstNumber, siteInchargeName, siteInchargeMobile, officeContact,
    email, remarks, addressLine1, city, stateName, pincode, sampleRequired, expectedTransportationCost,
    items, sampleItems, submitAction
  } = formData;

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
  };

  const setProjectName = (val) => updateField('projectName', val);
  const setGroupName = (val) => updateField('groupName', val);
  const setCompanyName = (val) => updateField('companyName', val);
  const setGstNumber = (val) => updateField('gstNumber', val);
  const setSiteInchargeName = (val) => updateField('siteInchargeName', val);
  const setSiteInchargeMobile = (val) => updateField('siteInchargeMobile', val);
  const setOfficeContact = (val) => updateField('officeContact', val);
  const setEmail = (val) => updateField('email', val);
  const setRemarks = (val) => updateField('remarks', val);
  const setAddressLine1 = (val) => updateField('addressLine1', val);
  const setCity = (val) => updateField('city', val);
  const setStateName = (val) => updateField('stateName', val);
  const setPincode = (val) => updateField('pincode', val);
  const setSampleRequired = (val) => updateField('sampleRequired', val);
  const setExpectedTransportationCost = (val) => updateField('expectedTransportationCost', val);
  const setItems = (val) => updateField('items', val);
  const setSampleItems = (val) => updateField('sampleItems', val);
  const setSubmitAction = (val) => updateField('submitAction', val);

  const salesExecutive = user?.name || 'Alex Carter';
  const chiefDirector = editingLead?.chiefDirector || 'Director Rajesh';
  const itemIdCounter = useRef(2);

  // Sync sampleItems whenever items (product list) changes
  useEffect(() => {
    setSampleItems(prev => {
      const prevMap = {};
      prev.forEach(si => { prevMap[si.id] = si; });
      return items.map(it => prevMap[it.id]
        ? { ...prevMap[it.id], productName: it.productName }  // keep config, refresh name
        : { id: it.id, productName: it.productName, enabled: false, quantity: 1, expectedDate: '' }
      );
    });
  }, [items]);

  const updateSampleItem = (id, field, value) => {
    setSampleItems(prev => prev.map(si => si.id === id ? { ...si, [field]: value } : si));
  };

  const handleAddItem = () => {
    const nextId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : itemIdCounter.current++;
    if (nextId >= itemIdCounter.current) itemIdCounter.current = nextId + 1;
    setItems([...items, createEmptyItem(nextId)]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const handleRowChange = (id, field, value) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleSelectCatalogProduct = (itemId, catalogProduct) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        productId: catalogProduct.id,
        productName: catalogProduct.name,
        productCode: catalogProduct.code || '',
        unitPrice: catalogProduct.price || item.unitPrice,
        tax: catalogProduct.gst ?? item.tax,
        specification: getDefaultSpecification(catalogProduct.name, catalogProduct) || item.specification
      };
    }));
    setActiveDropdownRow(null);
  };

  const calculateItemSubtotal = (item) => item.quantity * item.unitPrice;
  const calculateItemDiscountAmt = (item) => calculateItemSubtotal(item) * (item.discount || 0) / 100;
  const calculateItemTaxAmt = (item) => (calculateItemSubtotal(item) - calculateItemDiscountAmt(item)) * (item.tax || 0) / 100;

  const calculateItemTotal = (item) =>
    calculateItemSubtotal(item) - calculateItemDiscountAmt(item) + calculateItemTaxAmt(item) + (item.additionalCharges || 0);

  const summarySubtotal = items.reduce((sum, item) => sum + calculateItemSubtotal(item), 0);
  const summaryDiscount = items.reduce((sum, item) => sum + calculateItemDiscountAmt(item), 0);
  const summaryGST = items.reduce((sum, item) => sum + calculateItemTaxAmt(item), 0);
  const summaryAdditional = items.reduce((sum, item) => sum + (item.additionalCharges || 0), 0);
  const grandTotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const formatINR = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!projectName.trim() || !siteInchargeName.trim() || !siteInchargeMobile.trim()) {
      alert('Please fill out all mandatory fields.');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    const invalidItem = items.some(item => !item.productName.trim() || !item.specification.trim());
    if (invalidItem) {
      alert('Please fill out specifications and product name for all products.');
      return;
    }

    const itemsDescription = items.map(item => `${item.productName} (x${item.quantity})`).join(', ');

    const payload = {
      projectName: projectName.trim(),
      groupName: groupName.trim(),
      companyName: companyName.trim(),
      gstNumber: gstNumber.trim(),
      siteInchargeName: siteInchargeName.trim(),
      siteInchargeMobile: siteInchargeMobile.trim(),
      officeContact: officeContact.trim(),
      email: email.trim(),
      salesperson: salesExecutive,
      salesExecutive: salesExecutive,
      chiefDirector: chiefDirector,
      notes: remarks.trim(),

      detailedItems: items.map(item => ({
        productName: item.productName,
        productCode: item.productCode || undefined,
        specification: item.specification,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        tax: item.tax || 18,
        additionalCharges: item.additionalCharges || 0
      })),

      contactPerson: siteInchargeName.trim(),
      phone: siteInchargeMobile.trim(),
      productInterested: itemsDescription,
      estimatedQuantity: items.reduce((sum, item) => sum + item.quantity, 0),

      address: {
        line1: addressLine1.trim(),
        city: city.trim(),
        state: stateName.trim(),
        country: 'India',
        pincode: pincode.trim()
      },

      sampleRequired,
      expectedTransportationCost: sampleRequired ? Number(expectedTransportationCost) || 0 : 0,
      sampleItems: sampleRequired
        ? sampleItems.filter(si => si.enabled).map(si => ({
            id: si.id,
            productName: si.productName,
            quantity: Number(si.quantity),
            expectedDate: si.expectedDate
          }))
        : [],
      sampleQuantity: sampleRequired ? (sampleItems.find(si => si.enabled)?.quantity || 0) : 0,
      sampleExpectedDate: sampleRequired ? (sampleItems.find(si => si.enabled)?.expectedDate || '') : ''
    };

    const proceedSubmit = async (dataPayload) => {
      let success = false;
      try {
        if (submitAction === 'quotation' && onGenerateQuotation) {
          const res = await onGenerateQuotation(dataPayload);
          success = res?.success !== false; // assume true if not explicitly false
        } else {
          const res = await onAddLead(dataPayload);
          success = res?.success !== false;
        }
      } catch (err) {
        console.error(err);
      }
      if (success) {
        clearDraft();
      }
    };

    if (!editingLead) {
      const gst = gstNumber.trim().toUpperCase();
      const mobile = siteInchargeMobile.trim();
      const company = companyName.trim().toLowerCase();

      const duplicate = leads.find(l => {
        const leadMobile = l.siteInchargeMobile || l.site_incharge_mobile || l.phone || '';
        const leadGst = l.gstNumber || l.gst_number || '';
        const leadCompany = l.companyName || l.company_name || '';

        const mobileMatch = mobile && leadMobile && (mobile === leadMobile);
        const gstMatch = gst && leadGst && (gst === leadGst.toUpperCase());
        const companyMatch = company && leadCompany && (company === leadCompany.toLowerCase());

        return mobileMatch || gstMatch || companyMatch;
      });

      if (duplicate) {
        Swal.fire({
          title: 'Duplicate Lead Detected',
          text: `A lead already exists for customer "${duplicate.companyName || duplicate.projectName || 'Lead ID: ' + duplicate.id}".`,
          icon: 'warning',
          showCancelButton: true,
          showDenyButton: true,
          confirmButtonText: 'Create Anyway',
          denyButtonText: 'View Existing',
          cancelButtonText: 'Cancel',
          customClass: {
            popup: 'swal-premium-popup',
            title: 'swal-premium-title',
            htmlContainer: 'swal-premium-text',
            confirmButton: 'swal-premium-confirm-btn',
            denyButton: 'swal-premium-deny-btn',
            cancelButton: 'swal-premium-cancel-btn'
          },
          buttonsStyling: false
        }).then((result) => {
          if (result.isConfirmed) {
            proceedSubmit(payload);
          } else if (result.isDenied) {
            onCancel(); 
          }
        });
        return;
      }
    }

    proceedSubmit(payload);
  };

  return (
    <div className="app-card" style={{ flex: 1 }}>
      <div className="module-header-row" style={{ borderBottom: '1px solid #eaeaea', paddingBottom: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="card-top-icon-btn" onClick={onCancel} style={{ width: '36px', height: '36px', background: '#f1f3f5', color: '#000' }}>
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="module-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>{editingLead ? `Edit Lead #${editingLead.id}` : 'Create Lead / Order'}</span>
              {!editingLead && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  background: '#dcfce7',
                  color: '#15803d',
                  border: '1px solid #bbf7d0',
                  gap: '5px'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#15803d'
                  }}></span>
                  NEW LEAD
                </span>
              )}
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Register customer details, log test samples, and generate quotation sheets.
            </p>
          </div>
        </div>
      </div>

      {editingLead && (
        <div style={{
          background: 'linear-gradient(135deg, #fff7ed, #fffaf5)',
          border: '1px solid #fed7aa',
          borderRadius: '16px',
          padding: '16px 24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.05)'
        }}>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#9a3412', letterSpacing: '0.5px' }}>Lead Reference</span>
              <strong style={{ fontSize: '15px', color: '#ea580c' }}>Lead ID: {displayEntityId(editingLead.id)}</strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid #fed7aa', paddingLeft: '24px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#9a3412', letterSpacing: '0.5px' }}>Registration Date</span>
              <strong style={{ fontSize: '14px', color: '#475569' }}>
                {editingLead.timeline?.[0]?.date ? new Date(editingLead.timeline[0].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '18 Jun 2026'}
              </strong>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid #fed7aa', paddingLeft: '24px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#9a3412', letterSpacing: '0.5px' }}>Last Touchpoint</span>
              <strong style={{ fontSize: '14px', color: '#475569' }}>
                {editingLead.timeline && editingLead.timeline.length > 0
                  ? new Date(editingLead.timeline[editingLead.timeline.length - 1].date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                  : '19 Jun 2026'}
              </strong>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="create-lead-grid">

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
                <User size={16} style={{ color: 'var(--color-accent-teal)' }} />
                <span>1. Basic Info & Customer Details</span>
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. Skyline Premium Residency" value={projectName} onChange={e => setProjectName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Group Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. ABC Group" value={groupName} onChange={e => setGroupName(e.target.value)} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gst Name (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. ABC Buildcon Pvt Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 09ABCDE1234F1Z5"
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value.toUpperCase())}
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Site Incharge Name *</label>
                  <input type="text" className="form-input" placeholder="e.g. Rahul Sharma" value={siteInchargeName} onChange={e => setSiteInchargeName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Site Incharge Mobile *</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={siteInchargeMobile}
                    onChange={e => setSiteInchargeMobile(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Office Contact (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. 011-22334455" value={officeContact} onChange={e => setOfficeContact(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input type="email" className="form-input" placeholder="e.g. contact@company.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-full">
                  <label className="form-label">Logged In Sales Representative</label>
                  <div className="form-input" style={{ background: '#F5FAFE', color: '#475569', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontWeight: '600', border: '1px solid #DCE5F0', height: 'auto', minHeight: '38px', padding: '10px 14px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}></span>
                    <span>
                      <strong>{user?.name || 'Alex Carter'}</strong>
                      {loginTime ? ` logged in on ${loginTime.date} at ${loginTime.time}` : ' logging in...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Remarks & Internal Notes (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add special instructions, requirements, internal follow-up notes..."
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>

            <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--color-accent-purple)' }} />
                <span>📍 Delivery Address</span>
              </h3>

              <div className="form-group">
                <label className="form-label">Address Line 1 *</label>
                <input type="text" className="form-input" placeholder="e.g. Sector 62, Noida Industrial Area" value={addressLine1} onChange={e => setAddressLine1(e.target.value)} required />
              </div>

              <div className="form-row-three">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-input" placeholder="e.g. Noida" value={city} onChange={e => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input type="text" className="form-input" placeholder="e.g. Uttar Pradesh" value={stateName} onChange={e => setStateName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 201301"
                    value={pincode}
                    onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '8px' }}>
            <Package size={16} style={{ color: 'var(--color-accent-purple)' }} />
            <span>2. 📦 Product Selection</span>
          </h3>

          <div className="lead-product-grid-header">
            <span>Product &amp; Specification Details *</span>
            <span style={{ textAlign: 'center' }}>Quantity *</span>
            <span style={{ textAlign: 'center' }}>Unit Price (₹) *</span>
            <span style={{ textAlign: 'center' }}>Line Total (₹)</span>
            <span style={{ textAlign: 'center' }}>Action</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <div key={item.id}>
                <div className="lead-product-grid">
                  <div className="lead-product-grid-spec" style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                    <ProductPicker
                      value={item.productId ? {
                        id: item.productId,
                        product_name: item.productName,
                        product_code: item.productCode
                      } : null}
                      onChange={(p) => {
                        if (p) {
                          handleSelectCatalogProduct(item.id, {
                            id: p.id,
                            name: p.product_name,
                            code: p.product_code,
                            price: p.selling_price || 0,
                            unit: p.unit_of_measure || 'PCS',
                            gst: p.gst_rate || 18
                          });
                        } else {
                          handleRowChange(item.id, 'productId', null);
                          handleRowChange(item.id, 'productName', '');
                          handleRowChange(item.id, 'productCode', '');
                        }
                      }}
                      placeholder="Search product..."
                      showBadge={false}
                    />

                    <input
                      type="text"
                      className="form-input"
                      placeholder="Specifications / Color details * (e.g. Color: Grey, Size: M10)"
                      value={item.specification}
                      onChange={e => handleRowChange(item.id, 'specification', e.target.value)}
                      required
                      style={{ fontSize: '12.5px', padding: '9px 12px' }}
                    />
                  </div>

                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    value={item.quantity}
                    onChange={e => handleRowChange(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                    required
                    style={{ textAlign: 'center', padding: '9px 8px' }}
                  />

                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    value={item.unitPrice}
                    onChange={e => handleRowChange(item.id, 'unitPrice', Number(e.target.value))}
                    required
                    style={{ textAlign: 'center', padding: '9px 8px' }}
                  />

                  <div className="lead-product-grid-total" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: '#24345C', minHeight: '42px' }}>
                    {formatINR(calculateItemTotal(item))}
                  </div>

                  <div className="lead-product-grid-action">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={items.length <= 1}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '40px', height: '40px', margin: '0 auto',
                        background: items.length <= 1 ? '#f1f5f9' : '#fef2f2',
                        border: `1px solid ${items.length <= 1 ? '#DCE5F0' : '#fecaca'}`,
                        borderRadius: '10px',
                        color: items.length <= 1 ? '#D6E2F0' : '#dc2626',
                        cursor: items.length <= 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn-small btn-outline-small"
            onClick={handleAddItem}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', marginTop: '16px' }}
          >
            <Plus size={14} /> Add Another Product
          </button>

          <div style={{ marginTop: '20px', padding: '16px 18px', background: '#ffffff', border: '1px solid #DCE5F0', borderRadius: '12px', maxWidth: '360px', marginLeft: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Subtotal</span><span>{formatINR(summarySubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>GST</span><span>{formatINR(summaryGST)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                <span>Discount</span><span>-{formatINR(summaryDiscount)}</span>
              </div>
              {summaryAdditional > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Additional Charges</span><span>{formatINR(summaryAdditional)}</span>
                </div>
              )}
              <div style={{ borderTop: '1px solid #DCE5F0', marginTop: '6px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px' }}>
                <span>Grand Total</span><span>{formatINR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sample Management Block */}
        <div style={{ marginTop: '24px', background: '#f8f9fa', padding: '20px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #eaeaea', paddingBottom: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FlaskConical size={16} style={{ color: 'var(--color-accent-teal)' }} />
              <span>3. 🧪 Sample Management</span>
            </h3>
            <label className="switch-container">
              <input
                type="checkbox"
                className="switch-input"
                checked={sampleRequired}
                onChange={(e) => {
                  setSampleRequired(e.target.checked);
                  if (!e.target.checked) setExpectedTransportationCost(0);
                }}
              />
              <div className="switch-slider"></div>
              <span className="switch-label">{sampleRequired ? 'Enabled' : 'Disabled'}</span>
            </label>
          </div>

          {sampleRequired ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={13} style={{ flexShrink: 0 }} />
                Toggle the switch next to each product to request a sample for it.
              </p>

              <div className="form-group" style={{ marginBottom: '4px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Truck size={12} /> Expected Transportation Cost (₹)
                </label>
                <input
                  type="number"
                  className="form-input"
                  min="0"
                  step="100"
                  placeholder="e.g. 2500"
                  value={expectedTransportationCost || ''}
                  onChange={e => setExpectedTransportationCost(Number(e.target.value) || 0)}
                />
              </div>

              {sampleItems.map((si) => (
                <div
                  key={si.id}
                  style={{
                    background: si.enabled ? 'rgba(20, 184, 166, 0.06)' : '#ffffff',
                    border: si.enabled ? '1px solid rgba(20, 184, 166, 0.3)' : '1px solid #DCE5F0',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                        background: si.enabled ? 'rgba(20, 184, 166, 0.15)' : '#f1f5f9',
                        fontSize: '12px'
                      }}>📦</span>
                      <span style={{
                        fontSize: '13px', fontWeight: '700',
                        color: si.enabled ? '#0f766e' : 'var(--color-text-primary)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}>
                        {si.productName || <em style={{ color: '#8893A7' }}>Unnamed product</em>}
                      </span>
                    </div>
                    <label className="switch-container" style={{ flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        className="switch-input"
                        checked={si.enabled}
                        onChange={(e) => updateSampleItem(si.id, 'enabled', e.target.checked)}
                      />
                      <div className="switch-slider"></div>
                      <span className="switch-label" style={{ fontSize: '11px' }}>
                        {si.enabled ? 'Sample' : 'No'}
                      </span>
                    </label>
                  </div>

                  {si.enabled && (
                    <div className="form-row" style={{ marginTop: '12px', marginBottom: 0 }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Sample Qty</label>
                        <input
                          type="number"
                          className="form-input"
                          min="1"
                          value={si.quantity}
                          onChange={e => updateSampleItem(si.id, 'quantity', Math.max(1, Number(e.target.value)))}
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: '11px' }}>Expected Date</label>
                        <input
                          type="date"
                          className="form-input"
                          value={si.expectedDate}
                          onChange={e => updateSampleItem(si.id, 'expectedDate', e.target.value)}
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {sampleItems.some(si => si.enabled) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', padding: '8px 12px', background: 'rgba(20,184,166,0.08)', borderRadius: '8px', border: '1px solid rgba(20,184,166,0.2)' }}>
                  <FlaskConical size={13} style={{ color: '#0f766e' }} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f766e' }}>
                    {sampleItems.filter(si => si.enabled).length} product{sampleItems.filter(si => si.enabled).length > 1 ? 's' : ''} selected for sampling
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '16px', background: '#DCE5F0', borderRadius: '12px', border: '1px solid #D6E2F0', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <AlertCircle size={18} style={{ color: 'var(--color-text-muted)' }} />
              <span>No sample requested. Toggle the switch above to configure.</span>
            </div>
          )}
        </div>

        {/* Form Actions footer */}
        <div className="form-actions" style={{ marginTop: '24px' }}>
          {editingLead ? (
            <>
              <button
                type="submit"
                className="form-submit-btn"
                onClick={() => setSubmitAction('lead')}
              >
                Save Changes
              </button>
              <button
                type="button"
                className="form-submit-btn"
                style={{ background: '#dc2626', color: '#fff' }}
                onClick={() => {
                  Swal.fire({
                    title: 'Delete Lead?',
                    text: `Are you sure you want to delete lead #${editingLead.id} for "${editingLead.companyName}"?`,
                    input: 'text',
                    inputPlaceholder: 'Please enter the reason for deletion...',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Yes, Delete',
                    cancelButtonText: 'Cancel',
                    customClass: {
                      popup: 'swal-premium-popup',
                      title: 'swal-premium-title',
                      htmlContainer: 'swal-premium-text',
                      confirmButton: 'swal-premium-confirm-btn',
                      cancelButton: 'swal-premium-cancel-btn'
                    },
                    buttonsStyling: false,
                    inputValidator: (value) => {
                      if (!value || !value.trim()) {
                        return 'You must provide a reason for deleting this lead!';
                      }
                    }
                  }).then((result) => {
                    if (result.isConfirmed && result.value) {
                      onDeleteLead(editingLead.id, result.value.trim());
                    }
                  });
                }}
              >
                Delete Lead
              </button>
            </>
          ) : (
            <button
              type="submit"
              className="form-submit-btn"
              onClick={() => setSubmitAction('lead')}
            >
              Submit Lead Details
            </button>
          )}
          <button
            type="button"
            className="btn-small btn-outline-small"
            onClick={onCancel}
            style={{ flex: 'none', padding: '12px 20px' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
