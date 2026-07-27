import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const REVENUE_DATA = [
  { month: 'Apr', value: '$1,350', height: '45%' },
  { month: 'May', value: '$1,650', height: '55%' },
  { month: 'Jun', value: '$2,100', height: '70%' },
  { month: 'Jul', value: '$2,980', height: '100%' }, // active by default
  { month: 'Aug', value: '$2,760', height: '92%' },
  { month: 'Sep', value: '$2,400', height: '80%' },
  { month: 'Oct', value: '$2,250', height: '75%' },
  { month: 'Nov', value: '$1,950', height: '65%' },
  { month: 'Dec', value: '$1,500', height: '50%' },
];

export default function AttendanceChart({ onDropdownClick }) {
  const [activeIndex, setActiveIndex] = useState(3); // 'Jul' is active by default

  return (
    <div className="app-card attendance-card">
      <div className="card-top-bar">
        <h2 className="card-heading">Monthly Revenue</h2>
        <button 
          className="card-dropdown-pill" 
          id="attendanceDropdown"
          onClick={() => onDropdownClick('Revenue', 'Changing Monthly Revenue view')}
        >
          <span>Monthly</span>
          <ChevronDown size={10} strokeWidth={3} />
        </button>
      </div>
      
      <div className="chart-canvas">
        <div className="chart-y-axis">
          <span>$3,000</span>
          <span>$1,500</span>
          <span>$1,000</span>
          <span>$100</span>
          <span>$0</span>
        </div>
        
        {REVENUE_DATA.map((item, index) => (
          <div key={item.month} className="bar-container">
            <div className="bar-track">
              <div 
                className={`rounded-bar ${activeIndex === index ? 'active' : ''}`} 
                style={{ height: item.height }}
                data-val={item.value}
                onMouseEnter={() => setActiveIndex(index)}
              ></div>
              <div className="bar-tooltip">{item.value}</div>
            </div>
            <span className="bar-label-month">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
