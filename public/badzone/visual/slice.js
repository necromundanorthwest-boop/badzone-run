import {getLegalActions,preview,resolveAction,HAZARD_LABELS} from '../engine.js';
import {createSlice,SHOT} from './fixture.js';
import {raceBoard,vehicleArt,PAINT,IDS} from './art.js';
const root=document.getElementById('game');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const directions=['NW','N','NE'];
let state=createSlice(),choice={...SHOT},sample='you',resolved=false,feedback=null,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
root.innerHTML='<div id="vs-live" class="vs-sr" role="status" aria-live="polite" aria-atomic="true"></div><div id="vs-view"></div>';
const view=root.querySelector('#vs-view'),live=root.querySelector('#vs-live');
const active=()=>sample==='you'&&!resolved;
const btn=(id,label,attrs='')=>`<button type="button" id="${id}" ${attrs}>${label}</button>`;
function summarize(){
 if(!feedback)return '<span>01 / CONTROL CHECK</span><b>Hold your line.</b><p>Queue a maneuver. The route is intended; handling can change it.</p>';
 const h=feedback.handling,shot=feedback.shot,d=feedback.damage;
 return `<span>${h?'HANDLING CHECK':'MANEUVER RESOLVED'}</span><b>${h?`D6 ${h.die} <small>/ ${h.target}+ · ${h.die>=h.target?'PASS':'FAIL'}</small>`:'MOVE COMPLETE'}</b><p>${shot?`${shot.die?'SHOT · D6 '+shot.die:'SHOT LOST'}${d?' / −'+d.amount+' HULL':' / NO DAMAGE'}`:'The radio records the resolved outcome.'}</p>`;
}
function draw(focus){
 const v=state.vehicles[0],o=state.vehicles[2],legal=getLegalActions(state,0),enabled=active();
 if(enabled&&!legal.some(a=>a.throttle===choice.throttle&&a.steer===choice.steer&&a.tactic===choice.tactic&&(a.target??null)===(choice.target??null)))choice=legal.find(a=>a.tactic==='drive'&&a.throttle===choice.throttle&&a.steer===choice.steer)||legal[0];
 const p=enabled?preview(state,0,choice):null;
 const turn=sample==='you'&&!resolved?'YOUR TURN':sample==='opponent'?'OPPONENT TURN':'AI TURN';
 const actor=sample==='you'&&!resolved?0:sample==='opponent'?2:1;
 const opts=legal.filter(a=>a.throttle===choice.throttle&&a.steer===choice.steer);
 const risk=p?.handling.target?Math.max(2,p.handling.target-(choice.tactic==='recover'?1:0)):0;
 view.innerHTML=`<div class="bz vs ${reduced?'vs-reduced':''}" data-turn="${enabled?'you':sample==='opponent'?'opponent':'ai'}">
 <header class="vs-masthead"><a href="./" class="vs-brand">BADZONE <span>RUN: VERSUS</span></a><span class="vs-edition">NWN / RACE CONTROL <b>VISUAL SLICE 01</b></span></header>
 <p class="vs-review-note">ART-DIRECTION REVIEW <span>Local scene · no online connection</span></p>
 <div class="vs-race-heading"><div><p class="bz-kicker">ILLEGAL RACING / LEGAL TURNS</p><h1>THE BADZONE<span> / 01</span></h1></div><div class="vs-section"><b>SECTION 01 <span>/ 03</span></b><small>ROUND ${String(state.round).padStart(2,'0')} · ${esc(state.seed)}</small></div></div>
 <div class="vs-layout"><section class="vs-track" aria-label="Race board"><div class="vs-track-top"><span>SECTOR 01 // SCRAP DECK</span><b>${HAZARD_LABELS[state.track.hazard].toUpperCase()}</b></div><div class="vs-board-frame">${raceBoard(state,p,{activeId:actor,event:feedback})}</div><div class="vs-legend"><span><i style="--owner:${PAINT[0]}"></i>P1 YOU</span><span><i style="--owner:${PAINT[2]}"></i>P2 OPPONENT</span><span>A1 / A2 AI</span><span>◇ ROUTE · □ DESTINATION</span></div></section>
 <section class="vs-command" aria-label="Driver controls"><div class="vs-turn"><div><span>RACE CONTROL / ${IDS[actor]}</span><h2>${turn}</h2></div><b aria-hidden="true">${enabled?'↗':'—'}</b></div>
 <div class="vs-driver"><div class="vs-portrait" aria-hidden="true"><svg viewBox="-30 -30 60 60">${vehicleArt(v.type,PAINT[0])}</svg></div><div><p class="bz-kicker">P1 / YOU</p><h2>${v.name.toUpperCase()}</h2><p>FAST, LIGHT & AGILE</p></div><span class="vs-stock">STOCK</span></div>
 <div class="bz-status vs-status"><div><small>HULL</small><strong>${String(v.hull).padStart(2,'0')}<span>/${String(v.maxHull).padStart(2,'0')}</span></strong><meter aria-label="Your Hull" min="0" max="${v.maxHull}" value="${v.hull}"></meter></div><div><small>SPEED</small><strong>${String(v.speed).padStart(2,'0')}<span>/${String(v.maxSpeed).padStart(2,'0')}</span></strong></div><div><small>FACING</small><strong>${directions[v.facing+1]} <span>${['↖','↑','↗'][v.facing+1]}</span></strong></div></div>
 <div class="vs-opponent"><b>P2 / OPPONENT</b><span>${o.name}</span><strong>HULL ${o.hull}/${o.maxHull} <span>· SPD ${o.speed}</span></strong></div>
 <fieldset class="vs-inputs" ${enabled?'':'disabled'}><legend class="vs-sr">Your maneuver</legend>
 <fieldset><legend>01 <span>/ SPEED</span></legend><div class="bz-options">${[-1,0,1].map((n,i)=>btn('speed-'+i,['− BRAKE','HOLD','+ ACCELERATE'][i],`data-throttle="${n}" aria-pressed="${choice.throttle===n}" ${legal.some(a=>a.throttle===n)?'':'disabled'}`)).join('')}</div></fieldset>
 <fieldset><legend>02 <span>/ STEERING</span></legend><div class="bz-options">${[-1,0,1].map((n,i)=>btn('steer-'+i,['↖ LEFT','↑ STRAIGHT','↗ RIGHT'][i],`data-steer="${n}" aria-pressed="${choice.steer===n}" ${legal.some(a=>a.throttle===choice.throttle&&a.steer===n)?'':'disabled'}`)).join('')}</div></fieldset>
 <fieldset><legend>03 <span>/ MANEUVER</span></legend><div class="bz-tactics">${['drive','drift','shoot','ram','recover'].map(t=>btn('action-'+t,t.toUpperCase(),`data-tactic="${t}" aria-pressed="${choice.tactic===t}" ${opts.some(a=>a.tactic===t)?'':'disabled'}`)).join('')}</div></fieldset>
 ${enabled&&choice.tactic==='shoot'?`<label class="vs-target" for="vs-target">FIRING SOLUTION <select id="vs-target">${opts.filter(a=>a.tactic==='shoot').map(a=>`<option value="${a.target}" ${choice.target===a.target?'selected':''}>${IDS[a.target]} / ${state.vehicles[a.target].name}</option>`).join('')}</select></label>`:''}
 </fieldset>
 <div class="vs-route">${p?`<div><span>INTENDED ROUTE</span><b>${p.last.y<0?'SECTION CLEAR':`COL ${p.last.x+1} / ROW ${12-p.last.y}`} <small>· ${directions[p.facing+1]} · SPD ${p.speed}</small></b><p>${p.hit?'Impact risk · '+(p.hit.kind==='vehicle'?state.vehicles[p.hit.target].name:p.hit.kind):'Every action moves. Inspect your line.'}</p></div><div class="vs-risk"><span>HANDLING</span><strong>${risk?risk+'+':'—'}</strong><small>${risk?Math.round((7-risk)/6*100)+'% PASS':'NO TEST'}</small></div>`:'<div><span>WATCH THE TRACK</span><b>Controls on standby.</b><p>Your private preview returns on your turn.</p></div>'}</div>
 ${btn('vs-confirm',resolved?'MANEUVER RESOLVED':'CONFIRM MANEUVER <span>→</span>',`class="bz-primary vs-confirm" ${enabled?'':'disabled'}`)}
 <div id="vs-feedback" tabindex="-1" class="vs-feedback ${feedback?'vs-feedback-active':''}" aria-label="Resolved event">${summarize()}</div>
 </section></div>
 <section class="vs-order" aria-label="Turn order and positions">${state.vehicles.map(r=>`<div style="--owner:${PAINT[r.id]}" class="${actor===r.id?'is-active':''}"><b>${IDS[r.id]} <span>${r.id===0?'YOU':r.id===2?'OPPONENT':'AI'}</span>${actor===r.id?'<em>ACTIVE</em>':''}</b><strong>${r.name}</strong><small>HULL ${r.hull}/${r.maxHull} · SPD ${r.speed} · ${directions[r.facing+1]}</small><small>${r.wrecked?'WRECKED':r.exited?'SECTION CLEAR':`COL ${r.x+1} / ROW ${12-r.y}`}</small></div>`).join('')}</section>
 <section class="vs-radio"><div class="vs-radio-heading"><h2>RACE RADIO<span> / CONTROL CHANNEL</span></h2><span>SECTION 01</span></div><ol>${state.events.length?state.events.slice(-5).reverse().map(e=>`<li data-event="${e.type}"><span class="vs-radio-time">${String(e.section).padStart(2,'0')}.${String(e.round).padStart(2,'0')}</span><b>${({shot:'SHOT',damage:'HIT',handling:'CHECK',action:'MOVE',wreck:'WRECKED',collision:'IMPACT',ram:'RAM'})[e.type]||esc(e.type.toUpperCase())}</b><span>${esc(e.text)}</span></li>`).join(''):'<li><span class="vs-radio-time">01.01</span><b>GRID</b><span>Road Knife approaching the inside line. Pick your maneuver.</span></li>'}</ol></section>
 <details class="bz-help vs-review"><summary>Visual slice review / turn samples / reset</summary><p>The scene uses the existing rules engine locally. Confirm resolves one legal action, then pauses. Turn samples are presentation-only. No online room is created.</p><div class="vs-review-actions">${btn('vs-reset','RESET SCENE')}${btn('vs-you','YOUR TURN')}${btn('vs-opponent','OPPONENT TURN')}${btn('vs-ai','AI TURN')}</div><label class="bz-setting"><input id="vs-motion" type="checkbox" ${reduced?'checked':''}> Reduce motion</label><p>Default shot: accelerate, steer right, fire at P2. Handling and damage are engine outcomes, not fabricated feedback.</p></details>
 <details class="bz-help"><summary>Track briefing / rules</summary><p>Gunk adds handling difficulty when crossed. Solid terrain blocks movement and causes collision damage. The dotted route is intended, not guaranteed. Shot range and cover are evaluated after movement; a handling failure can spoil the firing solution. Full rules and the original Solo game remain on the main page.</p></details>
 </div>`;
 bind();if(focus)view.querySelector('#'+focus)?.focus({preventScroll:true});
}
function announce(text){live.textContent=text}
function bind(){
 const on=(id,fn)=>{const e=view.querySelector('#'+id);if(e)e.onclick=fn};
 for(const field of ['throttle','steer'])view.querySelectorAll(`[data-${field}]`).forEach(b=>b.onclick=()=>{if(!active())return;choice={...choice,[field]:Number(b.dataset[field]),tactic:'drive'};delete choice.target;draw(b.id)});
 view.querySelectorAll('[data-tactic]').forEach(b=>b.onclick=()=>{if(!active())return;choice=getLegalActions(state,0).find(a=>a.throttle===choice.throttle&&a.steer===choice.steer&&a.tactic===b.dataset.tactic);draw(b.id)});
 view.querySelector('#vs-target')?.addEventListener('change',e=>{choice={...choice,target:Number(e.target.value)};draw('vs-target')});
 on('vs-confirm',()=>{if(!active())return;state=resolveAction(state,choice);resolved=true;sample='ai';feedback={handling:state.events.find(e=>e.type==='handling'),shot:state.events.find(e=>e.type==='shot'),damage:state.events.find(e=>e.type==='damage')};draw('vs-feedback');announce(state.events.map(e=>e.text).join(' ')+' Local scene paused after resolution.');});
 on('vs-reset',()=>{state=createSlice();choice={...SHOT};sample='you';resolved=false;feedback=null;draw('vs-confirm');announce('Scene reset. Your turn.');});
 for(const [id,s] of [['vs-you','you'],['vs-opponent','opponent'],['vs-ai','ai']])on(id,()=>{sample=s;draw(id);announce(s==='you'&&resolved?'Scene resolved. Reset to review your turn.':s==='you'?'Your turn.':s==='opponent'?'Opponent turn sample.':'AI turn sample.');});
 view.querySelector('#vs-motion').onchange=e=>{reduced=e.target.checked;draw('vs-motion');};
}
draw();
