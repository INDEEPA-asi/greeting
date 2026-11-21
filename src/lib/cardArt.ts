import type { ValidatedBirthday } from '../config/schema';

type Theme = ValidatedBirthday['theme'];
export type CardFrame = { x: number; y: number; width: number; height: number };

function tint(hex: string, wash: string, amount: number) {
  const color = (value: string, index: number) => Number.parseInt(value.slice(index, index + 2), 16);
  return '#' + [1, 3, 5].map((i) => Math.round(color(hex, i) * (1 - amount) + color(wash, i) * amount).toString(16).padStart(2, '0')).join('');
}

export function cardInks(theme: Theme) {
  return {
    paper: tint('#fffaf3', theme.ivory, .24), edge: tint('#fff1ed', theme.blush, .27),
    ink: tint('#321d2b', theme.plum, .33), rose: tint('#62283f', theme.rose, .30), gold: tint('#996438', theme.gold, .42),
  };
}

function diamond(c: CanvasRenderingContext2D, x: number, y: number, size: number) {
  c.beginPath();
  c.moveTo(x, y - size); c.lineTo(x + size, y); c.lineTo(x, y + size); c.lineTo(x - size, y);
  c.closePath(); c.fill();
}

function sprig(c: CanvasRenderingContext2D, x: number, y: number, flip: boolean, theme: Theme) {
  c.save();
  c.translate(x, y);
  if (flip) c.scale(-1, 1);
  c.strokeStyle = theme.rose;
  c.fillStyle = theme.dusty;
  c.lineWidth = 1.6;
  c.globalAlpha = .44;
  c.beginPath();
  c.moveTo(0, 0); c.bezierCurveTo(58, 20, 95, 70, 104, 171); c.stroke();
  const leaves = [[31, 15, .63, 30], [51, 37, -1.05, 38], [72, 63, .38, 37], [87, 90, -.78, 43], [98, 123, .52, 32], [103, 153, -.68, 28]];
  for (const [left, top, turn, length] of leaves) {
    c.save();
    c.translate(left, top); c.rotate(turn);
    c.beginPath();
    c.moveTo(0, 0); c.quadraticCurveTo(-13, -length * .64, 1, -length); c.quadraticCurveTo(15, -length * .56, 0, 0);
    c.fill(); c.stroke(); c.restore();
  }
  c.restore();
}

export function cardPaper(c: CanvasRenderingContext2D, width: number, height: number, theme: Theme) {
  const { paper, edge, gold, ink } = cardInks(theme);
  c.fillStyle = ink; c.fillRect(0, 0, width, height);
  const gradient = c.createLinearGradient(40, 0, width - 40, height);
  gradient.addColorStop(0, edge); gradient.addColorStop(.42, paper); gradient.addColorStop(1, edge);
  c.fillStyle = gradient; c.fillRect(25, 25, width - 50, height - 50);

  c.fillStyle = ink;
  for (let i = 0; i < Math.floor(height * 3.5); i++) {
    c.globalAlpha = .026 + i % 5 * .009;
    c.fillRect(28 + (i * 577 % (width - 56)), 28 + (i * 997 % (height - 56)), 1 + i % 2, 1);
  }
  c.globalAlpha = 1;
  c.strokeStyle = gold;
  c.lineWidth = 1.8; c.strokeRect(42, 42, width - 84, height - 84);
  c.lineWidth = 1; c.strokeRect(55, 55, width - 110, height - 110);
  sprig(c, 72, 86, false, theme); sprig(c, width - 72, 86, true, theme);
  sprig(c, 72, height - 267, false, theme); sprig(c, width - 72, height - 267, true, theme);
  c.fillStyle = gold;
  for (const x of [55, width - 55]) for (const y of [55, height - 55]) diamond(c, x, y, 6);
}

function arch(c: CanvasRenderingContext2D, frame: CardFrame, inset = 0) {
  const x = frame.x + inset;
  const y = frame.y + inset;
  const width = frame.width - inset * 2;
  const height = frame.height - inset * 2;
  const middle = x + width / 2;
  const shoulder = y + height * .37;
  c.beginPath();
  c.moveTo(x, shoulder);
  c.bezierCurveTo(x, y + 48, middle - width * .26, y, middle, y);
  c.bezierCurveTo(middle + width * .26, y, x + width, y + 48, x + width, shoulder);
  c.lineTo(x + width, y + height - 16);
  c.quadraticCurveTo(x + width, y + height, x + width - 16, y + height);
  c.lineTo(x + 16, y + height);
  c.quadraticCurveTo(x, y + height, x, y + height - 16);
  c.closePath();
}

function cover(c: CanvasRenderingContext2D, image: HTMLImageElement, frame: CardFrame, keepsake: boolean) {
  const { naturalWidth: width, naturalHeight: height } = image;
  const scale = Math.max(frame.width / width, frame.height / height);
  const cropWidth = frame.width / scale;
  const cropHeight = frame.height / scale;
  c.drawImage(image, (width - cropWidth) / 2, (height - cropHeight) * (keepsake ? .38 : .29), cropWidth, cropHeight,
    frame.x, frame.y, frame.width, frame.height);
}

function roseMark(c: CanvasRenderingContext2D, x: number, y: number, size: number) {
  c.save();
  c.translate(x, y); c.scale(size, size);
  c.lineCap = 'round'; c.lineWidth = 1.4;
  c.beginPath();
  c.moveTo(0, 15); c.quadraticCurveTo(5, 5, 1, 1);
  c.bezierCurveTo(-9, 4, -15, -5, -12, -10);
  c.quadraticCurveTo(-8, -10, -5, -6); c.quadraticCurveTo(-6, -15, 1, -17);
  c.quadraticCurveTo(7, -16, 8, -8); c.quadraticCurveTo(10, -10, 14, -10);
  c.quadraticCurveTo(15, -1, 1, 1);
  c.moveTo(-5, -6); c.quadraticCurveTo(0, -6, 1, -2); c.quadraticCurveTo(4, -7, 8, -8);
  c.moveTo(0, 11); c.quadraticCurveTo(-6, 11, -8, 6); c.quadraticCurveTo(-3, 6, 0, 11);
  c.stroke(); c.restore();
}

export function cardPortrait(c: CanvasRenderingContext2D, frame: CardFrame, image: HTMLImageElement | null, keepsake: boolean, theme: Theme) {
  const { paper, gold, ink } = cardInks(theme);
  const center = frame.x + frame.width / 2;
  const bottom = frame.y + frame.height;
  c.save();
  c.shadowColor = '#57233942'; c.shadowBlur = 34; c.shadowOffsetY = 14;
  c.fillStyle = paper; arch(c, frame, -17); c.fill(); c.restore();
  c.save();
  arch(c, frame); c.clip();
  const gradient = c.createRadialGradient(center, frame.y + frame.height * .4, 45, center, frame.y + frame.height / 2, frame.width * .59);
  gradient.addColorStop(0, tint(ink, theme.rose, .42)); gradient.addColorStop(1, ink);
  c.fillStyle = gradient; c.fillRect(frame.x, frame.y, frame.width, frame.height);
  if (image) cover(c, image, frame, keepsake);
  else { c.strokeStyle = theme.gold; roseMark(c, center, frame.y + frame.height / 2, 8); }
  c.restore();

  c.strokeStyle = gold;
  for (const inset of [-17, -6]) {
    c.lineWidth = inset === -17 ? 2.1 : 1;
    arch(c, frame, inset); c.stroke();
  }
  c.beginPath(); c.arc(center, bottom + 2, 35, 0, Math.PI * 2);
  c.fillStyle = ink; c.fill();
  c.strokeStyle = theme.gold; c.lineWidth = 2.6; c.stroke();
  roseMark(c, center, bottom + 1, 1.28);
}

export function cardDivider(c: CanvasRenderingContext2D, center: number, y: number, gold: string) {
  c.strokeStyle = gold; c.fillStyle = gold; c.lineWidth = 1.2;
  c.beginPath();
  c.moveTo(center - 98, y); c.lineTo(center - 19, y);
  c.moveTo(center + 19, y); c.lineTo(center + 98, y);
  c.stroke(); diamond(c, center, y, 5);
}
