const express=require('express');
const path=require('path');
const fs=require('fs');
const crypto=require('crypto');
const app=express();
const PORT=Number(process.env.PORT||3000);
const RPC=process.env.RH_RPC_URL||'https://rpc.mainnet.chain.robinhood.com';
const BLOCKSCOUT=process.env.BLOCKSCOUT_API||'https://robinhoodchain.blockscout.com/api';
const ADMIN_KEY=process.env.ADMIN_KEY||'change-me-now';
const DATA=path.join(__dirname,'data');
const DB=path.join(DATA,'projects.json');
fs.mkdirSync(DATA,{recursive:true});
if(!fs.existsSync(DB))fs.writeFileSync(DB,'[]');
app.use(express.json({limit:'150kb'}));
app.use(express.static(path.join(__dirname,'public')));
function read(){try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return[]}}
function write(v){fs.writeFileSync(DB,JSON.stringify(v,null,2))}
async function rpc(method,params=[]){const r=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:Date.now(),method,params})});if(!r.ok)throw Error(`RPC HTTP ${r.status}`);const j=await r.json();if(j.error)throw Error(j.error.message||'RPC error');return j.result}
function valid(a){return /^0x[a-fA-F0-9]{40}$/.test(a||'')}
function admin(req){return req.headers['x-admin-key']===ADMIN_KEY}
app.get('/api/health',(_,res)=>res.json({ok:true,service:'RH//HUB',chainId:4663}));
app.get('/api/chain',async(_,res)=>{try{const [block,gas,net,client]=await Promise.all([rpc('eth_blockNumber'),rpc('eth_gasPrice'),rpc('net_version'),rpc('web3_clientVersion')]);res.json({chainId:4663,network:net,blockNumber:parseInt(block,16),gasWei:gas,client,rpc:RPC})}catch(e){res.status(503).json({error:e.message})}});
app.get('/api/address/:address',async(req,res)=>{const a=req.params.address;if(!valid(a))return res.status(400).json({error:'Invalid EVM address'});try{const [code,balance,nonce]=await Promise.all([rpc('eth_getCode',[a,'latest']),rpc('eth_getBalance',[a,'latest']),rpc('eth_getTransactionCount',[a,'latest'])]);res.json({address:a,isContract:code!=='0x',codeBytes:code==='0x'?0:(code.length-2)/2,balanceWei:balance,nonce:parseInt(nonce,16),blockscout:`https://robinhoodchain.blockscout.com/address/${a}`})}catch(e){res.status(503).json({error:e.message})}});
app.get('/api/token/:address',async(req,res)=>{const a=req.params.address;if(!valid(a))return res.status(400).json({error:'Invalid EVM address'});const calls=[['name','0x06fdde03'],['symbol','0x95d89b41'],['decimals','0x313ce567'],['totalSupply','0x18160ddd']];try{const out={address:a};for(const [k,data] of calls){try{const x=await rpc('eth_call',[{to:a,data},'latest']);out[k]=x}catch{out[k]=null}}res.json(out)}catch(e){res.status(503).json({error:e.message})}});
app.get('/api/projects',(req,res)=>res.json(read().filter(p=>p.status==='approved').sort((a,b)=>b.createdAt.localeCompare(a.createdAt))));
app.post('/api/projects',(req,res)=>{const {name,address,category,link,description,logo}=req.body||{};if(!name||!valid(address))return res.status(400).json({error:'Project name and valid contract address are required'});const list=read();const p={id:crypto.randomBytes(8).toString('hex'),name:name.trim().slice(0,80),address,category:(category||'Other').slice(0,30),link:(link||'').slice(0,300),description:(description||'').slice(0,600),logo:(logo||'').slice(0,500),status:'pending',createdAt:new Date().toISOString()};list.push(p);write(list);res.status(201).json({ok:true,id:p.id,status:p.status})});
app.get('/api/admin/projects',(req,res)=>{if(!admin(req))return res.status(401).json({error:'Unauthorized'});res.json(read().sort((a,b)=>b.createdAt.localeCompare(a.createdAt)))});
app.post('/api/admin/projects/:id',(req,res)=>{if(!admin(req))return res.status(401).json({error:'Unauthorized'});const list=read();const p=list.find(x=>x.id===req.params.id);if(!p)return res.status(404).json({error:'Not found'});if(!['approved','rejected','pending'].includes(req.body.status))return res.status(400).json({error:'Invalid status'});p.status=req.body.status;p.reviewedAt=new Date().toISOString();write(list);res.json(p)});
app.get('/api/blockscout/stats',async(_,res)=>{try{const r=await fetch(`${BLOCKSCOUT}?module=stats&action=ethsupply`);const j=await r.json();res.json(j)}catch(e){res.status(503).json({error:e.message})}});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`RH//HUB running on http://localhost:${PORT}`));
