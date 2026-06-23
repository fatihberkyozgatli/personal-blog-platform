# Pages from the Red Diary: Design System

> The visual language is **Ottoman/Persian editorial**: warm ivory parchment, deep oxblood
> panels, muted gold, Persian blue, illuminated-manuscript borders and arabesque floral ornament.
> Calm, contemplative, literary. Reference wireframe: `documentation/wireframes.png`.

---

## 1. Brand Palette

Tailwind theme tokens (define in `tailwind.config.ts`). Hexes are starting values, tune against
the wireframe during build.

| Token         | Hex        | Role |
|---------------|------------|------|
| `ivory`       | `#F7EFDD`  | Page background (warm parchment) |
| `parchment`   | `#FBF6EA`  | Card / raised surfaces |
| `maroon`      | `#6E1423`  | Primary dark: hero panel, footer, "Latest Posts" rail |
| `maroon-700`  | `#5A1019`  | Hover / deeper maroon |
| `gold`        | `#C9A24B`  | Accent: CTAs, dividers, ornament, "Featured" labels |
| `persian`     | `#1F4E79`  | Persian blue: domes, links, secondary accent |
| `emerald`     | `#2E5E4E`  | Foliage green, sparing accent |
| `clay`        | `#B5512F`  | Terracotta, floral detail accent |
| `ink`         | `#2B2018`  | Primary text (dark warm brown) |
| `ink-muted`   | `#6B5D4F`  | Secondary text / metadata |

Borders and ornament use `gold` at low opacity; section dividers use a small gold diamond/floret
motif (a `✦`-like mark) as seen in the wireframe.

---

## 2. Typography

| Use            | Family                | Notes |
|----------------|-----------------------|-------|
| Display / headings | **Playfair Display** (serif) | High-contrast editorial serif for hero and post titles. (Cormorant Garamond is an acceptable alternative for very large display.) |
| Body / UI      | **Inter** (sans)      | Long-form reading, nav, buttons, metadata. |

- Both load via `next/font/google` (self-hosted, no layout shift). Optional self-hosted files
  may live in `public/fonts/`.
- Headings: generous size, tight-ish leading, normal weight (the elegance comes from the serif,
  not boldness). Accent words (e.g. "Heart", "Soul") may be set in `maroon`.
- Body: about 18px, relaxed line-height (about 1.7) for the editorial reading feel.

---

## 3. Layout & Components

**Global chrome**
- **Header:** wordmark + tagline "Thoughts. Stories. Reflections."; centered nav
  (Home, Blogs, Categories, About, Contact) with a gold underline on the active item; search
  icon; gold **Sign Up** button. Thin illuminated gold border framing the page top.
- **Footer:** maroon panel with arabesque florals; a single Navigate column with admin-powered
  social icons (Instagram, YouTube, Email; no Twitter) and a copyright line. The Categories/Contact
  columns were intentionally dropped — see `TODOs.md`. A decorative Ottoman manuscript fragment
  panel sits at the right.

**Landing page (from wireframe)**
1. **Hero:** ivory panel with an arched, ornamented border (mihrab-like frame) and floral
   margin; headline "Thoughts from the Heart, Stories from the Soul." plus intro and a gold
   "Explore Latest Posts" CTA. Beside it, a **maroon "Latest Posts" rail** with 3 stacked cards
   (category label, title, date).
2. **Featured post:** large Persian-miniature image on the left; "✦ Featured Post ✦" label,
   title, summary, meta (category, date, read time), "Read More" CTA.
3. **Explore by Category:** row of arched cards, each with a gold floral emblem and category name
   (Reflections, Faith, History, Literature, Society, Personal Growth).
4. **Latest Posts grid:** 4 cards (image, category label, title, date, excerpt, "Read More").
5. **"Join the Journey"** newsletter band: maroon, email input plus gold Sign Up.

**Cards**
- Parchment surface, subtle gold hairline border, small category label in gold uppercase,
  serif title, muted metadata with a small calendar/clock glyph.

**Post detail**
- Selected direction: **Red Diary longform**. The masthead-style opening uses "The Red Diary",
  date, expressive title, excerpt, reading time/view count, and a restrained gold ornament. The
  cover image uses the quieter framed treatment (rounded parchment frame, not an arch). The body
  sits in a narrow, readable column inside a protected ivory/parchment reading panel. Desktop adds
  a `Diary Index` sidebar and related entries are labeled `From the Diary Archive`.

**Buttons**
- Primary: gold fill, ink text, slight letter-spacing. Secondary: maroon outline/fill.

**Ornament**
- Reusable corner/border SVGs and a divider floret. Keep ornament as decorative `aria-hidden`
  assets; never required for meaning.

---

## 4. Admin Aesthetic

The admin reuses the palette but calmer and denser: ivory background, maroon sidebar, gold active
state, parchment cards/tables. The dashboard surfaces per-post view counts and like counts. The
Tiptap editor surface mirrors the public `prose` styles so the author sees roughly what readers
will see. `/admin/about` includes both the full About live preview and a focused post-page author
card preview. `/admin/contact` manages public contact details and footer social links. Image upload
areas support click-to-upload and single-file drag-and-drop.

---

## 5. Accessibility

- Verify contrast for gold-on-ivory and any text on maroon (use the lighter parchment/ivory for
  text on maroon, not pure gold for body copy).
- Ornament is decorative (`aria-hidden`); focus states visible (maroon ring; gold fails the 3:1 non-text contrast on ivory); respect
  `prefers-reduced-motion`.

> Schema/RLS: see `database.md`. System architecture and flows: see `architecture.md`.
