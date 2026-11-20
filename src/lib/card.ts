import type { ValidatedBirthday } from '../config/schema';

function loadPhoto(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    const finish = (value: HTMLImageElement | null) => {
      clearTimeout(deadline);
      image.onload = null;
      image.onerror = null;
      resolve(value);
    };
    const deadline = window.setTimeout(() => finish(null), 2400);
    if (!src.startsWith('/') && !src.startsWith('blob:')) image.crossOrigin = 'anonymous';
    image.onload = () => finish(image);
    image.onerror = () => finish(null);
    image.src = src;
  });
}

function wrap(context: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && context.measureText(candidate).width > width) { lines.push(line); line = word; }
    else line = candidate;
  }
  return [...lines, line];
}

export async function birthdayCard(config: ValidatedBirthday) {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const context = canvas.getContext('2d');
  if (!context || typeof canvas.toBlob !== 'function') throw new Error('Canvas export unavailable');

  const photo = config.finale.photo ? await loadPhoto(config.finale.photo.src) : null;
  const editor = '"Cormorant Garamond Variable", Georgia, serif';
  try { await document.fonts?.load(`600 82px ${editor}`); } catch { /* Georgia remains available. */ }
  const { ivory, blush, dusty, rose, gold, plum } = config.theme;
  const backdrop = context.createLinearGradient(0, 0, 1200, 1600);
  backdrop.addColorStop(0, ivory);
  backdrop.addColorStop(1, blush);
  context.fillStyle = backdrop;
  context.fillRect(0, 0, 1200, 1600);
  context.strokeStyle = gold;
  context.lineWidth = 2;
  context.strokeRect(47, 47, 1106, 1506);
  context.strokeRect(61, 61, 1078, 1478);

  context.textAlign = 'center';
  context.fillStyle = plum;
  context.font = '500 25px system-ui';
  context.fillText('L O V V E R S E   ·   R O S E   G A R D E N', 600, 146, 900);
  context.font = `600 92px ${editor}`;
  context.fillText('Happy Birthday,', 600, 254, 990);
  context.fillText(config.girlfriendName, 600, 346, 990);

  const frame = { x: 280, y: 405, width: 640, height: 405 };
  context.strokeStyle = gold;
  context.strokeRect(frame.x - 8, frame.y - 8, frame.width + 16, frame.height + 16);
  if (photo) {
    const scale = Math.max(frame.width / photo.width, frame.height / photo.height);
    const cropWidth = frame.width / scale;
    const cropHeight = frame.height / scale;
    context.drawImage(photo, (photo.width - cropWidth) / 2, (photo.height - cropHeight) / 2, cropWidth, cropHeight,
      frame.x, frame.y, frame.width, frame.height);
  } else {
    context.fillStyle = ivory;
    context.fillRect(frame.x, frame.y, frame.width, frame.height);
    context.strokeStyle = rose;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(595, 748); context.quadraticCurveTo(629, 673, 604, 596); context.stroke();
    context.fillStyle = rose;
    context.beginPath(); context.ellipse(572, 684, 32, 12, .65, 0, 2 * Math.PI); context.fill();
    context.beginPath(); context.ellipse(632, 665, 28, 11, -.6, 0, 2 * Math.PI); context.fill();
    for (let i = 0; i < 15; i++) {
      const angle = i * 2.4;
      const spread = 65 - i * 3.7;
      context.fillStyle = i % 3 === 0 ? rose : dusty;
      context.beginPath();
      context.ellipse(600 + Math.sin(angle) * spread, 550 + Math.cos(angle) * spread * .65, 48 - i * 1.8, 25 - i, angle, 0, 2 * Math.PI);
      context.fill();
    }
  }

  context.fillStyle = plum;
  context.font = `600 italic 63px ${editor}`;
  context.fillText('In every lifetime,', 600, 930, 990);
  context.fillText('I’d still choose you.', 600, 994, 990);
  context.font = `500 44px ${editor}`;
  const lines = wrap(context, config.finale.message, 900);
  const visible = lines.slice(0, 6);
  if (lines.length > 6) visible[5] += '…';
  visible.forEach((line, index) => context.fillText(line, 1080 + index * 49, 920));
  context.font = '500 30px system-ui';
  context.fillText(`With love, ${config.senderName}`, 600, 1450, 990);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('No image could be created.')), 'image/png');
  });
}
