<img src="https://raw.githubusercontent.com/Kacurovski/bellewood-constructions-website/main/src/assets/brand/bellewood-lockup-green.png" alt="Bellewood Constructions" width="360">

# Bellewood Constructions — website

The public website for Bellewood Constructions, a Brisbane builder of high-end
heritage renovations. Domain: `bellewood.com.au`. Built by Systemations.

> **Status: not publishable.** The project photography is placeholder stock and
> shows other people's buildings; the testimonials were written, not collected;
> the enquiry form has no endpoint; and nothing is measured. See **Open items**
> below before anything goes live. Every one of those is a flag in the code, not
> a note in a document.

**Brand direction lives in `Knowledge/`, which is deliberately not in this
repository** — it holds the client's contracts, fee schedule, personal details
and brand book. Ask Systemations for the Drive folder. On anything to do with
look, colour, type or the mark it is the source of truth and it wins over this
README. `AGENT.md` in the repo root carries the build instructions that
reference it.

---

## Brand assets — use these files, do not redraw the mark

If you are a person or a tool rebuilding this page somewhere else, the logo is
here. It is artwork, not something to approximate: reproduce the file, never a
lookalike generated from the description.

| File | Size | Use |
| --- | --- | --- |
| [`bellewood-lockup-green.png`](https://raw.githubusercontent.com/Kacurovski/bellewood-constructions-website/main/src/assets/brand/bellewood-lockup-green.png) | 900×234 | Default. On light grounds |
| [`bellewood-lockup-reverse.png`](https://raw.githubusercontent.com/Kacurovski/bellewood-constructions-website/main/src/assets/brand/bellewood-lockup-reverse.png) | 900×234 | On Bellewood Green |
| [`bellewood-symbol-green.png`](https://raw.githubusercontent.com/Kacurovski/bellewood-constructions-website/main/src/assets/brand/bellewood-symbol-green.png) | 400×358 | Mark alone, light ground |
| [`bellewood-symbol-reverse.png`](https://raw.githubusercontent.com/Kacurovski/bellewood-constructions-website/main/src/assets/brand/bellewood-symbol-reverse.png) | 400×358 | Mark alone, on green |

Those links are the raw files and are directly usable as image URLs.

Three rules from the Designer Brief, and they are not stylistic preferences:

- the full lockup is **never** rendered below 120px wide
- the symbol is **never** rendered below 24px wide
- the mark is **never** recoloured, stretched, skewed, shadowed **or rebuilt from
  type** — the last one is what an image generator does when it has not been
  given the file

Nothing in this repository renders on its own. `index.html` is an empty shell
that React fills at runtime, and the built output is not committed, so a tool
reading the source finds no page and no image tags. That is why these URLs are
written out here rather than left to be discovered.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static output in dist/
npm run preview    # serve the built output
npm run typecheck
```

`npm run build` produces a `dist/` you can open directly — double-click
`dist/index.html` and the site works, with no server. That is deliberate and
worth preserving (see **Routing and deployment**).

---

## Stack

Vite + React + TypeScript, React Router, CSS Modules. three.js via
`@react-three/fiber` for the three scenes, `framer-motion` for content reveals,
`lenis` for smooth scroll.

No Tailwind, no component library, no design-system defaults. Every token comes
from the brand book and lives in `src/styles/tokens.css`.

Fonts (Archivo, Newsreader) are self-hosted in `src/assets/fonts`. Both are open
licence, so the same files can be installed on Angus's machine and handed to a
signwriter with no fee. There is no Google Fonts request at runtime.

---

## The files you will actually touch

| To do this | Edit this |
|---|---|
| Change the QBCC number, phone, email, socials, domain | `src/config/site.ts` |
| Connect the forms to GHL | `src/config/site.ts` → `forms.endpoint` |
| Swap the logo for the final vector master | `src/config/site.ts` → `brand` |
| Add or edit a project, add photography | `src/data/projects.ts` |
| Drop the trading-name clause on 1 July 2027 | `src/config/site.ts` → set `compliance.tradingNameClause` to `null` |
| Change a colour, type size or spacing step | `src/styles/tokens.css` |
| Change how big the mark is on the job-site mesh | `src/three/SiteMesh.tsx` → `TILE_PX` |

Nothing on this site reads an environment variable. There is one config file and
one data file, on purpose: the build is handed over as static output and finished
inside GHL AI Studio, where the next person needs to find things without a tour.

---

## Layout

```
src/
  config/site.ts        every configurable value, and every OPEN item
  data/projects.ts      every image slot on the site
  styles/               tokens, fonts, global
  components/           Logo, ComplianceLine, ImageSlot, Header, Footer, forms
  sections/             the home page, section by section
  pages/                Home, Work, ProjectDetail, About, Contact, NotFound
  three/                the three scenes, each with its static frame
  hooks/                reduced motion, smooth scroll, section scroll progress
  lib/pipeline.ts       the single form submit path
```

---

## Three things that are load-bearing

### 1. The compliance line

Queensland law requires the licensed name and licence number in advertising.
Bellewood is a trading name until the ASIC change takes effect on **1 July 2027**,
so until then every public-facing surface must carry:

> Bellewood Constructions, a trading name of Angus Cowan Constructions Pty Ltd,
> QBCC Lic. No. 1014350

It is rendered by `<ComplianceLine />` in the sitewide footer, and again in the
rebrand sections on the home and About pages. **After 1 July 2027**: set
`compliance.tradingNameClause` to `null` in `src/config/site.ts`. The clause drops
off, the licence number stays, and that is the whole change.

**The licence number is not confirmed.** Angus holds a company licence (1014350)
and a personal licence (78490). The one that must appear is the one held by the
entity contracting the work; this build assumes the company licence. Nothing may
publish until that is settled.

### 2. The photography is placeholder and must not publish

Angus's real library does not exist yet, so the site is currently dressed with
**stock photographs** from Unsplash (licence: free for commercial use, no
attribution required) in `public/projects/`. They are there so the design can be
reviewed with something in it, and for no other reason.

**Publishing them would present other people's buildings as Bellewood's work.**
That is the one thing on this site that would actually be dishonest. Everything
is set up so it cannot happen by accident:

- every project keeps `placeholder: true`
- `mediaIsPlaceholder` in `src/data/projects.ts` is the single flag to flip
- alt text describes the photograph, and no dollar values, dates or client names
  have been invented anywhere
- the testimonials are the exception, and they are covered on their own below

The one place stock imagery was deliberately **not** used is the About page.
A photograph of a stranger captioned "Angus Cowan" would be a picture of someone
who is not him, so that slot carries a photograph of work instead until a real
portrait exists.

To swap in the real library: drop files into `public/projects/`, point `hero` /
`before` / `after` / `gallery` at them, write real alt text, and set
`placeholder: false`. No layout changes are needed. Every slot also still renders
a designed brand ground when its `src` is null, so the layout holds if a project
arrives without photography.

The placeholder set is about 7MB and unoptimised. Real photography should be
resized and compressed properly before it goes anywhere near production.

The six projects listed are **structure, not fact**. The titles and suburbs exist
so the page could be built and reviewed, and must be replaced with the six to ten
projects Angus names.

**`featured` controls the home page selection; `/work` always shows everything.**
Three or four featured is right. With the flag on every project the two views
showed the same set and the link between them went nowhere new — which is worth
checking again once the real library lands and it is tempting to feature all of
them.

**No project count appears anywhere on the site**, and none should. A number
describes the photo library, not the career behind it: this builder has been
working for more than two decades at around four projects a year, so "6 projects"
on the page undersells him badly. The Work page says "a small number of projects"
instead, which is qualitative, true, and on brand — selectivity is the
positioning, and a total is not the way to say it.

### 3. The logo is not final

Only a small raster exists. `src/assets/brand/` holds the genuine artwork lifted
from the Brand Book PDF, in both colourways. What does **not** exist yet: a vector
master, a separately drawn reverse, a small-size variant with opened counters, and
a solid-fill variant. Those arrive at Milestone 1.

`<Logo />` is the only component that touches logo artwork. Swap the paths in
`brand` and the whole site follows with no layout shift, because the intrinsic
size is read from config alongside them.

Because the small-size variant does not exist, the symbol is **not** used small
anywhere on this site, and the full lockup is never rendered below 120px wide.
`public/favicon.svg` is a stand-in and will fill in at 16px; replace it with the
real favicon set (16, 32, 180, 512) when it lands.

---

## Routing and deployment

Static output only. `vite.config.ts` sets `base: './'` so the build works from any
path.

**Routing is hash-based** (`/#/work`), deliberately. There is no server to rewrite
unknown paths back to `index.html`, and with a relative base a history router's
asset URLs would resolve against the wrong depth on any nested route. Hash routing
needs neither, and it is what lets `dist/index.html` open straight off the
filesystem. If the site later lands somewhere with SPA rewrites configured and
clean URLs are wanted, `HashRouter` in `src/App.tsx` is the one line to change.
In-page anchors travel as a route plus a hash (see the `nav` note in
`src/config/site.ts`), so they keep working either way.

Global CSS is imported **before** `App` in `src/main.tsx`. Rollup emits CSS in
module-graph order; importing it after would put the shared type and ground rules
last and let them override every CSS Module meant to refine them. Keep that line
where it is.

---

## The 3D scenes

Three scenes, each in `src/three/`, each with a static frame that is a real
drawing rather than a blank space:

| Scene | What it says | Static frame |
|---|---|---|
| `HeritageStudy` | A Queenslander with a contemporary extension on the back. The proposition of the business as one object. | `HeritageStudyStill` |
| `SiteMesh` | Job-site mesh: a green field carrying the reverse lockup, passing at walking pace. The signature moment, and Angus's own idea. | `SiteMeshStill` — the same field, hung flat |
| `TimberFrame` | A cabin going up in the order a building actually goes up. Line-work first, then solid, then lit. | `TimberFrameStill` |

### The hero object

`HeritageStudy` is the hero: a Queenslander on stumps with weatherboards, a gable
to the street, a verandah and lit windows — and behind it a new wing in dark
charred timber and glass, boards run vertically against the horizontal ones at
the front. Heritage homes, rebuilt. The join between old and new is the whole job.

It turns about twelve degrees either side of centre on a very slow sine and leans
towards the pointer. No orbit controls and no camera moves: it should read as an
object being considered on a table, not as a product viewer.

**Why it looks like a house rather than a diagram**, in rough order of how much
each contributes:

- **Detail that is actually there.** Corrugations on every roof, fascias and
  gutters at the eaves, verandah brackets, balusters, window mullions, stumps
  and bearers under the floor. Openings are subtracted from the cladding by
  `claddingStrips`, and the same routine gives the cottage horizontal boards and
  the extension vertical ones by swapping its two axes.
- **Image-based lighting.** `StudioSky` generates a small wash-over-sage
  gradient, runs it through the same prefilter three uses for a real HDR, and
  lights the scene with it. It is the difference between a soft gradient across
  every surface and one flat value per face — and it costs one canvas and no
  network request.
- **Filleted edges.** Every member is a rounded box, which is why edges catch
  light instead of reading as cut paper.
- Soft shadows and a shadow-catching ground plane, so it sits on the wash rather
  than floating above it.

**Geometry is merged, not instanced.** Nothing about this building changes shape,
so each member is baked at its true size into one merged geometry per material:
six draw calls, and roughly 240 fps under software rendering. Instancing would
force one shared box scaled per member, and a non-uniform scale distorts a
fillet. The cabin in the process section is the opposite case — its members grow
— so that one stays instanced.

This column has been three things, and the reasons are worth keeping. A flat
outline of the mark extruded in 3D, which read as clip art beside the real
artwork in the header. Then a photograph, which was honest but said nothing the
copy did not already say. Then this, first with the new wing left as line-work on
the idea that a drawing behind a built house would say "drawn, then built" — it
read as unfinished rather than as a drawing convention. The two halves now tell
the same story through material instead.

(`DrawnMark`, `MarkDrawing` and `markPath.ts` were deleted rather than left
unused; the photograph's panel-set reveal moved to the project pages, where it
gives each project a moment of arrival.)

### Testimonials and "What happens next"

Two sections were added late, both answering things the site could not.

**Testimonials** (`sections/Testimonials.tsx`, `data/testimonials.ts`) sit
immediately before the enquiry, which is where another owner's words do the most
work.

**None of the three quotes is real.** They were written to read naturally, on
instruction, so the section could be reviewed as finished design rather than as a
row of empty slots — and the page carries **no visible marker** saying so. That
makes this the single most dangerous thing in the repo. Every other placeholder
here stands in for something and announces itself; a plausible testimonial does
not, and it can go live by accident. Publishing one would be a fabricated
endorsement of a real licensed business — a fake review, and misleading conduct
under the ACL.

Three things stand between it and a launch, and none of them should be removed
until the real quotes are in:

- a block-capital warning at the top of `data/testimonials.ts`
- `testimonialsArePlaceholder`, which logs a warning to the browser console on
  every page load while any entry is still flagged
- open item 19 below

Attribution is a role and a suburb — "Homeowner · Paddington · Renovation" — not
an invented full name, so no fictional person is created and it matches how a
builder normally credits a client anyway. Get written permission for the name and
the suburb before either is published.

**What happens next** is the four-step row above the enquiry form
(`config/site.ts` → `nextSteps`). Someone weighing up a two-million-dollar
renovation will not fill in a form that goes into the dark. Only the first step
is drawn from anything on file — Angus is a sole operator and the missed-call
text-back runs off his own mobile, so an enquiry does reach him directly. Steps
two to four are how this normally goes for a builder of this size, written short
on promises and committing him to no timeframe. **They are not his words.** He
needs to read them back before they publish.

### What moves rather than disappears on a phone

Two mobile layout rules this site now follows, both learned by getting them
wrong first.

**The hero reads headline, then object, then copy.** The 3D house used to sit
above the headline, which meant the first thing on the page was a picture with
nothing to tell you what it was. Putting the object between the two halves of
the copy means both halves have to be siblings of the scene, so `.copyCol` and
`.copy` collapse with `display: contents` below 940px and their children join
the grid directly. They pick up the gutter the collapsed shell was providing.

**Nothing worth showing gets `display: none`.** The detail photograph in the
proposition section used to be hidden below 860px, because between the label and
the heading it read as an interruption. That was the right diagnosis and the
wrong fix — the section lost its only image on the device most people see it on.
It is now its own grid item, placed in the left column on desktop and moved to
the end of the section on a phone, where it closes the section as a landscape
band inside the gutter — aligned with the copy above it, like everything else on
the page. If a thing does not work where it is, move it before you hide it.

### Card rails on a phone

`components/SwipeRow.tsx` is a grid on a wide screen and a swipeable rail below
620px. Three places use it: Selected work on the home page, the Work index, and
the testimonials.

The reason is arithmetic. Six project cards in one column was **nine screens** of
scrolling on a 390px phone, which put the home page at 15.4 screens end to end.
Nobody reaches card six that way. Side by side it is one screen, and the home
page came down to 11.7. The Work page went from 4.7 screens to 2.7.

Two things are worth knowing before changing it.

**The breakpoint is written once, in CSS.** The component does not decide whether
it is a rail — it measures whether the track actually overflows and shows the
counter and progress rule only then. So a `ResizeObserver` catches the
breakpoint being crossed and a rotation, and there is no way to end up with an
indicator sitting under a grid that does not move.

**The peek is the affordance.** Cards are `grid-auto-columns: 76%`, so the next
one is always cut by the right edge. That, plus the counter, is what says the row
moves; nothing else on the card does. The track bleeds to the screen edges with a
negative inline margin and gets that margin back as padding, so the first card
still lines up with the heading above it while the rail runs off both sides.

The track is focusable with `role="group"` while it is a rail, because a region
you can only reach by swiping is a region some people cannot reach at all.

`SwipeRow` owns the columns, the gaps and the list reset. Consumers pass
`columns` and keep only their own spacing — if you find `grid-template-columns`
in a section module next to a `SwipeRow`, the two are fighting and the section
should lose.

Not everything long should become a rail. The four "What happens next" steps
stayed a vertical list on purpose: they are sequential instructions, and hiding
steps three and four behind a swipe is worse than the scroll it saves.

### Responsive

Swept across 320 / 360 / 390 / 414 / 480 / 600 / 768 / 834 / 1024 / 1180 / 1280 /
1440 / 1680 / 1920 / 2560, on every route. No horizontal overflow anywhere and no
console errors. The sweep lives in the harness rather than the repo; what matters
is the rule it enforced: **`scrollWidth` must equal `clientWidth` at every width**.

Two things it caught, both worth knowing:

- The mark in the header and footer is pulled back by a fixed amount so it sits
  on the page grid rather than a clear-space width inside it. That pull was wider
  than the gutter on a phone and hung the mark off the left edge. It is now
  `calc(min(var(--s-5), var(--gutter)) * -1)` — capped at the gutter, so it works
  at every width without a breakpoint.
- Plenty of elements are deliberately wider than their frame — the drifting
  photographs, the hero panels, the honeypot parked at `-9999px`. Those are
  clipped by an ancestor and are not overflow. A checker that does not account
  for that reports dozens of false positives.

**The process section pins on a phone exactly as it does on a desktop.** It just
reads top to bottom instead of left to right: the heading, the four steps, then
the drawing filling whatever height is left and building as you scroll. Once it
is up, the pin releases and the page carries on.

Two earlier versions of this were wrong. The first had no pin at all and the
drawing scrolled away mid-build. The second pinned only the drawing while the
steps scrolled past it, which put the illustration above the words it was
illustrating and left a screen of empty ground at the end.

The layout is a flex column below 900px, with `order` putting the drawing last
and `flex: 1` giving it the remainder. Above 900px, grid areas put it in its own
column. Grid areas are cleared explicitly in the narrow block — leaving them
declared keeps two-column tracks alive even when one column is defined — and the
supporting line under the heading is dropped below 720px tall, where four steps
and a drawing need the room more than it does.

### What the green section is

It is job-site mesh, and it is not a partner or sponsor strip. It came from
Angus directly — the brand book records him on why the reverse lockup on a green
field matters:

> "a whole lot of green with the white logos… they'd say, oh, that's another
> Bellewood."

The book also specifies it: *"Job-site mesh — the highest-value surface Bellewood
owns. Solid green field, reverse lockup, one repeat every 2.5 m. Nothing on it
but the mark and the compliance line."* So the band carries the mark and nothing
else, on purpose.

Three things stop it reading as a sponsor wall, which is what it did at first:

- **Perforation.** The tile is drawn with thousands of fine holes in it. A flat
  green field with logos on it is a logo wall; a perforated one is a scrim. It is
  drawn into the texture rather than the shader so mipmaps handle minification
  and it never turns into moiré.
- **A half-drop repeat.** Two marks per tile, set diagonally. A square grid of
  logos reads as a grid; a half-drop reads as a printed field.
- **It resolves into the ground.** The bottom third of the sheet fades to flat
  Bellewood Green, which is the colour the section is already painted — so there
  is no line where the mesh stops, and the copy below sits on solid ground where
  the fine print stays readable.

The brand artwork is now the **real export set from the shared Drive folder** —
lockups at 900px and symbols at 400px, both colourways. An earlier build ran on
262px versions lifted out of the Brand Book PDF, which was all that was to hand
and which showed as soft edges wherever the mark was drawn large.

**The sheet is sized to the band, and the repeat is counted in screen pixels.**
`TILE_PX` in `three/SiteMesh.tsx` is the one number that sets how big the mark
is, and `tileFor()` shrinks it on a narrow screen so at least two tiles always
fit — at the full size a phone showed one mark sliced in half and another
running off the edge.

Counting in pixels rather than world units also keeps the mark **sharp**. The
source lockup is a 262px raster, so showing it far below its own resolution is
what made it look soft; it now lands near 1:1, with the texture's anisotropy
raised to the renderer's maximum because the sheet is seen at a glancing angle
near the top of the band. This is the one place on the site where the missing
vector master is actually visible — a real master would let the mark be drawn at
any size.

**The whole section stays under a screen height** — around 590px at 1440x900,
610px at 2560x1440, 690px on a phone. It carries one sentence and two short
paragraphs, and at seven hundred pixels it was mostly empty ground. The two
columns bottom-align so the short heading does not leave a hole beneath itself.

**The copy never sits on the mesh.** That was tried twice, both times because it
promised a single unbroken surface, and both times the marks ran straight through
the paragraphs. The fade is what makes the band and the copy read as one thing
without putting text on a pattern.

The credibility strip a builder's site would normally run is the separate
`Credentials` row below it. It carries **no accreditation logos**: putting an
industry body's mark on the page claims a membership, and none of Angus's are
confirmed. Every line there is either a fact already established elsewhere on
this site or a requirement of holding a Queensland licence. If he holds
memberships he wants shown — Master Builders, HIA — they replace those lines,
and they need his confirmation plus the bodies' own artwork.

### Shared between the scenes

- `three/materials.ts` — the palette, for the live scenes and both stills.
- `three/axonometric.ts` — projects a member list to SVG polygons. Both static
  frames use it, so each is guaranteed to be the same building its live scene
  draws rather than a second drawing that has to be kept in step.

**Fitting a scene is measured, never estimated.** Both scenes solve their camera
from the real bounds of their member list — the orthographic one by zoom, the
perspective one by pushing back along its own axis until every corner of the
bounding box is inside the frustum, sampled across the whole drift so the camera
does not breathe in and out as the object turns. Three separate framing bugs on
this site came from guessing an extent by hand. The last one was a bounding box
that expanded every member by half its LONGEST side on all three axes, which
sounds safely conservative and is not: a seven metre cladding board inflated the
box by three and a half metres vertically and the object ended up occupying a
third of its column.

### Which way a roof leans — read this before touching either scene

Three roofs on this site have been built leaning uphill, in three separate
sittings. It is the same arithmetic every time, so here is the rule.

A member rotated by `rx` sits at **y = -z · tan(rx)** along its own length.
The angle is therefore the *opposite* sign to the fall you want:

| you want | you write |
| --- | --- |
| high at **+z**, falling towards -z | `rx` **negative** |
| high at **-z**, falling towards +z | `rx` **positive** |

Getting it backwards does not look like a sign error. It looks like a roof
hovering half a metre off the wall it is supposed to sit on, because the high
end drops into the wall and the low end lifts clear of it. That is exactly what
was wrong with the extension skillion (0.54 clear of its far wall) and the
verandah skillion (0.19 clear of its posts).

Two habits keep it honest, and both are in `heritageMembers.ts` now:

- **Name both ends, derive the angle.** `VER_ROOF_HIGH` and `VER_ROOF_LOW` are
  written down and `VER_FALL` is computed from them. A hand-written `-0.19` is
  how the verandah roof got its lean.
- **Derive what meets it.** The verandah posts take their height from
  `verSoffit()`, the roof's own underside, so they cannot drift apart again.

The gable roof is a separate trap. Its two slopes **mirror**, so up-slope is +z
in world terms on one and -z on the other. `onRoof()` now flips `along` for the
`+1` side; before it did not, and that side's sheet, corrugations, fascia and
gutter were all measured down-slope backwards and ended up pasted along the
ridge instead of hanging at the eave.

**Rectangles follow a rake in one direction only.** The gable infill was
horizontal courses, each cut to the width of its own BOTTOM edge and then
standing 0.21 taller. At this pitch that overshoots the rake by half a metre per
course, so every course sawtoothed out through the roof sheet — the row of tan
wedges that used to step down both sides of the roof. Vertical boards do not
have the problem: a board just stops where the roof line is, so the error is one
board WIDTH rather than one board height times the run over the rise. It is also
the more authentic detail, and it distinguishes the gable from the weatherboard
below it. Barge boards close the small step that is left.

The same rule caught the extension: its side walls run the length of a falling
roof, so each vertical board is cut to the sheet above it. A flat top left them
standing 0.2 proud at the low end.

**A roof that runs under another roof has to clear it across its whole width,
and the binding point is a corner.** The cottage roof falls as |x| grows, so the
verandah sheet — which is flat in x — is closest to it at its own outer corner,
at its highest end. Set by hand at `WALL_TOP + 0.04` the verandah roof cleared
the middle comfortably and drove a 0.36 wide wedge up through the main roof at
both front corners. `VER_ROOF_HIGH` is now solved from `cottageRoofAt()` at the
sheet's own half width, and `scratchpad/harness/clash2.mjs` samples both
skillions against the cottage roof plane and reports any breakthrough.

**Cladding needs something behind it.** The boards are deliberately gapped so
they read as boards, and for a long time there was nothing behind them — so in
the live scene, which draws against a transparent page, every one of those gaps
looked straight through the building: along each course, down the corner joints,
and worst as a bright band under each window sill. `backingPanels()` covers each
wall exactly, cut at the openings own edges rather than on the board pitch, and
the gaps become the shadow line a weatherboard actually casts. Corner boards
close the notch where two cladding planes meet. `claddingStrips()` also rips a
course to fit under a sill or over a head instead of dropping the whole course
wherever it touched an opening.

**The still deliberately skips that backing** (`axonometric.ts`). It paints back
to front, so its gaps already land on whatever is behind them and it has no hole
to fill. It also cannot draw the layer correctly: a painter algorithm sorts whole
faces by one average depth, which cannot separate two surfaces a few centimetres
apart when one is a wall-sized panel and the other is a single board. Biasing the
depth and culling all but the outward face each fixed part of it and neither
fixed it fully. Two coplanar layers are simply outside what the technique can do
— do not try again.

**Set a deck out downwards from its walking surface.** The verandah stumps were
copied from the cottage at the same height and simply stopped 0.29 short of the
boards, with nothing between them — no bearer, no joists, daylight where the
posts should have met the deck. Every layer is now derived from `VER_DECK_Y`:
board, joist, bearer, stump top. Change the deck height and the whole
substructure follows.

**A balustrade is bays between posts, not one long rail.** Rails that spanned the
whole front ran straight through the posts and the balusters bunched against
them. `balustrade(a, b, along, at)` builds one bay; the post line
(`VER_POST_X`) doubles as the bay ends, so the stair opening falls between the
middle pair and every rail dies into a post. It takes an axis, so the same
function returns the balustrade down both ends of the verandah.

**A stair string runs the whole flight.** Cutting it a going short kept its
bottom corner off the ground but left the last tread stranded on its own with
daylight between it and the rest. It now runs the full run and beds into the
ground by the same 60mm the bottom tread does, so the two read as a pair going
into the dirt, and the top runs a little past the deck the way a string does
where it meets a newel.

**The ground is a shadow-only plane, not an opaque floor.** Anything below y=0
stays visible. A raking board cannot meet the deck at one end and the ground at
the other with both ends cut square — one corner always overshoots — so the
stair stringers are cut short at the foot, the way a real string is.
`scratchpad/floatcheck.mjs` walks every member and reports the lowest corner;
only the bottom tread should be under the line, bedded into the dirt.

### Photographs are not still

**The hero** (`components/SlicedImage.tsx`) is set in four vertical panels that
rise into place one after another, with a hairline down each seam as it lands and
then gone. It reads as something being set, which is the same idea as the section
further down the page. After that it drifts with the page as you scroll and leans
a few pixels towards the pointer.

The panels are four identical full-size copies of the photograph, each clipped to
its own band by a single `inset()`. Nothing is offset or resized per panel, so
they cannot fall out of register — an earlier version wrapped each slice and
shifted the image inside it, and sub-pixel rounding left hairline seams down the
finished picture. That version also tripped over the global `img { max-width:
100% }` reset, which silently clamped every slice's image back to one panel wide.

**Every other photograph** has three layers of movement, all in
`components/ImageSlot.tsx` and all on by default:

1. A mask rises as the frame comes into view.
2. The photograph inside settles back from an oversize as it arrives.
3. It then drifts within its frame as the page scrolls, about eleven percent
   either way — roughly 70px of travel on a normal scroll.

The first version was drift alone at half that distance, and it did not register
as motion at all. Arrival plus depth does.

Each layer sits on its own element on purpose. The mask owns `clip-path`, the
photograph owns framer-motion's transform, and a third plain element owns the
hover zoom — CSS and framer-motion writing to the same `transform` means CSS
trying to override an inline style, and losing. The card sets `--media-zoom` and
that element reads it.

Parallax is off in one place: the before-and-after planes, which are already
being dragged.

All of it is off under `prefers-reduced-motion`, where the photographs simply
appear.

**The timber frame is a real building**, not a diagram of one. It is a two-storey
cabin of three hundred-odd members at real sections and real centres: bearers and
joists under the floor, studs at 800, a floor between the storeys, rafters to a
ridge with eaves, then cladding on all four walls, framed and glazed openings, a
roof, a deck with its balustrade, and the lights coming on at the very end.

Windows are real openings. `claddingRects` in `three/frameMembers.ts` subtracts
each opening from its wall and returns the board strips that remain, so the
cladding is generated around the glazing rather than having window shapes stuck
on top of it. Openings are then framed with four members and glazed behind them —
a single panel behind the glass, however thin, sits in front of it on whichever
side the camera is on and turns every window into a black rectangle.

Performance comes from two things. Members are grouped by material into five
instanced meshes plus one line buffer, so the whole building is six draw calls.
And a member that has finished growing is never recomputed — across the section
only a handful are in motion at once, which is what makes three hundred members
affordable on a phone.

An earlier version stopped as a cutaway with the near side left open, so the
frame stayed readable. It read as unfinished rather than as a drawing convention.
The section is called "Drawn, then built", so it now ends built.

### The process section pins

`Process` is the one section on the site that holds still. It is a viewport-tall
sticky stage inside a taller section, and that extra height *is* the timeline:
how far you have scrolled into the section is how far the frame has gone up. It
starts genuinely empty, which is the point — the reader watches the sequence
happen rather than arriving at a finished picture of it. The four steps in the
left column light up in time with it.

Two knobs, both in `Process.module.css`: `--pin` on `.pinned` (how much scroll
the build takes, 130vh) and the trailing padding in the narrow-screen block.
Stage thresholds live in `FRAME_STAGE_STARTS` in `three/frameMembers.ts`, next to
the members they describe.

**It only pins when there is something to watch.** Under `prefers-reduced-motion`,
or with no WebGL, `Process` drops the pin entirely and shows the finished frame —
holding someone in place for two screens of a picture that cannot move would be
the worst possible version of this. `hasWebGL()` in `lib/webgl.ts` is shared with
`SceneFrame` so both make the same call.

Below 900px the full pin is dropped too: a viewport-tall stage cannot hold a
stacked heading, lede, four steps and a drawing without cramming all of them.
There the drawing alone sticks near the top and builds while the steps scroll
past it. The progress mapping is identical, so it still starts empty.

Rules every scene follows, enforced by `SceneFrame`:

- Nothing mounts until the frame approaches the viewport, and three.js is
  code-split away from the entry chunk, so 3D never blocks first paint.
- Under `prefers-reduced-motion` no scene mounts at all; the still frame is the
  whole experience.
- If WebGL is unavailable or fails, the still frame stays and a visitor cannot
  tell anything went wrong.
- Pixel ratio is capped, so a mid-range phone degrades resolution rather than
  frame rate.

**The hero drawing is not the logo.** It is a motion interpretation of the concept
— one continuous line — drawn at large scale. The B is deliberately not drawn: two
attempts read as arrows and as a capital A respectively, and a capital A is the
old Angus Cowan mark this identity is breaking away from. The real artwork sits in
the header directly above it and is never approximated. When the vector master
arrives, replace `HOUSE` in `src/three/markPath.ts` and the scene picks it up.

---

## Forms

Both the enquiry form and the lead magnet post through `src/lib/pipeline.ts` to one
endpoint. Set `forms.endpoint` in `src/config/site.ts` to the GHL inbound webhook
URL and both go live.

Until then submissions are **not** silently dropped: the visitor is told plainly to
call or email instead. An enquiry about a two-million-dollar renovation is not
something to lose to a placeholder.

Both forms carry a honeypot field. It is not a captcha and it is not perfect, but
it is free and it does not make a real person prove anything.

---

## Open items

None of these is invented in code. Each is marked `OPEN:` at the point it matters.

| # | Item | Blocks | Where |
|---|---|---|---|
| ~~1~~ | ~~QBCC licence number~~ — **RESOLVED.** The kickoff capture list records the licence as held by the **company**, which is the entity named in the compliance line, so **1014350** is correct. 78490 is Angus's individual licence. | — | — |
| 2 | **Project photo library** — currently zero images | The showcase, the socials, launch | `data/projects.ts` |
| ~~3~~ | ~~Domain spelling~~ — **effectively resolved.** `bellewood.com.au` resolves and serves a live GoDaddy "Launching Soon" page, so the correct spelling is the one registered. The capture-list field was never filled in, so have Angus confirm on his GoDaddy screen if you want it on paper. | — | — |
| 4 | **Years trading** — 25 in one record, 27 in another. No number appears on the site; copy reads "more than two decades" | About copy | `pages/About.tsx` |
| 5 | **Tagline** — "Quality that's built in" is in use but not carried into the brand book, so it is not in the hero | Hero copy | `config/site.ts` → `site.tagline` |
| 6 | **Logo vector master**, plus reverse, small-size and solid-fill variants | Favicon, small use, print | `config/site.ts` → `brand` |
| 7 | **Favicon set** (16, 32, 180, 512) and the 1000x1000 social avatar | Milestone 1 | `public/favicon.svg` |
| 8 | **GHL form endpoint** | Every enquiry | `config/site.ts` → `forms.endpoint` |
| 9 | **Lead magnet PDF** — the 18-point checklist | Milestone 2 | `config/site.ts` → `forms.leadMagnet.file` |
| 10 | **Facebook and LinkedIn page URLs** | Footer links | `config/site.ts` → `social` |
| 11 | **Email mailbox** — the address is confirmed as `angus@bellewood.com.au`; the mailbox itself still has to be created on the domain | Contact form notifications, and the address on the page | DNS / Microsoft 365 |
| 12 | **Open Graph share image** | Social sharing | `index.html` |
| 19 | **Real testimonials — blocking.** The three quotes on the page are written, not collected, and nothing on the page says so. They must be replaced before launch; written permission is needed for each name and suburb | Publishing them would be a fake review | `data/testimonials.ts` |
| 20 | **Angus to confirm the "What happens next" steps** — steps two to four are conventional, not his | The enquiry section | `config/site.ts` → `nextSteps` |
| 16 | **Analytics and conversion tracking** — none is installed. Nothing on this site is measured yet | Reporting, and the monthly performance report the SLA commits to | not yet built |
| 18 | **The existing site carries the wrong ABN.** `anguscowanconstructions.com.au` shows ABN 39 113 772 535, which belongs to Trilogiq Australia Pty Ltd (Kilsyth VIC, deregistered 2017), plus a Victorian address, a Melbourne phone and fax, and **no QBCC licence number at all**. Angus's real details are ABN 19 512 919 083 / ACN 101 528 698. Worth checking whether the same wrong ABN is on his invoices, quotes and contracts. | Compliance, on the live site today | outside this repo |
| 17 | **bellewood.com.au is already live** on GoDaddy's website builder with a "Launching Soon" page and its own contact form. Going live means repointing it, and any addresses collected there need retrieving | Launch | DNS / GoDaddy |
| 13 | **Replace every placeholder photograph** and flip `mediaIsPlaceholder` | Publishing anything at all | `data/projects.ts` |
| 14 | **A portrait of Angus**, if he wants one on the About page | About page | `data/projects.ts` → `stills.onSite` |
| 15 | **Industry memberships** — Master Builders, HIA or similar, if he holds any | The credentials row | `config/site.ts` → `credentials` |

One CSS trap worth recording, since it cost a visible bug: `margin: 0` on an
element that also carries `.shell` wipes the `margin-inline: auto` that centres
the page grid, and the element sits hard against the left edge of the viewport
while everything above it stays centred. Use `margin-block: 0`.

---

## Things not to do

- **No blue.** The old mark was a blue architectural A. The site breaks clean to
  green, and green in a market of blue and grey is the single most valuable
  decision in this identity. This extends to photography at hero scale: a hero
  image that reads blue would undo that decision as surely as a blue heading, so
  the hero is chosen warm. A blue house further down the page, at card size, is
  just a house.
- **Do not present the rebrand as a new company.** Angus is explicit that it must
  not read as phoenixing. The line is: same builder, same licence, same family,
  new name.
- **Do not link or reference the Google Business Profile.** It stays under Angus
  Cowan Constructions until 1 July 2027 to protect the review history.
- **Do not put a years-trading number on the page** until item 4 is settled.
- **No all-caps headings.** Headings are sentence case; uppercase is for eyebrows
  and labels only, and used sparingly.
- **Do not recolour, stretch, skew, shadow or retype the mark**, and never rebuild
  the wordmark from a font.
