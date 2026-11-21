# LOVVERSE — A Garden That Blooms for You

LOVVERSE is a self-contained birthday story in eight interactive chapters. The demo features original botanical artwork, sample writing, and a short instrumental loop. Replace the demo name, date, photographs, and messages before sharing your gift.

## Run locally

Use Node.js 24 LTS and npm. Run these commands from this directory.

```sh
npm ci
npm run dev
```

Open the Local URL printed by Vite. Append `/personalize` to open the development-only editor for names, photos, messages, and other settings. Music starts off and plays only after a deliberate click on its toggle.

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
npm run audit:site
```

Playwright starts local servers for the production story and the development editor. The Lighthouse command audits the built gate in simulated mobile Chrome and writes `.lighthouse/mobile.html`. Its minimum scores are 90 for performance and 95 for accessibility. The browser suite also checks WCAG A/AA rules across the story and tests layout at 320, 390, 667 landscape, 768, and 1440 pixels. To inspect `dist/` manually, run `npm run preview`.

## Personalization

Use the [personalization editor](#personalization-editor) for the quickest setup. For direct edits, open [src/config/birthday.ts](src/config/birthday.ts) and use [the demo configuration](src/config/birthday.example.ts) as a guide. Keep the validation exports at the bottom of the file. Set `demo: false` when you have replaced the sample content. Invalid configuration produces a visible notice in the story and loads the demo garden.

1. Set `girlfriendName`, `senderName`, `birthdayDate`, and `timezone`. Enter the birthday in `YYYY-MM-DD` format. The story is available year-round. The “Birthday today” label compares the month and day in the configured time zone.
2. Edit `opening`, `subtitles`, `candleMessage`, `letter`, `wishMessage`, and `finale.message`. Each item in `letter` becomes its own paragraph.
3. Copy photographs into `public/images/memories/` and `public/images/finale/`. A file at `public/images/memories/day.webp` has the URL `/images/memories/day.webp`. Use simple filenames without spaces. Write useful `alt` text. Add a `caption`, `date`, and `note` where helpful.
4. Add or reorder `timeline` entries and assign a `photo` to any milestone. Set `finale.photo` to the photograph you want featured in the garden and on the downloadable card.
5. Fill up to three `gifts`. The allowed types are `text`, `photo`, `voice`, and `video`. Give each a title and fallback message. Supply a transcript with a playable voice or video gift and an optional WebVTT `captions` path for video. Set `lockThirdGift: false` to make all gifts available immediately.
6. Copy music and voice recordings into `public/audio/` and videos into `public/videos/`. Add background tracks with an `id`, `title`, and `src`. Set `audio.selected` to the ID of the starting track. An empty `tracks` array disables the music toggle.
7. Change the hex values in `theme` and check contrast for your choices. Set a key in `enabled` to `false` to hide that chapter. The story skips disabled chapters automatically.

For responsive photographs, set `width` to the original image’s pixel width and add smaller versions to `variants`. For example, a 1440 px original can include a 480 px and a 960 px WebP. A single photograph without variants works too. Use MP3, WAV, or AAC audio and MP4 video for broad compatibility. Personal media is served locally by default. An explicit HTTPS path contacts the named host. A remote photo needs an appropriate CORS header to appear on the exported card. The card uses a rose illustration if the photo is missing, blocked, or too slow to load.

### Personalization editor

1. Run `npm run dev` and open `/personalize` on the Local URL. Start with **Basics**, then use **Photos** to select several scrapbook pictures at once or add the finale photo. Add a useful description in each photo’s alt text field.
2. Use **Messages** for the letter and other copy, **Timeline** for milestones, and **Gifts** or **Music** to choose recordings and songs directly from your device. A voice or video gift needs a transcript.
3. Select **Preview story** to try your changes, then **Back to editing** to return to your draft. Turn off **Show the demo label** after replacing the sample content.
4. Select **Download personalization**. Extract `lovverse-personalization.zip` into the LOVVERSE project folder next to `package.json`, merging its folders. It contains a replacement `src/config/birthday.ts` and the newly attached media in the matching `public/` folders. Keep a copy of the earlier configuration if you want to restore it.

Edits and attachments live in the open tab until you download the ZIP. The editor reads media locally and leaves your project files untouched until you apply the downloaded archive. Once applied, re-run `npm run dev` to review the updated gift or `npm run build` to rebuild it for Netlify.

## Deploy to Netlify

Import your repository into Netlify. Included configuration builds the project with Node 24 and publishes `dist`. Netlify can also host the contents of a locally built `dist/` through its manual deploy flow. Review the final story and remove unused personal media from `public/` before publishing. Assets placed there are included in the deployment even when they are absent from the configuration. [Netlify deployment documentation](https://docs.netlify.com/deploy/).

A public Netlify URL exposes the app and its media to anyone who obtains the URL. For access control, configure Netlify password protection or an equivalent hosting restriction before uploading the personal version. The third-gift lock is a visual story interaction. Wish text is held in memory on the current page and is never transmitted or stored. The production app has no analytics, accounts, API, or database. Fonts and demo media are served from the same origin. [Netlify password protection](https://docs.netlify.com/manage/security/secure-access-to-sites/password-protection/).

## Performance and motion

The first scene targets at most 125 KiB gzipped JavaScript, 15 KiB gzipped CSS, and 50 KiB for a selected hero image. High-resolution personal images and recordings enter the network only as needed. Each later chapter has its own bundle, and the app prefetches at most the next chapter and its immediate scenery during idle time. Decorative Canvas effects use a mobile particle cap and pause in hidden tabs. Motion for React supplies the layered finale, while Web Animations API completion events drive chapter changes. CSS and Canvas handle the remaining effects.

## File-by-file architecture

| File | Responsibility |
| --- | --- |
| `index.html` | Document metadata, favicon, and application mount |
| `package.json` and `package-lock.json` | Commands, dependencies, and reproducible installation |
| `tsconfig.json` | Strict TypeScript settings for source and tests |
| `vite.config.ts` | React, Tailwind, and Vitest integration |
| `eslint.config.js` | TypeScript and React Hooks linting |
| `playwright.config.ts` | Browser projects and production preview server |
| `netlify.toml` | Build, publish, cache, and response headers |
| `.gitignore` | Local build, dependency, test, and audit artifacts |
| `src/main.tsx` | React entry, local fonts, dev-only editor routing |
| `src/app/App.tsx` | Story shell, scene focus, error boundary, and session progress |
| `src/app/sceneLoaders.ts` | Lazy chapter bundles and immediate scenery preload hints |
| `src/app/navigation/chapters.ts` | Chapter order, visual tone, and transition durations |
| `src/app/navigation/reducer.ts` | Pure navigation state machine and stale-event protection |
| `src/app/navigation/ChapterTransition.tsx` | Cover and uncover effects, completion, cancellation, and browser fallback |
| `src/app/providers/AudioProvider.tsx` | Music consent, volume fading, track changes, ducking, and media lifecycle |
| `src/app/PersonalizationEditor.tsx` | Visual editor sections, draft validation, preview, and download |
| `src/app/editor.css` | Responsive editor layout and form styles |
| `src/app/personalization/StoryPanels.tsx` | Identity, chapter visibility, message, and theme forms |
| `src/app/personalization/MediaPanels.tsx` | Scrapbook, finale, timeline, gift, and music forms |
| `src/app/personalization/EditorFields.tsx` | Shared fields, file pickers, thumbnails, and list controls |
| `src/app/personalization/assets.ts` | Local media paths, configuration serialization, and used-asset tracking |
| `src/app/personalization/export.ts` | Local ZIP archive with configuration and referenced attachments |
| `src/chapters/EnchantedGate.tsx` | First-scene rosebud, lighting, and entry |
| `src/chapters/BirthdayBloom.tsx` | Candle interaction, date, and birthday message |
| `src/chapters/MemoryGarden.tsx` | Scrapbook cards and empty state |
| `src/chapters/StoryTimeline.tsx` | Timeline and golden thread |
| `src/chapters/LoveLetter.tsx` | Envelope and readable paragraph reveal |
| `src/chapters/GiftPavilion.tsx` | Gift boxes, unlock logic, and gift content |
| `src/chapters/WishingFountain.tsx` | Local wish form and lantern release |
| `src/chapters/ForeverGarden.tsx` | Finale layers, story actions, and download feedback |
| `src/components/layout/Scene.tsx` | Reusable heading and scene layout |
| `src/components/layout/StoryChrome.tsx` | Wordmark, music controls, progress, and chapter navigation |
| `src/components/ui/Dialog.tsx` | Native modal, keyboard behavior, and focus restoration |
| `src/components/ui/GardenImage.tsx` | Responsive images and error/empty placeholders |
| `src/components/ui/GiftMedia.tsx` | Explicit playback, loading feedback, replay, and transcripts |
| `src/components/ui/MusicControls.tsx` | Toggle, track menu, and labeled volume |
| `src/components/ui/Ornaments.tsx` | Rose emblem, rules, and ornamental frame |
| `src/components/ui/PhotoViewer.tsx` | Photo zoom view, captions, arrows, and swipe |
| `src/components/effects/GardenParticles.tsx` | Decorative, visibility-aware Canvas particles |
| `src/components/effects/Reveal.tsx` | Viewport-triggered, progressive reveal |
| `src/config/birthday.ts` | Editable values, validation result, and safe fallback |
| `src/config/birthday.example.ts` | Identified demo content and bundled media |
| `src/config/schema.ts` | Zod validation and inferred TypeScript types |
| `src/hooks/useMotionPreference.ts` | Device and session motion preference |
| `src/hooks/useVisibility.ts` | Browser tab visibility |
| `src/lib/card.ts` | Local Canvas card rendering and PNG creation |
| `src/lib/dates.ts` | Calendar validation, time-zone comparison, and display |
| `src/lib/gifts.ts` | Gift slots and unlock policy |
| `src/styles/base.css` | Tailwind and CSS entry point |
| `src/styles/theme.css` | Palette, typography, controls, modal, and motion rules |
| `src/styles/chrome.css` | Header, footer, progress, and music settings |
| `src/styles/gate.css` | Gate composition and opening rose |
| `src/styles/chapters.css` | Individual chapter layouts and interactions |
| `src/styles/effects.css` | Foreground effects and transition motifs |
| `public/rose.svg` | Vector favicon |
| `public/images/decorations/*.webp` | Original rosebud, rose, cake, fountain, sunset, and bouquet at responsive sizes |
| `public/audio/rose-garden.wav` | Original synthesized instrumental demo |
| `src/test/setup.ts` | Test environment initialization |
| `src/test/config.test.ts` | Validation and date tests |
| `src/test/navigation.test.ts` | Reducer and unlock tests |
| `src/test/components.test.tsx` | Component, input, focus, and fallback tests |
| `e2e/story.spec.ts` | Full story, keyboard, responsiveness, axe, failure paths, and card export |
| `e2e/personalize.spec.ts` | Editor fields, local attachments, story preview, and ZIP contents |
| `scripts/audit.mjs` | Repeatable mobile Lighthouse audit |
| `BUILD-LOG.md` | Phase inventory, verification, and artwork provenance |

## Optional future improvements

- An authenticated CMS with authenticated media storage for persistent editing.
- A second language pack for navigation and card lettering.
- Additional local artwork and music editions with their own art direction.
