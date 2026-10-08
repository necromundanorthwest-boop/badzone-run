import {createRace,RACERS} from '../engine.js';
export const SHOT={throttle:1,steer:1,tactic:'shoot',target:2};
// Local art-review fixture only. Geometry comes from the existing generator;
// all preview/action outcomes are produced by the unmodified Solo rules engine.
export function createSlice(){
 const s=createRace('FOUNDRY-10','knife');
 const types=['knife','runner','bruiser','wagon'],positions=[[1,9,0],[6,4,-1],[4,5,0],[5,10,-1]];
 s.vehicles.forEach((v,i)=>Object.assign(v,RACERS[types[i]],{type:types[i],name:RACERS[types[i]].name,maxHull:RACERS[types[i]].hull,x:positions[i][0],y:positions[i][1],facing:positions[i][2],speed:i===0?2:1}));
 return s;
}
