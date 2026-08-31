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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        id: item.id || idx + 1,
        productId: item.productId || item.product?.id || '',
        productName: item.productName || item.product?.name || '',
        productCode: item.productCode || item.product?.code || item.code || '',
        specification: item.specification ?? '',
        color: item.color ?? '',
        quantity: item.quantity != null ? Number(item.quantity) : 1,
        unitPrice: item.unitPrice != null ? Number(item.unitPrice) : 100,
        discount: item.discount != null ? Number(item.discount) : 0,
        tax: item.tax ?? item.gstRate ?? 18,
        additionalCharges: item.additionalCharges != null ? Number(item.additionalCharges) : 0
      }));
    }
    if (editingLead?.quotations?.[0]?.items?.length > 0) {
      return editingLead.quotations[0].items.map((item, idx) => ({
        id: item.id || idx + 1,
        productId: item.productId || item.product?.id || '',
        productName: item.productName || item.product?.name || item.name || '',
        productCode: item.productCode || item.product?.code || item.code || '',
        specification: item.specification ?? '',
        color: item.color ?? '',
        quantity: item.quantity != null ? Number(item.quantity) : 1,
        unitPrice: item.unitPrice != null ? Number(item.unitPrice) : (Number(item.rate) || 100),
        discount: item.discount != null ? Number(item.discount) : 0,
        tax: item.tax ?? item.gstRate ?? 18,
        additionalCharges: item.additionalCharges != null ? Number(item.additionalCharges) : 0
      }));
    }
    if (editingLead && (editingLead.productInterest || editingLead.productInterested || editingLead.requirements)) {
      return [{
        id: 1,
        productId: editingLead.productId || '',
        productName: editingLead.productInterest || editingLead.productInterested || editingLead.requirements,
        productCode: editingLead.productCode || '',
        specification: '',
        quantity: Number(editingLead.estimatedQuantity || 1),
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
      ? editingLead.detailedItems.map((it, idx) => ({ id: it.id || idx + 1, productName: it.productName || '' }))
      : [{ id: 1, productName: editingLead?.productInterest || editingLead?.productInterested || 'Uni Paver 60mm' }];
    return itms.map(it => existingMap[it.id] || {
      id: it.id,
      productName: it.productName,
      enabled: false,
      quantity: 1,
      expectedDate: ''
    });
  };

  const parseAddress = (addr) => {
    if (!addr) return { addressLine1: '', city: '', stateName: 'Gujarat', pincode: '', latitude: null, longitude: null, googlePlaceId: '' };
    if (typeof addr === 'string') return { addressLine1: addr, city: '', stateName: 'Gujarat', pincode: '', latitude: null, longitude: null, googlePlaceId: '' };
    return {
      addressLine1: addr.addressLine1 ?? addr.line1 ?? addr.address ?? '',
      city: addr.city ?? '',
      stateName: addr.stateName ?? addr.state ?? 'Gujarat',
      pincode: addr.pincode ?? addr.zip ?? '',
      latitude: addr.latitude ?? addr.lat ?? null,
      longitude: addr.longitude ?? addr.lng ?? null,
      googlePlaceId: addr.googlePlaceId ?? addr.placeId ?? '',
    };
  };

  const formatInitialLeadDate = (lead) => {
    const raw = lead?.leadDate || lead?.date || lead?.createdAt || lead?.created_at;
    if (raw) {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return new Date().toISOString().split('T')[0];
  };

  const initialItems = getInitialItems();
  const parsedAddr = parseAddress(editingLead?.address);

  const emptyLeadForm = {
    leadDate: formatInitialLeadDate(editingLead),
    projectName: editingLead?.projectName ?? '',
    groupName: editingLead?.groupName ?? '',
    companyName: editingLead?.companyName ?? '',
    gstName: editingLead?.gstName ?? editingLead?.companyName ?? '',
    gstNumber: editingLead?.gstNumber ?? '',
    siteInchargeName: editingLead?.siteInchargeName ?? editingLead?.contactPerson ?? '',
    siteInchargeMobile: editingLead?.siteInchargeMobile ?? editingLead?.phone ?? '',
    officeContact: editingLead?.officeContact ?? '',
    email: editingLead?.email ?? '',
    remarks: editingLead?.remarks ?? editingLead?.notes ?? editingLead?.requirements ?? '',
    addressLine1: parsedAddr.addressLine1,
    city: parsedAddr.city,
    stateName: parsedAddr.stateName,
    pincode: parsedAddr.pincode,
    latitude: parsedAddr.latitude,
    longitude: parsedAddr.longitude,
    googlePlaceId: parsedAddr.googlePlaceId,
    sampleRequired: editingLead?.sampleRequired ?? false,
    expectedTransportationCost: Number(editingLead?.expectedTransportationCost ?? 0),
    items: initialItems,
    sampleItems: getInitialSampleItems(initialItems),
    submitAction: 'lead'
  };

  const { formData, setFormData, clearDraft } = useFormDraft({
    draftKey: editingLead ? `erp_draft_edit_lead_${editingLead.id}` : 'erp_draft_create_lead_new',
    initialData: emptyLeadForm,
    enabled: !editingLead // Disable LocalStorage draft restore in edit mode to force database source of truth
  });

  // Re-sync form state whenever editingLead object changes
  useEffect(() => {
    if (editingLead) {
      setFormData(emptyLeadForm);
    }
  }, [editingLead]);

  const {
    leadDate, projectName, groupName, companyName, gstNumber, siteInchargeName, siteInchargeMobile, officeContact,
    email, remarks, addressLine1, city, stateName, pincode, sampleRequired, expectedTransportationCost,
    items, sampleItems, submitAction, latitude, longitude, googlePlaceId
  } = formData;

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: typeof value === 'function' ? value(prev[field]) : value
    }));
  };

  const setLeadDate = (val) => updateField('leadDate', val);
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
  const setLatitude = (val) => updateField('latitude', val);
  const setLongitude = (val) => updateField('longitude', val);
  const setGooglePlaceId = (val) => updateField('googlePlaceId', val);
  const setSampleRequired = (val) => updateField('sampleRequired', val);
  const setExpectedTransportationCost = (val) => updateField('expectedTransportationCost', val);
  const setItems = (val) => updateField('items', val);
  const setSampleItems = (val) => updateField('sampleItems', val);
  const setSubmitAction = (val) => updateField('submitAction', val);

  const salesExecutive = user?.name || 'Alex Carter';
  const chiefDirector = editingLead?.chiefDirector || 'Director Rajesh';
  const itemIdCounter = useRef(2);

  const [mapsLoaded, setMapsLoaded] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Load Google Maps JavaScript API with Places and Geometry libraries
  useEffect(() => {
    if (!apiKey) {
      console.warn('Google Maps API key is not configured.');
      return;
    }
    if (window.google && window.google.maps && window.google.maps.places) {
      setMapsLoaded(true);
      return;
    }
    const existing = document.getElementById('google-maps-api-script');
    if (existing) {
      const handleLoad = () => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setMapsLoaded(true);
        }
      };
      existing.addEventListener('load', handleLoad);
      if (window.google && window.google.maps && window.google.maps.places) {
        setMapsLoaded(true);
      }
      return () => existing.removeEventListener('load', handleLoad);
    }

    const script = document.createElement('script');
    script.id = 'google-maps-api-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setMapsLoaded(true);
      }
    });
    document.body.appendChild(script);
  }, [apiKey]);

  // Set up Autocomplete and handle places select
  useEffect(() => {
    if (!mapsLoaded || !inputRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'in' },
      fields: ['address_components', 'geometry', 'formatted_address', 'place_id'],
      types: ['geocode', 'establishment']
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place || !place.address_components) return;

      let streetNumber = '';
      let route = '';
      let sublocality = '';
      let locality = '';
      let adminArea2 = '';
      let state = '';
      let postalCode = '';

      place.address_components.forEach(component => {
        const types = component.types;
        if (types.includes('street_number')) streetNumber = component.long_name;
        if (types.includes('route')) route = component.long_name;
        if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('sublocality_level_2')) {
          if (sublocality) sublocality = `${sublocality}, ${component.long_name}`;
          else sublocality = component.long_name;
        }
        if (types.includes('locality')) locality = component.long_name;
        if (types.includes('administrative_area_level_2')) adminArea2 = component.long_name;
        if (types.includes('administrative_area_level_1')) state = component.long_name;
        if (types.includes('postal_code')) postalCode = component.long_name;
      });

      const addressParts = [];
      if (streetNumber) addressParts.push(streetNumber);
      if (route) addressParts.push(route);
      if (sublocality) addressParts.push(sublocality);

      let line1 = addressParts.join(', ');
      if (!line1) {
        line1 = place.name || (place.formatted_address ? place.formatted_address.split(',')[0] : '');
      }

      const cityVal = locality || adminArea2 || sublocality || '';
      const stateVal = state || '';
      const pincodeVal = postalCode || '';

      setFormData(prev => ({
        ...prev,
        addressLine1: line1,
        city: cityVal,
        stateName: stateVal,
        pincode: pincodeVal,
        latitude: place.geometry?.location ? place.geometry.location.lat() : null,
        longitude: place.geometry?.location ? place.geometry.location.lng() : null,
        googlePlaceId: place.place_id || ''
      }));
    });

    autocompleteRef.current = autocomplete;

    // Prevent form submission on enter key inside address autocomplete
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        const pacContainer = document.querySelector('.pac-container');
        if (pacContainer && window.getComputedStyle(pacContainer).display !== 'none') {
          e.preventDefault();
        }
      }
    };
    const inputElement = inputRef.current;
    inputElement.addEventListener('keydown', handleKeyDown);
    return () => {
      inputElement.removeEventListener('keydown', handleKeyDown);
    };
  }, [mapsLoaded]);

  // Use current geolocation coordinates and geocode them
  const handleUseCurrentLocation = async () => {
    Swal.fire({
      title: 'Detecting location...',
      text: 'Please wait while we determine your location.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const populateFromCoords = (lat, lng) => {
      if (window.google && window.google.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          Swal.close();
          if (status === 'OK' && results[0]) {
            const place = results[0];
            let streetNumber = '';
            let route = '';
            let sublocality = '';
            let locality = '';
            let adminArea2 = '';
            let state = '';
            let postalCode = '';

            place.address_components.forEach(component => {
              const types = component.types;
              if (types.includes('street_number')) streetNumber = component.long_name;
              if (types.includes('route')) route = component.long_name;
              if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('sublocality_level_2')) {
                if (sublocality) sublocality = `${sublocality}, ${component.long_name}`;
                else sublocality = component.long_name;
              }
              if (types.includes('locality')) locality = component.long_name;
              if (types.includes('administrative_area_level_2')) adminArea2 = component.long_name;
              if (types.includes('administrative_area_level_1')) state = component.long_name;
              if (types.includes('postal_code')) postalCode = component.long_name;
            });

            const addressParts = [];
            if (streetNumber) addressParts.push(streetNumber);
            if (route) addressParts.push(route);
            if (sublocality) addressParts.push(sublocality);

            let line1 = addressParts.join(', ');
            if (!line1) {
              line1 = place.formatted_address ? place.formatted_address.split(',')[0] : '';
            }

            const cityVal = locality || adminArea2 || sublocality || '';
            const stateVal = state || '';
            const pincodeVal = postalCode || '';

            setFormData(prev => ({
              ...prev,
              addressLine1: line1,
              city: cityVal,
              stateName: stateVal,
              pincode: pincodeVal,
              latitude: lat,
              longitude: lng,
              googlePlaceId: place.place_id || ''
            }));

            Swal.fire({
              icon: 'success',
              title: 'Location Updated',
              text: 'Your delivery address has been autofilled.',
              timer: 1500,
              showConfirmButton: false
            });
            return;
          }
          fallbackToIpGeocode(lat, lng);
        });
      } else {
        fallbackToIpGeocode(lat, lng);
      }
    };

    const fallbackToIpGeocode = async (optLat, optLng) => {
      try {
        const url = optLat && optLng 
          ? `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${optLat}&longitude=${optLng}&localityLanguage=en`
          : 'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en';
        const res = await fetch(url).then(r => r.json());
        Swal.close();
        if (res && (res.city || res.locality || res.principalSubdivision)) {
          setFormData(prev => ({
            ...prev,
            addressLine1: prev.addressLine1 || res.locality || res.principalSubdivision || '',
            city: res.city || res.locality || '',
            stateName: res.principalSubdivision || '',
            pincode: res.postcode || prev.pincode || '',
            latitude: optLat || res.latitude || prev.latitude || 23.0225,
            longitude: optLng || res.longitude || prev.longitude || 72.5714,
          }));
          Swal.fire({
            icon: 'info',
            title: 'Location Estimated',
            text: 'Address estimated from network. Please verify details.',
            timer: 2000,
            showConfirmButton: false
          });
          return;
        }
      } catch (err) {
        console.warn('IP geocoding fallback failed:', err);
      }
      Swal.close();
      Swal.fire({
        icon: 'info',
        title: 'Location Notice',
        text: 'Could not automatically detect GPS. Please enter your address details manually.',
        confirmButtonColor: '#2563eb'
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          populateFromCoords(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // If high-accuracy or standard GPS times out / fails, fallback gracefully to IP
          fallbackToIpGeocode();
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    } else {
      fallbackToIpGeocode();
    }
  };

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
      leadDate: leadDate ? new Date(leadDate).toISOString() : new Date().toISOString(),
      projectName: projectName.trim(),
      groupName: groupName.trim(),
      companyName: companyName.trim(),
      gstName: companyName.trim(),
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
        // Preserve both catalog identifiers so the selected product remains
        // traceable after the lead is created.
        productId: item.productId || undefined,
        productPublicId: item.productCode || undefined,
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
      productInterest: itemsDescription,
      productInterested: itemsDescription,
      estimatedQuantity: items.reduce((sum, item) => sum + item.quantity, 0),

      address: {
        line1: addressLine1.trim(),
        city: city.trim(),
        state: stateName.trim(),
        country: 'India',
        pincode: pincode.trim(),
        latitude: latitude !== undefined ? latitude : null,
        longitude: longitude !== undefined ? longitude : null,
        googlePlaceId: googlePlaceId || null
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
      setIsSubmitting(true);
      try {
        if (submitAction === 'quotation' && onGenerateQuotation) {
          const res = await onGenerateQuotation(dataPayload);
          success = res?.success !== false; // assume true if not explicitly false
        } else {
          const res = await onAddLead(dataPayload);
          success = res?.success !== false;
        }
      } catch (err) {
        // The sales hook already presents the API error to the user.
        // Avoid Next.js treating the same handled failure as an uncaught console error.
        console.warn('Lead submission failed:', err instanceof Error ? err.message : err);
      } finally {
        setIsSubmitting(false);
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
      <style>{`
        .responsive-address-container {
          display: flex;
          gap: 8px;
          width: 100%;
          align-items: center;
        }
        .use-location-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border: none;
          border-radius: 8px;
          height: 38px;
          padding: 0 16px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 4px rgba(99, 102, 241, 0.2);
          white-space: nowrap;
        }
        .use-location-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
        }
        .use-location-btn-text {
          display: inline;
        }
        @media (max-width: 500px) {
          .use-location-btn {
            padding: 0 12px;
          }
          .use-location-btn-text {
            display: none;
          }
        }
      `}</style>
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
              <strong style={{ fontSize: '15px', color: '#ea580c' }}>Lead ID: {editingLead.leadNumber || displayEntityId(editingLead.id)}</strong>
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
                  <label className="form-label">Lead Date *</label>
                  <input
                    data-testid="lead-date"
                    type="date"
                    className="form-input"
                    value={leadDate}
                    onChange={e => setLeadDate(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input data-testid="lead-project-name" type="text" className="form-input" placeholder="e.g. Skyline Premium Residency" value={projectName} onChange={e => setProjectName(e.target.value)} maxLength={255} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-full">
                  <label className="form-label">Group Name *</label>
                  <input data-testid="lead-group-name" type="text" className="form-input" placeholder="e.g. ABC Group" value={groupName} onChange={e => setGroupName(e.target.value)} maxLength={255} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">GST Name (Optional)</label>
                  <input data-testid="lead-company-name" type="text" className="form-input" placeholder="e.g. ABC Buildcon Pvt Ltd" value={companyName} onChange={e => setCompanyName(e.target.value)} maxLength={255} />
                </div>
                <div className="form-group">
                  <label className="form-label">GST Number (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 09ABCDE1234F1Z5"
                    value={gstNumber}
                    onChange={e => setGstNumber(e.target.value.toUpperCase())}
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Site Incharge Name *</label>
                  <input data-testid="lead-contact-person" type="text" className="form-input" placeholder="e.g. Rahul Sharma" value={siteInchargeName} onChange={e => setSiteInchargeName(e.target.value)} maxLength={255} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Site Incharge Mobile *</label>
                  <input
                    data-testid="lead-phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9876543210"
                    value={siteInchargeMobile}
                    onChange={e => setSiteInchargeMobile(e.target.value.replace(/\D/g, ''))}
                    maxLength={10}
                    minLength={10}
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Office Contact (Optional)</label>
                  <input type="text" className="form-input" placeholder="e.g. 011-22334455" value={officeContact} onChange={e => setOfficeContact(e.target.value)} maxLength={15} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address (Optional)</label>
                  <input type="email" className="form-input" placeholder="e.g. contact@company.com" value={email} onChange={e => setEmail(e.target.value)} maxLength={255} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Logged In Sales Representative</label>
                <div style={{ background: '#F5FAFE', color: '#475569', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontWeight: '600', border: '1px solid #DCE5F0', borderRadius: '10px', minHeight: '44px', padding: '10px 14px', lineHeight: '1.4', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }}></span>
                  <span style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                    <strong>{user?.name || 'Alex Carter'}</strong>
                    {loginTime ? ` logged in on ${loginTime.date} at ${loginTime.time}` : ' logging in...'}
                  </span>
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
                <div className="responsive-address-container">
                  <input
                    ref={inputRef}
                    data-testid="lead-address"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Sector 62, Noida Industrial Area"
                    value={addressLine1}
                    onChange={e => setAddressLine1(e.target.value)}
                    style={{ flex: 1 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="use-location-btn"
                  >
                    <MapPin size={15} />
                    <span className="use-location-btn-text">Use Current Location</span>
                  </button>
                </div>
              </div>

              <div className="form-row-three">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input data-testid="lead-city" type="text" className="form-input" placeholder="e.g. Noida" value={city} onChange={e => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">State *</label>
                  <input data-testid="lead-state" type="text" className="form-input" placeholder="e.g. Uttar Pradesh" value={stateName} onChange={e => setStateName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode *</label>
                  <input
                    data-testid="lead-pincode"
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
            {items.map((item, index) => (
              <div key={item.id} style={{ position: 'relative', zIndex: items.length - index + 10 }}>
                <div className="lead-product-grid" style={{ position: 'relative', overflow: 'visible' }}>
                  <div className="lead-product-grid-spec" style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'visible', zIndex: 20 }}>
                    <ProductPicker
                      testId="lead-product-picker"
                      value={(item.productId || item.productName) ? {
                        id: item.productId || item.productCode || 'custom',
                        product_name: item.productName || item.productCode || 'Selected Product',
                        product_code: item.productCode || ''
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
                      data-testid="lead-specifications"
                      type="text"
                      className="form-input"
                      placeholder="Specifications / Color details * (e.g. Color: Grey, Size: M10)"
                      value={item.specification}
                      onChange={e => handleRowChange(item.id, 'specification', e.target.value)}
                      required
                      style={{ fontSize: '12.5px', padding: '9px 12px' }}
                    />
                  </div>

                  <div className="lead-product-qty-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                    <label className="mobile-only" style={{ fontSize: '11px', fontWeight: '800', color: '#1d4ed8', display: 'none', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>QTY</span>
                      Quantity *
                    </label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        data-testid="lead-estimated-quantity"
                        type="number"
                        className="form-input"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={e => handleRowChange(item.id, 'quantity', Math.max(1, Number(e.target.value)))}
                        required
                        style={{ textAlign: 'center', padding: '9px 8px', fontWeight: '700', color: '#1e293b', background: '#eff6ff', border: '1.5px solid #93c5fd', borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div className="lead-product-price-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                    <label className="mobile-only" style={{ fontSize: '11px', fontWeight: '800', color: '#15803d', display: 'none', alignItems: 'center', gap: '4px', textTransform: 'uppercase' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>₹</span>
                      Unit Price *
                    </label>
                    <div style={{ position: 'relative', width: '100%' }}>
                      <input
                        data-testid="lead-unit-price"
                        type="number"
                        className="form-input"
                        min="0"
                        placeholder="₹ Price"
                        value={item.unitPrice}
                        onChange={e => handleRowChange(item.id, 'unitPrice', Number(e.target.value))}
                        required
                        style={{ textAlign: 'center', padding: '9px 8px', fontWeight: '700', color: '#1e293b', background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px' }}
                      />
                    </div>
                  </div>

                  <div className="lead-product-grid-total" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: '#24345C', minHeight: '42px', gap: '6px' }}>
                    <span className="mobile-only" style={{ display: 'none', fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Total:</span>
                    <span>{formatINR(calculateItemTotal(item))}</span>
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
              data-testid="lead-submit"
              type="submit"
              className="form-submit-btn"
              onClick={() => setSubmitAction('lead')}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Submit Lead Details'}
            </button>
          )}
          <button
            type="button"
            className="btn-small btn-outline-small"
            onClick={onCancel}
            disabled={isSubmitting}
            style={{ flex: 'none', padding: '12px 20px', opacity: isSubmitting ? 0.5 : 1 }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
