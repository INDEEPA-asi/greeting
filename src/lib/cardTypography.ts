const serif = '"Cormorant Garamond Variable", Georgia, serif';
const sans = '"DM Sans Variable", system-ui, sans-serif';
const handwriting = '"Caveat Variable", cursive';
const graphemes = typeof Intl.Segmenter === 'function' ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : undefined;

type Face = { family: string; weight: number; italic?: boolean; spacing: number };
export type CardText = { font: string; lines: { text: string; baseline: number }[]; height: number; width: number };

export const cardFaces = {
  label: { family: sans, weight: 650, spacing: 1.18 },
  title: { family: serif, weight: 650, spacing: 1.06 },
  name: { family: serif, weight: 650, italic: true, spacing: 1.01 },
  verse: { family: serif, weight: 620, italic: true, spacing: 1.03 },
  body: { family: serif, weight: 570, spacing: 1.27 },
  signature: { family: handwriting, weight: 650, spacing: 1.04 },
} satisfies Record<string, Face>;

function font(face: Face, size: number) {
  return `${face.italic ? 'italic ' : ''}${face.weight} ${size}px ${face.family}`;
}

export async function loadCardFonts(sample: string) {
  if (document.fonts) await Promise.allSettled(Object.values(cardFaces).map((face) => document.fonts.load(font(face, 48), sample)));
}

function fits(context: CanvasRenderingContext2D, value: string, width: number) {
  const metrics = context.measureText(value);
  return Math.max(metrics.width, 2 * (metrics.actualBoundingBoxLeft ?? 0), 2 * (metrics.actualBoundingBoxRight ?? 0)) <= width - 4;
}

function wrap(context: CanvasRenderingContext2D, value: string, width: number) {
  const lines: string[] = [];

  for (const paragraph of value.split(/\r\n?|\n/u)) {
    let line = '';
    for (const word of paragraph.match(/\S+/gu) ?? []) {
      const candidate = line ? `${line} ${word}` : word;
      if (fits(context, candidate, width)) {
        line = candidate;
        continue;
      }

      if (line) lines.push(line);
      line = '';
      if (fits(context, word, width)) {
        line = word;
        continue;
      }

      // Preserve joined characters and accents when a long word needs to wrap.
      const units = graphemes ? Array.from(graphemes.segment(word), ({ segment }) => segment) : Array.from(word);
      for (const unit of units) {
        if (line && !fits(context, line + unit, width)) {
          lines.push(line);
          line = '';
        }
        line += unit;
      }
    }
    lines.push(line);
  }
  return lines;
}

function lineMetrics(context: CanvasRenderingContext2D, text: string, size: number, spacing: number) {
  if (!text) return { height: size * .58, ascent: 0, descent: 0 };
  const metrics = context.measureText(text);
  const ascent = Math.max(metrics.actualBoundingBoxAscent ?? 0, size * .68);
  const descent = Math.max(metrics.actualBoundingBoxDescent ?? 0, size * .15);
  return { height: Math.max(size * spacing, ascent + descent + size * .14), ascent, descent };
}

export function measureCardText(context: CanvasRenderingContext2D, value: string, face: Face, size: number, width: number, maxHeight = Infinity): CardText {
  context.font = font(face, size);
  const wrapped = wrap(context, value, width);
  const lines: CardText['lines'] = [];
  let height = 0;
  const ellipsis = lineMetrics(context, '…', size, face.spacing);
  for (const [index, text] of wrapped.entries()) {
    const metrics = lineMetrics(context, text, size, face.spacing);
    const remaining = index === wrapped.length - 1 ? 0 : ellipsis.height;
    if (height + metrics.height + remaining > maxHeight) {
      lines.push({ text: '…', baseline: height + (ellipsis.height + ellipsis.ascent - ellipsis.descent) / 2 });
      return { font: context.font, lines, height: height + ellipsis.height, width };
    }
    lines.push({ text, baseline: height + (metrics.height + metrics.ascent - metrics.descent) / 2 });
    height += metrics.height;
  }
  return { font: context.font, lines, height, width };
}

export function fitCardText(context: CanvasRenderingContext2D, value: string, face: Face, size: number, minSize: number, width: number, maxHeight: number) {
  for (let current = size; current > minSize; current -= 4) {
    const block = measureCardText(context, value, face, current, width);
    if (block.height <= maxHeight) return block;
  }
  return measureCardText(context, value, face, minSize, width, maxHeight);
}

export function drawCardText(context: CanvasRenderingContext2D, block: CardText, center: number, top: number, ink: string) {
  context.font = block.font;
  context.fillStyle = ink;
  for (const { text, baseline } of block.lines) {
    if (text) context.fillText(text, center, Math.round(top + baseline), block.width);
  }
}
