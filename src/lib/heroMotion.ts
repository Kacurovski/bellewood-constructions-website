/** Shared, deterministic timeline for the photographs and their captions.
 * Four camera moves, with time to look around before and after each move.
 * No wheel interception: every value comes from normal document scroll.
 */
export const HERO_TRAVEL = 4.8
export const MOVE_START = 0.24
export const MOVE_END = 0.96
export const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value))
export const smooth = (value: number) => {
  const t = clamp(value)
  return t * t * (3 - 2 * t)
}

export function heroState(progress: number, count = 5) {
  const time = clamp(progress) * HERO_TRAVEL
  const from = Math.min(count - 1, Math.floor(time))
  const to = Math.min(count - 1, from + 1)
  const local = time - from
  const blend = from === to ? 0 : smooth((local - MOVE_START) / (MOVE_END - MOVE_START))
  return {
    time, from, to, blend,
    active: blend > 0.5 ? to : from,
    // A restrained push, with the arriving photograph settling to the exact
    // scale of the next room. No zoom jump when the texture pair changes.
    outgoingZoom: 1.035 + smooth(local) * 0.025 + blend * 0.09,
    incomingZoom: 1.075 - blend * 0.04,
    blur: Math.sin(blend * Math.PI) * 0.009,
    atmosphere: Math.sin(blend * Math.PI) * 0.16,
  }
}

export function captionState(progress: number, index: number, count = 5) {
  const time = clamp(progress) * HERO_TRAVEL
  const enter = index === 0 ? 1 : smooth((time - index + 0.35) / 0.30)
  const leave = index === count - 1 ? 0 : smooth((time - index - 0.34) / 0.26)
  return { opacity: enter * (1 - leave), y: (1 - enter) * 14 - leave * 10 }
}
