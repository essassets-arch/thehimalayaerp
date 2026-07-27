import React from 'react';
import { Modal } from '../ui/modal';
import { useFormDraft } from '../../shared/hooks/useFormDraft';

interface SalaryAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  salary: any;
  onSave: (salaryId: string, adjustments: any) => void;
}

export function SalaryAdjustmentModal({ isOpen, onClose, salary, onSave }: SalaryAdjustmentModalProps) {
  const emptyForm = {
    bonus: salary?.adjustments?.bonus || 0,
    incentive: salary?.adjustments?.incentive || 0,
    otherAllowance: salary?.adjustments?.otherAllowance || 0,
    otherDeduction: salary?.adjustments?.otherDeduction || 0,
    manualAdjustment: salary?.adjustments?.manualAdjustment || 0,
    remarks: salary?.adjustments?.remarks || ''
  };

  const { formData: adjustments, setFormData: setAdjustments, clearDraft } = useFormDraft({
    draftKey: salary ? `erp_draft_salary_adjustment_${salary.id}` : 'erp_draft_salary_adjustment_new',
    initialData: emptyForm,
    enabled: isOpen && !!salary
  });

  if (!salary) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAdjustments(prev => ({
      ...prev,
      [name]: name === 'remarks' ? value : Number(value)
    }));
  };

  const handleSave = () => {
    onSave(salary.id, adjustments);
    clearDraft();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adjustments: ${salary.employeeName}`} size="md">
      <div className="space-y-4">
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800">
          <p className="font-semibold mb-1">Editing Adjustments Only</p>
          <p>Base salary, attendance, and statutory deductions are calculated automatically. Any changes here will trigger a full recalculation of Gross and Net Salary.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bonus (₹)</label>
            <input 
              type="number" 
              name="bonus" 
              value={adjustments.bonus} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2 outline-none focus:border-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Incentive (₹)</label>
            <input 
              type="number" 
              name="incentive" 
              value={adjustments.incentive} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2 outline-none focus:border-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Other Allowance (₹)</label>
            <input 
              type="number" 
              name="otherAllowance" 
              value={adjustments.otherAllowance} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2 outline-none focus:border-indigo-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Other Deduction (₹)</label>
            <input 
              type="number" 
              name="otherDeduction" 
              value={adjustments.otherDeduction} 
              onChange={handleChange} 
              className="w-full border rounded px-3 py-2 outline-none focus:border-indigo-500" 
            />
          </div>
        </div>

        <div className="border-t pt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Manual Adjustment (₹)</label>
          <p className="text-xs text-slate-500 mb-2">Positive values add to earnings, negative values add to deductions.</p>
          <input 
            type="number" 
            name="manualAdjustment" 
            value={adjustments.manualAdjustment} 
            onChange={handleChange} 
            className="w-full border rounded px-3 py-2 outline-none focus:border-indigo-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Remarks / Reason</label>
          <textarea 
            name="remarks" 
            value={adjustments.remarks} 
            onChange={handleChange} 
            rows={2}
            className="w-full border rounded px-3 py-2 outline-none focus:border-indigo-500 text-sm" 
            placeholder="Required if manual adjustment is made..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button className="salary-outline-btn" onClick={onClose}>Cancel</button>
          <button 
            className="salary-action-btn" 
            onClick={handleSave}
            disabled={adjustments.manualAdjustment !== 0 && !adjustments.remarks.trim()}
          >
            Save & Recalculate
          </button>
        </div>
      </div>
    </Modal>
  );
}
