window.addEventListener("load", function () {

/* BGM管理 */
const titleBgm=new Audio("https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/%E5%B8%9D%E5%9B%BD%E3%81%AE%E9%BB%84%E6%98%8F.mp3");
const storyBgm=new Audio("https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/%E8%88%88%E4%BA%A1%E3%81%AE%E3%83%AC%E3%82%AF%E3%82%A4%E3%82%A8%E3%83%A0.mp3");
const intermissionBgm=new Audio("https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/%E3%82%A4%E3%83%B3%E3%82%BF%E3%83%BC%E3%83%9F%E3%83%83%E3%82%B7%E3%83%A7%E3%83%B3.mp3");
titleBgm.loop=true;storyBgm.loop=true;intermissionBgm.loop=true;titleBgm.volume=0.55;storyBgm.volume=0.5;intermissionBgm.volume=0.5;
let musicEnabled=false;let musicScene="title";
function stopTitleBgm(){titleBgm.pause();titleBgm.currentTime=0;}
function stopStoryBgm(){storyBgm.pause();storyBgm.currentTime=0;}
function stopIntermissionBgm(){intermissionBgm.pause();intermissionBgm.currentTime=0;}
function getSceneTrack(){return musicScene==="title"?titleBgm:musicScene==="intermission"?intermissionBgm:storyBgm;}
function stopAllBgm(){stopTitleBgm();stopStoryBgm();stopIntermissionBgm();}
function setMusicScene(scene){if(scene===musicScene){if(musicEnabled)getSceneTrack().play().catch(()=>{});return;}musicScene=scene;stopAllBgm();if(musicEnabled)getSceneTrack().play().catch(()=>{});}
function makeMusicButton(){const b=document.createElement("button");b.className="music-toggle";b.type="button";function update(){b.textContent="♫";b.title=musicEnabled?"BGM ON":"BGM OFF";b.setAttribute("aria-label",b.title);b.style.opacity=musicEnabled?"1":"0.55";}update();b.onclick=()=>{musicEnabled=!musicEnabled;if(musicEnabled)getSceneTrack().play().catch(()=>{});else stopAllBgm();update();};return b;}


const test=document.querySelector("#test");

if(!test){console.error("#test が見つかりません");return;}

test.innerHTML=`

<div id="game">

<h2>ミラのSRPG</h2>

<p id="turn">味方のターン</p>

<div id="mapViewport"><div id="map"></div></div>

<div id="actionButtons">

<button id="pendingMove" style="display:none">移動</button>

<button id="pendingAttack" style="display:none">攻撃対象選択</button>

<button id="pendingWait" style="display:none">待機</button>

<button id="systemButton" style="display:none">メニュー</button>

</div>

<div id="info">ユニットを選択してね</div>

<div id="miraPortraitPanel" aria-live="polite"></div>

</div>`;

const game=document.querySelector("#game");

const mapViewport=document.querySelector("#mapViewport");

const map=document.querySelector("#map");

const info=document.querySelector("#info");

const turnLabel=document.querySelector("#turn");

const pendingMoveButton=document.querySelector("#pendingMove");

const pendingAttackButton=document.querySelector("#pendingAttack");

const pendingWaitButton=document.querySelector("#pendingWait");

const systemButton=document.querySelector("#systemButton");

const style=document.createElement("style");

style.textContent=`

#game{position:relative;}

#mapViewport{position:relative;width:94%;max-width:900px;height:65vh;min-height:310px;max-height:700px;margin:0 auto;overflow:hidden;border:1px solid #777;border-radius:6px;background:#b8b5a8;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:grab;}

#mapViewport.panning{cursor:grabbing;}

#map{position:absolute;left:0;top:0;margin:0;overflow:visible;transform-origin:0 0;will-change:transform;touch-action:manipulation;}

#terrainBackground{position:absolute;left:0;top:0;width:100%;height:100%;z-index:1;pointer-events:none;background-color:#477b39;background-image:url("https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/refs/heads/main/a_high_resolution_top_down_oblique_pixel_art_rpg.png");background-size:150% 100%;background-position:left center;background-repeat:no-repeat;}

#actionButtons{display:flex;justify-content:center;align-items:center;gap:5px;width:94%;max-width:420px;margin:8px auto;}

#actionButtons button{flex:1;min-width:0;padding:9px 3px;font-size:11px;border-radius:6px;}

#actionButtons button:disabled{opacity:.35;filter:grayscale(1);}

#info{position:relative;z-index:15;width:94%;max-width:340px;box-sizing:border-box;margin:8px auto;padding:7px;background:rgba(255,255,255,.97);border:1px solid #777;border-radius:8px;color:#222;font-size:12px;line-height:1.3;min-height:35px;}

#info h3{font-size:14px;margin:4px 0;}

#info h4{font-size:12px;margin:4px 0;}

#info p{margin:4px 0;}

#info button{font-size:11px;padding:5px 7px;margin:2px;}

.unit-token{position:absolute!important;box-sizing:border-box!important;width:56px!important;height:44px!important;min-width:56px!important;max-width:56px!important;min-height:44px!important;max-height:44px!important;padding:0!important;margin:0!important;z-index:5;display:flex;align-items:center;justify-content:center;overflow:hidden;border-radius:7px;background:rgba(20,25,31,.88);border:1px solid rgba(255,255,255,.9);box-shadow:0 2px 5px #000b,inset 0 0 0 1px #0005;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}

.unit-token[data-side="ally"]{border-color:#8ec8ff;box-shadow:0 2px 5px #000b,inset 0 0 0 1px #2879db;}

.unit-token[data-side="enemy"]{border-color:#ffaaaa;box-shadow:0 2px 5px #000b,inset 0 0 0 1px #c62828;}

.unit-token.unit-acted{filter:brightness(.55) saturate(.7);}

.unit-content{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;line-height:1;pointer-events:none;color:#fff;font-weight:bold;width:100%;height:100%;overflow:hidden;text-shadow:1px 1px 2px #000,-1px -1px 2px #000;}

.unit-icon{font-size:19px;line-height:20px;max-height:21px;filter:drop-shadow(0 1px 2px #000);}

.unit-name{font-size:8px;line-height:9px;max-width:52px;overflow:hidden;white-space:nowrap;text-overflow:clip;}

.unit-hp{font-size:8px;line-height:9px;color:#fff;}

.unit-image{width:23px;height:23px;max-width:23px;max-height:23px;object-fit:contain;image-rendering:pixelated;}

.defense-mark{position:absolute;z-index:25;font-size:23px;line-height:25px;filter:drop-shadow(0 0 4px #fff) drop-shadow(0 2px 3px #000);pointer-events:none;transform:translateX(-50%);}

.battle-panel{display:flex;align-items:center;justify-content:space-between;gap:5px;margin:5px 0;padding:5px;border:2px solid #777;border-radius:8px;background:#fff;color:#222;}

.battle-side{width:42%;min-width:0;text-align:center;}

.battle-name{font-weight:bold;overflow-wrap:anywhere;margin-bottom:3px;font-size:10px;}

.hp-track{position:relative;width:100%;height:16px;background:#ddd;border:1px solid #777;border-radius:5px;overflow:hidden;box-sizing:border-box;}

.hp-fill{position:absolute;left:0;top:0;height:100%;transition:width 300ms ease;}

.hp-ally{background:#2879db;}

.hp-enemy{background:#e53935;}

@keyframes hpBlink{0%,100%{opacity:1;filter:brightness(1);}50%{opacity:.12;filter:brightness(2);}}

.hp-predicted{position:absolute;top:0;z-index:3;height:100%;animation:hpBlink .5s steps(2,end) infinite;background:repeating-linear-gradient(135deg,#fff 0,#fff 3px,#ffb300 3px,#ffb300 6px);border-left:2px solid #222;box-sizing:border-box;pointer-events:none;}

.battle-center{font-size:15px;font-weight:bold;text-align:center;}

.battle-hp-text{font-size:10px;margin-top:3px;}

@keyframes combatLunge{0%{transform:translateX(0) scale(1);}35%{transform:translateX(9px) scale(1.08);}100%{transform:translateX(0) scale(1);}}

@keyframes combatHit{0%,100%{transform:translateX(0);}20%{transform:translateX(-5px);}40%{transform:translateX(5px);}60%{transform:translateX(-4px);}80%{transform:translateX(3px);}}

@keyframes combatFloat{0%{opacity:0;transform:translate(-50%,8px) scale(.7);}15%{opacity:1;transform:translate(-50%,0) scale(1.15);}100%{opacity:0;transform:translate(-50%,-38px) scale(1);}}

.combat-number,.combat-miss{position:absolute;z-index:30;pointer-events:none;font-weight:900;-webkit-text-stroke:1px white;text-shadow:1px 2px 2px #0008;animation:combatFloat 950ms ease-out forwards;}

.combat-number{font-size:25px;color:#e53935;}

.combat-miss{font-size:20px;color:#2879db;}

.unit-token.combat-attacking{animation:combatLunge 380ms ease-in-out;}

.unit-token.combat-hit{animation:combatHit 420ms ease-in-out;}

@keyframes rangePulse{0%,100%{fill-opacity:.38;stroke-opacity:1;stroke-width:3.5;}50%{fill-opacity:.72;stroke-opacity:1;stroke-width:4.5;}}

.move-range-hex{fill:#0878ff;fill-opacity:.52;stroke:#fff;stroke-width:3.5;animation:rangePulse 1s ease-in-out infinite;filter:drop-shadow(0 0 3px #003cff) drop-shadow(0 0 7px #168cff);pointer-events:none;}

.attack-range-hex{fill:#ff2020;fill-opacity:.52;stroke:#fff;stroke-width:3.5;animation:rangePulse 1s ease-in-out infinite;animation-delay:-.5s;filter:drop-shadow(0 0 3px #a00000) drop-shadow(0 0 7px #ff3030);pointer-events:none;}

@keyframes battleHexPulse{0%,100%{opacity:.55;stroke-width:3;}50%{opacity:1;stroke-width:5;}}

.battle-hex-attacker{fill:#ff9800;fill-opacity:.28;stroke:#e65100;stroke-width:3;animation:battleHexPulse .65s ease-in-out infinite;pointer-events:none;}

.battle-hex-defender{fill:#29b6f6;fill-opacity:.28;stroke:#0277bd;stroke-width:3;animation:battleHexPulse .65s ease-in-out infinite;pointer-events:none;}

.battle-arrow{fill:none;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 3px #222);pointer-events:none;}

.battle-arrow.ally-arrow{stroke:#ff9800;}

.battle-arrow.enemy-arrow{stroke:#29b6f6;}

.counter-impact{font-size:25px;font-weight:bold;text-anchor:middle;dominant-baseline:middle;pointer-events:none;}

.story-overlay{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;box-sizing:border-box;padding:20px;background:rgba(10,16,27,.94);color:#fff;}

.story-panel{width:100%;max-width:420px;box-sizing:border-box;padding:24px 20px;border:1px solid #b9a16b;border-radius:12px;background:linear-gradient(160deg,#28364a,#111923);text-align:center;}

.story-panel h2{font-size:22px;color:#f0d99b;}

.story-panel p{font-size:16px;line-height:2;text-align:left;white-space:pre-line;}

.story-panel button{min-width:150px;padding:11px 20px;font-size:15px;border:1px solid #d5bd83;border-radius:7px;background:#d5bd83;color:#202020;font-weight:bold;}

#intermissionPanel{width:94%;max-width:520px;margin:12px auto;padding:14px 14px 92px;box-sizing:border-box;border:2px solid #a78b55;border-radius:10px;background:linear-gradient(160deg,#28364a,#111923);color:#fff;text-align:center;}

#intermissionPanel h3{font-size:19px;color:#f0d99b;margin:5px;}

#intermissionPanel p{font-size:12px;line-height:1.6;}

#intermissionPanel button{padding:9px 10px;margin:4px;border:1px solid #b9b6a1;border-radius:6px;background:#e4d2a6;color:#202020;font-weight:bold;font-size:12px;}

#intermissionPanel .intermission-main{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin:12px 0;}

#intermissionPanel .intermission-main button{min-height:42px;}

#intermissionPanel .intermission-start{width:90%;margin-top:12px;background:#d5bd83;font-size:15px;}

/* タイトル画面：タイトル文字を枠内に収める */

#titleScreen{position:fixed;inset:0;z-index:20000;background:#05070b;overflow-y:auto;display:flex;flex-direction:column;align-items:center;}
.title-art{width:100%;height:42vh;min-height:220px;max-height:420px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;background:#05070b;}
.title-background{display:block;width:100%;height:100%;object-fit:contain;object-position:center;}
.title-menu{width:min(88%,460px);display:flex;flex-direction:column;gap:9px;padding:14px 0 26px;box-sizing:border-box;}
.title-menu button{width:100%;min-height:48px;padding:10px 12px;border:1px solid #c8b17b;border-radius:7px;background:linear-gradient(140deg,#251817,#090b10);color:#e8d5a6;font-size:17px;letter-spacing:.08em;}
.title-menu button:active{background:#514126;}
.title-music{position:fixed;right:16px;bottom:calc(22px + env(safe-area-inset-bottom));top:auto;z-index:30000;width:58px;height:58px;border-radius:50%;border:2px solid #c8b17b;background:rgba(12,18,28,.96);color:#e8c879;font-size:30px;box-shadow:0 4px 14px #0009;display:flex;align-items:center;justify-content:center;}

/* オープニング：地図全体を表示し、文章を画面下部の字幕帯に置く */

.opening-overlay{display:flex;flex-direction:column;padding:0;background:#080e17;overflow:hidden;gap:0;}

.opening-map{position:relative;display:block;flex:0 0 43vh;width:100%;height:43vh;min-height:190px;max-height:360px;object-fit:contain;object-position:center center;z-index:0;opacity:1;background:#080e17;}

.opening-panel{position:relative;left:auto;right:auto;bottom:auto;flex:1;min-height:0;width:100%;max-width:none;margin:0;padding:12px 18px calc(84px + env(safe-area-inset-bottom));box-sizing:border-box;border:0;border-top:1px solid #c3a66c;border-radius:0;background:linear-gradient(180deg,rgba(17,25,35,.86),rgba(10,16,24,.97));box-shadow:0 -5px 24px #0009;text-align:center;z-index:2;overflow-y:auto;}

.opening-panel p{min-height:0;margin:7px 0 16px;font-size:17px;line-height:1.8;text-align:left;text-shadow:0 1px 3px #000;white-space:pre-line;}

.opening-controls{display:flex;justify-content:center;gap:10px;align-items:center;}

.opening-panel button{min-width:120px;padding:11px 16px;font-size:15px;}

.opening-panel button:disabled{opacity:.35;}

.music-toggle{position:fixed;right:16px;bottom:calc(22px + env(safe-area-inset-bottom));z-index:30000;width:58px;height:58px;min-width:0;padding:0;border-radius:50%;border:2px solid #c8b17b;background:rgba(12,18,28,.96);color:#e8c879;font-size:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px #0009;}
#intermissionPanel+.music-toggle,.music-toggle{box-sizing:border-box;appearance:none;-webkit-appearance:none;min-width:0;width:58px;height:58px;padding:0;margin:0;border-radius:50%;border:2px solid #c8b17b;background:rgba(12,18,28,.96);color:#e8c879;font-size:30px;line-height:1;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px #0009;}
.opening-panel{padding-bottom:calc(96px + env(safe-area-inset-bottom));}
.title-load-list{max-height:55vh;overflow-y:auto;text-align:left;margin:12px 0;}

.title-load-list button{width:100%;padding:9px;margin:4px 0;}

/* ミラ選択時の下部顔グラ・ステータス */
#miraPortraitPanel{display:none;position:fixed;left:0;right:0;bottom:0;z-index:25000;padding:7px 10px calc(7px + env(safe-area-inset-bottom));box-sizing:border-box;background:rgba(12,18,28,.97);border-top:1px solid #c8b17b;color:#f3e8cb;}
#miraPortraitPanel.visible{display:flex;align-items:center;gap:10px;}
#miraPortraitPanel img{width:82px;height:82px;flex:0 0 82px;object-fit:contain;object-position:center;border:1px solid #c8b17b;border-radius:6px;background:#111;}
#miraPortraitPanel .mira-status{min-width:0;flex:1;font-size:13px;line-height:1.5;}
#miraPortraitPanel .mira-name{font-weight:bold;font-size:15px;color:#e8c879;}
#miraPortraitPanel .mira-hp{margin-top:3px;font-weight:bold;}
#miraPortraitPanel .mira-hpbar{height:8px;margin-top:5px;border:1px solid #777;border-radius:5px;background:#333;overflow:hidden;}
#miraPortraitPanel .mira-hpfill{height:100%;background:#42a5f5;}
#game.has-mira-portrait #info{margin-bottom:112px;}
.unit-details-layout{display:flex;align-items:flex-start;gap:12px;}
.unit-details-text{flex:1;min-width:0;}
.unit-details-portrait{width:42%;max-width:180px;flex:0 0 42%;object-fit:contain;border:1px solid #c8b17b;border-radius:8px;background:#111;}
.unit-details-text p{margin:7px 0;}
@media(max-width:420px){.unit-details-portrait{width:38%;flex-basis:38%;max-width:140px;}}

`;

document.head.appendChild(style);

const units=[

{id:1,name:"ミラ",side:"ally",job:"機動歩兵",role:"captain",x:1,y:2,hp:20,maxHp:20,icon:"👑",moved:false,acted:false,waited:false,atk:6,def:3,agi:5,dex:6,move:1,range:1,skills:["指揮"],resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}},

{id:2,name:"重装兵",side:"ally",job:"ヘビーアーマー",x:0,y:3,hp:16,maxHp:16,icon:"🪖",moved:false,acted:false,waited:false,atk:7,def:6,agi:2,dex:4,move:1,range:1,skills:["防御"],resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}},

{id:3,name:"魔道士",side:"ally",job:"メイジ",x:2,y:3,hp:12,maxHp:12,icon:"🔮",moved:false,acted:false,waited:false,atk:8,def:2,agi:4,dex:6,move:1,range:2,skills:["魔法"],resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}},

{id:6,name:"騎兵",side:"ally",job:"キャバリア",x:0,y:1,hp:14,maxHp:14,icon:"🐎",moved:false,acted:false,waited:false,atk:6,def:3,agi:6,dex:5,move:2,range:1,skills:["突撃"],resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}},

{id:4,name:"敵隊長",side:"enemy",job:"ダークロード",role:"captain",x:9,y:5,hp:20,maxHp:20,icon:"💀",moved:false,acted:false,waited:false,atk:6,def:4,agi:4,dex:5,move:1,range:1,skills:["威圧"],personality:"commander",targetStyle:"captain",resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}},

{id:5,name:"敵兵",side:"enemy",job:"ソルジャー",x:8,y:4,hp:14,maxHp:14,icon:"⚔️",moved:false,acted:false,waited:false,atk:5,def:3,agi:3,dex:4,move:1,range:1,skills:["なし"],personality:"hunter",targetStyle:"weakest",resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}},

{id:7,name:"敵魔道士",side:"enemy",job:"ダークメイジ",x:10,y:2,hp:12,maxHp:12,icon:"🧙",moved:false,acted:false,waited:false,atk:8,def:2,agi:4,dex:6,move:1,range:2,skills:["魔法"],personality:"mage",targetStyle:"weakest",resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}}

];

const initialUnitStates=units.map(u=>({...u,resistances:{...u.resistances},skills:[...u.skills]}));

const cols=12,rows=8,w=56,h=44,dx=42,dy=44;

let selected=null,selectedEnemy=null,currentTurn="ally",turn=1;

let pendingMove=null,moveMode=false,attackMode=false,menuOpen=false;

let reaction=false,combatAnimating=false,battleEnded=false;

let enemyQueue=[],enemyQueueIndex=0,enemyAIActive=false;

let lastTapUnitId=null,battleVisual=null;

let systemMenuOpen=false,intermissionOpen=false,intermissionReturnMode=false;

let stageNumber=1,cameraBusy=false,cameraSkipRequested=false;

const CRITICAL_RATE=10,CRITICAL_MULTIPLIER=2;

const SAVE_KEY="mira_srpg_save_slots_v1";

const mapWidth=dx*(cols-1)+w;

const mapHeight=(rows-1)*dy+h+h/2;

Object.assign(map.style,{width:mapWidth+"px",height:mapHeight+"px",position:"absolute",left:"0",top:"0",overflow:"visible",touchAction:"manipulation"});

const terrainBackground=document.createElement("div");

terrainBackground.id="terrainBackground";

map.appendChild(terrainBackground);

let mapOffsetX=0,mapOffsetY=0;

let touchPanActive=false,touchPanMoved=false,touchPanLastX=0,touchPanLastY=0;

let mousePanning=false,mouseStartX=0,mouseStartY=0,mouseOriginX=0,mouseOriginY=0;

let suppressNextClick=false;

function clampMapOffset(){

const vw=mapViewport.clientWidth,vh=mapViewport.clientHeight;

mapOffsetX=mapWidth<=vw?(vw-mapWidth)/2:Math.max(vw-mapWidth,Math.min(0,mapOffsetX));

mapOffsetY=mapHeight<=vh?(vh-mapHeight)/2:Math.max(mapHeight*-1+vh,Math.min(0,mapOffsetY));

map.style.transform=`translate(${mapOffsetX}px,${mapOffsetY}px)`;

}

function centerMap(){

mapOffsetX=(mapViewport.clientWidth-mapWidth)/2;

mapOffsetY=(mapViewport.clientHeight-mapHeight)/2;

clampMapOffset();

}

function centerMapOnUnit(unit){

if(!unit)return;

const p=position(unit.x,unit.y);

mapOffsetX=mapViewport.clientWidth/2-(p.x+28);

mapOffsetY=mapViewport.clientHeight/2-(p.y+22);

clampMapOffset();

}

function animateCameraTo(targetX,targetY,duration){

return new Promise(resolve=>{

const startX=mapOffsetX,startY=mapOffsetY,start=performance.now();

function frame(now){

if(cameraSkipRequested){resolve();return;}

const t=Math.min(1,(now-start)/duration);

const eased=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;

mapOffsetX=startX+(targetX-startX)*eased;

mapOffsetY=startY+(targetY-startY)*eased;

clampMapOffset();

if(t<1)requestAnimationFrame(frame);else resolve();

}

requestAnimationFrame(frame);

});

}

game.addEventListener("click",function(e){

if(!cameraBusy)return;

e.preventDefault();e.stopPropagation();

if(e.stopImmediatePropagation)e.stopImmediatePropagation();

cameraSkipRequested=true;

},{capture:true});

function getTouchCenter(touches){

return{x:(touches[0].clientX+touches[1].clientX)/2,y:(touches[0].clientY+touches[1].clientY)/2};

}

mapViewport.addEventListener("touchstart",function(e){

if(e.touches.length!==2)return;

e.preventDefault();

const c=getTouchCenter(e.touches);

touchPanActive=true;touchPanMoved=false;touchPanLastX=c.x;touchPanLastY=c.y;

},{passive:false});

mapViewport.addEventListener("touchmove",function(e){

if(!touchPanActive||e.touches.length!==2)return;

e.preventDefault();

const c=getTouchCenter(e.touches),mx=c.x-touchPanLastX,my=c.y-touchPanLastY;

if(Math.abs(mx)+Math.abs(my)>2)touchPanMoved=true;

mapOffsetX+=mx;mapOffsetY+=my;touchPanLastX=c.x;touchPanLastY=c.y;clampMapOffset();

},{passive:false});

mapViewport.addEventListener("touchend",function(){if(!touchPanActive)return;

touchPanActive=false;

if(touchPanMoved){suppressNextClick=true;setTimeout(()=>{suppressNextClick=false;},450);}

});

mapViewport.addEventListener("touchcancel",()=>{touchPanActive=false;});

let blankPanPointer=null,blankPanStartX=0,blankPanStartY=0,blankPanOriginX=0,blankPanOriginY=0,blankPanMoved=false;
mapViewport.addEventListener("pointerdown",function(e){
if(e.pointerType==="mouse"||e.button!==0)return;
if(e.target!==mapViewport&&e.target.id!=="terrainBackground")return;
blankPanPointer=e.pointerId;blankPanStartX=e.clientX;blankPanStartY=e.clientY;blankPanOriginX=mapOffsetX;blankPanOriginY=mapOffsetY;blankPanMoved=false;
},{passive:true});
mapViewport.addEventListener("pointermove",function(e){
if(blankPanPointer!==e.pointerId)return;
const dx=e.clientX-blankPanStartX,dy=e.clientY-blankPanStartY;
if(!blankPanMoved&&Math.abs(dx)+Math.abs(dy)>5){blankPanMoved=true;mapViewport.classList.add("panning");}
if(blankPanMoved){mapOffsetX=blankPanOriginX+dx;mapOffsetY=blankPanOriginY+dy;clampMapOffset();}
});
function finishBlankPan(e){
if(blankPanPointer!==e.pointerId)return;
if(blankPanMoved){suppressNextClick=true;setTimeout(()=>{suppressNextClick=false;},450);mapViewport.classList.remove("panning");}
blankPanPointer=null;
blankPanMoved=false;
}
mapViewport.addEventListener("pointerup",finishBlankPan);
mapViewport.addEventListener("pointercancel",finishBlankPan);

mapViewport.addEventListener("mousedown",function(e){

if(e.button!==1)return;

e.preventDefault();mousePanning=true;mouseStartX=e.clientX;mouseStartY=e.clientY;mouseOriginX=mapOffsetX;mouseOriginY=mapOffsetY;mapViewport.classList.add("panning");

});

document.addEventListener("mousemove",function(e){

if(!mousePanning)return;

mapOffsetX=mouseOriginX+(e.clientX-mouseStartX);mapOffsetY=mouseOriginY+(e.clientY-mouseStartY);clampMapOffset();

});

document.addEventListener("mouseup",function(e){

if(!mousePanning||e.button!==1)return;

mousePanning=false;mapViewport.classList.remove("panning");

});

mapViewport.addEventListener("auxclick",e=>{if(e.button===1)e.preventDefault();});

window.addEventListener("resize",()=>{if(!cameraBusy)clampMapOffset();});

centerMap();

const svgNS="http://www.w3.org/2000/svg";

const board=document.createElementNS(svgNS,"svg");

board.setAttribute("viewBox",`0 0 ${mapWidth} ${mapHeight}`);

board.setAttribute("width",mapWidth);board.setAttribute("height",mapHeight);

Object.assign(board.style,{position:"absolute",left:"0",top:"0",width:mapWidth+"px",height:mapHeight+"px",pointerEvents:"auto",zIndex:"2",display:"block"});

map.appendChild(board);

const battleOverlay=document.createElementNS(svgNS,"svg");

battleOverlay.setAttribute("viewBox",`0 0 ${mapWidth} ${mapHeight}`);

battleOverlay.setAttribute("width",mapWidth);battleOverlay.setAttribute("height",mapHeight);

Object.assign(battleOverlay.style,{position:"absolute",left:"0",top:"0",width:mapWidth+"px",height:mapHeight+"px",pointerEvents:"none",zIndex:"20",overflow:"visible"});

map.appendChild(battleOverlay);

const points=[[14,0],[42,0],[56,22],[42,44],[14,44],[0,22]];

function position(x,y){return{x:x*dx,y:y*dy+(x%2)*(h/2)};}

function polygonPoints(x,y){

const p=position(x,y);

return points.map(([px,py])=>`${p.x+px},${p.y+py}`).join(" ");

}

function getNeighbors(unit){

const offsets=unit.x%2===0?[[0,-1],[0,1],[-1,0],[-1,-1],[1,0],[1,-1]]:[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];

return offsets.map(([ox,oy])=>({x:unit.x+ox,y:unit.y+oy})).filter(c=>c.x>=0&&c.x<cols&&c.y>=0&&c.y<rows);

}

function getDistance(x1,y1,x2,y2){

const queue=[{x:x1,y:y1,d:0}],visited=new Set([`${x1},${y1}`]);

while(queue.length){

const c=queue.shift();if(c.x===x2&&c.y===y2)return c.d;

getNeighbors(c).forEach(n=>{const key=`${n.x},${n.y}`;if(!visited.has(key)){visited.add(key);queue.push({x:n.x,y:n.y,d:c.d+1});}});

}

return Infinity;

}

function getUnitAt(x,y){return units.find(u=>u.x===x&&u.y===y&&u.hp>0)||null;}

function occupied(x,y,except){return units.some(u=>u!==except&&u.x===x&&u.y===y&&u.hp>0);}

function getReachableCells(unit){

const queue=[{x:unit.x,y:unit.y,d:0}],visited=new Set([`${unit.x},${unit.y}`]),reachable=[];

while(queue.length){

const c=queue.shift();if(c.d>=unit.move)continue;

getNeighbors(c).forEach(n=>{

const key=`${n.x},${n.y}`;

if(visited.has(key)||occupied(n.x,n.y,unit))return;

visited.add(key);reachable.push({x:n.x,y:n.y});queue.push({x:n.x,y:n.y,d:c.d+1});

});

}

return reachable;

}

function isMage(unit){return unit.name==="魔道士"||unit.name==="敵魔道士";}

function isUnitInAttackRange(a,d){

if(!a||!d)return false;

const distance=getDistance(a.x,a.y,d.x,d.y);

if(isMage(a))return distance===2;

return distance>=1&&distance<=a.range;

}

function isMoveTarget(x,y){

if(!selected||selected.side!=="ally"||selected.moved||selected.acted||selected.waited||currentTurn!=="ally"||menuOpen||pendingMove||combatAnimating||battleEnded)return false;

return getReachableCells(selected).some(c=>c.x===x&&c.y===y);

}

function isAttackRangeCell(x,y){

if(!selected||selected.acted||selected.waited||battleVisual||battleEnded)return false;

const target=getUnitAt(x,y);if(target&&target.side===selected.side)return false;

const d=getDistance(selected.x,selected.y,x,y);

if(isMage(selected))return d===2;

return d>=1&&d<=selected.range;

}

function isAllyAttackCell(x,y){

if(!selected||selected.side!=="ally"||selected.acted||selected.waited)return false;

const target=getUnitAt(x,y);

return Boolean(target&&target.side==="enemy"&&isUnitInAttackRange(selected,target));

}

function isEnemyAttackCell(enemy,x,y){

if(!enemy||enemy.side!=="enemy")return false;

const target=getUnitAt(x,y);if(target&&target.side!=="ally")return false;

const d=getDistance(enemy.x,enemy.y,x,y);

if(isMage(enemy))return d===2;

return d>=1&&d<=enemy.range;

}

function hasAttackTargets(unit){

if(!unit||unit.hp<=0)return false;

const side=unit.side==="ally"?"enemy":"ally";

return units.some(t=>t.hp>0&&t.side===side&&isUnitInAttackRange(unit,t));

}

function drawBattleArrow(from,to,color,extraClass){

const a=position(from.x,from.y),d=position(to.x,to.y),sx=a.x+28,sy=a.y+22,ex=d.x+28,ey=d.y+22;

const defs=document.createElementNS(svgNS,"defs"),marker=document.createElementNS(svgNS,"marker");

const markerId="battleArrowHead"+battleOverlay.querySelectorAll("marker").length;

marker.setAttribute("id",markerId);marker.setAttribute("markerWidth","12");marker.setAttribute("markerHeight","12");marker.setAttribute("refX","11");marker.setAttribute("refY","6");marker.setAttribute("orient","auto");marker.setAttribute("markerUnits","userSpaceOnUse");

const head=document.createElementNS(svgNS,"path");head.setAttribute("d","M0,0 L12,6 L0,12 Z");head.setAttribute("fill",color);marker.appendChild(head);defs.appendChild(marker);battleOverlay.appendChild(defs);

const line=document.createElementNS(svgNS,"line");

line.setAttribute("x1",sx);line.setAttribute("y1",sy);line.setAttribute("x2",ex);line.setAttribute("y2",ey);line.setAttribute("class","battle-arrow "+extraClass);line.setAttribute("stroke",color);line.setAttribute("marker-end",`url(#${markerId})`);battleOverlay.appendChild(line);return line;

}

function drawCounterArrow(from,to,color,delay){

const a=position(from.x,from.y),d=position(to.x,to.y),sx=a.x+28,sy=a.y+22,ex=d.x+28,ey=d.y+22,midX=(sx+ex)/2,midY=(sy+ey)/2;

const line=drawBattleArrow(from,to,color,"counter-arrow");line.setAttribute("x2",sx);

[["x2",`${sx};${midX};${midX};${sx}`],["y2",`${sy};${midY};${midY};${sy}`],["opacity","0;1;1;0"]].forEach(([attr,values])=>{

const anim=document.createElementNS(svgNS,"animate");anim.setAttribute("attributeName",attr);anim.setAttribute("values",values);anim.setAttribute("keyTimes",attr==="opacity"?"0;.08;.78;1":"0;0.55;0.78;1");anim.setAttribute("dur","1.8s");anim.setAttribute("begin",delay+"s");anim.setAttribute("repeatCount","indefinite");line.appendChild(anim);

});

return{midX,midY};

}

function drawBattleVisual(){

if(!battleVisual)return;

const a=battleVisual.attacker,d=battleVisual.defender;if(!a||!d||a.hp<=0||d.hp<=0)return;

const ah=document.createElementNS(svgNS,"polygon");ah.setAttribute("points",polygonPoints(a.x,a.y));ah.setAttribute("class","battle-hex-attacker");board.appendChild(ah);

const dh=document.createElementNS(svgNS,"polygon");dh.setAttribute("points",polygonPoints(d.x,d.y));dh.setAttribute("class","battle-hex-defender");board.appendChild(dh);

if(battleVisual.showArrows===false)return;

const color=a.side==="ally"?"#ff9800":"#29b6f6";

if(battleVisual.response==="counter"){

const center=drawCounterArrow(a,d,color,0);drawCounterArrow(d,a,d.side==="ally"?"#ff9800":"#29b6f6",0);

const group=document.createElementNS(svgNS,"g");group.setAttribute("transform",`translate(${center.midX},${center.midY})`);

const impact=document.createElementNS(svgNS,"text");impact.setAttribute("x","0");impact.setAttribute("y","0");impact.setAttribute("class","counter-impact");impact.textContent="💥";

const scale=document.createElementNS(svgNS,"animateTransform");scale.setAttribute("attributeName","transform");scale.setAttribute("type","scale");scale.setAttribute("values","0.2;1.35;1;0.65;0.2");scale.setAttribute("keyTimes","0;0.68;0.78;0.92;1");scale.setAttribute("dur","1.8s");scale.setAttribute("repeatCount","indefinite");

const opacity=document.createElementNS(svgNS,"animate");opacity.setAttribute("attributeName","opacity");opacity.setAttribute("values","0;0;1;1;0");opacity.setAttribute("keyTimes","0;0.55;0.68;0.78;1");opacity.setAttribute("dur","1.8s");opacity.setAttribute("repeatCount","indefinite");

impact.appendChild(scale);impact.appendChild(opacity);group.appendChild(impact);battleOverlay.appendChild(group);return;

}

const line=drawBattleArrow(a,d,color,a.side==="ally"?"ally-arrow":"enemy-arrow"),ap=position(a.x,a.y),dp=position(d.x,d.y),sx=ap.x+28,sy=ap.y+22,ex=dp.x+28,ey=dp.y+22;

[["x2",`${sx};${ex};${ex};${sx}`],["y2",`${sy};${ey};${ey};${sy}`],["opacity","0;1;1;0"]].forEach(([attr,values])=>{

const anim=document.createElementNS(svgNS,"animate");anim.setAttribute("attributeName",attr);anim.setAttribute("values",values);anim.setAttribute("keyTimes",attr==="opacity"?"0;0.12;0.78;1":"0;0.72;0.9;1");anim.setAttribute("dur","1.25s");anim.setAttribute("repeatCount","indefinite");line.appendChild(anim);

});

}

function drawBoard(){

board.innerHTML="";battleOverlay.innerHTML="";

for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){

const poly=document.createElementNS(svgNS,"polygon");poly.setAttribute("points",polygonPoints(x,y));poly.dataset.x=x;poly.dataset.y=y;poly.setAttribute("fill","transparent");poly.setAttribute("stroke","#777");poly.setAttribute("stroke-width","1");poly.style.pointerEvents="auto";board.appendChild(poly);

}

if(selected&&selected.side==="ally"&&!pendingMove&&!battleVisual&&!battleEnded&&!selected.moved&&!selected.acted&&!selected.waited&&currentTurn==="ally"&&!menuOpen&&!attackMode){

for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(isMoveTarget(x,y)){const hex=document.createElementNS(svgNS,"polygon");hex.setAttribute("points",polygonPoints(x,y));hex.setAttribute("class","move-range-hex");board.appendChild(hex);}

}

if(selected&&selected.side==="ally"&&!battleVisual&&!battleEnded&&!menuOpen&&!selected.acted&&!selected.waited&&currentTurn==="ally"){

for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(isAttackRangeCell(x,y)){const hex=document.createElementNS(svgNS,"polygon");hex.setAttribute("points",polygonPoints(x,y));hex.setAttribute("class","attack-range-hex");board.appendChild(hex);}

}

if(selectedEnemy&&selectedEnemy.hp>0&&!battleVisual&&!battleEnded&&!menuOpen&&currentTurn==="ally"){

getReachableCells(selectedEnemy).forEach(c=>{const hex=document.createElementNS(svgNS,"polygon");hex.setAttribute("points",polygonPoints(c.x,c.y));hex.setAttribute("class","move-range-hex");board.appendChild(hex);});

for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(isEnemyAttackCell(selectedEnemy,x,y)){const hex=document.createElementNS(svgNS,"polygon");hex.setAttribute("points",polygonPoints(x,y));hex.setAttribute("class","attack-range-hex");board.appendChild(hex);}

}

if(selected){const s=document.createElementNS(svgNS,"polygon");s.setAttribute("points",polygonPoints(selected.x,selected.y));s.setAttribute("stroke",pendingMove?"#e53935":"#e5a000");s.setAttribute("fill","none");s.setAttribute("stroke-width","4");s.style.pointerEvents="none";board.appendChild(s);}

if(selectedEnemy&&selectedEnemy.hp>0){const s=document.createElementNS(svgNS,"polygon");s.setAttribute("points",polygonPoints(selectedEnemy.x,selectedEnemy.y));s.setAttribute("stroke","#1565c0");s.setAttribute("fill","none");s.setAttribute("stroke-width","4");s.style.pointerEvents="none";board.appendChild(s);}

drawBattleVisual();

}

function drawUnits(){

map.querySelectorAll(".unit-token,.defense-mark").forEach(el=>el.remove());

units.forEach(unit=>{

if(unit.hp<=0)return;

const p=position(unit.x,unit.y),token=document.createElement("div");

token.className="unit-token";if(unit.acted||unit.waited)token.classList.add("unit-acted");

token.dataset.x=unit.x;token.dataset.y=unit.y;token.dataset.unitId=unit.id;token.dataset.side=unit.side;token.style.left=p.x+"px";token.style.top=p.y+"px";token.style.width="56px";token.style.height="44px";

const visual=unit.image?`<img class="unit-image" src="${unit.image}" alt="">`:`<div class="unit-icon">${unit.icon}</div>`;

token.innerHTML=`<div class="unit-content">${visual}<div class="unit-name">${unit.id===1?"ミラ":unit.name}</div><div class="unit-hp">${unit.hp}/${unit.maxHp}</div></div>`;map.appendChild(token);

const show=battleVisual&&battleVisual.defender&&battleVisual.defender.id===unit.id&&(battleVisual.response==="defend"||battleVisual.response==="skill");

if(show){const shield=document.createElement("div");shield.className="defense-mark";shield.textContent="🛡️";shield.style.left=(p.x+28)+"px";shield.style.top=(p.y-9)+"px";map.appendChild(shield);}

});

}

const MIRA_PORTRAIT_URLS={
healthy:"https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/mira_portrait_healthy.webp",
mild:"https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/mira_portrait_mild.webp",
severe:"https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/mira_portrait_severe.webp"
};
function getMiraPortraitState(unit){
const damage=Math.max(0,unit.maxHp-unit.hp),ratio=unit.maxHp>0?damage/unit.maxHp:0;
if(ratio>=0.70)return "severe";
if(ratio>=0.20)return "mild";
return "healthy";
}
function updateMiraPortraitPanel(){
const panel=document.querySelector("#miraPortraitPanel");if(!panel)return;
const displayUnit=pendingMove?pendingMove.unit:selected;
if(!displayUnit||displayUnit.id!==1||displayUnit.hp<=0){panel.classList.remove("visible");game.classList.remove("has-mira-portrait");panel.innerHTML="";return;}
const state=getMiraPortraitState(displayUnit),src=MIRA_PORTRAIT_URLS[state],pct=Math.max(0,Math.min(100,displayUnit.hp/displayUnit.maxHp*100));
const stateLabel=state==="healthy"?"無傷":state==="mild"?"軽症":"重症";
panel.innerHTML=`<img src="${src}" alt="ミラ・ローゼン ${stateLabel}"><div class="mira-status"><div class="mira-name">ミラ・ローゼン 機動歩兵</div><div class="mira-hp">HP ${displayUnit.hp}/${displayUnit.maxHp}　${stateLabel}</div><div class="mira-hpbar"><div class="mira-hpfill" style="width:${pct}%"></div></div></div>`;
panel.classList.add("visible");game.classList.add("has-mira-portrait");
}

function refresh(){

drawBoard();drawUnits();

const actionUnit=pendingMove?pendingMove.unit:selected;

const canAct=Boolean(actionUnit&&actionUnit.side==="ally"&&actionUnit.hp>0&&!actionUnit.acted&&!actionUnit.waited&&currentTurn==="ally"&&!battleEnded&&!combatAnimating&&!reaction&&!enemyAIActive);

const canMove=Boolean(canAct&&!pendingMove&&!actionUnit.moved),showActions=Boolean(canAct&&(pendingMove||selected));

document.querySelector("#actionButtons").style.display=showActions?"flex":"none";

pendingMoveButton.style.display=canMove?"inline-block":"none";pendingAttackButton.style.display=showActions?"inline-block":"none";pendingAttackButton.textContent="攻撃対象選択";pendingWaitButton.style.display=showActions?"inline-block":"none";systemButton.style.display=showActions?"inline-block":"none";

pendingMoveButton.disabled=!canMove;pendingAttackButton.disabled=!showActions||!hasAttackTargets(actionUnit);pendingWaitButton.disabled=!showActions;systemButton.disabled=!showActions;systemButton.textContent="メニュー";

turnLabel.textContent=currentTurn==="ally"?"味方のターン":"敵のターン";

updateMiraPortraitPanel();

}

function animateUnit(unit,className){

const token=map.querySelector(`.unit-token[data-unit-id="${unit.id}"]`);if(!token)return;token.classList.remove(className);void token.offsetWidth;token.classList.add(className);

}

function showCombatEffect(unit,value,miss){

const p=position(unit.x,unit.y),effect=document.createElement("div");effect.className=miss?"combat-miss":"combat-number";effect.textContent=miss?"MISS":"-"+value;effect.style.left=(p.x+28)+"px";effect.style.top=(p.y-5)+"px";map.appendChild(effect);setTimeout(()=>effect.remove(),1000);

}

function clearBattleVisual(){

battleVisual=null;board.querySelectorAll(".battle-hex-attacker,.battle-hex-defender").forEach(el=>el.remove());battleOverlay.innerHTML="";

}

function cancelMove(){

if(!pendingMove)return;

const unit=pendingMove.unit;unit.x=pendingMove.fromX;unit.y=pendingMove.fromY;unit.moved=false;pendingMove=null;moveMode=false;attackMode=false;menuOpen=false;selected=unit;selectedEnemy=null;systemMenuOpen=false;clearBattleVisual();info.innerHTML=`<p>${unit.name}は元の位置に戻った。</p>`;refresh();

}

function askEndTurnIfAllActed(){

if(currentTurn!=="ally"||pendingMove||battleEnded||combatAnimating)return;

const allies=units.filter(u=>u.side==="ally"&&u.hp>0);

if(!allies.length||!allies.every(u=>u.acted||u.waited))return;

if(confirm("味方全員が行動済みです。ターンを終了しますか？"))startEnemyTurn();

else{info.innerHTML="<p>味方全員が行動済みです。システムメニューからターン終了できます。</p>";refresh();}

}

function finishMoveAndWait(){

if(!pendingMove)return;

const unit=pendingMove.unit;unit.moved=true;unit.acted=true;unit.waited=true;pendingMove=null;moveMode=false;attackMode=false;menuOpen=false;selected=null;selectedEnemy=null;systemMenuOpen=false;clearBattleVisual();info.innerHTML=`<p>${unit.name}は移動して待機した。</p>`;refresh();askEndTurnIfAllActed();

}

function showDetails(unit){

if(!unit)return;

const portraitMarkup=unit.id===1?`<img class="unit-details-portrait" src="${MIRA_PORTRAIT_URLS[getMiraPortraitState(unit)]}" alt="ミラ・ローゼン">`:"";
const textMarkup=`<div class="unit-details-text"><h3>${unit.icon} ${unit.id===1?"ミラ・ローゼン":unit.name}</h3><p>兵種：${unit.job}</p><p>HP：${unit.hp}/${unit.maxHp}</p><p>攻撃：${unit.atk}　防御：${unit.def}</p><p>速さ：${unit.agi}　技量：${unit.dex}</p><p>移動：${unit.move}　射程：${unit.range}</p><p>スキル：${unit.skills.join("、")}</p><button id="detailClose">閉じる</button></div>`;
info.innerHTML=unit.id===1?`<div class="unit-details-layout">${textMarkup}${portraitMarkup}</div>`:textMarkup;
menuOpen=true;attackMode=false;

document.querySelector("#detailClose").onclick=()=>{

menuOpen=false;

if(unit.side==="enemy"){selectedEnemy=unit;selected=null;info.innerHTML="<p>敵の能力を確認した。</p>";}

else{selected=unit;info.innerHTML="ユニットを選択してね";}

refresh();

};

refresh();

}

function exitAttackSelection(){

attackMode=false;clearBattleVisual();selectedEnemy=null;menuOpen=false;

if(pendingMove){selected=pendingMove.unit;info.innerHTML=`<p>${selected.name}：攻撃選択を取り消した。</p>`;}

else info.innerHTML="ユニットを選択してね";

refresh();

}

function closeMenuByEmptyTap(){

if(pendingMove){if(attackMode){exitAttackSelection();return;}cancelMove();return;}

menuOpen=false;moveMode=false;attackMode=false;selected=null;selectedEnemy=null;systemMenuOpen=false;lastTapUnitId=null;clearBattleVisual();info.innerHTML="ユニットを選択してね";refresh();

}

function showActionMenu(unit){

if(!unit||unit.hp<=0)return;

selected=unit;selectedEnemy=null;menuOpen=true;moveMode=false;attackMode=false;systemMenuOpen=false;clearBattleVisual();

const canMove=!unit.moved&&!unit.acted&&!unit.waited,canAct=!unit.acted&&!unit.waited;

info.innerHTML=`<h3>${unit.icon} ${unit.name}</h3><p>HP：${unit.hp}/${unit.maxHp}</p><p>攻撃：${unit.atk}　防御：${unit.def}</p>

<button id="actMove" ${canMove?"":"disabled"}>移動</button><button id="actAttack" ${canAct?"":"disabled"}>攻撃対象選択</button>

<button id="actSkill" ${canAct?"":"disabled"}>スキル</button><button id="actItem" ${canAct?"":"disabled"}>アイテム</button>

<button id="actDetails">能力確認</button><button id="actWait">待機</button><button id="actCancel">キャンセル</button>`;

document.querySelector("#actMove").onclick=()=>{if(!canMove)return;menuOpen=false;moveMode=true;attackMode=false;info.innerHTML=`<p>${unit.name}：青い範囲から移動先を選んでね。</p>`;refresh();};

document.querySelector("#actAttack").onclick=()=>{if(canAct)showAttackMenu(unit);};

document.querySelector("#actSkill").onclick=()=>{if(canAct)showSkillMenu(unit);};

document.querySelector("#actItem").onclick=()=>{if(canAct)showItemMenu(unit);};

document.querySelector("#actDetails").onclick=()=>showDetails(unit);

document.querySelector("#actWait").onclick=()=>{

if(pendingMove)finishMoveAndWait();

else{unit.acted=true;unit.waited=true;selected=null;menuOpen=false;clearBattleVisual();info.innerHTML=`<p>${unit.name}は待機した。</p>`;refresh();askEndTurnIfAllActed();}

};

document.querySelector("#actCancel").onclick=()=>{

clearBattleVisual();

if(pendingMove)cancelMove();

else{menuOpen=false;selected=null;selectedEnemy=null;info.innerHTML="ユニットを選択してね";refresh();}

};

refresh();

}

function showAttackMenu(unit){

selected=unit;menuOpen=false;moveMode=false;attackMode=true;selectedEnemy=null;clearBattleVisual();

info.innerHTML=`<p>${unit.name}：攻撃する敵を選んでね。</p><button id="attackCancel">戻る</button>`;

document.querySelector("#attackCancel").onclick=()=>{

if(pendingMove)exitAttackSelection();

else{attackMode=false;showActionMenu(unit);}

};

refresh();

}

function showSkillMenu(unit){

menuOpen=true;attackMode=false;moveMode=false;clearBattleVisual();

let html=`<h3>${unit.name}のスキル</h3>`;

unit.skills.forEach((skill,i)=>{html+=`<button data-skill="${i}">${skill}</button>`;});

html+=`<button id="skillBack">戻る</button>`;info.innerHTML=html;

info.querySelectorAll("[data-skill]").forEach(button=>{

button.onclick=()=>{

const skill=unit.skills[Number(button.dataset.skill)];

if(skill==="指揮"){unit.acted=true;unit.waited=true;selected=null;menuOpen=false;pendingMove=null;info.innerHTML="<p>隊長は味方を鼓舞した。</p>";refresh();askEndTurnIfAllActed();return;}

if(skill==="防御"){unit.defending=true;unit.acted=true;unit.waited=true;selected=null;menuOpen=false;pendingMove=null;info.innerHTML="<p>重装兵は防御態勢を取った。</p>";refresh();askEndTurnIfAllActed();return;}

if(skill==="魔法"||skill==="突撃")showAttackMenu(unit);

};

});

document.querySelector("#skillBack").onclick=()=>showActionMenu(unit);refresh();

}

function showItemMenu(unit){

menuOpen=true;clearBattleVisual();info.innerHTML=`<h3>アイテム</h3><p>使用できるアイテムはありません。</p><button id="itemBack">戻る</button>`;

document.querySelector("#itemBack").onclick=()=>showActionMenu(unit);refresh();

}

function calculateHit(attacker,defender){return Math.max(20,Math.min(95,75+(attacker.dex-defender.agi)*3));}

function calculateDamage(attacker,defender){return Math.max(1,attacker.atk-defender.def);}

function calculateEvadeChance(attacker,defender){return Math.max(10,Math.min(70,30+(defender.agi-attacker.dex)*5));}

function chooseEnemyReaction(attacker,defender){

if(isUnitInAttackRange(defender,attacker))return "counter";

return calculateEvadeChance(attacker,defender)>=40?"evade":"defend";

}

function getCombatPrediction(attacker,defender,response){

const hit=calculateHit(attacker,defender);let damage=calculateDamage(attacker,defender);

if(response==="defend"||response==="skill")damage=Math.max(1,Math.floor(damage/2));

const evadeChance=response==="evade"?calculateEvadeChance(attacker,defender):0;

const canCounter=defender.hp>0&&isUnitInAttackRange(defender,attacker);

const counterDamage=response==="counter"&&canCounter?calculateDamage(defender,attacker):0;

return{hit,damage,evadeChance,counterDamage,canCounter};

}

function hpBarHTML(unit,predictedDamage){

const percent=Math.max(0,unit.hp/unit.maxHp*100),predicted=Math.max(0,Math.min(percent,predictedDamage/unit.maxHp*100));

return `<div class="hp-track"><div class="hp-fill ${unit.side==="ally"?"hp-ally":"hp-enemy"}" style="width:${percent}%"></div>${predictedDamage>0?`<div class="hp-predicted" style="left:${Math.max(0,percent-predicted)}%;width:${predicted}%"></div>`:""}</div><div class="battle-hp-text">${unit.hp}/${unit.maxHp}${predictedDamage>0?` → ${Math.max(0,unit.hp-predictedDamage)}`:""}</div>`;

}

function battlePanelHTML(attacker,defender,prediction){

return `<div class="battle-panel"><div class="battle-side"><div class="battle-name">${attacker.icon}${attacker.name}</div>${hpBarHTML(attacker,prediction.counterDamage)}<div>攻撃 ${attacker.atk}</div></div><div class="battle-center">VS</div><div class="battle-side"><div class="battle-name">${defender.icon}${defender.name}</div>${hpBarHTML(defender,prediction.damage)}<div>攻撃 ${defender.atk}</div></div></div>`;

}

function predictionHTML(prediction,response,attacker){

let reactionText="";

if(attacker.side==="ally"){

if(response==="counter")reactionText="<p>敵の対応：反撃</p>";

else if(response==="defend")reactionText="<p>敵の対応：防御（ダメージ半減）</p>";

else if(response==="evade")reactionText="<p>敵の対応：回避</p>";

}

if(response==="evade")return `${reactionText}<p>回避率：${prediction.evadeChance}％　通常命中率：${prediction.hit}％</p><p>回避失敗時の予測ダメージ：${prediction.damage}</p><p>反撃ダメージ：反撃なし</p>`;

return `${reactionText}<p>命中率：${prediction.hit}％　予測ダメージ：${prediction.damage}</p><p>反撃ダメージ：${prediction.canCounter?prediction.counterDamage:"反撃不可"}</p>`;

} function showCombatConfirmation(attacker,defender,response){

if(!attacker||!defender)return;

const prediction=getCombatPrediction(attacker,defender,response);

menuOpen=true;attackMode=false;moveMode=false;selectedEnemy=defender;battleVisual={attacker,defender,response,showArrows:true};

info.innerHTML=`<h3>戦闘確認</h3><button id="combatStart">戦闘開始</button><button id="combatBack">戻る</button>${battlePanelHTML(attacker,defender,prediction)}${predictionHTML(prediction,response,attacker)}<p>オレンジ：攻撃側　青：防御側</p>`;

document.querySelector("#combatStart").onclick=()=>{if(!combatAnimating)resolveAttack(attacker,defender,response);};

document.querySelector("#combatBack").onclick=()=>{clearBattleVisual();if(attacker.side==="enemy")showReactionMenu(attacker,defender);else showAttackMenu(attacker);};

refresh();

}

function showReactionMenu(attacker,defender){

reaction=true;menuOpen=true;attackMode=false;moveMode=false;battleVisual={attacker,defender,response:"normal",showArrows:true};

const canCounter=isUnitInAttackRange(defender,attacker);

info.innerHTML=`<h3>敵の攻撃！</h3><p>${attacker.name}が${defender.name}を攻撃する。</p><p>どう対応する？</p><button id="reactCounter" ${canCounter?"":"disabled"}>反撃</button><button id="reactDefend">防御</button><button id="reactEvade">回避</button><button id="reactSkill">スキル</button>`;

document.querySelector("#reactCounter").onclick=()=>{reaction=false;showCombatConfirmation(attacker,defender,"counter");};

document.querySelector("#reactDefend").onclick=()=>{reaction=false;showCombatConfirmation(attacker,defender,"defend");};

document.querySelector("#reactEvade").onclick=()=>{reaction=false;showCombatConfirmation(attacker,defender,"evade");};

document.querySelector("#reactSkill").onclick=()=>{reaction=false;showReactionSkills(attacker,defender);};

refresh();

}

function showReactionSkills(attacker,defender){

menuOpen=true;reaction=true;battleVisual={attacker,defender,response:"normal",showArrows:true};

info.innerHTML=`<h3>防御スキル</h3><p>防御スキルを使用する。</p><button id="reactionSkillUse">防御態勢</button><button id="reactionSkillBack">戻る</button>`;

document.querySelector("#reactionSkillUse").onclick=()=>{reaction=false;showCombatConfirmation(attacker,defender,"skill");};

document.querySelector("#reactionSkillBack").onclick=()=>showReactionMenu(attacker,defender);refresh();

}

function resetBattle(){

units.forEach((unit,index)=>{

const initial=initialUnitStates[index];

Object.assign(unit,{...initial,resistances:{...initial.resistances},skills:[...initial.skills]});

});

selected=null;selectedEnemy=null;currentTurn="ally";turn=1;pendingMove=null;moveMode=false;attackMode=false;menuOpen=false;reaction=false;combatAnimating=false;battleEnded=false;enemyQueue=[];enemyQueueIndex=0;enemyAIActive=false;lastTapUnitId=null;battleVisual=null;systemMenuOpen=false;

map.querySelectorAll(".combat-number,.combat-miss").forEach(el=>el.remove());

info.innerHTML="<p>新しい戦いが始まった。ユニットを選択してね。</p>";refresh();

}

function showStory(title,message,buttonText,callback){

const overlay=document.createElement("div");overlay.className="story-overlay";

const panel=document.createElement("div");panel.className="story-panel";

const heading=document.createElement("h2");heading.textContent=title;

const paragraph=document.createElement("p");paragraph.textContent=message;

overlay.appendChild(makeMusicButton());

const button=document.createElement("button");button.textContent=buttonText;

button.onclick=()=>{overlay.remove();if(callback)callback();};

panel.appendChild(heading);panel.appendChild(paragraph);panel.appendChild(button);overlay.appendChild(panel);game.appendChild(overlay);

}

/* オープニング：勢力図2枚を切り替えながら歴史を紹介 */
const MAP_PRE_EMPIRE="https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/%E5%B8%9D%E5%9B%BD%E6%88%90%E7%AB%8B%E5%89%8D.PNG";
const MAP_EARLY_EMPIRE="https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/%E5%B8%9D%E5%9B%BD%E5%88%9D%E6%9C%9F.PNG";
const openingPages=[
{map:MAP_PRE_EMPIRE,text:"大陸中央に位置するミルディア評議国。議会は派閥争いに明け暮れ、地方では反乱や衝突が続いていた。国境の脅威に対処する力も、民の暮らしを立て直す力も失われつつあった。"},
{map:MAP_PRE_EMPIRE,text:"税と食料は不足し、街道は荒れ、各地の領主や軍は中央の命令に従わなくなった。評議会は決断できず、国民の不満と不安は膨らんでいく。政治の行き詰まりを打開しようとする声が、各地で高まり始めた。"},
{map:MAP_PRE_EMPIRE,text:"その頃、改革を訴えるヴァルグランが演説と政策で注目を集め始める。古い言葉で「ヴェル」は偉大なる者を意味する称号とされ、支持者たちは彼を「ヴェル」と呼ぶようになった。「ヴェル、ヴァルグラン」――その呼び声は、変革を望む人々の合言葉となっていく。"},
{map:MAP_PRE_EMPIRE,text:"一度は急進派が力ずくで政権を動かそうとしたが、その試みは失敗し、国はさらに混乱した。ヴァルグランは武力による決着ではなく、選挙活動と議会内の交渉、各勢力との合意形成に力を注ぐ。彼の政策と演説は支持を広げ、政治の主導権は少しずつ移っていった。"},
{map:MAP_EARLY_EMPIRE,text:"選挙で勢力を伸ばしたヴァルグランは、議会の承認を得て国家再建の全権を託される。ミルディア評議国の体制は改められ、ヴァルディア帝国が成立した。行政と軍の再編、街道や農地の復旧が始まり、人々はようやく暮らしが立ち直る兆しを感じ始めた。"},
{map:MAP_EARLY_EMPIRE,text:"新たな体制のもと、周辺諸国との関係も動き始める。西のアルメリア王国、北のノルトラント王国、南部諸侯連合、東方連合国。帝国の再建が進む中、若き女性士官は所属部隊とともに任務へ向かう。"}
]

function showOpeningStory(){

setMusicScene("story");
let page=0;

const overlay=document.createElement("div");overlay.className="story-overlay opening-overlay";

const bg=document.createElement("img");bg.className="opening-map";bg.alt="ヴァルディア大陸勢力図";overlay.appendChild(bg);

const panel=document.createElement("div");panel.className="story-panel opening-panel";

const paragraph=document.createElement("p");

const controls=document.createElement("div");controls.className="opening-controls";

const backButton=document.createElement("button");backButton.textContent="戻る";

const nextButton=document.createElement("button");

controls.appendChild(backButton);controls.appendChild(nextButton);

panel.appendChild(paragraph);panel.appendChild(controls);overlay.appendChild(panel);overlay.appendChild(makeMusicButton());game.appendChild(overlay);

function render(){

paragraph.textContent=openingPages[page].text;
bg.src=openingPages[page].map;

backButton.disabled=page===0;

nextButton.textContent=page===openingPages.length-1?"インターミッションへ":"次へ";

}

backButton.onclick=()=>{if(page<=0)return;page--;render();};

nextButton.onclick=()=>{

if(page<openingPages.length-1){page++;render();return;}

overlay.remove();stopStoryBgm();showIntermission();

};

render();

}

function showTitleLoadMenu(){

const overlay=document.createElement("div");overlay.className="story-overlay";

const panel=document.createElement("div");panel.className="story-panel";

panel.innerHTML="<h2>LOAD GAME</h2><p>ロードするセーブデータを選択してください。</p>";

const list=document.createElement("div");list.className="title-load-list";

const slots=readSaveSlots();

slots.forEach((slot,i)=>{

const b=document.createElement("button");

if(slot){

const date=new Date(slot.savedAt);

const dateText=isNaN(date.getTime())?"日時不明":date.toLocaleString("ja-JP");

b.textContent=`枠${i+1}　${dateText}　${slot.turn}ターン`;

b.onclick=()=>{

stopTitleBgm();

overlay.remove();

intermissionOpen=true;

loadFromSlot(i);

showIntermission();

};

}else{

b.textContent=`枠${i+1}　空き`;

b.disabled=true;

}

list.appendChild(b);

});

const back=document.createElement("button");back.textContent="戻る";back.onclick=()=>{overlay.remove();showTitleScreen();};

panel.appendChild(list);panel.appendChild(back);overlay.appendChild(panel);game.appendChild(overlay);

}

/* タイトル画面：画像内メニューに透明な操作領域を重ねる */
const TITLE_IMAGE_URL="https://raw.githubusercontent.com/miyabi201938-lang/mira-srpg-public/main/%E3%82%BF%E3%82%A4%E3%83%88%E3%83%AB1.PNG";
function showTitleScreen(){
intermissionOpen=false;
mapViewport.style.display="none";
document.querySelector("#actionButtons").style.display="none";
turnLabel.style.display="none";
info.style.display="none";
const old=document.querySelector("#intermissionPanel");if(old)old.remove();
const oldTitle=document.querySelector("#titleScreen");if(oldTitle)oldTitle.remove();
const screen=document.createElement("div");screen.id="titleScreen";
screen.innerHTML=`<div class="title-art"><img class="title-background" src="${TITLE_IMAGE_URL}" alt="興亡のヴァルディア タイトル背景"></div><div class="title-menu"><button id="titleNew">新しく始める</button><button id="titleContinue">続きから</button><button id="titleLoad">ロード</button><button id="titleOptions">設定</button><button id="titleCredits">クレジット</button></div>`;
game.appendChild(screen);
setMusicScene("title");
screen.appendChild(makeMusicButton());
const startNew=()=>{stopTitleBgm();screen.remove();resetBattle();stageNumber=1;showOpeningStory();};
screen.querySelector("#titleNew").onclick=startNew;
screen.querySelector("#titleContinue").onclick=()=>{const slots=readSaveSlots();let candidates=slots.map((slot,i)=>slot?{slot,i}:null).filter(Boolean).sort((a,b)=>(b.slot.savedAt||0)-(a.slot.savedAt||0));if(!candidates.length){alert("セーブデータがありません。");return;}const i=candidates[0].i;stopTitleBgm();screen.remove();intermissionOpen=true;loadFromSlot(i);showIntermission();};
screen.querySelector("#titleLoad").onclick=()=>{screen.remove();showTitleLoadMenu();};
screen.querySelector("#titleOptions").onclick=()=>{showStory("設定","現在、設定項目はありません。","戻る",()=>showTitleScreen());};
screen.querySelector("#titleCredits").onclick=()=>{showStory("クレジット","興亡のヴァルディア\n企画・制作：個人制作","戻る",()=>showTitleScreen());};
}


function showIntermission(){

intermissionOpen=true;intermissionReturnMode=true;systemMenuOpen=false;menuOpen=false;selected=null;selectedEnemy=null;pendingMove=null;moveMode=false;attackMode=false;clearBattleVisual();

mapViewport.style.display="none";document.querySelector("#actionButtons").style.display="none";turnLabel.style.display="none";info.style.display="none";

let old=document.querySelector("#intermissionPanel");if(old)old.remove();

const panel=document.createElement("div");panel.id="intermissionPanel";

panel.innerHTML=`

<h3>インターミッション</h3>

<p>部隊の準備を整え、次の戦いに備えよう。</p>

<div class="intermission-main">

<button data-prep="装備変更">装備変更</button><button data-prep="能力強化">能力強化</button>

<button data-prep="アイテム管理">アイテム管理</button><button data-prep="能力確認">能力確認</button>

<button data-prep="ジョブチェンジ">ジョブチェンジ</button><button id="intermissionSystem">システムメニュー</button>

</div>

<p id="intermissionMessage">準備項目を選択してください。</p>

<button class="intermission-start" id="intermissionStart">戦いへ</button>`;

game.appendChild(panel);
game.appendChild(makeMusicButton());
setMusicScene("intermission");

panel.querySelectorAll("[data-prep]").forEach(button=>{

button.onclick=()=>{panel.querySelector("#intermissionMessage").textContent=button.dataset.prep+"は、今後の更新で機能を追加する予定です。";};

});

panel.querySelector("#intermissionSystem").onclick=()=>{intermissionOpen=true;showSystemMenu();};

panel.querySelector("#intermissionStart").onclick=()=>{panel.remove();showCurrentSituation();};

}

function showCurrentSituation(){

intermissionOpen=false;systemMenuOpen=false;

let old=document.querySelector("#intermissionPanel");if(old)old.remove();

mapViewport.style.display="none";document.querySelector("#actionButtons").style.display="none";turnLabel.style.display="none";info.style.display="none";

const panel=document.createElement("div");panel.id="intermissionPanel";

panel.innerHTML=`

<h3>現在の状況</h3><p>第${stageNumber}戦</p>

<p>敵部隊が進軍している。味方部隊は隊長を守りながら、敵の指揮官を撃破しなければならない。</p>

<div style="text-align:left;margin:14px 8px;">

<p><strong>【作戦目標】</strong><br>敵部隊を撃破し、戦場を制圧する。</p>

<p><strong>【勝利条件】</strong><br>敵隊長を撃破する。</p>

<p><strong>【敗北条件】</strong><br>ミラ・ローゼンが撃破される。</p>

</div>

<button class="intermission-start" id="situationStart">戦闘開始</button><button id="situationBack">準備に戻る</button>`;

game.appendChild(panel);

panel.querySelector("#situationStart").onclick=()=>{

panel.remove();intermissionOpen=false;mapViewport.style.display="block";document.querySelector("#actionButtons").style.display="flex";turnLabel.style.display="block";info.style.display="block";startStage();

};

panel.querySelector("#situationBack").onclick=()=>showIntermission();

} function animateBattlefieldOverview(captain){

return new Promise(resolve=>{

const vw=mapViewport.clientWidth,vh=mapViewport.clientHeight,startX=mapOffsetX,startY=mapOffsetY;

const leftX=Math.min(0,vw-mapWidth),rightX=0,endX=startX;

const overviewY=vh>=mapHeight?(vh-mapHeight)/2:Math.max(mapHeight*-1+vh,Math.min(0,(vh-mapHeight)/2));

const pointsX=[startX,leftX,rightX,endX];

const totalDistance=Math.abs(pointsX[1]-pointsX[0])+Math.abs(pointsX[2]-pointsX[1])+Math.abs(pointsX[3]-pointsX[2]);

const start=performance.now(),duration=6500;

function frame(now){

if(cameraSkipRequested){centerMapOnUnit(captain);resolve();return;}

const progress=Math.min(1,(now-start)/duration),distance=totalDistance*progress;

let remaining=distance,currentX=pointsX[0];

for(let i=0;i<pointsX.length-1;i++){

const segment=Math.abs(pointsX[i+1]-pointsX[i]);

if(remaining<=segment){const ratio=segment===0?1:remaining/segment;currentX=pointsX[i]+(pointsX[i+1]-pointsX[i])*ratio;break;}

remaining-=segment;currentX=pointsX[i+1];

}

const verticalProgress=progress<.15?progress/.15:1,easedVertical=verticalProgress*verticalProgress*(3-2*verticalProgress);

mapOffsetX=currentX;mapOffsetY=startY+(overviewY-startY)*easedVertical;clampMapOffset();

if(progress<1)requestAnimationFrame(frame);else{centerMapOnUnit(captain);resolve();}

}

requestAnimationFrame(frame);

});

}

async function startStage(){

if(cameraBusy)return;

cameraBusy=true;cameraSkipRequested=false;battleEnded=false;combatAnimating=false;reaction=false;selected=null;selectedEnemy=null;pendingMove=null;moveMode=false;attackMode=false;menuOpen=false;systemMenuOpen=false;currentTurn="ally";turn=1;

units.forEach(u=>{u.moved=false;u.acted=false;u.waited=false;u.defending=false;});

refresh();

const captain=units.find(u=>u.side==="ally"&&u.role==="captain");

if(window.innerWidth<=700&&captain){centerMapOnUnit(captain);await animateBattlefieldOverview(captain);}else centerMap();

cameraBusy=false;cameraSkipRequested=false;info.innerHTML="<p>戦闘開始。ユニットを選択してね。</p>";refresh();

}

function checkBattleEnd(){

const allyCaptain=units.find(u=>u.side==="ally"&&u.role==="captain"),enemyCaptain=units.find(u=>u.side==="enemy"&&u.role==="captain");

if(!allyCaptain||allyCaptain.hp<=0){

battleEnded=true;combatAnimating=false;battleVisual=null;

showStory("敗北","ミラ・ローゼンが倒れた。\n味方部隊は撤退した。","終了",()=>{resetBattle();showIntermission();});refresh();return true;

}

if(!enemyCaptain||enemyCaptain.hp<=0){

battleEnded=true;combatAnimating=false;battleVisual=null;

showStory("勝利","敵隊長を撃破した。\n戦いは味方の勝利に終わった。","次へ",()=>{stageNumber++;resetBattle();showIntermission();});refresh();return true;

}

return false;

}

function applyDamage(attacker,defender,damage,response,evadeChance){

if(response==="evade"){

const success=Math.random()*100<evadeChance;

if(success){showCombatEffect(defender,0,true);return false;}

}

const hit=Math.random()*100<calculateHit(attacker,defender);

if(!hit){showCombatEffect(defender,0,true);return false;}

let actualDamage=damage;

if(Math.random()*100<CRITICAL_RATE)actualDamage*=CRITICAL_MULTIPLIER;

actualDamage=Math.max(1,actualDamage);defender.hp=Math.max(0,defender.hp-actualDamage);showCombatEffect(defender,actualDamage,false);animateUnit(defender,"combat-hit");return true;

}

function resolveAttack(attacker,defender,response){

if(combatAnimating||battleEnded)return;

combatAnimating=true;menuOpen=true;

const isEnemyAttack=attacker.side==="enemy",isAllyAttack=attacker.side==="ally";

battleVisual={attacker,defender,response,showArrows:false};

const prediction=getCombatPrediction(attacker,defender,response);

info.innerHTML=`<h3>戦闘中</h3>${battlePanelHTML(attacker,defender,prediction)}<p>戦闘を解決しています……</p>`;

refresh();animateUnit(attacker,"combat-attacking");

setTimeout(()=>{

if(battleEnded)return;

applyDamage(attacker,defender,prediction.damage,response,prediction.evadeChance);refresh();

setTimeout(()=>{

if(checkBattleEnd())return;

let counterTarget=null,counterAttacker=null;

if((isEnemyAttack||isAllyAttack)&&response==="counter"&&defender.hp>0&&isUnitInAttackRange(defender,attacker)){counterAttacker=defender;counterTarget=attacker;}

if(counterAttacker&&counterTarget){

setTimeout(()=>{

if(battleEnded)return;

animateUnit(counterAttacker,"combat-attacking");

const counterDamage=calculateDamage(counterAttacker,counterTarget);

applyDamage(counterAttacker,counterTarget,counterDamage,"normal",0);refresh();

setTimeout(()=>finishCombat(attacker,defender,isEnemyAttack),500);

},450);

}else setTimeout(()=>finishCombat(attacker,defender,isEnemyAttack),500);

},500);

},400);

}

function finishCombat(attacker,defender,isEnemyAttack){

combatAnimating=false;menuOpen=false;clearBattleVisual();if(checkBattleEnd())return;

if(isEnemyAttack){

attacker.acted=true;attacker.waited=true;selected=null;reaction=false;info.innerHTML="<p>敵の攻撃が終了した。</p>";refresh();setTimeout(()=>processEnemyTurn(),500);return;

}

const actingUnit=attacker;actingUnit.acted=true;actingUnit.moved=actingUnit.moved||Boolean(pendingMove);actingUnit.waited=true;

if(pendingMove)pendingMove=null;

selected=null;selectedEnemy=null;attackMode=false;moveMode=false;info.innerHTML=`<p>${actingUnit.name}の行動が終了した。</p>`;refresh();askEndTurnIfAllActed();

}

function chooseEnemyTarget(enemy){

const allies=units.filter(u=>u.side==="ally"&&u.hp>0);if(!allies.length)return null;

const captain=allies.find(u=>u.role==="captain");

if(enemy.targetStyle==="captain"&&captain){

const guards=allies.filter(a=>a.id!==captain.id&&getDistance(a.x,a.y,captain.x,captain.y)===1);

if(guards.length){guards.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));return guards[0];}

return captain;

}

const enemyCaptain=units.find(u=>u.side==="enemy"&&u.role==="captain"&&u.hp>0);

if(enemyCaptain){

const threats=allies.filter(a=>getDistance(a.x,a.y,enemyCaptain.x,enemyCaptain.y)<=1);

if(threats.length){threats.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));return threats[0];}

}

allies.sort((a,b)=>{const ar=a.hp/a.maxHp,br=b.hp/b.maxHp;if(ar!==br)return ar-br;return a.hp-b.hp;});

return allies[0];

}

function moveEnemyToward(enemy,target){

const queue=[{x:enemy.x,y:enemy.y,firstStep:null,d:0}],visited=new Set([`${enemy.x},${enemy.y}`]),goals=[];

while(queue.length){

const c=queue.shift();

if(c.d>0){

const d=getDistance(c.x,c.y,target.x,target.y),canAttack=isMage(enemy)?d===2:(d>=1&&d<=enemy.range);

if(canAttack){goals.push(c);continue;}

}

getNeighbors(c).forEach(n=>{

const key=`${n.x},${n.y}`;if(visited.has(key)||occupied(n.x,n.y,enemy))return;

visited.add(key);queue.push({x:n.x,y:n.y,firstStep:c.firstStep||{x:n.x,y:n.y},d:c.d+1});

});

}

if(!goals.length)return false;

goals.sort((a,b)=>{if(a.d!==b.d)return a.d-b.d;return getDistance(a.x,a.y,target.x,target.y)-getDistance(b.x,b.y,target.x,target.y);});

const best=goals[0];if(!best.firstStep)return false;

enemy.x=best.firstStep.x;enemy.y=best.firstStep.y;enemy.moved=true;return true;

}

function startEnemyTurn(){

if(battleEnded)return;

currentTurn="enemy";turn++;selected=null;selectedEnemy=null;pendingMove=null;moveMode=false;attackMode=false;menuOpen=false;reaction=false;systemMenuOpen=false;clearBattleVisual();enemyAIActive=true;

units.forEach(u=>{if(u.side==="enemy"){u.moved=false;u.acted=false;u.waited=false;}});

enemyQueue=units.filter(u=>u.side==="enemy"&&u.hp>0);enemyQueueIndex=0;info.innerHTML="<p>敵のターン。</p>";refresh();setTimeout(processEnemyTurn,500);

}

function processEnemyTurn(){

if(battleEnded)return;

if(enemyQueueIndex>=enemyQueue.length){startEnemyTurnFinish();return;}

const enemy=enemyQueue[enemyQueueIndex];

if(!enemy||enemy.hp<=0){enemyQueueIndex++;processEnemyTurn();return;}

const target=chooseEnemyTarget(enemy);if(!target){startEnemyTurnFinish();return;}

let canAttack=isUnitInAttackRange(enemy,target);

if(!canAttack){moveEnemyToward(enemy,target);canAttack=isUnitInAttackRange(enemy,target);refresh();}

if(canAttack){

enemyQueueIndex++;reaction=true;info.innerHTML=`<p>${enemy.name}が${target.name}に迫っている。</p>`;refresh();

setTimeout(()=>{if(!battleEnded)showReactionMenu(enemy,target);},350);return;

}

enemy.moved=true;enemy.acted=true;enemy.waited=true;enemyQueueIndex++;refresh();setTimeout(processEnemyTurn,350);

}

function startEnemyTurnFinish(){

if(battleEnded)return;

enemyAIActive=false;reaction=false;menuOpen=false;clearBattleVisual();currentTurn="ally";

units.forEach(u=>{if(u.side==="ally"){u.moved=false;u.acted=false;u.waited=false;u.defending=false;}});

selected=null;selectedEnemy=null;info.innerHTML="<p>味方のターン。ユニットを選択してね。</p>";refresh();

}

function readSaveSlots(){

try{

const raw=localStorage.getItem(SAVE_KEY);if(!raw)return Array(5).fill(null);

const parsed=JSON.parse(raw);if(!Array.isArray(parsed))return Array(5).fill(null);

return Array.from({length:5},(_,i)=>parsed[i]||null);

}catch(e){console.error("セーブデータを読み込めません",e);return Array(5).fill(null);}

}

function writeSaveSlots(slots){

try{localStorage.setItem(SAVE_KEY,JSON.stringify(slots));return true;}

catch(e){console.error("セーブに失敗しました",e);alert("保存できませんでした。ブラウザの保存容量や設定を確認してください。");return false;}

}

function makeSaveData(){

return{version:1,savedAt:new Date().toISOString(),turn,currentTurn,stageNumber,units:units.map(u=>({id:u.id,x:u.x,y:u.y,hp:u.hp,maxHp:u.maxHp,moved:u.moved,acted:u.acted,waited:u.waited,defending:Boolean(u.defending)}))};

}

function saveToSlot(index){

const slots=readSaveSlots();

if(slots[index]&&!confirm(`セーブ枠${index+1}を上書きしますか？`))return;

slots[index]=makeSaveData();if(!writeSaveSlots(slots))return;

alert(`セーブ枠${index+1}に保存しました。`);

if(intermissionOpen)showSystemMenu();else showSaveMenu();

}

function loadFromSlot(index){

const slots=readSaveSlots(),data=slots[index];if(!data)return;

if(!confirm(`セーブ枠${index+1}をロードしますか？\n現在の進行状況は置き換わります。`))return;

if(!Array.isArray(data.units)||data.units.length!==units.length){alert("このセーブデータは読み込めません。");return;}

data.units.forEach(saved=>{

const unit=units.find(u=>u.id===saved.id);if(!unit)return;

unit.x=saved.x;unit.y=saved.y;unit.hp=saved.hp;unit.maxHp=saved.maxHp;unit.moved=Boolean(saved.moved);unit.acted=Boolean(saved.acted);unit.waited=Boolean(saved.waited);unit.defending=Boolean(saved.defending);

});

turn=Number(data.turn)||1;stageNumber=Number(data.stageNumber)||1;currentTurn=data.currentTurn==="enemy"?"enemy":"ally";

selected=null;selectedEnemy=null;pendingMove=null;moveMode=false;attackMode=false;menuOpen=false;reaction=false;combatAnimating=false;battleEnded=false;enemyAIActive=false;enemyQueue=[];enemyQueueIndex=0;systemMenuOpen=false;lastTapUnitId=null;clearBattleVisual();

if(intermissionOpen){showIntermission();return;}

info.innerHTML=`<p>セーブ枠${index+1}をロードした。</p>`;refresh();

if(currentTurn==="enemy"){enemyAIActive=true;enemyQueue=units.filter(u=>u.side==="enemy"&&u.hp>0);enemyQueueIndex=0;setTimeout(processEnemyTurn,400);}

}

function showSaveMenu(){

systemMenuOpen=true;menuOpen=true;const slots=readSaveSlots();let html="<h3>セーブ</h3><p>保存する枠を選んでね。</p>";

slots.forEach((slot,i)=>{

if(slot){const date=new Date(slot.savedAt),dateText=isNaN(date.getTime())?"日時不明":date.toLocaleString("ja-JP");html+=`<p>枠${i+1}：保存済み<br>${dateText}／${slot.turn}ターン</p><button data-save="${i}">この枠に保存</button>`;}

else html+=`<p>枠${i+1}：空き</p><button data-save="${i}">新規保存</button>`;

});

html+=`<button id="saveBack">戻る</button>`;info.innerHTML=html;

info.querySelectorAll("[data-save]").forEach(b=>{b.onclick=()=>saveToSlot(Number(b.dataset.save));});

document.querySelector("#saveBack").onclick=showSystemMenu;refresh();

}

function showLoadMenu(){

systemMenuOpen=true;menuOpen=true;const slots=readSaveSlots();let html="<h3>ロード</h3><p>読み込む枠を選んでね。</p>";

slots.forEach((slot,i)=>{

if(slot){const date=new Date(slot.savedAt),dateText=isNaN(date.getTime())?"日時不明":date.toLocaleString("ja-JP");html+=`<p>枠${i+1}：保存済み<br>${dateText}／${slot.turn}ターン</p><button data-load="${i}">ロード</button>`;}

else html+=`<p>枠${i+1}：空き</p><button disabled>データなし</button>`;

});

html+=`<button id="loadBack">戻る</button>`;info.innerHTML=html;

info.querySelectorAll("[data-load]").forEach(b=>{b.onclick=()=>loadFromSlot(Number(b.dataset.load));});

document.querySelector("#loadBack").onclick=showSystemMenu;refresh();

}

function showSettingsMenu(){

systemMenuOpen=true;menuOpen=true;info.innerHTML=`<h3>設定</h3><p>現在の設定項目はありません。</p><button id="settingsBack">戻る</button>`;

document.querySelector("#settingsBack").onclick=showSystemMenu;refresh();

}

function returnToBattleFromSystemMenu(){

systemMenuOpen=false;menuOpen=false;

if(intermissionOpen){showIntermission();return;}

selected=null;selectedEnemy=null;moveMode=false;attackMode=false;lastTapUnitId=null;clearBattleVisual();info.innerHTML="<p>戦闘に戻った。</p>";refresh();

}

function showSystemMenu(){

if(battleEnded||combatAnimating||reaction||enemyAIActive)return;

systemMenuOpen=true;menuOpen=true;attackMode=false;moveMode=false;clearBattleVisual();

info.innerHTML=`

<h3>システムメニュー</h3>

<button id="systemSave">セーブ</button><button id="systemLoad">ロード</button><button id="systemSettings">設定</button>

<button id="systemEndTurn" ${intermissionOpen?"disabled":""}>ターン終了</button>

<button id="systemBack">${intermissionOpen?"インターミッションに戻る":"戦闘に戻る"}</button><button id="systemExit">ゲーム終了</button>`;

document.querySelector("#systemSave").onclick=()=>{

if(!intermissionOpen&&currentTurn!=="ally"){alert("味方のターンにセーブしてください。");return;}

showSaveMenu();

};

document.querySelector("#systemLoad").onclick=showLoadMenu;

document.querySelector("#systemSettings").onclick=showSettingsMenu;

document.querySelector("#systemEndTurn").onclick=()=>{

if(intermissionOpen||currentTurn!=="ally"||pendingMove)return;

systemMenuOpen=false;menuOpen=false;selected=null;selectedEnemy=null;clearBattleVisual();startEnemyTurn();

};

document.querySelector("#systemBack").onclick=returnToBattleFromSystemMenu;

document.querySelector("#systemExit").onclick=()=>{

if(!confirm("ゲームを終了しますか？"))return;

if(!confirm("本当に終了しますか？\nセーブしていない進行状況は失われます。"))return;

info.innerHTML="<p>ゲームを終了しています……</p>";refresh();window.close();

setTimeout(()=>{

info.innerHTML=`<h3>ゲーム終了</h3><p>ブラウザの仕様により、このページを閉じられませんでした。</p><p>Safariのタブ一覧から、このタブを閉じてください。</p><button id="exitBack">ゲームに戻る</button>`;

const back=document.querySelector("#exitBack");if(back)back.onclick=returnToBattleFromSystemMenu;

},500);

};

refresh();

}

function handleCellTap(x,y){

if(battleEnded||combatAnimating||currentTurn!=="ally"||enemyAIActive)return;

const unit=getUnitAt(x,y);

if(battleVisual&&menuOpen&&battleVisual.showArrows!==false&&battleVisual.attacker.side==="ally"&&unit&&unit.id===battleVisual.defender.id){

resolveAttack(battleVisual.attacker,battleVisual.defender,battleVisual.response);return;

}

if(systemMenuOpen){if(!unit)returnToBattleFromSystemMenu();return;}

if(menuOpen){menuOpen=false;attackMode=false;moveMode=false;}

if(attackMode){

if(unit&&unit.side==="enemy"&&selected&&isAllyAttackCell(x,y)){showCombatConfirmation(selected,unit,chooseEnemyReaction(selected,unit));return;}

if(pendingMove)exitAttackSelection();else closeMenuByEmptyTap();return;

}

if(pendingMove){

if(unit&&unit.side==="ally"&&unit.id===pendingMove.unit.id){showActionMenu(unit);return;}

if(unit&&unit.side==="enemy"&&selected&&isAllyAttackCell(x,y)){showCombatConfirmation(selected,unit,chooseEnemyReaction(selected,unit));return;}

if(x===pendingMove.fromX&&y===pendingMove.fromY){cancelMove();return;}

cancelMove();return;

}

if(unit&&unit.side==="enemy"){

if(selected&&selected.side==="ally"&&isAllyAttackCell(x,y)){showCombatConfirmation(selected,unit,chooseEnemyReaction(selected,unit));return;}

if(selectedEnemy&&selectedEnemy.id===unit.id){showDetails(unit);return;}

selected=null;selectedEnemy=unit;menuOpen=false;moveMode=false;attackMode=false;lastTapUnitId=null;clearBattleVisual();

info.innerHTML=`<p>${unit.icon} ${unit.name}を選択中。</p><p>青：移動可能範囲</p><p>赤：攻撃可能範囲</p><p>もう一度クリックで能力確認</p>`;refresh();return;

}

if(unit&&unit.side==="ally"){

if(selected&&selected.id===unit.id){lastTapUnitId=null;showActionMenu(unit);return;}

selected=unit;selectedEnemy=null;lastTapUnitId=unit.id;menuOpen=false;moveMode=false;attackMode=false;clearBattleVisual();

info.innerHTML=`<p>${unit.icon} ${unit.name}を選択中。</p><p>青：移動可能範囲</p><p>赤：攻撃可能範囲</p><p>もう一度クリックで行動メニュー</p>`;refresh();return;

}

if(selected&&selected.side==="ally"&&!selected.moved&&!selected.acted&&!selected.waited){

const reachable=getReachableCells(selected),valid=reachable.some(c=>c.x===x&&c.y===y);

if(valid){

const mover=selected;pendingMove={unit:mover,fromX:mover.x,fromY:mover.y};mover.x=x;mover.y=y;mover.moved=true;moveMode=false;attackMode=false;menuOpen=false;lastTapUnitId=null;selectedEnemy=null;clearBattleVisual();

info.innerHTML=`<p>${mover.name}が移動した。</p><p>赤く点滅する範囲が攻撃可能範囲。</p><p>赤い範囲内の敵を選ぶと攻撃できる。</p><p>「待機」で行動終了。</p>`;refresh();return;

}

}

if(!selected&&!selectedEnemy){showSystemMenu();return;}

closeMenuByEmptyTap();

}

map.addEventListener("click",function(e){

if(suppressNextClick){e.preventDefault();e.stopPropagation();suppressNextClick=false;return;}

const cell=e.target.closest("[data-x][data-y]");

if(!cell){

if(!reaction&&!combatAnimating){

if(systemMenuOpen)returnToBattleFromSystemMenu();

else if(pendingMove)cancelMove();

else if(!selected&&!selectedEnemy)showSystemMenu();

else closeMenuByEmptyTap();

}

return;

}

handleCellTap(Number(cell.dataset.x),Number(cell.dataset.y));

});

pendingMoveButton.addEventListener("click",function(){

const unit=pendingMove?pendingMove.unit:selected;

if(!unit||unit.side!=="ally")return;

if(unit.moved||unit.acted||unit.waited||pendingMove)return;

selected=unit;selectedEnemy=null;menuOpen=false;moveMode=true;attackMode=false;systemMenuOpen=false;

info.innerHTML=`<p>${unit.name}：青い範囲から移動先を選んでね。</p>`;refresh();

});

pendingAttackButton.addEventListener("click",function(){

const unit=pendingMove?pendingMove.unit:selected;if(!unit||!hasAttackTargets(unit))return;showAttackMenu(unit);

});

pendingWaitButton.addEventListener("click",function(){

if(pendingMove){finishMoveAndWait();return;}

const unit=selected;if(!unit||unit.side!=="ally"||unit.acted||unit.waited)return;

unit.acted=true;unit.waited=true;selected=null;selectedEnemy=null;menuOpen=false;moveMode=false;attackMode=false;systemMenuOpen=false;clearBattleVisual();

info.innerHTML=`<p>${unit.name}はその場で待機した。</p>`;refresh();askEndTurnIfAllActed();

});

systemButton.addEventListener("click",function(){

const unit=pendingMove?pendingMove.unit:selected;if(!unit)return;showActionMenu(unit);

});

const originalShowSystemMenu=showSystemMenu;

showSystemMenu=function(){

if(intermissionOpen){

const panel=document.querySelector("#intermissionPanel");if(panel)panel.style.display="none";info.style.display="block";

}

originalShowSystemMenu();

};

selected=null;selectedEnemy=null;currentTurn="ally";turn=1;pendingMove=null;moveMode=false;attackMode=false;menuOpen=false;reaction=false;combatAnimating=false;battleEnded=false;enemyQueue=[];enemyQueueIndex=0;enemyAIActive=false;lastTapUnitId=null;battleVisual=null;systemMenuOpen=false;intermissionOpen=false;cameraBusy=false;cameraSkipRequested=false;

info.innerHTML="<p>ユニットを選択してね。</p>";refresh();centerMap();

/* 起動時は戦場ではなくタイトル画面を表示 */

showTitleScreen();

});
