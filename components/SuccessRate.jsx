import { ArrowUpRight, ArrowUp } from 'lucide-react';

export default function SuccessRate({ value = '52%', trend = '+10%', onDetailsClick }) {
  return (
    <div className="app-card success-card">
      <div className="card-top-bar">
        <h2 className="card-heading">Success Rate</h2>
        <button 
          className="card-top-icon-btn" 
          id="successDetailsBtn"
          onClick={() => onDetailsClick('Success Details', 'Calculating complete success metrics...')}
        >
          <ArrowUpRight size={14} strokeWidth={2.5} />
        </button>
      </div>
      
      <div className="gauge-container">
        <svg width="150" height="90" viewBox="0 0 150 90">
          <defs>
            <mask id="gaugeMask">
              <path 
                d="M15,80 A60,60 0 0,1 135,80" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="12"
                strokeLinecap="round" 
                strokeDasharray="188.4" 
                strokeDashoffset="90.43" 
              />
            </mask>
          </defs>
          
          {/* Track shadow segments */}
          <path 
            d="M15,80 A60,60 0 0,1 135,80" 
            fill="none" 
            stroke="#eaeaea" 
            strokeWidth="12"
            strokeLinecap="round" 
            strokeDasharray="6 3" 
          />
          
          {/* Filled yellow segments */}
          <path 
            d="M15,80 A60,60 0 0,1 135,80" 
            fill="none" 
            stroke="#f6c444" 
            strokeWidth="12"
            strokeLinecap="round" 
            strokeDasharray="6 3" 
            mask="url(#gaugeMask)" 
          />
        </svg>
        
        <div className="gauge-center-box">
          <span className="gauge-value-text" id="gaugeVal">{value}</span>
          <span className="gauge-trend-indicator">
            <ArrowUp size={10} strokeWidth={3} />
            <span>{trend}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
