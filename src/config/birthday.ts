import { birthdayExample } from './birthday.example';
import { birthdaySchema, type BirthdayConfig } from './schema';

export const birthday: BirthdayConfig = {
  "demo": false,
  "girlfriendName": "Sudu Manika",
  "senderName": "Sudu Mahaththaya",
  "birthdayDate": "2000-11-22",
  "timezone": "Asia/Colombo",
  "theme": {
    "ivory": "#fff8f5",
    "blush": "#f5d5df",
    "dusty": "#d88fa6",
    "rose": "#a14e68",
    "gold": "#c9a46b",
    "plum": "#402a37",
    "white": "#fffcfa"
  },
  "enabled": {},
  "subtitles": {
    "birthday": "Today, every rose in this garden is blooming just for you.",
    "memories": "Little things to keep, like petals between the pages of a book.",
    "timeline": "Every path has a beginning. This one has room for all our favorite moments.",
    "letter": "Some things are best said on paper.",
    "gifts": "Three little things, wrapped with you in mind.",
    "finale": "Happy birthday, with all my love."
  },
  "opening": {
    "firstLine": "Happy Birthday",
    "secondLine": "Sudu Manika",
    "message": "A little world, made only for you."
  },
  "candleMessage": "May the year ahead give you countless reasons to smile, and time to enjoy every one.",
  "photos": [
    {
      "src": "/images/memories/personalized/20260425_125539-a2ab1291664d88f8.jpg",
      "alt": "20260425 125539",
      "caption": "My Universe...",
      "date": "At Nanayakkara Park, Matale",
      "note": "A forehead kiss is a silent promise of love...😘"
    },
    {
      "src": "/images/memories/personalized/20260328_123845-e58a55e21d41ec99.jpg",
      "alt": "20260328 123845",
      "caption": "Your Smile...",
      "date": "At Deer Park, Trincomalee",
      "note": "You are So, Deer to mee...🥰"
    },
    {
      "src": "/images/memories/personalized/20260214_125648-70f98d6ee98d513c.jpg",
      "alt": "20260214 125648",
      "caption": "My Love...",
      "date": "At Marbal beach, Trincomalee",
      "note": "The beach is a faithful lover. It will never abandon the sea...🌊"
    }
  ],
  "timeline": [
    {
      "date": "July 3 2025",
      "title": "මං ඉස්සෙල්ලාම ආදරෙයි කියපු දවස...🫣❤️",
      "message": "\"මන් සුදූට පණ වගේ ආදරෙයි පැටියෝ\""
    },
    {
      "date": "July 10 2025",
      "title": "සුදූ මට ඉස්සෙල්ලාම ආදරෙයි කියපු දවස...🥰❤️",
      "message": "මාත් ආදරෙයි සුදු අයියේ...😘🥰"
    },
    {
      "date": "January 16 2026",
      "title": "දළදා මාලිගාවට ගියපු දවස...🙏",
      "message": "As promised...🤭",
      "photo": {
        "src": "/images/memories/personalized/20260116_122910-532e44ea830f22db.jpg",
        "alt": "20260116 122910"
      }
    },
    {
      "date": "October 17, 2026",
      "title": "පුංචි Surprise එකක්...😎",
      "message": "I came for youu...🤭",
      "photo": {
        "src": "/images/memories/personalized/20261017_104814-eba6dfcf8db49cce.jpg",
        "alt": "20261017 104814"
      }
    }
  ],
  "letter": [
    "සංසාරේ අහම්බෙන් හමුවෙලා... 🥺❤️\nලියූ පෙම් ගීතේ තත්සරය වී ලා... 🎶✨\nදිවියම හැඩකළා මාගේ... 🌸💖",
    "ඔය මීන නෙතු සඟලේ හැමදා දුටුවේ... 🫣💫\nදිළිසෙනා ආදරේ නුඹේ..... 🥰💕\nපතන්නම් සෙනෙහස් සිතින්... 😘✨\nසිත පැතුම් ඉටුවෙන සුවපත්... 🤲🌟",
    "සුබ උපන්දිනයක් වේවා!!! 🎂🎉🎈\nමගේ සුදු මැණිකට.... ❤️🤗"
  ],
  "gifts": [
    {
      "title": "A Little Promise...❤️",
      "fallback": "I hope we always make time for the small things.",
      "type": "text",
      "message": "I promise to value our differences and work on them until they become our strengths as a couple."
    },
    {
      "title": "Memories in short...❤️",
      "fallback": "A bouquet for you, in every season.",
      "type": "video",
      "src": "/videos/personalized/lv_7502084974196165941_20260425214000-1e58d5bf4f2b737f.mp4",
      "transcript": "You and I...🤭"
    },
    {
      "title": "A Voice for you...❤️",
      "fallback": "Wherever this year takes you, I hope you find a little more of what makes you feel like yourself.",
      "type": "voice",
      "src": "/audio/personalized/vnote-0e3bea1194847fdf.m4a",
      "transcript": "Ummmmmmaaaaaah...😘😘😘😘😘😘😘😘"
    }
  ],
  "lockThirdGift": true,
  "wishMessage": "May your wish find its way to you, in its own beautiful time.",
  "finale": {
    "message": "Of all the things I could wish for tonight, there is one I already have. You.",
    "photo": {
      "src": "/images/memories/personalized/nnnnnnnnn-5dc8dad4a534ecb5.jpg",
      "alt": "nnnnnnnnn",
      "caption": "Happy Birthday Sudu Manika...",
      "date": "Ummmaah...😘😘😘",
      "note": "May your special day be as bright and beautiful as your smile...✨"
    }
  },
  "audio": {
    "tracks": [
      {
        "id": "rose-garden",
        "title": "Rose Garden",
        "src": "/audio/rose-garden.wav"
      },
      {
        "id": "/audio/personalized/happy-birth-day-unknown-632ef56bec6d55e4.mp3",
        "title": "happy-birth-day-unknown",
        "src": "/audio/personalized/happy-birth-day-unknown-632ef56bec6d55e4.mp3"
      }
    ],
    "selected": "/audio/personalized/happy-birth-day-unknown-632ef56bec6d55e4.mp3"
  }
};

export const birthdayResult = birthdaySchema.safeParse(birthday);
export const gardenConfig = birthdayResult.success ? birthdayResult.data : birthdaySchema.parse(birthdayExample);
