import { lazy } from 'react';

const birthday = () => import('../chapters/BirthdayBloom');
const memories = () => import('../chapters/MemoryGarden');
const timeline = () => import('../chapters/StoryTimeline');
const letter = () => import('../chapters/LoveLetter');
const gifts = () => import('../chapters/GiftPavilion');
const wish = () => import('../chapters/WishingFountain');
const finale = () => import('../chapters/ForeverGarden');

export const lazyScenes = {
  birthday: lazy(birthday), memories: lazy(memories), timeline: lazy(timeline),
  letter: lazy(letter), gifts: lazy(gifts), wish: lazy(wish), finale: lazy(finale),
};

export const loaders = { birthday, memories, timeline, letter, gifts, wish, finale };
export const scenery: Partial<Record<keyof typeof loaders, { src: string; srcset: string; sizes: string }>> = {
  birthday: { src: '/images/decorations/cake.webp', srcset: '/images/decorations/cake-small.webp 384w, /images/decorations/cake.webp 768w', sizes: '(min-width: 840px) 48vw, 92vw' },
  wish: { src: '/images/decorations/fountain.webp', srcset: '/images/decorations/fountain-small.webp 384w, /images/decorations/fountain.webp 768w', sizes: '(min-width: 800px) 768px, 94vw' },
};
