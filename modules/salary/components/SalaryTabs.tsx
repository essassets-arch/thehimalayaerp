import React from 'react';

export interface TabOption {
  id: string;
  label: string;
}

interface SalaryTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
}

export function SalaryTabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  searchPlaceholder = "Search requests...",
  searchValue = "",
  onSearchChange
}: SalaryTabsProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`salary-tab whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {onSearchChange !== undefined && (
        <div className="relative w-full md:w-auto">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all"
          />
        </div>
      )}
    </div>
  );
}
