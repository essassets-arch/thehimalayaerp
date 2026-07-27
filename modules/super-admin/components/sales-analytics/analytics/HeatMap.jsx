import React, { useContext, useMemo } from 'react';
import { SalesAnalyticsContext } from '../../../pages/SalesAnalyticsPage.jsx';
import ChartCard from '../shared/ChartCard.jsx';
import { mockHeatMapData } from '../../../services/salesAnalytics.service.js';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i === 0 ? '12AM' : i < 12 ? `${i}AM` : i === 12 ? '12PM' : `${i - 12}PM`);

const getColor = (value, max) => {
  if (value === 0) return '#F5FAFE';
  const intensity = value / max;
  if (intensity < 0.2) return '#dbeafe';
  if (intensity < 0.4) return '#93c5fd';
  if (intensity < 0.6) return '#3b82f6';
  if (intensity < 0.8) return '#1d4ed8';
  return '#24345C';
};

const HeatMap = () => {
  const { filters } = useContext(SalesAnalyticsContext);
  const data = useMemo(() => mockHeatMapData(filters), [filters]);
  const max = useMemo(() => Math.max(...data.flat(), 1), [data]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Activity Heatmap */}
      <ChartCard title="Sales Activity Heatmap (Hour × Day)" subtitle="Order/lead creation intensity by time of day and day of week">
        <div style={{ overflowX: 'auto', paddingBottom: '8px' }}>
          {/* Column Headers (Hours) */}
          <div style={{ display: 'flex', marginBottom: '4px', marginLeft: '44px' }}>
            {HOURS.map((h, i) => (
              <div key={i} style={{ width: '28px', flexShrink: 0, fontSize: '8px', color: '#8893A7', textAlign: 'center', transform: 'rotate(-45deg)', transformOrigin: 'center', marginTop: '8px' }}>{i % 3 === 0 ? h : ''}</div>
            ))}
          </div>
          {/* Rows */}
          {DAYS.map((day, dayIdx) => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '40px', fontSize: '11px', color: '#5E6B82', fontWeight: '700', textAlign: 'right', paddingRight: '8px', flexShrink: 0 }}>{day}</div>
              {(data[dayIdx] || Array(24).fill(0)).map((val, hourIdx) => (
                <div key={hourIdx}
                  title={`${day} ${HOURS[hourIdx]}: ${val} orders`}
                  style={{
                    width: '28px', height: '28px', flexShrink: 0, borderRadius: '4px',
                    background: getColor(val, max),
                    margin: '1px', cursor: 'default', transition: 'transform 0.15s',
                    border: '1px solid rgba(0,0,0,0.04)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.3)'; e.currentTarget.style.zIndex = '10'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.zIndex = '1'; e.currentTarget.style.boxShadow = 'none'; }}
                />
              ))}
            </div>
          ))}
          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', marginLeft: '44px' }}>
            <span style={{ fontSize: '10px', color: '#8893A7' }}>Less</span>
            {['#F5FAFE','#dbeafe','#93c5fd','#3b82f6','#1d4ed8','#24345C'].map((c, i) => (
              <div key={i} style={{ width: '16px', height: '16px', borderRadius: '3px', background: c, border: '1px solid rgba(0,0,0,0.08)' }} />
            ))}
            <span style={{ fontSize: '10px', color: '#8893A7' }}>More</span>
          </div>
        </div>
      </ChartCard>

      {/* Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
        {[
          { label: 'Peak Day', value: data.insights.peakDay, sub: 'Highest activity', color: '#337a86' },
          { label: 'Peak Hour', value: data.insights.peakHour, sub: 'Most orders placed', color: '#0284c7' },
          { label: 'Slow Period', value: data.insights.slowPeriod, sub: 'Lowest activity window', color: '#8893A7' },
          { label: 'Weekend %', value: data.insights.weekendPct + '%', sub: 'Orders on Sat/Sun', color: '#8b5cf6' },
        ].map(ins => (
          <div key={ins.label} style={{ background: '#F5FAFE', padding: '14px 18px', borderRadius: '10px', borderLeft: `4px solid ${ins.color}` }}>
            <div style={{ fontSize: '11px', fontWeight: '800', color: '#5E6B82', textTransform: 'uppercase', marginBottom: '6px' }}>{ins.label}</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: ins.color }}>{ins.value}</div>
            <div style={{ fontSize: '11px', color: '#8893A7', marginTop: '4px' }}>{ins.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly Heatmap */}
      <ChartCard title="Monthly Sales Calendar" subtitle="Daily revenue intensity over the current month">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', padding: '8px 0' }}>
          {data.monthCalendar.map((day, idx) => (
            <div key={idx}
              title={`${day.date}: ₹${day.revenue}L`}
              style={{
                width: '36px', height: '36px', borderRadius: '6px',
                background: getColor(day.revenue, data.maxDailyRevenue),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', color: day.revenue > data.maxDailyRevenue * 0.5 ? '#fff' : '#5E6B82',
                fontWeight: '700', cursor: 'default', transition: 'transform 0.15s',
                border: '1px solid rgba(0,0,0,0.04)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}>
              {day.day}
            </div>
          ))}
        </div>
        <div style={{ marginTop: '12px', fontSize: '11px', color: '#8893A7', fontStyle: 'italic' }}>
          Darker cells = Higher daily revenue. Hover for details.
        </div>
      </ChartCard>
    </div>
  );
};

export default React.memo(HeatMap);
