import test from 'node:test';import assert from 'node:assert/strict';
import {createRace,resolveAction,chooseAIAction,VERSION} from '../public/badzone/engine.js';
import {load,save,purchase,award,emptyProfile,STORAGE_KEY} from '../public/badzone/persistence.js';
const memory=()=>({data:null,getItem(){return this.data},setItem(k,v){assert.equal(k,STORAGE_KEY);this.data=v}});
const run=()=>({version:VERSION,id:'TEST-RUN',seed:'SAVE',type:'runner',upgrade:null,mode:'free',rewarded:false});
test('save/reload replays exact authoritative state',()=>{const store=memory();let s=createRace('SAVE');for(let i=0;i<10;i++)s=resolveAction(s,chooseAIAction(s));assert.equal(save(store,emptyProfile(),run(),s),'');assert.deepEqual(load(store).state,s)});
test('malformed, unsupported, invalid action and blocked storage recover safely',()=>{const store=memory();assert.equal(load(store).state,null);for(const raw of ['{broken','null','{"saveVersion":90}','[]']){store.data=raw;assert.equal(load(store).state,null);assert.ok(load(store).warning)}
 save(store,emptyProfile(),run(),createRace('SAVE'));const broken=JSON.parse(store.data);broken.run.actions=[{throttle:'0',steer:0,tactic:'drive'}];store.data=JSON.stringify(broken);assert.equal(load(store).state,null);
 const blocked={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};assert.ok(load(blocked).warning);assert.ok(save(blocked,emptyProfile(),null,null));});
test('upgrades charge once, enforce cost, normalize corrupted data; rewards are idempotent',()=>{const p=emptyProfile();assert.throws(()=>purchase(p,'runner','engine'));p.credits=200;const q=purchase(p,'runner','engine');assert.equal(q.credits,100);assert.equal(purchase(q,'runner','engine').credits,100);assert.equal(p.credits,200);
 let s=createRace('SAVE');while(s.status==='racing')s=resolveAction(s,chooseAIAction(s));const first=award(q,run(),s),second=award(first.profile,first.run,s);assert.deepEqual(first,second);assert.ok(first.run.rewarded);
 const store=memory();save(store,first.profile,first.run,s);assert.deepEqual(load(store).profile,first.profile);
});
