/* ============================================================
   YOUR VIDEOS — this is the only file you need to edit.

   HOW TO ADD A VIDEO
   1. Find the category below (podcast, social, ugc, ads, motion,
      real-estate, ai). Motion = 2D, 3D and SaaS animation.
   2. Add a line inside its "videos" list:
        { url: "PASTE THE YOUTUBE LINK HERE", title: "Name of the video" },
   3. Save, upload to GitHub. Done.

   Any YouTube link works — normal, short or Shorts:
      https://www.youtube.com/watch?v=dQw4w9WgXcQ
      https://youtu.be/dQw4w9WgXcQ
      https://youtube.com/shorts/dQw4w9WgXcQ

   The site works out the shape by itself: /shorts/ links are shown
   vertically (9:16), everything else 16:9. If a normal link is really a
   vertical video, add  vertical: true  to that line.

   OWN COVER: if YouTube shows a grey cover for a video, put your own
   picture in the assets folder and add it to that line:
        { url: "...", title: "...", cover: "assets/my-cover.jpg" },

   The same link added twice is only ever shown once.
   A category with no videos shows as "Links coming soon".

   TIP: titles are what clients read first. "Skincare brand — 1.2M views"
   works far better than "Social edit — 03".
   ============================================================ */

/* ============================================================
   INTRO VIDEO — the big video at the top of the page, under your photo.
   To change it, paste a new YouTube link and title here.
   ============================================================ */
const INTRO = {
  url: "https://youtu.be/9kE3oR26QS8",
  title: "Najaf Ali — Introduction",
  label: "Start here"
};

const WORK = [
  {
    id: "podcast",
    name: "Podcast clips",
    blurb: "Podcast and interview cuts — hooks, captions and pacing that keep people watching.",
    videos: [
      { url: "https://youtube.com/shorts/oXZVLBH6vYE", title: "Tom Talks Success — Isaac Toledano" },
      { url: "https://youtube.com/shorts/E6yn28YC558", title: "Lifestyle Brand to a Billion-Dollar Exit — Sam Nazarian" },
      { url: "https://youtube.com/shorts/iddHqjPN5Bk", title: "Industry Game — Gil Dezer" },
      { url: "https://youtube.com/shorts/SrFsBqcDr8E", title: "Podcast reel" }
    ]
  },
  {
    id: "social",
    name: "Social media videos",
    blurb: "Feed-first edits, Reels and Shorts for brands, events and creators.",
    videos: [
      { url: "https://youtu.be/1vIdOyYMjK4", title: "HVAC" },
      { url: "https://youtu.be/HauYL0c4FQ4", title: "FVTSA" },
      { url: "https://youtu.be/frQqjyhoIsA", title: "RYP" },
      { url: "https://youtu.be/nlJf90z3Xe0", title: "Vuokatti Cup" },
      { url: "https://youtu.be/cL8hhzJFAV8", title: "Seawolves Rugby" },
      { url: "https://youtu.be/kFhCHFAemLc", title: "Ride with Nadeem" },
      { url: "https://youtu.be/R5cwGRul9xI", title: "Social edit — 01" },
      { url: "https://youtu.be/Mp0ElwB8Ngc", title: "Social edit — 02" },
      { url: "https://youtu.be/z_yx3zWASpU", title: "Social edit — 03" },
      { url: "https://youtu.be/6lCMrmQvbTg", title: "Social edit — 04" },
      { url: "https://youtube.com/shorts/djUwL5_1-Lo", title: "Traventure" },
      { url: "https://youtube.com/shorts/XQ34vq9r964", title: "One World Relief — 01" },
      { url: "https://youtube.com/shorts/ZXnAinHkZis", title: "One World Relief — 02" },
      { url: "https://youtube.com/shorts/Q_a7oscaRGg", title: "Social Creed" },
      { url: "https://youtube.com/shorts/bwqgHDFKrMs", title: "Social short" },
      { url: "https://youtube.com/shorts/lhLC8rV7KCw", title: "B360" },
      { url: "https://youtube.com/shorts/q2j57Y6ZzCw", title: "Deer Island" }
    ]
  },
  {
    id: "ugc",
    name: "UGC ads",
    blurb: "Creator-style ads and testimonial edits, cut to look native on the feed.",
    videos: [
      { url: "https://youtube.com/shorts/Jz5SqtefpeU", title: "Centella" },
      { url: "https://youtube.com/shorts/irj9o9hvbSk", title: "UGC ad — 01" },
      { url: "https://youtube.com/shorts/LtclCmFv3XQ", title: "UGC ad — 02" },
      { url: "https://youtube.com/shorts/seh3nGNPQrk", title: "UGC ad — 03" },
      { url: "https://youtube.com/shorts/2yyc1EjnpB0", title: "UGC ad — 04" }
    ]
  },
  {
    id: "ads",
    name: "Ads & commercials",
    blurb: "Hooks, product cutdowns and campaign variants from one set of source media.",
    videos: [
      { url: "https://youtu.be/lKvXI1Zi7SM", title: "Absolute Cosmetics" },
      { url: "https://youtu.be/cRYj_A0NS64", title: "Youth Quran" },
      { url: "https://youtu.be/365sFR0FCvQ", title: "Nightwalker" },
      { url: "https://youtube.com/shorts/SjW1Dbw-U2w", title: "Kabab and Thali" },
      { url: "https://youtube.com/shorts/9pbsdfvrC5A", title: "Prop Firm Expo London — 01" },
      { url: "https://youtube.com/shorts/qT2XxtEU72k", title: "Prop Firm Expo London — 02" }
    ]
  },
  {
    id: "motion",
    name: "Motion animation",
    blurb: "2D and 3D animation, SaaS product explainers and motion graphics.",
    videos: [
      { url: "https://youtu.be/ALAV23pM_Tw", title: "Keytomic — SaaS animation" },
      { url: "https://www.youtube.com/watch?v=dYm-4t_wx6A", title: "Once You Understand Debt — Veen Vox (animated explainer)" },
      { url: "https://www.youtube.com/shorts/n_PKaSt9at4", title: "Thrown in a Well by His Own Brothers — SMALLNUNU (2D animation)" }
    ]
  },
  {
    id: "real-estate",
    name: "Real-estate videos",
    blurb: "Property tours and listing films, paced to sell the space.",
    videos: [
      { url: "https://youtube.com/shorts/3iYT2oa8Y2s", title: "Point Realty — 01" },
      { url: "https://youtube.com/shorts/ZlfxAgpkEsY", title: "Point Realty — 02" }
    ]
  },
  {
    id: "ai",
    name: "AI video",
    blurb: "AI-generated films and scenes — when a shoot isn't the answer or the budget.",
    videos: [
      { url: "https://youtu.be/gz80RXPwF-I", title: "AI-generated film" }
    ]
  }
];
