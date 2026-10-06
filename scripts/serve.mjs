// Local preview only. Render serves public/ directly; it does not run this server.
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const base=fileURLToPath(new URL('../public/',import.meta.url));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.ttf':'font/ttf','.woff':'font/woff'};
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  let file=path.resolve(base,'.'+decodeURIComponent(url.pathname));
  if(file!==path.resolve(base)&&!file.startsWith(base)){res.writeHead(403);res.end('Forbidden');return}
  if((await stat(file)).isDirectory())file=path.join(file,'index.html');
  const bytes=await readFile(file);
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
  res.end(bytes);
 }catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});res.end(await readFile(path.join(base,'404.html')))}
});
server.on('error',error=>{console.error(error.code==='EADDRINUSE'?`Port ${port} is already in use. Stop the earlier preview with Control+C, then run npm start again.`:error.message);process.exitCode=1});
server.listen(port,'127.0.0.1',()=>console.log(`Badzone Run: http://localhost:${port}/\nKeep this Terminal open while playing. Press Control+C to stop.`));
