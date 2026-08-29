# Himalaya ERP V2 — Responsive Component Architecture & Developer Guide

---

## 1. Core Component Patterns

### 1.1 Page Container & Header Cards
```jsx
// Standard page wrapper pattern
<div className="erp-page-container">
  <div className="erp-header-card">
    <div className="erp-header-title-group">
      <h1 className="erp-header-title">
        <Icon className="text-primary" size={20} />
        Page Title
      </h1>
      <p className="erp-header-subtitle">Detailed description of this workflow</p>
    </div>
    <div className="erp-page-actions">
      <button className="erp-btn erp-btn-primary">Primary Action</button>
    </div>
  </div>
</div>
```

**Key Responsive Rules**:
- `erp-page-container` automatically adjusts padding (`12px` on mobile, `16px` on tablet, `24px` on desktop).
- `erp-header-card` reflows from row (`flex-row`) to column (`flex-col`) on `< 640px`.

---

### 1.2 KPI & Stat Cards
```jsx
// Responsive Stat Grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
  {stats.map(s => (
    <div key={s.id} className="erp-stat-card">
      <span className="text-xs text-muted-foreground">{s.label}</span>
      <div className="text-xl md:text-2xl font-bold text-foreground">{s.value}</div>
    </div>
  ))}
</div>
```

---

### 1.3 Data Tables (Table-Responsive Pattern)
```jsx
// Always enclose tables in an overflow container
<div className="w-full overflow-x-auto rounded-xl border border-[#DCE5F0] bg-white shadow-sm -webkit-overflow-scrolling-touch">
  <table className="w-full min-w-[640px] text-sm text-left border-collapse">
    <thead className="bg-[#F5FAFE] text-[#526580] text-xs uppercase tracking-wider">
      <tr>
        <th className="py-3 px-4">Order ID</th>
        <th className="py-3 px-4">Customer</th>
        <th className="py-3 px-4">Amount</th>
        <th className="py-3 px-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-[#E9EEF5]">
      {rows.map(row => (
        <tr key={row.id} className="hover:bg-[#F8FAFC]">
          <td className="py-3 px-4 font-semibold text-[#24345C]">{row.id}</td>
          <td className="py-3 px-4 text-[#334155]">{row.customer}</td>
          <td className="py-3 px-4">{row.amount}</td>
          <td className="py-3 px-4 text-right">
            <button className="erp-btn-sm erp-btn-secondary">View</button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

### 1.4 Forms & Filter Toolbars
```jsx
// Filter Toolbar with Responsive Wrapping
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 w-full">
  <div className="flex flex-1 items-center gap-2 max-w-full sm:max-w-md">
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
      <input 
        type="text" 
        className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg"
        placeholder="Search..." 
      />
    </div>
  </div>
  
  <div className="flex flex-wrap items-center gap-2">
    <select className="text-sm border rounded-lg px-3 py-2">
      <option>All Statuses</option>
    </select>
    <button className="erp-btn erp-btn-primary w-full sm:w-auto">
      Filter
    </button>
  </div>
</div>
```

---

### 1.5 Modals & Dialogs
```jsx
// Responsive Modal Content Pattern
<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
  <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-4 border-b">
      <h3 className="text-base font-bold text-foreground">Modal Title</h3>
      <button className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
        <X size={18} />
      </button>
    </div>
    
    {/* Scrollable Body */}
    <div className="flex-1 overflow-y-auto p-5 space-y-4">
      {children}
    </div>
    
    {/* Footer */}
    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 px-5 py-4 border-t bg-slate-50">
      <button className="w-full sm:w-auto erp-btn erp-btn-secondary">Cancel</button>
      <button className="w-full sm:w-auto erp-btn erp-btn-primary">Save Changes</button>
    </div>
  </div>
</div>
```

---

## 2. Anti-Patterns to Avoid

| ❌ Anti-Pattern | ✅ Approved Solution |
| :--- | :--- |
| `width: 800px` on modals | `width: min(92vw, 800px); max-height: 90vh;` |
| `min-width: 500px` on filter bars | `min-w-0 w-full` with `flex-wrap: wrap` |
| `grid-template-columns: repeat(4, 1fr)` without media queries | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` |
| Multi-column tables directly inside a `<div>` without overflow | `<div className="w-full overflow-x-auto"><table>...</table></div>` |
| Fixed pixel `height: 450px` on Recharts charts | `<ResponsiveContainer width="100%" height={320}>` |
| `whitespace-nowrap` on long text columns | `truncate max-w-[200px]` with tooltip or line clamping |
| `width: 100vw` inside nested containers | `width: 100%; max-width: 100%;` |
