let supported: boolean | null = null

/**
 * Whether this browser can give us a WebGL context at all.
 *
 * Resolved once and cached. Two things ask: SceneFrame, to decide whether to
 * mount a scene, and the process section, to decide whether to pin itself —
 * pinning a visitor in place to watch a drawing that cannot animate would be
 * the worst of both.
 */
export function hasWebGL(): boolean {
  if (supported !== null) return supported
  if (typeof document === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    supported = Boolean(
      canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl'),
    )
  } catch {
    supported = false
  }
  return supported
}
