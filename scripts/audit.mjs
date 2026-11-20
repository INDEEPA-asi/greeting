import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';
import { preview } from 'vite';

const url = 'http://127.0.0.1:4175/';
const port = 9223;
const server = await preview({ preview: { host: '127.0.0.1', port: 4175, strictPort: true } });
try {
  const browser = await chromium.launch({
    channel: 'chromium',
    headless: true,
    args: [`--remote-debugging-port=${port}`, '--disable-gpu'],
  });
  try {
    const results = await lighthouse(url, { port, output: 'html', logLevel: 'error', onlyCategories: ['performance', 'accessibility'] });
    if (!results || results.lhr.runtimeError) throw new Error(results?.lhr.runtimeError?.message ?? 'No Lighthouse result.');
    await mkdir('.lighthouse', { recursive: true });
    await writeFile('.lighthouse/mobile.html', results.report);
    if (process.env.LOVVERSE_AUDIT_TRACE && results.artifacts.Trace) {
      await writeFile('.lighthouse/trace.json', JSON.stringify(results.artifacts.Trace));
    }
    const { performance, accessibility } = results.lhr.categories;
    const performanceScore = Math.round(performance.score * 100);
    const accessibilityScore = Math.round(accessibility.score * 100);
    console.log(`Mobile Lighthouse performance ${performanceScore}/100, accessibility ${accessibilityScore}/100`);
    for (const id of ['first-contentful-paint', 'largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift']) {
      console.log(`${results.lhr.audits[id].title} · ${results.lhr.audits[id].displayValue}`);
    }
    if (performanceScore < 90 || accessibilityScore < 95) process.exitCode = 1;
  } finally {
    await browser.close();
  }
} finally {
  server.httpServer.closeAllConnections();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
