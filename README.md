# Najaf Ali — portfolio website

A one-page portfolio. Plain HTML, CSS and JavaScript — no build step, no framework.
Drop it on GitHub Pages and it runs.

```
index.html      the page
styles.css      all styling
app.js          nature effects, light/dark, the glowing line, video player
videos.js       >>> the only file you edit to add videos <<<
assets/         portrait, gallery photo, CV, favicon
.nojekyll       tells GitHub Pages to serve the files as-is
```

## 0. The intro video

The big video under your photo comes from `INTRO` at the top of `videos.js`.
Paste a new link and title there to change it. It plays right inside the page.

## 1. Add your YouTube links

Open `videos.js`. Each category has a `videos` list. Add one line per video:

```js
{ url: "https://youtu.be/abc123XYZ99", title: "5-bed villa tour" },
```

Any YouTube link works — `watch?v=`, `youtu.be/` or `shorts/`.

Categories in place: Social media videos (18), UGC ads (5), Ads & commercials (4),
Real-estate videos (2), Motion animation (1).

- The shape is worked out from the link: `/shorts/` links show vertically (9:16),
  everything else 16:9. If a normal link is really vertical, add `vertical: true`.
- A category with both kinds splits itself into a **Landscape** row and a
  **Vertical** row, so nothing looks stretched or cropped.
- Long categories show the first few and a "Show all N videos" button.
- The same link added twice is only ever shown once.
- A category with no links shows as "Links coming soon" and can't be opened.
- To rename a category, change its `name` and `blurb`. Keep the `id` unique.
- Thumbnails come from YouTube automatically. Nothing to upload.

## 2. Testing the videos

YouTube refuses to play inside a page opened straight from your hard drive
(`file:///...`) — that's the **Error 153** you saw. It is not a fault in the site.
Put the files on GitHub Pages (step 3) and the videos play normally inside the page.
To test on your own machine first, run a tiny local server in the site folder:

```
python -m http.server 8000
```

then open `http://localhost:8000`.

Every video also has an "Open on YouTube" link under the player, in case a
particular video has embedding switched off in its own YouTube settings.

## 3. How the line works

The middle of the page is one glowing green line with points on it:
My work · My experience · How I work · Services · Tools & AI · What you get.

- Tap a point → its branch grows out with drawn-line animation, and the items
  spread across the page in rows so the lines never tangle.
- Tap it again → the branch closes.
- Under **My work**, each branch is a category. Tap one → only that category's
  videos open below the line. Tap it again (or "Close videos") → they close.
- Tap any thumbnail → the video plays on your site in a glass lightbox, never
  sending the visitor away to YouTube.

To edit the text on the branches other than My work (experience, process,
services, tools, delivery), open `index.html` and edit the `<li class="leaf">`
lines — they're plain text.

## 4. Put it on GitHub Pages

1. Create a new repository, e.g. `najaf-portfolio`. Make it **Public**.
2. Upload every file and the `assets` folder to the root of the repo
   (`index.html` must sit at the top level, not inside a folder).
3. Repo → **Settings** → **Pages**.
4. Source = **Deploy from a branch**, Branch = **main**, Folder = **/ (root)**. Save.
5. Wait a minute and reload. Live at `https://YOUR-USERNAME.github.io/najaf-portfolio/`

Custom domain: Settings → Pages → Custom domain, then point an `A` record at the
IPs GitHub shows on that screen.

## 5. Updating later

Edit `videos.js` on GitHub directly (open the file → pencil icon → commit).
The live site updates within a minute. Hard-refresh with Ctrl+Shift+R if you
still see the old version.

## The parts that pull clients in

- **Availability pill** in the hero ("Available for new projects"). If you get booked
  up, change the text or delete the `<p class="status">…</p>` line in `index.html`.
- **Showcase rows** under the stats — every video you own, in two rows built
  automatically from `videos.js`: verticals drift right-to-left on top, landscape
  left-to-right underneath. Hovering a row pauses it; clicking plays the video in
  the lightbox. Add links to `videos.js` and they appear here on their own.
- **Packages & hiring** point on the line — fixed packages link straight to your
  Upwork profile (where your packages and reviews live), plus project, retainer and
  full-time options.
- **Mobile action bar** — on phones, WhatsApp and Email sit fixed at the bottom of
  the screen, so a client is never more than one tap from contacting you.

## Look and what moves on the page

Clean, minimal, Apple-style, with a nature feel. Fonts: Inter, with Instrument Serif
for the one italic word in the headline.

- **Light / dark switch** — the sun/moon button in the top bar. The site starts in
  whatever the visitor's device uses and remembers their choice after that.
- **Sunlight through leaves** — soft leaf shadows sway over the page and over both
  photos, with warm light rays in the top corner and slow mist along the bottom.
  The leaf shapes live in `assets/leaves.svg`.
- **Falling leaves** — a few leaves drift down, tumble and get pushed aside by the
  cursor. Scrolling lifts them a little.
- **Day vs night** — in light mode, golden motes float in the sunlight; in dark mode
  they become glowing fireflies.
- **The line** — still draws itself as you scroll, with light particles running
  along it. Its colours follow the light/dark theme.
- **Headline** — words blur in one by one; sections fade up as you reach them;
  the portrait tilts gently toward the cursor.

The old space design (galaxy, whale) is saved on the `backup-space-theme` branch.

## The "Start a project" button

The button in the top bar opens a small card with only your email and phone/WhatsApp,
each with a one-tap **Copy** button. To change them, search `najaf9159@gmail.com` in
`index.html` (it appears in the card, the mobile menu and the contact section).

## Ideas for the next round

Things that would make clients trust the page faster, when you have the material:

1. **Client reviews** — 3–4 short quotes from Upwork with the client's first name and
   country. Strongest trust signal you can add.
2. **Real video titles** — replace "Social edit — 01" in `videos.js` with the brand or
   the result ("Skincare brand — 1.2M views"). Clients scan titles before thumbnails.
3. **A 60–90 second showreel** at the top of My work, as its own category.
4. **Brand logos** you have worked with, in one quiet row under the stats.
5. **Packages or a starting price** — most enquiries stall on "what does it cost".
6. **A short contact form** (Formspree or Netlify Forms) for clients who won't open
   their mail app.
7. **Custom domain + a social preview image** so the link looks premium on WhatsApp.
8. **Analytics** (Plausible or Google Analytics) to see which category gets opened most.

## Built to stay fast

- No blur filters on full-screen layers (they cost more than everything else combined)
  and no SVG glow filters on the line — the glow is drawn as two strokes instead.
- The galaxy renders to an off-screen buffer and only repaints when it has actually
  moved, then gets copied each frame.
- Every animation is time-based, so it runs at the same speed on a slow phone as on
  a fast laptop, and it pauses completely when the tab is in the background.
- Low-power phones get a lighter version automatically: fewer stars, smaller canvas,
  softer blur.

## Notes

- Replace `assets/najaf-portrait.jpg` or `assets/najaf-gallery.jpg` with new photos
  using the same filenames and nothing else needs to change.
- Contact details, stats and section text live in `index.html` — search for the
  text you want to change.
- Fonts (Sora, Manrope) load from Google Fonts, so the page needs internet to look right.
