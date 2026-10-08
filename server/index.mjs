import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {Rooms,GameError,PROTOCOL} from './rooms.mjs';
const base=fileURLToPath(new URL('../public/',import.meta.url));
export function makeServer({rooms=new Rooms(),origins=['https://badzone-run.onrender.com'],limit=120}={}){
 const buckets=new Map();
 return createServer(async(req,res)=>{
  const origin=req.headers.origin;
  const permitted=!origin||origins.includes(origin)||/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Content-Type':'application/json'};
  if(origin&&permitted)Object.assign(headers,{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, POST, OPTIONS'});
  const send=(status,data)=>{res.writeHead(status,headers);res.end(JSON.stringify(data))};
  try{
   if(!permitted)throw new GameError(403,'Origin not allowed.');if(req.method==='OPTIONS'){send(204,null);return}
   const url=new URL(req.url,'http://localhost');
   if(url.pathname==='/api/health'){send(200,{ok:true,protocol:PROTOCOL,version:'0.2.0'});return}
   if(url.pathname.startsWith('/api/')){
    const ip=String(req.headers['x-forwarded-for']||req.socket.remoteAddress).split(',')[0],now=Date.now();
    if(buckets.size>10000)for(const [k,v]of buckets)if(now-v.at>60000)buckets.delete(k);
    let b=buckets.get(ip);if(!b||now-b.at>60000){b={at:now,n:0};buckets.set(ip,b)}if(++b.n>limit)throw new GameError(429,'Too many requests. Wait a moment.');
    let body=null;if(req.method==='POST'){if(!req.headers['content-type']?.startsWith('application/json'))throw new GameError(415,'JSON required.');let bytes='';for await(const chunk of req){bytes+=chunk;if(Buffer.byteLength(bytes)>4096)throw new GameError(413,'Request too large.')}try{body=JSON.parse(bytes)}catch{throw new GameError(400,'Invalid JSON.')}if(!body||Array.isArray(body)||typeof body!=='object')throw new GameError(400,'Invalid request.');}
    if(req.method==='POST'&&url.pathname==='/api/rooms'){if(body.protocol!==PROTOCOL)throw new GameError(409,'Game updated. Reload.');send(201,rooms.create(body.type));return}
    const m=url.pathname.match(/^\/api\/rooms\/([A-Z2-9]{6})(?:\/(join|command))?$/);if(!m)throw new GameError(404,'Endpoint not found.');
    const token=(req.headers.authorization||'').replace(/^Bearer /,'');
    if(req.method==='GET'&&!m[2])send(200,rooms.get(m[1],token));
    else if(req.method==='POST'&&m[2]==='join'){if(body.protocol!==PROTOCOL)throw new GameError(409,'Game updated. Reload.');send(200,rooms.join(m[1],body.type));}
    else if(req.method==='POST'&&m[2]==='command')send(200,rooms.command(m[1],token,body));else throw new GameError(405,'Method not allowed.');return;
   }
   if(req.method!=='GET')throw new GameError(405,'Method not allowed.');
   const file=path.resolve(base,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));if(!file.startsWith(path.resolve(base)+path.sep))throw new GameError(403,'Forbidden');
   let bytes;try{bytes=await readFile(file)}catch{throw new GameError(404,'Not found')}
   headers['Content-Type']=({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.woff':'font/woff','.json':'application/json'})[path.extname(file)]||'application/octet-stream';res.writeHead(200,headers);res.end(bytes);
  }catch(e){send(e.status||500,{error:e.status?e.message:'Server error. Try again.'});if(!e.status)console.error(e);}
 });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){const server=makeServer({origins:(process.env.ALLOWED_ORIGINS||'https://badzone-run.onrender.com').split(',')});server.listen(Number(process.env.PORT||4173),'0.0.0.0',()=>console.log('Badzone multiplayer listening'));process.on('SIGTERM',()=>server.close(()=>process.exit(0)));}
