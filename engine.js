/* ============================================================
   核心引擎：兼容性检测 / 推荐生成 / 性能评估 / 功耗
   ============================================================ */

/* 按 id 取配件 */
function findPart(cat, id){ return (DB[cat]||[]).find(p=>p.id===id) || null; }

/* --------- 功耗估算 --------- */
function estimatePower(build){
  let w = 0;
  const add = (c)=>{ if(build[c]){ const p=findPart(c,build[c]); if(p){ w += (p.tdp||0); } } };
  add('cpu'); add('gpu');
  // 主板+内存+硬盘+风扇 基础功耗
  w += build.mobo ? 45 : 0;
  w += build.ram ? 12 : 0;
  w += build.ssd ? 8 : 0;
  w += build.fan && build.fan!=='fan-none' ? 15 : 0;
  w += 20; // 其他
  return Math.round(w);
}

/* --------- 兼容性检测 ---------
   返回 [{level:'error'|'warn'|'ok', title, detail, fix}] */
function checkCompat(build){
  const issues = [];
  const cpu=findPart('cpu',build.cpu), mb=findPart('mobo',build.mobo), gpu=findPart('gpu',build.gpu),
        ram=findPart('ram',build.ram), ssd=findPart('ssd',build.ssd), psu=findPart('psu',build.psu),
        cooler=findPart('cooler',build.cooler), cs=findPart('case',build.case);

  // 1. CPU 与主板接口
  if(cpu && mb){
    if(cpu.socket!==mb.socket){
      const alt = DB.mobo.find(m=>m.socket===cpu.socket);
      issues.push({level:'error', title:'CPU 与主板接口不匹配',
        detail:`处理器接口为 ${cpu.socket}，主板接口为 ${mb.socket}，无法安装。`,
        fix: alt?`更换为 ${alt.socket} 主板，如「${alt.name}」`:'请更换同接口主板'});
    } else {
      issues.push({level:'ok', title:'CPU 接口匹配', detail:`${cpu.socket} 接口与主板一致。`});
    }
  }

  // 2. 内存类型 DDR4/DDR5
  if(ram && mb){
    if(ram.type!==mb.memType){
      const alt = DB.ram.find(r=>r.type===mb.memType);
      issues.push({level:'error', title:'内存类型不兼容',
        detail:`主板仅支持 ${mb.memType}，所选内存为 ${ram.type}，物理防呆无法插入。`,
        fix: alt?`更换为 ${mb.memType} 内存，如「${alt.name}」`:`请更换 ${mb.memType} 内存`});
    } else {
      // 3. 内存频率是否超主板支持
      if(ram.freq>mb.memMaxFreq){
        issues.push({level:'warn', title:'内存频率超出主板支持',
          detail:`内存 ${ram.freq}MHz 高于主板最高 ${mb.memMaxFreq}MHz，将降频运行至 ${mb.memMaxFreq}MHz。`,
          fix:`更换更高规格主板，或选择 ${mb.memMaxFreq}MHz 及以下内存`});
      } else {
        issues.push({level:'ok', title:'内存兼容', detail:`${ram.type} ${ram.freq}MHz 在主板支持范围内。`});
      }
    }
  }

  // 4. 散热器接口 + 压制能力
  if(cooler && cpu){
    if(mb && !cooler.sockets.includes(mb.socket)){
      issues.push({level:'error', title:'散热器不支持该接口',
        detail:`散热器扣具不支持 ${mb.socket}。`, fix:'更换支持该接口的散热器或加购扣具'});
    }
    if(cooler.tdp < cpu.tdp){
      const alt = DB.cooler.find(c=>c.tdp>=cpu.tdp && c.sockets.includes(cpu.socket));
      issues.push({level:'warn', title:'散热压制能力不足',
        detail:`CPU 满载功耗约 ${cpu.tdp}W，散热器额定压制 ${cooler.tdp}W，高负载易触发降频。`,
        fix: alt?`升级散热，如「${alt.name}」(压制 ${alt.tdp}W)`:'建议升级更强散热'});
    } else {
      issues.push({level:'ok', title:'散热充足', detail:`压制 ${cooler.tdp}W ≥ CPU ${cpu.tdp}W。`});
    }
  }

  // 5. 显卡长度 vs 机箱
  if(gpu && cs && gpu.len>0){
    if(gpu.len>cs.maxGpu){
      const alt = DB.case.find(c=>c.maxGpu>=gpu.len);
      issues.push({level:'error', title:'显卡尺寸超出机箱',
        detail:`显卡长 ${gpu.len}mm，机箱限长 ${cs.maxGpu}mm，装不进去。`,
        fix: alt?`更换更大机箱，如「${alt.name}」(限长 ${alt.maxGpu}mm)`:'更换支持长显卡的机箱'});
    } else {
      issues.push({level:'ok', title:'显卡尺寸兼容', detail:`${gpu.len}mm ≤ 机箱 ${cs.maxGpu}mm。`});
    }
  }

  // 6. 散热高度/水冷冷排 vs 机箱
  if(cooler && cs){
    if(cooler.type==='Air' && cooler.height>cs.maxCooler){
      issues.push({level:'error', title:'散热器高度超限',
        detail:`风冷高 ${cooler.height}mm，机箱限高 ${cs.maxCooler}mm，侧板合不上。`,
        fix:'更换矮风冷或换更大机箱'});
    }
    if(cooler.type==='AIO' && cooler.radiator>cs.maxRad){
      issues.push({level:'error', title:'水冷冷排装不下',
        detail:`${cooler.radiator}mm 冷排超过机箱支持的 ${cs.maxRad}mm。`,
        fix:'改用更小冷排或换支持大冷排的机箱'});
    }
  }

  // 7. 主板板型 vs 机箱
  if(mb && cs){
    if(!cs.form.includes(mb.form)){
      issues.push({level:'error', title:'主板板型与机箱不兼容',
        detail:`机箱支持 ${cs.form.join('/')}，主板为 ${mb.form}。`, fix:'更换匹配板型的机箱'});
    } else {
      issues.push({level:'ok', title:'板型匹配', detail:`${mb.form} 可安装于该机箱。`});
    }
  }

  // 8. 电源功率
  if(psu){
    const need = estimatePower(build);
    const recommend = Math.ceil(need*1.4/50)*50; // 40% 余量
    if(psu.watt < need*1.15){
      const alt = DB.psu.find(p=>p.watt>=recommend);
      issues.push({level:'error', title:'电源功率不足',
        detail:`整机满载约 ${need}W，电源仅 ${psu.watt}W，余量不足易关机/损坏。`,
        fix: alt?`升级至 ${recommend}W 以上，如「${alt.name}」`:`建议 ${recommend}W 电源`});
    } else if(psu.watt < recommend){
      issues.push({level:'warn', title:'电源余量偏紧',
        detail:`满载约 ${need}W，建议 ${recommend}W 以获得更好效率与寿命，当前 ${psu.watt}W。`,
        fix:`可考虑升级到 ${recommend}W`});
    } else {
      issues.push({level:'ok', title:'电源充足', detail:`${psu.watt}W ≥ 建议 ${recommend}W（满载约 ${need}W）。`});
    }
  }

  // 9. 集显但主板/CPU无核显提示
  if(gpu && gpu.id==='gpu-igpu' && cpu && !cpu.igpu){
    issues.push({level:'error', title:'无独显且 CPU 无核显',
      detail:`所选 CPU「${cpu.name}」不含核显，仅用集显将无法点亮。`,
      fix:'加装独立显卡，或更换带核显的 CPU'});
  }

  return issues;
}

/* 汇总兼容性状态 */
function compatSummary(issues){
  const err = issues.filter(i=>i.level==='error').length;
  const warn = issues.filter(i=>i.level==='warn').length;
  if(err>0) return {status:'error', text:`发现 ${err} 项冲突`+(warn?`、${warn} 项警告`:''), err, warn};
  if(warn>0) return {status:'warn', text:`${warn} 项警告，可正常运行`, err, warn};
  return {status:'ok', text:'全部兼容，无冲突', err:0, warn:0};
}

/* --------- 总价 --------- */
function totalPrice(build){
  let t=0; CATS.forEach(c=>{ const p=findPart(c.key,build[c.key]); if(p) t+=p.price; });
  return t;
}

/* --------- 性能评估 --------- */
function evaluate(build, useCaseKeys){
  const cpu=findPart('cpu',build.cpu), gpu=findPart('gpu',build.gpu),
        ram=findPart('ram',build.ram), ssd=findPart('ssd',build.ssd);
  const keys = Array.isArray(useCaseKeys)? useCaseKeys : [useCaseKeys];

  // 综合评分：CPU/GPU 场景分 + 内存/存储加成
  const cS = cpu ? cpu.score : {game:0,render:0,office:0};
  const gS = gpu ? gpu.score : {game:0,render:0,office:0};
  const memBonus = ram ? Math.min(10, (ram.cap/8)*2 + (ram.type==='DDR5'?3:0)) : 0;
  const ssdBonus = ssd ? Math.min(6, ssd.readMB/1500) : 0;

  // 各场景表现（0-100）
  const scenes = {
    game:   Math.round(cS.game*0.4 + gS.game*0.5 + memBonus*0.6 + ssdBonus*0.4),
    render: Math.round(cS.render*0.5 + gS.render*0.35 + memBonus + ssdBonus*0.6),
    office: Math.round(cS.office*0.55 + gS.office*0.15 + memBonus*0.8 + ssdBonus*1.2)
  };
  Object.keys(scenes).forEach(k=>scenes[k]=Math.max(0,Math.min(100,scenes[k])));

  // 综合分：多场景均衡加权（所选场景去重后，各自「聚焦分」取均值）
  const evalKeys = [...new Set(keys.map(k=>(USE_CASES[k]||USE_CASES.game).key))];
  const avg = (scenes.game+scenes.render+scenes.office)/3;
  let overall;
  if(evalKeys.length===1){
    const k=evalKeys[0];
    overall = Math.round(scenes[k]*0.7 + avg*0.3);
  } else {
    const per = evalKeys.map(k=>scenes[k]*0.7 + avg*0.3);
    overall = Math.round(per.reduce((a,b)=>a+b,0)/per.length);
  }

  // 场景细化预估
  const fps1080 = Math.round(30 + (gS.game*1.6) + (cS.game*0.3)); // 1080P高画质
  const fps1440 = Math.round(fps1080*0.72);
  const fps4k   = Math.round(fps1080*0.45);
  const renderIdx = scenes.render; // 渲染相对指数
  const power = estimatePower(build);

  // 散热建议
  const cooler=findPart('cooler',build.cooler);
  let thermal;
  if(!cpu){ thermal='请先选择 CPU'; }
  else if(cpu.tdp>=170){ thermal = (cooler&&cooler.type==='AIO'&&cooler.radiator>=360)?'当前 360 水冷可压制，建议机箱风道良好':'高功耗 CPU，强烈建议 360 水冷或高端双塔'; }
  else if(cpu.tdp>=120){ thermal = (cooler&&cooler.tdp>=180)?'散热配置合理':'建议至少高端单塔风冷 / 240 水冷'; }
  else { thermal='中低功耗，百元级单塔风冷即可'; }

  // 升级潜力
  const mb=findPart('mobo',build.mobo);
  const ups = [];
  if(mb){
    ups.push(mb.socket==='AM5' ? 'AM5 平台后续可升级更高锐龙，插槽寿命长' : 'LGA1700 为末代接口，大升级需换主板');
    if(mb.m2>=(build.ssd?2:1)) ups.push(`主板剩余 ${mb.m2-1} 个 M.2 位，可扩容硬盘`);
  }
  if(gpu && gpu.id!=='gpu-4090' && gpu.id!=='gpu-7900xtx') ups.push('显卡仍有升级空间，可换更高型号');
  if(ram && ram.cap<32) ups.push('内存可扩容至 32G/64G 提升多任务');
  const psu=findPart('psu',build.psu);
  if(psu){ const rec=Math.ceil(power*1.4/50)*50; if(psu.watt>=rec+150) ups.push('电源余量充足，支持未来升级更高显卡'); }

  return { overall, scenes, fps:{p1080:fps1080,p1440:fps1440,p4k:fps4k}, renderIdx, power, thermal, upgrades:ups };
}

/* --------- 性价比评级 --------- */
function valueRating(overall, price){
  if(price<=0) return {grade:'-', text:'未估价'};
  const ratio = overall / (price/1000); // 每千元性能
  if(ratio>=22) return {grade:'S', text:'极致性价比'};
  if(ratio>=17) return {grade:'A', text:'高性价比'};
  if(ratio>=13) return {grade:'B', text:'均衡'};
  if(ratio>=9)  return {grade:'C', text:'偏性能向'};
  return {grade:'D', text:'高端溢价'};
}

/* --------- 推荐引擎：按需求+预算生成 3-5 套方案 --------- */
function pickByBudget(cat, sub, filterFn){
  let list = (DB[cat]||[]).filter(p=>p.price>0);
  if(filterFn) list = list.filter(filterFn);
  if(!list.length) list = (DB[cat]||[]).filter(p=>p.price>0);
  // 选价格 <= sub 中最贵的；若都超预算取最便宜
  const under = list.filter(p=>p.price<=sub).sort((a,b)=>b.price-a.price);
  if(under.length) return under[0];
  return list.sort((a,b)=>a.price-b.price)[0];
}

/* 多场景预算权重混合：取所选场景各品类权重的算术平均，使方案均衡兼顾 */
function blendWeights(keys){
  const arr = Array.isArray(keys)? keys : [keys];
  const cats=['cpu','mobo','gpu','ram','ssd','psu','cooler','case','fan'];
  const w={};
  cats.forEach(c=>{
    const vals=arr.map(k=>(USE_CASES[k]||USE_CASES.game).weight[c]);
    w[c]=vals.reduce((a,b)=>a+b,0)/vals.length;
  });
  return w;
}

function buildForBudget(useCaseKeys, budget){
  const keys = Array.isArray(useCaseKeys)? useCaseKeys : [useCaseKeys];
  const w = blendWeights(useCaseKeys);
  const build = {};
  // 先定 CPU（决定接口）
  build.cpu = pickByBudget('cpu', budget*w.cpu).id;
  const cpu = findPart('cpu', build.cpu);
  // 主板需同接口
  build.mobo = pickByBudget('mobo', budget*w.mobo, m=>m.socket===cpu.socket).id;
  const mb = findPart('mobo', build.mobo);
  // 内存需匹配主板类型
  build.ram = pickByBudget('ram', budget*w.ram, r=>r.type===mb.memType && r.freq<=mb.memMaxFreq).id;
  // 显卡
  // 仅当用户只选「办公上网」且 CPU 带核显时，才考虑核显方案；多选则按性能需求配独显
  if(keys.length===1 && keys[0]==='office' && budget*w.gpu < 1500 && cpu.igpu){
    build.gpu = 'gpu-igpu';
  } else {
    build.gpu = pickByBudget('gpu', budget*w.gpu, g=>g.price>0).id;
  }
  // 硬盘
  build.ssd = pickByBudget('ssd', budget*w.ssd, s=>s.iface==='NVMe').id;
  // 机箱（先定，供后续尺寸校验）
  build.case = pickByBudget('case', budget*w.case, c=>c.form.includes(mb.form)).id;
  // 散热：满足 CPU tdp 且接口匹配
  build.cooler = pickByBudget('cooler', budget*w.cooler, c=>c.sockets.includes(cpu.socket) && c.tdp>=cpu.tdp).id
              || pickByBudget('cooler', budget*w.cooler, c=>c.sockets.includes(cpu.socket)).id;
  // 电源：满足功耗+余量
  const need = estimatePower(build);
  const rec = Math.ceil(need*1.4/50)*50;
  build.psu = pickByBudget('psu', Math.max(budget*w.psu, 350), p=>p.watt>=rec).id
           || pickByBudget('psu', budget*w.psu).id;
  // 风扇
  build.fan = budget>=8000 ? 'fan-rgb' : (budget>=4000 ? 'fan-basic' : 'fan-none');

  // 自动修正：显卡长度超机箱则换更大机箱
  let issues = checkCompat(build);
  if(issues.some(i=>i.level==='error' && i.title.includes('显卡'))){
    const g=findPart('gpu',build.gpu);
    const c=DB.case.find(cc=>cc.maxGpu>=g.len && cc.form.includes(mb.form));
    if(c) build.case=c.id;
  }
  return build;
}

/* 生成多档位方案：围绕预算生成入门/均衡/性能/旗舰 */
function recommend(useCaseKeys, minB, maxB){
  const center = (minB+maxB)/2;
  const span = Math.max(maxB-minB, center*0.6);
  // 生成 4 档预算点，落在 [minB*0.9, maxB*1.05]
  const tiers = [
    { name:'入门优选', budget: Math.max(minB, center-span*0.5), tag:'预算友好' },
    { name:'均衡之选', budget: center-span*0.15, tag:'甜点性价比' },
    { name:'性能强化', budget: center+span*0.2, tag:'高帧/高效' },
    { name:'旗舰满配', budget: Math.min(maxB*1.05, center+span*0.55), tag:'顶级体验' }
  ];
  const plans = tiers.map(t=>{
    const build = buildForBudget(useCaseKeys, t.budget);
    const price = totalPrice(build);
    const evalR = evaluate(build, useCaseKeys);
    const issues = checkCompat(build);
    const summary = compatSummary(issues);
    const value = valueRating(evalR.overall, price);
    return { ...t, build, price, eval:evalR, issues, summary, value };
  });
  // 去重（相同配置合并），保证 3-5 套
  const seen=new Set(); const uniq=[];
  plans.forEach(p=>{ const sig=Object.values(p.build).join('|'); if(!seen.has(sig)){seen.add(sig);uniq.push(p);} });
  return uniq;
}
