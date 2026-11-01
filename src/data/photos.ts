/** Only derivatives of the nine approved folders enter the asset graph.
 * The legacy files in the parent directory are deliberately not imported.
 */
const files = import.meta.glob('../assets/projects/approved/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const byName: Record<string, string> = {}
for (const [path, url] of Object.entries(files)) {
  const name = path.slice(path.lastIndexOf('/') + 1).replace(/\.webp$/, '')
  byName[name] = url
}

export function photo(name: string): string {
  const url = byName[name]
  if (!url) throw new Error(`Missing approved photograph: ${name}`)
  return url
}

export const photoNames = Object.keys(byName).sort()
