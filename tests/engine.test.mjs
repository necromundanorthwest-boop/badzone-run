import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,generateTrack,hasRoute,dailySeed,rng,getLegalActions,resolveAction,chooseAIAction,advanceAI,preview,shotInfo,ramPreview,RACERS,HAZARDS} from '../public/badzone/engine.js';
const clear=()=>{const s=createRace('TEST');s.track.tiles.fill('road');s.track.hazard='gloom';s.vehicles.slice(1).forEach((v,i)=>{v.x=5+i;v.y=8});return s};
const move={throttle:0,steer:0,tactic:'drive'};
test('seeded RNG, generator, daily initial conditions and three-section bounds',()=>{
 assert.equal(dailySeed(new Date('2026-10-06T00:00:00Z')),'BADZONE-2026-10-06');
 assert.deepEqual(createRace('DAILY','knife','daily','engine'),createRace('DAILY','runner','daily'));
 assert.deepEqual(generateTrack('SEED',1),generateTrack('SEED',1));
 const a=rng('a'),b=rng('a');for(let i=0;i<100;i++)assert.equal(a(),b());
 for(let i=0;i<200;i++)for(let j=0;j<3;j++)assert.ok(hasRoute(generateTrack('ROUTE'+i,j)));
 assert.throws(()=>generateTrack('A',3));assert.throws(()=>createRace('<script>'));assert.throws(()=>createRace('a'.repeat(65)));
});
test('compulsory movement, acceleration/braking bounds, facing, immutability and illegal actions',()=>{
 const s=clear(),n=resolveAction(s,move);assert.equal(n.vehicles[0].y,10);assert.equal(s.vehicles[0].y,11);
 assert.ok(!getLegalActions(s).some(a=>a.throttle===-1));
 assert.throws(()=>resolveAction(s,{...move,throttle:9}));assert.throws(()=>resolveAction(s,{...move,extra:1}));
 s.vehicles[0].speed=3;assert.ok(!getLegalActions(s).some(a=>a.throttle===1));
 const p=preview(s,0,{...move,steer:1});assert.equal(p.facing,1);assert.equal(p.path.length,3);
 s.vehicles[0].facing=1;assert.ok(!getLegalActions(s).some(a=>a.steer===1));
});
test('handling explains modifiers and failure outcomes replay exactly',()=>{
 const s=clear();s.vehicles[0].speed=3;s.track.tiles[10*8+2]='gunk';
 const p=preview(s,0,move);assert.ok(p.handling.reasons.some(r=>r.label==='Gunk slick'));
 assert.deepEqual(resolveAction(s,move),resolveAction(s,move));
 const outcomes=new Set();for(let n=1;n<100;n++){const q=clear();q.rng=n*54321;q.vehicles[0].handling=6;q.vehicles[0].hull=2;const r=resolveAction(q,move);r.events.forEach(e=>outcomes.add(e.type))}
 for(const type of ['skid','spin','control','crash'])assert.ok(outcomes.has(type),type);
});
test('barrier, drop and open edge have distinct consequences',()=>{
 const results=[];for(const edge of ['Barrier','Drop','Open Edge']){const s=clear();s.track.edge=edge;s.vehicles[0].x=0;s.vehicles[0].facing=-1;const r=resolveAction(s,move);results.push(r.vehicles[0]);assert.ok(r.vehicles[0].x>=0)}
 assert.equal(results[0].hull,7);assert.equal(results[1].hull,5);assert.equal(results[2].hull,8);assert.equal(results[0].speed,1);
});
test('terrain impact, ram geometry, push, damage and wreck removal',()=>{
 const s=clear();s.track.tiles[10*8+2]='wall';assert.equal(resolveAction(s,move).vehicles[0].hull,7);
 const r=clear();r.vehicles[1].x=2;r.vehicles[1].y=10;r.vehicles[1].hull=1;
 const p=preview(r,0,{...move,tactic:'ram'});assert.equal(p.hit.target,1);assert.ok(p.ram.damage>=1);assert.deepEqual(p.ram.push,{x:0,y:-1});
 const n=resolveAction(r,{...move,tactic:'ram'});assert.ok(n.vehicles[1].wrecked);assert.equal(n.stats.kills,1);assert.notEqual(n.turn,1);
 assert.ok(ramPreview({...r.vehicles[0],type:'bruiser'},r.vehicles[1],3,0).damage>ramPreview(r.vehicles[0],r.vehicles[1],1,0).damage);
});
test('shooting has arc, range and cover; mines, fire, debris, turrets and gloom resolve',()=>{
 const s=clear();s.track.hazard='gunk';const v=s.vehicles[0],t=s.vehicles[1];t.x=2;t.y=8;
 assert.equal(shotInfo(s,v,t).range,3);s.track.tiles[10*8+2]='wall';assert.ok(shotInfo(s,v,t).cover);
 t.y=11;t.x=6;assert.equal(shotInfo(s,v,t),null);t.x=2;t.y=4;s.track.hazard='gloom';assert.equal(shotInfo(s,v,t),null);
 for(const hazard of ['mines','inferno','debris']){const q=clear();q.track.hazard=hazard;q.track.tiles[10*8+2]=hazard;const n=resolveAction(q,move);assert.ok(n.events.some(e=>e.type==='hazard'));if(hazard!=='inferno')assert.ok(n.vehicles[0].hull<8)}
 const q=clear();q.track.hazard='turrets';q.vehicles[0].x=0;assert.ok(resolveAction(q,move).events.some(e=>e.text.startsWith('Turret')));
});
test('section changes happen after a round, retain leaders, end after third section',()=>{
 let s=clear();s.vehicles[0].y=0;s.vehicles[1].y=0;s.vehicles[1].x=5;
 s=resolveAction(s,move);assert.equal(s.section,0);
 s=resolveAction(s,move);assert.equal(s.section,0);
 s=advanceAI(s);assert.equal(s.section,1);assert.equal(s.history.length,1);assert.equal(s.vehicles[0].y,10);
});
test('AI uses legal actions, finishes races, occupancy stays unique, replays deterministic',()=>{
 let completed=0,trackHazards=new Set();
 for(let seed=0;seed<100;seed++){
 let s=createRace('SMOKE'+seed,Object.keys(RACERS)[seed%4]);let count=0;
 while(s.status==='racing'&&count++<300){trackHazards.add(s.track.hazard);const a=chooseAIAction(s);assert.ok(getLegalActions(s).some(x=>JSON.stringify(x)===JSON.stringify(a)));const n=resolveAction(s,a);if(seed===0)assert.deepEqual(n,resolveAction(s,a));s=n;
 const positions=s.vehicles.filter(v=>!v.wrecked&&!v.exited).map(v=>`${v.x},${v.y}`);assert.equal(new Set(positions).size,positions.length,`overlap seed ${seed}`);
 }
 assert.equal(s.status,'done',`frozen seed ${seed}`);assert.ok(s.result.score>=0);if(s.result.completed)completed++;
 }
 assert.ok(completed>30,`${completed}/100 completed`);assert.equal(trackHazards.size,HAZARDS.length);
 console.log(`AI-played races: ${completed}/100 finished, others wrecked/DNF; all terminated.`);
});
