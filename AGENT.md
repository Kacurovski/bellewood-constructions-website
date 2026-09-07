# Bellewood Constructions — Website Build Agent Prompt

Paste this into the agent as the project instruction. Keep it in the repo root as `AGENT.md` so every session reloads it.

---

## 0. Read before you write a single line

The `Knowledge/` folder is the source of truth. Read all of it before planning, in this order:

1. **Brand book** (highest authority on look, colour, type, spacing, restraint)
2. **Designer brief** (logo rules, lockups, clear space, minimum sizes, acceptance tests)
3. **Service Level Agreement** (what the site must actually do: forms, lead magnet, uptime)
4. **Client info / meeting notes** (Angus's own words, sensitivities, the rebrand story)
5. `designExamples.html` (motion references only, not visual language)

`.docx` files are zip archives. Read them with:
`unzip -p "FILE.docx" word/document.xml | sed -e 's/<w:p[^>]*>/\n/g' -e 's/<[^>]*>//g'`

Do not start planning until you can state, in your own words: who the two audiences are, why green, and why the compliance line exists. If the knowledge folder contradicts this prompt, the knowledge folder wins on brand and the prompt wins on stack and deployment.

---

## 1. Mission

Build the public website for **Bellewood Constructions**, a Brisbane builder of high-end heritage renovations, rebranding after more than two decades of trading. Domain: `bellewood.com.au`.

The one job: carry an established reputation forward under a new name so nobody wonders whether this is a different builder. It must not read as a new company.

Two audiences:

- **Homeowners** with heritage or older inner-Brisbane homes considering a $2M to $4M renovation. They need trust, craft and proof.
- **Architects and designers**, the referral engine, arriving from LinkedIn outreach. They need to see a builder who works cleanly from drawings and will not embarrass them.

Business shape to reflect: roughly four projects a year. This is not a lead-volume site, it is a few very good enquiries site. Selectivity is on brand.

---

## 2. Stack and deployment constraints

**Stack: React.** Vite + React + TypeScript. React Router for routes.

3D: `three` with `@react-three/fiber` and `@react-three/drei`.
Motion: `framer-motion` for UI transitions, `gsap` ScrollTrigger or `@react-three/drei` scroll controls for scroll-driven scenes, `lenis` for smooth scroll.
Styling: CSS Modules or vanilla CSS with custom properties. No Tailwind, no component library, no design-system defaults. Every token comes from the brand book.

**The build is handed over via GitHub and finished in GHL AI Studio (Systemations). That dictates hard rules:**

- Static output only. No SSR, no Node runtime, no server-side rendering step, no serverless functions.
- `vite.config.ts` must set `base: './'` so the build works from any path.
- Self-host fonts in `/public/fonts`. Archivo and Newsreader are open licence, so no Google Fonts CDN call.
- No environment variables at runtime. All config lives in one committed file, `src/config/site.ts`.
- Keep the dependency list short and the bundle lean. Every added library is a migration cost later.
- Commit clean, readable component files with obvious names. Another agent or a human finishes this inside GHL, so no clever abstractions, no barrel-file mazes.
- `npm run build` must produce a working `dist/` that can be opened and inspected without a server.
- README documents build, deploy and exactly which files to touch to swap the logo, add a project, or change the compliance line.

---

## 3. Brand system, locked

| Name | Hex | Role |
|---|---|---|
| Bellewood Green | `#1C4129` | Primary. Mark, headings, solid grounds |
| Deep Pine | `#10251A` | Body text, fine rules |
| Wash | `#F7F9F0` | Page ground. Green-tinted off-white, not a warm cream |
| Sage | `#AFC3B0` | Panels, dividers. Never body text |
| Silky Oak | `#9A7B4F` | Timber accent, sparingly. Fails text contrast, decorative only |
| Paper | `#FFFFFF` | Clean print surfaces |

Balance roughly 60 ground / 30 green / 10 accent. The green should feel placed, not poured. Timber accent appears at most once per screen.

Safe pairs: Deep Pine on Wash, Wash on Green, Green on Wash, Green on Sage for headings and short passages only.

**Type.** Archivo for headings, nav, labels and anything uppercase. Newsreader for body and long-form project stories.

| Role | Face | Weight | Case and tracking |
|---|---|---|---|
| Display heading | Archivo | 700 | Sentence case, -0.02em |
| Section heading | Archivo | 600 | Sentence case, -0.01em |
| Eyebrow / label | Archivo | 600 | UPPERCASE, +0.12em |
| Body | Newsreader | 400 | Sentence case |
| Pull quote | Newsreader | 300 | Sentence case |

Headings are sentence case, never all-caps display. Uppercase is reserved for eyebrows and labels, and use those sparingly rather than stacking one above every section.

Body line length under 75 characters. Newsreader gets generous line height.

**Logo.** Only a 348 x 195 raster PNG exists. No vector, no reverse variant, no small-size variant yet. Final files arrive at Milestone 1, after you start.

- Build `<Logo />` as a single component reading from `src/config/site.ts`, so a PNG swaps for an SVG in one place.
- Full lockup minimum 120px wide. Do not go small in the header, the small-size symbol variant does not exist yet.
- Clear space on all four sides equals the height of the roof pitch.
- Never recolour, stretch, skew, add shadow, glow or gradient, or retype the wordmark.
- Favicon and social avatar slots stubbed and documented.

---

## 4. Legal, non-negotiable

Until 1 July 2027 every public-facing surface carries:

> Bellewood Constructions, a trading name of Angus Cowan Constructions Pty Ltd, QBCC Lic. No. 1014350

Queensland law, not a design preference. Sitewide footer.

Build it as `<ComplianceLine />` reading `licenceNumber` and `tradingNameClause` from `src/config/site.ts`, so the clause is deleted in one place after 1/7/27 and the licence number stays.

The number `1014350` is **not confirmed**. Angus holds a company licence (1014350) and a personal licence (78490). Never hardcode it inline. Leave a `// UNCONFIRMED` comment on the config value.

---

## 5. The photography blocker, design around it

**There are zero project photos.** More than two decades of heritage renovation is the entire differentiator and the library does not exist yet.

So:

- Every image is a slot fed from `src/data/projects.ts`. Adding real photography later must be a data edit, not a layout rebuild.
- The page must hold without photography. Carry it with typographic space, the green ground, material texture and detail crops as structure.
- Do not build a layout that collapses into empty grey boxes. Placeholders are green or sage grounds with a project title and a location, never a broken-image icon or a stock photo.
- Plan the showcase for 6 to 10 projects. Design the before / after treatment now even though it holds placeholders.

---

## 6. 3D and motion doctrine

The reference sites are for motion **quality**, not visual language. Steal the smoothness, not the shapes. Angus dislikes bling and reads hype as a red flag. His words: "I'm not into sort of real high-blingy stuff, simple but classy."

Resolve it as **restraint with motion, not effects.** The 3D exists to tell the story of the business: timber, craft, a continuous line, the same builder under a new name.

**Do:** slow scroll-driven reveals, long-lens or orthographic cameras, matte materials, weighted easing, parallax on architectural imagery, subtle depth on project cards, one hero moment with real craft in it.

**Never:** floating 3D objects, spinning geometry, particles, glassmorphism, neon glow, bouncy easing, chrome or glass materials, anything that reads as a tech startup rather than a builder.

Spend the boldness in one place. Everything around it stays quiet.

### The four 3D moments, in priority order

**1. The mark drawn as one line (hero).**
The symbol is a pitched roof drawn as one continuous line with the B formed inside it, sharing the house wall as its spine. Extrude that path as a thin ribbon in 3D and draw it on load as a single unbroken stroke, then settle it to a near-flat resting angle. It is the brand concept made literal: one line, one build, no seams. Under 2 seconds. Runs once per session, not on every route change.

**2. The site mesh section.** This is the signature moment and it comes from Angus directly. He loves the reverse lockup, white on a solid green field, because of how job-site mesh reads from the street: "a whole lot of green with the white logos, they'd say, oh, that's another Bellewood."

Build a full-bleed Bellewood Green section as a subtly displaced mesh plane, fabric-like, with a slight sag and a very slow ripple, carrying the repeated white reverse lockup. Camera drifts past at walking pace on scroll, as if passing a hoarding. This section holds the "same builder, same licence, same family, new name" story. If one thing on this site is memorable, it is this.

**3. The timber frame assembly (process section).**
An orthographic, drawing-like frame that assembles across scroll: bearers, studs, the roof pitch, then cladding. Line-work first, then solid timber. It says predominantly timber, it says works cleanly from drawings, and it reassures someone making a $2M decision that there is a sequence behind it. Muted, no shadows theatre, no camera swoops.

**4. Before and after with depth.**
Two planes at different z, revealed by scroll or drag rather than a slider handle with a chevron. Heritage before and after is the strongest asset Angus owns. Build the treatment now, fill it with placeholders.

Timber material is the only place Silky Oak appears in 3D, and once per screen at most.

### Performance and accessibility floor

- `prefers-reduced-motion` returns a static rendered frame for every 3D scene. Not a blank space, an image.
- 3D never blocks first paint. Lazy-load scenes, `<Suspense>` with a brand-coloured fallback, hero copy is server-rendered HTML that appears immediately.
- Architects browse on phones from site. Target 60fps on a mid-range Android, degrade geometry and pixel ratio rather than dropping frames.
- Total three.js payload code-split and under control. If a scene cannot hold the budget, ship the static frame.
- Visible keyboard focus, semantic headings, alt text on every image slot, colour contrast per the safe pairs above.

---

## 7. Pages

**Home**
1. Hero: full-bleed heritage photography slot, restrained wordmark, one line of positioning, the drawn-line mark moment
2. The proposition: heritage renovation in inner Brisbane, in timber
3. Selected projects: 6 to 10, before and after where it exists
4. The green section: reverse lockup, site mesh, the same builder new name story
5. How it works: process, the timber frame assembly, reassurance for a $2M decision
6. Architects and designers: a short collaboration signal
7. Enquiry
8. Footer with the compliance line

**Projects**: index plus individual project stories, Newsreader long-form, heritage before and after.
**About**: Angus, the licence, the continuity story, the name.
**Contact**: the enquiry form.

Keep it tight. Fewer, better pages match the brand and the number of projects he takes.

---

## 8. Functional requirements

- **Enquiry form posts to the Systemations CRM (GHL).** This is the whole point of the site. Every submission lands in the pipeline. Build the submit handler against a single `formEndpoint` config value with a clearly marked placeholder, so the GHL webhook drops in later.
- **Lead magnet:** an 18-point checklist for first-time home builders (working concept). Email capture into the same pipeline. Also used by the Instagram automation, so the capture component is reusable.
- **Missed-call text-back runs off Angus's mobile.** Surface `0417 751 521` prominently, tap-to-call on mobile. It is the first visible win.
- Email sends from `@bellewood.com.au`. Match form notification addresses to that.
- Link Facebook, Instagram, LinkedIn. Instagram is `@anguscowan_constructions`, being rebranded, not replaced.
- Uptime target 99.5% monthly. Keep the build light and simply hostable.

---

## 9. Facts you can put on the page

Name: Bellewood Constructions. Meaning: "Belle" (beautiful) plus "wood" (what he builds with). Principal: Angus Cowan, Director. Work: high-end renovations and extensions on heritage and older homes, inner Brisbane, predominantly timber. Also apartment refurbishments. Scale: around four projects a year, $2M to $4M. Location: Brisbane and the coast.

---

## 10. Do not

- **Do not put a years-trading number on the page.** Documents conflict, 25 versus 27. Write copy that works without it ("more than two decades").
- **Do not present the rebrand as a change of company.** Angus is explicit it must not read as phoenixing. The story is: same builder, same licence, same family, new name.
- **Do not reference or link the Google Business Profile.** It stays as Angus Cowan Constructions until 1/7/27 to protect the reviews.
- **No blue anywhere.** The old mark was a blue architectural A. The site breaks clean to green.
- **Do not invent answers to open items.** Mark them `// OPEN:` in code and list them in the README.
- Do not build "Quality that's built in" into the hero. The tagline carry-forward is unconfirmed.

**Open items to leave configurable:** QBCC number (1014350 vs 78490), domain spelling (ASIC and email say Bellewood, one note recorded "bellwood"), years trading, tagline, the photo library.

---

## 11. Working method

Work in two passes.

**Pass one, plan.** Before writing code, produce a short design plan: token system, type scale, layout concept with ASCII wireframes for Home, the 3D scene list with what each one says about the business, and the component tree. Then review it against the brand book. Anything that reads like a generic default rather than a choice made for this builder gets revised, and say what you changed and why. Nothing gets built until the plan holds.

**Pass two, build.** Then write the code, section by section, screenshotting and critiquing as you go. Before finishing, remove one thing.

---

## 12. Definition of done

1. `npm run build` produces a static `dist/` that opens and works with `base: './'`.
2. The compliance line appears sitewide and is changeable from one config value.
3. Logo, favicon and social avatar swap from one config value with no layout change.
4. Every image is a slot in `src/data/projects.ts`, and the page still reads well with all of them empty.
5. Every 3D scene has a static fallback under `prefers-reduced-motion` and holds frame rate on a mid-range phone.
6. Enquiry form and lead magnet both post to one clearly marked endpoint, ready for the GHL webhook.
7. No blue, no all-caps headings, no stock photography, no invented facts.
8. README lists every open item and every file a future editor touches.
