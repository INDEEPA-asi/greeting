import type { BirthdayConfig } from './schema';

const bouquet = {
  src: '/images/decorations/bouquet.webp', alt: 'Dusty pink roses tied with an ivory satin ribbon', width: 768,
  variants: [{ src: '/images/decorations/bouquet-small.webp', width: 384 }],
};
const sunset = {
  src: '/images/decorations/sunset.webp', alt: 'A golden sun dipping into a pink evening sea', width: 768,
  variants: [{ src: '/images/decorations/sunset-small.webp', width: 384 }],
};
const roses = {
  src: '/images/decorations/rose-garden.webp', alt: 'A single pink rose in a softly lit garden', width: 1536,
  variants: [{ src: '/images/decorations/rose-garden-medium.webp', width: 900 }],
};

export const birthdayExample = {
  demo: true,
  girlfriendName: 'My Love',
  senderName: 'Someone who loves you',
  birthdayDate: '2000-11-21',
  timezone: 'Asia/Colombo',
  theme: { ivory: '#fff8f5', blush: '#f5d5df', dusty: '#d88fa6', rose: '#a14e68', gold: '#c9a46b', plum: '#402a37', white: '#fffcfa' },
  enabled: {},
  opening: {
    firstLine: 'Some stories are written in stars.',
    secondLine: 'Ours was written in roses.',
    message: 'A little world, made only for you.',
  },
  subtitles: {
    birthday: 'Today, every rose in this garden is blooming just for you.',
    memories: 'Little things to keep, like petals between the pages of a book.',
    timeline: 'Every path has a beginning. This one has room for all our favorite moments.',
    letter: 'Some things are best said on paper.',
    gifts: 'Three little things, wrapped with you in mind.',
    finale: 'Happy birthday, with all my love.',
  },
  candleMessage: 'May the year ahead give you countless reasons to smile, and time to enjoy every one.',
  photos: [
    { ...bouquet, caption: 'A handful of roses', date: 'Demo photograph', note: 'Replace this with a photo that reminds you of the little things.' },
    { ...sunset, caption: 'The last of the light', date: 'Demo photograph', note: 'A space for a favorite day, or a quiet afternoon you want to keep.' },
    { ...roses, caption: 'Something worth keeping', date: 'Demo photograph', note: 'Add a photograph here and tell her what you remember about it.' },
  ],
  timeline: [
    { date: 'Add a date', title: 'The day we met', message: 'Write where this story began and what you remember most.' },
    { date: 'Add a date', title: 'The conversation that stayed', message: 'Write about a conversation you still find yourself thinking about.' },
    { date: 'Add a date', title: 'A favorite day together', message: 'Add a day you would happily live again.', photo: sunset },
    { date: 'Add a date', title: 'A moment I will always remember', message: 'Leave a few words about something you never want to forget.' },
  ],
  letter: [
    'I wanted to give you somewhere quiet to land on your birthday, a little corner of the world made with you in mind.',
    'I hope the year ahead gives you long mornings, good surprises, and the kind of laughter that stays with you for the rest of the day.',
    'However today unfolds, I hope you have a moment to feel how deeply you are loved.',
  ],
  gifts: [
    { type: 'text', title: 'A Little Promise', fallback: 'I hope we always make time for the small things.', message: 'Here’s to making time for the small things, and saying what matters while we have the chance.' },
    { type: 'photo', title: 'A Pocketful of Roses', fallback: 'A bouquet for you, in every season.', photo: bouquet },
    { type: 'voice', title: 'Something to Keep', fallback: 'Wherever this year takes you, I hope you find a little more of what makes you feel like yourself.' },
  ],
  lockThirdGift: true,
  wishMessage: 'May your wish find its way to you, in its own beautiful time.',
  finale: { message: 'Of all the things I could wish for tonight, there is one I already have. You.' },
  audio: { tracks: [{ id: 'rose-garden', title: 'Rose Garden', src: '/audio/rose-garden.wav' }], selected: 'rose-garden' },
} satisfies BirthdayConfig;
