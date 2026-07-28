import { useState } from 'react';

const REVENUE_DATA = [
  { month: 'Jan', value: '$12,400', height: '40%', raw: 12400 },
  { month: 'Feb', value: '$15,800', height: '52%', raw: 15800 },
  { month: 'Mar', value: '$22,100', height: '72%', raw: 22100 },
  { month: 'Apr', value: '$18,400', height: '60%', raw: 18400 },
  { month: 'May', value: '$28,900', height: '95%', raw: 28900 },
  { month: 'Jun', value: '$31,200', height: '100%', raw: 31200 },
];

export default function SalesGraph() {
  const [hoveredIndex, setHoveredIndex] = useState(REVENUE_DATA.length - 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '240px' }}>
      <div className="chart-canvas" style={{ paddingLeft: '44px' }}>
        <div className="chart-y-axis" style={{ width: '36px' }}>
          <span>$35k</span>
          <span>$25k</span>
          <span>$15k</span>
          <span>$5k</span>
          <span>$0</span>
        </div>
        
        {REVENUE_DATA.map((item, index) => (
          <div 
            key={item.month} 
            className="bar-container"
            onMouseEnter={() => setHoveredIndex(index)}
          >
            <div className="bar-track">
              <div 
                className={`rounded-bar ${hoveredIndex === index ? 'active' : ''}`}
                style={{ 
                  height: item.height, 
                  background: hoveredIndex === index 
                    ? 'repeating-linear-gradient(-45deg, var(--color-lime-brand), var(--color-lime-brand) 4px, var(--color-lime-hover) 4px, var(--color-lime-hover) 8px)'
                    : 'repeating-linear-gradient(-45deg, #DCE5F0, #DCE5F0 4px, #D6E2F0 4px, #D6E2F0 8px)',
                  border: hoveredIndex === index ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(226, 232, 240, 0.2)'
                }}
              ></div>
              <div className="bar-tooltip" style={{ bottom: 'calc(100% + 4px)' }}>{item.value}</div>
            </div>
            <span className="bar-label-month">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
