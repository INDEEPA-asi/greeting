import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const next = (page: Page) => page.getByRole('button', { name: 'Next', exact: true });
const heading = (page: Page) => page.getByRole('heading', { level: 1 });
const close = (page: Page) => page.getByRole('button', { name: 'Close dialog' }).click();

async function toBirthday(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(heading(page)).toHaveText('Happy Birthday, My Love');
}

async function toGifts(page: Page) {
  await toBirthday(page);
  await page.getByRole('button', { name: 'Blow Out the Candles' }).click();
  for (const title of ['Our Garden of Memories', 'The Path We Walked', 'A Letter Among the Roses', 'The Secret Gift Pavilion']) {
    await next(page).click();
    await expect(heading(page)).toHaveText(title);
  }
}

async function toFinale(page: Page) {
  await toGifts(page);
  await next(page).click();
  await expect(heading(page)).toContainText('one wish left');
  await next(page).click();
  await expect(heading(page)).toContainText('I’d still choose you.');
}

test('full eight-chapter journey, real motion, gifts, wish and finale', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter Our Garden' }).click();
  await expect(heading(page)).toHaveText('Happy Birthday, My Love');
  await expect(heading(page)).toBeFocused();
  await expect(next(page)).toBeDisabled();
  await page.getByRole('button', { name: 'Blow Out the Candles' }).click();
  await expect(page.getByText(/countless reasons to smile/)).toBeVisible();
  await next(page).click();
  await expect(heading(page)).toHaveText('Our Garden of Memories');
  await page.getByRole('button', { name: /A handful of roses/ }).click();
  await page.getByRole('button', { name: 'Next photograph' }).click();
  await expect(page.getByText('2 / 3 · Demo photograph')).toBeVisible();
  await page.keyboard.press('Escape');
  await next(page).click();
  await expect(heading(page)).toHaveText('The Path We Walked');
  await expect(page.getByText('The day we met')).toBeVisible();
  await next(page).click();
  await expect(heading(page)).toHaveText('A Letter Among the Roses');
  await page.getByRole('button', { name: 'Open My Letter' }).click();
  await expect(page.getByRole('article', { name: 'Birthday letter' })).toContainText('deeply you are loved');
  await next(page).click();
  await expect(heading(page)).toHaveText('The Secret Gift Pavilion');
  const third = page.getByRole('button', { name: 'Open Something to Keep' });
  await expect(third).toHaveAttribute('aria-disabled', 'true');
  await page.getByRole('button', { name: 'Open A Little Promise' }).click();
  await close(page);
  await page.getByRole('button', { name: 'Open A Pocketful of Roses' }).click();
  await close(page);
  await third.click();
  await expect(page.getByRole('dialog')).toContainText('Wherever this year takes you');
  await close(page);
  await next(page).click();
  await page.getByRole('button', { name: 'Make a Wish', exact: true }).click();
  await page.getByLabel('Your wish').fill('A little wish for myself');
  await page.getByRole('button', { name: 'Release the Lantern' }).click();
  await expect(page.getByText(/May your wish find its way/)).toBeVisible();
  await next(page).click();
  await expect(heading(page)).toContainText('I’d still choose you.');
  await expect(heading(page)).toBeFocused();
  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('focuses each chapter, supports back/next and honors replay', async ({ page }) => {
    await toBirthday(page);
    await expect(page.getByRole('button', { name: 'Reduced motion on' })).toBeDisabled();
    await page.getByRole('button', { name: 'Blow Out the Candles' }).click();
    await next(page).click();
    await expect(heading(page)).toBeFocused();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(heading(page)).toHaveText('Happy Birthday, My Love');
    await expect(next(page)).toBeEnabled();
    await toFinale(page);
    await page.getByRole('button', { name: 'View Memories' }).click();
    await expect(heading(page)).toHaveText('Our Garden of Memories');
    await toFinale(page);
    await page.getByRole('button', { name: 'Replay Story' }).click();
    await expect(heading(page)).toContainText('Some stories');
    expect(await page.locator('.transition-layer').count()).toBe(0);
  });

  test('handles image and music failures and makes no request for unconfigured voice media', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => requests.push(request.url()));
    await page.route('**/audio/rose-garden.wav', (route) => route.fulfill({ status: 404, body: 'missing' }));
    await page.route('**/images/decorations/bouquet*.webp', (route) => route.fulfill({ status: 404, body: 'missing' }));
    await toGifts(page);
    await page.getByRole('button', { name: 'Music off' }).click();
    await expect(page.getByRole('status')).toContainText(/music file is unavailable|music could not play/i);
    await page.getByRole('button', { name: 'Open A Little Promise' }).click();
    await close(page);
    await page.getByRole('button', { name: 'Open A Pocketful of Roses' }).click();
    await expect(page.getByText('Photograph unavailable')).toBeVisible();
    await close(page);
    await page.getByRole('button', { name: 'Open Something to Keep' }).click();
    await expect(page.getByRole('dialog')).toContainText('Wherever this year takes you');
    const media = requests.filter((url) => /\/(audio|videos)\//.test(url));
    expect(media.length).toBeGreaterThan(0);
    expect(media.every((url) => url.endsWith('/audio/rose-garden.wav'))).toBe(true);
  });

  test('exports a valid local birthday card PNG', async ({ page }) => {
    await toFinale(page);
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Download Birthday Card' }).click();
    const file = await download;
    expect(file.suggestedFilename()).toBe('lovverse-birthday-card.png');
    const stream = await file.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const png = Buffer.concat(chunks);
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(1600);
  });

  test('passes automated accessibility rules in every chapter and a modal', async ({ page }) => {
    const check = async () => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      expect.soft(result.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })) }))).toEqual([]);
    };
    await page.goto('/');
    await check();
    await page.getByRole('button', { name: 'Skip intro' }).click();
    await expect(heading(page)).toHaveText('Happy Birthday, My Love');
    await check();
    await page.getByRole('button', { name: 'Blow Out the Candles' }).click();
    for (const title of ['Our Garden of Memories', 'The Path We Walked', 'A Letter Among the Roses', 'The Secret Gift Pavilion', 'Tonight, the garden has one wish left to keep.', 'In every lifetime,I’d still choose you.']) {
      await next(page).click();
      await expect(heading(page)).toHaveText(title);
      await check();
      if (title === 'Our Garden of Memories') {
        await page.getByRole('button', { name: /A handful of roses/ }).click();
        await check();
        await close(page);
      }
    }
  });
});

test('ignores rapid requests and can skip a running transition', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Enter Our Garden' }).evaluate((button: HTMLButtonElement) => {
    for (let i = 0; i < 12; i++) button.click();
  });
  await page.getByRole('button', { name: 'Skip transition' }).click();
  await expect(heading(page)).toHaveText('Happy Birthday, My Love');
  await expect(heading(page)).toBeFocused();
  await expect(page.locator('.transition-layer')).toHaveCount(0);
});

test('supports keyboard entry, gallery navigation, Escape and focus restoration', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to chapter' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Enter Our Garden' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(heading(page)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Blow Out the Candles' })).toBeFocused();
  await page.keyboard.press('Enter');
  await next(page).click();
  const card = page.getByRole('button', { name: /A handful of roses/ });
  await card.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('2 / 3 · Demo photograph')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();
});

test('mobile, tablet and desktop layouts avoid horizontal overflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 680 });
  await page.goto('/');
  await expect(heading(page)).toBeVisible();
  async function checkWidths() {
    for (const [width, height] of [[320, 680], [390, 844], [768, 1024], [1440, 900], [667, 375]]) {
      await page.setViewportSize({ width, height });
      expect(await page.evaluate(() => document.documentElement.scrollWidth), `page width at ${width}×${height}`).toBeLessThanOrEqual(width);
      const flap = page.locator('.letter-opened .envelope-flap');
      if (await flap.count()) {
        const flapBox = await flap.boundingBox();
        const subtitleBox = await page.locator('.letter-scene .scene-subtitle').boundingBox();
        if (!flapBox || !subtitleBox) throw new Error('Missing letter layout');
        expect(flapBox.y).toBeGreaterThan(subtitleBox.y + subtitleBox.height);
      }
    }
  }
  await checkWidths();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(heading(page)).toHaveText('Happy Birthday, My Love');
  await checkWidths();
  await page.getByRole('button', { name: 'Blow Out the Candles' }).click();
  await next(page).click();
  await expect(heading(page)).toHaveText('Our Garden of Memories');
  await page.setViewportSize({ width: 320, height: 640 });
  await page.getByRole('button', { name: /A handful of roses/ }).click();
  const modal = page.getByRole('dialog');
  const geometry = await modal.boundingBox();
  expect(geometry?.width).toBeLessThanOrEqual(320);
  expect(geometry?.height).toBeLessThanOrEqual(640);
  await close(page);
  for (const title of ['The Path We Walked', 'A Letter Among the Roses', 'The Secret Gift Pavilion', 'Tonight, the garden has one wish left to keep.', 'In every lifetime,I’d still choose you.']) {
    await next(page).click();
    await expect(heading(page)).toHaveText(title);
    if (title === 'A Letter Among the Roses') await page.getByRole('button', { name: 'Open My Letter' }).click();
    await checkWidths();
  }
});
