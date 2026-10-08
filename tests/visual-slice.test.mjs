import test from 'node:test';import assert from 'node:assert/strict';
import {createSlice,SHOT} from '../public/badzone/visual/fixture.js';
import {raceBoard,vehicleArt} from '../public/badzone/visual/art.js';
import {preview,resolveAction} from '../public/badzone/engine.js';
test('visual rendering preserves scene state, exact cell coordinates and engine result',()=>{
 const state=createSlice(),copy=structuredClone(state),p=preview(state,0,SHOT);
 const html=raceBoard(state,p);
 assert.deepEqual(state,copy);assert.equal((html.match(/data-cell=/g)||[]).length,96);
 for(let y=0;y<12;y++)for(let x=0;x<8;x++)assert.ok(html.includes(`data-cell="${x},${y}" transform="translate(${x*50} ${y*50})"`));
 const after=resolveAction(state,SHOT);assert.equal(after.vehicles[2].hull,11);assert.deepEqual(after.events.filter(e=>e.type==='handling').map(e=>[e.die,e.target]),[[6,3]]);
 assert.ok(after.events.some(e=>e.type==='shot'&&e.die===6));assert.equal(state.vehicles[2].hull,12);
});
test('four original chassis have distinct silhouettes, with fixed ownership text',()=>{
 assert.equal(new Set(['runner','knife','bruiser','wagon'].map(t=>vehicleArt(t,'#fff'))).size,4);
 const s=createSlice();const html=raceBoard(s,null);
 for(const label of ['P1','P2','A1','A2'])assert.ok(html.includes('>'+label+'</text>'));
 for(const facing of [-1,0,1]){s.vehicles[0].facing=facing;assert.ok(raceBoard(s,null).includes(`rotate(${facing*45}) scale(.82)`))}
});
