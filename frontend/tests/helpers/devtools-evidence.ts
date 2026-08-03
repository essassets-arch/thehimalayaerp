import { Page, CDPSession } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Chrome DevTools Protocol (CDP) Evidence Capture Helper
 * Captures console, network requests, responses, page errors, performance, redacted cookies/storage per test.
 */

export interface DevToolsEvidence {
  consoleLogs: Array<{ type: string; text: string; timestamp: string }>;
  pageErrors: Array<{ message: string; stack?: string }>;
  networkRequests: Array<{ url: string; method: string; timestamp: string }>;
  networkResponses: Array<{ url: string; status: number; mimeType: string }>;
  failedRequests: Array<{ url: string; status?: number; errorText?: string }>;
  cookiesRedacted: Array<{ name: string; domain: string; httpOnly: boolean; secure: boolean; sameSite: string }>;
  performanceMetrics: Record<string, number>;
}

export class DevToolsEvidenceCollector {
  private page: Page;
  private cdpSession: CDPSession | null = null;
  private evidence: DevToolsEvidence = {
    consoleLogs: [],
    pageErrors: [],
    networkRequests: [],
    networkResponses: [],
    failedRequests: [],
    cookiesRedacted: [],
    performanceMetrics: {},
  };

  constructor(page: Page) {
    this.page = page;
  }

  public async startCapture() {
    // 1. Hook Playwright Page Events
    this.page.on('console', (msg) => {
      this.evidence.consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
      });
    });

    this.page.on('pageerror', (err) => {
      this.evidence.pageErrors.push({
        message: err.message,
        stack: err.stack,
      });
    });

    this.page.on('request', (req) => {
      this.evidence.networkRequests.push({
        url: req.url(),
        method: req.method(),
        timestamp: new Date().toISOString(),
      });
    });

    this.page.on('response', (res) => {
      this.evidence.networkResponses.push({
        url: res.url(),
        status: res.status(),
        mimeType: res.headers()['content-type'] || 'unknown',
      });
      if (res.status() >= 400) {
        this.evidence.failedRequests.push({
          url: res.url(),
          status: res.status(),
          errorText: `HTTP Status ${res.status()}`,
        });
      }
    });

    // 2. Hook Chrome DevTools Protocol Session if Chromium
    try {
      this.cdpSession = await this.page.context().newCDPSession(this.page);
      await this.cdpSession.send('Performance.enable');
      await this.cdpSession.send('Network.enable');
    } catch {
      // CDP not supported or non-Chromium browser project; Playwright listeners still active
    }
  }

  public async stopAndSave(moduleName: string, testId: string) {
    if (this.cdpSession) {
      try {
        const perfMetrics = await this.cdpSession.send('Performance.getMetrics');
        perfMetrics.metrics.forEach((m) => {
          this.evidence.performanceMetrics[m.name] = m.value;
        });

        const cookies = await this.page.context().cookies();
        this.evidence.cookiesRedacted = cookies.map((c) => ({
          name: c.name,
          domain: c.domain,
          httpOnly: c.httpOnly,
          secure: c.secure,
          sameSite: c.sameSite,
        }));
      } catch {}
    }

    const outputDir = path.resolve(__dirname, `../../docs/phase-f-triple-plus/logs/${moduleName}/${testId}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(path.join(outputDir, 'console.json'), JSON.stringify(this.evidence.consoleLogs, null, 2));
    fs.writeFileSync(path.join(outputDir, 'page-errors.json'), JSON.stringify(this.evidence.pageErrors, null, 2));
    fs.writeFileSync(path.join(outputDir, 'requests.json'), JSON.stringify(this.evidence.networkRequests, null, 2));
    fs.writeFileSync(path.join(outputDir, 'responses.json'), JSON.stringify(this.evidence.networkResponses, null, 2));
    fs.writeFileSync(path.join(outputDir, 'failed-requests.json'), JSON.stringify(this.evidence.failedRequests, null, 2));
    fs.writeFileSync(path.join(outputDir, 'cookies-redacted.json'), JSON.stringify(this.evidence.cookiesRedacted, null, 2));
    fs.writeFileSync(path.join(outputDir, 'performance.json'), JSON.stringify(this.evidence.performanceMetrics, null, 2));
  }
}
