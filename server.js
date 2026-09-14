import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Database from 'better-sqlite3';
import { JsonRpcProvider, isAddress, formatEther } from 'ethers';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3000);
const RPC = process.env.RH_RPC_URL || 'https://rpc.mainnet.chain.robinhood.com';
const provider = new JsonRpcProvider(RPC, { chainId: 4663, name: 'Robinhood Chain' });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '200kb' }));
app.use(rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: true, legacyHeaders: false }));
app.use(express.static(__dirname));

const db = new Database(path.join(__dirname, 'copilot.db')); 
db.pragma('journal_mode = WAL');
db.exec(`CREATE TABLE IF NOT EXISTS projects(
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL,
 contract TEXT, website TEXT, description TEXT NOT NULL, logo TEXT, status TEXT NOT NULL DEFAULT 'pending',
 created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS watchlist(address TEXT PRIMARY KEY, label TEXT, created_at TEXT NOT NULL);`);
if (process.env.SEED_DEMO_DATA === 'true' && db.prepare('SELECT COUNT(*) c FROM projects').get().c === 0) {
  const now = new Date().toISOString();
  const seed = db.prepare('INSERT INTO projects(name,category,contract,website,description,logo,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)');
  [['RH Developer Tools','TOOL','','','Developer infrastructure and analytics.', '', 'approved'],['RWA Atlas','RWA','','','Explore tokenized real-world assets.', '', 'approved'],['Pixel Markets','DEFI','','','Community DeFi discovery.', '', 'approved']].forEach(x=>seed.run(...x,now,now));
}

async function rhFetch(url) {
  const r = await fetch(url, { headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`Upstream ${r.status}`);
  return r.json();
}
function admin(req,res,next){
  const key=req.headers['x-admin-key'];
  if(!process.env.ADMIN_KEY || key!==process.env.ADMIN_KEY) return res.status(401).json({error:'Unauthorized'});
  next();
}

app.get('/api/health', async (_req,res)=>{
  try {
    const [network, block, gas] = await Promise.all([provider.getNetwork(), provider.getBlockNumber(), provider.getFeeData()]);
    res.json({ok:true, chainId:Number(network.chainId), block, gasPrice:gas.gasPrice?.toString()||null, rpc:RPC});
  } catch(e){ res.status(503).json({ok:false,error:e.message}); }
});
app.get('/api/stock/assets', async (_req,res)=>{ try { const d=await rhFetch('https://api.robinhood.com/rhj/assets'); res.json(d); } catch(e){res.status(502).json({error:e.message});} });
app.get('/api/stock/prices/:symbol', async (req,res)=>{ try { const d=await rhFetch(`https://api.robinhood.com/rhj/prices/${encodeURIComponent(req.params.symbol.toUpperCase())}`); res.json(d); } catch(e){res.status(502).json({error:e.message});} });
app.get('/api/stock/corporate-actions', async (_req,res)=>{ try { const d=await rhFetch('https://api.robinhood.com/rhj/corporate-actions'); res.json(d); } catch(e){res.status(502).json({error:e.message});} });

app.get('/api/address/:address', async (req,res)=>{
  const a=req.params.address;
  if(!isAddress(a)) return res.status(400).json({error:'Invalid EVM address'});
  try {
    const [balance,code,nonce]=await Promise.all([provider.getBalance(a),provider.getCode(a),provider.getTransactionCount(a)]);
    res.json({address:a, type:code==='0x'?'EOA':'CONTRACT', ethBalance:formatEther(balance), nonce, bytecodeBytes:code==='0x'?0:(code.length-2)/2, blockscout:`https://robinhoodchain.blockscout.com/address/${a}`});
  }catch(e){res.status(502).json({error:e.message});}
});

app.get('/api/wallet/:address', async (req,res)=>{
  const a=req.params.address;
  if(!isAddress(a)) return res.status(400).json({error:'Invalid EVM address'});
  try {
    const balance=await provider.getBalance(a);
    let indexed=null;
    if(process.env.ALCHEMY_API_KEY){
      const url=`https://api.g.alchemy.com/data/v1/${process.env.ALCHEMY_API_KEY}/assets/tokens/by-address?addresses[]=${a}&networks=robinhood-mainnet`;
      try { indexed=await (await fetch(url)).json(); } catch{}
    }
    res.json({address:a,eth:formatEther(balance),indexed});
  }catch(e){res.status(502).json({error:e.message});}
});

app.get('/api/projects', (req,res)=>{
  const status=req.query.status==='all'?null:(req.query.status||'approved');
  const rows=status?db.prepare('SELECT * FROM projects WHERE status=? ORDER BY id DESC').all(status):db.prepare('SELECT * FROM projects ORDER BY id DESC').all();
  res.json(rows);
});
app.post('/api/projects',(req,res)=>{
  const {name,category,contract='',website='',description,logo=''}=req.body||{};
  if(!name||!category||!description||String(name).length>80||String(description).length>500) return res.status(400).json({error:'Name, category and description are required; length limits apply.'});
  if(contract && !isAddress(contract)) return res.status(400).json({error:'Contract must be a valid EVM address.'});
  const now=new Date().toISOString();
  const info=db.prepare('INSERT INTO projects(name,category,contract,website,description,logo,status,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').run(name,category,contract,website,description,logo,'pending',now,now);
  res.status(201).json({id:info.lastInsertRowid,status:'pending'});
});
app.post('/api/projects/:id/approve',admin,(req,res)=>{const now=new Date().toISOString();db.prepare('UPDATE projects SET status=?,updated_at=? WHERE id=?').run('approved',now,req.params.id);res.json({ok:true});});
app.post('/api/projects/:id/reject',admin,(req,res)=>{const now=new Date().toISOString();db.prepare('UPDATE projects SET status=?,updated_at=? WHERE id=?').run('rejected',now,req.params.id);res.json({ok:true});});

app.get('/api/watchlist',(req,res)=>res.json(db.prepare('SELECT * FROM watchlist ORDER BY created_at DESC').all()));
app.post('/api/watchlist',(req,res)=>{const {address,label=''}=req.body||{};if(!isAddress(address))return res.status(400).json({error:'Invalid address'});db.prepare('INSERT OR REPLACE INTO watchlist(address,label,created_at) VALUES(?,?,?)').run(address.toLowerCase(),label,new Date().toISOString());res.status(201).json({ok:true});});
app.delete('/api/watchlist/:address',(req,res)=>{db.prepare('DELETE FROM watchlist WHERE address=?').run(req.params.address.toLowerCase());res.json({ok:true});});

app.get('/api/bridge-info',(_req,res)=>res.json({routes:[
 {name:'Arbitrum canonical bridge',speed:'~10 min deposit / ~7 day withdrawal',bestFor:'Trustless Ethereum ↔ Robinhood Chain transfers',official:true},
 {name:'LayerZero OFT / Stargate',speed:'Minutes, source-chain dependent',bestFor:'Fast cross-chain token movement',official:true},
 {name:'Chainlink CCIP / Transporter',speed:'Minutes, source-chain dependent',bestFor:'Cross-chain token transfer and messaging',official:true}
],note:'Live fee/ETA quotes are not fabricated; integrate a route provider before execution.'}));

app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.listen(PORT,()=>console.log(`Robinhood Chain Copilot listening on http://localhost:${PORT}`));
