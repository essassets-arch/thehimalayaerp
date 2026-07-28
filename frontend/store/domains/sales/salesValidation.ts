import { SalesLead, SalesQuotation, SalesOrder, PaymentMilestone } from './salesTypes';

export const validateLead = (lead: Partial<SalesLead>) => {
  const errors: string[] = [];
  if (!lead.customerName?.trim()) errors.push("Customer/Company Name is required.");
  if (!lead.contactPerson?.trim()) errors.push("Contact Person is required.");
  if (!lead.mobile?.trim()) errors.push("Mobile number is required.");
  if (!lead.deliveryAddress?.trim()) errors.push("Delivery address is required.");
  if (!lead.requiredProducts?.trim()) errors.push("Required products information is required.");
  if (!lead.expectedQuantities?.trim()) errors.push("Expected quantities are required.");
  return errors;
};

export const validatePaymentMilestones = (milestones: PaymentMilestone[]) => {
  const errors: string[] = [];
  if (!Array.isArray(milestones)) {
    return ["Payment milestones must be an array."];
  }
  const total = milestones.reduce((sum, m) => sum + m.percentage, 0);
  if (total !== 100) {
    errors.push(`Payment milestones must sum to exactly 100%. Current sum is ${total}%.`);
  }
  milestones.forEach(m => {
    if (m.percentage <= 0 || m.percentage > 100) {
      errors.push(`Milestone "${m.label}" has an invalid percentage: ${m.percentage}%.`);
    }
    if (!m.trigger) {
      errors.push(`Milestone "${m.label}" requires a trigger event.`);
    }
  });
  return errors;
};

export const validateQuotation = (quotation: Partial<SalesQuotation>) => {
  const errors: string[] = [];
  const items = Array.isArray(quotation.items) ? quotation.items : [];
  if (!quotation.customerName?.trim()) errors.push("Customer name is required.");
  if (items.length === 0) errors.push("Quotation must have at least one line item.");
  
  items.forEach((item, idx) => {
    if (!item.productName?.trim()) errors.push(`Line item ${idx + 1} is missing a product name.`);
    if (item.quantity <= 0) errors.push(`Line item ${idx + 1} quantity must be greater than zero.`);
    if (item.unitPrice < 0) errors.push(`Line item ${idx + 1} unit price cannot be negative.`);
  });

  if (Array.isArray(quotation.paymentMilestones)) {
    errors.push(...validatePaymentMilestones(quotation.paymentMilestones));
  } else {
    errors.push("Payment milestones are required.");
  }

  return errors;
};
