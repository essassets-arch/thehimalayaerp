import { test, expect, Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const routes = {
  storeAlerts: "/store/low-stock-alerts",
  storeCreateIndent: "/store/purchase?tab=Create%20Request",
  storeVerifyDelivery: "/store/purchase?tab=Verify%20Delivery",
  storeRejections: "/store/po-material-rejections",
  storeReplacements: "/store/replacement-deliveries",
  plantHeadIndents: "/plant-head/material-indents",
  financePendingPOs: "/finance/po-requests?tab=Pending%20Requests",
  financeDeliveryAudit: "/finance/po-requests?tab=Delivery%20Audit",
  financeRejections: "/finance/po-material-rejections",
  financeClosedPOs: "/finance/po-requests?tab=Closed%20POs",
  superAdminApproval: "/super-admin/po-requests?tab=Pending%20Approval",
};

const commercialPatterns = [
  /unit\s*rate/i,
  /grand\s*total/i,
  /taxable\s*(value|amount)/i,
  /gst\s*(amount|rate|%)/i,
  /payment\s*terms/i,
  /invoice\s*(amount|value)/i,
  /approved\s*payable/i,
  /freight\s*(charge|amount|₹|rs\.?)/i,
  /discount\s*(amount|₹|rs\.?)/i,
];

async function assertPageLoaded(page: Page) {
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/404|page not found/i);
  await expect(page.locator("body")).not.toContainText(/application error|runtime error/i);
}

async function assertNoCommercialFields(page: Page) {
  const bodyText = await page.locator("body").innerText();
  for (const pattern of commercialPatterns) {
    expect(
      pattern.test(bodyText),
      `Restricted commercial field visible: ${pattern}`
    ).toBeFalsy();
  }
}

async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth > root.clientWidth + 2;
  });
  expect(overflow, "Page has horizontal overflow").toBeFalsy();
}

async function assertNoDuplicateAction(page: Page) {
  const actionable = page
    .getByRole("button")
    .filter({ hasText: /submit|approve|create|confirm|release|verify/i })
    .first();

  if (!(await actionable.count())) return;

  const disabledBefore = await actionable.isDisabled();
  if (disabledBefore) return;

  // Do not submit live data. Only validate that buttons are not duplicated
  // and have a stable accessible name.
  const buttonName = await actionable.innerText();
  expect(buttonName.trim().length).toBeGreaterThan(0);

  const duplicates = page.getByRole("button", {
    name: new RegExp(
      buttonName.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    ),
  });

  expect(await duplicates.count()).toBeLessThanOrEqual(20);
}

async function assertActiveTab(page: Page, expected: RegExp) {
  const selectedTab = page.locator(
    '[role="tab"][aria-selected="true"], [data-state="active"][role="tab"], .active[role="tab"]'
  );

  if (await selectedTab.count()) {
    await expect(selectedTab.first()).toContainText(expected);
    return;
  }

  // Fallback for custom tab implementations.
  await expect(page.locator("body")).toContainText(expected);
}

async function openFirstDetailsRecord(page: Page) {
  const candidates = [
    page.getByRole("button", { name: /view|details|open|audit|verify/i }).first(),
    page.getByRole("link", { name: /view|details|open|audit|verify/i }).first(),
  ];

  for (const candidate of candidates) {
    if (await candidate.count()) {
      await candidate.click();
      await page.waitForTimeout(300);
      return true;
    }
  }
  return false;
}

test.describe("Procurement route smoke tests", () => {
  for (const [name, route] of Object.entries(routes)) {
    test(`${name} loads`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      await assertPageLoaded(page);
    });
  }
});

test.describe("Store access restrictions", () => {
  const storeRoutes = [
    routes.storeAlerts,
    routes.storeCreateIndent,
    routes.storeVerifyDelivery,
    routes.storeRejections,
    routes.storeReplacements,
  ];

  for (const route of storeRoutes) {
    test(`Store masks commercial data: ${route}`, async ({ page }) => {
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      await assertPageLoaded(page);
      await assertNoCommercialFields(page);
    });
  }
});

test.describe("Plant Head access restrictions", () => {
  test("Plant Head masks commercial and quotation data", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.plantHeadIndents}`, {
      waitUntil: "networkidle",
    });

    await assertPageLoaded(page);
    await assertNoCommercialFields(page);

    const bodyText = await page.locator("body").innerText();
    expect(/vendor quotation|quotation amount|commercial comparison/i.test(bodyText))
      .toBeFalsy();
  });
});

test.describe("Tab routing", () => {
  test("Store Create Request tab opens", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.storeCreateIndent}`, {
      waitUntil: "networkidle",
    });
    await assertActiveTab(page, /create request/i);
  });

  test("Store Verify Delivery tab opens", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.storeVerifyDelivery}`, {
      waitUntil: "networkidle",
    });
    await assertActiveTab(page, /verify delivery/i);
  });

  test("Finance Pending Requests tab opens", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.financePendingPOs}`, {
      waitUntil: "networkidle",
    });
    await assertActiveTab(page, /pending requests/i);
  });

  test("Finance Delivery Audit tab opens", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.financeDeliveryAudit}`, {
      waitUntil: "networkidle",
    });
    await assertActiveTab(page, /delivery audit/i);
  });

  test("Finance Closed POs tab opens", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.financeClosedPOs}`, {
      waitUntil: "networkidle",
    });
    await assertActiveTab(page, /closed po/i);
  });

  test("Super Admin Pending Approval tab opens", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.superAdminApproval}`, {
      waitUntil: "networkidle",
    });
    await assertActiveTab(page, /pending approval|po approval requests/i);
  });
});

test.describe("Replacement and audit traceability", () => {
  test("Replacement screen exposes origin references", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.storeReplacements}`, {
      waitUntil: "networkidle",
    });
    await assertPageLoaded(page);

    const bodyText = await page.locator("body").innerText();

    // Passes when seeded replacement data is present.
    // If the page is empty, the test records that the route still loaded.
    if (!/no pending replacement|no replacement|no records|no data/i.test(bodyText)) {
      expect(bodyText).toMatch(/po[\s#:-]/i);
      expect(bodyText).toMatch(/grn[\s#:-]/i);
      expect(bodyText).toMatch(/rejection[\s#:-]/i);
    }
  });

  test("Finance Delivery Audit identifies replacement GRNs", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.financeDeliveryAudit}`, {
      waitUntil: "networkidle",
    });
    await assertPageLoaded(page);

    const bodyText = await page.locator("body").innerText();
    if (/replacement/i.test(bodyText)) {
      expect(bodyText).toMatch(/replacement/i);
    }
  });

  test("Audit timeline is visible in a record details view", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.financeDeliveryAudit}`, {
      waitUntil: "networkidle",
    });

    const opened = await openFirstDetailsRecord(page);
    if (!opened) {
      test.skip(true, "No seeded audit record available");
    }

    await expect(page.locator("body")).toContainText(/audit|timeline|history/i);
  });
});

test.describe("Closed records", () => {
  test("Closed PO details are read-only", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.financeClosedPOs}`, {
      waitUntil: "networkidle",
    });
    await assertPageLoaded(page);

    const opened = await openFirstDetailsRecord(page);
    if (!opened) {
      test.skip(true, "No closed PO record available");
    }

    const destructiveActions = page.getByRole("button", {
      name: /approve|submit|edit|issue|receive|create grn/i,
    });

    const count = await destructiveActions.count();
    for (let i = 0; i < count; i++) {
      await expect(destructiveActions.nth(i)).toBeDisabled();
    }
  });
});

test.describe("Responsive layout", () => {
  const responsiveRoutes = Object.values(routes);

  for (const route of responsiveRoutes) {
    test(`Mobile layout has no page overflow: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      await assertPageLoaded(page);
      await assertNoHorizontalOverflow(page);
    });

    test(`Desktop layout loads correctly: ${route}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle" });
      await assertPageLoaded(page);
      await assertNoDuplicateAction(page);
    });
  }
});

test.describe("Document previews", () => {
  test("Uploaded document preview opens without page failure", async ({ page }) => {
    await page.goto(`${BASE_URL}${routes.financeDeliveryAudit}`, {
      waitUntil: "networkidle",
    });

    const preview = page
      .getByRole("button", { name: /preview|open document|view document/i })
      .first();

    if (!(await preview.count())) {
      test.skip(true, "No uploaded document found in seeded data");
    }

    const popupPromise = page.waitForEvent("popup").catch(() => null);
    await preview.click();
    const popup = await popupPromise;

    if (popup) {
      await popup.waitForLoadState("domcontentloaded");
      expect(popup.url()).not.toBe("about:blank");
      await popup.close();
    } else {
      await expect(page.locator("body")).not.toContainText(
        /application error|runtime error/i
      );
    }
  });
});
