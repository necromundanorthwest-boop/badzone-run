import {randomBytes,randomInt} from 'node:crypto';
import {createVersusRace,resolveAction,chooseAIAction,RACERS} from '../public/badzone/engine.js';
export const PROTOCOL=1;
export class GameError extends Error{constructor(status,message){super(message);this.status=status}}
const fail=(status,message)=>{throw new GameError(status,message)};
const chassis=t=>{if(typeof t!=='string'||!Object.hasOwn(RACERS,t))fail(400,'Choose a valid chassis.');return t};
export class Rooms{
 constructor({now=Date.now}={}){this.rooms=new Map();this.now=now;}
 sweep(){for(const [code,r] of this.rooms)if(this.now()-r.updated>24*60*60*1000)this.rooms.delete(code)}
 seat(type){return {token:randomBytes(24).toString('hex'),type:chassis(type),ready:false,seen:this.now()}}
 create(type){this.sweep();if(this.rooms.size>=500)fail(503,'The grid is full. Try again later.');let code;do{code=Array.from({length:6},()=> 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[randomInt(32)]).join('')}while(this.rooms.has(code));const r={code,revision:0,phase:'lobby',players:[this.seat(type),null],state:null,receipts:new Map(),updated:this.now(),rematch:[false,false]};this.rooms.set(code,r);return {...this.snapshot(r,0),token:r.players[0].token};}
 find(code){const r=this.rooms.get(code);if(!r||this.now()-r.updated>86400000)fail(404,'Room expired or server restarted. Create a new room.');return r}
 auth(code,token){const r=this.find(code),seat=r.players.findIndex(p=>p&&p.token===token);if(seat<0)fail(401,'Room access expired. Rejoin with a room code.');r.players[seat].seen=this.now();r.updated=this.now();return {r,seat}}
 join(code,type){const r=this.find(code);if(r.players[1]||r.phase!=='lobby')fail(409,'This room is full or already racing.');r.players[1]=this.seat(type);r.revision++;r.updated=this.now();return {...this.snapshot(r,1),token:r.players[1].token}}
 snapshot(r,seat){const state=r.state?structuredClone(r.state):null;if(state){delete state.rng;delete state.actions;delete state.stats;}return {protocol:PROTOCOL,code:r.code,revision:r.revision,phase:r.phase,localId:seat===0?0:2,players:r.players.map(p=>p?{type:p.type,ready:p.ready,connected:this.now()-p.seen<15000}:null),state,rematch:r.rematch};}
 get(code,token){const {r,seat}=this.auth(code,token);return this.snapshot(r,seat)}
 command(code,token,body){const {r,seat}=this.auth(code,token);
  if(!body||body.protocol!==PROTOCOL)fail(409,'Game updated. Reload this page.');
  if(typeof body.requestId!=='string'||!/^[a-zA-Z0-9-]{8,80}$/.test(body.requestId))fail(400,'Invalid request ID.');
  const receipt=seat+':'+body.requestId,encoded=JSON.stringify(body),old=r.receipts.get(receipt);
  if(old){if(old!==encoded)fail(409,'Request ID already used.');return this.snapshot(r,seat)}
  if(body.revision!==r.revision)fail(409,'The race changed. Review the latest state and try again.');
  if(Object.keys(body).some(k=>!['protocol','requestId','revision','kind','type','action'].includes(k)))fail(400,'Invalid command fields.');
  if(body.kind==='chassis'){if(r.phase!=='lobby')fail(409,'The race has started.');r.players[seat].type=chassis(body.type);r.players[seat].ready=false;}
  else if(body.kind==='ready'){if(r.phase!=='lobby')fail(409,'The race has started.');r.players[seat].ready=true;if(r.players.every(p=>p?.ready)){r.state=createVersusRace(randomBytes(8).toString('hex'),r.players[0].type,r.players[1].type);r.state.rng=randomInt(1,4294967295);r.phase='race';}}
  else if(body.kind==='action'){
   if(r.phase!=='race'||r.state.turn!==(seat===0?0:2))fail(409,'It is not your turn.');
   try{let s=resolveAction(r.state,body.action);for(let n=0;n<200&&s.status==='racing'&&![0,2].includes(s.turn);n++)s=resolveAction(s,chooseAIAction(s));if(s.status==='racing'&&![0,2].includes(s.turn))throw Error();r.state=s;}catch{fail(400,'Illegal maneuver. Review your route and try again.');}
   if(r.state.status==='done')r.phase='result';
  }else if(body.kind==='rematch'){
   if(r.phase!=='result'||!r.players.every(Boolean))fail(409,'Both drivers must be in the room.');r.rematch[seat]=true;
   if(r.rematch.every(Boolean)){r.phase='lobby';r.state=null;r.rematch=[false,false];r.players.forEach(p=>p.ready=false);}
  }else if(body.kind==='leave'){
   if(r.phase==='race'){r.state.status='done';r.state.result={winner:seat===0?2:0,reason:'Opponent left the race',order:[]};r.phase='result';}
   r.players[seat]=null;
   if(!r.players.some(Boolean)||r.phase==='lobby'&&seat===0)this.rooms.delete(code);
  }else fail(400,'Unknown command.');
  r.revision++;r.updated=this.now();r.receipts.set(receipt,encoded);if(r.receipts.size>1000)r.receipts.delete(r.receipts.keys().next().value);
  return this.snapshot(r,seat);
 }
}
