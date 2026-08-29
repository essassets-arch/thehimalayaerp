# Himalaya ERP V2 — Responsive Test Matrix & Verification Protocols

---

## 1. Test Viewports & Devices

| Device Profile | Dimensions (W × H) | Pixel Ratio | Operating System / Browser | Test Category |
| :--- | :--- | :--- | :--- | :--- |
| **iPhone SE (1st/2nd Gen)** | `320 × 568` | 2.0 | iOS / Mobile Safari (Chromium emulated) | Mobile Compact |
| **Galaxy S22 / S23** | `360 × 800` | 3.0 | Android / Chrome | Mobile Standard |
| **iPhone 13 / 14 / 15 Pro**| `390 × 844` | 3.0 | iOS / Safari | Mobile Modern iOS |
| **Pixel 7 / 8 / Galaxy S23 Ultra** | `412 × 915` | 3.5 | Android / Chrome | Mobile Large Android |
| **iPad Mini / 7" Android Tablet** | `600 × 960` | 2.0 | Android/iOS | Tablet Compact |
| **iPad 9.7" / iPad Air (Portrait)** | `768 × 1024` | 2.0 | iOS / Safari | Tablet Portrait |
| **iPad Air / Pro (Landscape)** | `1024 × 768` | 2.0 | iOS / Safari | Tablet Landscape |
| **HD Laptop Display** | `1280 × 720` | 1.0 | Desktop Chrome / Edge | Desktop Baseline |
| **Standard Laptop (MacBook Pro)** | `1440 × 900` | 2.0 | Desktop Safari / Chrome | Desktop Regression |
| **Full HD Monitor** | `1920 × 1080`| 1.0 | Desktop Chrome | Desktop High-Res |

---

## 2. Automated Test Suite Specifications

The automated test suite in `tests/responsive/` validates the following criteria on every route:

### Test Suite 1: Overflow Detection (`overflow.spec.ts`)
```typescript
test('No horizontal page overflow on mobile', async ({ page }) => {
  const isOverflowing = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth ||
           document.body.scrollWidth > document.body.clientWidth;
  });
  expect(isOverflowing).toBe(false);
});
```

### Test Suite 2: Navigation Drawer & Header (`navigation.spec.ts`)
- Hamburger menu button is visible on `< 1024px`.
- Tapping hamburger opens sidebar drawer without throwing errors.
- Drawer overlay covers screen and background scrolling is locked.
- Drawer closes when close button or overlay is clicked.
- Active route is highlighted and readable in mobile drawer.

### Test Suite 3: Table Scrollability (`tables.spec.ts`)
- Tables wider than viewport have an enclosing container with `scrollWidth > clientWidth` and `overflow-x: auto`.
- Headers and row cells do not collapse text to 0 width.
- Action buttons in rows remain clickable.

### Test Suite 4: Form Responsiveness (`forms.spec.ts`)
- Form inputs have `width: 100%` within their grid cells.
- Grid reflows to 1 column on `< 640px`.
- Form action buttons (Submit, Cancel) are visible and fully within viewport bounds.
- Minimum touch target area for inputs and buttons is `≥ 44 × 44px`.

### Test Suite 5: Modal & Dialog Containment (`modals.spec.ts`)
- Modal width does not exceed `95vw`.
- Modal close button (`X`) is within the viewport and tappable.
- Long modal content scrolls vertically inside the modal body without pushing modal footer off-screen.

### Test Suite 6: Charts Reflow (`charts.spec.ts`)
- Charts render inside `ResponsiveContainer`.
- Chart width matches parent card container width (`100%`).
- No fixed pixel widths (`width: 800px`) force parent card blowout.

---

## 3. Manual Device Validation Checklist

Before deployment, perform physical testing on:
1. **Android Phone (e.g. Samsung Galaxy, Google Pixel)**:
   - Verify keyboard appearance does not permanently obscure form submit buttons.
   - Verify smooth touch scrolling on wide data tables.
   - Verify biometric punch button in HeroBanner works smoothly.
2. **iPhone (iOS Safari)**:
   - Check bottom home indicator safe-area padding.
   - Verify elastic overscroll does not expose unstyled layout background.
   - Test modal drawer animations and backdrop blur.
3. **iPad / Tablet**:
   - Verify transition between portrait (`768px`) and landscape (`1024px`) orientations.
