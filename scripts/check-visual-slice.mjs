// Optional browser gate. Supply a local Playwright package and executable if needed.
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.BADZONE_PLAYWRIGHT||'playwright');
const server=spawn(process.execPath,['scripts/serve.mjs'],{env:{...process.env,PORT:'4175'}});
await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',c=>reject(Error('Preview server exited '+c)))});
const browser=await chromium.launch({headless:true,...(process.env.BADZONE_CHROMIUM?{executablePath:process.env.BADZONE_CHROMIUM}:{})});
await mkdir('docs/visual-evidence',{recursive:true});
const checks=[];
try{
 for(const [width,height] of [[320,844],[390,844],[768,1024],[1280,720]]){
  const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4175/visual-slice.html');await page.locator('#vs-confirm').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  assert.equal(await page.locator('[data-cell]').count(),96);assert.equal(await page.locator('[data-vehicle]').count(),4);
  await page.screenshot({path:`docs/visual-evidence/slice-race-${width}.png`,fullPage:true});
  if(width===1280)await page.screenshot({path:'docs/visual-evidence/slice-first-viewport.png'});
  await page.locator('#vs-confirm').focus();await page.keyboard.press('Enter');
  assert.match(await page.locator('#vs-live').innerText(),/rolled 6/);
  assert.match(await page.locator('.vs-feedback').innerText(),/−1 HULL/);
  assert.equal(await page.locator('#vs-confirm').isDisabled(),true);
  assert.match(await page.locator('.vs-opponent').innerText(),/11\/12/);
  await page.screenshot({path:`docs/visual-evidence/slice-shot-${width}.png`,fullPage:true});
  await page.locator('.vs-review summary').click();await page.locator('#vs-reset').click();
  await page.locator('.vs-review summary').click();await page.locator('#vs-opponent').click();
  assert.match(await page.locator('.vs-turn').innerText(),/OPPONENT TURN/);
  assert.equal(await page.locator('#vs-confirm').isDisabled(),true);assert.equal(await page.locator('.vs-path').count(),0);
  await page.locator('.vs-review summary').click();await page.locator('#vs-ai').click();
  assert.match(await page.locator('.vs-turn').innerText(),/AI TURN/);
  await page.locator('.vs-review summary').click();await page.locator('#vs-reset').click();
  await page.locator('#speed-1').click();await page.locator('#steer-1').click();await page.locator('#action-recover').click();await page.locator('#vs-confirm').click();
  assert.match(await page.locator('.vs-radio').innerText(),/extinguishes fire/);
  await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('#vs-confirm').click();
  const animations=await page.locator('.vs-shot-fx').evaluate(el=>getComputedStyle(el).animationName);assert.equal(animations,'none');
  assert.match(await page.locator('.vs-feedback').innerText(),/D6 6/);
  assert.deepEqual(errors,[]);checks.push({width,height,overflow:false,consoleErrors:errors,keyboardConfirm:'pass',engineShot:'pass',turnSamples:'pass',alternativeManeuver:'pass',reducedMotion:'pass'});
  await context.close();
 }
 await writeFile('docs/visual-evidence/browser-results.json',JSON.stringify({browser:await browser.version(),checks},null,2));console.log(JSON.stringify(checks,null,2));
}finally{await browser.close();server.kill()}
