import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { strFromU8, unzipSync } from 'fflate';

const editorUrl = 'http://localhost:4174/personalize';

test.use({ reducedMotion: 'reduce' });

test('personalizes and previews the story, then exports only attached media still in use', async ({ page }) => {
  const photo = await readFile('public/images/decorations/bouquet-small.webp');
  const recording = await readFile('public/audio/rose-garden.wav');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(editorUrl);
  const sections = page.getByRole('navigation', { name: 'Personalization sections' });
  await page.getByLabel('Her name').fill('Example Recipient');
  await page.getByLabel('Your name').fill('Example Sender');
  await page.getByLabel('Show the demo label').uncheck();
  await sections.getByRole('button', { name: 'Photos' }).click();
  await expect(page.getByRole('heading', { name: 'Photos', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Remove sample photos' }).click();
  await page.getByLabel('Add scrapbook photos').setInputFiles([
    { name: 'Garden afternoon.webp', mimeType: 'image/webp', buffer: photo },
    { name: 'Unused photo.webp', mimeType: 'image/webp', buffer: photo },
  ]);
  await page.getByRole('button', { name: 'Remove photo 2' }).click();
  const scrapbook = page.getByRole('article').first();
  await scrapbook.getByLabel('Alt text').fill('Pink roses on ivory cloth');
  await scrapbook.getByLabel('Caption').fill('A garden afternoon');
  await scrapbook.getByLabel('Date or date label').fill('A summer afternoon');
  await expect(scrapbook.locator('img')).toHaveAttribute('src', /^blob:/);
  await page.getByLabel('Choose finale photo').setInputFiles({ name: 'Finale.webp', mimeType: 'image/webp', buffer: photo });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await sections.getByRole('button', { name: 'Messages' }).click();
  await page.getByRole('button', { name: 'Add paragraph' }).click();
  await page.getByRole('textbox', { name: 'Paragraph 4', exact: true }).fill('A new note for the birthday letter.');
  await sections.getByRole('button', { name: 'Gifts' }).click();
  const firstGift = page.getByRole('article').first();
  await firstGift.getByLabel('Gift type').selectOption('voice');
  await firstGift.getByLabel('Choose voice note').setInputFiles({ name: 'Birthday voice.wav', mimeType: 'audio/wav', buffer: recording });
  await page.getByRole('button', { name: 'Preview story' }).click();
  await expect(page.getByRole('heading', { name: 'Check these fields' })).toBeVisible();
  await firstGift.getByLabel('Transcript').fill('A birthday recording with a short note.');
  await sections.getByRole('button', { name: 'Music' }).click();
  await page.getByLabel('Add music tracks').setInputFiles({ name: 'Garden song.wav', mimeType: 'audio/wav', buffer: recording });
  await page.getByLabel('Starting track').selectOption({ label: 'Garden song' });

  await page.getByRole('button', { name: 'Preview story' }).click();
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.getByRole('heading', { name: 'Happy Birthday, Example Recipient' })).toBeVisible();
  await page.getByRole('button', { name: 'Blow Out the Candles' }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await page.getByRole('button', { name: /A garden afternoon/ }).click();
  await expect(page.getByRole('dialog').getByRole('img', { name: 'Pink roses on ivory cloth' })).toHaveAttribute('src', /^blob:/);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Back to editing' }).click();
  await expect(page.getByRole('button', { name: 'Preview story' })).toBeFocused();
  await expect(page.getByLabel('Starting track').locator('option:checked')).toHaveText('Garden song');

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download personalization' }).click();
  const zip = await download;
  expect(zip.suggestedFilename()).toBe('lovverse-personalization.zip');
  const file = await zip.path();
  if (!file) throw new Error('No archive was downloaded');
  const entries = unzipSync(await readFile(file));
  expect(Object.keys(entries)).toHaveLength(6);
  const configuration = strFromU8(entries['src/config/birthday.ts']);
  expect(configuration).toContain('Example Recipient');
  expect(configuration).toContain('A new note for the birthday letter.');
  expect(configuration).toContain('Pink roses on ivory cloth');
  expect(configuration).toContain('A birthday recording with a short note.');
  expect(configuration).not.toContain('blob:');
  expect(Object.keys(entries).some((path) => path.includes('unused-photo'))).toBe(false);
  expect(Object.keys(entries).filter((path) => path.startsWith('public/'))).toHaveLength(4);
  for (const [path, contents] of Object.entries(entries)) {
    if (!path.startsWith('public/')) continue;
    expect(configuration).toContain(path.slice('public'.length));
    expect(Buffer.from(contents)).toEqual(path.endsWith('.webp') ? photo : recording);
  }
});

test('keeps the development editor out of the production build', async ({ page }) => {
  await page.goto('/personalize');
  await expect(page.getByRole('heading', { name: 'Personalize your garden' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Enter Our Garden' })).toBeVisible();
});

test('exports a centered card with a portrait, wrapped names and a long multi-paragraph message', async ({ page }) => {
  const portrait = await readFile('public/images/decorations/rosebud-mobile.webp');
  type InkLine = { text: string; x: number; left: number; right: number; top: number; bottom: number };
  type InkWindow = Window & { cardInk: InkLine[] };
  await page.addInitScript(() => {
    const prototype = CanvasRenderingContext2D.prototype;
    const fillText = prototype.fillText;
    const ink: InkLine[] = [];
    (window as unknown as InkWindow).cardInk = ink;
    prototype.fillText = function (text, x, y, maxWidth) {
      if (this.canvas.width === 1200) {
        const metrics = this.measureText(text);
        ink.push({ text, x, left: x - metrics.actualBoundingBoxLeft, right: x + metrics.actualBoundingBoxRight,
          top: y - metrics.actualBoundingBoxAscent, bottom: y + metrics.actualBoundingBoxDescent });
      }
      if (maxWidth === undefined) fillText.call(this, text, x, y);
      else fillText.call(this, text, x, y, maxWidth);
    };
  });
  await page.goto(editorUrl);
  await page.getByLabel('Her name').fill('Rosalind' + 'W'.repeat(60));
  await page.getByLabel('Your name').fill('Alexandria' + 'm'.repeat(59));
  const chapters = page.getByRole('group', { name: 'Chapters to include' }).getByRole('checkbox');
  for (const chapter of (await chapters.all()).slice(0, -1)) await chapter.uncheck();
  const sections = page.getByRole('navigation', { name: 'Personalization sections' });
  await sections.getByRole('button', { name: 'Photos' }).click();
  await page.getByLabel('Choose finale photo').setInputFiles({ name: 'Portrait.webp', mimeType: 'image/webp', buffer: portrait });
  await sections.getByRole('button', { name: 'Messages' }).click();
  await page.getByLabel('Final message').fill(
    'First paragraph. ' + 'Here’s to quiet mornings, long walks, and the joy of being together. '.repeat(5)
    + '\n\nSecond paragraph. ' + 'A garden full of roses for a year full of happy memories. '.repeat(5)
    + 'The last words stay visible.',
  );
  await page.getByRole('button', { name: 'Preview story' }).click();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Birthday Card' }).click();
  const file = await (await download).path();
  if (!file) throw new Error('No card was downloaded');
  const png = await readFile(file);
  expect(png.readUInt32BE(16)).toBe(1200);
  const height = png.readUInt32BE(20);
  expect(height).toBeGreaterThan(1600);
  const ink = await page.evaluate(() => (window as unknown as InkWindow).cardInk);
  expect(ink.map(({ text }) => text).join(' ')).toContain('The last words stay visible.');
  expect(ink.length).toBeGreaterThan(15);
  ink.forEach((line, index) => {
    expect(line.x).toBe(600);
    expect(line.left).toBeGreaterThan(100);
    expect(line.right).toBeLessThan(1100);
    expect(line.top).toBeGreaterThan(index ? ink[index - 1].bottom : 55);
    expect(line.bottom).toBeLessThan(height - 75);
  });
});
