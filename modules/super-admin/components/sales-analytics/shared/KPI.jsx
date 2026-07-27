import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const KPI = ({
  title,
  value,
  prefix = '',
  suffix = '',
  trend,
  trendLabel = '',
  icon,
  color = '#337a86',
  // Legacy props support
  subtext,
  growth,
  growthType,
  borderLeft = true
}) => {
  // Resolve trend value — accept both 'trend' (new) and 'growth' (legacy)
  const trendVal = trend !== undefined ? trend : (typeof growth === 'number' ? growth : null);
  const trendDesc = trendLabel || subtext || '';

  const isPositive = trendVal > 0;
  const isNegative = trendVal < 0;
  const trendColor = isPositive ? '#16a34a' : isNegative ? '#ef4444' : '#8893A7';

  const TrendIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  return (
    <div
      className="app-card"
      style={{
        padding: '16px 20px',
        borderLeft: borderLeft ? `4px solid ${color}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Background accent */}
      <div style={{ position: 'absolute', top: '-12px', right: '-12px', width: '64px', height: '64px', borderRadius: '50%', background: `${color}12`, pointerEvents: 'none' }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: '1.3' }}>
          {title}
        </span>
        {icon && (
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--color-text-primary)', marginTop: '8px', letterSpacing: '-0.5px' }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
      </div>

      {/* Trend row */}
      {(trendVal !== null || trendDesc) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
          {trendVal !== null && (
            <>
              <TrendIcon size={12} color={trendColor} />
              <span style={{ fontSize: '11px', fontWeight: '800', color: trendColor }}>
                {isPositive ? '+' : ''}{trendVal}%
              </span>
            </>
          )}
          {trendDesc && (
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>
              {trendDesc}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(KPI);
