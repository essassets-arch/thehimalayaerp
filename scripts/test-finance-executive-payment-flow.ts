import assert from 'node:assert/strict';
import { useERPStore } from '../store/erpStore';

const runFinanceExecutiveTests = () => {
  const store = useERPStore;
  const orderId = 'ORD-TEST-201';
  const customerId = 'CUST-TEST-99';

  console.log('--- Initializing ERP Store for Finance Executive E2E Flow ---');

  // Seed initial order state: ₹2,01,780 Grand Total, Delivered status
  store.setState({
    state: {
      sales: {
        leads: [],
        samples: [],
        quotations: [],
        orders: [
          {
            id: orderId,
            customerId: customerId,
            customerName: 'Aero Builders Ltd',
            grandTotal: 201780,
            verifiedAmount: 0,
            pendingAmount: 201780,
            paymentStatus: 'NOT_DUE',
            dispatchStatus: 'DELIVERED',
            orderClosureStatus: 'OPEN'
          }
        ],
        paymentConfirmations: [],
        replacementRequests: [],
        returnRequests: [],
        customers: []
      },
      finance: {
        customerPayments: [],
        paymentFollowUps: [],
        paymentReceipts: []
      }
    }
  });

  // Actors
  const financeExecutiveActor = {
    id: 'FE-01',
    name: 'Sarah Connor',
    role: 'Finance Executive'
  };

  const financeManagerActor = {
    id: 'FM-01',
    name: 'John Doe',
    role: 'Finance'
  };

  const salesActor = {
    id: 'SL-01',
    name: 'Kyle Reese',
    role: 'Sales'
  };

  console.log('\n✅ Seeded order ORD-TEST-201 with ₹2,01,780 outstanding balance and DELIVERED dispatch status.');

  // 1. Validate negative/zero payment amounts
  console.log('\n--- Test 1: Validate payment amount validation ---');
  assert.throws(
    () => {
      store.getState().finance.recordCustomerPayment({
        orderId,
        paymentAmount: 0,
        paymentMode: 'Bank Transfer',
        transactionReference: 'UTR99882211',
        source: 'FINANCE_EXECUTIVE'
      }, financeExecutiveActor);
    },
    /Payment amount must be greater than zero/,
    'Should reject zero amount'
  );
  console.log('✅ Correctly rejected zero-amount payment.');

  // 2. Validate overpayment protection
  console.log('\n--- Test 2: Validate overpayment protection ---');
  assert.throws(
    () => {
      store.getState().finance.recordCustomerPayment({
        orderId,
        paymentAmount: 250000,
        paymentMode: 'Bank Transfer',
        transactionReference: 'UTR99882211',
        source: 'FINANCE_EXECUTIVE'
      }, financeExecutiveActor);
    },
    /Payment amount exceeds the remaining order balance/,
    'Should reject overpayment amount'
  );
  console.log('✅ Correctly blocked overpayment attempt.');

  // 3. Record valid partial payment (₹1,00,000)
  console.log('\n--- Test 3: Record valid partial payment ---');
  const paymentId1 = store.getState().finance.recordCustomerPayment({
    orderId,
    paymentAmount: 100000,
    paymentMode: 'Bank Transfer',
    transactionReference: 'UTR11112222',
    source: 'FINANCE_EXECUTIVE'
  }, financeExecutiveActor);

  let p1 = store.getState().state.finance.customerPayments.find((p: any) => p.id === paymentId1);
  assert.equal(p1.verificationStatus, 'FINANCE_EXECUTIVE_RECORDED', 'Should start as FINANCE_EXECUTIVE_RECORDED');
  assert.equal(p1.paymentAmount, 100000);
  assert.equal(p1.recordedBy, 'Sarah Connor');
  console.log(`✅ Payment recorded successfully: ID ${paymentId1}, status ${p1.verificationStatus}`);

  // 4. Validate duplicate transaction reference protection
  console.log('\n--- Test 4: Validate duplicate reference protection ---');
  assert.throws(
    () => {
      store.getState().finance.recordCustomerPayment({
        orderId,
        paymentAmount: 100000,
        paymentMode: 'Bank Transfer',
        transactionReference: 'UTR11112222',
        paymentDate: p1.paymentDate,
        source: 'FINANCE_EXECUTIVE'
      }, financeExecutiveActor);
    },
    /Duplicate transaction reference detected/,
    'Should block duplicate transaction reference'
  );
  console.log('✅ Correctly blocked duplicate transaction reference.');

  // 5. Submit to Finance for Verification
  console.log('\n--- Test 5: Submit recorded payment to Finance ---');
  store.getState().finance.submitCustomerPaymentToFinance(paymentId1, financeExecutiveActor);

  p1 = store.getState().state.finance.customerPayments.find((p: any) => p.id === paymentId1);
  assert.equal(p1.verificationStatus, 'FINANCE_VERIFICATION_PENDING', 'Should transition to FINANCE_VERIFICATION_PENDING');
  console.log(`✅ Payment transitioned to ${p1.verificationStatus}`);

  // 6. Confirm Finance Executive cannot verify
  console.log('\n--- Test 6: Verify permission restrictions for Finance Executive ---');
  assert.throws(
    () => {
      store.getState().finance.verifyCustomerPayment(paymentId1, financeExecutiveActor);
    },
    /Finance Executive cannot finally verify payments/,
    'Finance Executive role must be rejected from final verification'
  );
  console.log('✅ Security guard verified: Finance Executive role blocked from final verification.');

  // 7. Verify payment as Finance Manager
  console.log('\n--- Test 7: Verify payment and trigger atomic receipt generation ---');
  store.getState().finance.verifyCustomerPayment(paymentId1, financeManagerActor);

  p1 = store.getState().state.finance.customerPayments.find((p: any) => p.id === paymentId1);
  assert.equal(p1.verificationStatus, 'FINANCE_VERIFIED');
  assert.equal(p1.verifiedBy, 'John Doe');

  // Verify order metrics recalculated
  let order = store.getState().state.sales.orders.find((o: any) => o.id === orderId);
  assert.equal(order.verifiedAmount, 100000);
  assert.equal(order.pendingAmount, 101780);
  assert.equal(order.paymentStatus, 'PARTIALLY_PAID');
  assert.equal(order.orderClosureStatus, 'OPEN');

  // Verify receipt generated atomically
  let receipts = store.getState().state.finance.paymentReceipts;
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].receiptNumber, '#RCPT1');
  assert.equal(receipts[0].paymentId, paymentId1);
  assert.equal(receipts[0].remainingBalance, 101780);
  console.log(`✅ Payment verified. Order: verified: ₹${order.verifiedAmount}, pending: ₹${order.pendingAmount}, status: ${order.paymentStatus}. Receipt: ${receipts[0].receiptNumber} created.`);

  // 8. Record remaining payment, and reject it
  console.log('\n--- Test 8: Record remaining payment and reject it ---');
  const paymentId2 = store.getState().finance.recordCustomerPayment({
    orderId,
    paymentAmount: 101780,
    paymentMode: 'Bank Transfer',
    transactionReference: 'UTR33334444',
    source: 'FINANCE_EXECUTIVE'
  }, financeExecutiveActor);

  store.getState().finance.submitCustomerPaymentToFinance(paymentId2, financeExecutiveActor);
  store.getState().finance.rejectCustomerPayment(paymentId2, 'Bank settlement receipt mismatch', financeManagerActor);

  let p2 = store.getState().state.finance.customerPayments.find((p: any) => p.id === paymentId2);
  assert.equal(p2.verificationStatus, 'FINANCE_REJECTED');
  assert.equal(p2.rejectionReason, 'Bank settlement receipt mismatch');
  console.log(`✅ Payment rejected successfully. Status: ${p2.verificationStatus}, reason: "${p2.rejectionReason}".`);

  // 9. Correct rejected payment and resubmit
  console.log('\n--- Test 9: Correct rejected payment details and resubmit ---');
  store.getState().finance.correctRejectedPayment(paymentId2, {
    transactionReference: 'UTR33334444-FIXED',
    remarks: 'Corrected transaction UTR after bank slip re-verification'
  }, financeExecutiveActor);

  store.getState().finance.resubmitCustomerPayment(paymentId2, financeExecutiveActor);

  p2 = store.getState().state.finance.customerPayments.find((p: any) => p.id === paymentId2);
  assert.equal(p2.verificationStatus, 'FINANCE_VERIFICATION_PENDING');
  assert.equal(p2.revision, 2);
  assert.equal(p2.transactionReference, 'UTR33334444-FIXED');
  console.log(`✅ Payment corrected and resubmitted. Status: ${p2.verificationStatus}, revision: v${p2.revision}`);

  // 10. Verify second payment and confirm order closure
  console.log('\n--- Test 10: Verify corrected payment and check order closure ---');
  store.getState().finance.verifyCustomerPayment(paymentId2, financeManagerActor);

  p2 = store.getState().state.finance.customerPayments.find((p: any) => p.id === paymentId2);
  assert.equal(p2.verificationStatus, 'FINANCE_VERIFIED');

  order = store.getState().state.sales.orders.find((o: any) => o.id === orderId);
  assert.equal(order.verifiedAmount, 201780);
  assert.equal(order.pendingAmount, 0);
  assert.equal(order.paymentStatus, 'FULLY_PAID');
  assert.equal(order.orderClosureStatus, 'ORDER_CLOSED', 'Delivered & fully paid order must be ORDER_CLOSED');

  receipts = store.getState().state.finance.paymentReceipts;
  assert.equal(receipts.length, 2);
  assert.equal(receipts[1].receiptNumber, '#RCPT2');
  assert.equal(receipts[1].paymentId, paymentId2);
  assert.equal(receipts[1].remainingBalance, 0);

  console.log(`✅ Final payment verified. Order: verified: ₹${order.verifiedAmount}, pending: ₹${order.pendingAmount}, status: ${order.paymentStatus}, closureStatus: ${order.orderClosureStatus}. Receipt: ${receipts[1].receiptNumber} created.`);

  console.log('\n🏆 ALL FINANCE EXECUTIVE AND PAYMENT COLLECTION FLOW TESTS PASSED SUCCESSFULLY!');
};

runFinanceExecutiveTests();
