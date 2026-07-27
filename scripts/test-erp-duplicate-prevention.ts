import assert from 'node:assert/strict';
import { useERPStore, getLeadQuotationState, getLeadSampleState } from '../store/erpStore';

const testDuplicatePrevention = () => {
  const store = useERPStore;
  const testLeadId = 'LEAD-TEST-001';
  
  const currentStore = store.getState();
  const currentState = currentStore.state || {};
  store.setState({
    state: {
      ...currentState,
      sales: {
        ...(currentState.sales || {}),
        leads: [
          {
            id: testLeadId,
            leadId: testLeadId,
            companyName: 'Test Corp',
            status: 'New'
          }
        ],
        quotations: [],
        samples: []
      }
    }
  });

  console.log('--- Testing Lead -> Quotation Duplicate Prevention ---');
  
  // 1. Initial State: Should be NOT_CREATED
  let qState = getLeadQuotationState(useERPStore.getState().state, testLeadId);
  assert.equal(qState.state, 'NOT_CREATED', 'Initial state should be NOT_CREATED');
  
  // 2. First click on Generate Quotation
  const res1 = useERPStore.getState().createOrResumeQuotationFromLead(testLeadId);
  assert.equal(res1.success, true);
  assert.equal(res1.resumed, false, 'First action should create a new draft');
  assert.match(res1.quotationId, /^QUO\d+$/, 'Quotation ID must follow short sequential format (e.g. QUO1)');
  
  qState = getLeadQuotationState(useERPStore.getState().state, testLeadId);
  assert.equal(qState.state, 'DRAFT', 'State should be DRAFT after creation');
  
  // 3. Second click (direct URL access or double click)
  const res2 = useERPStore.getState().createOrResumeQuotationFromLead(testLeadId);
  assert.equal(res2.success, true);
  assert.equal(res2.resumed, true, 'Second action should resume the existing draft');
  assert.equal(res2.quotationId, res1.quotationId, 'Should return the same quotation ID');
  
  // 4. Verify only one draft exists
  const stateAfterRes = useERPStore.getState().state;
  const quotesForLead = stateAfterRes.sales.quotations.filter(q => q.leadId === testLeadId);
  assert.equal(quotesForLead.length, 1, 'Workflow must have only one active record for its unique business key');

  // 5. Finalize the quotation
  const finalizeRes = useERPStore.getState().finalizeQuotation(res1.quotationId, { price: 5000 });
  assert.equal(finalizeRes.success, true);
  
  qState = getLeadQuotationState(useERPStore.getState().state, testLeadId);
  assert.equal(qState.state, 'COMPLETED', 'State should be COMPLETED after final submission');
  
  // 6. Verify lead status updated
  const updatedLead = useERPStore.getState().state.sales.leads.find(l => l.id === testLeadId);
  assert.equal(updatedLead.status, 'QUOTATION_CREATED', 'Lead status should be updated');
  
  // 7. Verify creating quotation after completion returns existing or blocks
  const res3 = useERPStore.getState().createOrResumeQuotationFromLead(testLeadId);
  assert.equal(res3.resumed, true, 'Should resume/return existing even if completed, UI will block it');
  
  console.log('--- Testing Lead -> Sample Duplicate Prevention ---');
  
  let sState = getLeadSampleState(useERPStore.getState().state, testLeadId);
  assert.equal(sState.state, 'NOT_CREATED', 'Initial state should be NOT_CREATED');
  
  const sRes1 = useERPStore.getState().createOrResumeSampleFromLead(testLeadId);
  assert.equal(sRes1.success, true);
  assert.equal(sRes1.resumed, false, 'First action should create a new draft');
  assert.match(sRes1.sampleId, /^SMP\d+$/, 'Sample ID must follow short sequential format (e.g. SMP1)');
  
  sState = getLeadSampleState(useERPStore.getState().state, testLeadId);
  assert.equal(sState.state, 'DRAFT', 'State should be DRAFT after creation');
  
  const sRes2 = useERPStore.getState().createOrResumeSampleFromLead(testLeadId);
  assert.equal(sRes2.success, true);
  assert.equal(sRes2.resumed, true, 'Second action should resume the existing draft');
  assert.equal(sRes2.sampleId, sRes1.sampleId, 'Should return the same sample ID');
  
  const sFinalizeRes = useERPStore.getState().finalizeSample(sRes1.sampleId, { transportCost: 150 });
  assert.equal(sFinalizeRes.success, true);
  
  sState = getLeadSampleState(useERPStore.getState().state, testLeadId);
  assert.equal(sState.state, 'COMPLETED', 'State should be COMPLETED after final submission');
  
  console.log('✅ All duplicate prevention regression tests passed.');
};

testDuplicatePrevention();
