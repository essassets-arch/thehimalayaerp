import React, { useState, useEffect } from 'react';
import { selectPurchaseOrders, selectStorePurchaseOrder } from '../../../store/procurementSelectors';
import { createGRN } from '../../../store/procurementActions';
import { PurchaseOrderDetails } from '../components/PurchaseOrderDetails';
import { MaterialManifestTable } from '../components/MaterialManifestTable';
import { DeliveryDocumentUploader } from '../components/DeliveryDocumentUploader';
import { Package, Search, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function VerifyPODelivery() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedPO, setSelectedPO] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliveryItems, setDeliveryItems] = useState([]);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only show POs that can be received
    const pos = selectPurchaseOrders().filter(po => 
      ['PO_ISSUED', 'DELIVERY_PENDING', 'PARTIALLY_RECEIVED'].includes(po.status)
    );
    setPurchaseOrders(pos);
  }, []);

  const handleSelectPO = (poId) => {
    const po = selectStorePurchaseOrder(poId);
    setSelectedPO(po);
    
    // Initialize delivery items with 0 for all active items
    const initialItems = po.items
      .filter(item => item.remainingSupplyQty > 0)
      .map(item => ({
        materialId: item.materialId,
        materialName: item.materialName,
        deliveredQty: 0,
        acceptedQty: 0,
        rejectedQty: 0
      }));
    setDeliveryItems(initialItems);
  };

  const handleQtyChange = (materialId, field, value) => {
    const numValue = Number(value) || 0;
    setDeliveryItems(prev => prev.map(item => {
      if (item.materialId === materialId) {
        const updated = { ...item, [field]: numValue };
        
        // Auto-calculate the other side if one is changed to keep it simple for the prototype
        if (field === 'deliveredQty') {
          updated.acceptedQty = numValue; // default all to accepted
          updated.rejectedQty = 0;
        } else if (field === 'acceptedQty') {
          updated.rejectedQty = updated.deliveredQty - numValue;
        } else if (field === 'rejectedQty') {
          updated.acceptedQty = updated.deliveredQty - numValue;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const handleSubmitGRN = async () => {
    const activeItems = deliveryItems.filter(i => i.deliveredQty > 0);
    if (activeItems.length === 0) {
      return Swal.fire('Error', 'Please enter delivered quantity for at least one item.', 'error');
    }

    try {
      setIsSubmitting(true);
      const grnData = {
        remarks,
        items: activeItems
      };
      
      createGRN(selectedPO.id, grnData, 'Store Operator');
      
      await Swal.fire('Success', 'Delivery verified and GRN submitted for Finance Audit.', 'success');
      
      // Reset
      setSelectedPO(null);
      setPurchaseOrders(selectPurchaseOrders().filter(po => 
        ['PO_ISSUED', 'DELIVERY_PENDING', 'PARTIALLY_RECEIVED'].includes(po.status)
      ));
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to submit GRN', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPOs = purchaseOrders.filter(po => 
    po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    po.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {!selectedPO ? (
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Pending Deliveries</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search PO or Vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPOs.map(po => (
              <div 
                key={po.id} 
                onClick={() => handleSelectPO(po.id)}
                className="border border-gray-200 rounded-lg p-5 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{po.poNumber}</h3>
                    <p className="text-sm text-gray-500">{po.vendorDisplayName || po.vendorName}</p>
                  </div>
                  <Package className="text-gray-400" />
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {po.status.replace(/_/g, ' ')}
                  </span>
                  <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                    Verify Delivery →
                  </button>
                </div>
              </div>
            ))}
            {filteredPOs.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No pending deliveries found.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button 
            onClick={() => setSelectedPO(null)}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center"
          >
            ← Back to PO List
          </button>

          <PurchaseOrderDetails po={selectedPO} />
          <MaterialManifestTable items={selectedPO.items} role="STORE" />

          <div className="w-full border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record New Delivery</h3>
            
            <div className="overflow-x-auto rounded-lg border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Delivered Qty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-emerald-600 uppercase w-32">Accepted Qty</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-rose-600 uppercase w-32">Rejected Qty</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deliveryItems.map((item) => (
                    <tr key={item.materialId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.materialName}
                        <div className="text-xs text-gray-500 font-normal mt-1">
                          Max allowable: {selectedPO.items.find(i => i.materialId === item.materialId)?.remainingSupplyQty}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="number" 
                          min="0"
                          value={item.deliveredQty || ''} 
                          onChange={(e) => handleQtyChange(item.materialId, 'deliveredQty', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="number" 
                          min="0"
                          max={item.deliveredQty}
                          value={item.acceptedQty || ''} 
                          onChange={(e) => handleQtyChange(item.materialId, 'acceptedQty', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm" 
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input 
                          type="number" 
                          min="0"
                          max={item.deliveredQty}
                          value={item.rejectedQty || ''} 
                          onChange={(e) => handleQtyChange(item.materialId, 'rejectedQty', e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-rose-500 focus:border-rose-500 sm:text-sm" 
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter any notes about this delivery..."
              />
            </div>

            <DeliveryDocumentUploader entityId={selectedPO.id} entityType="GRN" />

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedPO(null)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-4"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitGRN}
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit GRN for Audit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
