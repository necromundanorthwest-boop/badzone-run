// Badzone Run: original deterministic digital rules. No DOM or storage dependencies.
export const VERSION='0.1.0', WIDTH=8, HEIGHT=12;
export const RACERS={
 runner:{name:'Scrap Runner',maxSpeed:3,handling:3,hull:8,firepower:1,crew:2,mass:2,trait:'Balanced chassis'},
 knife:{name:'Road Knife',maxSpeed:4,handling:2,hull:6,firepower:1,crew:1,mass:1,trait:'Fast, light and agile'},
 bruiser:{name:'Iron Bruiser',maxSpeed:2,handling:4,hull:12,firepower:1,crew:3,mass:3,trait:'+1 ram damage'},
 wagon:{name:'Gun Wagon',maxSpeed:3,handling:4,hull:9,firepower:2,crew:3,mass:2,trait:'Heavy gun: 2 damage'}
};
export const UPGRADES={
 engine:{name:'Overcharged engine',cost:100,description:'+1 top speed (up to 4); +1 handling difficulty at top speed.'},
 ram:{name:'Armoured ram',cost:100,description:'+1 ram damage; accelerate only on alternate activations.'},
 gyro:{name:'Gyro steering',cost:120,description:'Automatically reroll the first failed handling test in each section.'},
 plating:{name:'Reinforced plating',cost:100,description:'+2 Hull; −1 top speed (minimum 2).'},
 barrel:{name:'Short barrel',cost:100,description:'+1 shot damage within 2 cells; maximum range 3.'}
};
export const HAZARDS=['gunk','mines','turrets','inferno','debris','gloom'];
export const HAZARD_LABELS={gunk:'Gunk slick',mines:'Mines',turrets:'Auto-turrets',inferno:'Inferno',debris:'Falling debris',gloom:'Gloom'};
export function hashSeed(seed){let h=2166136261;for(const c of String(seed)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0||1}
export function rng(seed){let n=typeof seed==='number'?seed:hashSeed(seed);return ()=>{n=(n+0x6D2B79F5)>>>0;let t=Math.imul(n^(n>>>15),1|n);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296}}
export function dailySeed(date=new Date()){if(!(date instanceof Date)||!Number.isFinite(+date))throw Error('Invalid date');return 'BADZONE-'+date.toISOString().slice(0,10)}
export function validSeed(seed){return typeof seed==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(seed)}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const cell=(x,y)=>y*WIDTH+x;
export function generateTrack(seed,index){
 if(!validSeed(seed)||!Number.isInteger(index)||index<0||index>2)throw Error('Invalid track request');
 const random=rng(`${seed}:track:${index}`), pick=n=>Math.floor(random()*n);
 const density=['Open','Light','Dense'][pick(3)],edge=['Barrier','Drop','Open Edge'][pick(3)],hazard=HAZARDS[pick(6)];
 const tiles=Array(WIDTH*HEIGHT).fill('road'), count={Open:5,Light:10,Dense:16}[density];
 let placed=0;for(let tries=0;placed<count&&tries<500;tries++){const x=pick(WIDTH),y=1+pick(8),k=cell(x,y);if(x!==2&&x!==5&&tiles[k]==='road'){tiles[k]='wall';placed++}}
 if(!['turrets','gloom'].includes(hazard))for(let n=0;n<9;n++){const x=pick(WIDTH),y=1+pick(8),k=cell(x,y);if(x!==2&&tiles[k]==='road')tiles[k]=hazard}
 const track={index,density,edge,hazard,tiles,blasts:[]};if(!hasRoute(track))throw Error('Generator failed route validation');return track;
}
// A speed-1 north-facing racer can traverse either protected straight lane.
export function hasRoute(t){return [2,5].some(x=>Array.from({length:HEIGHT},(_,y)=>t.tiles[cell(x,y)]).every(v=>v==='road'))}
export function createRace(seed='BADZONE',type='runner',mode='free',upgrade=null){
 if(!validSeed(seed)||!Object.hasOwn(RACERS,type)||!['free','daily'].includes(mode)||upgrade!==null&&!Object.hasOwn(UPGRADES,upgrade))throw Error('Invalid race setup');
 if(mode==='daily'){type='runner';upgrade=null}
 const random=rng(`${seed}:opponents`),types=Object.keys(RACERS),names=['Rust Jack','Sump Static','Bolt Widow'];
 const vehicles=[type,...names.map(()=>types[Math.floor(random()*types.length)])].map((key,i)=>{
 const spec=RACERS[key],u=i===0?upgrade:null;
 return {...spec,id:i,type:key,name:i===0?'You':names[i-1],maxHull:spec.hull+(u==='plating'?2:0),hull:spec.hull+(u==='plating'?2:0),maxSpeed:clamp(spec.maxSpeed+(u==='engine'?1:0)-(u==='plating'?1:0),2,4),x:[2,5,1,6][i],y:11,facing:0,speed:1,upgrade:u,gyroUsed:false,fire:0,exited:false,wrecked:false,activations:0,personality:['balanced','aggressive','cautious','speed demon'][i]};
 });
 return {version:VERSION,seed,mode,section:0,round:1,sectionRound:1,turn:0,rng:hashSeed(`${seed}:dice`),status:'racing',vehicles,track:generateTrack(seed,0),exits:[],history:[],stats:{activations:0,kills:0,collisions:0,hazards:0,risky:0},events:[],eventSequence:0,actions:[],result:null};
}
function event(s,type,text,data={}){s.events.push({id:++s.eventSequence,round:s.round,section:s.section+1,type,text,...data});s.events=s.events.slice(-80)}
function roll(s){s.rng=(Math.imul(1664525,s.rng)+1013904223)>>>0;return 1+Math.floor(s.rng/4294967296*6)}
function active(v){return v&&!v.wrecked&&!v.exited}
export function actor(s){return s.status==='racing'?s.vehicles[s.turn]:null}
export function movement(s,id,a){
 const v=s.vehicles[id],speed=clamp(v.speed+a.throttle,1,v.maxSpeed),facing=clamp(v.facing+a.steer,-1,1);
 let x=v.x,y=v.y;const path=[];
 if(a.tactic==='drift'){x+=a.steer;path.push({x,y})}
 for(let n=0;n<speed;n++){x+=facing;y--;path.push({x,y});if(y<0||x<0||x>=WIDTH)break}
 return {speed,facing,path};
}
export function handling(s,v,a,m){
 const reasons=[];
 if(a.steer!==0)reasons.push({label:'Steering',value:0});
 if(m.speed>=3&&a.steer!==0)reasons.push({label:'Fast turn',value:1});
 if(m.speed===4)reasons.push({label:'Redline speed',value:1});
 if(a.tactic==='drift')reasons.push({label:'Drifting',value:1});
 if(v.hull<=2)reasons.push({label:'Critical Hull',value:1});
 if(v.upgrade==='engine'&&m.speed===v.maxSpeed)reasons.push({label:'Overcharged engine',value:1});
 if(m.path.some(p=>p.y>=0&&p.x>=0&&p.x<WIDTH&&s.track.tiles[cell(p.x,p.y)]==='gunk'))reasons.push({label:'Gunk slick',value:1});
 return {target:reasons.length?clamp(v.handling+reasons.reduce((n,r)=>n+r.value,0),2,6):0,base:v.handling,reasons};
}
export function ramPreview(v,t,speed,facing){
 const angle=t.facing===facing?'Rear':Math.abs(t.facing-facing)===2?'Crossing':'Oblique';
 const damage=clamp(1+Math.floor((speed-t.speed+v.mass)/2)+(v.type==='bruiser'?1:0)+(v.upgrade==='ram'?1:0)+(angle==='Oblique'?1:0),1,5);
 return {damage,self:Math.max(0,t.mass-v.mass)+(angle==='Crossing'?1:0),angle,push:{x:facing,y:-1}};
}
function destination(s,v,m){let last={x:v.x,y:v.y},hit=null;
 for(const p of m.path){if(p.x<0||p.x>=WIDTH){hit={kind:'edge',...p};break}if(p.y<0){last=p;break}if(s.track.tiles[cell(p.x,p.y)]==='wall'){hit={kind:'terrain',...p};break}const target=s.vehicles.find(t=>t.id!==v.id&&active(t)&&t.x===p.x&&t.y===p.y);if(target){hit={kind:'vehicle',target:target.id,...p};break}last=p}
 return {last,hit};
}
export function shotInfo(s,v,t){
 if(!active(v)||!active(t)||v.id===t.id)return null;
 const dx=t.x-v.x,dy=t.y-v.y,range=Math.max(Math.abs(dx),Math.abs(dy)),maxRange=s.track.hazard==='gloom'?2:v.upgrade==='barrel'?3:5;
 const dot=dx*v.facing-dy, cross=Math.abs(dx+dy*v.facing);
 if(range<1||range>maxRange||dot<0||cross>dot+1)return null;
 // Intervening terrain provides cover rather than blocking an entire firing lane.
 let cover=false;for(let n=1;n<range;n++){const x=Math.round(v.x+dx*n/range),y=Math.round(v.y+dy*n/range);if(s.track.tiles[cell(x,y)]==='wall')cover=true}
 return {range,cover,target:4+(cover?1:0),damage:v.firepower+(v.upgrade==='barrel'&&range<=2?1:0)};
}
function reachablePath(s,v,m){const hit=destination(s,v,m).hit;if(!hit)return m.path;return m.path.slice(0,m.path.findIndex(p=>p.x===hit.x&&p.y===hit.y)+1)}
export function preview(s,id,a){const v=s.vehicles[id],m=movement(s,id,a);m.path=reachablePath(s,v,m);const d=destination(s,v,m),h=handling(s,v,a,m),ghost={...v,...d.last,exited:d.last.y<0,facing:m.facing,speed:m.speed};
 return {...m,...d,handling:h,ram:d.hit?.kind==='vehicle'?ramPreview(v,s.vehicles[d.hit.target],m.speed,m.facing):null,hazards:m.path.filter(p=>p.x>=0&&p.x<WIDTH&&p.y>=0&&s.track.tiles[cell(p.x,p.y)]!=='road').map(p=>s.track.tiles[cell(p.x,p.y)]),targets:s.vehicles.filter(t=>shotInfo(s,ghost,t)).map(t=>({id:t.id,...shotInfo(s,ghost,t)}))};
}
export function getLegalActions(s,id=s.turn){
 const v=s.vehicles[id];if(s.status!=='racing'||s.turn!==id||!active(v))return [];
 const actions=[];
 for(const throttle of [-1,0,1])for(const steer of [-1,0,1]){
 if(v.speed+throttle<1||v.speed+throttle>v.maxSpeed||v.facing+steer< -1||v.facing+steer>1||throttle===1&&v.upgrade==='ram'&&v.activations%2===1)continue;
 const base={throttle,steer,tactic:'drive'};actions.push(base);
 if(steer!==0)actions.push({...base,tactic:'drift'});
 if(throttle<=0)actions.push({...base,tactic:'recover'});
 const p=preview(s,id,base);
 if(p.hit?.kind==='vehicle')actions.push({...base,tactic:'ram'});
 for(const target of p.targets)actions.push({...base,tactic:'shoot',target:target.id});
 }return actions;
}
const key=a=>`${a.throttle},${a.steer},${a.tactic},${a.target??''}`;
function damage(s,v,amount,source,cause){if(v.wrecked)return;amount=Math.max(0,amount);v.hull=Math.max(0,v.hull-amount);if(amount)event(s,'damage',`${v.name}: −${amount} Hull (${cause}).`,{vehicle:v.id,amount,source});if(v.hull===0){v.wrecked=true;v.speed=0;v.fire=0;event(s,'wreck',`${v.name} wrecked.`,{vehicle:v.id});if(source===0&&v.id!==0)s.stats.kills++}}
function boundary(s,v,x,y){
 const edge=s.track.edge;event(s,'edge',`${v.name} hit ${edge.toLowerCase()}.`,{vehicle:v.id});if(v.id===0)s.stats.collisions++;
 if(edge==='Drop')damage(s,v,3,null,'drop');else if(edge==='Barrier')damage(s,v,1,null,'barrier');else{v.y=Math.min(11,v.y+2);event(s,'setback',`${v.name} loses 2 rows on the open shoulder.`)}
 v.x=clamp(x,0,7);v.facing=0;if(!v.wrecked)v.speed=1;
 // Keep authoritative occupancy unique after a boundary displacement.
 const occupied=s.vehicles.some(t=>t.id!==v.id&&active(t)&&t.x===v.x&&t.y===v.y);
 if(occupied){const open=Array.from({length:8},(_,i)=>i).find(i=>!s.vehicles.some(t=>t.id!==v.id&&active(t)&&t.x===i&&t.y===v.y)&&s.track.tiles[cell(i,v.y)]!=='wall');if(open!==undefined)v.x=open;else damage(s,v,v.hull,null,'blocked shoulder')}
}
function step(s,v,p,tactic){
 if(v.wrecked||v.exited)return false;
 if(p.x<0||p.x>=8){boundary(s,v,p.x,p.y);return false}
 if(p.y<0){v.y=-1;v.exited=true;s.exits.push({id:v.id,round:s.round,order:s.exits.length,margin:v.speed});event(s,'finish',`${v.name} clears section ${s.section+1} in position ${s.exits.length}.`);return false}
 const tile=s.track.tiles[cell(p.x,p.y)];
 if(tile==='wall'){
 if(v.id===0)s.stats.collisions++;damage(s,v,1+Math.floor(v.speed/3),null,'terrain collision');if(!v.wrecked)v.speed=1;event(s,'collision',`${v.name} collides with terrain.`);
 if(s.track.hazard==='debris'){s.track.blasts.push({x:p.x,y:p.y,expires:s.round+1});event(s,'blast','Impact destabilizes the ceiling: a blast zone remains through the next round.');for(const t of s.vehicles.filter(active))if(Math.max(Math.abs(t.x-p.x),Math.abs(t.y-p.y))<=1)damage(s,t,1,null,'falling debris')}
 return false;
 }
 const other=s.vehicles.find(t=>t.id!==v.id&&active(t)&&t.x===p.x&&t.y===p.y);
 if(other){
 if(v.id===0)s.stats.collisions++;
 const r=ramPreview(v,other,v.speed,v.facing),ram=tactic==='ram';event(s,'collision',`${v.name} ${ram?'rams':'collides with'} ${other.name}: ${r.angle.toLowerCase()} impact.`,{vehicle:v.id,target:other.id});
 damage(s,other,ram?r.damage:1,v.id,ram?'ram':'collision');damage(s,v,ram?r.self:1,other.id,'impact');
 if(ram&&!other.wrecked){const q={x:other.x+r.push.x,y:other.y-1};if(q.x<0||q.x>=8)boundary(s,other,q.x,q.y);else if(q.y<0){other.y=-1;other.exited=true;s.exits.push({id:other.id,round:s.round,order:s.exits.length,margin:0});event(s,'finish',`${other.name} pushed across the finish.`)}else if(s.track.tiles[cell(q.x,q.y)]!=='wall'&&!s.vehicles.some(t=>t.id!==other.id&&active(t)&&t.x===q.x&&t.y===q.y)){other.x=q.x;other.y=q.y;enterHazard(s,other,q)}else damage(s,other,1,v.id,'blocked push')}
 if(!v.wrecked&&(other.wrecked||other.exited||other.x!==p.x||other.y!==p.y)){v.x=p.x;v.y=p.y;enterHazard(s,v,p)}
 if(!v.wrecked)v.speed=1;return false;
 }
 v.x=p.x;v.y=p.y;enterHazard(s,v,p);return !v.wrecked;
}
function enterHazard(s,v,p){const tile=s.track.tiles[cell(p.x,p.y)];if(['road','wall'].includes(tile))return;
 event(s,'hazard',`${v.name} enters ${HAZARD_LABELS[tile]||tile}.`,{vehicle:v.id});
 if(tile==='mines'){s.track.tiles[cell(p.x,p.y)]='road';damage(s,v,2,null,'mine')}
 if(tile==='inferno'){const die=roll(s);event(s,'roll',`Inferno: ${die}; ignites on 4+.`,{die,target:4});if(die>=4)v.fire=2}
 if(tile==='debris'){s.track.tiles[cell(p.x,p.y)]='road';s.track.blasts.push({x:p.x,y:p.y,expires:s.round+1});damage(s,v,1,null,'debris')}
 if(v.id===0&&!v.wrecked)s.stats.hazards++;
}
function finish(s,reason){s.status='done';const v=s.vehicles[0];const ordered=[...s.exits.map(x=>x.id),...s.vehicles.filter(t=>!t.exited).sort((a,b)=>Number(a.wrecked)-Number(b.wrecked)||a.y-b.y||a.id-b.id).map(t=>t.id)];const position=ordered.indexOf(0)+1,completed=v.exited&&s.section===2&&!v.wrecked;
 const parts={finish:completed?3000:0,position:completed?(5-position)*750:0,efficiency:completed?Math.max(0,2000-s.stats.activations*60):0,hull:v.hull*100,rivals:s.stats.kills*400,risk:s.stats.risky*50,collisions:-s.stats.collisions*100};const score=Math.max(0,Object.values(parts).reduce((a,b)=>a+b,0));
 s.result={reason,completed,position,score,parts,hull:v.hull,maxHull:v.maxHull,...s.stats,reward:s.mode==='free'?Math.max(30,Math.floor(score/40)):0,share:`BADZONE ${s.seed} | v${VERSION} | ${completed?'P'+position:'WRECK / DNF'} | ${score} pts | ${s.stats.activations} acts | Hull ${v.hull}/${v.maxHull}`};event(s,'result',`${completed?'Race complete':'Run ended'}: ${score} points.`);
}
function endRound(s){
 if(s.mode==='versus'){
  const humans=[s.vehicles[0],s.vehicles[2]];
  if(humans.some(v=>v.wrecked)||s.section===2&&(humans.some(v=>v.exited)||s.sectionRound>=18)){finishVersus(s);return}
 }else if(s.vehicles[0].wrecked){finish(s,'Player wrecked');return}
 const alive=s.vehicles.filter(v=>!v.wrecked),threshold=Math.ceil(alive.length/2);
 if(s.section===2&&s.vehicles[0].exited){finish(s,'Finish line reached');return}
 if(s.sectionRound>=18&&s.section===2){finish(s,'Race time limit');return}
 if(s.section<2&&(s.exits.length>=threshold||s.sectionRound>=18)){
 const ranking=[...s.exits.map(e=>e.id),...s.vehicles.filter(v=>!v.wrecked&&!v.exited).sort((a,b)=>a.y-b.y||a.id-b.id).map(v=>v.id)];
 s.history.push({section:s.section+1,exits:structuredClone(s.exits),ranking});s.section++;s.track=generateTrack(s.seed,s.section);s.sectionRound=0;
 ranking.forEach((id,i)=>{const v=s.vehicles[id],exit=s.exits.find(e=>e.id===id),advantage=exit?Math.min(2,1+s.round-exit.round):0;v.x=[2,5,1,6][i];v.y=11-advantage;v.facing=0;v.exited=false;v.gyroUsed=false;v.fire=0;event(s,'placement',`${v.name}: ${exit?'Leader':'Straggler'}, starts ${advantage} row${advantage===1?'':'s'} ahead.`,{vehicle:id,advantage})});
 s.exits=[];event(s,'section',`Section ${s.section+1}: ${s.track.density}, ${s.track.edge}, ${HAZARD_LABELS[s.track.hazard]}.`);
 }
 s.round++;s.sectionRound++;s.track.blasts=s.track.blasts.filter(b=>b.expires>=s.round);
}
function nextTurn(s){for(let n=0;n<100;n++){s.turn++;if(s.turn>=4){s.turn=0;endRound(s)}if(s.status==='done'||active(s.vehicles[s.turn]))return}finish(s,'Turn limit safeguard')}
export function resolveAction(state,action){
 const legal=getLegalActions(state);if(!action||!Number.isInteger(action.throttle)||!Number.isInteger(action.steer)||typeof action.tactic!=='string'||(action.target!==undefined&&!Number.isInteger(action.target))||!legal.some(a=>key(a)===key(action))||Object.keys(action).some(k=>!['throttle','steer','tactic','target'].includes(k)))throw Error('Illegal action');
 const s=structuredClone(state);s.actions.push({...action});const v=s.vehicles[s.turn],m=movement(s,v.id,action);v.activations++;if(v.id===0)s.stats.activations++;v.speed=m.speed;v.facing=m.facing;
 event(s,'action',`${v.name}: ${action.tactic}, speed ${v.speed}, facing ${['NW','N','NE'][v.facing+1]}.`,{vehicle:v.id,action});
 if(action.tactic==='recover'){v.fire=0;event(s,'recover',`${v.name} extinguishes fire and steadies steering; movement remains compulsory.`)}
 const h=handling(s,v,action,{...m,path:reachablePath(s,v,m)});let path=m.path;
 if(h.target){const target=action.tactic==='recover'?Math.max(2,h.target-1):h.target;let die=roll(s);event(s,'handling',`${v.name} handling: base ${h.base}+; ${h.reasons.map(r=>r.label+' +'+r.value).join(', ')}${action.tactic==='recover'?'; Recover −1':''}. Target ${target}+, rolled ${die}.`,{vehicle:v.id,target,die,reasons:h.reasons});
 if(die<target&&v.upgrade==='gyro'&&!v.gyroUsed){v.gyroUsed=true;die=roll(s);event(s,'reroll',`Gyro reroll: ${die} against ${target}+.`)}
 if(die<target){const failure=roll(s);if(failure<=2){const dx=failure===1?-1:1;event(s,'skid',`${v.name} skids ${dx<0?'west':'east'} before moving.`);step(s,v,{x:v.x+dx,y:v.y},'drive');path=movement(s,v.id,{...action,throttle:0,steer:0,tactic:'drive'}).path}
 else if(failure<=4){v.facing=failure===3?-1:1;event(s,'spin',`${v.name} spins toward ${v.facing<0?'NW':'NE'}.`);path=movement(s,v.id,{...action,throttle:0,steer:0,tactic:'drive'}).path}
 else if(failure===5){event(s,'control',`${v.name} loses control: surges 1 extra cell.`);const last=path.at(-1);path=[...path,{x:last.x+v.facing,y:last.y-1}]}
 else{damage(s,v,1,null,'handling crash');if(!v.wrecked)v.speed=1;event(s,'crash',`${v.name} crashes: 1 Hull lost, crawl speed.`);path=[{x:v.x+v.facing,y:v.y-1}]}
 }else if(v.id===0)s.stats.risky++;
 }
 for(const p of path)if(!step(s,v,p,action.tactic))break;
 if(active(v)&&action.tactic==='shoot'){const t=s.vehicles[action.target],info=shotInfo(s,v,t);if(info){const die=roll(s);event(s,'shot',`${v.name} fires at ${t.name}: range ${info.range}, ${info.cover?'cover +1, ':''}${info.target}+, rolled ${die}.`,{vehicle:v.id,target:t.id,die});if(die>=info.target)damage(s,t,info.damage,v.id,'gunfire')}else event(s,'shot','Shot lost: handling or collision changed the firing solution.')}
 if(active(v)&&s.track.hazard==='turrets'&&(v.x<=1||v.x>=6)){const die=roll(s);event(s,'hazard',`Turret targets ${v.name}: 4+, rolled ${die}.`);if(die>=4)damage(s,v,1,null,'turret');if(v.id===0&&!v.wrecked)s.stats.hazards++}
 if(active(v)&&s.track.blasts.some(b=>Math.max(Math.abs(v.x-b.x),Math.abs(v.y-b.y))<=1))damage(s,v,1,null,'lingering blast zone');
 if(active(v)&&v.fire){damage(s,v,1,null,'fire');v.fire--}
 if(s.mode==='versus'&&[0,2].some(id=>s.vehicles[id].wrecked))finishVersus(s);else if(s.mode!=='versus'&&s.vehicles[0].wrecked)finish(s,'Player wrecked');else nextTurn(s);return s;
}
export function chooseAIAction(s,id=s.turn){
 const actions=getLegalActions(s,id),v=s.vehicles[id];if(!actions.length)return null;
 const random=rng(`${s.seed}:ai:${s.round}:${s.section}:${id}`);
 return actions.map(a=>{const p=preview(s,id,a),progress=v.y-p.last.y,aggressive=v.personality==='aggressive';
 let value=progress*6+(p.last.y<0?25:0)-Math.abs(p.last.x-3.5)*0.3-p.handling.target*(v.hull<4?1.8:0.65)-p.hazards.filter(h=>h!=='wall'&&h!=='gunk').length*5;
 if(p.hit)value-=p.hit.kind==='edge'?30:p.hit.kind==='terrain'?22:14;
 if(a.tactic==='ram'&&p.ram)value+=p.ram.damage*(aggressive?5:3)-p.ram.self*5;
 if(a.tactic==='shoot')value+=2+(s.vehicles[a.target].hull<=2?3:0);
 if(a.tactic==='recover')value+=v.fire?18:0;
 if(a.tactic==='drift')value-=1;
 if(s.track.hazard==='turrets'&&(p.last.x<=1||p.last.x>=6))value-=8;
 if(v.personality==='cautious')value-=p.hazards.length*3;
 if(v.personality==='speed demon')value+=progress;
 return {a,value:value+random()*0.15};}).sort((a,b)=>b.value-a.value)[0].a;
}
export function advanceAI(state){let s=state;for(let n=0;n<200&&s.status==='racing'&&s.turn!==0;n++)s=resolveAction(s,chooseAIAction(s));if(s.status==='racing'&&s.turn!==0)throw Error('AI turn safeguard');return s}

// Versus adds only symmetric human ownership and victory. Solo remains unchanged.
export function createVersusRace(seed,p1,p2){
 const s=createRace(seed,p1);s.mode='versus';
 for(const [id,type] of [[0,p1],[2,p2]]){
  if(!Object.hasOwn(RACERS,type))throw Error('Invalid chassis');
  Object.assign(s.vehicles[id],RACERS[type],{type,name:`P${id===0?1:2} / ${RACERS[type].name}`,maxHull:RACERS[type].hull,upgrade:null});
 }
 return s;
}
function finishVersus(s){
 s.status='done';const a=s.vehicles[0],b=s.vehicles[2];
 const order=[...s.exits.map(e=>e.id),...s.vehicles.filter(v=>!v.exited).sort((a,b)=>Number(a.wrecked)-Number(b.wrecked)||a.y-b.y||a.id-b.id).map(v=>v.id)];
 const winner=a.wrecked&&b.wrecked?null:a.wrecked?2:b.wrecked?0:order.indexOf(0)<order.indexOf(2)?0:2;
 s.result={winner,order,reason:a.wrecked||b.wrecked?'Human racer wrecked':s.sectionRound>=18?'Race time limit':'Final section finish'};
 event(s,'result',winner===null?'Both drivers wrecked: draw.':`P${winner===0?1:2} wins. ${s.result.reason}.`);
}
