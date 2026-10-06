import {VERSION,RACERS,UPGRADES,createRace,resolveAction,validSeed} from './engine.js';
export const SAVE_VERSION=1,STORAGE_KEY='necronw.badzone.v1';
export const emptyProfile=()=>({credits:0,unlocked:Object.keys(RACERS),owned:{},equipped:{},best:0,history:[],daily:{},settings:{reducedMotion:false}});
const integer=(v,min=0,max=10000000)=>Number.isInteger(v)&&v>=min&&v<=max;
export function cleanProfile(p){
 const out=emptyProfile();if(!p||typeof p!=='object')return out;
 if(integer(p.credits))out.credits=p.credits;if(integer(p.best))out.best=p.best;
 for(const type of Object.keys(RACERS)){
 out.owned[type]=Array.isArray(p.owned?.[type])?[...new Set(p.owned[type].filter(u=>Object.hasOwn(UPGRADES,u)))]:[];
 out.equipped[type]=out.owned[type].includes(p.equipped?.[type])?p.equipped[type]:null;
 }
 out.history=Array.isArray(p.history)?p.history.filter(h=>h&&validSeed(h.seed)&&integer(h.score)&&typeof h.completed==='boolean').slice(0,20).map(h=>({seed:h.seed,score:h.score,completed:h.completed})):[];
 if(p.daily&&typeof p.daily==='object')for(const [seed,value] of Object.entries(p.daily).slice(-60))if(/^BADZONE-\d{4}-\d{2}-\d{2}$/.test(seed)&&integer(value))out.daily[seed]=value;
 out.settings.reducedMotion=p.settings?.reducedMotion===true;return out;
}
export function replayRun(run){
 if(!run||run.version!==VERSION||!validSeed(run.seed)||!Object.hasOwn(RACERS,run.type)||!['free','daily'].includes(run.mode)||run.upgrade!==null&&!Object.hasOwn(UPGRADES,run.upgrade)||typeof run.id!=='string'||run.id.length>100||!Array.isArray(run.actions)||run.actions.length>300)throw Error('Unsupported or damaged race');
 let state=createRace(run.seed,run.type,run.mode,run.upgrade);for(const action of run.actions)state=resolveAction(state,action);
 return state;
}
export function load(storage){
 const fallback={profile:emptyProfile(),run:null,state:null,warning:''};
 try{const raw=storage.getItem(STORAGE_KEY);if(!raw)return fallback;if(raw.length>200000)throw Error('Oversized save');const data=JSON.parse(raw);
 if(data?.saveVersion!==SAVE_VERSION)return {...fallback,warning:'An older save could not be loaded. The garage is ready for a new run.'};
 const profile=cleanProfile(data.profile);if(!data.run)return {...fallback,profile};
 try{return {profile,run:{...data.run,rewarded:data.run.rewarded===true},state:replayRun(data.run),warning:''}}
 catch{return {...fallback,profile,warning:'The interrupted race could not be recovered. Garage progression was retained.'}}
 }catch{return {...fallback,warning:'Saved data is unavailable or damaged. You can still play this session.'}}
}
export function save(storage,profile,run,state){
 try{const value={saveVersion:SAVE_VERSION,profile,run:run?{...run,actions:state.actions}:null};storage.setItem(STORAGE_KEY,JSON.stringify(value));return ''}
 catch{return 'Storage is unavailable. Progress lasts only until this page closes.'}
}
export function purchase(profile,type,upgrade){
 if(!Object.hasOwn(RACERS,type)||!Object.hasOwn(UPGRADES,upgrade))throw Error('Unknown upgrade');const p=cleanProfile(profile),owned=p.owned[type];
 if(!owned.includes(upgrade)){if(p.credits<UPGRADES[upgrade].cost)throw Error('Not enough scrap');p.credits-=UPGRADES[upgrade].cost;owned.push(upgrade)}
 p.equipped[type]=upgrade;return p;
}
export function award(profile,run,state){
 if(state.status!=='done'||run.rewarded)return {profile,run};const p=cleanProfile(profile),r=state.result;
 p.credits+=r.reward;p.best=Math.max(p.best,r.score);p.history.unshift({seed:state.seed,score:r.score,completed:r.completed});p.history=p.history.slice(0,20);
 if(state.mode==='daily')p.daily[state.seed]=Math.max(p.daily[state.seed]||0,r.score);
 return {profile:p,run:{...run,rewarded:true}};
}
