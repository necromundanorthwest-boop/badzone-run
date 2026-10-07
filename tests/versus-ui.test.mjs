import test from 'node:test';
import assert from 'node:assert/strict';
import {mountVersus} from '../public/badzone/versus-ui.js';
import {createRace} from '../public/badzone/engine.js';
import {boardSVG} from '../public/badzone/ui.js';

// Small event/markup harness, NOT a browser or a layout/accessibility test.
class ReviewRoot {
 set innerHTML(html){
  this.html=html;this.elements=[];
  for(const m of html.matchAll(/<(button|input|select|form)\b([^>]*)>/g)){
   const attrs=Object.fromEntries([...m[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
   this.elements.push({id:attrs.id,value:attrs.value||'',dataset:Object.fromEntries(Object.entries(attrs).filter(([k])=>k.startsWith('data-')).map(([k,v])=>[k.slice(5),v])),focus(){},select(){},addEventListener(){}});
  }
 }
 get innerHTML(){return this.html}
 querySelector(selector){if(selector.startsWith('#'))return this.elements.find(e=>e.id===selector.slice(1));const m=selector.match(/^\[data-(\w+)="([^"]+)"\]$/);return m?this.elements.find(e=>e.dataset[m[1]]===m[2]):null}
 querySelectorAll(selector){const m=selector.match(/^\[data-(\w+)\]$/);return m?this.elements.filter(e=>m[1] in e.dataset):[]}
 click(id){const el=this.querySelector('#'+id);assert.ok(el,'control exists: '+id);assert.equal(typeof el.onclick,'function',id+' bound');el.onclick()}
}
const setup=()=>{const root=new ReviewRoot();mountVersus(root);return root};
const start=root=>{root.click('bz-create');root.click('mock-join');root.click('mock-ready');root.click('mock-start')};

test('host mock flow, previews, private drafts, connection fixtures and rematch',()=>{
 const root=setup();assert.match(root.html,/VERSUS/);assert.equal(root.querySelectorAll('[data-racer]').length,4);
 start(root);assert.match(root.html,/YOUR TURN/);assert.match(root.html,/bz-ghost/);
 root.click('bz-throttle-2');assert.match(root.html,/aria-pressed="true"/);
 root.click('bz-confirm');assert.match(root.html,/AI RACER MOVING/);assert.doesNotMatch(root.html,/class="bz-ghost"/);assert.match(root.html,/bz-turn-controls" disabled/);
 root.click('mock-other');assert.match(root.html,/OPPONENT TURN/);
 root.click('mock-your');root.click('mock-disconnect');assert.match(root.html,/MOCK PAUSED/);
 root.click('mock-disconnect');assert.match(root.html,/YOUR TURN/);
 root.click('mock-win');assert.match(root.html,/YOU WIN/);assert.match(root.html,/Full finishing order/);
 root.click('mock-flip');assert.match(root.html,/OPPONENT WINS/);
 root.click('bz-rematch');assert.match(root.html,/BZ2026/);assert.match(root.html,/MARK READY/);assert.match(root.html,/SELECTING/);
});

test('join validation, P2 ownership, chassis change and preview use local racer',()=>{
 const root=setup();root.click('bz-join-open');
 root.querySelector('#bz-room-input').value='XXXXXX';root.querySelector('#bz-join-form').onsubmit({preventDefault(){}});assert.match(root.html,/Mock room not found/);
 root.querySelector('#bz-room-input').value='bz2026';root.querySelector('#bz-join-form').onsubmit({preventDefault(){}});
 root.querySelector('[data-racer="wagon"]').onclick();assert.match(root.html,/P2 — Gun Wagon/);
 root.click('bz-ready');assert.match(root.html,/BOTH DRIVERS READY/);root.click('mock-start');assert.match(root.html,/OPPONENT TURN/);
 root.click('mock-your');assert.match(root.html,/YOUR TURN/);assert.match(root.html,/P2 \/ YOU \/ Gun Wagon/);assert.match(root.html,/Player column 2, row 1/);
 root.click('mock-loss');assert.match(root.html,/OPPONENT WINS/);
});

test('optional board labels retain existing geometry and default Solo rendering',()=>{
 const state=createRace('LABELS');const baseline=boardSVG(state);const labeled=boardSVG(state,null,false,{0:'P1',1:'A1',2:'P2',3:'A2'},2);
 assert.match(baseline,/>P<\/text>/);for(const label of ['P1','P2','A1','A2'])assert.ok(labeled.includes('>'+label+'</text>'));
 assert.equal((labeled.match(/class="bz-tile /g)||[]).length,96);assert.match(labeled,/Player column 2, row 1/);
});
