import { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '../../lib/apiClient';

export default function ReceivableFilters({ onFilterChange, activeFilters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [localFilters, setLocalFilters] = useState(activeFilters);

  useEffect(() => {
    // Fetch customers for the dropdown
    const loadCustomers = async () => {
      try {
        const res = await apiClient.get('/v1/finance-executive/customers');
        if (res.success) {
          setCustomers(res.data);
        }
      } catch (err) {
        console.error('Failed to load customers for filters:', err);
      }
    };
    loadCustomers();
  }, []);

  const handleInputChange = (field, value) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleClearAll = () => {
    const cleared = {
      status: 'All',
      aging: 'All',
      paymentMode: 'All',
      customerId: '',
      salesExecutiveId: '',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: '',
      priority: 'All',
      search: ''
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'var(--color-sidebar-bg)', border: '1px solid var(--color-border)', borderRadius: '14px', padding: '16px', boxShadow: 'var(--shadow-card)' }}>
      {/* Search & Toggle Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search by Invoice / Customer / UTR / Order Reference..."
            value={localFilters.search || ''}
            onChange={(e) => handleInputChange('search', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 36px',
              background: 'var(--color-bg-primary)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              fontSize: '13px',
              color: 'var(--color-text-primary)',
              boxSizing: 'border-box'
            }}
          />
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}>
            <Search size={16} />
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: isOpen ? 'rgba(51, 122, 134, 0.1)' : 'var(--color-bg-primary)',
              border: `1px solid ${isOpen ? 'var(--color-accent-teal)' : 'var(--color-border)'}`,
              color: isOpen ? 'var(--color-accent-teal)' : 'var(--color-text-primary)',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Filter size={15} />
            Advanced Filters
            {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {(Object.values(localFilters).some(v => v && v !== 'All') || localFilters.search) && (
            <button
              onClick={handleClearAll}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                background: 'transparent',
                border: '1px dashed var(--color-border)',
                color: '#ef4444',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {isOpen && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          paddingTop: '16px',
          borderTop: '1px solid var(--color-border)',
          marginTop: '4px'
        }}>
          {/* Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Verification Status</label>
            <select
              value={localFilters.status || 'All'}
              onChange={(e) => handleInputChange('status', e.target.value)}
              style={selectStyle}
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Aging */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Outstanding Aging</label>
            <select
              value={localFilters.aging || 'All'}
              onChange={(e) => handleInputChange('aging', e.target.value)}
              style={selectStyle}
            >
              <option value="All">All Aging</option>
              <option value="Current">Current (Not Overdue)</option>
              <option value="1-20">1-20 Days Overdue</option>
              <option value="21-30">20-30 Days Overdue</option>
              <option value="31-45">30-45 Days Overdue</option>
              <option value="46-60">45-60 Days Overdue</option>
              <option value="61-90">60-90 Days Overdue</option>
              <option value="90+">90+ Days Overdue</option>
            </select>
          </div>

          {/* Payment Mode */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Payment Mode</label>
            <select
              value={localFilters.paymentMode || 'All'}
              onChange={(e) => handleInputChange('paymentMode', e.target.value)}
              style={selectStyle}
            >
              <option value="All">All Modes</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Priority */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Collection Priority</label>
            <select
              value={localFilters.priority || 'All'}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              style={selectStyle}
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          {/* Customer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Customer</label>
            <select
              value={localFilters.customerId || ''}
              onChange={(e) => handleInputChange('customerId', e.target.value)}
              style={selectStyle}
            >
              <option value="">All Customers</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Sales Person */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Sales Person</label>
            <input
              type="text"
              placeholder="Search by Sales Man..."
              value={localFilters.salesExecutiveId || ''}
              onChange={(e) => handleInputChange('salesExecutiveId', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Amount Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Min Amount</label>
            <input
              type="number"
              placeholder="Min ₹"
              value={localFilters.minAmount || ''}
              onChange={(e) => handleInputChange('minAmount', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Max Amount</label>
            <input
              type="number"
              placeholder="Max ₹"
              value={localFilters.maxAmount || ''}
              onChange={(e) => handleInputChange('maxAmount', e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Date Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>Start Date</label>
            <input
              type="date"
              value={localFilters.startDate || ''}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '600', uppercase: 'true' }}>End Date</label>
            <input
              type="date"
              value={localFilters.endDate || ''}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
}

const selectStyle = {
  padding: '10px 12px',
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};

const inputStyle = {
  padding: '10px 12px',
  background: 'var(--color-bg-primary)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
  fontSize: '13px',
  color: 'var(--color-text-primary)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box'
};
