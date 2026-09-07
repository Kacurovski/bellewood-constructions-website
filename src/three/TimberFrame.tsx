import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { FRAME_BOUNDS, FRAME_MEMBERS } from './frameMembers'
import type { MaterialKey } from './frameMembers'

/**
 * Scene 3 — the cabin going up.
 *
 * An orthographic, drawing-like view of a two-storey timber cabin built in the
 * order a building actually goes up: substructure and floor, walls, the storey
 * above, the roof, then the enclosure. Line-work first, then solid timber, then
 * a finished house with the lights on.
 *
 * Three hundred-odd members at real sections and real centres, drawn in five
 * instanced calls plus one line buffer. That is what lets it be a building
 * rather than a diagram of one.
 */

const LINE = '#1c4129'

/**
 * The palette. Silky Oak is the brand's timber accent and it carries the
 * structure; the cladding and deck sit either side of it so the three read apart
 * without becoming three different colours. The roof is Deep Pine, which keeps
 * the darkest value on the page inside the brand.
 */
const MATERIALS: Record<MaterialKey, { color: string; roughness: number }> = {
  frame: { color: '#9a7b4f', roughness: 0.84 },
  clad: { color: '#ab8354', roughness: 0.88 },
  deck: { color: '#8f7248', roughness: 0.9 },
  roof: { color: '#10251a', roughness: 0.62 },
  glass: { color: '#41544c', roughness: 0.16 },
}

const MATERIAL_KEYS = Object.keys(MATERIALS) as MaterialKey[]

const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}

/** The twelve edges of a unit cube, as 24 corner indices. */
const EDGE_INDICES = [
  0, 1, 1, 3, 3, 2, 2, 0,
  4, 5, 5, 7, 7, 6, 6, 4,
  0, 4, 1, 5, 2, 6, 3, 7,
]

const UNIT_CORNERS = [
  [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [-0.5, 0.5, -0.5], [0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [-0.5, 0.5, 0.5], [0.5, 0.5, 0.5],
] as const

function Building({ progress }: { progress: React.MutableRefObject<number> }) {
  const meshes = useRef<Partial<Record<MaterialKey, THREE.InstancedMesh | null>>>({})
  const mats = useRef<Partial<Record<MaterialKey, THREE.MeshStandardMaterial | null>>>({})
  const lineMat = useRef<THREE.LineBasicMaterial>(null)
  const lastProgress = useRef(-1)

  const count = FRAME_MEMBERS.length
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])

  /** Which instanced mesh each member belongs to, and its slot within it. */
  const layout = useMemo(() => {
    const slot = new Int32Array(count)
    const sizes = {} as Record<MaterialKey, number>
    for (const k of MATERIAL_KEYS) sizes[k] = 0
    FRAME_MEMBERS.forEach((m, i) => {
      slot[i] = sizes[m.mat]
      sizes[m.mat] += 1
    })
    return { slot, sizes }
  }, [count])

  const quats = useMemo(
    () =>
      FRAME_MEMBERS.map((m) =>
        new THREE.Quaternion().setFromEuler(new THREE.Euler(m.rx, 0, 0)),
      ),
    [],
  )

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(count * EDGE_INDICES.length * 3), 3),
    )
    g.setDrawRange(0, 0)
    return g
  }, [count])

  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      position: new THREE.Vector3(),
      origin: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      corner: new THREE.Vector3(),
      /** Last growth value per member, so settled members are not recomputed. */
      lastT: new Float32Array(count).fill(-1),
    }),
    [count],
  )

  useFrame(() => {
    const p = progress.current

    if (lineMat.current) {
      // The drawing hands over to solid material through the middle of the
      // section, and a trace of it stays: the drawing does not stop being true
      // once the thing is built.
      lineMat.current.opacity = 1 - smoothstep(0.48, 0.9, p) * 0.8
    }

    const solidOpacity = smoothstep(0.34, 0.68, p)
    // The lights come on at the very end. A house at dusk with nothing lit reads
    // as empty, and this is the last beat of the sequence.
    const lit = smoothstep(0.88, 1, p)
    for (const k of MATERIAL_KEYS) {
      const mat = mats.current[k]
      if (!mat) continue
      mat.opacity = solidOpacity
      if (k === 'glass') mat.emissiveIntensity = lit * 1.05
    }

    if (Math.abs(p - lastProgress.current) < 0.0003) return
    lastProgress.current = p

    const attr = lineGeometry.getAttribute('position') as THREE.BufferAttribute
    const arr = attr.array as Float32Array
    let anyVisible = false
    let changed = false

    for (let i = 0; i < count; i++) {
      const m = FRAME_MEMBERS[i]
      const t = smoothstep(m.at, m.at + 0.045, p)
      if (t > 0.001) anyVisible = true

      // A member that has finished growing never needs recomputing. Across the
      // whole section only a handful are in motion at once, which is what keeps
      // three hundred members affordable on a phone.
      if (scratch.lastT[i] === t) continue
      scratch.lastT[i] = t
      changed = true

      const [w, h, d] = m.s
      const long = Math.max(w, h, d)
      const sx = w === long ? w * t : w
      const sy = h === long ? h * t : h
      const sz = d === long ? d * t : d

      // Grow from one end, not from the middle. A stud is stood on the plate and
      // fixed; it does not appear in mid-air and expand both ways.
      scratch.origin.set(
        w === long ? -(w - sx) / 2 : 0,
        h === long ? -(h - sy) / 2 : 0,
        d === long ? -(d - sz) / 2 : 0,
      )
      scratch.origin.applyQuaternion(quats[i])

      scratch.scale.set(Math.max(sx, 1e-5), Math.max(sy, 1e-5), Math.max(sz, 1e-5))
      scratch.position.set(m.p[0], m.p[1], m.p[2]).add(scratch.origin)
      scratch.matrix.compose(scratch.position, quats[i], scratch.scale)

      const mesh = meshes.current[m.mat]
      if (mesh) mesh.setMatrixAt(layout.slot[i], scratch.matrix)

      const base = i * EDGE_INDICES.length
      for (let e = 0; e < EDGE_INDICES.length; e++) {
        const c = UNIT_CORNERS[EDGE_INDICES[e]]
        scratch.corner.set(c[0], c[1], c[2]).applyMatrix4(scratch.matrix)
        const o = (base + e) * 3
        // A member not yet placed collapses to a point and draws nothing.
        arr[o] = t > 0.001 ? scratch.corner.x : 0
        arr[o + 1] = t > 0.001 ? scratch.corner.y : 0
        arr[o + 2] = t > 0.001 ? scratch.corner.z : 0
      }
    }

    if (!changed) return
    for (const k of MATERIAL_KEYS) {
      const mesh = meshes.current[k]
      if (mesh) mesh.instanceMatrix.needsUpdate = true
    }
    attr.needsUpdate = true
    lineGeometry.setDrawRange(0, anyVisible ? count * EDGE_INDICES.length : 0)
  })

  return (
    <group position={[0, -FRAME_BOUNDS.centreY, 0]}>
      {MATERIAL_KEYS.map((key) => (
        <instancedMesh
          key={key}
          ref={(el) => (meshes.current[key] = el)}
          args={[box, undefined, Math.max(layout.sizes[key], 1)]}
          castShadow={key !== 'glass'}
          receiveShadow={key !== 'glass'}
          frustumCulled={false}
        >
          <meshStandardMaterial
            ref={(el) => (mats.current[key] = el)}
            color={MATERIALS[key].color}
            roughness={MATERIALS[key].roughness}
            metalness={key === 'roof' ? 0.25 : 0}
            emissive={key === 'glass' ? '#ffc178' : '#000000'}
            emissiveIntensity={0}
            transparent
            opacity={0}
          />
        </instancedMesh>
      ))}

      <lineSegments geometry={lineGeometry} frustumCulled={false}>
        <lineBasicMaterial ref={lineMat} color={LINE} transparent opacity={1} />
      </lineSegments>
    </group>
  )
}

export default function TimberFrame({
  progress,
  shadows = true,
}: {
  progress: React.MutableRefObject<number>
  shadows?: boolean
}) {
  return (
    <Canvas
      orthographic
      // A true axonometric: the view an architect would draw the thing in.
      camera={{ position: [9, 6.2, 10.5], zoom: 60, near: 0.1, far: 120 }}
      dpr={[1, shadows ? 1.75 : 1.4]}
      shadows={shadows}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        // No tone mapping. Silky Oak and Bellewood Green are specified values,
        // and a filmic curve would quietly shift both.
        toneMapping: THREE.NoToneMapping,
      }}
      style={{ background: 'transparent' }}
      resize={{ scroll: false }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
    >
      <Fit />

      {/* Late afternoon, not a product shot. A warm key from over the left
          shoulder, a cool sky fill, and nothing else. */}
      <hemisphereLight args={['#f7f9f0', '#afc3b0', 1.0]} />
      <directionalLight
        position={[-9, 12, 9]}
        intensity={1.85}
        color="#fff4e2"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0015}
        shadow-normalBias={0.03}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />
      <directionalLight position={[8, 3, -7]} intensity={0.32} color="#dfe8dc" />

      {shadows && (
        // Catches the shadow and nothing else, so the building sits on the wash
        // ground rather than floating above it.
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -FRAME_BOUNDS.centreY - 0.95, 0]}
          receiveShadow
        >
          <planeGeometry args={[44, 44]} />
          <shadowMaterial opacity={0.15} />
        </mesh>
      )}

      <Building progress={progress} />
    </Canvas>
  )
}

/**
 * Fits the building to its box without a camera move.
 *
 * The extent is measured, not estimated. Seen down an axonometric axis an 8 x 5
 * plan is neither 8 nor 5 wide on screen, and guessing at the diagonal put the
 * building over the edges of its own frame.
 */
function Fit() {
  const corners = useMemo(() => {
    const { length, depth, height, deckZ, centreY } = FRAME_BOUNDS
    const hx = length / 2 + 0.5
    const out: THREE.Vector3[] = []
    for (const x of [-hx, hx]) {
      for (const y of [-1.1 - centreY, height + 0.25 - centreY]) {
        for (const z of [-depth / 2 - 0.5, deckZ + 0.2]) out.push(new THREE.Vector3(x, y, z))
      }
    }
    return out
  }, [])

  const scratch = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, size }) => {
    const cam = camera as THREE.OrthographicCamera
    let minX = Infinity
    let maxX = -Infinity
    let minY = Infinity
    let maxY = -Infinity

    for (const c of corners) {
      // View space, before the zoom: one unit here is one pixel at zoom 1.
      scratch.copy(c).applyMatrix4(cam.matrixWorldInverse)
      minX = Math.min(minX, scratch.x)
      maxX = Math.max(maxX, scratch.x)
      minY = Math.min(minY, scratch.y)
      maxY = Math.max(maxY, scratch.y)
    }

    const width = Math.max(maxX - minX, 0.001)
    const height = Math.max(maxY - minY, 0.001)
    // A little air on every side. The drawing should not touch its edges.
    const target = Math.min(size.width / width, size.height / height) * 0.9

    if (Math.abs(cam.zoom - target) > 0.4) {
      cam.zoom = target
      cam.updateProjectionMatrix()
    }
  })

  return null
}
