const fs = require('fs');
const path = 'frontend/app/globals.css';
let content = fs.readFileSync(path, 'utf8');

const target1 = `.product-picker:focus-within {
  z-index: 99999 !important;
}

.lead-product-grid {
  display: grid;
  grid-template-columns: minmax(200px, 1.2fr) 90px 120px 110px 56px;
  gap: 12px;
  align-items: start;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #DCE5F0;
  border-radius: 12px;
  position: relative;
  overflow: visible;
}

.lead-product-grid:focus-within {
  z-index: 9999 !important;
}

.lead-product-grid-spec {
  position: relative;
  overflow: visible;
}

.lead-product-grid-spec:focus-within {
  z-index: 99999 !important;
}`;

const replacement1 = `.product-picker {
  position: relative;
  overflow: visible !important;
}

.product-picker.is-open,
.product-picker[data-open="true"],
.product-picker:focus-within {
  z-index: 2147483647 !important;
}

.product-picker-dropdown {
  z-index: 2147483647 !important;
}

.lead-product-selection,
.lead-product-row,
.lead-product-grid,
.lead-product-grid-spec {
  overflow: visible !important;
}

.lead-product-selection:has(.product-picker.is-open),
.lead-product-selection:has(.product-picker:focus-within),
.lead-product-row:has(.product-picker.is-open),
.lead-product-row:has(.product-picker:focus-within),
.lead-product-grid:has(.product-picker.is-open),
.lead-product-grid:has(.product-picker:focus-within),
.lead-product-grid-spec:has(.product-picker.is-open),
.lead-product-grid-spec:has(.product-picker:focus-within),
.quotation-mobile-item-card:has(.product-picker.is-open),
.quotation-mobile-item-card:has(.product-picker:focus-within),
tr:has(.product-picker.is-open),
tr:has(.product-picker:focus-within),
.has-active-picker {
  z-index: 2147483646 !important;
  overflow: visible !important;
}

.lead-product-grid {
  display: grid;
  grid-template-columns: minmax(200px, 1.2fr) 90px 120px 110px 56px;
  gap: 12px;
  align-items: start;
  padding: 14px;
  background: #ffffff;
  border: 1px solid #DCE5F0;
  border-radius: 12px;
  position: relative;
  overflow: visible;
}

.lead-product-grid:focus-within {
  z-index: 2147483646 !important;
}

.lead-product-grid-spec {
  position: relative;
  overflow: visible !important;
  z-index: 20;
}

.lead-product-grid-spec:focus-within,
.lead-product-grid-spec:hover {
  z-index: 2147483647 !important;
}

.lead-product-qty-wrap,
.lead-product-price-wrap,
.lead-product-grid-total,
.lead-product-grid-action {
  position: relative;
  z-index: 1;
}`;

const target2 = `/* Keep the Create Lead product dropdown above the following mobile fields. */
@media (max-width: 768px) {
  .lead-product-selection,
  .lead-product-selection > div,
  .lead-product-row,
  .lead-product-grid,
  .lead-product-grid-spec,
  .lead-product-grid-spec .product-picker {
    overflow: visible !important;
  }

  .lead-product-selection:has(.product-picker:focus-within) {
    z-index: 2147483640 !important;
  }

  .lead-product-row:has(.product-picker:focus-within),
  .lead-product-grid:has(.product-picker:focus-within),
  .lead-product-grid-spec:has(.product-picker:focus-within) {
    z-index: 2147483641 !important;
  }

  .lead-product-selection .product-picker > div:last-child {
    z-index: 2147483647 !important;
  }
}`;

const replacement2 = `/* Keep the Create Lead & Quotation product dropdown above all fields on all viewports */
.lead-product-selection,
.lead-product-selection > div,
.lead-product-row,
.lead-product-grid,
.lead-product-grid-spec,
.lead-product-grid-spec .product-picker,
.quotation-mobile-item-card {
  overflow: visible !important;
}

.lead-product-selection:has(.product-picker.is-open),
.lead-product-selection:has(.product-picker:focus-within),
.quotation-mobile-item-card:has(.product-picker.is-open),
.quotation-mobile-item-card:has(.product-picker:focus-within) {
  z-index: 2147483640 !important;
}

.lead-product-row:has(.product-picker.is-open),
.lead-product-row:has(.product-picker:focus-within),
.lead-product-grid:has(.product-picker.is-open),
.lead-product-grid:has(.product-picker:focus-within),
.lead-product-grid-spec:has(.product-picker.is-open),
.lead-product-grid-spec:has(.product-picker:focus-within) {
  z-index: 2147483646 !important;
}

.lead-product-selection .product-picker-dropdown,
.lead-product-selection .product-picker > div:last-child,
.quotation-mobile-item-card .product-picker-dropdown,
.quotation-mobile-item-card .product-picker > div:last-child {
  z-index: 2147483647 !important;
}`;

let updated = content;
const norm = (s) => s.replace(/\r\n/g, '\n');

if (norm(updated).includes(norm(target1))) {
  updated = norm(updated).replace(norm(target1), replacement1);
  console.log('Replaced target 1');
} else {
  console.log('Target 1 NOT found');
}

if (norm(updated).includes(norm(target2))) {
  updated = norm(updated).replace(norm(target2), replacement2);
  console.log('Replaced target 2');
} else {
  console.log('Target 2 NOT found');
}

fs.writeFileSync(path, updated, 'utf8');
console.log('Done!');
