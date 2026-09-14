const tokens=[
["RHX","RHOX","$2.48","+18.42%"],["MARS","MARS","$0.084","+12.07%"],["NOVA","NOVA","$1.21","+9.31%"],["PEARL","PEARL","$0.019","-3.18%"],["RWA","RWA","$4.72","+6.82%"]
];
const projects=[
["01","PIXEL RWA","RWA","Tokenized asset discovery & analytics."],
["02","CHAINLABS","TOOL","Developer tools for RH Chain."],
["03","ROBIN ART","NFT","Community digital collectibles."],
["04","DEFI GRID","DEFI","Protocol discovery and liquidity tools."],
["05","RH MONITOR","TOOL","Network health and activity dashboard."],
["06","BLOCK PIXEL","NFT","Pixel-native creator ecosystem."]
];
const feed=["BOOT > connecting to robinhood-mainnet...","RPC > chainId 4663 confirmed","INDEX > token balances synchronized","WATCH > new block received","SCAN > ecosystem heartbeat OK","READY > terminal online"];
function $(id){return document.getElementById(id)}
$("terminalFeed").innerHTML=feed.map((x,i)=>`<div>[${String(i+1).padStart(2,"0")}] ${x}</div>`).join("");
$("ticker").innerHTML=[...tokens,...tokens].map(t=>`&nbsp;&nbsp;${t[1]} ${t[2]} <b class="${t[3][0]=="+"?"green":"red"}">${t[3]}</b>&nbsp;&nbsp;◆`).join("");
$("tokenList").innerHTML=tokens.map(t=>`<div class="token"><div class="pixel-icon">${t[0][0]}</div><div><b>${t[1]}</b><small>Robinhood Chain</small></div><div>${t[2]}</div><div class="${t[3][0]=="+"?"green":"red"}">${t[3]}</div><a class="btn" target="_blank" href="https://robinhoodchain.blockscout.com/">VIEW ↗</a></div>`).join("");
$("projectGrid").innerHTML=projects.map(p=>`<article class="project"><div class="pixel-icon">${p[0]}</div><span class="tag">${p[2]}</span><h3>${p[1]}</h3><p>${p[3]}</p><span class="tag">APPROVED</span></article>`).join("");
const acts=["0x7f3a…91d2","0x9aa1…b44c","0x2c18…f021","0x81d0…a77e","0x44be…0a19","0x5f21…d8c0"];
$("activityList").innerHTML=acts.map((a,i)=>`<div class="activity"><b>BLOCK #${(1892400+i).toLocaleString()}</b> <span>TX ${a} · ${i+1} transfers · ${i+2}s ago</span></div>`).join("");
$("recentActivity").innerHTML=acts.slice(0,4).map((a,i)=>`<div class="activity"><b>${i%2?"SEND":"RECEIVE"}</b> <span>${a}</span></div>`).join("");

let connected=false;
function connect(){
 connected=!connected;
 $("connectBtn").textContent=connected?"0x7F3A…91D2":"CONNECT WALLET";
 $("balance").textContent=connected?"$12,840.72":"$0.00";
 $("balance").nextElementSibling.textContent=connected?"LIVE READ-ONLY WALLET VIEW":"CONNECT WALLET TO LOAD";
 document.querySelector("#portfolioConnect").textContent=connected?"CONNECTED":"CONNECT";
}
$("connectBtn").onclick=connect;$("portfolioConnect").onclick=connect;

$("scanBtn").onclick=()=>{
 const v=$("addressInput").value.trim();
 if(!/^0x[a-fA-F0-9]{40}$/.test(v)){ $("scanResult").innerHTML=`<div class="result-empty">INVALID ADDRESS<br><span>USE A 42-CHARACTER EVM ADDRESS</span></div>`;return;}
 $("scanResult").innerHTML=`<div class="eyebrow">SCAN COMPLETE // READ-ONLY</div><div class="risk">RISK: REVIEW</div>${[
["FORMAT","VALID"],["CHAIN","ROBINHOOD CHAIN / 4663"],["OWNER","INSPECT ON-CHAIN"],["LIQUIDITY","CHECK REQUIRED"],["MINT / PAUSE","CHECK REQUIRED"],["HOLDERS","INDEX REQUIRED"]
].map(x=>`<div class="check"><span>${x[0]}</span><b>${x[1]}</b></div>`).join("")}<a class="btn" style="margin-top:18px" target="_blank" href="https://robinhoodchain.blockscout.com/address/${v}">OPEN BLOCKSCOUT ↗</a>`;
};
$("addressInput").addEventListener("keydown",e=>{if(e.key==="Enter")$("scanBtn").click()});

const modal=$("projectModal");function openModal(){modal.classList.add("show")}function closeModal(){modal.classList.remove("show")}
$("submitProject").onclick=openModal;$("submitProject2").onclick=openModal;$("closeModal").onclick=closeModal;
$("projectForm").onsubmit=e=>{e.preventDefault();alert("PROJECT SUBMITTED FOR ADMIN REVIEW.");closeModal();e.target.reset()};
window.onclick=e=>{if(e.target===modal)closeModal()};
