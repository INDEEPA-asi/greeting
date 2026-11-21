import type { ValidatedBirthday } from '../config/schema';
import { cardDivider, cardInks, cardPaper, cardPortrait } from './cardArt';
import { cardFaces, drawCardText, fitCardText, loadCardFonts, measureCardText } from './cardTypography';

const width = 1200;
const minHeight = 1600;
const maxHeight = 4096;
const center = width / 2;
const roseArtwork = '/images/decorations/rose-garden.webp';

function loadPhoto(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    const finish = (value: HTMLImageElement | null) => {
      window.clearTimeout(deadline);
      image.onload = null;
      image.onerror = null;
      resolve(value);
    };
    const deadline = window.setTimeout(() => finish(null), 3000);
    if (!src.startsWith('blob:')) image.crossOrigin = 'anonymous';
    image.onload = () => finish(image.naturalWidth && image.naturalHeight ? image : null);
    image.onerror = () => finish(null);
    image.src = src;
  });
}

async function cardImage(src?: string) {
  const keepsake = src ? await loadPhoto(src) : null;
  return { image: keepsake ?? await loadPhoto(roseArtwork), keepsake: !!keepsake };
}

export async function birthdayCard(config: ValidatedBirthday) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  const context = canvas.getContext('2d');
  if (!context || typeof canvas.toBlob !== 'function') throw new Error('Canvas export unavailable');

  const fontSample = `LOVVERSE Happy Birthday With love I’d still choose you ${config.girlfriendName} ${config.senderName} ${config.finale.message.slice(0, 2000)}`;
  const [{ image, keepsake }] = await Promise.all([cardImage(config.finale.photo?.src), loadCardFonts(fontSample)]);
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';

  const brand = measureCardText(context, 'L O V V E R S E   ·   R O S E   G A R D E N', cardFaces.label, 23, 850);
  const title = measureCardText(context, 'Happy Birthday,', cardFaces.title, 100, 940);
  const name = fitCardText(context, config.girlfriendName, cardFaces.name, 122, 48, 920, 164);
  const vow = measureCardText(context, 'In every lifetime,\nI’d still choose you.', cardFaces.verse, 61, 900);
  const signoff = measureCardText(context, 'With love,', cardFaces.label, 24, 860);
  const signature = fitCardText(context, config.senderName, cardFaces.signature, 60, 32, 860, 105);

  const titleTop = 147;
  const nameTop = titleTop + title.height + 1;
  const frameWidth = keepsake && image && image.naturalHeight > image.naturalWidth * 1.12 ? 560 : 808;
  const frame = { x: center - frameWidth / 2, y: nameTop + name.height + 34, width: frameWidth, height: 463 };
  const vowTop = frame.y + frame.height + 54;
  const messageTop = vowTop + vow.height + 25;
  const signatureSpace = 36 + signoff.height + 8 + signature.height + 103;
  const message = measureCardText(context, config.finale.message, cardFaces.body, 42, 840, maxHeight - messageTop - signatureSpace);

  const signoffTop = Math.max(1346, messageTop + message.height + 36);
  const signatureTop = signoffTop + signoff.height + 8;
  canvas.height = Math.max(minHeight, Math.ceil(signatureTop + signature.height + 103));

  cardPaper(context, width, canvas.height, config.theme);
  cardPortrait(context, frame, image, keepsake, config.theme);
  const { ink, rose, gold } = cardInks(config.theme);
  context.textAlign = 'center';
  context.textBaseline = 'alphabetic';
  drawCardText(context, brand, center, 79, rose);
  cardDivider(context, center, 128, gold);
  drawCardText(context, title, center, titleTop, ink);
  drawCardText(context, name, center, nameTop, rose);
  drawCardText(context, vow, center, vowTop, rose);
  drawCardText(context, message, center, messageTop, ink);
  drawCardText(context, signoff, center, signoffTop, ink);
  drawCardText(context, signature, center, signatureTop, rose);
  cardDivider(context, center, canvas.height - 76, gold);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('No image could be created.')), 'image/png');
  });
}
