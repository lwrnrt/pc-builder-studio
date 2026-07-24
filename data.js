/* ============================================================
   PC Builder Studio — 配件数据库
   规格字段说明:
   CPU:    { id,name,brand,socket,tdp,cores,threads,igpu,price,
             score:{game,render,office} }
   MOBO:   { id,name,brand,socket,form(ATX/mATX/ITX),memType(DDR4/DDR5),
             memMaxFreq,m2,pcie16,vrm,price }
   GPU:    { id,name,brand,len(mm),tdp,vram,price,score:{game,render,office} }
   RAM:    { id,name,brand,type,freq,cap,sticks,price }
   SSD:    { id,name,brand,form(M.2/SATA),iface(NVMe/SATA),cap,readMB,price }
   PSU:    { id,name,brand,watt,cert,price }
   COOLER: { id,name,brand,type(Air/AIO),height,radiator,tdp,sockets[],price }
   CASE:   { id,name,brand,form[](支持的板型),maxGpu,maxCooler,maxRad,price }
   FAN:    { id,name,brand,size,rgb,price }
   ============================================================ */
const DB = {
  cpu: [
    { id:'cpu-i3-12100f', name:'Intel 酷睿 i3-12100F', brand:'Intel', socket:'LGA1700', tdp:89, cores:4, threads:8, igpu:false, price:499, score:{game:55,render:38,office:70} },
    { id:'cpu-i5-12400f', name:'Intel 酷睿 i5-12400F', brand:'Intel', socket:'LGA1700', tdp:117, cores:6, threads:12, igpu:false, price:849, score:{game:72,render:55,office:82} },
    { id:'cpu-i5-13400f', name:'Intel 酷睿 i5-13400F', brand:'Intel', socket:'LGA1700', tdp:148, cores:10, threads:16, igpu:false, price:1099, score:{game:78,render:66,office:86} },
    { id:'cpu-i5-14600kf', name:'Intel 酷睿 i5-14600KF', brand:'Intel', socket:'LGA1700', tdp:181, cores:14, threads:20, igpu:false, price:1899, score:{game:86,render:80,office:90} },
    { id:'cpu-i7-14700kf', name:'Intel 酷睿 i7-14700KF', brand:'Intel', socket:'LGA1700', tdp:253, cores:20, threads:28, igpu:false, price:2699, score:{game:91,render:92,office:94} },
    { id:'cpu-i9-14900k', name:'Intel 酷睿 i9-14900K', brand:'Intel', socket:'LGA1700', tdp:253, cores:24, threads:32, igpu:true, price:3999, score:{game:96,render:99,office:97} },
    { id:'cpu-r5-7500f', name:'AMD 锐龙 R5 7500F', brand:'AMD', socket:'AM5', tdp:65, cores:6, threads:12, igpu:false, price:999, score:{game:80,render:62,office:84} },
    { id:'cpu-r5-7600', name:'AMD 锐龙 R5 7600', brand:'AMD', socket:'AM5', tdp:65, cores:6, threads:12, igpu:true, price:1299, score:{game:82,render:64,office:85} },
    { id:'cpu-r7-7700', name:'AMD 锐龙 R7 7700', brand:'AMD', socket:'AM5', tdp:65, cores:8, threads:16, igpu:true, price:1899, score:{game:87,render:82,office:90} },
    { id:'cpu-r7-7800x3d', name:'AMD 锐龙 R7 7800X3D', brand:'AMD', socket:'AM5', tdp:120, cores:8, threads:16, igpu:true, price:2799, score:{game:99,render:83,office:91} },
    { id:'cpu-r9-7900x', name:'AMD 锐龙 R9 7900X', brand:'AMD', socket:'AM5', tdp:170, cores:12, threads:24, igpu:true, price:2999, score:{game:90,render:94,office:95} },
    { id:'cpu-r9-7950x', name:'AMD 锐龙 R9 7950X', brand:'AMD', socket:'AM5', tdp:170, cores:16, threads:32, igpu:true, price:3899, score:{game:92,render:100,office:98} },
    { id:'cpu-i3-13100f', name:'Intel 酷睿 i3-13100F', brand:'Intel', socket:'LGA1700', tdp:89, cores:4, threads:8, igpu:false, price:699, score:{game:62,render:45,office:75} },
    { id:'cpu-r5-5600', name:'AMD 锐龙 R5 5600', brand:'AMD', socket:'AM4', tdp:65, cores:6, threads:12, igpu:false, price:699, score:{game:74,render:58,office:82} },
    { id:'cpu-r7-5700x3d', name:'AMD 锐龙 R7 5700X3D', brand:'AMD', socket:'AM4', tdp:105, cores:8, threads:16, igpu:false, price:1399, score:{game:93,render:78,office:88} },
    { id:'cpu-i5-14400f', name:'Intel 酷睿 i5-14400F', brand:'Intel', socket:'LGA1700', tdp:148, cores:10, threads:16, igpu:false, price:1399, score:{game:80,render:70,office:88} }
  ],
  mobo: [
    { id:'mb-h610m', name:'技嘉 H610M 小雕', brand:'技嘉', socket:'LGA1700', form:'mATX', memType:'DDR4', memMaxFreq:3200, m2:1, pcie16:1, vrm:'入门', price:599 },
    { id:'mb-b760m-d4', name:'微星 B760M 迫击炮 DDR4', brand:'微星', socket:'LGA1700', form:'mATX', memType:'DDR4', memMaxFreq:3600, m2:2, pcie16:1, vrm:'中端', price:899 },
    { id:'mb-b760m-d5', name:'华硕 TUF B760M-PLUS DDR5', brand:'华硕', socket:'LGA1700', form:'mATX', memType:'DDR5', memMaxFreq:7200, m2:2, pcie16:1, vrm:'中端', price:1199 },
    { id:'mb-z790', name:'华硕 ROG STRIX Z790-A', brand:'华硕', socket:'LGA1700', form:'ATX', memType:'DDR5', memMaxFreq:7800, m2:4, pcie16:1, vrm:'高端', price:2699 },
    { id:'mb-a620m', name:'华擎 A620M-HDV', brand:'华擎', socket:'AM5', form:'mATX', memType:'DDR5', memMaxFreq:6000, m2:1, pcie16:1, vrm:'入门', price:699 },
    { id:'mb-b650m', name:'微星 B650M 迫击炮', brand:'微星', socket:'AM5', form:'mATX', memType:'DDR5', memMaxFreq:6400, m2:2, pcie16:1, vrm:'中端', price:1099 },
    { id:'mb-b650e', name:'华硕 ROG STRIX B650E-F', brand:'华硕', socket:'AM5', form:'ATX', memType:'DDR5', memMaxFreq:6400, m2:3, pcie16:1, vrm:'高端', price:1899 },
    { id:'mb-x670e', name:'技嘉 X670E AORUS Master', brand:'技嘉', socket:'AM5', form:'ATX', memType:'DDR5', memMaxFreq:6666, m2:4, pcie16:1, vrm:'旗舰', price:3299 },
    { id:'mb-b550m', name:'微星 B550M 迫击炮', brand:'微星', socket:'AM4', form:'mATX', memType:'DDR4', memMaxFreq:3600, m2:2, pcie16:1, vrm:'中端', price:699 },
    { id:'mb-z690', name:'微星 Z690-A DDR5', brand:'微星', socket:'LGA1700', form:'ATX', memType:'DDR5', memMaxFreq:6400, m2:4, pcie16:1, vrm:'高端', price:1499 }
  ],
  gpu: [
    { id:'gpu-igpu', name:'集成显卡（核显）', brand:'-', len:0, tdp:0, vram:0, price:0, score:{game:15,render:20,office:60} },
    { id:'gpu-4060', name:'RTX 4060 8G', brand:'NVIDIA', len:245, tdp:115, vram:8, price:2299, score:{game:68,render:65,office:75} },
    { id:'gpu-4060ti', name:'RTX 4060 Ti 8G', brand:'NVIDIA', len:245, tdp:160, vram:8, price:3199, score:{game:74,render:72,office:78} },
    { id:'gpu-4070', name:'RTX 4070 12G', brand:'NVIDIA', len:285, tdp:200, vram:12, price:4599, score:{game:82,render:83,office:82} },
    { id:'gpu-4070s', name:'RTX 4070 Super 12G', brand:'NVIDIA', len:305, tdp:220, vram:12, price:4999, score:{game:86,render:87,office:84} },
    { id:'gpu-4070tis', name:'RTX 4070 Ti Super 16G', brand:'NVIDIA', len:336, tdp:285, vram:16, price:6499, score:{game:90,render:91,office:86} },
    { id:'gpu-4080s', name:'RTX 4080 Super 16G', brand:'NVIDIA', len:336, tdp:320, vram:16, price:8999, score:{game:95,render:96,office:90} },
    { id:'gpu-4090', name:'RTX 4090 24G', brand:'NVIDIA', len:357, tdp:450, vram:24, price:14999, score:{game:100,render:100,office:93} },
    { id:'gpu-7600', name:'RX 7600 8G', brand:'AMD', len:270, tdp:165, vram:8, price:2099, score:{game:66,render:58,office:73} },
    { id:'gpu-7700xt', name:'RX 7700 XT 12G', brand:'AMD', len:280, tdp:245, vram:12, price:3799, score:{game:80,render:75,office:80} },
    { id:'gpu-7800xt', name:'RX 7800 XT 16G', brand:'AMD', len:300, tdp:263, vram:16, price:4299, score:{game:87,render:82,office:83} },
    { id:'gpu-7900xtx', name:'RX 7900 XTX 24G', brand:'AMD', len:340, tdp:355, vram:24, price:7999, score:{game:96,render:90,office:88} },
    { id:'gpu-3050', name:'RTX 3050 8G', brand:'NVIDIA', len:242, tdp:130, vram:8, price:1799, score:{game:58,render:52,office:70} },
    { id:'gpu-7900gre', name:'RX 7900 GRE 16G', brand:'AMD', len:290, tdp:260, vram:16, price:4799, score:{game:90,render:87,office:86} },
    { id:'gpu-a770', name:'Intel Arc A770 16G', brand:'Intel', len:280, tdp:225, vram:16, price:2499, score:{game:65,render:70,office:75} }
  ],
  ram: [
    { id:'ram-d4-16', name:'金士顿 Fury DDR4 3200 16G(8x2)', brand:'金士顿', type:'DDR4', freq:3200, cap:16, sticks:2, price:279 },
    { id:'ram-d4-32', name:'金士顿 Fury DDR4 3200 32G(16x2)', brand:'金士顿', type:'DDR4', freq:3200, cap:32, sticks:2, price:449 },
    { id:'ram-d5-16', name:'威刚 XPG DDR5 6000 16G(8x2)', brand:'威刚', type:'DDR5', freq:6000, cap:16, sticks:2, price:389 },
    { id:'ram-d5-32', name:'芝奇 Trident Z5 DDR5 6000 32G(16x2)', brand:'芝奇', type:'DDR5', freq:6000, cap:32, sticks:2, price:699 },
    { id:'ram-d5-32-6400', name:'芝奇 DDR5 6400 32G(16x2)', brand:'芝奇', type:'DDR5', freq:6400, cap:32, sticks:2, price:849 },
    { id:'ram-d5-64', name:'海盗船 复仇者 DDR5 6000 64G(32x2)', brand:'海盗船', type:'DDR5', freq:6000, cap:64, sticks:2, price:1499 },
    { id:'ram-d4-3600-16', name:'金士顿 Fury DDR4 3600 16G(8x2)', brand:'金士顿', type:'DDR4', freq:3600, cap:16, sticks:2, price:339 },
    { id:'ram-d4-3600-32', name:'芝奇 Ripjaws DDR4 3600 32G(16x2)', brand:'芝奇', type:'DDR4', freq:3600, cap:32, sticks:2, price:529 }
  ],
  ssd: [
    { id:'ssd-sata-500', name:'三星 870 EVO 500G SATA', brand:'三星', form:'SATA', iface:'SATA', cap:500, readMB:560, price:299 },
    { id:'ssd-nvme-500', name:'致态 TiPlus7100 500G', brand:'致态', form:'M.2', iface:'NVMe', cap:500, readMB:5000, price:329 },
    { id:'ssd-nvme-1t', name:'致态 TiPlus7100 1TB', brand:'致态', form:'M.2', iface:'NVMe', cap:1000, readMB:7000, price:499 },
    { id:'ssd-nvme-2t', name:'三星 990 PRO 2TB', brand:'三星', form:'M.2', iface:'NVMe', cap:2000, readMB:7450, price:1099 },
    { id:'ssd-nvme-4t', name:'西数 SN850X 4TB', brand:'西部数据', form:'M.2', iface:'NVMe', cap:4000, readMB:7300, price:2299 },
    { id:'ssd-nvme-1t-budget', name:'金士顿 NV2 1TB', brand:'金士顿', form:'M.2', iface:'NVMe', cap:1000, readMB:3500, price:349 }
  ],
  psu: [
    { id:'psu-550', name:'长城 550W 金牌', brand:'长城', watt:550, cert:'80+金牌', price:349 },
    { id:'psu-650', name:'振华 Leadex 650W 金牌', brand:'振华', watt:650, cert:'80+金牌', price:499 },
    { id:'psu-750', name:'海韵 FOCUS 750W 金牌', brand:'海韵', watt:750, cert:'80+金牌', price:699 },
    { id:'psu-850', name:'海韵 FOCUS 850W 金牌', brand:'海韵', watt:850, cert:'80+金牌', price:899 },
    { id:'psu-1000', name:'海韵 PRIME 1000W 铂金', brand:'海韵', watt:1000, cert:'80+铂金', price:1399 },
    { id:'psu-1300', name:'海韵 PRIME 1300W 钛金', brand:'海韵', watt:1300, cert:'80+钛金', price:2199 },
    { id:'psu-1200', name:'海韵 FOCUS 1200W 金牌', brand:'海韵', watt:1200, cert:'80+金牌', price:1199 },
    { id:'psu-500', name:'振华 500W 铜牌', brand:'振华', watt:500, cert:'80+铜牌', price:259 }
  ],
  cooler: [
    { id:'cool-stock', name:'CPU 原装散热器', brand:'-', type:'Air', height:60, radiator:0, tdp:88, sockets:['LGA1700','AM5','AM4'], price:0 },
    { id:'cool-ax120', name:'利民 AX120 单塔', brand:'利民', type:'Air', height:154, radiator:0, tdp:180, sockets:['LGA1700','AM5','AM4'], price:99 },
    { id:'cool-fs140', name:'利民 FS140 双塔', brand:'利民', type:'Air', height:158, radiator:0, tdp:245, sockets:['LGA1700','AM5','AM4'], price:229 },
    { id:'cool-aio240', name:'恩杰 Kraken 240 水冷', brand:'恩杰', type:'AIO', height:52, radiator:240, tdp:250, sockets:['LGA1700','AM5','AM4'], price:699 },
    { id:'cool-aio360', name:'海盗船 H150i 360 水冷', brand:'海盗船', type:'AIO', height:52, radiator:360, tdp:350, sockets:['LGA1700','AM5','AM4'], price:1099 },
    { id:'cool-ak400', name:'九州风神 AK400 单塔', brand:'九州风神', type:'Air', height:155, radiator:0, tdp:185, sockets:['LGA1700','AM5','AM4'], price:129 }
  ],
  case: [
    { id:'case-itx', name:'乔思伯 A4 ITX 机箱', brand:'乔思伯', form:['ITX'], maxGpu:335, maxCooler:70, maxRad:0, price:499 },
    { id:'case-matx', name:'先马 趣造 mATX', brand:'先马', form:['mATX','ITX'], maxGpu:340, maxCooler:160, maxRad:240, price:299 },
    { id:'case-atx', name:'追风者 XT523 中塔', brand:'追风者', form:['ATX','mATX','ITX'], maxGpu:400, maxCooler:185, maxRad:360, price:549 },
    { id:'case-full', name:'海盗船 7000D 全塔', brand:'海盗船', form:['ATX','mATX','ITX'], maxGpu:450, maxCooler:190, maxRad:420, price:1499 },
    { id:'case-atx2', name:'联力 LANCOOL 216 中塔', brand:'联力', form:['ATX','mATX','ITX'], maxGpu:392, maxCooler:180, maxRad:360, price:599 }
  ],
  fan: [
    { id:'fan-none', name:'不额外加装', brand:'-', size:0, rgb:false, price:0 },
    { id:'fan-basic', name:'利民 TL-C12 风扇x3', brand:'利民', size:120, rgb:false, price:99 },
    { id:'fan-rgb', name:'恩杰 F120 RGB 风扇x3', brand:'恩杰', size:120, rgb:true, price:299 },
    { id:'fan-arctic5', name:'Arctic P12 PWM 五联包', brand:'Arctic', size:120, rgb:false, price:149 }
  ]
};

/* 品类元信息：中文名、图标(内联svg id)、装机顺序 */
const CATS = [
  { key:'cpu',    label:'处理器 CPU',   order:1, slot:'cpu' },
  { key:'cooler', label:'散热器',       order:5, slot:'cooler' },
  { key:'mobo',   label:'主板',         order:0, slot:'board' },
  { key:'ram',    label:'内存',         order:2, slot:'ram' },
  { key:'gpu',    label:'显卡 GPU',     order:4, slot:'pcie' },
  { key:'ssd',    label:'固态硬盘',     order:3, slot:'m2' },
  { key:'psu',    label:'电源',         order:6, slot:'psu' },
  { key:'case',   label:'机箱',         order:0, slot:null },
  { key:'fan',    label:'机箱风扇',     order:7, slot:null }
];

/* 使用场景 → 预算权重（各品类占比），核心档位由预算驱动 */
const USE_CASES = {
  game:   { label:'游戏娱乐', icon:'game',  weight:{cpu:.16,gpu:.40,mobo:.09,ram:.08,ssd:.08,psu:.07,cooler:.06,case:.05,fan:.01}, key:'game' },
  design: { label:'设计创作', icon:'design',weight:{cpu:.24,gpu:.24,mobo:.10,ram:.14,ssd:.11,psu:.07,cooler:.06,case:.03,fan:.01}, key:'render' },
  office: { label:'办公上网', icon:'office',weight:{cpu:.30,gpu:.08,mobo:.14,ram:.14,ssd:.16,psu:.08,cooler:.05,case:.04,fan:.01}, key:'office' },
  video:  { label:'视频剪辑', icon:'video', weight:{cpu:.26,gpu:.26,mobo:.10,ram:.14,ssd:.11,psu:.06,cooler:.05,case:.01,fan:.01}, key:'render' }
};
