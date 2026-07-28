import React, { useContext } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import { Calendar, ChevronDown } from 'lucide-react';

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'this_quarter', label: 'This Quarter' },
  { value: 'last_quarter', label: 'Last Quarter' },
  { value: 'this_year', label: 'This Year (FY)' },
  { value: 'last_year', label: 'Last Year (FY)' },
  { value: 'custom', label: 'Custom Range' },
];

const REGION_OPTIONS = ['All Regions', 'North', 'South', 'East', 'West', 'Central'];
const CATEGORY_OPTIONS = ['All Categories', 'Tiles', 'Bricks', 'Blocks', 'Cement', 'Kerb'];
const EMPLOYEE_OPTIONS = ['All Employees', 'My Team', 'Top Performers'];

const SalesAnalyticsFilters = () => {
  const { filters, setFilters } = useContext(SalesAnalyticsContext);

  const update = (key, val) => setFilters(f => ({ ...f, [key]: val }));

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      {/* Period */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Calendar size={13} style={{ position: 'absolute', left: '10px', color: '#5E6B82', pointerEvents: 'none' }} />
        <select value={filters.period} onChange={e => update('period', e.target.value)}
          style={{ paddingLeft: '28px', paddingRight: '28px', paddingTop: '8px', paddingBottom: '8px', background: 'var(--color-card-bg, #fff)', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '12.5px', color: 'var(--color-text-primary)', fontWeight: '700', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
          {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={13} style={{ position: 'absolute', right: '10px', color: '#5E6B82', pointerEvents: 'none' }} />
      </div>

      {/* Custom date range */}
      {filters.period === 'custom' && (
        <>
          <input type="date" value={filters.dateFrom} onChange={e => update('dateFrom', e.target.value)}
            style={{ padding: '8px 10px', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', background: 'var(--color-card-bg, #fff)' }} />
          <span style={{ color: '#8893A7', fontSize: '12px' }}>to</span>
          <input type="date" value={filters.dateTo} onChange={e => update('dateTo', e.target.value)}
            style={{ padding: '8px 10px', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', background: 'var(--color-card-bg, #fff)' }} />
        </>
      )}

      {/* Separator */}
      <div style={{ width: '1px', height: '28px', background: 'var(--color-border)' }} />

      {/* Region */}
      <select value={filters.region} onChange={e => update('region', e.target.value)}
        style={{ padding: '8px 12px', background: 'var(--color-card-bg, #fff)', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: '600', cursor: 'pointer' }}>
        {REGION_OPTIONS.map(r => <option key={r}>{r}</option>)}
      </select>

      {/* Category */}
      <select value={filters.category} onChange={e => update('category', e.target.value)}
        style={{ padding: '8px 12px', background: 'var(--color-card-bg, #fff)', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: '600', cursor: 'pointer' }}>
        {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
      </select>

      {/* Employee */}
      <select value={filters.employee} onChange={e => update('employee', e.target.value)}
        style={{ padding: '8px 12px', background: 'var(--color-card-bg, #fff)', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: '600', cursor: 'pointer' }}>
        {EMPLOYEE_OPTIONS.map(e => <option key={e}>{e}</option>)}
      </select>

      {/* Clear */}
      <button
        onClick={() => setFilters({ period: 'this_month', region: 'All Regions', category: 'All Categories', employee: 'All Employees', dateFrom: '', dateTo: '' })}
        style={{ padding: '8px 14px', background: 'none', border: '1.5px solid var(--color-border)', borderRadius: '8px', fontSize: '12px', color: '#5E6B82', cursor: 'pointer', fontWeight: '600', transition: 'all 0.15s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#337a86'; e.currentTarget.style.color = '#337a86'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = '#5E6B82'; }}>
        Reset
      </button>
    </div>
  );
};

export default SalesAnalyticsFilters;
