import React, { useMemo } from 'react';
import { X, ExternalLink, FileText, Calendar, Building, ShoppingBag, User, TrendingUp, MapPin, Activity, CheckCircle, Clock } from 'lucide-react';
import { getProductDetails, getCustomerDetails, getEmployeeDetails, getOrderDetails, formatCurrency } from '../../../services/salesAnalytics.service.js';

const OverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(15, 23, 42, 0.3)',
  backdropFilter: 'blur(4px)',
  zIndex: 10000,
  display: 'flex',
  justifyContent: 'flex-end',
  animation: 'fadeIn 0.25s ease-out'
};

const DrawerStyle = {
  width: '500px',
  maxWidth: '90%',
  background: '#ffffff',
  height: '100%',
  boxShadow: '-8px 0 32px rgba(15, 23, 42, 0.15)',
  display: 'flex',
  flexDirection: 'column',
  animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  color: '#334155'
};

const HeaderStyle = {
  padding: '24px',
  borderBottom: '1px solid #DCE5F0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#F5FAFE'
};

const ContentStyle = {
  padding: '24px',
  overflowY: 'auto',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
};

const SectionTitleStyle = {
  fontSize: '11px',
  fontWeight: '800',
  color: '#5E6B82',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '12px',
  borderBottom: '1.5px solid #f1f5f9',
  paddingBottom: '6px'
};

const FieldRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
  borderBottom: '1px solid #F5FAFE',
  fontSize: '13px'
};

const EntityDrawer = ({ isOpen, onClose, type, entityId }) => {
  const data = useMemo(() => {
    if (!isOpen || !type || !entityId) return null;
    try {
      if (type === 'product') return getProductDetails(entityId);
      if (type === 'customer') return getCustomerDetails(entityId);
      if (type === 'employee') return getEmployeeDetails(entityId);
      if (type === 'order') return getOrderDetails(entityId);
    } catch (e) {
      console.error(e);
    }
    return null;
  }, [isOpen, type, entityId]);

  if (!isOpen || !data) return null;

  const renderProductDetails = () => (
    <>
      <div>
        <div style={SectionTitleStyle}>📦 Product Profile</div>
        <div style={FieldRowStyle}>
          <span>SKU</span>
          <strong>{data.sku}</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Category</span>
          <span>{data.category}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Unit Price</span>
          <strong>₹{data.price?.toLocaleString()}</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Total Qty Sold</span>
          <strong>{data.qty?.toLocaleString()} units</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Revenue Generated</span>
          <strong style={{ color: '#16a34a' }}>₹{(data.revenue / 100).toFixed(2)} L</strong>
        </div>
      </div>

      <div>
        <div style={SectionTitleStyle}>🏭 Inventory Status</div>
        <div style={FieldRowStyle}>
          <span>Physical Stock</span>
          <span>{data.stock?.toLocaleString()}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Reserved (Precast)</span>
          <span>{data.reserved?.toLocaleString()}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Pending Mfg</span>
          <span>{data.pendingProduction?.toLocaleString()}</span>
        </div>
      </div>

      <div>
        <div style={SectionTitleStyle}>🗺️ Top Cities</div>
        {data.regionalSales?.map((r, i) => (
          <div key={i} style={FieldRowStyle}>
            <span>{r.city}</span>
            <strong>₹{(r.revenue / 100000).toFixed(1)}L</strong>
          </div>
        ))}
      </div>
    </>
  );

  const renderCustomerDetails = () => (
    <>
      <div>
        <div style={SectionTitleStyle}>🏢 Customer Profile</div>
        <div style={FieldRowStyle}>
          <span>Name</span>
          <strong>{data.customer}</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Industry</span>
          <span>{data.industry}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Location</span>
          <span>{data.city}, {data.state}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Last Order Date</span>
          <span>{data.lastOrder}</span>
        </div>
      </div>

      <div>
        <div style={SectionTitleStyle}>💸 Receivables & Billing</div>
        <div style={FieldRowStyle}>
          <span>Lifetime Value (LTV)</span>
          <strong style={{ color: '#16a34a' }}>₹{(data.lifetimeRevenue / 100000).toFixed(1)}L</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Total Paid</span>
          <span>₹{(data.collected / 100000).toFixed(1)}L</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Outstanding Due</span>
          <strong style={{ color: '#ef4444' }}>₹{(data.outstanding / 100000).toFixed(1)}L</strong>
        </div>
      </div>

      <div>
        <div style={SectionTitleStyle}>📄 Recent Invoices</div>
        {data.invoices?.map((inv, i) => (
          <div key={i} style={FieldRowStyle}>
            <span>{inv.invNo} ({inv.date})</span>
            <strong>₹{(inv.amount / 100000).toFixed(1)}L <span style={{ color: '#16a34a', fontSize: '11px' }}>{inv.status}</span></strong>
          </div>
        ))}
      </div>
    </>
  );

  const renderEmployeeDetails = () => (
    <>
      <div>
        <div style={SectionTitleStyle}>👤 Sales Executive</div>
        <div style={FieldRowStyle}>
          <span>Executive Name</span>
          <strong>{data.employee}</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Zone Location</span>
          <span>{data.zone}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Leads Handled</span>
          <span>{data.leads}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Conversion Rate</span>
          <strong>{data.conversion}%</strong>
        </div>
      </div>

      <div>
        <div style={SectionTitleStyle}>📈 Sales Target Performance</div>
        <div style={FieldRowStyle}>
          <span>KPI Sales Goal</span>
          <span>₹{(data.target / 100000).toFixed(1)}L</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Sales Achieved</span>
          <strong style={{ color: '#16a34a' }}>₹{(data.revenue / 1).toFixed(1)}L</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Target Achieved %</span>
          <strong style={{ color: data.achievement >= 100 ? '#16a34a' : '#ea580c' }}>{data.achievement}%</strong>
        </div>
      </div>

      <div>
        <div style={SectionTitleStyle}>📋 Recent Events</div>
        {data.activities?.map((act, i) => (
          <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid #F5FAFE', fontSize: '12.5px' }}>
            <div style={{ color: '#5E6B82', fontSize: '10.5px', marginBottom: '2px' }}>{act.date}</div>
            <div>{act.detail}</div>
          </div>
        ))}
      </div>
    </>
  );

  const renderOrderDetails = () => (
    <>
      <div>
        <div style={SectionTitleStyle}>🛒 Order Overview</div>
        <div style={FieldRowStyle}>
          <span>Order ID</span>
          <strong>{data.order}</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Client Name</span>
          <span>{data.customer}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Product SKU</span>
          <span>{data.product}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Qty Ordered</span>
          <strong>{data.qty?.toLocaleString()} units</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Total Order Value</span>
          <strong style={{ color: '#337a86' }}>₹{data.value?.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <div>
        <div style={SectionTitleStyle}>📋 Order Timeline</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '14px', borderLeft: '2px solid #DCE5F0', marginLeft: '6px' }}>
          {data.timeline?.map((step, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '-20px', top: '2px', width: '10px', height: '10px', borderRadius: '50%',
                background: step.status === 'done' ? '#16a34a' : '#D6E2F0', border: '2px solid #fff'
              }} />
              <div style={{ fontSize: '12.5px', fontWeight: '700', color: step.status === 'done' ? '#24345C' : '#5E6B82' }}>{step.label}</div>
              <div style={{ fontSize: '11px', color: '#5E6B82' }}>{step.date} — {step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div style={SectionTitleStyle}>🧾 Linked Invoice</div>
        <div style={FieldRowStyle}>
          <span>Invoice No</span>
          <strong>{data.invoice?.invNo}</strong>
        </div>
        <div style={FieldRowStyle}>
          <span>Billing Amount</span>
          <span>₹{data.invoice?.amount?.toLocaleString()}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>GST Tax (18%)</span>
          <span>₹{data.invoice?.tax?.toLocaleString()}</span>
        </div>
        <div style={FieldRowStyle}>
          <span>Gross Total</span>
          <strong>₹{data.invoice?.gross?.toLocaleString()}</strong>
        </div>
      </div>
    </>
  );

  return (
    <div style={OverlayStyle} onClick={onClose}>
      <div style={DrawerStyle} onClick={e => e.stopPropagation()}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>
        {/* Header */}
        <div style={HeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {type === 'product' && <ShoppingBag size={18} color="#337a86" />}
            {type === 'customer' && <Building size={18} color="#4f46e5" />}
            {type === 'employee' && <User size={18} color="#8b5cf6" />}
            {type === 'order' && <FileText size={18} color="#16a34a" />}
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#24345C', textTransform: 'capitalize' }}>
              {type} Profile Detail
            </h2>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#8893A7' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={ContentStyle}>
          {type === 'product' && renderProductDetails()}
          {type === 'customer' && renderCustomerDetails()}
          {type === 'employee' && renderEmployeeDetails()}
          {type === 'order' && renderOrderDetails()}
        </div>
      </div>
    </div>
  );
};

export default EntityDrawer;
