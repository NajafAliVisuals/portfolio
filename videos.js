/* ============================================================
   YOUR VIDEOS — this is the only file you need to edit.

   HOW TO ADD A VIDEO
   1. Find the category below (social, ugc, ads, real-estate, motion).
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

   The same link added twice is only ever shown once.
   A category with no videos shows as "Links coming soon".

   TIP: titles are what clients read first. "Skincare brand — 1.2M views"
   works far better than "Social edit — 03".
   ============================================================ */

const WORK = [
  {
    id: "social",
    name: "Social media videos",
    blurb: "Feed-first edits, Shorts, Reels and long-form — including AI-generated pieces.",
    videos: [
      { url: "https://youtu.be/1vIdOyYMjK4", title: "Social edit — 01" },
      { url: "https://youtu.be/HauYL0c4FQ4", title: "Social edit — 02" },
      { url: "https://youtu.be/R5cwGRul9xI", title: "Social edit — 03" },
      { url: "https://youtu.be/Mp0ElwB8Ngc", title: "Social edit — 04" },
      { url: "https://youtu.be/frQqjyhoIsA", title: "Social edit — 05" },
      { url: "https://youtu.be/z_yx3zWASpU", title: "Social edit — 06" },
      { url: "https://youtu.be/6lCMrmQvbTg", title: "Social edit — 07" },
      { url: "https://youtu.be/nlJf90z3Xe0", title: "Social edit — 08" },
      { url: "https://youtu.be/cL8hhzJFAV8", title: "Social edit — 09" },
      { url: "https://youtu.be/kFhCHFAemLc", title: "Social edit — 10" },
      { url: "https://youtu.be/gz80RXPwF-I", title: "AI-generated film" },
      { url: "https://youtube.com/shorts/bwqgHDFKrMs", title: "Short — 01" },
      { url: "https://youtube.com/shorts/djUwL5_1-Lo", title: "Short — 02" },
      { url: "https://youtube.com/shorts/XQ34vq9r964", title: "Short — 03" },
      { url: "https://youtube.com/shorts/ZXnAinHkZis", title: "Short — 04" },
      { url: "https://youtube.com/shorts/9pbsdfvrC5A", title: "Short — 05" },
      { url: "https://youtube.com/shorts/qT2XxtEU72k", title: "Short — 06" },
      { url: "https://youtube.com/shorts/Q_a7oscaRGg", title: "Short — 07" }
    ]
  },
  {
    id: "ugc",
    name: "UGC ads",
    blurb: "Creator-style ads and testimonial edits, cut to look native on the feed.",
    videos: [
      { url: "https://youtube.com/shorts/irj9o9hvbSk", title: "UGC ad — 01" },
      { url: "https://youtube.com/shorts/LtclCmFv3XQ", title: "UGC ad — 02" },
      { url: "https://youtube.com/shorts/seh3nGNPQrk", title: "UGC ad — 03" },
      { url: "https://youtube.com/shorts/2yyc1EjnpB0", title: "UGC ad — 04" },
      { url: "https://youtube.com/shorts/Jz5SqtefpeU", title: "UGC ad — 05" }
    ]
  },
  {
    id: "ads",
    name: "Ads & commercials",
    blurb: "Hooks, product cutdowns and campaign variants from one set of source media.",
    videos: [
      { url: "https://youtu.be/lKvXI1Zi7SM", title: "Ad — 01" },
      { url: "https://youtu.be/cRYj_A0NS64", title: "Ad — 02" },
      { url: "https://youtu.be/365sFR0FCvQ", title: "Ad — 03" },
      { url: "https://youtube.com/shorts/SjW1Dbw-U2w", title: "Ad cutdown — 04" }
    ]
  },
  {
    id: "real-estate",
    name: "Real-estate videos",
    blurb: "Property tours and listing films, paced to sell the space.",
    videos: [
      { url: "https://youtube.com/shorts/3iYT2oa8Y2s", title: "Property tour — 01" },
      { url: "https://youtube.com/shorts/ZlfxAgpkEsY", title: "Property tour — 02" }
    ]
  },
  {
    id: "motion",
    name: "Motion animation",
    blurb: "Motion graphics, titles, lower thirds and animated brand pieces.",
    videos: [
      { url: "https://youtu.be/ALAV23pM_Tw", title: "Motion animation reel" }
    ]
  }
];
