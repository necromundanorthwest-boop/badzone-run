import {readFile,readdir,stat} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url)),pub=path.join(root,'public');
for(const f of ['app.js',...(await readdir(path.join(pub,'badzone'))).filter(f=>f.endsWith('.js')).map(f=>'badzone/'+f)])execFileSync(process.execPath,['--check',path.join(pub,f)]);
const html=await readFile(path.join(pub,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g))await stat(path.resolve(pub,m[1]));
for(const f of ['base.css','badzone/style.css']){const css=await readFile(path.join(pub,f),'utf8');for(const m of css.matchAll(/url\(['"]?([^'"\)]+)['"]?\)/g))await stat(path.resolve(pub,path.dirname(f),m[1]))}
if(!html.includes('id="game"')||html.includes('noindex'))throw Error('Invalid standalone entry');
const manifest=JSON.parse(await readFile(path.join(pub,'release.json'),'utf8'));if(manifest.rulesVersion!=='0.1.0'||manifest.distribution!=='standalone-render')throw Error('Release mismatch');
console.log('PASS: standalone entry, JavaScript syntax, local CSS/font assets and release metadata. public/ is ready for static hosting.');
