import { strToU8, Zip, ZipPassThrough } from 'fflate';
import type { ValidatedBirthday } from '../../config/schema';
import { configurationModule, referencedAssets, type AssetLibrary } from './assets';

const instructions = `LOVVERSE personalization

Extract the contents into the root of your LOVVERSE project, next to package.json.
The archive includes a replacement for src/config/birthday.ts and any locally selected media still used by it.
Keep a copy of your earlier birthday.ts if you want to restore it.
Run npm run dev to review the result, or npm run build to create the updated Netlify build.
`;

export function exportPersonalization(config: ValidatedBirthday, assets: AssetLibrary) {
  const files = [...referencedAssets(config)].flatMap((path) => {
    const asset = assets.get(path);
    return asset ? [[`public${path}`, asset.file] as const] : [];
  });

  return new Promise<Blob>((resolve, reject) => {
    const chunks: Blob[] = [];
    const archive = new Zip((error, data, final) => {
      if (error) { reject(error); return; }
      if (data.length > 0) chunks.push(new Blob([data]));
      if (final) resolve(new Blob(chunks, { type: 'application/zip' }));
    });

    async function write() {
      for (const [path, text] of [['src/config/birthday.ts', configurationModule(config)], ['HOW-TO-APPLY.txt', instructions]]) {
        const entry = new ZipPassThrough(path);
        archive.add(entry);
        entry.push(strToU8(text), true);
      }

      for (const [path, file] of files) {
        const entry = new ZipPassThrough(path);
        archive.add(entry);
        const reader = file.stream().getReader();
        try {
          for (;;) {
            const chunk = await reader.read();
            if (chunk.done) break;
            entry.push(chunk.value);
          }
          entry.push(new Uint8Array(), true);
        } finally {
          reader.releaseLock();
        }
      }
      archive.end();
    }

    void write().catch((error: unknown) => {
      archive.terminate();
      reject(error);
    });
  });
}
