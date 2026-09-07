import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { brand } from '../config/site'

/**
 * Scene 2 — the site mesh. The signature moment, and it comes from Angus.
 *
 * He wants the reverse lockup, white on a solid green field, because of how
 * job-site mesh reads from the street: "a whole lot of green with the white
 * logos... they'd say, oh, that's another Bellewood." Job-site mesh is the
 * highest-value surface this business owns, and this section is that surface.
 *
 * A green scrim hung across a hoarding: tied along the top, sagging under its
 * own weight, moving very slightly. The camera passes it at walking pace as you
 * scroll, the way you would pass a real one. Nothing else is on it but the mark,
 * exactly as the brand book specifies for the real thing.
 */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSag;
  uniform float uRipple;

  varying vec2 vUv;
  varying float vShade;

  // Hung from the top edge, so it sags most across the middle and falls away
  // towards the bottom hem.
  float sagAt(vec2 uv) {
    float across = sin(uv.x * 3.14159265);
    return -uSag * across * (1.0 - uv.y * 0.28);
  }

  // Very slow, very small. Fabric breathing, not flapping.
  float rippleAt(vec2 uv, float t) {
    float damp = smoothstep(1.0, 0.30, uv.y);
    return uRipple * damp * (
        sin(uv.x * 5.5 + t * 0.50) * 0.60
      + sin(uv.y * 3.6 - t * 0.38) * 0.40
      + sin((uv.x + uv.y) * 8.5 + t * 0.29) * 0.22
    );
  }

  float heightAt(vec2 uv, float t) {
    return sagAt(uv) + rippleAt(uv, t);
  }

  void main() {
    vUv = uv;

    vec3 p = position;
    float h = heightAt(uv, uTime);
    p.z += h;

    // Slope from finite differences, for a cheap matte shading term. There is
    // no light rig here — a scrim in daylight has no specular to speak of.
    float e = 0.012;
    float hx = heightAt(uv + vec2(e, 0.0), uTime);
    float hy = heightAt(uv + vec2(0.0, e), uTime);
    vec3 n = normalize(vec3(-(hx - h) / e, -(hy - h) / e, 1.0));
    vShade = clamp(dot(n, normalize(vec3(-0.30, 0.45, 1.0))), 0.0, 1.0);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec2 uRepeat;
  uniform vec2 uOffset;
  uniform vec3 uGround;

  varying vec2 vUv;
  varying float vShade;

  void main() {
    vec3 col = texture2D(uMap, vUv * uRepeat + uOffset).rgb;

    // Shading stays narrow. The green must not crush towards black at the
    // folds. It is the one thing in this identity that has to stay consistent
    // from a business card to a five metre run of mesh, and that holds here too.
    float shade = 0.84 + vShade * 0.26;

    // The sheet is folded over its rail along the top edge, so that strip sits
    // in its own shadow.
    shade *= 1.0 - smoothstep(0.955, 1.0, vUv.y) * 0.3;

    // The bottom of the sheet resolves into flat Bellewood Green, which is the
    // colour the section itself is painted. That is what removes the hard edge
    // where the mesh stops: the last row of pixels is already the background.
    float settle = smoothstep(0.0, 0.32, vUv.y);
    col = mix(uGround, col, settle);
    shade = mix(1.0, shade, settle);

    gl_FragColor = vec4(col * shade, 1.0);

    // Working space is linear; the framebuffer is sRGB. Without this the green
    // is written straight through and renders almost black.
    #include <colorspace_fragment>
  }
`

/**
 * The mesh itself, drawn to a canvas: green ground, perforation, and the mark.
 *
 * The perforation is the point. A flat green field with logos on it reads as a
 * sponsor wall; a field with thousands of fine holes in it reads as the scrim it
 * is meant to be. Drawing it into the texture rather than the shader means
 * mipmaps handle minification and it never aliases into moiré.
 *
 * Spacing follows the brand book — one repeat every 2.5 m, nothing on it but the
 * mark — so at the distance this is seen from you get two or three across, not a
 * grid of a dozen.
 */
function useMeshTexture() {
  const [sheet, setSheet] = useState<{ texture: THREE.CanvasTexture; aspect: number } | null>(
    null,
  )

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = brand.lockup.reverse

    img.onload = () => {
      if (cancelled) return

      // Two marks per tile, set diagonally, which makes the repeat a half-drop
      // rather than a grid. A square grid of logos reads as a sponsor wall; a
      // half-drop reads as a printed field, which is what mesh is.
      //
      // The mark is drawn at a fixed size rather than a multiple of the source.
      // The source is 900px wide; scaling that up would build a canvas several
      // thousand pixels across for a mark that is never shown above about 200,
      // and downscaling a large source is what keeps the edges clean.
      const markW = 480
      const markH = Math.round((markW * img.height) / img.width)
      const cellW = Math.round(markW * 1.5)
      const cellH = Math.round(markH * 1.95)
      const w = cellW * 2
      const h = cellH * 2

      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.fillStyle = '#1c4129'
      ctx.fillRect(0, 0, w, h)

      // Perforation. Fine, regular, and slightly irregular in weight so it does
      // not read as a printed dot screen.
      const pitch = 10
      ctx.fillStyle = 'rgba(6, 20, 12, 0.5)'
      for (let y = 0; y < h; y += pitch) {
        for (let x = 0; x < w; x += pitch) {
          ctx.fillRect(x, y, 3, 3)
        }
      }

      ctx.imageSmoothingQuality = 'high'
      for (const [cx, cy] of [
        [cellW * 0.5, cellH * 0.5],
        [cellW * 1.5, cellH * 1.5],
      ]) {
        ctx.drawImage(img, Math.round(cx - markW / 2), Math.round(cy - markH / 2), markW, markH)
      }

      const tex = new THREE.CanvasTexture(canvas)
      tex.colorSpace = THREE.SRGBColorSpace
      tex.wrapS = THREE.RepeatWrapping
      tex.wrapT = THREE.RepeatWrapping
      tex.minFilter = THREE.LinearMipmapLinearFilter
      tex.anisotropy = 8
      tex.needsUpdate = true
      setSheet({ texture: tex, aspect: w / h })
    }

    return () => {
      cancelled = true
    }
  }, [])

  return sheet
}

/**
 * On-screen width of one tile, in CSS pixels. Each tile holds two marks, so a
 * mark lands at roughly a third of this.
 *
 * Sizing in pixels rather than world units is what keeps the mark the same size
 * on every screen and keeps it sharp: the source lockup is a 262px raster, and
 * displaying it far below that is what made it look soft. It is now shown near
 * its own resolution.
 */
const TILE_PX = 540

/**
 * Never so large that fewer than about two tiles fit across the band. At the
 * full size a phone showed one mark sliced in half and another running off the
 * edge, which reads as a broken image rather than as a repeat.
 */
const tileFor = (width: number) => Math.min(TILE_PX, width / 1.7)

function Scrim({ progress }: { progress: React.MutableRefObject<number> }) {
  const material = useRef<THREE.ShaderMaterial>(null)
  const sheet = useMeshTexture()
  const { viewport, gl } = useThree()

  // The sheet is seen at a glancing angle near the top, where anisotropic
  // filtering is the difference between a crisp mark and a smear.
  useEffect(() => {
    if (!sheet) return
    sheet.texture.anisotropy = gl.capabilities.getMaxAnisotropy()
    sheet.texture.needsUpdate = true
  }, [sheet, gl])

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSag: { value: 0.34 },
      uRipple: { value: 0.06 },
      uMap: { value: null as THREE.Texture | null },
      uRepeat: { value: new THREE.Vector2(3, 3) },
      uOffset: { value: new THREE.Vector2(0, 0) },
      uGround: { value: new THREE.Color('#1c4129') },
    }),
    [],
  )

  useEffect(() => {
    if (sheet) uniforms.uMap.value = sheet.texture
  }, [sheet, uniforms])

  useFrame(({ size }, delta) => {
    const u = material.current?.uniforms
    if (!u) return
    u.uTime.value += delta

    // The sheet is sized to whatever the band is, and the repeat is counted in
    // screen pixels, so the mark is the same size on every display and only the
    // number of repeats changes. A fixed plane left plain green down both sides
    // of a wide screen.
    if (sheet) {
      const tile = tileFor(size.width)
      u.uRepeat.value.set(size.width / tile, (size.height * sheet.aspect) / tile)
    }

    // Walking pace. The section's own scroll progress carries the field past,
    // with a constant drift underneath so it is never still even when the page
    // is. The drift used to be a tenth of this and read as a static image.
    u.uOffset.value.x = -progress.current * 1.6 - u.uTime.value * 0.035
  })

  // Sized to the frame it is hung in, not to a number typed here.
  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 140, 72]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}

export default function SiteMesh({ progress }: { progress: React.MutableRefObject<number> }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 46, near: 0.1, far: 30 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      resize={{ scroll: false }}
    >
      <color attach="background" args={['#1c4129']} />
      <Scrim progress={progress} />
    </Canvas>
  )
}
