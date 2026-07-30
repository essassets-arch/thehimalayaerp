import React, { useState } from 'react';
import { useERPStore } from '../../../store/erpStore';
import { createPurchaseOrder } from '../../../store/procurementActions';
import { ProcurementStatusBadge } from '../components/ProcurementStatusBadge';
import { Package, Calculator, FileText } from 'lucide-react';
import Swal from 'sweetalert2';

const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function CreatePurchaseOrder() {
  const indents = useERPStore(state => state.state?.procurement?.materialIndents || []);
  const suppliers = useERPStore(state => state.state?.suppliers || []);
  
  const readyIndents = indents.filter(ind => 
    ind.status === 'PLANT_HEAD_APPROVED'
  );

  const [selectedIndent, setSelectedIndent] = useState(null);
  const [supplierId, setSupplierId] = useState('');
  const [freightAmount, setFreightAmount] = useState(0);
  const [poItems, setPoItems] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectIndent = (indentId) => {
    const indent = readyIndents.find(i => i.id === indentId);
    if (!indent) return;
    setSelectedIndent(indent);
    
    setPoItems((indent.items || []).map(item => ({
      materialId: item.productId || item.materialId,
      materialName: item.product?.name || item.materialName || 'Material',
      unit: item.unit || item.product?.unit || 'Nos',
      orderedQty: Number(item.approvedQuantity ?? item.approvedQty ?? item.quantity ?? 0),
      unitRate: Number(item.estimatedUnitRate || 0),
      gstPercent: 18,
      discountPercent: 0
    })));
  };

  const handleItemChange = (materialId, field, value) => {
    const numValue = Number(value) || 0;
    setPoItems(prev => prev.map(item => {
      if (item.materialId === materialId) {
        return { ...item, [field]: numValue };
      }
      return item;
    }));
  };

  const calculateGrandTotal = () => {
    const itemsTotal = poItems.reduce((acc, item) => {
      const base = item.orderedQty * item.unitRate;
      const disc = base * (item.discountPercent / 100);
      const tax = (base - disc) * (item.gstPercent / 100);
      return acc + (base - disc + tax);
    }, 0);
    return itemsTotal + Number(freightAmount);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supplierId) return Swal.fire('Error', 'Supplier is required', 'error');

    try {
      setIsSubmitting(true);
      
      const poData = {
        supplierId,
        totalAmount: calculateGrandTotal(),
        freight: Number(freightAmount),
        otherCharges: 0,
        paymentTerms: 'NET_30',
        expectedDeliveryDate: selectedIndent.requiredDate,
        items: poItems.map(item => ({
          productId: item.materialId,
          quantity: item.orderedQty,
          unitPrice: item.unitRate,
          discountPercent: item.discountPercent,
          gstPercent: item.gstPercent
        }))
      };

      await createPurchaseOrder(selectedIndent.id, poData, 'Finance Exec');
      
      await Swal.fire('Success', 'Draft Purchase Order created successfully.', 'success');
      
      // Reset
      setSelectedIndent(null);
      setSupplierId('');
      setFreightAmount(0);
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to create PO', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!selectedIndent ? (
        <div className="w-full">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Approved Indents (Ready for PO)</h2>
            <p className="text-sm text-gray-500">Select an approved indent to create a purchase order</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {readyIndents.map(indent => (
              <div 
                key={indent.id} 
                onClick={() => handleSelectIndent(indent.id)}
                className="border border-gray-200 rounded-lg p-5 hover:border-blue-500 hover:shadow-md cursor-pointer transition-all bg-white"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{indent.publicId || indent.id}</h3>
                    <p className="text-sm text-gray-500">{indent.department}</p>
                  </div>
                  <FileText className="text-gray-400" />
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{indent.items?.length || 0}</span> items required by <span className="font-medium text-rose-600">{formatDate(indent.requiredDate)}</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <ProcurementStatusBadge status={indent.status} />
                  <span className="text-sm font-medium text-blue-600">Create PO →</span>
                </div>
              </div>
            ))}
            {readyIndents.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border border-gray-150">
                No approved indents available for PO creation.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <button 
                onClick={() => setSelectedIndent(null)}
                className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center mb-2"
              >
                ← Back to Indents
              </button>
              <h2 className="text-xl font-bold text-gray-900">Create Purchase Order</h2>
              <p className="text-sm text-gray-500">Ref: {selectedIndent.publicId || selectedIndent.id}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <Calculator size={24} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border border-gray-250">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Supplier</label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Choose Supplier...</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.publicId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Freight & Other Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={freightAmount}
                  onChange={(e) => setFreightAmount(Number(e.target.value) || 0)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Commercial Line Items</h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-32">Rate (₹)</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">Disc %</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-24">GST %</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {poItems.map((item) => {
                      const base = item.orderedQty * item.unitRate;
                      const disc = base * (item.discountPercent / 100);
                      const tax = (base - disc) * (item.gstPercent / 100);
                      const total = base - disc + tax;
                      
                      return (
                        <tr key={item.materialId}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Package className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{item.materialName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {item.orderedQty} {item.unit}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input 
                              type="number" min="0" step="0.01"
                              value={item.unitRate} 
                              onChange={(e) => handleItemChange(item.materialId, 'unitRate', e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right" 
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input 
                              type="number" min="0" max="100"
                              value={item.discountPercent} 
                              onChange={(e) => handleItemChange(item.materialId, 'discountPercent', e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right" 
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <select
                              value={item.gstPercent}
                              onChange={(e) => handleItemChange(item.materialId, 'gstPercent', e.target.value)}
                              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-right"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 bg-gray-50">
                            ₹{total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits:2})}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-5 border-t border-gray-200 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Draft PO'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
