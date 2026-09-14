import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { ethers } from 'npm:ethers@6.15.0';
const RPC='https://rpc.mainnet.chain.robinhood.com', STAKING='0xA1Cf1e04c74984F7aF8CCd79Fb17E4fee54302E7';
const ABI=['function isOGEligible(address) view returns(bool)','function stakedBalance(address) view returns(uint256)'];
serve(async req=>{try{const {address}=await req.json();if(!ethers.isAddress(address))return new Response(JSON.stringify({error:'Invalid wallet'}),{status:400});const c=new ethers.Contract(STAKING,ABI,new ethers.JsonRpcProvider(RPC));const [eligible,balance]=await Promise.all([c.isOGEligible(address),c.stakedBalance(address)]);return new Response(JSON.stringify({eligible,stakedBalance:balance.toString(),chainId:4663}),{headers:{'content-type':'application/json','cache-control':'no-store'}})}catch(e){return new Response(JSON.stringify({error:String(e?.message||e)}),{status:500,headers:{'content-type':'application/json'}})}});
