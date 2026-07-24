/* 内联 SVG 图标（按品类），科技线性风格 */
const ICONS = {
  cpu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1" fill="currentColor" stroke="none"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" stroke-linecap="round"/></svg>',
  mobo:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="6" y="6" width="6" height="6" rx="1"/><path d="M15 7h3M15 10h3M6 15h12M8 15v3M12 15v3M16 15v3" stroke-linecap="round"/></svg>',
  gpu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="8" cy="12" r="2.6"/><circle cx="15" cy="12" r="2.6"/><path d="M2 18v2M6 18v2" stroke-linecap="round"/></svg>',
  ram:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2" y="7" width="20" height="9" rx="1.5"/><path d="M6 7v4M10 7v4M14 7v4M18 7v4M5 20v-4M19 20v-4" stroke-linecap="round"/></svg>',
  ssd:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="3"/><path d="M8 16h8M8 18.5h5" stroke-linecap="round"/></svg>',
  psu:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="3"/><path d="M9 9v3l2 1.5M16 10h3M16 14h3" stroke-linecap="round"/></svg>',
  cooler:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="3"/><path d="M12 3c2 3 2 5 0 6M12 21c-2-3-2-5 0-6M3 12c3-2 5-2 6 0M21 12c-3 2-5 2-6 0" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  case:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M9 6h6M9 9h6M9 18h2" stroke-linecap="round"/></svg>',
  fan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="2"/><path d="M12 10c0-4 1-6 3-6s2 3-1 6M14 12c4 0 6 1 6 3s-3 2-6-1M12 14c0 4-1 6-3 6s-2-3 1-6M10 12c-4 0-6-1-6-3s3-2 6 1" stroke-linejoin="round"/></svg>',
  check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l9 16H3z" stroke-linejoin="round"/><path d="M12 10v4M12 17h.01" stroke-linecap="round"/></svg>',
  error:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M15 9l-6 6M9 9l6 6" stroke-linecap="round"/></svg>',
  arrow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  grip:'<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/></svg>',
  board:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>',
  pcie:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="9" width="18" height="6" rx="1"/><path d="M6 15v3M9 15v3" stroke-linecap="round"/></svg>',
  m2:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="10" width="18" height="4" rx="1"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>'
};
