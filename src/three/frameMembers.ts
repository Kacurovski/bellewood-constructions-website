/** Kalinga photo-referenced architectural study, shared by the live assembly
 * and static fallback. Proportions are interpreted from the supplied exterior
 * photos, including the rear elevation, not surveyed dimensions or a record of construction.
 * Street is +z. Two enclosed levels, a full-width upper verandah, low hip roof,
 * decorative posts/frieze, dark entry, gated fence and two rear wings.
 * Unseen connections are interpreted; this is not a measured survey.
 */
export type MaterialKey = 'frame' | 'clad' | 'trim' | 'joinery' | 'roof' | 'glass' | 'deck'
export type Member = {
  p: [number, number, number]
  s: [number, number, number]
  rx: number
  ry?: number
  rz?: number
  at: number
  stage: 0 | 1 | 2 | 3
  mat: MaterialKey
  outer?: boolean
  lines?: false
  layer?: 1 | 2
}
export type FrameView = 'front' | 'rear'
export const FRAME_VIEWS: Record<FrameView, [number, number, number]> = { front: [-10, 7, 15], rear: [12, 8, -16] }
type V3 = [number, number, number]
type Opening = { x: number; y: number; w: number; h: number; door?: boolean }
const W = 12.4, HALF = W / 2
const BACK = -5, FRONT = 2.8, VERANDAH = 4.9
const FLOOR = 3.15, EAVE = 6.35
const RX = HALF + 0.45, RZ = 5.4, PITCH = Math.PI * 14 / 180
const RIDGE = EAVE + RZ * Math.tan(PITCH)
const members: Member[] = []
function box(p: V3, s: V3, mat: MaterialKey, at: number, stage: Member['stage'], outer = true, rotation: Partial<Member> = {}) {
  members.push({ p, s, mat, at, stage, outer, rx: 0, ...rotation })
}
function between(a: V3, b: V3, width: number, mat: MaterialKey, at: number, stage: Member['stage'], outer = true) {
  const dx = b[0]-a[0], dy = b[1]-a[1], dz = b[2]-a[2]
  const length = Math.hypot(dx,dy,dz)
  box([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2], [width,width,length], mat, at, stage, outer,
    { rx: -Math.atan2(dy,Math.hypot(dx,dz)), ry: Math.atan2(dx,dz) })
}
const frontOpenings: Opening[] = [
  {x:0,y:1.35,w:1.65,h:2.5,door:true},
  ...[-4.8,-1.65,1.65,4.8].map(x=>({x,y:1.5,w:0.82,h:1.55})),
  {x:0,y:4.48,w:1.35,h:2.45,door:true},
  ...[-2.15,2.15].map(x=>({x,y:4.75,w:1.22,h:1.95})),
  ...[-4.8,4.8].map(x=>({x,y:4.3,w:1.12,h:1.8,door:true})),
]
const sideOpenings: Opening[] = [-3.55,-0.6].flatMap(x=>[
  {x,y:1.6,w:1.1,h:1.35}, {x,y:4.65,w:1.08,h:1.65},
])
function wall(axis: 'front'|'back'|'left'|'right', openings: Opening[]) {
  const front = axis==='front'||axis==='back'
  const low = front ? -HALF : BACK
  const high = front ? HALF : FRONT
  for(let y=0.2;y<EAVE-0.1;y+=0.17) {
    let spans: [number,number][] = [[low,high]]
    for(const o of openings) {
      if(y+0.085<o.y-o.h/2 || y-0.085>o.y+o.h/2) continue
      spans=spans.flatMap(([a,b])=>{
        const l=o.x-o.w/2-0.04,r=o.x+o.w/2+0.04
        if(r<=a||l>=b)return [[a,b]]
        const pieces:[number,number][]=[]
        if(l>a)pieces.push([a,l])
        if(r<b)pieces.push([r,b])
        return pieces
      })
    }
    for(const [a,b] of spans) {
      const fixed=axis==='front'?FRONT:axis==='back'?BACK:axis==='left'?-HALF:HALF
      box(front?[(a+b)/2,y,fixed]:[fixed,y,(a+b)/2],front?[b-a,0.165,0.075]:[0.075,0.165,b-a], 'clad',0.73+y*0.017,3)
    }
  }
}
function opening(o: Opening, side = false, sign=1) {
  const z=side?o.x:FRONT+0.07
  const x=side?sign*(HALF+0.07):o.x
  const place=(u:number,y:number,w:number,h:number,mat:MaterialKey,depth=0.1)=>
    box(side?[x,y,z+u]:[x+u,y,z],side?[depth,h,w]:[w,h,depth],mat,0.89,3)
  place(0,o.y,o.w,o.h,'glass',0.07)
  for(const u of [-o.w/2,o.w/2])place(u,o.y,0.1,o.h+0.15,'trim')
  for(const y of [o.y-o.h/2,o.y+o.h/2])place(0,y,o.w+0.19,0.1,'trim')
  place(0,o.y,o.door?0.07:o.w, o.door?o.h:0.065,o.door&&o.y<3?'joinery':'trim',0.12)
  if(o.door) {
    place(0,o.y+o.h*0.28,o.w,0.07,'trim',0.12)
    if(o.y<3) {
      place(0,o.y-0.4,o.w-0.15,1.25,'joinery',0.13)
      place(0,o.y-0.4,0.06,1.25,'trim',0.15)
    }
  } else place(0,o.y+o.h/4,0.04,o.h/2,'trim',0.12)
  if(side&&o.y>3) {
    box([x+sign*0.17,o.y+o.h/2+0.15,z],[0.52,0.06,o.w+0.35],'roof',0.9,3,true,{rz:sign*0.25})
    for(const d of [-o.w/2,o.w/2])between([x,o.y+o.h/2-0.24,z+d],[x+sign*0.4,o.y+o.h/2+0.08,z+d],0.06,'trim',0.91,3)
  }
}
// Ground and upper floor framing; all hidden timber stays inside the finished envelope.
for(const y of [0.12,FLOOR-0.12]) {
  for(let z=BACK;z<VERANDAH;z+=0.55)box([0,y,z],[W,0.17,0.08],'frame',0.035+(y/FLOOR)*0.065,0,false)
  for(const x of [-5.8,0,5.8])box([x,y-0.13,-0.05],[0.16,0.2,9.9],'frame',0.025,0,false)
}
for(const level of [0,FLOOR]) {
  for(let x=-HALF;x<=HALF;x+=0.6) {
    for(const z of [BACK,FRONT]) {
      if(z===FRONT&&frontOpenings.some(o=>Math.abs(x-o.x)<o.w/2+0.1&&o.y>level&&o.y<level+3.15))continue
      box([x,level+1.53,z+(z===BACK?0.12:-0.12)],[0.06,2.95,0.09],'frame',0.15+level*0.045+(x+HALF)*0.006,1,false)
    }
  }
  for(const x of [-HALF,HALF]) for(let z=BACK;z<FRONT;z+=0.6) {
    if(sideOpenings.some(o=>Math.abs(z-o.x)<o.w/2+0.1&&o.y>level&&o.y<level+3.15))continue
    box([x-Math.sign(x)*0.12,level+1.53,z],[0.09,2.95,0.06],'frame',0.2+level*0.045,1,false)
  }
}
wall('front',frontOpenings);wall('left',sideOpenings);wall('right',sideOpenings)
frontOpenings.forEach(o=>opening(o))
sideOpenings.forEach(o=>{opening(o,true,-1);opening(o,true,1)})
// Verandah: continuous floor, dark exposed joists below, and rails fitted
// inside each post bay. No balusters run through the structural posts.
const boardCount=Math.ceil(W/0.14), boardWidth=W/boardCount
for(let i=0;i<boardCount;i++)box([-HALF+(i+0.5)*boardWidth,FLOOR,(FRONT+VERANDAH)/2],[boardWidth-0.005,0.075,VERANDAH-FRONT],'deck',0.79,3)
box([0,FLOOR-0.075,(FRONT+VERANDAH)/2],[W,0.08,VERANDAH-FRONT],'joinery',0.78,3)
for(let x=-HALF+0.15;x<HALF;x+=0.5)box([x,FLOOR-0.19,(FRONT+VERANDAH)/2],[0.07,0.18,VERANDAH-FRONT],'joinery',0.78,3)
box([0,0.02,(FRONT+VERANDAH)/2],[W,0.09,VERANDAH-FRONT],'clad',0.74,3)
// Fine paving joints belong to the terrace, not to the timber deck above.
for(let x=-HALF+0.5;x<HALF;x+=0.65)box([x,0.067,(FRONT+VERANDAH)/2],[0.008,0.004,VERANDAH-FRONT],'roof',0.82,3)
for(let z=FRONT+0.5;z<VERANDAH;z+=0.65)box([0,0.067,z],[W,0.004,0.008],'roof',0.82,3)
const posts=[-HALF,-3.9,-1.45,-0.65,0.65,1.45,3.9,HALF]
for(const x of posts) {
  box([x,EAVE/2,VERANDAH],[0.12,EAVE,0.12],'trim',0.32,1)
  box([x,EAVE-0.22,VERANDAH],[0.19,0.38,0.19],'trim',0.9,3)
  for(const d of [-1,1]) if(Math.abs(x+d*0.3)<HALF+0.1) {
    between([x,EAVE-0.48,VERANDAH],[x+d*0.34,EAVE-0.08,VERANDAH],0.065,'trim',0.91,3)
    box([x+d*0.16,EAVE-0.08,VERANDAH],[0.32,0.07,0.1],'trim',0.91,3)
  }
}
for(const y of [FLOOR-0.15,EAVE-0.04])box([0,y,VERANDAH],[W+0.12,0.23,0.18],'trim',0.84,3)
function balustrade(a:V3,b:V3,base:number,height:number,frieze=false) {
  const dx=b[0]-a[0],dz=b[2]-a[2],length=Math.hypot(dx,dz)
  const n=Math.max(2,Math.ceil(length/0.13))
  for(let i=1;i<n;i++)box([a[0]+dx*i/n,base+height/2,a[2]+dz*i/n],[0.045,height,0.045],'trim',frieze?0.9:0.88,3)
  const rails=frieze?[base+height-0.03]:[base+0.045,base+height-0.19,base+height]
  for(const y of rails)between([a[0],y,a[2]],[b[0],y,b[2]],frieze?0.055:0.07,'trim',0.89,3)
}
for(let i=0;i<posts.length-1;i++) {
  const a:V3=[posts[i]+0.065,0,VERANDAH],b:V3=[posts[i+1]-0.065,0,VERANDAH]
  balustrade(a,b,FLOOR+0.09,1.02)
  balustrade(a,b,FLOOR-0.71,0.46,true)
}
for(const x of [-HALF,HALF]) {
  balustrade([x,0,FRONT+0.08],[x,0,VERANDAH-0.065],FLOOR+0.09,1.02)
  balustrade([x,0,FRONT+0.08],[x,0,VERANDAH-0.065],FLOOR-0.71,0.46,true)
  box([x,3.15,BACK],[0.13,6.25,0.13],'trim',0.87,3)
}
// A single low-pitched hipped roof spanning the house and verandah.
for(const face of ['front','back','left','right'] as const) {
  const long=face==='front'||face==='back'
  const half=long?RX:RZ
  const n=Math.ceil(half*2/0.115),step=half*2/n
  for(let i=0;i<n;i++) {
    const u=-half+(i+0.5)*step
    const run=long?Math.min(RZ,RX-Math.abs(u)):RZ-Math.abs(u)
    const sign=face==='front'||face==='right'?1:-1
    const y=EAVE+run/2*Math.tan(PITCH)
    const len=run/Math.cos(PITCH)
    box(long?[u,y,sign*(RZ-run/2)]:[sign*(RX-run/2),y,u],long?[step-0.001,0.045,len]:[len,0.045,step-0.001],'roof',0.50+i/n*0.11,2,true,
      long?{rx:sign*PITCH,lines:false,layer:2}:{rz:-sign*PITCH,lines:false,layer:2})
    // Narrow raised ribs give the pale roof its corrugated read without heavy outlines.
    box(long?[u,y+0.027,sign*(RZ-run/2)]:[sign*(RX-run/2),y+0.027,u],long?[0.012,0.014,len]:[len,0.014,0.012],'roof',0.52+i/n*0.11,2,true,
      long?{rx:sign*PITCH,lines:false,layer:2}:{rz:-sign*PITCH,lines:false,layer:2})
  }
}
for(const sx of [-1,1])for(const sz of [-1,1]) {
  between([sx*RX,EAVE+0.04,sz*RZ],[sx*(RX-RZ),RIDGE+0.04,0],0.09,'roof',0.64,2)
  members[members.length-1].layer=2
}
box([0,RIDGE+0.04,0],[2*(RX-RZ),0.08,0.11],'roof',0.64,2,true,{layer:2})
for(const z of [-RZ,RZ])box([0,EAVE-0.045,z],[RX*2,0.15,0.12],'trim',0.65,2,true,{layer:2})
for(const x of [-RX,RX])box([x,EAVE-0.045,0],[0.12,0.15,RZ*2],'trim',0.65,2,true,{layer:2})
// Rear elevation, interpreted from W-8308: a tall upper wing over an open
// terrace at +x and a lower gabled garden room at -x. Street remains +z.
function facade(axis:'x'|'z', fixed:number, lo:number, hi:number, bottom:number, top:number|((u:number)=>number), openings:Opening[], outward=1) {
  const topAt=typeof top==='number'?()=>top:top
  const maxTop=Math.max(topAt(lo),topAt(hi),topAt((lo+hi)/2))
  for(let y=bottom+0.085;y<maxTop;y+=0.17) {
    // Short board segments also keep the SVG depth ordering reliable at corners.
    for(let u=lo;u<hi-0.001;u+=0.45) {
      const end=Math.min(u+0.45,hi),mid=(u+end)/2
      const height=Math.min(0.165,topAt(mid)-(y-0.0825))
      if(height<=0)continue
      let spans:[number,number][]=[[u,end]]
      for(const o of openings)if(y+0.083>=o.y-o.h/2&&y-0.083<=o.y+o.h/2) {
        spans=spans.flatMap(([a,b])=>{
          const l=o.x-o.w/2-0.04,r=o.x+o.w/2+0.04
          if(r<=a||l>=b)return [[a,b]]
          const pieces:[number,number][]=[]
          if(l>a)pieces.push([a,l]);if(r<b)pieces.push([r,b]);return pieces
        })
      }
      for(const [a,b] of spans)box(axis==='z'?[(a+b)/2,y,fixed]:[fixed,y,(a+b)/2],axis==='z'?[b-a,height,0.075]:[0.075,height,b-a],'clad',0.77,3)
    }
  }
  for(const o of openings) {
    const place=(u:number,y:number,w:number,h:number,mat:MaterialKey,depth=0.09)=>box(axis==='z'?[o.x+u,y,fixed+outward*0.06]:[fixed+outward*0.06,y,o.x+u],axis==='z'?[w,h,depth]:[depth,h,w],mat,0.88,3)
    place(0,o.y,o.w,o.h,'glass',0.055)
    for(const u of [-o.w/2,o.w/2])place(u,o.y,0.09,o.h+0.14,'trim')
    for(const y of [o.y-o.h/2,o.y+o.h/2])place(0,y,o.w+0.18,0.09,'trim')
    const divisions=o.w>2?4:o.w>1.3?2:1
    for(let i=1;i<divisions;i++)place(-o.w/2+o.w*i/divisions,o.y,0.065,o.h,'trim',0.12)
    if(!o.door)place(0,o.y,o.w,0.06,'trim',0.12)
  }
}
const rearOpenings:Opening[]=[{x:0,y:1.4,w:1.65,h:2.55,door:true},{x:3.8,y:1.35,w:2.2,h:2.4,door:true},{x:5.6,y:1.6,w:0.7,h:1.3},{x:0,y:5.45,w:2.6,h:0.8}]
facade('z',BACK,-HALF,HALF,0.12,EAVE,rearOpenings,-1)
// Two-storey rear wing. Its lower storey is the open, paved terrace.
const tallLeft=1.5,tallRight=HALF,tallRear=-9.0,tallJoin=-4.95
const tallRoof=(x:number)=>7.05-(x-tallLeft)/(tallRight-tallLeft)*0.7
box([(tallLeft+tallRight)/2,FLOOR-0.07,(tallRear+tallJoin)/2],[tallRight-tallLeft,0.18,tallJoin-tallRear],'joinery',0.42,1)
for(const x of [tallLeft,tallRight])for(const z of [tallRear,tallJoin])box([x,FLOOR/2,z],[0.14,FLOOR,0.14],'trim',0.36,1)
for(let x=tallLeft+0.15;x<tallRight;x+=0.55)box([x,FLOOR-0.22,(tallRear+tallJoin)/2],[0.07,0.16,tallJoin-tallRear],'joinery',0.43,1)
facade('z',tallRear,tallLeft,tallRight,FLOOR,tallRoof,[{x:2.8,y:4.9,w:1.35,h:1.7},{x:5.15,y:4.8,w:0.9,h:1.5}],-1)
facade('x',tallRight,tallRear,tallJoin,FLOOR,tallRoof(tallRight),[{x:-7.1,y:4.8,w:1.1,h:1.6}],1)
facade('x',tallLeft,tallRear,tallJoin,FLOOR,tallRoof(tallLeft),[{x:-7.1,y:5.05,w:1.1,h:1.7}],-1)
const tallPitch=Math.atan(0.7/(tallRight-tallLeft))
box([(tallLeft+tallRight)/2,6.72,(tallRear+tallJoin-0.15)/2],[(tallRight-tallLeft+0.65)/Math.cos(tallPitch),0.045,tallJoin-tallRear+0.55],'roof',0.6,2,true,{rz:-tallPitch,layer:1,lines:false})
for(let z=tallRear-0.3;z<tallJoin+0.2;z+=0.14)box([(tallLeft+tallRight)/2,6.755,z],[(tallRight-tallLeft+0.65)/Math.cos(tallPitch),0.012,0.012],'roof',0.61,2,true,{rz:-tallPitch,layer:1,lines:false})
for(const z of [tallRear-0.4,tallJoin+0.2])between([tallLeft-0.3,tallRoof(tallLeft-0.3),z],[tallRight+0.3,tallRoof(tallRight+0.3),z],0.13,'trim',0.66,2)
for(const x of [tallLeft-0.3,tallRight+0.3])box([x,tallRoof(x),(tallRear+tallJoin-0.2)/2],[0.14,0.13,tallJoin-tallRear+0.6],'trim',0.66,2)
// Window hood, projecting trim and frieze visible on the upper rear elevation.
box([2.8,5.88,tallRear-0.22],[1.8,0.07,0.52],'roof',0.9,3,true,{rx:-0.2})
for(const x of [2.08,3.52])between([x,5.45,tallRear-0.07],[x,5.8,tallRear-0.4],0.07,'trim',0.91,3)
box([(tallLeft+tallRight)/2,FLOOR-0.13,tallRear],[tallRight-tallLeft+0.15,0.22,0.16],'trim',0.86,3)
balustrade([tallLeft+0.08,0,tallRear],[tallRight-0.08,0,tallRear],FLOOR-0.7,0.46,true)
// Garden room: a lower gable with the high glazed pair seen in W-8289/W-8308.
const lowLeft=-HALF,lowRight=-1.4,lowRear=-9.55,lowJoin=-4.95
const lowCentre=(lowLeft+lowRight)/2,lowEave=3.65,lowRidge=5.05
const gableTop=(x:number)=>lowRidge-Math.abs(x-lowCentre)/(lowRight-lowLeft)*2*(lowRidge-lowEave)
facade('z',lowRear,lowLeft,lowRight,0.12,lowEave,[{x:lowCentre,y:1.95,w:3.25,h:1.85}],-1)
facade('x',lowLeft,lowRear,lowJoin,0.12,lowEave,[{x:-7.3,y:1.95,w:1.8,h:1.85}],-1)
facade('x',lowRight,lowRear,lowJoin,0.12,lowEave,[{x:-6.4,y:1.4,w:1.5,h:2.55,door:true}],1)
// Gable infill and two sloping-top panes built in narrow horizontal courses.
for(let y=lowEave+0.05;y<lowRidge-0.05;y+=0.09) {
 const half=(lowRidge-y)/(lowRidge-lowEave)*(lowRight-lowLeft)/2
 box([lowCentre,y,lowRear],[half*2,0.091,0.075],'clad',0.83,3)
}
const glassLo=lowCentre-1.62,glassHi=lowCentre+1.62,glassBottom=3.18
for(let x=glassLo;x<glassHi;x+=0.08) {
 const top=gableTop(x+0.04)-0.28
 box([x+0.04,(top+glassBottom)/2,lowRear-0.07],[0.081,top-glassBottom,0.055],'glass',0.89,3,true,{lines:false})
}
for(const x of [glassLo,lowCentre,glassHi])box([x,(glassBottom+gableTop(x)-0.28)/2,lowRear-0.12],[0.075,gableTop(x)-0.28-glassBottom,0.09],'trim',0.9,3)
box([lowCentre,glassBottom,lowRear-0.12],[glassHi-glassLo+0.08,0.08,0.09],'trim',0.9,3)
between([glassLo,gableTop(glassLo)-0.28,lowRear-0.12],[lowCentre,lowRidge-0.28,lowRear-0.12],0.085,'trim',0.9,3)
between([lowCentre,lowRidge-0.28,lowRear-0.12],[glassHi,gableTop(glassHi)-0.28,lowRear-0.12],0.085,'trim',0.9,3)
const lowPitch=Math.atan((lowRidge-lowEave)/((lowRight-lowLeft)/2))
for(const sign of [-1,1]) {
 const run=(lowRight-lowLeft)/2+0.35
 box([lowCentre+sign*run/2,lowRidge-run/2*Math.tan(lowPitch),(lowRear+lowJoin-0.2)/2],[run/Math.cos(lowPitch),0.045,lowJoin-lowRear+0.6],'roof',0.6,2,true,{rz:-sign*lowPitch,layer:1,lines:false})
 for(let z=lowRear-0.35;z<lowJoin+0.2;z+=0.14)box([lowCentre+sign*run/2,lowRidge-run/2*Math.tan(lowPitch)+0.035,z],[run/Math.cos(lowPitch),0.012,0.012],'roof',0.61,2,true,{rz:-sign*lowPitch,layer:1,lines:false})
 between([lowCentre,lowRidge+0.02,lowRear-0.4],[lowCentre+sign*run,lowRidge-run*Math.tan(lowPitch),lowRear-0.4],0.14,'trim',0.66,2)
 box([lowCentre+sign*run,lowRidge-run*Math.tan(lowPitch),(lowRear+lowJoin-0.2)/2],[0.14,0.14,lowJoin-lowRear+0.6],'trim',0.66,2)
}
box([lowCentre,lowRidge+0.03,(lowRear+lowJoin-0.2)/2],[0.12,0.08,lowJoin-lowRear+0.6],'roof',0.65,2)
// Sheltered central link and rear paving connect both volumes to the house.
box([0,3.35,-6.12],[2.9,0.09,2.55],'roof',0.6,2,true,{rx:-0.07,layer:1})
box([0,3.15,-7.4],[2.9,0.22,0.14],'trim',0.85,3)
for(const x of [-1.4,1.5])box([x,1.55,-7.4],[0.14,3.1,0.14],'trim',0.36,1)
box([2.5,0.02,-7.3],[7.9,0.09,5.1],'clad',0.76,3)
for(let x=-1.1;x<6.45;x+=0.65)box([x,0.068,-7.3],[0.008,0.004,5.1],'roof',0.84,3)
for(let z=-9.75;z<-4.8;z+=0.65)box([2.5,0.068,z],[7.9,0.004,0.008],'roof',0.84,3)
// Corner boards and downpipes make the added volumes read as finished buildings.
for(const [x,z,top] of [[lowLeft,lowRear,lowEave],[lowRight,lowRear,lowEave],[tallLeft,tallRear,tallRoof(tallLeft)],[tallRight,tallRear,tallRoof(tallRight)]]) {
 const bottom=x>=tallLeft?FLOOR:0.12
 box([x,(top+bottom)/2,z],[0.13,top-bottom,0.13],'trim',0.9,3)
}
for(const [x,z,top] of [[-HALF-0.12,FRONT,EAVE],[HALF+0.12,FRONT,EAVE],[tallLeft-0.12,tallRear,6.9],[lowRight+0.12,lowRear,lowEave]])box([x,top/2,z],[0.075,top,0.075],'trim',0.91,3)
// Fence panels stop at the gateposts. A separate hinged leaf opens inward,
// leaving the entrance visible, with a paved path aligned to the front door.
const fencePosts=new Set<string>()
function fencePost(x:number,z:number) {
 const key=`${x.toFixed(3)},${z.toFixed(3)}`;if(fencePosts.has(key))return;fencePosts.add(key)
 box([x,0.85,z],[0.19,1.7,0.19],'trim',0.93,3)
 box([x,1.72,z],[0.25,0.08,0.25],'trim',0.94,3)
}
function fence(a:V3,b:V3,gate=false) {
 const dx=b[0]-a[0],dz=b[2]-a[2],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len
 if(!gate){fencePost(a[0],a[2]);fencePost(b[0],b[2])}
 const inset=gate?0.055:0.105,span=len-inset*2,n=Math.max(2,Math.ceil(span/0.145))
 for(let i=0;i<=n;i++){const d=inset+span*i/n;box([a[0]+ux*d,0.71,a[2]+uz*d],[0.065,1.35,0.055],'trim',0.935,3,true,{ry:Math.atan2(-uz,ux)})}
 for(const y of [0.14,1.27,1.52])between([a[0]+ux*inset,y,a[2]+uz*inset],[b[0]-ux*inset,y,b[2]-uz*inset],0.085,'trim',0.93,3)
 if(gate)for(const p of [a,b])box([p[0],0.81,p[2]],[0.09,1.5,0.09],'trim',0.94,3)
}
for(const [a,b] of [[-7.1,-3.8],[-3.8,-1.02],[1.02,3.8],[3.8,7.1]])fence([a,0,6.7],[b,0,6.7])
const hinge:V3=[-0.88,0,6.68],gateLength=1.75,angle=Math.PI*65/180
const latch:V3=[hinge[0]+Math.cos(angle)*gateLength,0,hinge[2]-Math.sin(angle)*gateLength]
fence(hinge,latch,true)
for(const y of [0.35,1.15])box([hinge[0]-0.04,y,hinge[2]],[0.12,0.06,0.12],'joinery',0.95,3)
box([latch[0],1.12,latch[2]],[0.1,0.045,0.08],'joinery',0.95,3)
box([-1.02,1.02,6.82],[0.15,0.28,0.08],'joinery',0.95,3)
for(let z=FRONT+0.3;z<6.8;z+=0.65)box([0,0.075,z],[1.5,0.06,0.6],'clad',0.94,3)
fence([-7.1,0,6.7],[-7.1,0,3.9]);fence([-7.1,0,2.5],[-7.1,0,-3.4])
fencePost(-7.1,2.5);fence([-7.1,0,3.79],[-6.0,0,3.0],true)
fence([7.1,0,6.7],[7.1,0,2.6])

export const FRAME_MEMBERS = members
export const FRAME_BOUNDS = { length: W, halfWidth: 7.3, minZ: -10.1, maxZ: 6.9, height: RIDGE+0.2, ground: -0.12, centreY: RIDGE/2, centreZ: -1.6 }
export const FRAME_STAGE_STARTS = [0,0.14,0.48,0.72] as const
export const FRAME_STAGES = [
  {label:'Drawings',note:'Set out the two-storey house, verandah and rear additions.'},
  {label:'Frame',note:'Floor framing, walls and terrace posts establish the proportions.'},
  {label:'Roof',note:'The hipped street roof meets the distinct roof forms at the rear.'},
  {label:'Finish',note:'Weatherboards, verandah details and a gated picket fence complete the study.'},
] as const
