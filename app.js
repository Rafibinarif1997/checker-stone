const projects=[
 {name:"Rhood Labs",logo:"RL",desc:"A new onchain ecosystem building the next generation of social coordination.",tasks:5,gtd:15,ends:"2026-09-14T18:00:00"},
 {name:"Orbit Protocol",logo:"OP",desc:"Community-powered infrastructure for permissionless digital ownership.",tasks:4,gtd:10,ends:"2026-09-14T16:30:00"},
 {name:"Stone Network",logo:"SN",desc:"A mission-driven network connecting creators, collectors and builders.",tasks:6,gtd:20,ends:"2026-09-15T18:00:00"},
 {name:"Nova Studio",logo:"NS",desc:"A creative Web3 studio turning community participation into experiences.",tasks:4,gtd:12,ends:"2026-09-15T12:00:00"}
];

const grid=document.getElementById("projectGrid");
function remaining(date){
  let d=new Date(date)-Date.now();
  if(d<0)return "ENDED";
  const h=Math.floor(d/36e5),m=Math.floor(d%36e5/6e4),s=Math.floor(d%6e4/1e3);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function render(){
 grid.innerHTML=projects.map((p,i)=>`
  <article class="project">
   <div class="project-top"><div class="project-logo">${p.logo}</div><span class="tag">24H MISSION</span></div>
   <h3>${p.name}</h3><p class="project-desc">${p.desc}</p>
   <div class="project-meta">
    <div><span>TASKS</span><strong>${p.tasks} missions</strong></div>
    <div><span>GTD POOL</span><strong>${p.gtd} winners</strong></div>
    <div><span>STATUS</span><strong>Live</strong></div>
   </div>
   <div class="project-footer"><span class="countdown" data-end="${p.ends}">00:00:00</span><button class="btn btn-outline mission-btn" onclick="openMission(${i})">View mission →</button></div>
  </article>`).join("");
 document.getElementById("activeCount").textContent=String(projects.length).padStart(2,"0");
}
function tick(){document.querySelectorAll(".countdown").forEach(x=>x.textContent=remaining(x.dataset.end))}
function openMission(i){
 alert(`${projects[i].name}\n\nThis premium frontend is ready for the real mission detail flow.\n\nNext backend layer: X verification → task completion → Submit → eligibility → automatic GTD draw.`);
}
function openModal(){document.getElementById("profileModal").classList.remove("hidden")}
function closeModal(){document.getElementById("profileModal").classList.add("hidden")}
["connectBtn","heroConnect","ctaConnect"].forEach(id=>document.getElementById(id).addEventListener("click",openModal));
document.getElementById("closeModal").addEventListener("click",closeModal);
document.getElementById("profileModal").addEventListener("click",e=>{if(e.target.id==="profileModal")closeModal()});
document.getElementById("demoLogin").addEventListener("click",()=>{alert("Demo mode: connect this button to X OAuth 2.0 on the backend.");closeModal()});
render();tick();setInterval(tick,1000);
