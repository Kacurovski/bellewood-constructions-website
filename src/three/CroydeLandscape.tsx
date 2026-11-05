import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FRAME_BOUNDS } from './frameMembers'

const GARDEN_TREES = [
  { x: -22, z: 12, height: 10.5, width: 4 },
  { x: -26, z: -13, height: 8.5, width: 3.6 },
  { x: -10, z: -23, height: 8.2, width: 2.9 },
  { x: 7, z: -21, height: 9.4, width: 2.8 },
  { x: 13.4, z: 7, height: 7.2, width: 2.3 },
] as const

/** Garden layout interpreted from Croyde's aerial and exterior photographs:
 * pool beside the long verandah, open side lawn, driveway and planted edges.
 * Extents and levels are approximate, not a survey of the property.
 * All textures are generated locally; the live scene and stills use the same
 * seeded planting. Leaves, branches and paving each share one draw call. */
function random(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) | 0
    return (seed >>> 0) / 4294967296
  }
}

// The photographed side lawn falls gently away from the pool terrace.
const groundHeight = (x: number) => -0.14 + Math.min(0, x + 16) * 0.045

function groundStrip(depth: number, z: number, lift: number) {
  const geometry = new THREE.PlaneGeometry(200, depth, 50, 1)
  geometry.rotateX(-Math.PI / 2)
  const vertices = geometry.getAttribute('position')
  for (let i = 0; i < vertices.count; i++) {
    vertices.setY(i, groundHeight(vertices.getX(i)) + lift)
    vertices.setZ(i, vertices.getZ(i) + z)
  }
  geometry.computeVertexNormals()
  return geometry
}

function surface(kind: 'lawn' | 'stone' | 'soil' | 'gravel' | 'water') {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const rng = random(kind === 'lawn' ? 52 : 197)
  const base = {
    lawn: [94, 119, 54], stone: [205, 193, 171], soil: [72, 64, 45],
    gravel: [174, 164, 143], water: [83, 139, 128],
  }[kind]
  const data = ctx.createImageData(512, 512)
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const n = (rng() - 0.5) * (kind === 'water' ? 3 : 32) + Math.sin(x / 48) * Math.cos(y / 63) * 6
    const i = (y * 512 + x) * 4
    data.data[i] = base[0] + n
    data.data[i + 1] = base[1] + n
    data.data[i + 2] = base[2] + n * 0.7
    data.data[i + 3] = 255
  }
  ctx.putImageData(data, 0, 0)
  if (kind === 'lawn') {
    for (let i = 0; i < 28000; i++) {
      const x = rng() * 512, y = rng() * 512
      ctx.strokeStyle = rng() > 0.5 ? 'rgba(167,173,107,.32)' : 'rgba(36,61,30,.3)'
      ctx.lineWidth = 0.5 + rng() * 0.7
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + (rng() - 0.5) * 3, y - 1 - rng() * 4)
      ctx.stroke()
    }
  }
  if (kind === 'gravel') {
    for (let i = 0; i < 17000; i++) {
      const value = 110 + Math.floor(rng() * 110)
      ctx.fillStyle = `rgba(${value},${value - 8},${value - 18},.5)`
      ctx.beginPath()
      ctx.ellipse(rng() * 512, rng() * 512, 0.4 + rng() * 1.2, 0.5 + rng(), rng() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
  }
  if (kind === 'water') {
    // Fine reflected ripples, kept still so they do not compete with the build.
    for (let i = 0; i < 90; i++) {
      ctx.strokeStyle = `rgba(216,233,213,${0.04 + rng() * 0.12})`
      ctx.lineWidth = 0.5 + rng() * 1.1
      const y = rng() * 512
      ctx.beginPath()
      for (let x = 0; x <= 512; x += 8) {
        const h = y + Math.sin(x / 27 + i) * 3 + Math.cos(x / 57 + i) * 4
        if (x === 0) ctx.moveTo(x, h); else ctx.lineTo(x, h)
      }
      ctx.stroke()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(kind === 'lawn' ? 34 : 1, kind === 'lawn' ? 34 : kind === 'water' ? 3 : kind === 'gravel' ? 12 : 1)
  texture.anisotropy = 4
  return texture
}

/** Soften the edges of planting beds. The terrain itself is continuous. */
function groundMask() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 256
  const ctx = canvas.getContext('2d')!
  const data = ctx.createImageData(256, 256)
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const nx = Math.abs((x - 127.5) / 127.5), ny = Math.abs((y - 127.5) / 127.5)
    const edge = Math.pow(Math.pow(nx, 5) + Math.pow(ny, 5), 0.2)
    const alpha = THREE.MathUtils.smoothstep(1 - edge, 0, 0.22)
    const i = (y * 256 + x) * 4
    data.data[i] = data.data[i + 1] = data.data[i + 2] = alpha * 255
    data.data[i + 3] = 255
  }
  ctx.putImageData(data, 0, 0)
  return new THREE.CanvasTexture(canvas)
}

type Instance = { p: [number, number, number]; s: [number, number, number]; r?: [number, number, number]; color: string }
function Instances({ name, items, geometry, material, shadows = true }: {
  name: string; items: Instance[]; geometry: THREE.BufferGeometry; material: THREE.Material; shadows?: boolean
}) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const mesh = ref.current!
    const object = new THREE.Object3D(), color = new THREE.Color()
    items.forEach((item, i) => {
      object.position.set(...item.p)
      object.scale.set(...item.s)
      object.rotation.set(...(item.r ?? [0, 0, 0]))
      object.updateMatrix()
      mesh.setMatrixAt(i, object.matrix)
      mesh.setColorAt(i, color.set(item.color))
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere()
  }, [items])
  return <instancedMesh ref={ref} name={name} args={[geometry, material, items.length]} castShadow={shadows} receiveShadow />
}

function planting() {
  const rng = random(417)
  const leaves: Instance[] = [], branches: Instance[] = [], paving: Instance[] = [], fence: Instance[] = []
  const greens = ['#4d633a', '#657544', '#77864c', '#344d32', '#829369', '#526d46']
  // Each plant has an irregular silhouette of individual leaves, with no
  // opaque spheres inside the canopy. The house remains visible between them.
  function crown(x: number, y: number, z: number, rx: number, ry: number, rz: number, count: number, leafSize: number) {
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2, v = rng() * 2 - 1
      const radial = Math.sqrt(1 - v * v), distance = Math.cbrt(rng())
      const scale = leafSize * (0.65 + rng() * 0.65)
      leaves.push({
        p: [x + Math.cos(a) * radial * distance * rx, groundHeight(x) + y + v * distance * ry, z + Math.sin(a) * radial * distance * rz],
        s: [scale * 0.5, scale, scale],
        r: [rng() * Math.PI, rng() * Math.PI * 2, rng() * Math.PI],
        color: greens[Math.floor(rng() * greens.length)],
      })
    }
  }
  function branch(a: THREE.Vector3, b: THREE.Vector3, width: number) {
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize())
    const e = new THREE.Euler().setFromQuaternion(q)
    branches.push({ p: a.clone().add(b).multiplyScalar(0.5).toArray(), s: [width, a.distanceTo(b), width], r: [e.x, e.y, e.z], color: '#7b7863' })
  }
  function tree(x: number, z: number, height: number, width: number) {
    const ground = groundHeight(x)
    const base = new THREE.Vector3(x, ground, z), fork = new THREE.Vector3(x + 0.25, ground + height * 0.42, z - 0.12)
    branch(base, fork, 0.22)
    for (let j = 0; j < 9; j++) {
      const angle = j / 9 * Math.PI * 2 + rng() * 0.5
      const tip = new THREE.Vector3(x + Math.cos(angle) * width * 0.62, ground + height * (0.55 + rng() * 0.33), z + Math.sin(angle) * width * 0.66)
      branch(fork, tip, 0.065 + rng() * 0.045)
      crown(tip.x, tip.y - ground + 0.4, tip.z, width * (0.45 + rng() * 0.2), height * 0.14, width * 0.58, 230, 0.39)
    }
  }
  // Trees stand outside the verandah footprint. These positions stay fixed
  // when switching views; this is one garden, not a camera-facing backdrop.
  GARDEN_TREES.forEach(({ x, z, height, width }) => tree(x, z, height, width))

  function hedge(x: number, z: number, height = 1.5, width = 0.8) {
    crown(x, height * 0.52, z, width, height * 0.58, width * 0.8, 135, height > 2 ? 0.5 : 0.36)
  }
  // Lush boundary planting shown in the photographs, including behind the
  // house. The broad side lawn stays open, as does the gate-to-stair route.
  for (let x = -28; x < 12; x += 1.25) hedge(x, -19.7 + rng() * 0.3, 3 + rng() * 0.7, 1.1)
  for (let z = -18; z < 17; z += 1.35) {
    hedge(-28, z, 2.4 + rng() * 0.5, 1)
    hedge(11.8, z, 1.8 + rng() * 0.3, 0.75)
  }
  for (let x = -27; x < 7.5; x += 1) {
    if (x > -3 && x < 1.7) continue
    hedge(x, 16.6, 1.8 + rng() * 0.3, 0.82)
  }
  // The clipped hedge beside the pool, and magnolia-like planting beneath
  // the front verandah, both visible in the garden/street photographs.
  for (let z = -14; z < 2.5; z += 0.9) hedge(-15.2, z, 0.75, 0.55)
  for (let x = -6.6; x < 6.5; x += 0.9) {
    if (x > -2.4 && x < 1) continue
    hedge(x, 10.7, 1.65, 0.62)
  }
  // Stone slabs align to the existing gate and the foot of the front stair.
  for (let i = 0; i < 6; i++) paving.push({ p: [-0.7, -0.04, 16.4 + i * 0.79], s: [1.8, 0.12, 0.75], color: i % 2 ? '#e6e2d7' : '#eeeade' })
  // A short garden path continues from the rear stair to the open lawn.
  for (let i = 0; i < 4; i++) paving.push({ p: [-7.05, -0.04, -12.55 - i * 0.85], s: [1.35, 0.12, 0.72], color: '#e6e2d7' })
  // Continue the street fence across the lawn, retaining the existing gate.
  for (let x = -27.5; x < -7.3; x += 0.16) fence.push({ p: [x, 0.76 + groundHeight(x), 17.5], s: [0.065, 1.18, 0.065], color: '#f7f6ee' })
  for (let x = -27.5; x < -7.3; x += 2.1) fence.push({ p: [x, 0.81 + groundHeight(x), 17.5], s: [0.15, 1.62, 0.15], color: '#f7f6ee' })
  for (let x = -27; x < -7.3; x += 1) for (const y of [0.3, 1.34]) fence.push({ p: [x, y + groundHeight(x), 17.5], s: [1.04, 0.06, 0.08], color: y > 1 ? '#51594c' : '#f7f6ee' })
  // Individual terrace tiles keep the stone from reading as a flat block.
  for (let z = -15.2; z < 2.4; z += 1.1) {
    for (const x of [-14.15, -9.45]) paving.push({ p: [x, -0.025, z], s: [1, 0.14, 1.075], color: rng() > 0.4 ? '#f4eada' : '#e2d5be' })
  }
  for (const z of [-15.75, 2.7]) for (let x = -14.1; x < -9; x += 1.05) paving.push({ p: [x, -0.025, z], s: [1.025, 0.14, 0.8], color: '#eee3d0' })
  return { leaves, branches, paving, fence }
}

export function CroydeLandscape() {
  const resources = useMemo(() => {
    const lawn = surface('lawn'), stone = surface('stone'), soil = surface('soil'), gravel = surface('gravel'), water = surface('water'), mask = groundMask()
    const terrain = new THREE.PlaneGeometry(200, 200, 50, 50)
    terrain.rotateX(-Math.PI / 2)
    const vertices = terrain.getAttribute('position')
    for (let i = 0; i < vertices.count; i++) vertices.setY(i, groundHeight(vertices.getX(i)))
    terrain.computeVertexNormals()
    const leaf = new THREE.BufferGeometry()
    // A folded leaf catches light on two planes, with pointed ends.
    leaf.setAttribute('position', new THREE.Float32BufferAttribute([0, -.5, 0, -.45, 0, 0, 0, 0, .12, .45, 0, 0, 0, .5, 0], 3))
    leaf.setIndex([0, 1, 2, 0, 2, 3, 1, 4, 2, 2, 4, 3])
    leaf.computeVertexNormals()
    return {
      lawn, stone, soil, gravel, water, mask, leaf, terrain,
      footpath: groundStrip(1.5, 21.1, 0.04),
      kerb: groundStrip(0.25, 22.1, 0.06),
      street: groundStrip(12, 28.2, 0.015),
      box: new THREE.BoxGeometry(1, 1, 1),
      branch: new THREE.CylinderGeometry(0.65, 1, 1, 5),
      leafMat: new THREE.MeshStandardMaterial({ color: 'white', roughness: 0.92, side: THREE.DoubleSide }),
      woodMat: new THREE.MeshStandardMaterial({ color: 'white', roughness: 1 }),
      stoneMat: new THREE.MeshStandardMaterial({ map: stone, bumpMap: stone, bumpScale: 0.025, roughness: 0.96 }),
    }
  }, [])
  const items = useMemo(planting, [])
  useEffect(() => () => {
    Object.values(resources).forEach((resource) => resource.dispose())
  }, [resources])
  return (
    <group name="croyde-landscape" position={[0, -FRAME_BOUNDS.centreY, -FRAME_BOUNDS.centreZ]}>
      <mesh name="croyde-lawn" geometry={resources.terrain} receiveShadow>
        <meshStandardMaterial map={resources.lawn} bumpMap={resources.lawn} bumpScale={0.055} roughness={1} />
      </mesh>
      {/* A quiet street edge gives the garden view its real site context. */}
      <mesh geometry={resources.footpath} receiveShadow>
        <meshStandardMaterial color="#c5bfb0" roughness={1} />
      </mesh>
      <mesh geometry={resources.kerb} receiveShadow>
        <meshStandardMaterial color="#b9b6aa" roughness={1} />
      </mesh>
      <mesh geometry={resources.street} receiveShadow>
        <meshStandardMaterial color="#7a7d73" roughness={1} />
      </mesh>
      {[[ -5.3, 16.4, 4.4, 1.3 ], [4.7, 16.4, 4.4, 1.3], [11.8, -1, 1.4, 37], [-8, -19.6, 40, 2], [-15.2, -6, 1.3, 18]].map(([x, z, w, d], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, groundHeight(x) + 0.02, z]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial map={resources.soil} alphaMap={resources.mask} transparent depthWrite={false} roughness={1} />
        </mesh>
      ))}
      {/* Exposed-aggregate driveway down the narrow side of the house. */}
      <mesh name="croyde-driveway" rotation={[-Math.PI / 2, 0, 0]} position={[9.25, -0.09, 0.8]} receiveShadow>
        <planeGeometry args={[3.3, 40]} />
        <meshStandardMaterial map={resources.gravel} bumpMap={resources.gravel} bumpScale={0.035} roughness={1} />
      </mesh>
      {/* Long garden-side pool with pale coping and restrained green water. */}
      <mesh name="croyde-pool-basin" position={[-11.8, -0.18, -6.5]} receiveShadow>
        <boxGeometry args={[3.8, 0.36, 17.6]} />
        <meshStandardMaterial color="#d5d8c7" roughness={0.85} />
      </mesh>
      <mesh name="croyde-pool-water" rotation={[-Math.PI / 2, 0, 0]} position={[-11.8, 0.015, -6.5]}>
        <planeGeometry args={[3.4, 17.2]} />
        <meshStandardMaterial map={resources.water} roughness={0.22} metalness={0.08} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-11.8, 0.025, -14.65]}>
        <planeGeometry args={[3.4, 0.9]} />
        <meshStandardMaterial color="#8bb3a5" roughness={0.45} />
      </mesh>
      <mesh name="croyde-pool-guard" position={[-14.75, 0.61, -6.5]}>
        <boxGeometry args={[0.018, 1.15, 19]} />
        <meshStandardMaterial color="#d5e4db" transparent opacity={0.14} depthWrite={false} roughness={0.25} />
      </mesh>
      <Instances name="croyde-foliage" items={items.leaves} geometry={resources.leaf} material={resources.leafMat} />
      <Instances name="croyde-branches" items={items.branches} geometry={resources.branch} material={resources.woodMat} />
      <Instances name="croyde-path" items={items.paving} geometry={resources.box} material={resources.stoneMat} shadows={false} />
      <Instances name="croyde-boundary-fence" items={items.fence} geometry={resources.box} material={resources.woodMat} />
    </group>
  )
}
