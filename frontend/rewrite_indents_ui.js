const fs = require('fs');
const path = 'd:/prototype-next/modules/plant-head/pages/PlantHeadPortal.jsx';
let content = fs.readFileSync(path, 'utf8');

const startMarker = 'const renderMaterialIndents = () => {';
const endMarker = '  const renderReplacementRequests';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

const newFn = `const renderMaterialIndents = () => {
    // Merge erpStore local indents (from Store Portal) + API indents, dedup by id
    const allIndents = [...purchaseIndents];
    (materialIndents || []).forEach(ind => {
      if (!allIndents.some(a => a.id === ind.id)) allIndents.push(ind);
    });

    const pendingCount = allIndents.filter(i => i.status === 'PENDING_PLANT_HEAD' || i.status === 'PENDING_PLANT_HEAD_APPROVAL').length;
    const approvedCount = allIndents.filter(i => i.status === 'PLANT_HEAD_APPROVED').length;
    const rejectedCount = allIndents.filter(i => i.status === 'PLANT_HEAD_REJECTED').length;
    const totalLines = allIndents.reduce((sum, i) => sum + (i.items?.length || 1), 0);

    const tabs = [
      { key: 'All', label: 'All', count: allIndents.length },
      { key: 'PENDING', label: 'REQUESTED', count: pendingCount },
      { key: 'PLANT_HEAD_APPROVED', label: 'APPROVED', count: approvedCount },
      { key: 'PLANT_HEAD_REJECTED', label: 'RETURNED_FOR_CORRECTION', count: rejectedCount },
    ];

    const filteredIndents = allIndents.filter(ind => {
      const matchSearch = !indentSearch ||
        ind.id?.toLowerCase().includes(indentSearch.toLowerCase()) ||
        (ind.material || '').toLowerCase().includes(indentSearch.toLowerCase()) ||
        (ind.items || []).some(it => (it.material || it.name || '').toLowerCase().includes(indentSearch.toLowerCase()));
      let matchStatus = true;
      if (indentStatusFilter === 'PENDING') matchStatus = ind.status === 'PENDING_PLANT_HEAD' || ind.status === 'PENDING_PLANT_HEAD_APPROVAL';
      else if (indentStatusFilter !== 'All') matchStatus = ind.status === indentStatusFilter;
      return matchSearch && matchStatus;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: "var(--font-main, 'Inter', sans-serif)" }}>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { icon: <ClipboardList size={16} color="#3b82f6" />, label: 'Pending Orders', value: pendingCount + ' Orders', sub: 'Awaiting clearance approval' },
            { icon: <Package size={16} color="#3b82f6" />, label: 'Total Material Lines', value: totalLines + ' Items', sub: 'Ready for verification' },
          ].map(stat => (
            <div key={stat.label} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 14, padding: '18px 22px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {stat.icon}
                <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>{stat.label}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Title + Search + Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#0f172a' }}>Material Release Approvals</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text" placeholder="Search order, requester, material…"
                value={indentSearch} onChange={e => setIndentSearch(e.target.value)}
                style={{ paddingLeft: 30, width: 220, border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 10px 7px 30px', fontSize: 13, background: '#f8fafc', color: '#0f172a', outline: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', borderRadius: 10, padding: '4px' }}>
              {tabs.map(tab => {
                const isActive = indentStatusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setIndentStatusFilter(tab.key)}
                    style={{
                      border: 'none', borderRadius: 7, padding: '5px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      background: isActive ? '#c8f135' : 'transparent',
                      color: isActive ? '#1a2e05' : '#64748b',
                      transition: 'all 0.15s',
                    }}
                  >
                    {tab.label} ({tab.count})
                  </button>
                );
              })}
            </div>
            <button onClick={fetchMaterialIndents} style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 12px', fontSize: 12, background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </div>

        {/* Count line */}
        <div style={{ fontSize: 13, color: '#64748b', marginTop: -8 }}>
          Showing {filteredIndents.length} group(s) · {filteredIndents.filter(i => i.status === 'PENDING_PLANT_HEAD' || i.status === 'PENDING_PLANT_HEAD_APPROVAL').length} pending
        </div>

        {/* Indent Cards */}
        {indentsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', color: '#94a3b8' }}>
            <Loader2 size={18} className="spin" /> Loading material indents…
          </div>
        ) : filteredIndents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8', background: '#fff', borderRadius: 14, border: '1px solid #e8ecf0' }}>
            <FileText size={38} style={{ marginBottom: 12, opacity: 0.25 }} />
            <div style={{ fontSize: 15, fontWeight: 700, color: '#64748b', marginBottom: 6 }}>No indent requests found</div>
            <div style={{ fontSize: 13 }}>Indents raised by the Store department will appear here.</div>
          </div>
        ) : filteredIndents.map(ind => {
          const isPending = ind.status === 'PENDING_PLANT_HEAD' || ind.status === 'PENDING_PLANT_HEAD_APPROVAL';
          const isApproved = ind.status === 'PLANT_HEAD_APPROVED';
          const isRejected = ind.status === 'PLANT_HEAD_REJECTED' || ind.status === 'RETURNED_FOR_CORRECTION';

          // Normalize line items
          const lineItems = ind.items?.length
            ? ind.items
            : [{ material: ind.material || 'Material', quantity: ind.quantity || 0, unit: ind.unit || 'Units', quantity_ordered: ind.quantity || 0 }];

          return (
            <div
              key={ind.id}
              style={{
                background: '#fff',
                border: '1px solid #e8ecf0',
                borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
              }}
            >
              {/* Card Header */}
              <div style={{ padding: '14px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Box size={16} color="#0284c7" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 14, color: '#0f172a', letterSpacing: '0.01em' }}>{ind.id}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 1 }}>{ind.reason || ind.notes || 'Purchase Indent Request'}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Requested by: <span style={{ color: '#475569', fontWeight: 600 }}>Store</span>
                  {ind.createdAt && <span style={{ marginLeft: 8, color: '#cbd5e1' }}>· {new Date(ind.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: '#f1f5f9', margin: '0 22px' }} />

              {/* Material Lines */}
              <div style={{ padding: '4px 22px' }}>
                {lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: idx < lineItems.length - 1 ? '1px solid #f1f5f9' : 'none' }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                      {item.material || item.name || 'Material'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Requested</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>
                          {item.quantity_ordered ?? item.quantity ?? 0} <span style={{ fontWeight: 500, color: '#64748b', fontSize: 12 }}>{item.unit || 'Units'}</span>
                        </div>
                      </div>
                      {isPending && (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Approve Qty ({item.unit || 'Units'})</div>
                          <input
                            id={"aq-" + ind.id.replace(/[^a-z0-9]/gi, '-') + "-" + idx}
                            type="number"
                            defaultValue={item.quantity_ordered ?? item.quantity ?? 0}
                            min="0"
                            style={{
                              width: 80, border: '1.5px solid #d1d5db', borderRadius: 7, padding: '6px 10px',
                              fontSize: 14, fontWeight: 700, textAlign: 'center', background: '#f8fafc', color: '#0f172a',
                              outline: 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Approved/Rejected badge */}
              {(isApproved || isRejected) && (
                <div style={{ margin: '0 22px 14px', padding: '9px 14px', borderRadius: 8, background: isApproved ? '#f0fdf4' : '#fff7ed', fontSize: 13, color: isApproved ? '#15803d' : '#c2410c', border: '1px solid ' + (isApproved ? '#bbf7d0' : '#fed7aa') }}>
                  {isApproved ? '✓ Approved' : '↩ Returned for Correction'}
                  {(ind.plantHeadRemarks || ind.rejectionReason) && <span style={{ marginLeft: 8, fontWeight: 400 }}>— {ind.plantHeadRemarks || ind.rejectionReason}</span>}
                </div>
              )}

              {/* Footer Actions */}
              {isPending && (
                <div style={{ padding: '12px 22px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fafafa' }}>
                  <button
                    style={{ background: 'transparent', color: '#f59e0b', border: '1.5px solid #f59e0b', borderRadius: 8, padding: '8px 18px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                    onClick={() => handleRejectIndent(ind)}
                  >
                    Return for Correction
                  </button>
                  <button
                    style={{ background: '#c8f135', color: '#1a2e05', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                    onClick={() => {
                      const approvedItems = lineItems.map((item, idx) => {
                        const safeId = 'aq-' + ind.id.replace(/[^a-z0-9]/gi, '-') + '-' + idx;
                        return {
                          ...item,
                          quantity_ordered: Number(document.getElementById(safeId)?.value) || item.quantity_ordered || item.quantity || 0
                        };
                      });
                      Swal.fire({
                        title: 'Approval Remarks',
                        input: 'textarea',
                        inputPlaceholder: 'Optional remarks for Finance team...',
                        showCancelButton: true,
                        confirmButtonText: 'Sign & Release',
                        confirmButtonColor: '#22c55e',
                      }).then(result => {
                        if (result.isConfirmed) {
                          approvePurchaseIndent(ind.id, result.value || 'Approved by Plant Head');
                          apiClient.patch('/plant-head/material-indents/' + ind.id + '/approve', {
                            items: approvedItems, remarks: result.value
                          }).catch(() => {});
                          showToast?.('Indent approved and sent to Finance.');
                          fetchMaterialIndents();
                        }
                      });
                    }}
                  >
                    Sign & Release Materials
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  `;

content = content.substring(0, startIdx) + newFn + content.substring(endIdx);
fs.writeFileSync(path, content);
console.log('renderMaterialIndents rewritten to match screenshot UI!');
