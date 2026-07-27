import { ChevronDown, Settings } from 'lucide-react';

export default function GrowthChart({ value = '62%', onDropdownClick, onSettingsClick }) {
  return (
    <div className="app-card growth-card">
      <div className="card-top-bar">
        <h2 className="card-heading">Growth</h2>
        <button 
          className="card-dropdown-pill" 
          id="growthDropdown"
          onClick={() => onDropdownClick('Growth Filter', 'Changing Growth filter view')}
        >
          <span>Monthly</span>
          <ChevronDown size={10} strokeWidth={3} />
        </button>
      </div>
      
      <div className="donut-container">
        <svg className="donut-graphic" width="130" height="130" viewBox="0 0 100 100">
          <defs>
            <mask id="donutMask">
              {/* Solid mask representing progress */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="10"
                strokeLinecap="round" 
                strokeDasharray="251.2" 
                strokeDashoffset="95.45"
                transform="rotate(-90 50 50)"
              />
            </mask>
          </defs>
          
          {/* Track background ticked ring */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#eaeaea" 
            strokeWidth="10"
            strokeDasharray="3 3"
          />
          
          {/* Active progress ticked ring masked to only draw up to 62% */}
          <circle 
            cx="50" 
            cy="50" 
            r="40" 
            fill="none" 
            stroke="#a0c544" 
            strokeWidth="10"
            strokeDasharray="3 3" 
            mask="url(#donutMask)"
          />
        </svg>
        
        <div className="donut-center-info">
          <span className="donut-percentage" id="growthPercent">{value}</span>
        </div>
      </div>
      
      <div className="donut-footer">
        <span className="donut-subtext">Academy growth</span>
        <button 
          className="donut-cog-btn" 
          id="growthSettingsBtn"
          onClick={() => onSettingsClick('Growth Settings', 'Configuring Academy metrics options...')}
        >
          <Settings size={15} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
