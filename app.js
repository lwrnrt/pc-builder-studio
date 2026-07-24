/* ============================================================
   PC Builder Studio — 主应用逻辑
   组装中心：配件库 + 主板拖拽装机（选配与装机已合并）
   ============================================================ */
'use strict';

/* ---------- 全局状态 ---------- */
let currentBuild = {};                 // {catKey: partId}
let currentUCs = ['game'];            // 当前使用场景（可多选，性能评估/推荐用）
let activeCat = 'cpu';                // 选配当前品类
const placed = {};                    // 插槽安装状态（与 currentBuild 同步）
let _didDrag = false;                 // 拖拽后抑制误触 click

/* ---------- 工具 ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const money = n => '¥'+Math.round(n).toLocaleString('zh-CN');
const catLabel = k => (CATS.find(c=>c.key===k)||{}).label||k;
function fmt(n){ return n; }

/* ============================================================
   标签导航
   ============================================================ */
function showView(name){
  $$('#tabs button').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
  $$('.view').forEach(v=>v.classList.toggle('active', v.id==='view-'+name));
  if(name==='perf') renderPerf();
  if(name==='build') renderBuild();
  window.scrollTo({top:0,behavior:'smooth'});
}
$('#tabs').addEventListener('click', e=>{ const b=e.target.closest('button[data-view]'); if(b) showView(b.dataset.view); });
$$('[data-goto]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.goto)));

/* ============================================================
   Hero 动态视觉（Canvas 电路流动）
   ============================================================ */
(function heroCanvas(){
  const cv=$('#heroCanvas'); if(!cv) return;
  const ctx=cv.getContext('2d'); let W,H,pts,raf;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize(){ const r=cv.getBoundingClientRect(); W=cv.width=Math.max(1,r.width*devicePixelRatio); H=cv.height=Math.max(1,r.height*devicePixelRatio); init(); }
  function init(){
    pts=[]; const n=46;
    for(let i=0;i<n;i++) pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*0.4*devicePixelRatio,vy:(Math.random()-.5)*0.4*devicePixelRatio,ph:Math.random()*6});
  }
  function draw(ts){
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<pts.length;i++){
      const a=pts[i];
      for(let j=i+1;j<pts.length;j++){
        const b=pts[j]; const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<140*devicePixelRatio){
          ctx.strokeStyle='rgba(34,211,238,'+(0.10*(1-d/(140*devicePixelRatio)))+')';
          ctx.lineWidth=1; ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
        }
      }
    }
    for(const p of pts){
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>W)p.vx*=-1; if(p.y<0||p.y>H)p.vy*=-1;
      const g=Math.sin((ts/1000)+p.ph)*0.5+0.5;
      ctx.fillStyle='rgba('+Math.round(34+g*120)+',211,238,'+(0.35+g*0.5)+')';
      ctx.beginPath();ctx.arc(p.x,p.y,(1.6+g*1.8)*devicePixelRatio,0,7);ctx.fill();
    }
    if(!reduce) raf=requestAnimationFrame(draw);
  }
  resize(); window.addEventListener('resize',resize);
  if(reduce){ draw(0); } else raf=requestAnimationFrame(draw);
})();
$('#stat-parts').textContent = Object.values(DB).reduce((a,c)=>a+c.length,0);

/* ============================================================
   智能推荐
   ============================================================ */
$('#ucChips').addEventListener('click',e=>{ const c=e.target.closest('.chip'); if(!c)return;
  const uc=c.dataset.uc;
  if(c.classList.contains('active')){
    // 已选中：仅当不止一个时才允许取消（至少保留一个场景）
    if(currentUCs.length>1){ currentUCs=currentUCs.filter(x=>x!==uc); c.classList.remove('active'); }
    else { toast('至少需选择一个使用场景','err'); }
  } else {
    currentUCs.push(uc); c.classList.add('active');
  }
});

const bMin=$('#budgetMin'), bMax=$('#budgetMax');
function syncBudget(){
  let lo=+bMin.value, hi=+bMax.value;
  if(lo>hi){ [lo,hi]=[hi,lo]; }
  $('#budgetMinVal').textContent=money(lo);
  $('#budgetMaxVal').textContent=money(hi);
  $('#budgetHint').textContent='当前区间 '+money(lo)+' – '+money(hi);
  return [lo,hi];
}
bMin.addEventListener('input',syncBudget); bMax.addEventListener('input',syncBudget);
syncBudget();

$('#btnRecommend').addEventListener('click',()=>{
  const [lo,hi]=syncBudget();
  const plans=recommend(currentUCs, lo, hi);
  const ucLabels = currentUCs.map(k=>(USE_CASES[k]||USE_CASES.game).label);
  const list=$('#planList'); list.innerHTML='';
  plans.forEach((p)=>{
    const card=document.createElement('div'); card.className='plan';
    let rows='';
    CATS.forEach(c=>{ const part=findPart(c.key,p.build[c.key]); if(part) rows+=`<div class="it"><span>${c.label}</span><span>${part.name}</span></div>`; });
    let sceneTxt;
    if(currentUCs.length===1){
      const uc=USE_CASES[currentUCs[0]];
      sceneTxt = uc.key==='game'?`2K 高画质约 ${p.eval.fps.p1440} FPS，畅玩主流大作`
        : uc.key==='render'?`渲染效率指数 ${p.eval.renderIdx}，多核并行流畅`
        : `日常办公、多任务流畅，核显足够`;
    } else {
      const bits=[];
      if(currentUCs.includes('game')) bits.push(`2K 约 ${p.eval.fps.p1440} FPS`);
      if(currentUCs.some(k=>(USE_CASES[k]||{}).key==='render')) bits.push(`渲染指数 ${p.eval.renderIdx}`);
      if(currentUCs.includes('office')) bits.push(`办公多任务流畅`);
      sceneTxt=`均衡「${ucLabels.join(' + ')}」：${bits.join(' · ')}`;
    }
    card.innerHTML=`
      <div class="tier"><h3>${p.name}</h3><span class="tag">${p.tag}</span></div>
      <div style="display:flex;gap:12px;align-items:center">
        <div class="grade ${p.value.grade}">${p.value.grade}</div>
        <div><div class="price">${money(p.price)} <small>预估总价</small></div>
        <div style="font-size:11.5px;color:var(--muted)">${p.value.text} · 综合 ${p.eval.overall} 分</div></div>
      </div>
      <div class="desc">${sceneTxt}</div>
      <div class="plist">${rows}</div>
      <div class="foot">
        <button class="btn sm" data-apply>采用此方案</button>
        <button class="btn ghost sm" data-detail>评估详情</button>
      </div>`;
    list.appendChild(card);
    card.querySelector('[data-apply]').addEventListener('click',()=>{ currentBuild={...p.build}; toast('已采用「'+p.name+'」，请在组装中心查看','ok'); showView('build'); });
    card.querySelector('[data-detail]').addEventListener('click',()=>{ currentBuild={...p.build}; showView('perf'); });
  });
  toast('已生成 '+plans.length+' 套方案','ok');
});

/* ============================================================
   组装中心：配件库 + 主板拖拽装机
   ============================================================ */
/* 可上主板插槽的品类（主板=底板本身，机箱/风扇不在板上）*/
const SLOTTABLE=['cpu','cooler','ram','ssd','gpu','psu'];
const SLOT_DEFS=[
  {cat:'cpu',   x:22, y:12, w:20, h:22, label:'CPU 插槽', cap:'处理器'},
  {cat:'cooler',x:46, y:12, w:22, h:22, label:'散热器位', cap:'风冷/水冷'},
  {cat:'ram',   x:22, y:40, w:46, h:10, label:'内存插槽', cap:'DDR4/DDR5'},
  {cat:'ssd',   x:22, y:54, w:30, h:8,  label:'M.2 接口', cap:'NVMe 硬盘'},
  {cat:'gpu',   x:22, y:66, w:52, h:18, label:'PCIe 插槽', cap:'显卡'},
  {cat:'psu',   x:74, y:56, w:20, h:32, label:'电源接口', cap:'供电'}
];

function partMeta(cat,p){
  switch(cat){
    case 'cpu': return [['接口',p.socket],['功耗',p.tdp+'W'],['核显',p.igpu?'有':'无']];
    case 'mobo': return [['接口',p.socket],['板型',p.form],['内存',p.memType+' ≤'+p.memMaxFreq]];
    case 'gpu': return [['显存',p.vram+'G'],['长度',p.len+'mm'],['功耗',p.tdp+'W']];
    case 'ram': return [['类型',p.type],['频率',p.freq+'MHz'],['容量',p.cap+'G']];
    case 'ssd': return [['接口',p.iface],['容量',p.cap+'G'],['读取',p.readMB+'MB/s']];
    case 'psu': return [['功率',p.watt+'W'],['认证',p.cert]];
    case 'cooler': return [['类型',p.type],['压制',p.tdp+'W'],['规格',p.type==='Air'?(p.height+'mm'):(p.radiator+'冷排')]];
    case 'case': return [['板型',p.form.join('/')],['限长',p.maxGpu+'mm'],['限高',p.maxCooler+'mm']];
    case 'fan': return [['尺寸',p.size+'mm'],['RGB',p.rgb?'是':'否']];
    default: return [];
  }
}

function renderCatTabs(){
  const box=$('#catTabs'); box.innerHTML='';
  CATS.forEach(c=>{
    const b=document.createElement('button'); b.textContent=c.label; b.dataset.cat=c.key;
    if(c.key===activeCat)b.classList.add('active');
    b.addEventListener('click',()=>{ activeCat=c.key; renderCatTabs(); renderFilters(); renderPartList(); });
    box.appendChild(b);
  });
}
function renderFilters(){
  const box=$('#partFilters'); box.innerHTML='';
  const list=DB[activeCat]||[];
  const brands=[...new Set(list.map(p=>p.brand))];
  const bSel=document.createElement('select'); bSel.innerHTML='<option value="">全部品牌</option>'+brands.map(b=>`<option>${b}</option>`).join('');
  const pSel=document.createElement('select');
  pSel.innerHTML='<option value="">全部价位</option><option value="0-1000">￥1000以下</option><option value="1000-3000">￥1000-3000</option><option value="3000-6000">￥3000-6000</option><option value="6000-99999">￥6000以上</option>';
  bSel.addEventListener('change',renderPartList); pSel.addEventListener('change',renderPartList);
  box.append(bSel,pSel);
}
function renderPartList(){
  const list=$('#partList');
  const q=$('#partSearch').value.trim().toLowerCase();
  const brandSel=$('#partFilters select:first-child')?.value||'';
  const priceSel=$('#partFilters select:last-child')?.value||'';
  let items=(DB[activeCat]||[]).slice();
  if(brandSel) items=items.filter(p=>p.brand===brandSel);
  if(priceSel){ const [a,b]=priceSel.split('-').map(Number); items=items.filter(p=>p.price>=a&&p.price<=b); }
  if(q) items=items.filter(p=>p.name.toLowerCase().includes(q)||(p.brand||'').toLowerCase().includes(q));
  list.innerHTML='';
  if(!items.length){ list.innerHTML='<div class="empty">无匹配配件</div>'; return; }
  const draggable=SLOTTABLE.includes(activeCat);
  items.forEach(p=>{
    const sel=currentBuild[activeCat]===p.id;
    const el=document.createElement('div');
    el.className='part'+(sel?' sel':'')+(draggable?' drag-ok':'');
    el.dataset.cat=activeCat; el.dataset.id=p.id;
    const meta=partMeta(activeCat,p).map(m=>`<b>${m[0]}</b> ${m[1]}`).join(' · ');
    el.innerHTML=`<div class="phead"><span class="pname">${p.name}</span><span class="pprice">${p.price?money(p.price):'—'}${sel?' <span class="tag-installed">已装</span>':''}</span></div>
      <div class="pmeta">${meta}</div><div class="pbrand">${p.brand||''}</div>`;
    if(draggable) el.addEventListener('pointerdown',e=>startLibDrag(e,el,activeCat,p.id));
    el.addEventListener('click',()=>{
      if(draggable){
        if(_didDrag){ _didDrag=false; return; }
        installToSlot(activeCat,p.id);
      } else {
        currentBuild[activeCat]=p.id; renderPartList(); updateSummary(); toast('已选择 '+p.name,'ok');
      }
    });
    list.appendChild(el);
  });
}
function renderBoard(){
  const mobo=$('#mobo');
  $$('.slot',mobo).forEach(s=>s.remove());
  SLOT_DEFS.forEach(s=>{
    const el=document.createElement('div'); el.className='slot'; el.dataset.accept=s.cat;
    el.style.left=s.x+'%'; el.style.top=s.y+'%'; el.style.width=s.w+'%'; el.style.height=s.h+'%';
    el.innerHTML=`<span>${ICONS[s.cat]||ICONS.board}</span><span class="s-cap">${s.label}<br>${s.cap}</span>`;
    mobo.appendChild(el);
  });
  const mb=findPart('mobo',currentBuild.mobo);
  $('#mobo .mobo-label').textContent=mb?mb.name:'MAINBOARD（未选主板）';
  refreshSlots();
}
function refreshSlots(){
  SLOT_DEFS.forEach(s=>{
    const el=$$(`.slot[data-accept="${s.cat}"]`)[0]; if(!el)return;
    if(currentBuild[s.cat]){
      const p=findPart(s.cat,currentBuild[s.cat]);
      el.classList.add('filled');
      el.innerHTML=`<span>${ICONS[s.cat]||ICONS.board}</span><span class="placed-name">${p?p.name:''}</span><span class="remove" data-cat="${s.cat}">×</span>`;
    } else {
      el.classList.remove('filled');
      el.innerHTML=`<span>${ICONS[s.cat]||ICONS.board}</span><span class="s-cap">${s.label}<br>${s.cap}</span>`;
    }
  });
  $$('.slot .remove').forEach(r=>r.addEventListener('click',e=>{ e.stopPropagation(); removeFromSlot(r.dataset.cat); }));
}
function installToSlot(cat,id){
  const p=findPart(cat,id); if(!p)return;
  currentBuild[cat]=id;
  renderPartList(); refreshSlots(); updateSummary();
  const el=$$(`.slot[data-accept="${cat}"]`)[0];
  if(el){ el.classList.add('pop'); setTimeout(()=>el.classList.remove('pop'),350); }
  toast('已安装 '+p.name,'ok');
}
function removeFromSlot(cat){
  delete currentBuild[cat];
  renderPartList(); refreshSlots(); updateSummary();
  toast('已卸载 '+catLabel(cat),'');
}
/* Pointer 拖拽：从配件库 → 主板插槽 */
function startLibDrag(e,el,cat,id){
  if(e.button!==0)return;
  _didDrag=false;
  const part=findPart(cat,id);
  const ghost=document.createElement('div'); ghost.className='drag-ghost';
  ghost.textContent=part?part.name:cat;
  ghost.style.left=e.clientX+12+'px'; ghost.style.top=e.clientY+12+'px';
  document.body.appendChild(ghost);
  el.classList.add('dragging');
  let moved=false; const sx=e.clientX, sy=e.clientY;
  const move=ev=>{
    if(Math.abs(ev.clientX-sx)>4||Math.abs(ev.clientY-sy)>4) moved=true;
    ghost.style.left=ev.clientX+12+'px'; ghost.style.top=ev.clientY+12+'px';
    const t=document.elementFromPoint(ev.clientX,ev.clientY);
    const slot=t&&t.closest('.slot');
    $$('.slot').forEach(s=>s.classList.toggle('hover', slot===s));
  };
  const up=ev=>{
    document.removeEventListener('pointermove',move); document.removeEventListener('pointerup',up);
    ghost.remove(); el.classList.remove('dragging');
    $$('.slot').forEach(s=>s.classList.remove('hover'));
    const t=document.elementFromPoint(ev.clientX,ev.clientY);
    const slot=t&&t.closest('.slot');
    if(slot && slot.dataset.accept===cat){ installToSlot(cat,id); }
    else if(moved){ toast('请拖到主板上对应的插槽','err'); }
    _didDrag=moved;
  };
  document.addEventListener('pointermove',move); document.addEventListener('pointerup',up);
  e.preventDefault();
}
function renderBuild(){ renderCatTabs(); renderFilters(); renderPartList(); renderBoard(); updateSummary(); }
$('#partSearch').addEventListener('input',renderPartList);
$('#btnResetBuild').addEventListener('click',()=>{ currentBuild={}; renderBuild(); toast('已清空配置'); });

/* ---------- 配置汇总 + 实时兼容性 ---------- */
function updateSummary(){
  const body=$('#buildTableBody'); if(!body) return;
  body.innerHTML='';
  CATS.forEach(c=>{
    const p=findPart(c.key,currentBuild[c.key]);
    const tr=document.createElement('tr');
    tr.innerHTML=`<td>${c.label}</td><td>${p?p.name:'<span style="color:var(--dim)">未选择</span>'}</td><td class="p">${p?money(p.price):'—'}</td>`;
    body.appendChild(tr);
  });
  $('#customTotal').textContent=money(totalPrice(currentBuild));
  const issues=checkCompat(currentBuild);
  const sum=compatSummary(issues);
  const banner=$('#compatBanner');
  if(banner){ banner.className='compat-banner '+sum.status; banner.innerHTML=`${sum.status==='ok'?ICONS.check:sum.status==='warn'?ICONS.warn:ICONS.error}<span>${sum.text}</span>`; }
  // 装机主板区域：有冲突时变红 / 变橙
  const mobo=$('#mobo');
  if(mobo){ mobo.classList.remove('conflict-error','conflict-warn');
    if(sum.err>0) mobo.classList.add('conflict-error');
    else if(sum.warn>0) mobo.classList.add('conflict-warn');
  }
  // 兼容性列表：只显示冲突项（不显示绿色“合理”项）
  const ib=$('#issuesBox'); if(ib){ ib.innerHTML='';
    const conflicts=issues.filter(i=>i.level!=='ok');
    if(!conflicts.length){ ib.innerHTML=`<div class="conflict-ok">${ICONS.check}无兼容性冲突</div>`; }
    else conflicts.forEach(i=>{
      const el=document.createElement('div'); el.className='issue '+i.level;
      el.innerHTML=`${i.level==='warn'?ICONS.warn:ICONS.error}<div><div class="it-title">${i.title}</div><div class="it-detail">${i.detail}</div>${i.fix?`<div class="it-fix">${i.fix}</div>`:''}</div>`;
      ib.appendChild(el);
    });
  }
}

/* ============================================================
   性能评估
   ============================================================ */
function renderPerf(){
  const box=$('#perfContent'); if(!box) return;
  if(!currentBuild.cpu){
    box.innerHTML=`<div class="panel empty">${ICONS.cpu}<br>请先在「组装中心」中选择配件后再评估。<br><button class="btn" style="margin-top:14px" data-goto="build">去组装</button></div>`;
    box.querySelector('[data-goto]').addEventListener('click',()=>showView('build'));
    return;
  }
  const ev=evaluate(currentBuild, currentUCs);
  const ucs = currentUCs.map(k=>USE_CASES[k]);
  const issues=checkCompat(currentBuild);
  const sum=compatSummary(issues);
  const C=2*Math.PI*85; const off=C*(1-ev.overall/100);
  const scenes=[['游戏帧率',ev.scenes.game],['渲染速度',ev.scenes.render],['办公效率',ev.scenes.office]];
  const bars=scenes.map(([n,v])=>`<div class="bar-row"><div class="bl"><span>${n}</span><span>${v}</span></div><div class="bar-track"><div class="bar-fill" style="width:${v}%"></div></div></div>`).join('');
  const ups=ev.upgrades.length?ev.upgrades.map(u=>`<li>${ICONS.check}<span>${u}</span></li>`).join(''):'<li>当前配置已较均衡，升级空间有限</li>';
  let rows=''; CATS.forEach(c=>{ const p=findPart(c.key,currentBuild[c.key]); if(p) rows+=`<tr><td>${c.label}</td><td>${p.name}</td><td class="p">${money(p.price)}</td></tr>`; });
  const vr=valueRating(ev.overall,totalPrice(currentBuild));
  // 场景实例：游戏帧率 / 视频渲染速度参考
  const gBase=[['黑神话：悟空',0.72],['荒野大镖客2',0.9],['赛博朋克2077',0.66],['艾尔登法环',1.05],['CS2（电竞）',2.6]];
  const gRows=gBase.map(([n,w])=>`<tr><td>${n}</td><td class="p">${Math.max(1,Math.round(ev.fps.p1080*w))}</td><td class="p">${Math.max(1,Math.round(ev.fps.p1440*w))}</td><td class="p">${Math.max(1,Math.round(ev.fps.p4k*w))}</td></tr>`).join('');
  const t4k=4500/ev.renderIdx, tHevc=t4k*1.4, t1080=t4k*0.3, tMulti=t4k*1.8;
  const vRows=[
    ['4K H.264 导出','约 '+t4k.toFixed(0)+' 秒/分钟','基准画质'],
    ['4K H.265 导出','约 '+tHevc.toFixed(0)+' 秒/分钟','码率更省，略耗时'],
    ['1080P H.264 导出','约 '+t1080.toFixed(0)+' 秒/分钟','像素量约 1/4'],
    ['多轨+调色工程','约 '+tMulti.toFixed(0)+' 秒/分钟','特效/调色增负']
  ].map(r=>`<tr><td>${r[0]}</td><td class="p">${r[1]}</td><td style="color:var(--muted);font-size:12px">${r[2]}</td></tr>`).join('');
  box.innerHTML=`
  <div class="eval-grid">
    <div class="panel">
      <h3 style="font-size:16px;margin-bottom:4px">综合性能评分</h3>
      <p style="font-size:12.5px;color:var(--muted);margin-bottom:8px">基于使用场景「${ucs.map(u=>u.label).join(' / ')}」加权计算</p>
      <div class="score-ring">
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="85" fill="none" stroke="var(--border2)" stroke-width="14"/>
          <circle cx="100" cy="100" r="85" fill="none" stroke="url(#sg)" stroke-width="14" stroke-linecap="round"
            stroke-dasharray="${C}" stroke-dashoffset="${off}" transform="rotate(-90 100 100)"/>
          <text x="100" y="96" text-anchor="middle" class="score-num">${ev.overall}</text>
          <text x="100" y="124" text-anchor="middle" fill="var(--muted)" font-size="13">/ 100</text>
          <defs><linearGradient id="sg" x1="0" y1="0" x2="200" y2="200"><stop stop-color="#22d3ee"/><stop offset="1" stop-color="#34d399"/></linearGradient></defs>
        </svg>
      </div>
      <div class="scene-bars">${bars}</div>
    </div>
    <div class="panel">
      <h3 style="font-size:16px;margin-bottom:10px">关键指标预估</h3>
      <div class="kpis">
        <div class="kpi"><div class="k-lbl">游戏帧率 (1080P)</div><div class="k-val">${ev.fps.p1080}<span style="font-size:12px;color:var(--muted)"> FPS</span></div><div class="k-sub">2K ≈ ${ev.fps.p1440} · 4K ≈ ${ev.fps.p4k}</div></div>
        <div class="kpi"><div class="k-lbl">渲染效率指数</div><div class="k-val">${ev.renderIdx}</div><div class="k-sub">越高导出越快</div></div>
        <div class="kpi"><div class="k-lbl">预估功耗 (满载)</div><div class="k-val">${ev.power}<span style="font-size:12px;color:var(--muted)"> W</span></div><div class="k-sub">建议电源余量 40%</div></div>
        <div class="kpi"><div class="k-lbl">性价比评级</div><div class="k-val">${vr.grade}</div><div class="k-sub">${vr.text}</div></div>
      </div>
      <h3 style="font-size:15px;margin:18px 0 8px">散热建议</h3>
      <p style="font-size:13px;color:var(--muted);background:var(--bg2);padding:11px 13px;border-radius:10px;border:1px solid var(--border)">${ev.thermal}</p>
      <h3 style="font-size:15px;margin:18px 0 8px">升级潜力分析</h3>
      <ul class="upgrade-list">${ups}</ul>
    </div>
  </div>
  <div class="panel" style="margin-top:20px">
    <h3 style="font-size:16px;margin-bottom:12px">场景性能实例参考</h3>
    <div class="ref-grid">
      <div>
        <h4 class="ref-title">游戏帧率实例（高画质 · 帧/秒）</h4>
        <table class="build-table"><thead><tr><th>热门游戏</th><th>1080P</th><th>2K</th><th>4K</th></tr></thead><tbody>${gRows}</tbody></table>
        <p class="ref-note">由综合游戏性能分推算，实际受画质/驱动影响。</p>
      </div>
      <div>
        <h4 class="ref-title">视频剪辑渲染参考</h4>
        <table class="build-table"><thead><tr><th>项目类型</th><th>耗时</th><th>说明</th></tr></thead><tbody>${vRows}</tbody></table>
        <p class="ref-note">以 4K H.264 导出为基准，渲染效率指数 ${ev.renderIdx}；数值为示意参考。</p>
      </div>
    </div>
  </div>
  <div class="panel" style="margin-top:20px">
    <h3 style="font-size:16px;margin-bottom:10px">兼容性检查汇总</h3>
    <div class="compat-banner ${sum.status}">${sum.status==='ok'?ICONS.check:sum.status==='warn'?ICONS.warn:ICONS.error}<span>${sum.text}</span></div>
    <table class="build-table" style="margin-top:12px"><tbody>${rows}</tbody></table>
    <div class="c-sum"><span class="lbl">配置总价</span><span class="amt">${money(totalPrice(currentBuild))}</span></div>
    <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
      <button class="btn sm" data-goto="build">返回组装</button>
      <button class="btn ghost sm" id="btnShareFromPerf">保存 / 分享</button>
    </div>
  </div>`;
  box.querySelectorAll('[data-goto]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.goto)));
  const sb=$('#btnShareFromPerf'); if(sb) sb.addEventListener('click',openShare);
}

/* ============================================================
   保存 / 分享 / 导出
   ============================================================ */
const LS_KEY='pcbuilder_build_v1';
function openShare(){
  $('#shareModal').classList.add('show');
  const enc=encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(currentBuild)))));
  const base=(location.origin&&location.origin!=='null')?location.origin+location.pathname:location.href.split('#')[0];
  const url=base+'#build='+enc;
  $('#shareText').value='【装机大师配置单】\n'+buildToText()+'\n\n分享链接：'+url;
  $('#shareModal').dataset.url=url;
}
function buildToText(){
  let s=''; CATS.forEach(c=>{ const p=findPart(c.key,currentBuild[c.key]); if(p) s+=`${c.label}: ${p.name}  ${money(p.price)}\n`; });
  s+=`— 总价: ${money(totalPrice(currentBuild))} —`;
  return s;
}
$('#btnSaveLocal').addEventListener('click',()=>{ localStorage.setItem(LS_KEY,JSON.stringify(currentBuild)); toast('已保存到本机浏览器','ok'); });
$('#btnLoadLocal').addEventListener('click',()=>{ const v=localStorage.getItem(LS_KEY); if(!v){toast('没有已保存的配置','err');return;} try{currentBuild=JSON.parse(v); renderBuild(); toast('已读取保存的配置','ok');}catch(e){toast('读取失败','err');} });
$('#btnCopyLink').addEventListener('click',()=>{ copyText($('#shareModal').dataset.url); });
$('#btnCopyJson').addEventListener('click',()=>{ copyText(buildToText()); });
$('#btnDownload').addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify({build:currentBuild,uc:currentUCs},null,2)],{type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='my-pc-build.json'; a.click();
  toast('已下载 .json','ok');
});
$('#btnCloseModal').addEventListener('click',()=>$('#shareModal').classList.remove('show'));
$('#shareModal').addEventListener('click',e=>{ if(e.target.id==='shareModal') $('#shareModal').classList.remove('show'); });
$('#btnSave').addEventListener('click',openShare);
const bs=$('#btnSaveFromBuild'); if(bs) bs.addEventListener('click',openShare);

function copyText(t){ navigator.clipboard?.writeText(t).then(()=>toast('已复制到剪贴板','ok'),()=>toast('复制失败，请手动选择','err')); }

/* 分享链接还原 */
(function restoreFromHash(){
  if(location.hash.startsWith('#build=')){
    try{ const json=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(location.hash.slice(7)))))); currentBuild=json; toast('已从分享链接载入配置','ok'); }
    catch(e){ console.warn('hash 解析失败',e); }
  }
})();

/* ============================================================
   Toast
   ============================================================ */
let toastTimer;
function toast(msg,type=''){ const t=$('#toast'); if(!t)return; t.textContent=msg; t.className='toast show '+type; clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),2400); }

/* ---------- 启动 ---------- */
renderBuild();
