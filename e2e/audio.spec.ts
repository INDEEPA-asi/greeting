import { chromium, expect, test } from '@playwright/test';

test('starts music on page open when autoplay is permitted and respects the off switch', async ({ baseURL }) => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ baseURL });
    await page.goto('/');
    const music = page.locator('audio').first();
    await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Music on' }).click();
    await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.paused)).toBe(true);
    await page.getByRole('button', { name: 'Music settings' }).click();
    await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.paused)).toBe(true);
  } finally {
    await browser.close();
  }
});

test('starts music on the first click when autoplay is blocked and navigates without Web Animations', async ({ baseURL }) => {
  const browser = await chromium.launch({ args: ['--autoplay-policy=document-user-activation-required'] });
  try {
    const page = await browser.newPage({ baseURL });
    await page.addInitScript(() => {
      Object.defineProperty(Element.prototype, 'animate', { configurable: true, value: undefined });
    });
    await page.goto('/');
    const music = page.locator('audio').first();
    await expect(music).toHaveAttribute('src', '/audio/rose-garden.wav');
    await expect(page.getByRole('button', { name: 'Music off' })).toBeVisible();
    await page.getByRole('button', { name: 'Enter Our Garden' }).click();
    const heading = page.getByRole('heading', { name: 'Happy Birthday, My Love' });
    await expect(heading).toBeFocused();
    await expect.poll(() => music.evaluate((node: HTMLAudioElement) => node.currentTime)).toBeGreaterThan(0);
  } finally {
    await browser.close();
  }
});
