window.addEventListener("load", function () {

  const test=document.querySelector("#test");

  if(!test){console.error("#test が見つかりません");return;}

  test.innerHTML=`

    <div id="game">

      <h2>ミラのSRPG</h2>

      <p id="turn">味方のターン</p>

      <div id="map"></div>

      <div id="actionButtons">

        <button id="pendingWait" style="display:none">移動して待機</button>

        <button id="endTurn">ターン終了</button>

      </div>

      <div id="info">ユニットを選択してね</div>

    </div>`;

  const game=document.querySelector("#game");

  const map=document.querySelector("#map");

  const info=document.querySelector("#info");

  const turnLabel=document.querySelector("#turn");

  const endTurnButton=document.querySelector("#endTurn");

  const pendingWaitButton=document.querySelector("#pendingWait");

  const style=document.createElement("style");

  style.textContent=`

    #game{position:relative;}

    #map{

      position:relative;margin:0 auto;overflow:visible;

      touch-action:manipulation;

    }

    #actionButtons{

      display:flex;justify-content:center;align-items:center;

      gap:8px;width:94%;max-width:340px;margin:8px auto;

    }

    #actionButtons button{

      flex:1;min-width:0;padding:9px 5px;

      font-size:12px;border-radius:6px;

    }

    #info{

      position:relative;z-index:15;

      width:94%;max-width:340px;box-sizing:border-box;

      margin:8px auto;padding:7px;

      background:rgba(255,255,255,.97);

      border:1px solid #777;border-radius:8px;

      color:#222;font-size:12px;line-height:1.3;

      min-height:35px;

    }

    #info h3{font-size:14px;margin:4px 0;}

    #info h4{font-size:12px;margin:4px 0;}

    #info p{margin:4px 0;}

    #info button{font-size:11px;padding:5px 7px;margin:2px;}

    .unit-token{

      position:absolute;box-sizing:border-box;

      width:56px;height:44px;z-index:5;

      display:flex;align-items:center;justify-content:center;

      border-radius:8px;background:transparent;

      touch-action:manipulation;

      -webkit-tap-highlight-color:transparent;

    }

    .unit-content{

      display:flex;flex-direction:column;

      align-items:center;justify-content:center;

      text-align:center;line-height:1;

      pointer-events:none;color:#17202a;

      font-weight:bold;width:100%;height:100%;

    }

    .unit-icon{font-size:16px;line-height:17px;}

    .unit-name{

      font-size:9px;line-height:10px;

      max-width:54px;overflow-wrap:anywhere;

    }

    .unit-hp{font-size:8px;line-height:9px;}

    .battle-panel{

      display:flex;align-items:center;justify-content:space-between;

      gap:5px;margin:5px 0;padding:5px;

      border:2px solid #777;border-radius:8px;

      background:#fff;color:#222;

    }

    .battle-side{width:42%;min-width:0;text-align:center;}

    .battle-name{

      font-weight:bold;overflow-wrap:anywhere;

      margin-bottom:3px;font-size:10px;

    }

    .hp-track{

      position:relative;width:100%;height:16px;

      background:#ddd;border:1px solid #777;

      border-radius:5px;overflow:hidden;box-sizing:border-box;

    }

    .hp-fill{

      position:absolute;left:0;top:0;height:100%;

      transition:width 300ms ease;

    }

    .hp-ally{background:#2879db;}

    .hp-enemy{background:#e53935;}

    @keyframes hpBlink{

      0%,100%{opacity:1;filter:brightness(1);}

      50%{opacity:.12;filter:brightness(2);}

    }

    .hp-predicted{

      position:absolute;top:0;z-index:3;height:100%;

      animation:hpBlink .5s steps(2,end) infinite;

      background:repeating-linear-gradient(

        135deg,#fff 0,#fff 3px,#ffb300 3px,#ffb300 6px

      );

      border-left:2px solid #222;

      box-sizing:border-box;pointer-events:none;

    }

    .battle-center{font-size:15px;font-weight:bold;text-align:center;}

    .battle-hp-text{font-size:10px;margin-top:3px;}

    @keyframes combatLunge{

      0%{transform:translateX(0) scale(1);}

      35%{transform:translateX(9px) scale(1.08);}

      100%{transform:translateX(0) scale(1);}

    }

    @keyframes combatHit{

      0%,100%{transform:translateX(0);}

      20%{transform:translateX(-5px);}

      40%{transform:translateX(5px);}

      60%{transform:translateX(-4px);}

      80%{transform:translateX(3px);}

    }

    @keyframes combatFloat{

      0%{opacity:0;transform:translate(-50%,8px) scale(.7);}

      15%{opacity:1;transform:translate(-50%,0) scale(1.15);}

      100%{opacity:0;transform:translate(-50%,-38px) scale(1);}

    }

    .combat-number,.combat-miss{

      position:absolute;z-index:30;pointer-events:none;

      font-weight:900;-webkit-text-stroke:1px white;

      text-shadow:1px 2px 2px #0008;

      animation:combatFloat 950ms ease-out forwards;

    }

    .combat-number{font-size:25px;color:#e53935;}

    .combat-miss{font-size:20px;color:#2879db;}

    .unit-token.combat-attacking{animation:combatLunge 380ms ease-in-out;}

    .unit-token.combat-hit{animation:combatHit 420ms ease-in-out;}

    /* 青と赤の範囲を交互に点滅させる */

    @keyframes rangePulse{

      0%,100%{

        fill-opacity:.08;

        stroke-opacity:.35;

      }

      50%{

        fill-opacity:.34;

        stroke-opacity:1;

      }

    }

    .move-range-hex{

      fill:#2196f3;

      fill-opacity:.2;

      stroke:#1565c0;

      stroke-width:2;

      animation:rangePulse 1s ease-in-out infinite;

      pointer-events:none;

    }

    .attack-range-hex{

      fill:#e53935;

      fill-opacity:.2;

      stroke:#b71c1c;

      stroke-width:2;

      animation:rangePulse 1s ease-in-out infinite;

      animation-delay:-.5s;

      pointer-events:none;

    }

    @keyframes battleHexPulse{

      0%,100%{opacity:.55;stroke-width:3;}

      50%{opacity:1;stroke-width:5;}

    }

    .battle-hex-attacker{

      fill:#ff9800;fill-opacity:.28;

      stroke:#e65100;stroke-width:3;

      animation:battleHexPulse .65s ease-in-out infinite;

      pointer-events:none;

    }

    .battle-hex-defender{

      fill:#29b6f6;fill-opacity:.28;

      stroke:#0277bd;stroke-width:3;

      animation:battleHexPulse .65s ease-in-out infinite;

      pointer-events:none;

    }

    /* 矢印はヘックス中心から中心へ伸びる */

    .battle-arrow{

      fill:none;

      stroke-width:3.5;

      stroke-linecap:round;

      stroke-linejoin:round;

      filter:drop-shadow(0 0 3px #222);

      pointer-events:none;

    }

    .battle-arrow.ally-arrow{stroke:#ff9800;}

    .battle-arrow.enemy-arrow{stroke:#29b6f6;}

    .story-overlay{

      position:fixed;inset:0;z-index:10000;

      display:flex;align-items:center;justify-content:center;

      box-sizing:border-box;padding:20px;

      background:rgba(10,16,27,.94);color:#fff;

    }

    .story-panel{

      width:100%;max-width:420px;box-sizing:border-box;

      padding:24px 20px;border:1px solid #b9a16b;

      border-radius:12px;

      background:linear-gradient(160deg,#28364a,#111923);

      text-align:center;

    }

    .story-panel h2{font-size:22px;color:#f0d99b;}

    .story-panel p{

      font-size:16px;line-height:2;text-align:left;

      white-space:pre-line;

    }

    .story-panel button{

      min-width:150px;padding:11px 20px;font-size:15px;

      border:1px solid #d5bd83;border-radius:7px;

      background:#d5bd83;color:#202020;font-weight:bold;

    }

  `;

  document.head.appendChild(style);

  const units=[

    {

      id:1,name:"隊長",side:"ally",job:"ロード",

      role:"captain",x:1,y:2,hp:20,maxHp:20,icon:"👑",

      moved:false,acted:false,waited:false,

      atk:6,def:3,agi:5,dex:6,move:1,range:1,

      skills:["指揮"],

      resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}

    },

    {

      id:2,name:"重装兵",side:"ally",job:"ヘビーアーマー",

      x:0,y:3,hp:16,maxHp:16,icon:"🛡️",

      moved:false,acted:false,waited:false,

      atk:7,def:6,agi:2,dex:4,move:1,range:1,

      skills:["防御"],

      resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}

    },

    {

      id:3,name:"魔道士",side:"ally",job:"メイジ",

      x:2,y:3,hp:12,maxHp:12,icon:"🔮",

      moved:false,acted:false,waited:false,

      atk:8,def:2,agi:4,dex:6,move:1,range:2,

      skills:["魔法"],

      resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}

    },

    {

      id:6,name:"騎兵",side:"ally",job:"キャバリア",

      x:0,y:1,hp:14,maxHp:14,icon:"🐎",

      moved:false,acted:false,waited:false,

      atk:6,def:3,agi:6,dex:5,move:2,range:1,

      skills:["突撃"],

      resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}

    },

    {

      id:4,name:"敵隊長",side:"enemy",job:"ダークロード",

      role:"captain",x:6,y:3,hp:20,maxHp:20,icon:"💀",

      moved:false,acted:false,waited:false,

      atk:6,def:4,agi:4,dex:5,move:1,range:1,

      skills:["威圧"],personality:"commander",

      targetStyle:"captain",

      resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}

    },

    {

      id:5,name:"敵兵",side:"enemy",job:"ソルジャー",

      x:5,y:2,hp:14,maxHp:14,icon:"⚔️",

      moved:false,acted:false,waited:false,

      atk:5,def:3,agi:3,dex:4,move:1,range:1,

      skills:["なし"],personality:"hunter",

      targetStyle:"weakest",

      resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}

    },

    {

      id:7,name:"敵魔道士",side:"enemy",job:"ダークメイジ",

      x:7,y:1,hp:12,maxHp:12,icon:"🧙",

      moved:false,acted:false,waited:false,

      atk:8,def:2,agi:4,dex:6,move:1,range:2,

      skills:["魔法"],personality:"mage",

      targetStyle:"weakest",

      resistances:{物理:"未設定",魔法:"未設定",炎:"未設定",氷:"未設定"}

    }

  ];

  const initialUnitStates=units.map(u=>({

    ...u,resistances:{...u.resistances},skills:[...u.skills]

  }));

  const cols=8,rows=6,w=56,h=44,dx=42,dy=44;

  let selected=null;

  let selectedEnemy=null;

  let currentTurn="ally";

  let turn=1;

  let pendingMove=null;

  let moveMode=false;

  let attackMode=false;

  let menuOpen=false;

  let reaction=false;

  let combatAnimating=false;

  let battleEnded=false;

  let enemyQueue=[];

  let enemyQueueIndex=0;

  let enemyAIActive=false;

  let lastTapUnitId=null;

  let lastTapTime=0;

  let battleVisual=null;

  const DOUBLE_TAP_TIME=350;

  const CRITICAL_RATE=10;

  const CRITICAL_MULTIPLIER=2;

  const mapWidth=dx*(cols-1)+w;

  const mapHeight=(rows-1)*dy+h+h/2;

  Object.assign(map.style,{

    width:mapWidth+"px",height:mapHeight+"px",

    position:"relative",overflow:"visible",

    touchAction:"manipulation"

  });

  const svgNS="http://www.w3.org/2000/svg";

  const board=document.createElementNS(svgNS,"svg");

  board.setAttribute("viewBox",`0 0 ${mapWidth} ${mapHeight}`);

  board.setAttribute("width",mapWidth);

  board.setAttribute("height",mapHeight);

  Object.assign(board.style,{

    position:"absolute",left:"0",top:"0",

    width:mapWidth+"px",height:mapHeight+"px",

    pointerEvents:"auto",zIndex:"2",display:"block"

  });

  map.appendChild(board);

  const points=[[14,0],[42,0],[56,22],[42,44],[14,44],[0,22]];

  function position(x,y){

    return{x:x*dx,y:y*dy+(x%2)*(h/2)};

  }

  function polygonPoints(x,y){

    const p=position(x,y);

    return points.map(([px,py])=>`${p.x+px},${p.y+py}`).join(" ");

  }

  function getNeighbors(unit){

    const offsets=unit.x%2===0

      ?[[0,-1],[0,1],[-1,0],[-1,-1],[1,0],[1,-1]]

      :[[0,-1],[0,1],[-1,0],[-1,1],[1,0],[1,1]];

    return offsets.map(([ox,oy])=>({

      x:unit.x+ox,y:unit.y+oy

    })).filter(c=>c.x>=0&&c.x<cols&&c.y>=0&&c.y<rows);

  }

  function getDistance(x1,y1,x2,y2){

    const queue=[{x:x1,y:y1,d:0}];

    const visited=new Set([`${x1},${y1}`]);

    while(queue.length){

      const c=queue.shift();

      if(c.x===x2&&c.y===y2)return c.d;

      getNeighbors(c).forEach(n=>{

        const key=`${n.x},${n.y}`;

        if(!visited.has(key)){

          visited.add(key);

          queue.push({x:n.x,y:n.y,d:c.d+1});

        }

      });

    }

    return Infinity;

  }

  function getUnitAt(x,y){

    return units.find(u=>u.x===x&&u.y===y&&u.hp>0)||null;

  }

  function occupied(x,y,except){

    return units.some(u=>u!==except&&u.x===x&&u.y===y&&u.hp>0);

  }

  function getReachableCells(unit){

    const queue=[{x:unit.x,y:unit.y,d:0}];

    const visited=new Set([`${unit.x},${unit.y}`]);

    const reachable=[];

    while(queue.length){

      const current=queue.shift();

      if(current.d>=unit.move)continue;

      getNeighbors(current).forEach(next=>{

        const key=`${next.x},${next.y}`;

        if(visited.has(key)||occupied(next.x,next.y,unit))return;

        visited.add(key);

        reachable.push({x:next.x,y:next.y});

        queue.push({x:next.x,y:next.y,d:current.d+1});

      });

    }

    return reachable;

  }

  function isMage(unit){

    return unit.name==="魔道士"||unit.name==="敵魔道士";

  }

  function isUnitInAttackRange(attacker,defender){

    if(!attacker||!defender)return false;

    const distance=getDistance(

      attacker.x,attacker.y,defender.x,defender.y

    );

    if(isMage(attacker))return distance===2;

    return distance>=1&&distance<=attacker.range;

  }

  function isMoveTarget(x,y){

    if(!selected||selected.side!=="ally"||

       selected.moved||selected.acted||selected.waited||

       currentTurn!=="ally"||menuOpen||pendingMove||

       combatAnimating||battleEnded)return false;

    return getReachableCells(selected).some(c=>c.x===x&&c.y===y);

  }

  // 攻撃可能な距離にあるヘックス全体を判定する。

  // 敵がいない空きマスも攻撃範囲として表示する。

  function isAttackRangeCell(x,y){

    if(!selected||selected.side!=="ally"||

       selected.acted||selected.waited||

       battleVisual||battleEnded)return false;

    const target=getUnitAt(x,y);

    if(target&&target.side==="ally")return false;

    const distance=getDistance(

      selected.x,selected.y,x,y

    );

    if(isMage(selected))return distance===2;

    return distance>=1&&distance<=selected.range;

  }

  function isAllyAttackCell(x,y){

    if(!selected||selected.side!=="ally"||

       selected.acted||selected.waited)return false;

    const target=getUnitAt(x,y);

    if(!target||target.side!=="enemy")return false;

    return isUnitInAttackRange(selected,target);

  }

  function drawBattleVisual(){

    if(!battleVisual)return;

    const attacker=battleVisual.attacker;

    const defender=battleVisual.defender;

    if(!attacker||!defender||

       attacker.hp<=0||defender.hp<=0)return;

    const attackerHex=document.createElementNS(svgNS,"polygon");

    attackerHex.setAttribute("points",polygonPoints(attacker.x,attacker.y));

    attackerHex.setAttribute("class","battle-hex-attacker");

    board.appendChild(attackerHex);

    const defenderHex=document.createElementNS(svgNS,"polygon");

    defenderHex.setAttribute("points",polygonPoints(defender.x,defender.y));

    defenderHex.setAttribute("class","battle-hex-defender");

    board.appendChild(defenderHex);

    const a=position(attacker.x,attacker.y);

    const d=position(defender.x,defender.y);

    const ax=a.x+28;

    const ay=a.y+22;

    const dx2=d.x+28;

    const dy2=d.y+22;

    const vx=dx2-ax;

    const vy=dy2-ay;

    const length=Math.sqrt(vx*vx+vy*vy);

    if(length>0){

      // 始点と終点を、それぞれのヘックスの中心にする。

      const startX=ax;

      const startY=ay;

      const endX=dx2;

      const endY=dy2;

      const color=attacker.side==="ally"?"#ff9800":"#29b6f6";

      const defs=document.createElementNS(svgNS,"defs");

      const marker=document.createElementNS(svgNS,"marker");

      marker.setAttribute("id","battleArrowHead");

      marker.setAttribute("markerWidth","12");

      marker.setAttribute("markerHeight","12");

      marker.setAttribute("refX","11");

      marker.setAttribute("refY","6");

      marker.setAttribute("orient","auto");

      marker.setAttribute("markerUnits","userSpaceOnUse");

      const arrowHead=document.createElementNS(svgNS,"path");

      arrowHead.setAttribute("d","M0,0 L12,6 L0,12 Z");

      arrowHead.setAttribute("fill",color);

      marker.appendChild(arrowHead);

      defs.appendChild(marker);

      board.appendChild(defs);

      const line=document.createElementNS(svgNS,"line");

      line.setAttribute("x1",startX);

      line.setAttribute("y1",startY);

      line.setAttribute("x2",startX);

      line.setAttribute("y2",startY);

      line.setAttribute(

        "class",

        "battle-arrow "+

        (attacker.side==="ally"?"ally-arrow":"enemy-arrow")

      );

      line.setAttribute("marker-end","url(#battleArrowHead)");

      board.appendChild(line);

      const animateX=document.createElementNS(svgNS,"animate");

      animateX.setAttribute("attributeName","x2");

      animateX.setAttribute(

        "values",

        `${startX};${endX};${endX};${startX}`

      );

      animateX.setAttribute("keyTimes","0;0.72;0.9;1");

      animateX.setAttribute("dur","1.25s");

      animateX.setAttribute("repeatCount","indefinite");

      line.appendChild(animateX);

      const animateY=document.createElementNS(svgNS,"animate");

      animateY.setAttribute("attributeName","y2");

      animateY.setAttribute(

        "values",

        `${startY};${endY};${endY};${startY}`

      );

      animateY.setAttribute("keyTimes","0;0.72;0.9;1");

      animateY.setAttribute("dur","1.25s");

      animateY.setAttribute("repeatCount","indefinite");

      line.appendChild(animateY);

      const animateOpacity=document.createElementNS(svgNS,"animate");

      animateOpacity.setAttribute("attributeName","opacity");

      animateOpacity.setAttribute(

        "values",

        "0;1;1;0"

      );

      animateOpacity.setAttribute("keyTimes","0;0.12;0.78;1");

      animateOpacity.setAttribute("dur","1.25s");

      animateOpacity.setAttribute("repeatCount","indefinite");

      line.appendChild(animateOpacity);

    }

  }

  function drawBoard(){

    board.innerHTML="";

    // 盤面の基本ヘックスを描画

    for(let y=0;y<rows;y++){

      for(let x=0;x<cols;x++){

        const unit=getUnitAt(x,y);

        const poly=document.createElementNS(svgNS,"polygon");

        poly.setAttribute("points",polygonPoints(x,y));

        poly.dataset.x=x;

        poly.dataset.y=y;

        const fill=unit

          ?(unit.side==="ally"?"#b9d8f5":"#f3baba")

          :"#d4d0bd";

        poly.setAttribute("fill",fill);

        poly.setAttribute("stroke","#777");

        poly.setAttribute("stroke-width","1");

        poly.style.pointerEvents="auto";

        board.appendChild(poly);

      }

    }

    // 移動可能なヘックスを青く表示

    if(selected&&selected.side==="ally"&&

       !pendingMove&&!battleVisual&&

       !battleEnded&&!selected.moved&&

       !selected.acted&&!selected.waited&&

       currentTurn==="ally"&&!menuOpen){

      for(let y=0;y<rows;y++){

        for(let x=0;x<cols;x++){

          if(isMoveTarget(x,y)){

            const moveHex=document.createElementNS(svgNS,"polygon");

            moveHex.setAttribute("points",polygonPoints(x,y));

            moveHex.setAttribute("class","move-range-hex");

            board.appendChild(moveHex);

          }

        }

      }

    }

    // 移動前から攻撃範囲も赤く表示する。

    // 青と赤はCSSで交互に点滅する。

    if(selected&&selected.side==="ally"&&

       !battleVisual&&!battleEnded&&!menuOpen&&

       !selected.acted&&!selected.waited&&

       currentTurn==="ally"){

      for(let y=0;y<rows;y++){

        for(let x=0;x<cols;x++){

          if(isAttackRangeCell(x,y)){

            const attackHex=document.createElementNS(svgNS,"polygon");

            attackHex.setAttribute("points",polygonPoints(x,y));

            attackHex.setAttribute("class","attack-range-hex");

            board.appendChild(attackHex);

          }

        }

      }

    }

    // 選択中ユニットの枠

    if(selected){

      const s=document.createElementNS(svgNS,"polygon");

      s.setAttribute("points",polygonPoints(selected.x,selected.y));

      s.setAttribute("stroke",pendingMove?"#e53935":"#e5a000");

      s.setAttribute("fill","none");

      s.setAttribute("stroke-width","4");

      s.style.pointerEvents="none";

      board.appendChild(s);

    }

    drawBattleVisual();

  }

  function drawUnits(){

    map.querySelectorAll(".unit-token").forEach(el=>el.remove());

    units.forEach(unit=>{

      if(unit.hp<=0)return;

      const p=position(unit.x,unit.y);

      const token=document.createElement("div");

      token.className="unit-token";

      token.dataset.x=unit.x;

      token.dataset.y=unit.y;

      token.dataset.unitId=unit.id;

      token.style.left=p.x+"px";

      token.style.top=p.y+"px";

      token.innerHTML=`

        <div class="unit-content">

          <div class="unit-icon">${unit.icon}</div>

          <div class="unit-name">${unit.name}</div>

          <div class="unit-hp">${unit.hp}/${unit.maxHp}</div>

        </div>`;

      map.appendChild(token);

    });

  }  function refresh(){

    drawBoard();

    drawUnits();

    pendingWaitButton.style.display=

      pendingMove?"inline-block":"none";

    turnLabel.textContent=currentTurn==="ally"

      ?"味方のターン":"敵のターン";

    endTurnButton.disabled=

      battleEnded||combatAnimating||menuOpen||

      pendingMove||reaction||enemyAIActive;

  }

  function animateUnit(unit,className){

    const token=map.querySelector(

      `.unit-token[data-unit-id="${unit.id}"]`

    );

    if(!token)return;

    token.classList.remove(className);

    void token.offsetWidth;

    token.classList.add(className);

  }

  function showCombatEffect(unit,value,miss){

    const p=position(unit.x,unit.y);

    const effect=document.createElement("div");

    effect.className=miss?"combat-miss":"combat-number";

    effect.textContent=miss?"MISS":"-"+value;

    effect.style.left=(p.x+28)+"px";

    effect.style.top=(p.y-5)+"px";

    map.appendChild(effect);

    setTimeout(()=>effect.remove(),1000);

  }

  function cancelMove(){

    if(!pendingMove)return;

    const unit=pendingMove.unit;

    unit.x=pendingMove.fromX;

    unit.y=pendingMove.fromY;

    unit.moved=false;

    pendingMove=null;

    moveMode=false;

    attackMode=false;

    menuOpen=false;

    selected=unit;

    info.innerHTML=`<p>${unit.name}は元の位置に戻った。</p>`;

    refresh();

  }

  function finishMoveAndWait(){

    if(!pendingMove)return;

    const unit=pendingMove.unit;

    unit.moved=true;

    unit.acted=true;

    unit.waited=true;

    pendingMove=null;

    moveMode=false;

    attackMode=false;

    menuOpen=false;

    selected=null;

    info.innerHTML=`<p>${unit.name}は移動して待機した。</p>`;

    refresh();

  }

  function showDetails(unit){

    if(!unit)return;

    info.innerHTML=`

      <h3>${unit.icon} ${unit.name}</h3>

      <p>HP：${unit.hp}/${unit.maxHp}</p>

      <p>攻撃：${unit.atk}　防御：${unit.def}</p>

      <p>速さ：${unit.agi}　技量：${unit.dex}</p>

      <p>移動：${unit.move}　射程：${unit.range}</p>

      <p>スキル：${unit.skills.join("、")}</p>

      <button id="detailClose">閉じる</button>`;

    menuOpen=true;

    document.querySelector("#detailClose").onclick=()=>{

      menuOpen=false;

      info.innerHTML="ユニットを選択してね";

      refresh();

    };

    refresh();

  }

  function closeMenuByEmptyTap(){

    if(pendingMove){

      cancelMove();

      return;

    }

    menuOpen=false;

    moveMode=false;

    attackMode=false;

    selected=null;

    selectedEnemy=null;

    lastTapUnitId=null;

    lastTapTime=0;

    battleVisual=null;

    info.innerHTML="ユニットを選択してね";

    refresh();

  }

  function showActionMenu(unit){

    if(!unit||unit.hp<=0)return;

    selected=unit;

    selectedEnemy=null;

    menuOpen=true;

    moveMode=false;

    attackMode=false;

    battleVisual=null;

    const canMove=!unit.moved&&!unit.acted&&!unit.waited;

    const canAct=!unit.acted&&!unit.waited;

    info.innerHTML=`

      <h3>${unit.icon} ${unit.name}</h3>

      <p>HP：${unit.hp}/${unit.maxHp}</p>

      <p>攻撃：${unit.atk}　防御：${unit.def}</p>

      <button id="actMove" ${canMove?"":"disabled"}>移動</button>

      <button id="actAttack" ${canAct?"":"disabled"}>攻撃</button>

      <button id="actSkill" ${canAct?"":"disabled"}>スキル</button>

      <button id="actItem" ${canAct?"":"disabled"}>アイテム</button>

      <button id="actDetails">能力確認</button>

      <button id="actWait">待機</button>

      <button id="actCancel">キャンセル</button>`;

    document.querySelector("#actMove").onclick=()=>{

      if(!canMove)return;

      menuOpen=false;

      moveMode=true;

      attackMode=false;

      info.innerHTML=`<p>${unit.name}：青い範囲から移動先を選んでね。</p>`;

      refresh();

    };

    document.querySelector("#actAttack").onclick=()=>{

      if(canAct)showAttackMenu(unit);

    };

    document.querySelector("#actSkill").onclick=()=>{

      if(canAct)showSkillMenu(unit);

    };

    document.querySelector("#actItem").onclick=()=>{

      if(canAct)showItemMenu(unit);

    };

    document.querySelector("#actDetails").onclick=()=>{

      showDetails(unit);

    };

    document.querySelector("#actWait").onclick=()=>{

      if(pendingMove){

        finishMoveAndWait();

      }else{

        unit.acted=true;

        unit.waited=true;

        selected=null;

        menuOpen=false;

        info.innerHTML=`<p>${unit.name}は待機した。</p>`;

        refresh();

      }

    };

    document.querySelector("#actCancel").onclick=()=>{

      if(pendingMove){

        cancelMove();

      }else{

        menuOpen=false;

        selected=null;

        info.innerHTML="ユニットを選択してね";

        refresh();

      }

    };

    refresh();

  }

  function showAttackMenu(unit){

    selected=unit;

    menuOpen=false;

    moveMode=false;

    attackMode=true;

    battleVisual=null;

    info.innerHTML=`

      <p>${unit.name}：攻撃する敵を選んでね。</p>

      <button id="attackCancel">戻る</button>`;

    document.querySelector("#attackCancel").onclick=()=>{

      attackMode=false;

      showActionMenu(unit);

    };

    refresh();

  }

  function showSkillMenu(unit){

    menuOpen=true;

    attackMode=false;

    moveMode=false;

    battleVisual=null;

    let html=`<h3>${unit.name}のスキル</h3>`;

    unit.skills.forEach((skill,i)=>{

      html+=`<button data-skill="${i}">${skill}</button>`;

    });

    html+=`<button id="skillBack">戻る</button>`;

    info.innerHTML=html;

    info.querySelectorAll("[data-skill]").forEach(button=>{

      button.onclick=()=>{

        const skill=unit.skills[Number(button.dataset.skill)];

        if(skill==="指揮"){

          unit.acted=true;

          unit.waited=true;

          selected=null;

          menuOpen=false;

          info.innerHTML="<p>隊長は味方を鼓舞した。</p>";

          refresh();

          return;

        }

        if(skill==="防御"){

          unit.defending=true;

          unit.acted=true;

          unit.waited=true;

          selected=null;

          menuOpen=false;

          info.innerHTML="<p>重装兵は防御態勢を取った。</p>";

          refresh();

          return;

        }

        if(skill==="魔法"||skill==="突撃"){

          showAttackMenu(unit);

        }

      };

    });

    document.querySelector("#skillBack").onclick=()=>{

      showActionMenu(unit);

    };

    refresh();

  }

  function showItemMenu(unit){

    menuOpen=true;

    battleVisual=null;

    info.innerHTML=`

      <h3>アイテム</h3>

      <p>使用できるアイテムはありません。</p>

      <button id="itemBack">戻る</button>`;

    document.querySelector("#itemBack").onclick=()=>{

      showActionMenu(unit);

    };

    refresh();

  }

  function calculateHit(attacker,defender){

    const chance=75+(attacker.dex-defender.agi)*3;

    return Math.max(20,Math.min(95,chance));

  }

  function calculateDamage(attacker,defender){

    return Math.max(1,attacker.atk-defender.def);

  }

  // 回避率は防御側の速さと攻撃側の技量で決める。

  // 基本30％、能力差1ごとに5％変動、最低10％・最高70％。

  function calculateEvadeChance(attacker,defender){

    const chance=30+(defender.agi-attacker.dex)*5;

    return Math.max(10,Math.min(70,chance));

  }

  function getCombatPrediction(attacker,defender,response){

    const hit=calculateHit(attacker,defender);

    let damage=calculateDamage(attacker,defender);

    if(response==="defend"||response==="skill"){

      damage=Math.max(1,Math.floor(damage/2));

    }

    const evadeChance=response==="evade"

      ?calculateEvadeChance(attacker,defender):0;

    const canCounter=defender.hp>0&&

      isUnitInAttackRange(defender,attacker);

    const counterDamage=canCounter

      ?calculateDamage(defender,attacker):0;

    return{

      hit,

      damage,

      evadeChance,

      counterDamage,

      canCounter

    };

  }

  function hpBarHTML(unit,predictedDamage){

    const percent=Math.max(0,unit.hp/unit.maxHp*100);

    const predicted=Math.max(0,Math.min(

      percent,predictedDamage/unit.maxHp*100

    ));

    return`

      <div class="hp-track">

        <div class="hp-fill ${

          unit.side==="ally"?"hp-ally":"hp-enemy"

        }" style="width:${percent}%"></div>

        ${

          predictedDamage>0

          ?`<div class="hp-predicted"

              style="left:${Math.max(0,percent-predicted)}%;

              width:${predicted}%"></div>`:""

        }

      </div>

      <div class="battle-hp-text">

        ${unit.hp}/${unit.maxHp}

        ${predictedDamage>0

          ?` → ${Math.max(0,unit.hp-predictedDamage)}`:""}

      </div>`;

  }

  function battlePanelHTML(attacker,defender,prediction){

    return`

      <div class="battle-panel">

        <div class="battle-side">

          <div class="battle-name">${attacker.icon}${attacker.name}</div>

          ${hpBarHTML(attacker,prediction.counterDamage)}

          <div>攻撃 ${attacker.atk}</div>

        </div>

        <div class="battle-center">VS</div>

        <div class="battle-side">

          <div class="battle-name">${defender.icon}${defender.name}</div>

          ${hpBarHTML(defender,prediction.damage)}

          <div>攻撃 ${defender.atk}</div>

        </div>

      </div>`;

  }

  // 回避を選んだ場合は、回避率と失敗時のダメージを表示する。

  function predictionHTML(prediction,response){

    if(response==="evade"){

      return`

        <p>回避率：${prediction.evadeChance}％

        通常命中率：${prediction.hit}％</p>

        <p>回避失敗時の予測ダメージ：${prediction.damage}</p>

        <p>反撃ダメージ：反撃なし</p>`;

    }

    return`

      <p>命中率：${prediction.hit}％

      予測ダメージ：${prediction.damage}</p>

      <p>反撃ダメージ：${

        prediction.canCounter?prediction.counterDamage:"反撃不可"

      }</p>`;

  }

  function showCombatConfirmation(attacker,defender,response){

    if(!attacker||!defender)return;

    const prediction=getCombatPrediction(attacker,defender,response);

    menuOpen=true;

    attackMode=false;

    moveMode=false;

    selectedEnemy=defender;

    battleVisual={attacker:attacker,defender:defender};

    info.innerHTML=`

      <h3>戦闘確認</h3>

      <button id="combatStart">戦闘開始</button>

      <button id="combatBack">戻る</button>

      ${battlePanelHTML(attacker,defender,prediction)}

      ${predictionHTML(prediction,response)}

      <p>オレンジ：攻撃側　青：防御側</p>`;

    document.querySelector("#combatStart").onclick=()=>{

      if(!combatAnimating)resolveAttack(attacker,defender,response);

    };

    document.querySelector("#combatBack").onclick=()=>{

      battleVisual=null;

      if(attacker.side==="enemy"){

        showReactionMenu(attacker,defender);

      }else{

        showAttackMenu(attacker);

      }

    };

    refresh();

  }

  function showReactionMenu(attacker,defender){

    reaction=true;

    menuOpen=true;

    attackMode=false;

    moveMode=false;

    battleVisual=null;

    const canCounter=isUnitInAttackRange(defender,attacker);

    info.innerHTML=`

      <h3>敵の攻撃！</h3>

      <p>${attacker.name}が${defender.name}を攻撃する。</p>

      <p>どう対応する？</p>

      <button id="reactCounter" ${canCounter?"":"disabled"}>反撃</button>

      <button id="reactDefend">防御</button>

      <button id="reactEvade">回避</button>

      <button id="reactSkill">スキル</button>`;

    document.querySelector("#reactCounter").onclick=()=>{

      reaction=false;

      showCombatConfirmation(attacker,defender,"counter");

    };

    document.querySelector("#reactDefend").onclick=()=>{

      reaction=false;

      showCombatConfirmation(attacker,defender,"defend");

    };

    document.querySelector("#reactEvade").onclick=()=>{

      reaction=false;

      showCombatConfirmation(attacker,defender,"evade");

    };

    document.querySelector("#reactSkill").onclick=()=>{

      reaction=false;

      showReactionSkills(attacker,defender);

    };

    refresh();

  }

  function showReactionSkills(attacker,defender){

    menuOpen=true;

    reaction=true;

    battleVisual=null;

    info.innerHTML=`

      <h3>防御スキル</h3>

      <p>防御スキルを使用する。</p>

      <button id="reactionSkillUse">防御態勢</button>

      <button id="reactionSkillBack">戻る</button>`;

    document.querySelector("#reactionSkillUse").onclick=()=>{

      reaction=false;

      showCombatConfirmation(attacker,defender,"skill");

    };

    document.querySelector("#reactionSkillBack").onclick=()=>{

      showReactionMenu(attacker,defender);

    };

    refresh();

  }  function resetBattle(){

    units.forEach((unit,index)=>{

      const initial=initialUnitStates[index];

      Object.assign(unit,{

        ...initial,

        resistances:{...initial.resistances},

        skills:[...initial.skills]

      });

    });

    selected=null;

    selectedEnemy=null;

    currentTurn="ally";

    turn=1;

    pendingMove=null;

    moveMode=false;

    attackMode=false;

    menuOpen=false;

    reaction=false;

    combatAnimating=false;

    battleEnded=false;

    enemyQueue=[];

    enemyQueueIndex=0;

    enemyAIActive=false;

    lastTapUnitId=null;

    lastTapTime=0;

    battleVisual=null;

    map.querySelectorAll(".combat-number,.combat-miss")

      .forEach(el=>el.remove());

    info.innerHTML="<p>新しい戦いが始まった。ユニットを選択してね。</p>";

    refresh();

  }

  function showStory(title,message,buttonText,callback){

    const overlay=document.createElement("div");

    overlay.className="story-overlay";

    const panel=document.createElement("div");

    panel.className="story-panel";

    const heading=document.createElement("h2");

    heading.textContent=title;

    const paragraph=document.createElement("p");

    paragraph.textContent=message;

    const button=document.createElement("button");

    button.textContent=buttonText;

    button.onclick=()=>{

      overlay.remove();

      if(callback)callback();

    };

    panel.appendChild(heading);

    panel.appendChild(paragraph);

    panel.appendChild(button);

    overlay.appendChild(panel);

    game.appendChild(overlay);

  }

  function checkBattleEnd(){

    const allyCaptain=units.find(

      u=>u.side==="ally"&&u.role==="captain"

    );

    const enemyCaptain=units.find(

      u=>u.side==="enemy"&&u.role==="captain"

    );

    if(!allyCaptain||allyCaptain.hp<=0){

      battleEnded=true;

      combatAnimating=false;

      battleVisual=null;

      showStory(

        "敗北",

        "隊長が倒れた。\n味方部隊は撤退した。",

        "終了",

        resetBattle

      );

      refresh();

      return true;

    }

    if(!enemyCaptain||enemyCaptain.hp<=0){

      battleEnded=true;

      combatAnimating=false;

      battleVisual=null;

      showStory(

        "勝利",

        "敵隊長を撃破した。\n戦いは味方の勝利に終わった。",

        "終了",

        resetBattle

      );

      refresh();

      return true;

    }

    return false;

  }

  // 回避判定に成功すれば攻撃を避ける。

  // 失敗した場合は、通常の命中判定に進む。

  function applyDamage(attacker,defender,damage,response,evadeChance){

    if(response==="evade"){

      const evadeSuccess=Math.random()*100<evadeChance;

      if(evadeSuccess){

        showCombatEffect(defender,0,true);

        return false;

      }

    }

    const hit=Math.random()*100<calculateHit(attacker,defender);

    if(!hit){

      showCombatEffect(defender,0,true);

      return false;

    }

    let actualDamage=damage;

    const critical=Math.random()*100<CRITICAL_RATE;

    if(critical)actualDamage*=CRITICAL_MULTIPLIER;

    actualDamage=Math.max(1,actualDamage);

    defender.hp=Math.max(0,defender.hp-actualDamage);

    showCombatEffect(defender,actualDamage,false);

    animateUnit(defender,"combat-hit");

    return true;

  }

  function resolveAttack(attacker,defender,response){

    if(combatAnimating||battleEnded)return;

    combatAnimating=true;

    menuOpen=true;

    battleVisual=null;

    const isEnemyAttack=attacker.side==="enemy";

    const isAllyAttack=attacker.side==="ally";

    const prediction=getCombatPrediction(

      attacker,defender,response

    );

    info.innerHTML=`

      <h3>戦闘中</h3>

      ${battlePanelHTML(attacker,defender,prediction)}

      <p>戦闘を解決しています……</p>`;

    refresh();

    animateUnit(attacker,"combat-attacking");

    setTimeout(()=>{

      if(battleEnded)return;

      applyDamage(

        attacker,

        defender,

        prediction.damage,

        response,

        prediction.evadeChance

      );

      refresh();

      setTimeout(()=>{

        if(checkBattleEnd())return;

        let counterTarget=null;

        let counterAttacker=null;

        if(isEnemyAttack){

          if(response==="counter"&&

             defender.hp>0&&

             isUnitInAttackRange(defender,attacker)){

            counterAttacker=defender;

            counterTarget=attacker;

          }

        }

        if(isAllyAttack&&

           defender.hp>0&&

           isUnitInAttackRange(defender,attacker)){

          counterAttacker=defender;

          counterTarget=attacker;

        }

        if(counterAttacker&&counterTarget){

          setTimeout(()=>{

            if(battleEnded)return;

            animateUnit(counterAttacker,"combat-attacking");

            const counterDamage=calculateDamage(

              counterAttacker,counterTarget

            );

            applyDamage(

              counterAttacker,counterTarget,counterDamage

            );

            refresh();

            setTimeout(()=>{

              finishCombat(attacker,defender,isEnemyAttack);

            },500);

          },450);

        }else{

          setTimeout(()=>{

            finishCombat(attacker,defender,isEnemyAttack);

          },500);

        }

      },500);

    },400);

  }

  function finishCombat(attacker,defender,isEnemyAttack){

    combatAnimating=false;

    menuOpen=false;

    battleVisual=null;

    if(checkBattleEnd())return;

    if(isEnemyAttack){

      selected=null;

      reaction=false;

      info.innerHTML="<p>敵の攻撃が終了した。</p>";

      refresh();

      setTimeout(()=>processEnemyTurn(),500);

      return;

    }

    const actingUnit=attacker;

    actingUnit.acted=true;

    actingUnit.moved=actingUnit.moved||Boolean(pendingMove);

    actingUnit.waited=true;

    if(pendingMove)pendingMove=null;

    selected=null;

    selectedEnemy=null;

    attackMode=false;

    moveMode=false;

    info.innerHTML=`<p>${actingUnit.name}の行動が終了した。</p>`;

    refresh();

  }

  // 敵の標的を決める

  function chooseEnemyTarget(enemy){

    const allies=units.filter(u=>u.side==="ally"&&u.hp>0);

    if(!allies.length)return null;

    const allyCaptain=allies.find(u=>u.role==="captain");

    // 敵隊長は味方隊長を優先する。

    // 味方隊長の隣に護衛がいる場合は、その護衛を攻撃する。

    if(enemy.targetStyle==="captain"&&allyCaptain){

      const guards=allies.filter(u=>

        u.id!==allyCaptain.id&&

        getDistance(u.x,u.y,allyCaptain.x,allyCaptain.y)===1

      );

      if(guards.length){

        guards.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));

        return guards[0];

      }

      return allyCaptain;

    }

    // 敵隊長の周囲に味方が迫ったら、護衛役が迎撃する。

    const enemyCaptain=units.find(

      u=>u.side==="enemy"&&u.role==="captain"&&u.hp>0

    );

    if(enemyCaptain){

      const threats=allies.filter(u=>

        getDistance(u.x,u.y,enemyCaptain.x,enemyCaptain.y)<=1

      );

      if(threats.length){

        threats.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp));

        return threats[0];

      }

    }

    // 敵兵・敵魔道士はHP割合の低い味方を狙う。

    allies.sort((a,b)=>{

      const aRate=a.hp/a.maxHp;

      const bRate=b.hp/b.maxHp;

      if(aRate!==bRate)return aRate-bRate;

      return a.hp-b.hp;

    });

    return allies[0];

  }

  // 敵の経路探索。

  // 他ユニットを障害物として扱い、迂回して攻撃可能な位置を探す。

  function moveEnemyToward(enemy,target){

    const queue=[{

      x:enemy.x,y:enemy.y,firstStep:null,d:0

    }];

    const visited=new Set([`${enemy.x},${enemy.y}`]);

    const goals=[];

    while(queue.length){

      const current=queue.shift();

      if(current.d>0){

        const distance=getDistance(

          current.x,current.y,target.x,target.y

        );

        const canAttack=isMage(enemy)

          ?distance===2

          :(distance>=1&&distance<=enemy.range);

        if(canAttack){

          goals.push(current);

          continue;

        }

      }

      getNeighbors(current).forEach(next=>{

        const key=`${next.x},${next.y}`;

        if(visited.has(key)||occupied(next.x,next.y,enemy))return;

        visited.add(key);

        queue.push({

          x:next.x,

          y:next.y,

          firstStep:current.firstStep||{

            x:next.x,y:next.y

          },

          d:current.d+1

        });

      });

    }

    if(!goals.length)return false;

    goals.sort((a,b)=>{

      if(a.d!==b.d)return a.d-b.d;

      const da=getDistance(a.x,a.y,target.x,target.y);

      const db=getDistance(b.x,b.y,target.x,target.y);

      return da-db;

    });

    const best=goals[0];

    if(!best.firstStep)return false;

    enemy.x=best.firstStep.x;

    enemy.y=best.firstStep.y;

    enemy.moved=true;

    return true;

  }  function startEnemyTurn(){

    if(battleEnded)return;

    currentTurn="enemy";

    turn++;

    selected=null;

    selectedEnemy=null;

    pendingMove=null;

    moveMode=false;

    attackMode=false;

    menuOpen=false;

    reaction=false;

    battleVisual=null;

    enemyAIActive=true;

    units.forEach(unit=>{

      if(unit.side==="enemy"){

        unit.moved=false;

        unit.acted=false;

        unit.waited=false;

      }

    });

    enemyQueue=units.filter(

      u=>u.side==="enemy"&&u.hp>0

    );

    enemyQueueIndex=0;

    info.innerHTML="<p>敵のターン。</p>";

    refresh();

    setTimeout(processEnemyTurn,500);

  }

  function processEnemyTurn(){

    if(battleEnded)return;

    if(enemyQueueIndex>=enemyQueue.length){

      startEnemyTurnFinish();

      return;

    }

    const enemy=enemyQueue[enemyQueueIndex];

    if(!enemy||enemy.hp<=0){

      enemyQueueIndex++;

      processEnemyTurn();

      return;

    }

    const target=chooseEnemyTarget(enemy);

    if(!target){

      startEnemyTurnFinish();

      return;

    }

    let canAttack=isUnitInAttackRange(enemy,target);

    // 射程外なら攻撃可能な位置まで移動する。

    // 魔道士は距離2の位置だけを攻撃地点とする。

    if(!canAttack){

      moveEnemyToward(enemy,target);

      canAttack=isUnitInAttackRange(enemy,target);

      refresh();

    }

    // 射程内ならプレイヤーの対応を待つ。

    if(canAttack){

      enemy.acted=true;

      enemyQueueIndex++;

      reaction=true;

      info.innerHTML=`<p>${enemy.name}が${target.name}に迫っている。</p>`;

      refresh();

      setTimeout(()=>{

        if(!battleEnded)showReactionMenu(enemy,target);

      },350);

      return;

    }

    enemy.moved=true;

    enemy.acted=true;

    enemyQueueIndex++;

    setTimeout(processEnemyTurn,350);

  }

  function startEnemyTurnFinish(){

    if(battleEnded)return;

    enemyAIActive=false;

    reaction=false;

    menuOpen=false;

    battleVisual=null;

    currentTurn="ally";

    units.forEach(unit=>{

      if(unit.side==="ally"){

        unit.moved=false;

        unit.acted=false;

        unit.waited=false;

        unit.defending=false;

      }

    });

    selected=null;

    selectedEnemy=null;

    info.innerHTML="<p>味方のターン。ユニットを選択してね。</p>";

    refresh();

  }

  function handleCellTap(x,y){

    if(battleEnded||combatAnimating||

       currentTurn!=="ally"||enemyAIActive)return;

    const unit=getUnitAt(x,y);

    // メニュー表示中に盤面をタップしたら閉じる。

    if(menuOpen){

      menuOpen=false;

      attackMode=false;

      moveMode=false;

    }

    // 攻撃モード

    if(attackMode){

      if(unit&&unit.side==="enemy"&&

         selected&&isAllyAttackCell(x,y)){

        showCombatConfirmation(selected,unit,"normal");

        return;

      }

      closeMenuByEmptyTap();

      return;

    }

    // 移動後の仮確定状態

    if(pendingMove){

      if(unit&&unit.side==="enemy"&&

         selected&&isAllyAttackCell(x,y)){

        showCombatConfirmation(selected,unit,"normal");

        return;

      }

      if(x===pendingMove.fromX&&y===pendingMove.fromY){

        cancelMove();

        return;

      }

      if(unit&&unit.side==="ally"){

        cancelMove();

        selected=unit;

        lastTapUnitId=unit.id;

        lastTapTime=Date.now();

        info.innerHTML=`<p>${unit.name}を選択した。もう一度タップで行動メニュー。</p>`;

        refresh();

        return;

      }

      // 移動後、別の空きマスをタップしたら移動を取り消す。

      cancelMove();

      return;

    }

    // 敵をタップした場合

    if(unit&&unit.side==="enemy"){

      if(selected&&selected.side==="ally"&&

         isAllyAttackCell(x,y)){

        showCombatConfirmation(selected,unit,"normal");

        return;

      }

      selected=null;

      selectedEnemy=unit;

      showDetails(unit);

      return;

    }

    // 味方をタップした場合

    if(unit&&unit.side==="ally"){

      const now=Date.now();

      if(selected&&selected.id===unit.id&&

         lastTapUnitId===unit.id&&

         now-lastTapTime<=DOUBLE_TAP_TIME){

        lastTapUnitId=null;

        lastTapTime=0;

        showActionMenu(unit);

        return;

      }

      selected=unit;

      selectedEnemy=null;

      lastTapUnitId=unit.id;

      lastTapTime=now;

      menuOpen=false;

      moveMode=false;

      attackMode=false;

      battleVisual=null;

      info.innerHTML=`

        <p>

          ${unit.icon} ${unit.name}を選択中。

          <br>

          青：移動可能範囲

          <br>

          赤：攻撃可能範囲

          <br>

          もう一度タップで行動メニュー

        </p>`;

      refresh();

      return;

    }

    // 空きマスをタップした場合、移動可能なら移動。

    if(selected&&selected.side==="ally"&&

       !selected.moved&&!selected.acted&&!selected.waited){

      const reachable=getReachableCells(selected);

      const valid=reachable.some(c=>c.x===x&&c.y===y);

      if(valid){

        const mover=selected;

        pendingMove={

          unit:mover,

          fromX:mover.x,

          fromY:mover.y

        };

        mover.x=x;

        mover.y=y;

        mover.moved=true;

        moveMode=false;

        attackMode=false;

        menuOpen=false;

        lastTapUnitId=null;

        lastTapTime=0;

        info.innerHTML=`

          <p>

            ${mover.name}が移動した。

            <br>

            赤く点滅する範囲が攻撃可能範囲。

            <br>

            赤い範囲内の敵をタップすると攻撃できる。

            <br>

            「移動して待機」で行動終了。

          </p>`;

        refresh();

        return;

      }

    }

    // 空白マスをタップしたら選択解除。

    closeMenuByEmptyTap();

  }

  map.addEventListener("click",function(e){

    const cell=e.target.closest("[data-x][data-y]");

    if(!cell){

      if(!reaction&&!combatAnimating){

        closeMenuByEmptyTap();

      }

      return;

    }

    const x=Number(cell.dataset.x);

    const y=Number(cell.dataset.y);

    handleCellTap(x,y);

  });

  endTurnButton.addEventListener("click",function(){

    if(battleEnded||combatAnimating||reaction||

       enemyAIActive||currentTurn!=="ally")return;

    if(pendingMove){

      cancelMove();

      return;

    }

    if(menuOpen){

      menuOpen=false;

      selected=null;

    }

    lastTapUnitId=null;

    lastTapTime=0;

    startEnemyTurn();

  });

  pendingWaitButton.addEventListener("click",function(){

    if(pendingMove)finishMoveAndWait();

  });

  // 初期表示

  selected=null;

  selectedEnemy=null;

  currentTurn="ally";

  turn=1;

  pendingMove=null;

  moveMode=false;

  attackMode=false;

  menuOpen=false;

  reaction=false;

  combatAnimating=false;

  battleEnded=false;

  enemyQueue=[];

  enemyQueueIndex=0;

  enemyAIActive=false;

  lastTapUnitId=null;

  lastTapTime=0;

  battleVisual=null;

  info.innerHTML="<p>ユニットを選択してね。</p>";

  refresh();

  // 戦闘開始前のストーリーと勝敗条件

  showStory(

    "戦端",

    "敵部隊が進軍を開始した。\n\n味方部隊は隊長を守りながら、敵の指揮官を撃破しなければならない。\n\n【勝利条件】\n敵隊長を撃破する。\n\n【敗北条件】\n味方隊長が撃破される。",

    "戦闘開始",

    function(){

      info.innerHTML="<p>戦闘開始。ユニットを選択してね。</p>";

      refresh();

    }

  );

});
