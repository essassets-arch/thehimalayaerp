'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Truck, ArrowLeft, Save, Send, X, ClipboardList, Info } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { backendFetch } from '@/lib/backendFetch';

interface Customer {
  id: string;
  companyName: string;
  address?: string;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  shippingAddress?: any;
  customer?: Customer;
}

interface SalesOrderItem {
  id: string;
  productId: string;
  productNameSnapshot: string;
  orderedQuantity: number;
  unitPrice: number;
  dispatchItems?: { quantity: string | number }[];
}

interface ProductionPlan {
  id: string;
  salesOrder?: SalesOrder;
}

interface WorkOrder {
  id: string;
  workOrderNumber: string;
  quantity: number;
  status: string;
  salesOrderItemId: string;
  productionPlan?: ProductionPlan;
  salesOrderItem?: SalesOrderItem;
}

export default function CreateDispatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const workOrderId = searchParams.get('workOrderId');

  // Form State
  const [dispatchNo, setDispatchNo] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [packageCount, setPackageCount] = useState<number>(0);
  const [packageType, setPackageType] = useState('Box');
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [transporterName, setTransporterName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Truck');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverLicence, setDriverLicence] = useState('');
  const [expectedDispatchDate, setExpectedDispatchDate] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [ewayBillNumber, setEwayBillNumber] = useState('');
  const [dispatchQty, setDispatchQty] = useState<number>(0);

  // Fetch Work Order Details
  const { data: workOrder, isLoading, error } = useQuery<WorkOrder>({
    queryKey: ['work-order-detail', workOrderId],
    queryFn: async () => {
      if (!workOrderId) throw new Error('Work Order ID missing');
      return backendFetch<WorkOrder>(`/api/backend/production/work-orders/${workOrderId}`);
    },
    enabled: !!workOrderId,
  });

  const salesOrder = workOrder?.productionPlan?.salesOrder;
  const customer = salesOrder?.customer;
  const salesOrderItem = workOrder?.salesOrderItem;

  // Prefill default delivery address
  useEffect(() => {
    if (salesOrder) {
      const addrObj = salesOrder.shippingAddress;
      let addrStr = '';
      if (addrObj && typeof addrObj === 'object') {
        addrStr = [
          addrObj.line1,
          addrObj.line2,
          addrObj.city,
          addrObj.state,
          addrObj.postalCode,
          addrObj.country
        ].filter(Boolean).join(', ');
      }
      setDeliveryAddress(addrStr || customer?.address || '');
    }
  }, [salesOrder, customer]);

  // Quantities calculation
  const approvedQty = Number(workOrder?.quantity || 0); // QC approved quantity is set as WorkOrder final quantity once QC passes
  
  // Calculate remaining order quantity
  const orderedQty = Number(salesOrderItem?.orderedQuantity || 0);
  const alreadyDispatched = salesOrderItem?.dispatchItems?.reduce((sum, item) => sum + Number(item.quantity), 0) || 0;
  const remainingOrderQty = Math.max(0, orderedQty - alreadyDispatched);

  // Set default dispatch quantity to max available
  useEffect(() => {
    if (workOrder) {
      const maxAllowed = Math.min(approvedQty, remainingOrderQty);
      setDispatchQty(maxAllowed);
    }
  }, [workOrder, approvedQty, remainingOrderQty]);

  const handleSubmit = async (submitForApproval: boolean) => {
    if (!deliveryAddress.trim()) {
      toast.error('Delivery Address is mandatory');
      return;
    }
    if (dispatchQty <= 0) {
      toast.error('Dispatch Quantity must be greater than zero');
      return;
    }
    if (dispatchQty > approvedQty) {
      toast.error(`Dispatch Quantity cannot exceed QC-approved quantity (${approvedQty})`);
      return;
    }
    if (dispatchQty > remainingOrderQty) {
      toast.error(`Dispatch Quantity cannot exceed remaining order quantity (${remainingOrderQty})`);
      return;
    }

    try {
      const payload = {
        salesOrderId: salesOrder?.id,
        deliveryAddress,
        specialInstructions,
        packageCount: Number(packageCount) || 0,
        packageType,
        totalWeight: Number(totalWeight) || 0,
        transporterName,
        vehicleNumber,
        vehicleType,
        driverName,
        driverPhone,
        driverLicence,
        expectedDispatchDate: expectedDispatchDate || undefined,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        invoiceNumber,
        ewayBillNumber,
        items: [
          {
            salesOrderItemId: salesOrderItem?.id,
            quantity: Number(dispatchQty)
          }
        ]
      };

      // 1. Create Dispatch (initially draft)
      const dispatch = await backendFetch<any>('/api/backend/logistics/dispatches', {
        method: 'POST',
        body: payload
      });

      // 2. Submit for approval if requested
      if (submitForApproval) {
        await backendFetch(`/api/backend/logistics/dispatches/${dispatch.id}/submit`, {
          method: 'POST'
        });
        toast.success('Dispatch created and submitted for approval');
      } else {
        toast.success('Dispatch draft saved successfully');
      }

      router.push('/dispatch/orders');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create dispatch record');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-sm">
        <Truck className="animate-spin h-6 w-6 mr-2 text-blue-500" />
        Loading work order details...
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-red-50 border border-red-200 rounded-xl">
        <h1 className="text-lg font-semibold text-red-800">Error loading work order</h1>
        <p className="text-sm text-red-700 mt-1">Make sure a valid Work Order ID is provided.</p>
        <Button onClick={() => router.push('/dispatch/orders')} className="mt-4">Back to List</Button>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto space-y-6 sm:space-y-8 bg-gray-50/20 min-h-screen">
      {/* Top Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => router.push('/dispatch/orders')} className="hover:text-blue-600 flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Queue
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Create Dispatch</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-8">
        {/* Title */}
        <div className="border-b pb-4">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600 h-6 w-6" />
            Create Dispatch Record
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create a shipment draft against Sales Order <span className="font-semibold text-gray-800">#{salesOrder?.orderNumber}</span>
          </p>
        </div>

        {/* Quantities Alert Box */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3 text-sm text-blue-900">
          <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Workflow Quantities Check:</span>
            <div className="flex flex-wrap gap-4 text-xs text-blue-800 mt-1 font-mono">
              <div>Ordered Qty: <span className="font-bold text-gray-900">{orderedQty}</span></div>
              <div>Already Dispatched: <span className="font-bold text-gray-900">{alreadyDispatched}</span></div>
              <div>Remaining Order: <span className="font-bold text-blue-700">{remainingOrderQty}</span></div>
              <div>QC Approved: <span className="font-bold text-emerald-700">{approvedQty}</span></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1: Order details & custom fields */}
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">Order details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Sales Order Ref</label>
                <input 
                  type="text" 
                  value={salesOrder?.orderNumber || ''} 
                  disabled 
                  className="w-full bg-gray-50 text-gray-800 border rounded-lg px-3 py-2 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Work Order Ref</label>
                <input 
                  type="text" 
                  value={workOrder.workOrderNumber} 
                  disabled 
                  className="w-full bg-gray-50 text-gray-800 border rounded-lg px-3 py-2 text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Customer</label>
              <input 
                type="text" 
                value={customer?.companyName || ''} 
                disabled 
                className="w-full bg-gray-50 text-gray-800 border rounded-lg px-3 py-2 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Product</label>
              <input 
                type="text" 
                value={salesOrderItem?.productNameSnapshot || ''} 
                disabled 
                className="w-full bg-gray-50 text-gray-800 border rounded-lg px-3 py-2 text-sm font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Dispatch Number (Optional)</label>
                <input 
                  type="text" 
                  placeholder="Auto-Generated" 
                  value={dispatchNo} 
                  onChange={(e) => setDispatchNo(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Dispatch Quantity *</label>
                <input 
                  type="number" 
                  max={Math.min(approvedQty, remainingOrderQty)}
                  min={1}
                  value={dispatchQty} 
                  onChange={(e) => setDispatchQty(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold text-blue-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Delivery Address *</label>
              <textarea 
                rows={3}
                value={deliveryAddress} 
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter complete shipping details"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Special Instructions</label>
              <textarea 
                rows={2}
                value={specialInstructions} 
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Gate delivery conditions, timing limits etc."
              />
            </div>
          </div>

          {/* Column 2: Packaging & Logistics details */}
          <div className="space-y-5">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider border-b pb-1">Logistics & Driver details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Package Type</label>
                <select 
                  value={packageType} 
                  onChange={(e) => setPackageType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Box">Box</option>
                  <option value="Pallet">Pallet</option>
                  <option value="Bag">Bag</option>
                  <option value="Container">Container</option>
                  <option value="Loose">Loose</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Number of Packages</label>
                <input 
                  type="number" 
                  value={packageCount} 
                  onChange={(e) => setPackageCount(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Weight (kg)</label>
                <input 
                  type="number" 
                  value={totalWeight} 
                  onChange={(e) => setTotalWeight(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Transporter Name</label>
                <input 
                  type="text" 
                  value={transporterName} 
                  onChange={(e) => setTransporterName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Type</label>
                <input 
                  type="text" 
                  value={vehicleType} 
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. 10 Ton Truck"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Vehicle Number</label>
                <input 
                  type="text" 
                  value={vehicleNumber} 
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g. MH-12-PQ-1234"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Name</label>
                <input 
                  type="text" 
                  value={driverName} 
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Phone</label>
                <input 
                  type="text" 
                  value={driverPhone} 
                  onChange={(e) => setDriverPhone(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Driver Licence Details</label>
              <input 
                type="text" 
                value={driverLicence} 
                onChange={(e) => setDriverLicence(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Expected Dispatch Date</label>
                <input 
                  type="date" 
                  value={expectedDispatchDate} 
                  onChange={(e) => setExpectedDispatchDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Expected Delivery Date</label>
                <input 
                  type="date" 
                  value={expectedDeliveryDate} 
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Invoice Reference</label>
                <input 
                  type="text" 
                  value={invoiceNumber} 
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Draft / generated invoice no"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">E-way Bill Details</label>
                <input 
                  type="text" 
                  value={ewayBillNumber} 
                  onChange={(e) => setEwayBillNumber(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push('/dispatch/orders')}
            className="flex items-center gap-1.5"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => handleSubmit(false)}
            className="flex items-center gap-1.5"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button 
            type="button" 
            onClick={() => handleSubmit(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5"
          >
            <Send className="h-4 w-4" />
            Submit for Approval
          </Button>
        </div>
      </div>
    </div>
  );
}
