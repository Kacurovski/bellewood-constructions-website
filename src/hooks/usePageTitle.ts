import { useEffect } from 'react'
import { site } from '../config/site'

/**
 * Sets the document title. Passing null uses the site's own title.
 *
 * This is a static single-page build, so titles are set at runtime rather than
 * rendered per page. Search engines execute JavaScript, but if organic search
 * becomes a priority a prerender step at build time is the next move, and it
 * would read from exactly these calls.
 */
export function usePageTitle(title: string | null) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : `${site.name} — ${site.description}`
  }, [title])
}
