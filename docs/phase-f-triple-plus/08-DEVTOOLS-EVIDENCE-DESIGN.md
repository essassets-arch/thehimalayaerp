# Phase F+++ — 08 Chrome DevTools Evidence Capture Design Report

## Status: VERIFIED & IMPLEMENTED

## Overview

The `DevToolsEvidenceCollector` helper (`frontend/tests/helpers/devtools-evidence.ts`) leverages the Chrome DevTools Protocol (CDP) and Playwright network instrumentation to capture complete runtime evidence for every browser workflow test.

---

## Artifact Output Structure

Per test execution, logs are written to:

`docs/phase-f-triple-plus/logs/<module>/<test-id>/`

```text
logs/
└── sales/
    └── LEAD-QUAL-001/
        ├── console.json
        ├── page-errors.json
        ├── requests.json
        ├── responses.json
        ├── failed-requests.json
        ├── cookies-redacted.json
        ├── storage-redacted.json
        └── performance.json
```

---

## Captured Evidence Fields

| Log File | Source | Captured Data | Secret Redaction |
|----------|--------|---------------|------------------|
| `console.json` | `page.on('console')` | Console log/warn/error text & timestamps | Redacts passwords, JWTs, auth tokens |
| `page-errors.json` | `page.on('pageerror')` | Uncaught JS exceptions & stack trace | Raw stack preserved, credentials masked |
| `requests.json` | `page.on('request')` | Request URL, HTTP method, timestamp | Redacts query string secrets & Bearer headers |
| `responses.json` | `page.on('response')` | Response URL, HTTP status code, MIME type | No secret response payloads logged |
| `failed-requests.json` | `page.on('response')` | Filtered HTTP status >= 400 | Pinpoints API errors immediately |
| `cookies-redacted.json` | `CDP / context.cookies()` | Cookie name, domain, HttpOnly, Secure, SameSite | Omits raw secret cookie values |
| `performance.json` | CDP `Performance.getMetrics` | Layout shifts, JS heap size, FCP, LCP timing | Metric counts only |

---

## Test Failure Rules Triggered by DevTools Evidence
1. **Console Errors**: Unhandled console errors fail the test.
2. **Page Errors**: `pageerror` event immediately fails the test.
3. **HTTP 5xx Server Errors**: Any backend API 500 status fails the test.
4. **Hydration Errors**: Next.js hydration error text fails the test.
