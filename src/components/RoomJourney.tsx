import { useEffect, useRef, useState } from 'react'
import type { MotionValue } from 'framer-motion'
import { ascotHeroFrames } from '../data/projects'
import { heroState } from '../lib/heroMotion'

/** A two-texture photographic camera move, not a model of the building.
 * A broad, feathered dissolve and a restrained camera drift bridge the stills.
 * It does not invent intermediate rooms or claim to reconstruct their geometry.
 * Render only when scroll/size changes. No permanent animation loop.
 */
const VERTEX = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = vec2((position.x + 1.0) * 0.5, (1.0 - position.y) * 0.5);
  gl_Position = vec4(position, 0.0, 1.0);
}`

const FRAGMENT = `
precision mediump float;
varying vec2 uv;
uniform sampler2D outgoing;
uniform sampler2D incoming;
uniform vec2 viewport;
uniform vec2 sizeA;
uniform vec2 sizeB;
uniform vec2 focusA;
uniform vec2 focusB;
uniform float zoomA;
uniform float zoomB;
uniform float blend;
uniform float shutter;

vec2 crop(vec2 size) {
  float imageRatio = size.x / size.y;
  float screenRatio = viewport.x / viewport.y;
  return vec2(min(screenRatio / imageRatio, 1.0), min(imageRatio / screenRatio, 1.0));
}
vec2 screenFocus(vec2 focus, vec2 size) {
  return clamp((focus - 0.5) / crop(size) + 0.5, vec2(0.18), vec2(0.82));
}
vec4 photograph(sampler2D source, vec2 size, vec2 focus, float zoom, float blur) {
  vec2 origin = screenFocus(focus, size);
  vec2 point = origin + (uv - origin) / zoom;
  vec4 colour = vec4(0.0);
  // Fixed sample count works on WebGL 1 / mobile. Blur exists only in transit.
  for (int i = 0; i < 6; i++) {
    float exposure = (float(i) / 5.0 - 0.5) * blur;
    vec2 ray = point + (point - origin) * exposure;
    vec2 samplePoint = (ray - 0.5) * crop(size) + 0.5;
    colour += texture2D(source, clamp(samplePoint, vec2(0.001), vec2(0.999)));
  }
  return colour / 6.0;
}
void main() {
  vec4 a = photograph(outgoing, sizeA, focusA, zoomA, shutter);
  if (blend <= 0.001) { gl_FragColor = a; return; }
  vec4 b = photograph(incoming, sizeB, focusB, zoomB, shutter * 0.55);
  // The dissolve travels gently across the frame, like a change in light.
  // Most of the blend is uniform: no circular portal or hard wipe edge.
  // Overscan makes both endpoints exact, including on a tall phone screen.
  float passage = dot(uv, vec2(0.92, 0.08));
  float edge = mix(-0.55, 1.55, blend);
  float feather = 1.0 - smoothstep(edge - 0.5, edge + 0.5, passage);
  float reveal = mix(blend, feather, 0.28);
  gl_FragColor = mix(a, b, reveal);
}`

type Texture = { texture: WebGLTexture; width: number; height: number }

export function RoomJourney({ progress, className }: {
  progress: MotionValue<number>
  className: string
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const element = canvas.current
    if (!element) return
    const gl = element.getContext('webgl', {
      alpha: false, antialias: false, depth: false, stencil: false,
      powerPreference: 'low-power',
    })
    if (!gl) return // The HTML photograph stack underneath remains fully usable.

    let disposed = false
    let animation = 0
    let visible = true
    const textures: (Texture | undefined)[] = []
    const images: HTMLImageElement[] = []
    const shaders: WebGLShader[] = []
    let program: WebGLProgram | null = null
    let buffer: WebGLBuffer | null = null
    let unsubscribe = () => {}
    let resizeObserver: ResizeObserver | undefined
    let intersectionObserver: IntersectionObserver | undefined

    const onContextLost = (event: Event) => {
      event.preventDefault()
      setReady(false)
      // Keep the HTML fallback for this visit; avoid repeated context allocation.
      disposed = true
      cancelAnimationFrame(animation)
    }
    element.addEventListener('webglcontextlost', onContextLost)

    try {
      const compile = (type: number, source: string) => {
        const shader = gl.createShader(type)
        if (!shader) throw new Error('Photo shader unavailable')
        shaders.push(shader)
        gl.shaderSource(shader, source)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Photo shader failed')
        return shader
      }
      program = gl.createProgram()
      if (!program) throw new Error('Photo renderer unavailable')
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
      gl.linkProgram(program)
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Photo renderer failed')
      gl.useProgram(program)
      buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW)
      const position = gl.getAttribLocation(program, 'position')
      gl.enableVertexAttribArray(position)
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
      const uniform = (name: string) => gl.getUniformLocation(program!, name)
      const locations = Object.fromEntries(
        ['viewport', 'sizeA', 'sizeB', 'focusA', 'focusB', 'zoomA', 'zoomB', 'blend', 'shutter']
          .map(name => [name, uniform(name)]),
      )
      gl.uniform1i(uniform('outgoing'), 0)
      gl.uniform1i(uniform('incoming'), 1)

      const draw = () => {
        animation = 0
        if (disposed || !visible) return
        const state = heroState(progress.get(), ascotHeroFrames.length)
        const a = textures[state.from]
        const b = textures[state.to]
        // If either requested image isn't decoded, use the HTML stack until it is.
        if (!a || !b) { setReady(false); return }
        const width = element.clientWidth
        const height = element.clientHeight
        if (!width || !height) return
        // Pixel budget is capped for both phones and large high-DPI desktops.
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5, 1920 / width)
        const w = Math.round(width * ratio)
        const h = Math.round(height * ratio)
        if (element.width !== w || element.height !== h) {
          element.width = w
          element.height = h
        }
        gl.viewport(0, 0, w, h)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, a.texture)
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, b.texture)
        gl.uniform2f(locations.viewport, width, height)
        gl.uniform2f(locations.sizeA, a.width, a.height)
        gl.uniform2f(locations.sizeB, b.width, b.height)
        gl.uniform2fv(locations.focusA, ascotHeroFrames[state.from].focus)
        gl.uniform2fv(locations.focusB, ascotHeroFrames[state.to].focus)
        gl.uniform1f(locations.zoomA, state.outgoingZoom)
        gl.uniform1f(locations.zoomB, state.incomingZoom)
        gl.uniform1f(locations.blend, state.blend)
        gl.uniform1f(locations.shutter, state.blur)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
        setReady(true)
      }
      const schedule = () => {
        if (!disposed && !animation && visible) animation = requestAnimationFrame(draw)
      }
      resizeObserver = new ResizeObserver(schedule)
      resizeObserver.observe(element)
      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) schedule()
      })
      intersectionObserver.observe(element)
      unsubscribe = progress.on('change', schedule)

      ascotHeroFrames.forEach((frame, index) => {
        const img = new Image()
        images.push(img)
        img.decoding = 'async'
        img.onload = () => {
          if (disposed) return
          try {
            const texture = gl.createTexture()
            if (!texture) return
            textures[index] = { texture, width: img.naturalWidth, height: img.naturalHeight }
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
            schedule()
          } catch {
            setReady(false)
          }
        }
        img.src = frame.src
      })
    } catch {
      setReady(false)
    }

    return () => {
      disposed = true
      cancelAnimationFrame(animation)
      unsubscribe()
      resizeObserver?.disconnect()
      intersectionObserver?.disconnect()
      element.removeEventListener('webglcontextlost', onContextLost)
      images.forEach(img => { img.onload = null; img.onerror = null })
      textures.forEach(item => { if (item) gl.deleteTexture(item.texture) })
      if (buffer) gl.deleteBuffer(buffer)
      if (program) gl.deleteProgram(program)
      shaders.forEach(shader => gl.deleteShader(shader))
    }
  }, [progress])

  return <canvas ref={canvas} className={className} style={{ opacity: ready ? 1 : 0 }} aria-hidden="true" />
}
