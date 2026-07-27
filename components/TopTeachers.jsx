import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function TopTeachers({ teachers, onArrowClick }) {
  const [activeTab, setActiveTab] = useState('allTime'); // 'allTime' or 'thisYear'

  const activePerformers = teachers[activeTab] || [];

  return (
    <div className="app-card teachers-card">
      <div className="card-top-bar">
        <h2 className="card-heading">Top Performers</h2>
        <div className="tab-filters-row">
          <button 
            className={`filter-pill ${activeTab === 'allTime' ? 'active' : ''}`}
            onClick={() => setActiveTab('allTime')}
          >
            All Time
          </button>
          <button 
            className={`filter-pill ${activeTab === 'thisYear' ? 'active' : ''}`}
            onClick={() => setActiveTab('thisYear')}
          >
            This year
          </button>
        </div>
      </div>
      
      <div className="teachers-list" id="teachersContainer">
        {activePerformers.slice(0, 3).map((rep, index) => (
          <div key={`${rep.name}-${index}`} className="teacher-row-item">
            <div 
              className="teacher-avatar-circle" 
              style={{ background: rep.color }}
            >
              {rep.code}
            </div>
            <div className="teacher-details">
              <span className="teacher-name-text">{rep.name}</span>
              <span className="teacher-subject-text">{rep.role}</span>
            </div>
            <div 
              className="teacher-link-arrow"
              onClick={() => onArrowClick(rep.name)}
            >
              <ArrowUpRight size={10} strokeWidth={2.5} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
