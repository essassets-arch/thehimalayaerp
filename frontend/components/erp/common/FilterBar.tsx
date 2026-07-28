import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, X } from 'lucide-react';

interface FilterBarProps {
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

export function FilterBar({ 
  onSearch, 
  searchPlaceholder = 'Search...', 
  filters,
  onClear,
  hasActiveFilters
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
      <div className="relative w-full sm:max-w-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <Input 
          type="text" 
          placeholder={searchPlaceholder}
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9 bg-gray-50/50"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
        {filters && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500 hidden sm:block" />
            {filters}
          </div>
        )}
        
        {hasActiveFilters && onClear && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-9 px-2 text-gray-500 hover:text-gray-900">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
