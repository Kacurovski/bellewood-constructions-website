
/** Croyde, Camp Hill. Photo-based architectural study: Ray White listing
 * 3599598, its exterior photographs, aerial and published floor plan.
 * The 14.5m front verandah and 23.9m return anchor the proportions; roof
 * heights and concealed construction are interpreted, not surveyed.
 * The animation explains a build sequence, not the renovation's chronology.
 * Street is +z; the long garden elevation is -x. Approximate metre units.
 */
export type MaterialKey = 'frame' | 'clad' | 'trim' | 'joinery' | 'roof' | 'roofTrim' | 'glass' | 'deck' | 'accent' | 'ground' | 'brick'
export type Member = {
  p: [number,number,number]; s: [number,number,number]
  rx:number; ry?:number; rz?:number; at:number; stage:0|1|2|3
  mat:MaterialKey; outer?:boolean; lines?:false; layer?:1|2; profile?:'corbel'
}
export type FrameView = 'front'|'rear'
export const FRAME_VIEWS: Record<FrameView,[number,number,number]> = {front:[23,21,42],rear:[-34,23,-26]}
type V3=[number,number,number]
type V2=[number,number]
type Opening={u:number;y:number;w:number;h:number;door?:boolean;panes?:number;hood?:boolean}
const members:Member[]=[]
const UP=3.1,EAVE=6.65
// One height datum for the verandah, stair flights and their landings.
const HANDRAIL=1.1,LOWER_RAIL=0.16,NEWEL_HEIGHT=1.2
function box(p:V3,s:V3,mat:MaterialKey,at:number,stage:Member['stage'],extras:Partial<Member>={}) {
  if(s.some(n=>n<=0.0001))return
  members.push({p,s,mat,at,stage,rx:0,outer:true,...extras})
}
function beam(a:V3,b:V3,width:number,mat:MaterialKey,at=0.86,stage:Member['stage']=3) {
  const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2]
  box([(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[width,width,Math.hypot(dx,dy,dz)],mat,at,stage,
    {rx:-Math.atan2(dy,Math.hypot(dx,dz)),ry:Math.atan2(dx,dz)})
}
function slab(x1:number,x2:number,z1:number,z2:number,y:number,mat:MaterialKey='ground',at=0.76) {
  box([(x1+x2)/2,y,(z1+z2)/2],[x2-x1,0.14,z2-z1],mat,at,3)
}
function subtract(spans:V2[],a:number,b:number):V2[] {
  return spans.flatMap(([lo,hi])=>{
    if(a>=hi||b<=lo)return [[lo,hi]]
    const out:V2[]=[];if(a>lo)out.push([lo,a]);if(b<hi)out.push([b,hi]);return out
  })
}
// Board courses stop at the openings. Front upper VJ boards run vertically.
function facade(axis:'x'|'z',fixed:number,lo:number,hi:number,bottom:number,top:number,holes:Opening[],sign=1,vertical=false) {
  const place=(u:number,y:number,w:number,h:number,mat:MaterialKey,depth=0.085,offset=0,at=0.79)=>
    box(axis==='z'?[u,y,fixed+sign*offset]:[fixed+sign*offset,y,u],axis==='z'?[w,h,depth]:[depth,h,w],mat,at,3)
  if(vertical) {
    const n=Math.ceil((hi-lo)/0.14),step=(hi-lo)/n
    for(let i=0;i<n;i++) {
      const u=lo+(i+0.5)*step;let spans:V2[]=[[bottom,top]]
      holes.forEach(o=>{if(u+step/2>o.u-o.w/2&&u-step/2<o.u+o.w/2)spans=subtract(spans,o.y-o.h/2-0.035,o.y+o.h/2+0.035)})
      spans.forEach(([a,b])=>place(u,(a+b)/2,step-0.004,b-a,'clad'))
    }
  } else {
    const n=Math.ceil((top-bottom)/0.17),step=(top-bottom)/n
    for(let i=0;i<n;i++) {
      const y=bottom+(i+0.5)*step;let spans:V2[]=[[lo,hi]]
      holes.forEach(o=>{if(y+step/2>o.y-o.h/2&&y-step/2<o.y+o.h/2)spans=subtract(spans,o.u-o.w/2-0.035,o.u+o.w/2+0.035)})
      spans.forEach(([a,b])=>place((a+b)/2,y,b-a,step-0.006,'clad',0.085,0,0.75+(y/EAVE)*0.08))
    }
  }
  holes.forEach(o=>{
    place(o.u,o.y,o.w,o.h,'glass',0.055,0.015,0.88)
    for(const u of [o.u-o.w/2,o.u+o.w/2])place(u,o.y,0.095,o.h+0.18,'joinery',0.13,0.055,0.89)
    for(const y of [o.y-o.h/2,o.y+o.h/2])place(o.u,y,o.w+0.18,0.105,'trim',0.14,0.06,0.89)
    const divisions=o.panes??(o.w>3?4:o.w>1.2?2:1)
    for(let i=1;i<divisions;i++)place(o.u-o.w/2+o.w*i/divisions,o.y,0.065,o.h,'joinery',0.12,0.07,0.9)
    if(o.door) {
      place(o.u,o.y-o.h*0.34,o.w-0.08,o.h*0.29,'joinery',0.1,0.07,0.91)
      place(o.u,o.y+o.h*0.32,o.w,0.06,'trim',0.12,0.07,0.91)
      place(o.u+o.w*0.13,o.y-0.1,0.035,0.14,'accent',0.06,0.15,0.93)
    } else place(o.u,o.y,o.w,0.06,'trim',0.12,0.07,0.9)
    if(o.hood) {
      const y=o.y+o.h/2+0.2
      box(axis==='z'?[o.u,y,fixed+sign*0.28]:[fixed+sign*0.28,y,o.u],axis==='z'?[o.w+0.45,0.065,0.65]:[0.65,0.065,o.w+0.45],'roof',0.92,3,axis==='z'?{rx:sign*0.25}:{rz:-sign*0.25})
      for(const u of [o.u-o.w/2,o.u+o.w/2])beam(axis==='z'?[u,y-0.4,fixed+sign*0.07]:[fixed+sign*0.07,y-0.4,u],axis==='z'?[u,y-0.08,fixed+sign*0.53]:[fixed+sign*0.53,y-0.08,u],0.055,'trim',0.93)
    }
  })
}
function frame(x1:number,x2:number,z1:number,z2:number,bottom:number,top:number) {
  for(const y of [bottom,top]) {
    for(const z of [z1,z2])box([(x1+x2)/2,y,z],[x2-x1,0.16,0.1],'frame',0.1,0,{outer:false})
    for(const x of [x1,x2])box([x,y,(z1+z2)/2],[0.1,0.16,z2-z1],'frame',0.1,0,{outer:false})
  }
  for(let x=x1+0.12;x<x2;x+=0.65)for(const z of [z1+0.12,z2-0.12])box([x,(bottom+top)/2,z],[0.07,top-bottom,0.09],'frame',0.16+(x-x1)*0.006,1,{outer:false})
  for(let z=z1+0.12;z<z2;z+=0.65)for(const x of [x1+0.12,x2-0.12])box([x,(bottom+top)/2,z],[0.09,top-bottom,0.07],'frame',0.19+(z-z1)*0.004,1,{outer:false})
  for(let z=z1+0.3;z<z2;z+=0.6)box([(x1+x2)/2,bottom-0.12,z],[x2-x1,0.2,0.09],'frame',0.045,0,{outer:false})
}
frame(-7.15,7.15,-3.9,6.9,0.2,UP-0.13)
frame(-0.65,7.15,-13.3,-3.9,0.2,UP-0.13)
frame(-4.9,7.15,-12.7,3.9,UP+0.12,EAVE-0.12)
frame(-4.9,4.8,3.9,6.9,UP+0.12,EAVE-0.12)
frame(0.7,4.8,6.9,8.15,UP+0.12,EAVE-0.12)
// Ground floor: bedrooms to the street, living and garage to the rear.
facade('z',6.9,-7.15,0.7,0.2,UP-0.15,[{u:-4.8,y:1.55,w:1.65,h:1.7},{u:-1.9,y:1.55,w:1.65,h:1.7}])
facade('z',8.1,0.7,4.8,0.2,UP-0.15,[{u:2.75,y:1.55,w:2.55,h:1.75}])
facade('x',0.7,6.9,8.1,0.2,UP-0.15,[],-1)
facade('x',4.8,6.9,8.1,0.2,UP-0.15,[])
facade('z',6.9,4.8,7.15,0.2,UP-0.15,[{u:6,y:1.55,w:1.1,h:1.6}])
facade('x',-7.15,-3.9,6.9,0.2,UP-0.15,[{u:5.15,y:1.5,w:1.6,h:2.4,door:true,hood:true},{u:1.7,y:2,w:2.1,h:0.75,panes:3,hood:true},{u:-1.25,y:1.5,w:1.65,h:2.4,door:true,hood:true}],-1)
facade('x',7.15,-13.3,3.9,0.2,UP-0.15,[{u:0.7,y:1.65,w:1.4,h:1.6,hood:true},{u:-2.3,y:2,w:1.4,h:0.8,hood:true},{u:-9.1,y:1.47,w:5.5,h:2.45,door:true,panes:5}])
facade('x',7.15,3.9,6.9,0.2,UP-0.15,[{u:5.35,y:1.6,w:1.45,h:1.5,hood:true}])
facade('x',-0.65,-13.3,-3.9,0.2,UP-0.15,[{u:-7,y:1.5,w:4.6,h:2.5,door:true,panes:4}],-1)
facade('z',-3.9,-7.15,-0.65,0.2,UP-0.15,[{u:-4.1,y:1.5,w:3.6,h:2.5,door:true,panes:4}],-1)
facade('z',-13.3,-0.65,7.15,0.2,UP-0.15,[{u:3.8,y:1.6,w:1.7,h:1.4}],-1)
// Upper front: recessed entry, projecting office and a short right return.
facade('z',6.9,-4.9,0.7,UP+0.08,EAVE,[{u:-3.25,y:4.63,w:1.55,h:2.65,door:true},{u:-0.7,y:4.63,w:1.3,h:2.65,door:true}],1,true)
facade('z',8.15,0.7,4.8,UP+0.08,EAVE,[{u:2.8,y:4.68,w:2.6,h:2.65,panes:3}],1,true)
facade('x',0.7,6.9,8.15,UP+0.08,EAVE,[],-1,true)
facade('x',4.8,3.9,8.15,UP+0.08,EAVE,[{u:5.9,y:4.7,w:1.9,h:2.45,panes:2}],1,true)
facade('z',3.9,4.8,7.15,UP+0.08,EAVE,[{u:6,y:4.63,w:1.5,h:2.65,door:true}],1,true)
facade('x',-4.9,-12.7,6.9,UP+0.08,EAVE,[{u:4.3,y:4.65,w:1.55,h:2.65,door:true},{u:0.8,y:4.65,w:1.35,h:2.6,door:true},{u:-2,y:4.7,w:1.45,h:2.5},{u:-7.2,y:4.65,w:6.1,h:2.75,door:true,panes:5}],-1,true)
facade('x',7.15,-12.7,3.9,UP+0.08,EAVE,[{u:1.5,y:4.7,w:1.5,h:2.2,hood:true},{u:-2,y:4.7,w:1.55,h:2.2,hood:true},{u:-7.9,y:4.7,w:1.6,h:2.2,hood:true},{u:-10.5,y:4.7,w:1.6,h:2.2,hood:true}])
facade('z',-12.7,-4.9,0.6,UP+0.08,EAVE,[{u:-1.8,y:4.8,w:2.5,h:1.8}],-1)
facade('z',-12.7,5.3,7.15,UP+0.08,EAVE,[],-1)
for(const x of [0.6,5.3])facade('x',x,-15.4,-12.7,UP+0.08,EAVE-0.15,[],Math.sign(x-3))
facade('z',-15.4,0.6,5.3,UP+0.08,EAVE-0.15,[{u:3,y:5.35,w:1.9,h:0.8}],-1)
slab(0.6,5.3,-15.4,-12.7,UP-0.04,'clad')
function deck(x1:number,x2:number,z1:number,z2:number) {
  slab(x1,x2,z1,z2,UP-0.08,'joinery',0.77)
  const n=Math.ceil((z2-z1)/0.16),step=(z2-z1)/n
  for(let i=0;i<n;i++)box([(x1+x2)/2,UP+0.025,z1+(i+0.5)*step],[x2-x1,0.055,step-0.006],'deck',0.8,3,{lines:false})
}
deck(-7.25,0.7,6.9,10);deck(0.7,4.8,8.15,10);deck(4.8,7.25,3.9,10)
deck(-7.25,-4.9,-3.9,6.9)
// Leave an open stairwell instead of laying the upper terrace over its flights.
deck(-9,-7.82,-13.9,-3.9);deck(-7.82,-4.9,-13.9,-12.08);deck(-7.82,-4.9,-8.88,-3.9)
deck(-2.1,0.7,10,10.85)
slab(-7.25,7.25,8.2,10,0.1);slab(-7.25,0.7,6.9,8.2,0.1);slab(-9,-0.65,-13.9,-3.9,0.1)
function post(x:number,z:number,top=6.35,bottom=UP-0.12) {
  // The charcoal shaft reaches the deck and beam. Tall white collars used to
  // hide both ends, making the posts look detached from the balustrade.
  box([x,(bottom+top)/2,z],[0.14,top-bottom,0.14],'accent',0.33,1)
  box([x,UP+0.065,z],[0.19,0.025,0.19],'trim',0.88,3,{lines:false})
  box([x,top-0.025,z],[0.18,0.09,0.18],'trim',0.88,3)
}
function verandahSupport(x:number,z:number) {
  const bottom=0.17,top=UP-0.07
  box([x,(bottom+top)/2,z],[0.14,top-bottom,0.14],'accent',0.22,1)
  box([x,bottom,z],[0.22,0.035,0.22],'ground',0.85,3,{lines:false})
}
function bracket(x:number,z:number,axis:'x'|'z',dir:number,top=6.34) {
  // Solid concave timber corbels, seated against the post and beam underside.
  // The old diagonal sticks looked like loose offcuts at this viewing scale.
  const width=0.36,drop=0.44,head=top-0.06,offset=dir*(0.055+width/2)
  box(axis==='x'?[x+offset,head-drop/2,z]:[x,head-drop/2,z+offset],
    [width,drop,0.085],'trim',0.91,3,
    {profile:'corbel',ry:axis==='x'?(dir>0?0:Math.PI):-dir*Math.PI/2,lines:false})
}
function rail(a:V2,b:V2,base=UP+0.08,height=1.02,frieze=false) {
  const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),n=Math.ceil(len/0.135)
  const low=frieze?base:base+0.08,high=base+height
  for(let i=1;i<n;i++)box([a[0]+dx*i/n,(low+high)/2,a[1]+dz*i/n],[0.045,high-low,0.045],'trim',0.89,3)
  for(const y of frieze?[high]:[low,high-0.18])beam([a[0],y,a[1]],[b[0],y,b[1]],0.065,'trim',0.89)
  if(!frieze)beam([a[0],base+height,a[1]],[b[0],base+height,b[1]],0.075,'accent',0.9)
}
function newel(x:number,z:number,floor:number,bottom=floor-0.25) {
  const top=floor+NEWEL_HEIGHT
  // A landing post is also its support, not a dark stub on a separate white leg.
  box([x,(bottom+top)/2,z],[0.14,top-bottom,0.14],'accent',0.87,3)
  box([x,top,z],[0.16,0.035,0.16],'accent',0.92,3,{lines:false})
}
function landingRail(a:V2,b:V2,floor:number) { rail(a,b,floor+0.08,HANDRAIL-0.08) }
const frontPosts=[-7.25,-4.8,-2.1,0.7,3.65,7.25]
frontPosts.forEach(x=>{
  post(x,10);verandahSupport(x,10)
  for(const d of [-1,1]) {
    const intoEntrance=(x===-2.1&&d===1)||(x===0.7&&d===-1)
    if(Math.abs(x+d*0.5)<7.3&&!intoEntrance)bracket(x,10,'x',d)
  }
})
for(let i=0;i<frontPosts.length-1;i++) {
  // Rails meet the post centreline, rather than stopping short of its face.
  const a=frontPosts[i],b=frontPosts[i+1]
  if(i!==2)rail([a,10],[b,10]) // Real opening at the stair entrance.
  rail([a,10],[b,10],UP-0.52,0.36,true)
}
for(const z of [3.9,6.9]){post(7.25,z);verandahSupport(7.25,z)}
rail([7.25,3.9],[7.25,6.9]);rail([7.25,6.9],[7.25,10])
const gardenPosts=[-3.9,-0.7,2.5,6.1,10]
gardenPosts.slice(0,-1).forEach(z=>{
  post(-7.25,z);bracket(-7.25,z,'z',1)
  if(z>gardenPosts[0])bracket(-7.25,z,'z',-1)
})
for(let i=0;i<gardenPosts.length-1;i++)rail([-7.25,gardenPosts[i]],[-7.25,gardenPosts[i+1]])
for(const z of [-13.9,-10.65,-7.3,-3.9]) {
  post(-9,z,6.4);box([-9,UP/2,z],[0.22,UP,0.22],'ground',0.31,1)
  if(z<-3.9)bracket(-9,z,'z',1,6.4)
  if(z>-13.9)bracket(-9,z,'z',-1,6.4)
}
for(const [a,b] of [[-13.9,-10.65],[-10.65,-7.3],[-7.3,-3.9]])rail([-9,a],[-9,b])
rail([-9,-3.9],[-7.25,-3.9]);rail([-9,-13.9],[-6.6,-13.9]);rail([-6.6,-13.9],[-4.9,-13.9])
post(-6.6,-13.9,6.4);post(-4.9,-13.9,6.4)
for(const [a,b] of [[[-7.25,10],[7.25,10]],[[-7.25,10],[-7.25,-3.9]],[[7.25,10],[7.25,3.9]],[[-9,-3.9],[-9,-13.9]],[[-9,-3.9],[-7.25,-3.9]],[[-9,-13.9],[-4.9,-13.9]]] as [V2,V2][]) {
  for(const y of [UP-0.08,6.35])beam([a[0],y,a[1]],[b[0],y,b[1]],y<4?0.22:0.18,'trim',0.86)
}
// Stair handrails follow each flight, with an actual intermediate landing.
function stair(x:number,z1:number,z2:number,y1:number,y2:number,width:number,n:number,posts:{start?:boolean;startBottom?:number;endBottom?:number}={}) {
  const dz=(z2-z1)/n,dy=(y2-y1)/n
  for(let i=0;i<n;i++)box([x,y1+dy*i,z1+dz*(i+0.5)],[width,0.09,Math.abs(dz)+0.018],'deck',0.86,3)
  for(const side of [-1,1]) {
    const xx=x+side*(width/2-0.04)
    // Deep side stringers carry the open treads. A square stick below the
    // flight left the tread ends and post feet visibly unsupported.
    const slope=-Math.atan2(y2-y1,Math.abs(z2-z1))
    box([xx,(y1+y2)/2-0.1,(z1+z2)/2],[0.14,0.3,Math.hypot(z2-z1,y2-y1)],'trim',0.85,3,
      {rx:slope,ry:z2<z1?Math.PI:0})
    beam([xx,y1+HANDRAIL,z1],[xx,y2+HANDRAIL,z2],0.075,'accent',0.91)
    beam([xx,y1+LOWER_RAIL,z1],[xx,y2+LOWER_RAIL,z2],0.075,'trim',0.91)
    const count=Math.ceil(Math.abs(z2-z1)/0.14)
    for(let j=1;j<count;j++)box([xx,y1+(y2-y1)*j/count+(LOWER_RAIL+HANDRAIL)/2,z1+(z2-z1)*j/count],[0.045,HANDRAIL-LOWER_RAIL,0.045],'trim',0.91,3)
    if(posts.start!==false)newel(xx,z1,y1,posts.startBottom)
    newel(xx,z2,y2,posts.endBottom)
  }
}
const ENTRY=-0.7
// Use the entrance column lines for both flights. The previous narrower
// stair created four short dog-leg rails and extra posts beside the entrance.
const ENTRY_STAIR_WIDTH=2.88
stair(ENTRY,10.8,12.9,UP,1.65,ENTRY_STAIR_WIDTH,9,{start:false,endBottom:0.17})
slab(ENTRY-1.48,ENTRY+1.48,12.9,13.9,1.61,'deck',0.86)
for(const side of [-1,1]) {
  const x=ENTRY+side*1.4
  landingRail([x,10],[x,10.8],UP)
  landingRail([x,12.9],[x,13.9],1.65)
  box([x,1.56,13.4],[0.14,0.23,1.14],'trim',0.86,3)
  for(const z of [12.9,13.9])box([x,0.17,z],[0.22,0.035,0.22],'ground',0.88,3,{lines:false})
}
stair(ENTRY,13.9,15.95,1.65,0.18,ENTRY_STAIR_WIDTH,9,{startBottom:0.17,endBottom:0.1})
slab(ENTRY-1.6,ENTRY+1.6,15.93,16.5,0.1,'ground',0.9)
stair(-5.65,-12,-9.9,UP,1.6,1.35,9);slab(-7.74,-4.94,-9.9,-8.95,1.55,'deck',0.86)
stair(-7.05,-9.9,-12,1.6,0.18,1.35,9)
// Continuous guard around the rear landing and upstairs stairwell. The two
// flights share the landing datum and leave the walking route unobstructed.
for(const [a,b] of [[[-5.015,-9.9],[-4.94,-8.95]],[[-4.94,-8.95],[-7.685,-8.95]],[[-7.685,-8.95],[-7.685,-9.9]],[[-6.285,-9.9],[-6.415,-9.9]]] as [V2,V2][])
  landingRail(a,b,1.6)
for(const x of [-4.94,-7.685])newel(x,-8.95,1.6)
for(const [a,b] of [[[-7.83,-12.08],[-7.83,-8.88]],[[-7.83,-8.88],[-4.95,-8.88]],[[-7.83,-12.08],[-6.285,-12.08]],[[-6.285,-12.08],[-6.285,-12]]] as [V2,V2][])
  landingRail(a,b,UP)
for(const [x,z] of [[-7.83,-12.08],[-7.83,-8.88],[-4.95,-8.88]])newel(x,z,UP)
box([-7.65,UP+0.44,-13.48],[2.3,0.85,0.65],'joinery',0.9,3)
box([-7.65,UP+0.9,-13.48],[2.4,0.07,0.73],'ground',0.91,3)
box([-7.7,UP+0.96,-13.45],[0.8,0.06,0.45],'accent',0.93,3)

// Intersect roof faces before emitting corrugated strips. Hidden overlaps are
// removed so hips and gables meet in valleys instead of cutting through roofs.
type Face={poly:V2[];a:number;b:number;c:number}
const roofs:Face[]=[]
const area=(p:V2[])=>p.reduce((s,v,i)=>{const n=p[(i+1)%p.length];return s+v[0]*n[1]-n[0]*v[1]},0)/2
function clip(p:V2[],a:number,b:number,c:number):V2[] {
  const out:V2[]=[]
  for(let i=0;i<p.length;i++) {
    const s=p[i],e=p[(i+1)%p.length],ds=a*s[0]+b*s[1]+c,de=a*e[0]+b*e[1]+c
    if(ds>=-1e-7)out.push(s)
    if((ds>0&&de<0)||(ds<0&&de>0)){const t=ds/(ds-de);out.push([s[0]+t*(e[0]-s[0]),s[1]+t*(e[1]-s[1])])}
  }
  return out
}
function difference(poly:V2[],cutter:V2[]):V2[][] {
  const outside:V2[][]=[];let remainder=poly
  const sign=area(cutter)>=0?1:-1
  for(let i=0;i<cutter.length&&remainder.length>=3;i++) {
    const p=cutter[i],q=cutter[(i+1)%cutter.length]
    const a=-(q[1]-p[1])*sign,b=(q[0]-p[0])*sign,c=-(a*p[0]+b*p[1])
    const part=clip(remainder,-a,-b,-c)
    if(part.length>=3&&Math.abs(area(part))>0.0001)outside.push(part)
    remainder=clip(remainder,a,b,c)
  }
  return outside
}
function face(poly:V2[],a:number,b:number,c:number){roofs.push({poly,a,b,c})}
function hip(x1:number,x2:number,z1:number,z2:number,eave:number,rise:number) {
  const hx=(x2-x1)/2,hz=(z2-z1)/2,run=Math.min(hx,hz),s=rise/run
  if(hx<=hz) {
    const cx=(x1+x2)/2,rb=z1+run,rf=z2-run
    face([[x1,z1],[cx,rb],[cx,rf],[x1,z2]],s,0,eave-x1*s)
    face([[x2,z2],[cx,rf],[cx,rb],[x2,z1]],-s,0,eave+x2*s)
    face([[x1,z1],[x2,z1],[cx,rb]],0,s,eave-z1*s)
    face([[x2,z2],[x1,z2],[cx,rf]],0,-s,eave+z2*s)
  } else {
    const cz=(z1+z2)/2,rl=x1+run,rr=x2-run
    face([[x1,z1],[x2,z1],[rr,cz],[rl,cz]],0,s,eave-z1*s)
    face([[x2,z2],[x1,z2],[rl,cz],[rr,cz]],0,-s,eave+z2*s)
    face([[x1,z2],[x1,z1],[rl,cz]],s,0,eave-x1*s)
    face([[x2,z1],[x2,z2],[rr,cz]],-s,0,eave+x2*s)
  }
}
function gable(x1:number,x2:number,z1:number,z2:number,eave:number,rise:number,side=false) {
  if(side) {
    const cz=(z1+z2)/2,s=rise/((z2-z1)/2)
    face([[x1,z1],[x2,z1],[x2,cz],[x1,cz]],0,s,eave-z1*s)
    face([[x1,cz],[x2,cz],[x2,z2],[x1,z2]],0,-s,eave+z2*s)
  } else {
    const cx=(x1+x2)/2,s=rise/((x2-x1)/2)
    face([[x1,z1],[cx,z1],[cx,z2],[x1,z2]],s,0,eave-x1*s)
    face([[cx,z1],[x2,z1],[x2,z2],[cx,z2]],-s,0,eave+x2*s)
  }
}
hip(-7.65,7.65,-4.55,10.4,6.34,2.75)
gable(0.1,5.65,0.7,8.67,7.18,2)
gable(3.7,7.55,0.2,4.8,6.7,1.65,true)
gable(-7.6,-2.2,-4.5,-0.7,6.85,1.28,true)
gable(-2.2,0.8,8.3,10.85,6.33,1.12)
hip(-5.2,7.55,-13,-3.75,6.52,1.92)
hip(-9.4,-4.65,-14.3,-3.55,6.35,1.35)
hip(0.3,5.6,-15.75,-12.35,6.5,0.85)
gable(ENTRY-1.5,ENTRY+1.5,16.5,18.5,2.52,0.93)
function roofAt(x:number,z:number) {
  let h=-Infinity,best:Face|undefined
  roofs.forEach(f=>{
    const sign=area(f.poly)>=0?1:-1
    const inside=f.poly.every((p,j)=>{const q=f.poly[(j+1)%f.poly.length];return ((q[0]-p[0])*(z-p[1])-(q[1]-p[1])*(x-p[0]))*sign>=-0.0001})
    const y=f.a*x+f.b*z+f.c
    if(inside&&y>h){h=y;best=f}
  })
  return {h,face:best}
}
const roofHeight=(x:number,z:number)=>roofAt(x,z).h
const roofEdges=new Map<string,{a:V3;b:V3;exposed:boolean}>()
roofs.forEach((f,index)=>{
  let pieces=[f.poly]
  roofs.forEach((g,j)=>{
    if(j===index)return
    const upper=clip(g.poly,g.a-f.a,g.b-f.b,g.c-f.c-0.0001)
    if(upper.length>=3&&Math.abs(area(upper))>0.0001)pieces=pieces.flatMap(p=>difference(p,upper))
  })
  pieces.forEach(poly=>{
    const gateRoof=f.poly.every(p=>p[1]>15)
    const alongX=Math.abs(f.a)>0.001,cross=alongX?1:0,along=alongX?0:1
    const lo=Math.min(...poly.map(p=>p[cross])),hi=Math.max(...poly.map(p=>p[cross]))
    const n=Math.max(1,Math.ceil((hi-lo)/0.12)),step=(hi-lo)/n
    for(let i=0;i<n;i++) {
      const u=lo+(i+0.5)*step,hits:number[]=[]
      poly.forEach((p,j)=>{const q=poly[(j+1)%poly.length];if((p[cross]<=u&&q[cross]>u)||(q[cross]<=u&&p[cross]>u)){const t=(u-p[cross])/(q[cross]-p[cross]);hits.push(p[along]+t*(q[along]-p[along]))}})
      if(hits.length<2)continue
      const a=Math.min(...hits),b=Math.max(...hits),v=(a+b)/2
      const x=alongX?v:u,z=alongX?u:v,y=f.a*x+f.b*z+f.c
      const slope=alongX?f.a:f.b,len=(b-a)*Math.sqrt(1+slope*slope),rot=alongX?{rz:Math.atan(slope)}:{rx:-Math.atan(slope)}
      box([x,y,z],alongX?[len,0.045,step+0.002]:[step+0.002,0.045,len],'roof',gateRoof?0.94+i/n*0.012:0.49+i/n*0.12,gateRoof?3:2,{...rot,lines:false})
      box([x,y+0.032,z],alongX?[len,0.013,0.012]:[0.012,0.013,len],'roof',gateRoof?0.945+i/n*0.01:0.51+i/n*0.12,gateRoof?3:2,{...rot,lines:false})
    }
    poly.forEach((p,j)=>{
      const q=poly[(j+1)%poly.length],a:V3=[p[0],f.a*p[0]+f.b*p[1]+f.c+0.035,p[1]],b:V3=[q[0],f.a*q[0]+f.b*q[1]+f.c+0.035,q[1]]
      const len=Math.hypot(a[0]-b[0],a[2]-b[2])
      if(len<0.3)return
      // Polygon subtraction creates internal partition edges. Cap only true
      // eaves, hips, ridges and valleys, never a seam within one planar sheet.
      const mx=(a[0]+b[0])/2,mz=(a[2]+b[2])/2,dx=(b[0]-a[0])/len,dz=(b[2]-a[2])/len
      const l=roofAt(mx-dz*0.02,mz+dx*0.02).face,r=roofAt(mx+dz*0.02,mz-dx*0.02).face
      if(l&&r&&Math.abs(l.a-r.a)<0.001&&Math.abs(l.b-r.b)<0.001&&Math.abs(l.c-r.c)<0.001)return
      const key=[a,b].map(v=>v.map(n=>n.toFixed(2)).join(',')).sort().join('/')
      // Dark gutters and barge flashings belong at the exposed perimeter.
      // Internal hips/ridges/valleys retain the pale roof-metal capping.
      const gableEnd=[8.67,10.85,16.5,18.5].some(z=>Math.abs(a[2]-z)<0.02&&Math.abs(b[2]-z)<0.02)
        || [7.55,-7.6].some(x=>Math.abs(a[0]-x)<0.02&&Math.abs(b[0]-x)<0.02)
      const exposed=!l||!r||(gableEnd&&Math.abs(a[1]-b[1])>0.02)
      roofEdges.set(key,{a,b,exposed})
    })
  })
})
roofEdges.forEach(({a,b,exposed})=>{
  const gateRoof=a[2]>15&&b[2]>15
  if(exposed) {
    const eave=Math.abs(a[1]-b[1])<0.02
    const offset=eave?-0.045:0.015
    beam([a[0],a[1]+offset,a[2]],[b[0],b[1]+offset,b[2]],eave?0.14:0.09,'roofTrim',gateRoof?0.95:0.66,gateRoof?3:2)
  } else beam(a,b,0.07,'roof',gateRoof?0.95:0.65,gateRoof?3:2)
})
function gableDetail(axis:'x'|'z',fixed:number,centre:number,half:number,base:number,peak:number) {
  const point=(u:number,y:number):V3=>axis==='z'?[u,y,fixed]:[fixed,y,u]
  const gate=axis==='z'&&fixed>15
  for(let u=centre-half+0.06;u<centre+half;u+=0.085) {
    const top=peak-Math.abs(u-centre)/half*(peak-base)
    if(top-base>0.04)box(point(u,(base+top)/2),axis==='z'?[0.055,top-base,0.07]:[0.07,top-base,0.055],'accent',gate?0.95:0.87,3,{lines:false})
  }
  beam(point(centre-half,base),point(centre,peak),0.15,'trim',gate?0.95:0.89)
  beam(point(centre,peak),point(centre+half,base),0.15,'trim',gate?0.95:0.89)
  beam(point(centre-half,base),point(centre+half,base),0.13,'trim',gate?0.95:0.89)
  beam(point(centre,base),point(centre,peak),0.1,'trim',gate?0.95:0.89)
}
gableDetail('z',8.71,2.875,2.67,7.26,9.13)
gableDetail('x',7.59,2.5,2.19,6.79,8.3)
gableDetail('x',-7.64,-2.6,1.8,6.94,8.08)
gableDetail('z',10.89,ENTRY,1.4,6.38,7.4)
// One street-facing entrance arch. Repeating the full arch at the back of
// this shallow porch produced two visibly overlapping curves beside the post.
{
  const z=10.8
  for(const x of [-2.1,0.7]) {
    post(x,z,6.4)
    beam([x,6.35,10],[x,6.35,z],0.18,'trim',0.86)
    bracket(x,z,'z',-1,6.35)
  }
  beam([-2.1,6.35,z],[0.7,6.35,z],0.18,'trim',0.86)
  // Spring the arch from the inner faces of the columns. The former narrow
  // horseshoe hung clear of both posts with no timber tying it to the beam.
  const r=1.33,cy=5.05,head=6.35
  for(let i=0;i<32;i++) {
    const a=i*Math.PI/32,b=(i+1)*Math.PI/32
    beam([ENTRY+r*Math.cos(a),cy+r*Math.sin(a),z+0.025],[ENTRY+r*Math.cos(b),cy+r*Math.sin(b),z+0.025],0.085,'trim',0.93)
  }
  for(const x of [ENTRY-r,ENTRY+r])beam([x,4.95,z+0.025],[x,cy,z+0.025],0.085,'trim',0.93)
  for(let u=-r+0.07;u<r;u+=0.105) {
    const bottom=cy+Math.sqrt(r*r-u*u)
    if(bottom<head)box([ENTRY+u,(bottom+head)/2,z+0.025],[0.035,head-bottom,0.055],'trim',0.93,3,{lines:false})
  }
}
for(let y=6.62;y<7.23;y+=0.15)box([2.875,y,8.61],[5.1,0.143,0.08],'clad',0.85,3)
for(const y of [6.66,7.12])box([2.875,y,8.69],[5.35,0.08,0.1],'trim',0.9,3)
// Close the back of intersecting gables above the adjoining roof surface.
function gableBack(axis:'x'|'z',fixed:number,centre:number,half:number,base:number,peak:number,outward:number) {
  for(let u=centre-half;u<centre+half;u+=0.08) {
    const mid=u+0.04,top=peak-Math.abs(mid-centre)/half*(peak-base)
    const roof=axis==='z'?roofHeight(mid,fixed+outward*0.03):roofHeight(fixed+outward*0.03,mid)
    const bottom=Math.max(base,Number.isFinite(roof)?roof:base)
    if(top<=bottom)continue
    box(axis==='z'?[mid,(bottom+top)/2,fixed]:[fixed,(bottom+top)/2,mid],axis==='z'?[0.081,top-bottom,0.07]:[0.07,top-bottom,0.081],'clad',0.84,3,{lines:false})
  }
}
gableBack('z',0.69,2.875,2.775,7.18,9.18,-1)
gableBack('x',3.69,2.5,2.3,6.7,8.35,-1)
gableBack('x',-2.19,-2.6,1.9,6.85,8.13,1)
// Close the rear service floor where the ensuite steps beyond the main wall.
slab(-0.65,7.15,-13.3,-3.9,UP-0.05,'joinery',0.78)
const chimneyX=4.3,chimneyZ=-1.55,chimneyBase=roofHeight(chimneyX,chimneyZ)
box([chimneyX,chimneyBase+0.55,chimneyZ],[0.65,1.1,0.55],'brick',0.67,2)
box([chimneyX,chimneyBase+1.12,chimneyZ],[0.83,0.12,0.73],'brick',0.68,2)
box([chimneyX,chimneyBase+1.2,chimneyZ],[0.48,0.05,0.4],'accent',0.69,2)
for(const x of [1.9,2.7])box([x,7.42,-14.3],[0.65,0.06,0.7],'glass',0.93,3,{rx:0.03})
for(const [a,b,y] of [[[ -7.65,10.4],[7.65,10.4],6.3],[[-7.65,-4.55],[-7.65,10.4],6.3],[[7.65,-4.55],[7.65,10.4],6.3],[[-9.4,-14.3],[-9.4,-3.55],6.31],[[-9.4,-14.3],[-4.65,-14.3],6.31],[[7.55,-13],[7.55,-4.55],6.48]] as [V2,V2,number][])beam([a[0],y,a[1]],[b[0],y,b[1]],0.14,'trim',0.68,2)
for(const [x,z,y] of [[-7.3,9.9,6.3],[7.3,9.9,6.3],[-9.05,-13.9,6.3],[7.2,-12.7,6.5]])box([x,y/2,z],[0.075,y,0.075],'trim',0.94,3)
for(const x of [-4.3,1.05,4.55]) {
  const z=x<0?6.99:8.24
  box([x,5.3,z],[0.13,0.24,0.14],'accent',0.95,3)
  box([x,5.3,z+0.08],[0.075,0.15,0.02],'ground',0.95,3)
}
for(const [x,z] of [[-7.15,6.9],[7.15,6.9],[-7.15,-3.9],[7.15,-12.7]])box([x,1.55,z],[0.14,2.9,0.14],'trim',0.9,3)
for(const [x,z] of [[-4.9,6.9],[0.7,8.15],[4.8,8.15],[7.15,3.9],[-4.9,-12.7],[7.15,-12.7]])box([x,4.9,z],[0.13,3.5,0.13],'trim',0.9,3)
// Gatehouse, white pickets and a physically open gate aligned with the stair.
const gateZ=17.5
for(const x of [ENTRY-1.2,ENTRY+1.2]) {
  for(const z of [16.7,18.3]) {
    box([x,1.25,z],[0.18,2.5,0.18],'accent',0.9,3)
    box([x,0.83,z],[0.3,1.66,0.3],'trim',0.91,3)
  }
  beam([x,2.49,16.6],[x,2.49,18.4],0.15,'trim',0.91)
}
gableDetail('z',18.52,ENTRY,1.45,2.56,3.43)
gableDetail('z',16.48,ENTRY,1.45,2.56,3.43)
for(let i=0;i<16;i++) {
  const a=i*Math.PI/16,b=(i+1)*Math.PI/16,r=1.07
  beam([ENTRY+r*Math.cos(a),1.53+r*Math.sin(a),18.3],[ENTRY+r*Math.cos(b),1.53+r*Math.sin(b),18.3],0.11,'trim',0.93)
}
for(const side of [-1,1]) {
  const x=ENTRY+side*1.64
  box([x,0.97,gateZ],[0.62,1.94,0.42],'trim',0.92,3)
  box([x,1.08,gateZ+0.24],[0.16,0.12,0.025],'accent',0.94,3)
  const lo=side<0?-7.3:x+0.34,hi=side<0?x-0.34:7.3
  rail([lo,gateZ],[hi,gateZ],0.18,1.3)
  for(let u=lo;u<=hi;u+=2.1)box([u,0.8,gateZ],[0.17,1.6,0.17],'trim',0.92,3)
}
const hinge:V2=[ENTRY-0.97,gateZ],leaf:V2=[ENTRY-0.97+Math.cos(1.05)*1.88,gateZ-Math.sin(1.05)*1.88]
rail(hinge,leaf,0.17,1.32)
beam([leaf[0],0.15,leaf[1]],[leaf[0],1.56,leaf[1]],0.08,'trim',0.94)
slab(ENTRY-1.02,ENTRY+1.02,16.35,18.7,0.05,'ground',0.92)
for(let i=0;i<6;i++)for(let j=0;j<7;j++)if((i+j)%2===0)box([ENTRY-0.85+i*0.34,0.128,16.48+j*0.31],[0.335,0.008,0.305],'joinery',0.94,3,{lines:false})

// Continuous painted base closes the joist ends along the finished walls.
for(const [x,z1,z2] of [[-7.18,-3.9,6.9],[7.18,-13.3,6.9],[-0.68,-13.3,-3.9]])
  box([x,0.16,(z1+z2)/2],[0.14,0.32,z2-z1],'joinery',0.86,3)
for(const [z,x1,x2] of [[6.94,-7.15,0.7],[6.94,4.8,7.15],[8.14,0.7,4.8],[-13.34,-0.65,7.15],[-3.94,-7.15,-0.65]])
  box([(x1+x2)/2,0.16,z],[x2-x1,0.32,0.14],'joinery',0.86,3)

export const FRAME_MEMBERS=members
export const FRAME_BOUNDS={length:14.5,halfWidth:9.55,minZ:-15.9,maxZ:18.85,height:9.6,ground:-0.1,centreY:4.75,centreZ:1.45}
export const FRAME_STAGE_STARTS=[0,0.14,0.48,0.72] as const
export const FRAME_STAGES=[
  {label:'Drawings',note:'Set out Croyde’s two levels, wraparound verandah and garden terrace.'},
  {label:'Frame',note:'Floors, walls and verandah posts establish the shape of the home.'},
  {label:'Roof',note:'Metal roofing, gutters and edging complete the layered gables.'},
  {label:'Finish',note:'Cladding and verandah details finish the house. Paths, fencing and the pool complete the grounds.'},
] as const
