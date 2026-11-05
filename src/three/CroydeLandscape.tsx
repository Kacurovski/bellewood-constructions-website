import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { FRAME_BOUNDS } from './frameMembers'

export const GARDEN_TREES = [
  { x: 10, z: -11.7, height: 9.6, width: 1.85 },
  { x: -10.5, z: 11, height: 7, width: 1.4 },
] as const

/** An illustrative garden, not a survey of the property's landscaping.
 * All textures are generated locally; the live scene and stills use the same
 * seeded planting. Leaves, branches and paving each share one draw call. */
function random(seed: number) {
  return () => {
    seed = (Math.imul(1664525, seed) + 1013904223) | 0
    return (seed >>> 0) / 4294967296
  }
}

function surface(kind: 'lawn' | 'stone' | 'soil') {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')!
  const rng = random(kind === 'lawn' ? 52 : 197)
  const base = kind === 'lawn' ? [100, 115, 66] : kind === 'stone' ? [181, 177, 158] : [72, 64, 45]
  const data = ctx.createImageData(512, 512)
  for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) {
    const n = (rng() - 0.5) * 32 + Math.sin(x / 48) * Math.cos(y / 63) * 6
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
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  texture.repeat.set(kind === 'lawn' ? 5 : 1, kind === 'lawn' ? 7 : 1)
  texture.anisotropy = 4
  return texture
}

/** Fade the ground into the page, rather than giving the garden a model plinth. */
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
  const leaves: Instance[] = [], branches: Instance[] = [], paving: Instance[] = []
  const greens = ['#4d633a', '#657544', '#7b8551', '#344d32', '#829369', '#526d46']
  // Each plant has an irregular silhouette of individual leaves, with no
  // opaque spheres inside the canopy. The house remains visible between them.
  function crown(x: number, y: number, z: number, rx: number, ry: number, rz: number, count: number, leafSize: number) {
    for (let i = 0; i < count; i++) {
      const a = rng() * Math.PI * 2, v = rng() * 2 - 1
      const radial = Math.sqrt(1 - v * v), distance = Math.cbrt(rng())
      const scale = leafSize * (0.65 + rng() * 0.65)
      leaves.push({
        p: [x + Math.cos(a) * radial * distance * rx, y + v * distance * ry, z + Math.sin(a) * radial * distance * rz],
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
    const base = new THREE.Vector3(x, 0, z), fork = new THREE.Vector3(x + 0.25, height * 0.53, z - 0.12)
    branch(base, fork, 0.22)
    for (let j = 0; j < 9; j++) {
      const angle = j / 9 * Math.PI * 2 + rng() * 0.5
      const tip = new THREE.Vector3(x + Math.cos(angle) * width * 0.62, height * (0.55 + rng() * 0.33), z + Math.sin(angle) * width * 0.66)
      branch(fork, tip, 0.065 + rng() * 0.045)
      crown(tip.x, tip.y + 0.4, tip.z, width * (0.45 + rng() * 0.2), height * 0.14, width * 0.58, 410, 0.3)
    }
  }
  // Trees stand outside the verandah footprint. These positions stay fixed
  // when switching views; this is one garden, not a camera-facing backdrop.
  GARDEN_TREES.forEach(({ x, z, height, width }) => tree(x, z, height, width))

  // Low beds keep the entrance, the white fence and both stair flights clear.
  for (const side of [-1, 1]) for (let i = 0; i < 6; i++) {
    const x = side < 0 ? -6.8 + i * 0.6 : 3.1 + i * 0.65
    crown(x, 0.46 + rng() * 0.12, 16.4 + rng() * 0.15, 0.6, 0.55, 0.5, 110, 0.23)
  }
  for (let i = 0; i < 13; i++) {
    crown(9.1 + rng() * 0.25, 0.5, -11 + i * 1.9, 0.55, 0.6, 0.8, 100, 0.25)
  }
  for (let i = 0; i < 6; i++) crown(-10.1, 0.35, 2 + i * 2, 0.5, 0.4, 0.6, 80, 0.23)
  // Limestone slabs align to the existing gate and the foot of the front stair.
  for (let i = 0; i < 6; i++) paving.push({ p: [-0.7, -0.04, 16.4 + i * 0.79], s: [1.8, 0.12, 0.75], color: i % 2 ? '#e6e2d7' : '#eeeade' })
  // A short garden path continues from the rear stair to the open lawn.
  for (let i = 0; i < 4; i++) paving.push({ p: [-7.05, -0.04, -12.55 - i * 0.85], s: [1.35, 0.12, 0.72], color: '#e6e2d7' })
  return { leaves, branches, paving }
}

export function CroydeLandscape() {
  const resources = useMemo(() => {
    const lawn = surface('lawn'), stone = surface('stone'), soil = surface('soil'), mask = groundMask()
    const leaf = new THREE.BufferGeometry()
    // A folded leaf catches light on two planes, with pointed ends.
    leaf.setAttribute('position', new THREE.Float32BufferAttribute([0, -.5, 0, -.45, 0, 0, 0, 0, .12, .45, 0, 0, 0, .5, 0], 3))
    leaf.setIndex([0, 1, 2, 0, 2, 3, 1, 4, 2, 2, 4, 3])
    leaf.computeVertexNormals()
    return {
      lawn, stone, soil, mask, leaf,
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
      <mesh name="croyde-lawn" rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0.8]} receiveShadow>
        <planeGeometry args={[27, 44]} />
        <meshStandardMaterial map={resources.lawn} bumpMap={resources.lawn} bumpScale={0.065} alphaMap={resources.mask} transparent depthWrite={false} roughness={1} />
      </mesh>
      {[[ -5.3, 16.4, 4.4, 1.3 ], [4.7, 16.4, 4.4, 1.3], [9.1, 0.4, 1.4, 26]].map(([x, z, w, d], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.105, z]} receiveShadow>
          <planeGeometry args={[w, d]} />
          <meshStandardMaterial map={resources.soil} alphaMap={resources.mask} transparent depthWrite={false} roughness={1} />
        </mesh>
      ))}
      <Instances name="croyde-foliage" items={items.leaves} geometry={resources.leaf} material={resources.leafMat} />
      <Instances name="croyde-branches" items={items.branches} geometry={resources.branch} material={resources.woodMat} />
      <Instances name="croyde-path" items={items.paving} geometry={resources.box} material={resources.stoneMat} shadows={false} />
    </group>
  )
}
