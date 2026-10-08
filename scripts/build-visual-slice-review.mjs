// Build a portable visual slice review artifact; no bundler or runtime dependency.
import {readFile,writeFile} from 'node:fs/promises';
const base=new URL('../',import.meta.url);
const read=path=>readFile(new URL(path,base),'utf8');
const aliases={'../engine.js':'bz-engine','./fixture.js':'bz-fixture','./art.js':'bz-art'};
const rewrite=source=>Object.entries(aliases).reduce((s,[from,to])=>s.replaceAll(`'${from}'`,`'${to}'`),source);
const imports={};
for(const [name,path] of Object.entries({'bz-engine':'engine.js','bz-fixture':'visual/fixture.js','bz-art':'visual/art.js'}))imports[name]='data:text/javascript;base64,'+Buffer.from(rewrite(await read('public/badzone/'+path))).toString('base64');
let html=await read('public/visual-slice.html');
for(const path of ['base.css','badzone/style.css','badzone/visual/slice.css']){
 let css=await read('public/'+path);
 if(path==='base.css')css=css.replace('./assets/display.woff','data:font/woff;base64,'+(await readFile(new URL('public/assets/display.woff',base))).toString('base64'));
 html=html.replace(`<link rel="stylesheet" href="./${path}">`,`<style>${css}</style>`);
}
html=html.replace('href="./assets/favicon.svg"','href="data:image/svg+xml;base64,'+Buffer.from(await read('public/assets/favicon.svg')).toString('base64')+'"');
html=html.replace('<script type="module" src="./badzone/visual/slice.js"></script>',`<script type="importmap">${JSON.stringify({imports})}</script>`);
html=html.replace('</body>',`<script type="module">${rewrite(await read('public/badzone/visual/slice.js'))}</script></body>`);
await writeFile(new URL('docs/BADZONE_VISUAL_SLICE_REVIEW.html',base),html);
console.log('Created docs/BADZONE_VISUAL_SLICE_REVIEW.html (embedded modules, styles and font).');
