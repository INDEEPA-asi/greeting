import type { BirthdayConfig, GardenPhoto, ValidatedBirthday } from '../../config/schema';

export const mediaFormats = {
  image: '.jpg,.jpeg,.png,.webp,.avif,.gif',
  audio: '.mp3,.wav,.m4a,.aac,.ogg,.opus,.flac,.webm',
  video: '.mp4,.webm,.m4v',
  captions: '.vtt',
};

export type MediaKind = keyof typeof mediaFormats;
export type LocalAsset = { file: File; url: string };
export type AssetLibrary = Map<string, LocalAsset>;

const folders: Record<MediaKind, string> = {
  image: 'images/memories', audio: 'audio', video: 'videos', captions: 'videos',
};

export function acceptsMedia(file: File, kind: MediaKind) {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  return file.size > 0 && mediaFormats[kind].split(',').some((allowed) => extension === allowed);
}

export function mediaPath(file: File, kind: MediaKind) {
  const extension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
  const name = file.name.slice(0, file.name.length - extension.length).toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 54) || 'media';
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(8)), (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `/${folders[kind]}/personalized/${name}-${nonce}${extension}`;
}

export function assetName(path: string, assets: AssetLibrary) {
  return assets.get(path)?.file.name ?? path.split('/').at(-1) ?? path;
}

export function photoFromFile(src: string, file: File, previous?: GardenPhoto): GardenPhoto {
  const alt = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
  return { src, alt, caption: previous?.caption, date: previous?.date, note: previous?.note };
}

export function referencedAssets(config: BirthdayConfig) {
  const result = new Set<string>();
  function photo(image?: GardenPhoto) {
    if (!image) return;
    result.add(image.src);
    image.variants?.forEach(({ src }) => result.add(src));
  }

  config.photos.forEach(photo);
  config.timeline.forEach((milestone) => photo(milestone.photo));
  photo(config.finale.photo);
  config.audio.tracks.forEach(({ src }) => result.add(src));
  config.gifts.forEach((gift) => {
    if (gift.type === 'photo') photo(gift.photo);
    if ((gift.type === 'voice' || gift.type === 'video') && gift.src) result.add(gift.src);
    if (gift.type === 'video' && gift.captions) result.add(gift.captions);
  });
  return result;
}

export function configurationModule(config: ValidatedBirthday) {
  return [
    "import { birthdayExample } from './birthday.example';",
    "import { birthdaySchema, type BirthdayConfig } from './schema';",
    '',
    `export const birthday: BirthdayConfig = ${JSON.stringify(config, null, 2)};`,
    '',
    'export const birthdayResult = birthdaySchema.safeParse(birthday);',
    'export const gardenConfig = birthdayResult.success ? birthdayResult.data : birthdaySchema.parse(birthdayExample);',
    '',
  ].join('\n');
}
