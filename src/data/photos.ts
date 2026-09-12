/**
 * Every project photograph, resolved through the bundler.
 *
 * WHY THIS EXISTS. The photographs used to live in `public/projects/` and were
 * referenced as the plain string `projects/<name>.jpg`. That is a runtime path:
 * nothing in the build ever looks at it, so it is only ever as good as the
 * folder being there. Serve the built `dist/` yourself and it is — the path
 * resolves from the document URL and the images load, at the root or nested,
 * over http or off the filesystem. All of that was checked, and none of it is
 * the case that matters: a host that ingests the repository and does not carry
 * `public/` across leaves seventeen references pointing at nothing. That is
 * what happened when this was pulled into AI Studio — the logo arrived and the
 * photographs did not.
 *
 * The logo never had the problem, because the logo is imported. An imported
 * asset goes into the module graph, the bundler emits it with a content hash
 * and rewrites every reference to the URL it actually lives at. The photographs
 * now do the same, so they travel with the build the way the logo and the fonts
 * already do, and `public/` holds nothing but the favicon.
 *
 * One glob, eagerly resolved to URLs. Adding a photograph means dropping the
 * file into `src/assets/projects/` — there is no list here to keep in step.
 */

const files = import.meta.glob('../assets/projects/*.jpg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

/** Bare name — `paddington-after` — to the URL the bundler gave the file. */
const byName: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const name = path.slice(path.lastIndexOf('/') + 1).replace(/\.jpg$/, '')
  byName[name] = url
}

/**
 * The URL for a photograph, by its bare file name.
 *
 * Throws in development if the name is wrong, because a typo here is an image
 * that never loads and a page that looks merely empty — the failure this whole
 * module exists to stop. In a production build it returns an empty string
 * instead, so one bad name cannot take the page down with it.
 */
export function photo(name: string): string {
  const url = byName[name]
  if (url) return url

  const known = Object.keys(byName).sort().join(', ')
  if (import.meta.env.DEV) {
    throw new Error(`No photograph named "${name}" in src/assets/projects. Have: ${known}`)
  }
  console.error(`Missing photograph "${name}". Have: ${known}`)
  return ''
}

/** Every name currently in the folder. Used by the media check in the README. */
export const photoNames = Object.keys(byName).sort()
