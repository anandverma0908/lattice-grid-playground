// =============================================================================
//  LatticeGrid — Documentation
//  Three-pane layout: Left nav + Main content + Right ToC
// =============================================================================

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import {
  LatticeGrid,
  GRID_THEMES,
  type ThemePreset,
  type GridEngine,
  type ColumnDef,
  type SortState,
  type ColumnState,
  type ColumnManagerRenderProps,
  useColumnFilter,
  useGridPagination,
  useGridExport,
  useRowSelection,
} from '@lattice-grid-lib/core';
import { generateInventoryData, type InventoryRow } from '../data/inventory';

// ─────────────────────────────────────────────────────────────────────────────
//  STABLE DATA
// ─────────────────────────────────────────────────────────────────────────────

const DATA200 = generateInventoryData(200);

// ─────────────────────────────────────────────────────────────────────────────
//  LOGO
// ─────────────────────────────────────────────────────────────────────────────

export function LatticeGridLogo({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'linear-gradient(135deg, #2563eb 0%, #6d28d9 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(37,99,235,0.35)',
      }}
    >
      <svg width={size * 0.68} height={size * 0.68} viewBox="0 0 22 22" fill="none">
        <rect x="1"    y="1"    width="6"   height="3"   rx="0.8" fill="white" opacity="1"    />
        <rect x="8.5"  y="1"    width="5.5" height="3"   rx="0.8" fill="white" opacity="0.5"  />
        <rect x="15.5" y="1"    width="5.5" height="3"   rx="0.8" fill="white" opacity="0.3"  />
        <rect x="1"    y="5.5"  width="6"   height="2.5" rx="0.8" fill="white" opacity="0.88" />
        <rect x="8.5"  y="5.5"  width="5.5" height="2.5" rx="0.8" fill="white" opacity="0.4"  />
        <rect x="15.5" y="5.5"  width="5.5" height="2.5" rx="0.8" fill="white" opacity="0.22" />
        <rect x="1"    y="9.5"  width="6"   height="2.5" rx="0.8" fill="white" opacity="0.88" />
        <rect x="8.5"  y="9.5"  width="5.5" height="2.5" rx="0.8" fill="white" opacity="0.4"  />
        <rect x="15.5" y="9.5"  width="5.5" height="2.5" rx="0.8" fill="white" opacity="0.22" />
        <rect x="1"    y="13.5" width="6"   height="2.5" rx="0.8" fill="white" opacity="0.75" />
        <rect x="8.5"  y="13.5" width="5.5" height="2.5" rx="0.8" fill="white" opacity="0.32" />
        <rect x="15.5" y="13.5" width="5.5" height="2.5" rx="0.8" fill="white" opacity="0.18" />
        <rect x="1"    y="17.5" width="6"   height="2.5" rx="0.8" fill="white" opacity="0.6"  />
        <rect x="8.5"  y="17.5" width="5.5" height="2.5" rx="0.8" fill="white" opacity="0.25" />
        <rect x="15.5" y="17.5" width="5.5" height="2.5" rx="0.8" fill="white" opacity="0.14" />
        <line x1="8" y1="0.5" x2="8" y2="21.5" stroke="white" strokeWidth="0.6" opacity="0.45" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CODE BLOCK
// ─────────────────────────────────────────────────────────────────────────────

function Code({ children, lang = 'tsx' }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', margin: '14px 0', border: '1px solid var(--doc-bdr)' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 14px', background: 'var(--doc-code-hdr)', borderBottom: '1px solid var(--doc-bdr)',
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--doc-dim)', letterSpacing: '.08em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
          {lang}
        </span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(children.trim());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          style={{
            background: 'none', border: '1px solid var(--doc-bdr)', borderRadius: 4,
            padding: '2px 9px', fontSize: 11, cursor: 'pointer', fontFamily: 'sans-serif',
            color: copied ? '#3fb950' : 'var(--doc-dim)', transition: 'color 0.15s',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: '14px 18px',
        background: 'var(--doc-code-bg)', color: 'var(--doc-code-txt)',
        fontSize: 12.5, lineHeight: 1.75, overflow: 'auto',
        fontFamily: "'JetBrains Mono','Fira Code',monospace",
      }}>
        <code>{children.trim()}</code>
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  CALLOUT
// ─────────────────────────────────────────────────────────────────────────────

function Callout({ type = 'info', children }: { type?: 'info' | 'tip' | 'warn'; children: React.ReactNode }) {
  const map = {
    info: { bg: 'rgba(37,99,235,0.08)',  bdr: 'rgba(37,99,235,0.35)', txt: 'var(--doc-callout-info)',  icon: 'ℹ' },
    tip:  { bg: 'rgba(22,163,74,0.08)',  bdr: 'rgba(22,163,74,0.35)', txt: 'var(--doc-callout-tip)',   icon: '✦' },
    warn: { bg: 'rgba(217,119,6,0.08)',  bdr: 'rgba(217,119,6,0.35)', txt: 'var(--doc-callout-warn)',  icon: '⚠' },
  };
  const c = map[type];
  return (
    <div style={{ display: 'flex', gap: 10, padding: '10px 14px', borderRadius: 7, margin: '14px 0', background: c.bg, border: `1px solid ${c.bdr}` }}>
      <span style={{ fontSize: 13, color: c.txt, flexShrink: 0, marginTop: 1 }}>{c.icon}</span>
      <span style={{ fontSize: 13, color: c.txt, lineHeight: 1.65 }}>{children}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROPS TABLE
// ─────────────────────────────────────────────────────────────────────────────

function PropsTable({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--doc-bdr)', margin: '14px 0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--doc-tbl-hdr)' }}>
            {['Prop / Key', 'Type', 'Default', 'Description'].map(h => (
              <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--doc-dim)', borderBottom: '1px solid var(--doc-bdr)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function PropRow({ prop, type, def, desc }: { prop: string; type: string; def?: string; desc: string }) {
  return (
    <tr>
      <td style={{ padding: '8px 14px', fontFamily: 'monospace', fontSize: 12, color: 'var(--doc-prop)', borderBottom: '1px solid var(--doc-bdr)', whiteSpace: 'nowrap' }}>{prop}</td>
      <td style={{ padding: '8px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--doc-type)', borderBottom: '1px solid var(--doc-bdr)', whiteSpace: 'nowrap' }}>{type}</td>
      <td style={{ padding: '8px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--doc-dim)',  borderBottom: '1px solid var(--doc-bdr)' }}>{def ?? '—'}</td>
      <td style={{ padding: '8px 14px', fontSize: 12.5, color: 'var(--doc-txt)', borderBottom: '1px solid var(--doc-bdr)', lineHeight: 1.55 }}>{desc}</td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LIVE GRID WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

function LiveGrid(props: {
  height?: number;
  theme?: ThemePreset;
  columns?: ColumnDef<InventoryRow>[];
  data?: InventoryRow[];
  label?: string;
  [key: string]: unknown;
}) {
  const { height = 240, theme = 'light', columns = SIMPLE_COLS, data = DATA200.slice(0, 50), label, ...rest } = props;
  return (
    <div style={{ margin: '14px 0' }}>
      {label && (
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--doc-dim)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.07em' }}>
          {label}
        </div>
      )}
      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--doc-bdr)' }}>
        <LatticeGrid<InventoryRow>
          columns={columns as ColumnDef<InventoryRow>[]}
          data={data}
          theme={theme}
          height={height}
          rowHeight={34}
          headerHeight={36}
          groupHeaderHeight={26}
          getRowId={r => r.id}
          {...(rest as Record<string, unknown>)}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION / SUBSECTION
// ─────────────────────────────────────────────────────────────────────────────

function Section({ id, title, subtitle, badge, children }: {
  id: string; title: string; subtitle?: string;
  badge?: { text: string; color: string };
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ marginBottom: 72, scrollMarginTop: 20 }}>
      <div style={{ paddingBottom: 16, marginBottom: subtitle ? 4 : 20, borderBottom: '1px solid var(--doc-bdr)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', margin: 0, color: 'var(--doc-txt)' }}>
            {title}
          </h2>
          {badge && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, background: badge.color + '22', color: badge.color, letterSpacing: '.05em', fontFamily: 'monospace' }}>
              {badge.text}
            </span>
          )}
        </div>
        {subtitle && (
          <p style={{ fontSize: 14, color: 'var(--doc-dim)', marginTop: 8, marginBottom: 0, lineHeight: 1.7, maxWidth: 660 }}>
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, margin: '24px 0 10px', color: 'var(--doc-txt)', letterSpacing: '-0.01em' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  FEATURE PILL
// ─────────────────────────────────────────────────────────────────────────────

function FeaturePill({ label }: { label: string }) {
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 500, background: 'var(--doc-pill-bg)', color: 'var(--doc-pill-txt)', border: '1px solid var(--doc-bdr)', lineHeight: 1 }}>
      {label}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED COLUMNS (used by most demos)
// ─────────────────────────────────────────────────────────────────────────────

const SIMPLE_COLS: ColumnDef<InventoryRow>[] = [
  { id: 'product', label: 'Product', field: 'product', width: 200, pinned: 'left', sortable: true },
  { id: 'dc',      label: 'DC',      field: 'dc',      width: 110, sortable: true },
  { id: 'channel', label: 'Ch.',     field: 'channel', width: 55,  sortable: true, align: 'center' },
  { id: 'status',  label: 'Status',  field: 'status',  width: 90,  sortable: true },
  { id: 'stock',   label: 'Stock',   field: 'stock',   width: 80,  sortable: true, align: 'right' },
  { id: 'sold',    label: 'Sold',    field: 'sold',    width: 80,  sortable: true, align: 'right' },
  { id: 'q1',      label: 'Q1',      field: 'q1',      width: 70,  sortable: true, align: 'right' },
  { id: 'q2',      label: 'Q2',      field: 'q2',      width: 70,  sortable: true, align: 'right' },
  { id: 'q3',      label: 'Q3',      field: 'q3',      width: 70,  sortable: true, align: 'right' },
];

const ROW_GROUP_COLS: ColumnDef<InventoryRow>[] = SIMPLE_COLS.map((col) => {
  if ('children' in col) return col;
  if (col.id === 'channel') return { ...col, rowGroupIndex: 0 };
  if (col.id === 'dc') return { ...col, rowGroupIndex: 1 };
  if (col.id === 'status') return { ...col, rowGroupIndex: 2 };
  return col;
});

// ─────────────────────────────────────────────────────────────────────────────
//  NAV STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

const NAV_GROUPS = [
  { group: 'Getting Started', items: [
    { id: 'overview',   label: 'Overview' },
    { id: 'install',    label: 'Installation' },
    { id: 'quickstart', label: 'Quick Start' },
  ]},
  { group: 'Columns', items: [
    { id: 'col-defs',    label: 'Column Definitions' },
    { id: 'col-groups',  label: 'Column Groups' },
    { id: 'col-pinning', label: 'Column Pinning' },
    { id: 'col-resize',  label: 'Column Resize' },
    { id: 'col-reorder', label: 'Drag & Reorder' },
    { id: 'col-hide',    label: 'Show / Hide' },
    { id: 'col-freeze',  label: 'Auto-Freeze' },
    { id: 'col-manager', label: 'Column Manager' },
  ]},
  { group: 'Data & Interaction', items: [
    { id: 'sorting',     label: 'Client Sorting' },
    { id: 'server-sort', label: 'Server-Side Sort' },
    { id: 'filtering',   label: 'Filtering' },
    { id: 'row-grouping', label: 'Row Grouping' },
    { id: 'row-select',  label: 'Row Selection' },
    { id: 'keyboard',    label: 'Keyboard Interaction' },
    { id: 'pagination',  label: 'Pagination' },
    { id: 'export',      label: 'Export' },
  ]},
  { group: 'Rendering', items: [
    { id: 'cell-render',   label: 'Cell Renderers' },
    { id: 'header-render', label: 'Header Renderers' },
  ]},
  { group: 'Customization', items: [
    { id: 'theming',    label: 'Theming & Tokens' },
    { id: 'features',   label: 'Feature Flags' },
    { id: 'icons',      label: 'Icons' },
    { id: 'classnames', label: 'CSS Classes' },
    { id: 'styles',     label: 'Style Overrides' },
    { id: 'slots',      label: 'Slots' },
  ]},
  { group: 'Advanced', items: [
    { id: 'persistence',    label: 'Persistence' },
    { id: 'headless',       label: 'Headless API' },
    { id: 'virtualisation', label: 'Virtualisation' },
  ]},
  { group: 'Reference', items: [
    { id: 'ref-props',  label: 'Props' },
    { id: 'ref-tokens', label: 'Token Reference' },
    { id: 'ref-hooks',  label: 'Hooks' },
    { id: 'ref-types',  label: 'Types' },
  ]},
];

const ALL_IDS = NAV_GROUPS.flatMap(g => g.items.map(i => i.id));

// ─────────────────────────────────────────────────────────────────────────────
//  EXTERNAL COLUMN PANEL
// ─────────────────────────────────────────────────────────────────────────────

function ExternalColPanel({ engineRef, isDark }: { engineRef: React.MutableRefObject<GridEngine<InventoryRow> | null>; isDark: boolean }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 200);
    return () => clearInterval(id);
  }, []);

  const engine = engineRef.current;
  if (!engine) return <div style={{ padding: 12, fontSize: 11, color: 'var(--doc-dim)' }}>—</div>;

  return (
    <div>
      {engine.orderedColumns.slice(0, 9).map(col => (
        <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderBottom: '1px solid var(--doc-bdr)', fontSize: 11 }}>
          <input type="checkbox" checked={!col.hidden} onChange={() => { engine.toggleColumnVisibility(col.id); setTick(t => t + 1); }} style={{ accentColor: '#2563eb', cursor: 'pointer', flexShrink: 0 }} />
          <span style={{ color: col.hidden ? 'var(--doc-dim)' : 'var(--doc-txt)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{col.label}</span>
          {col.pinned && <span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: 'rgba(37,99,235,0.15)', color: '#2563eb', fontWeight: 700 }}>{col.pinned}</span>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DOCS COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export function Docs({ isDark }: { isDark: boolean }) {
  const bg   = isDark ? '#070c14' : '#f8f9fb';
  const surf = isDark ? '#0d1117' : '#ffffff';
  const bdr  = isDark ? '#1e2840' : '#e5e7eb';
  const txt  = isDark ? '#e4e8f0' : '#111827';
  const dim  = isDark ? '#6b7a96' : '#6b7280';

  const cssVars = {
    '--doc-bg': bg, '--doc-surf': surf, '--doc-bdr': bdr, '--doc-txt': txt, '--doc-dim': dim,
    '--doc-code-bg':  isDark ? '#0a0f1a' : '#f6f8fa',
    '--doc-code-hdr': isDark ? '#0d1117' : '#f0f2f5',
    '--doc-code-txt': isDark ? '#e6edf3' : '#1e2d40',
    '--doc-tbl-hdr':  isDark ? '#0d1117' : '#f8f9fb',
    '--doc-prop':     '#a78bfa',
    '--doc-type':     isDark ? '#34d399' : '#059669',
    '--doc-pill-bg':  isDark ? '#1e2840' : '#f0f4f8',
    '--doc-pill-txt': isDark ? '#93c5fd' : '#374151',
    '--doc-callout-info': isDark ? '#93c5fd' : '#1d4ed8',
    '--doc-callout-tip':  isDark ? '#86efac' : '#15803d',
    '--doc-callout-warn': isDark ? '#fcd34d' : '#b45309',
    '--doc-nav-active-bg':  isDark ? '#1e2d4a' : '#eff6ff',
    '--doc-nav-active-txt': isDark ? '#93c5fd' : '#1d4ed8',
  } as React.CSSProperties;

  // ── Scroll-spy ─────────────────────────────────────────────────────────────
  const [activeId, setActiveId] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { for (const e of entries) { if (e.isIntersecting) setActiveId(e.target.id); } },
      { root: el, rootMargin: '-10% 0% -75% 0%', threshold: 0 }
    );
    ALL_IDS.forEach(id => { const s = document.getElementById(id); if (s) observer.observe(s); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el && contentRef.current) contentRef.current.scrollTo({ top: el.offsetTop - 20, behavior: 'smooth' });
  };

  // ── Demo state ─────────────────────────────────────────────────────────────
  const [sortLog, setSortLog]             = useState('Click any column header to sort…');
  const [serverLoading, setServerLoading] = useState(false);
  const [serverData, setServerData]       = useState<InventoryRow[]>(() => DATA200.slice(0, 50));
  const [persistLog, setPersistLog]       = useState('');
  const [activeTheme, setActiveTheme]     = useState<ThemePreset>('light');
  const [keyboardRows, setKeyboardRows]   = useState<InventoryRow[]>(() => DATA200.slice(0, 80));
  const [keyboardLog, setKeyboardLog]     = useState('Focus a cell in the live grid, then try the shortcuts below.');
  const engineRef = useRef<GridEngine<InventoryRow> | null>(null);

  const handleServerSort = useCallback((sort: SortState) => {
    setServerLoading(true);
    setSortLog(`→ GET /rows?sortBy=${sort.columnId ?? 'none'}&dir=${sort.direction} …`);
    setTimeout(() => {
      let rows = [...DATA200.slice(0, 50)];
      if (sort.columnId) {
        const key = sort.columnId as keyof InventoryRow;
        rows.sort((a, b) => {
          const va = a[key], vb = b[key];
          if (va == null) return 1; if (vb == null) return -1;
          const cmp = (va as string) < (vb as string) ? -1 : (va as string) > (vb as string) ? 1 : 0;
          return sort.direction === 'asc' ? cmp : -cmp;
        });
      }
      setServerData(rows);
      setServerLoading(false);
      setSortLog(`✓ ${rows.length} rows sorted by "${sort.columnId ?? 'default'}" ${sort.direction}`);
    }, 500);
  }, []);

  const handlePersist = useCallback((state: ColumnState[]) => {
    setPersistLog(`${state.filter(c => c.hidden).length} hidden · ${state.filter(c => c.pinned).length} pinned · ${state.length} total`);
  }, []);

  const makeKeyboardRow = useCallback((id: number): InventoryRow => ({
    ...(DATA200[0] ?? {}),
    id,
    product: 'Keyboard-created product',
    dc: 'Keyboard Lab',
    channel: 1,
    status: 'active',
    stock: 0,
    sold: 0,
    q1: 0,
    q2: 0,
    q3: 0,
  } as InventoryRow), []);

  const handleKeyboardValueChange = useCallback((
    row: InventoryRow,
    key: keyof InventoryRow,
    label: string,
    value: string,
  ) => {
    setKeyboardRows(prev => prev.map(item => item.id === row.id ? { ...item, [key]: value } : item));
    setKeyboardLog('Updated ' + label + ' on row ' + row.id + ': ' + value);
  }, []);

  const handleKeyboardDelete = useCallback((rows: InventoryRow[]) => {
    const ids = new Set(rows.map(row => row.id));
    setKeyboardRows(prev => prev.filter(row => !ids.has(row.id)));
    setKeyboardLog('Deleted ' + rows.length + ' selected row' + (rows.length === 1 ? '' : 's') + ' with Delete.');
  }, []);

  const handleKeyboardInsert = useCallback(() => {
    setKeyboardRows(prev => {
      const nextId = Math.max(0, ...prev.map(row => row.id)) + 1;
      return [makeKeyboardRow(nextId), ...prev];
    });
    setKeyboardLog('Inserted a new row at the top with Insert.');
  }, [makeKeyboardRow]);

  const keyboardColumns = useMemo((): ColumnDef<InventoryRow>[] =>
    SIMPLE_COLS.map(col => {
      if (col.id === 'product') {
        return {
          ...col,
          renderCell: (value, row) => (
            <input
              aria-label={'Edit product ' + row.id}
              value={String(value ?? '')}
              onChange={event => handleKeyboardValueChange(row, 'product', 'Product', event.target.value)}
              style={{ width: '100%', border: '1px solid var(--vg-border)', borderRadius: 4, padding: '3px 6px', font: 'inherit', background: 'var(--vg-bg-input)', color: 'var(--vg-text)' }}
            />
          ),
        };
      }
      if (col.id === 'status') {
        return {
          ...col,
          renderCell: (value, row) => (
            <select
              aria-label={'Edit status ' + row.id}
              value={String(value ?? 'active')}
              onChange={event => handleKeyboardValueChange(row, 'status', 'Status', event.target.value)}
              style={{ width: '100%', border: '1px solid var(--vg-border)', borderRadius: 4, padding: '3px 6px', font: 'inherit', background: 'var(--vg-bg-input)', color: 'var(--vg-text)' }}
            >
              <option value="active">Active</option>
              <option value="low">Low</option>
              <option value="out">Out</option>
            </select>
          ),
        };
      }
      return col;
    }),
  [handleKeyboardValueChange]);

  const colMgrSlot = useCallback(({ engine }: ColumnManagerRenderProps<InventoryRow>) => { engineRef.current = engine; return null; }, []);
  const colMgrToolbar = useCallback((engine: GridEngine<InventoryRow>) => {
    engineRef.current = engine;
    return (
      <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: `1px solid ${bdr}`, background: 'var(--vg-bg-toolbar)', fontFamily: "'DM Sans', sans-serif", fontSize: 12 }}>
        <span style={{ color: 'var(--vg-text-dim)' }}>{engine.visibleColumns.length}/{engine.orderedColumns.length} visible</span>
        <div style={{ flex: 1 }} />
        <button onClick={engine.resetColumns} style={{ background: 'none', border: `1px solid ${bdr}`, borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer', color: 'var(--vg-text-dim)' }}>Reset</button>
      </div>
    );
  }, [bdr]);

  // ── Column definitions for demos ───────────────────────────────────────────
  const groupedColumns: ColumnDef<InventoryRow>[] = useMemo(() => [
    { id: 'product', label: 'Product', field: 'product', width: 200, pinned: 'left' },
    { id: 'dc',      label: 'DC',      field: 'dc',      width: 110, pinned: 'left' },
    { id: 'week1', label: 'Week 1 — 1–7 Apr', children: [
      { id: 'd1', label: '1 Apr', field: 'd1', width: 70, align: 'right' as const },
      { id: 'd2', label: '2 Apr', field: 'd2', width: 70, align: 'right' as const },
      { id: 'd3', label: '3 Apr', field: 'd3', width: 70, align: 'right' as const },
      { id: 'd4', label: '4 Apr', field: 'd4', width: 70, align: 'right' as const },
    ]},
    { id: 'week2', label: 'Week 2 — 8–14 Apr', children: [
      { id: 'd8',  label: '8 Apr',  field: 'd8',  width: 70, align: 'right' as const },
      { id: 'd9',  label: '9 Apr',  field: 'd9',  width: 70, align: 'right' as const },
      { id: 'd10', label: '10 Apr', field: 'd10', width: 70, align: 'right' as const },
    ]},
    { id: 'stock', label: 'Total Stock', field: 'stock', width: 100, align: 'right' as const },
  ], []);

  const customCellColumns: ColumnDef<InventoryRow>[] = useMemo(() => [
    { id: 'product', label: 'Product', field: 'product', width: 200, pinned: 'left' },
    {
      id: 'status', label: 'Status', field: 'status', width: 110,
      renderCell: (value) => {
        const v = value as string;
        const m: Record<string, [string, string, string]> = { active: ['#dcfce7', '#166534', '#22c55e'], low: ['#fef3c7', '#92400e', '#f59e0b'], out: ['#fee2e2', '#991b1b', '#ef4444'] };
        const [bg2, fg, dot] = m[v] ?? m.active!;
        return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: bg2, color: fg, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 600 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />{v.charAt(0).toUpperCase() + v.slice(1)}</span>;
      },
    },
    {
      id: 'channel', label: 'Channel', field: 'channel', width: 90, align: 'center' as const,
      renderCell: (value) => {
        const cs = ['', '#dbeafe:#1d4ed8', '#fef3c7:#92400e', '#dcfce7:#166534'];
        const [cbg, cfg] = (cs[value as number] ?? cs[1]!).split(':') as [string, string];
        return <span style={{ background: cbg, color: cfg, borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>CH{value as number}</span>;
      },
    },
    {
      id: 'stock', label: 'Stock', field: 'stock', width: 130, align: 'right' as const,
      renderCell: (value) => {
        const v = value as number;
        const pct = Math.min(100, (v / 200) * 100);
        return (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', justifyContent: 'flex-end' }}>
            <span style={{ width: 48, height: 5, background: isDark ? '#1e2840' : '#e5e7eb', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
              <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: '#2563eb', borderRadius: 3 }} />
            </span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', minWidth: 28, textAlign: 'right' }}>{v}</span>
          </span>
        );
      },
    },
    { id: 'sold', label: 'Sold', field: 'sold', width: 80, align: 'right' as const },
    { id: 'q1',   label: 'Q1',   field: 'q1',   width: 70, align: 'right' as const },
  ], [isDark]);

  const renderHeaderColumns: ColumnDef<InventoryRow>[] = useMemo(() => [
    {
      id: 'product', label: 'Product', field: 'product', width: 200, pinned: 'left', sortable: true,
      renderHeader: (col, engine) => {
        const sorted = engine?.sortState.columnId === col.id;
        const dir = engine?.sortState.direction;
        return <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>{col.label}{sorted && <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: '#dbeafe', color: '#1d4ed8', fontWeight: 700 }}>{dir === 'asc' ? '↑ ASC' : '↓ DESC'}</span>}</span>;
      },
    },
    {
      id: 'stock', label: 'Stock', field: 'stock', width: 110, align: 'right' as const, sortable: true,
      renderHeader: (col, engine) => {
        const sorted = engine?.sortState.columnId === col.id;
        return <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, width: '100%' }}><span style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: isDark ? '#1e2840' : '#f0f4f8', color: dim }}>qty</span><span style={{ fontWeight: sorted ? 700 : 600 }}>{col.label}</span></span>;
      },
    },
    {
      id: 'status', label: 'Status', field: 'status', width: 100,
      renderHeader: () => <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />Status</span>,
    },
    { id: 'dc',   label: 'DC',   field: 'dc',   width: 110 },
    { id: 'sold', label: 'Sold', field: 'sold', width: 80, align: 'right' as const, sortable: true },
    { id: 'q1',   label: 'Q1',   field: 'q1',   width: 70, align: 'right' as const },
  ], [isDark, dim]);

  // ── Hooks for live demos ───────────────────────────────────────────────────
  const filter = useColumnFilter({ data: DATA200, columns: SIMPLE_COLS.filter(c => !('children' in c)) as never[] });
  const page   = useGridPagination({ data: DATA200, pageSize: 20 });
  const exporter = useGridExport({ data: DATA200.slice(0, 50), columns: SIMPLE_COLS as never[] });
  const sel    = useRowSelection({ data: DATA200.slice(0, 50), getRowId: r => r.id, mode: 'multi' });

  const gTheme = isDark ? 'dark' : 'light';

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: bg, color: txt, ...cssVars }}>

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
      <div style={{ width: 232, flexShrink: 0, display: 'flex', flexDirection: 'column', background: surf, borderRight: `1px solid ${bdr}`, overflow: 'hidden' }}>


        {/* Nav */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0 20px' }}>
          {NAV_GROUPS.map(group => (
            <div key={group.group} style={{ marginBottom: 6 }}>
              <div style={{ padding: '8px 16px 4px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: dim }}>
                {group.group}
              </div>
              {group.items.map(item => {
                const active = activeId === item.id;
                return (
                  <a key={item.id} href={`#${item.id}`}
                    onClick={e => { e.preventDefault(); scrollTo(item.id); }}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '5px 16px',
                      fontSize: 13, color: active ? 'var(--doc-nav-active-txt)' : dim,
                      textDecoration: 'none',
                      background: active ? 'var(--doc-nav-active-bg)' : 'transparent',
                      borderLeft: `2px solid ${active ? '#2563eb' : 'transparent'}`,
                      fontWeight: active ? 600 : 400,
                      transition: 'all 0.12s',
                    }}
                    onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = txt; (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'; } }}
                    onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.color = dim; (e.currentTarget as HTMLElement).style.background = 'transparent'; } }}
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <div ref={contentRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 48px 100px' }}>

          {/* ════════════ OVERVIEW ════════════ */}
          <section id="overview" style={{ marginBottom: 72, scrollMarginTop: 20 }}>
            {/* <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <LatticeGridLogo size={52} />
              <div>
                <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-.04em', margin: 0, color: txt }}>LatticeGrid</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: isDark ? '#1e3558' : '#dbeafe', color: isDark ? '#93c5fd' : '#1d4ed8' }}>v2.1</span>
                  <span style={{ fontSize: 12, color: dim }}>React · TypeScript · Zero dependencies</span>
                </div>
              </div>
            </div> */}
            <p style={{ fontSize: 16, lineHeight: 1.75, color: dim, maxWidth: 640, marginBottom: 24 }}>
              A high-performance React data grid with row and column virtualisation,
              full TypeScript support, a headless engine, and a deep 6-layer
              customisation API. Handles millions of cells without breaking a sweat.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 28 }}>
              {['Row virtualisation','Column virtualisation','Column groups','Row grouping','Column pinning','Column resize','Drag reorder','Show / hide','Auto-freeze','Row selection','Client & server sort','Custom cell renderers','Custom header renderers','Theme tokens','Feature flags','Custom icons','CSS class names','Style overrides','Slots','Persistence API','Headless engine','Zero dependencies'].map(f => <FeaturePill key={f} label={f} />)}
            </div>
            <LiveGrid height={260} theme={gTheme as ThemePreset} label="Live demo — 200 rows · all features enabled" features={{ toolbar: true, footer: true, rowSelection: true }} freezeColId="dc" />
          </section>

          {/* ════════════ INSTALLATION ════════════ */}
          <Section id="install" title="Installation">
            <Code lang="bash">{`npm install @lattice-grid-lib/core
# yarn
yarn add @lattice-grid-lib/core
# pnpm
pnpm add @lattice-grid-lib/core`}</Code>
            <Callout type="info">Requires <strong>React 18</strong> or later. No other runtime dependencies.</Callout>
          </Section>

          {/* ════════════ QUICK START ════════════ */}
          <Section id="quickstart" title="Quick Start" subtitle="The minimum working setup. Import LatticeGrid, define columns, pass your data.">
            <Code>{`import { LatticeGrid } from '@lattice-grid-lib/core';

interface Product { id: number; name: string; city: string; stock: number; }

const columns = [
  { id: 'name',  label: 'Name',  field: 'name',  width: 200, pinned: 'left' },
  { id: 'city',  label: 'City',  field: 'city',  width: 140 },
  { id: 'stock', label: 'Stock', field: 'stock', width: 90,  align: 'right' },
];

export function ProductTable() {
  return (
    <LatticeGrid<Product>
      columns={columns}
      data={rows}
      height={500}
      theme="light"
      getRowId={row => row.id}
    />
  );
}`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset} features={{ toolbar: false, footer: false }} label="Result" />
          </Section>

          {/* ════════════ COLUMN DEFINITIONS ════════════ */}
          <Section id="col-defs" title="Column Definitions" subtitle="Every property a leaf column supports. Only id and label are required.">
            <Code>{`import type { ColumnDef } from '@lattice-grid-lib/core';

const columns: ColumnDef<MyRow>[] = [
  {
    id: 'product',          // required — unique key
    label: 'Product / SKU', // required — header text

    field:    'product',    // row key (defaults to id)
    accessor: row => row.price * 1.2,  // custom getter — overrides field

    width:    200,    minWidth: 80,   maxWidth: 400,
    align:    'right',                // 'left' | 'center' | 'right'

    pinned: 'left',   // pin on mount: 'left' | 'right'
    hidden: false,    // hide on mount

    sortable:  true,  resizable: true,
    draggable: true,  hideable:  true,

    rowGroup: true,        // include this column in row grouping
    rowGroupIndex: 0,      // grouping order; lower number = outer level
    rowGroupValueGetter: row => row.product.toLowerCase(),

    renderCell:   (value, row) => <strong>{value}</strong>,
    renderHeader: (col, engine) => <span>{col.label} ✦</span>,

    cellStyle:   { fontWeight: 600 },
    headerStyle: { fontStyle: 'italic' },
  },
];`}</Code>
            <PropsTable>
              <PropRow prop="id"           type="string"                    def="required" desc="Unique column identifier." />
              <PropRow prop="label"        type="string"                    def="required" desc="Header display text." />
              <PropRow prop="field"        type="keyof TData"               def="= id"     desc="Row object field key." />
              <PropRow prop="accessor"     type="(row: TData) => unknown"   def="—"        desc="Custom value getter. Takes precedence over field." />
              <PropRow prop="width"        type="number"                    def="120"      desc="Initial column width in px." />
              <PropRow prop="minWidth"     type="number"                    def="40"       desc="Minimum width when resizing." />
              <PropRow prop="maxWidth"     type="number"                    def="Infinity" desc="Maximum width when resizing." />
              <PropRow prop="align"        type="'left'|'center'|'right'"   def="'left'"   desc="Cell content alignment." />
              <PropRow prop="pinned"       type="'left'|'right'"            def="—"        desc="Pin column on mount." />
              <PropRow prop="hidden"       type="boolean"                   def="false"    desc="Hide column on mount." />
              <PropRow prop="sortable"     type="boolean"                   def="true"     desc="Allow sorting." />
              <PropRow prop="resizable"    type="boolean"                   def="true"     desc="Show resize handle." />
              <PropRow prop="draggable"    type="boolean"                   def="true"     desc="Allow drag-to-reorder." />
              <PropRow prop="hideable"     type="boolean"                   def="true"     desc="Show × hide button on hover." />
              <PropRow prop="rowGroup"     type="boolean"                   def="false"    desc="Include this column in row grouping when the grid does not receive an explicit groupBy prop." />
              <PropRow prop="rowGroupIndex" type="number"                   def="—"        desc="Grouping order. Supplying an index also enables row grouping for this column." />
              <PropRow prop="rowGroupValueGetter" type="(row) => unknown"   def="—"        desc="Custom grouping key getter used only for row grouping." />
              <PropRow prop="renderCell"   type="(value, row) => ReactNode" def="—"        desc="Custom cell renderer." />
              <PropRow prop="renderHeader" type="(col, engine) => ReactNode" def="—"       desc="Custom header renderer." />
              <PropRow prop="cellStyle"    type="CSSProperties"             def="—"        desc="Inline style for every data cell." />
              <PropRow prop="headerStyle"  type="CSSProperties"             def="—"        desc="Inline style for the header cell." />
            </PropsTable>
          </Section>

          {/* ════════════ COLUMN GROUPS ════════════ */}
          <Section id="col-groups" title="Column Groups" subtitle="Nest leaf columns under a group header. Groups span the top header row; their children appear in the second row.">
            <Code>{`const columns = [
  // Pinned — spans both header rows automatically
  { id: 'product', label: 'Product', field: 'product', width: 200, pinned: 'left' },

  // Group column — renders only in the top row
  {
    id: 'week1',
    label: 'Week 1 — 1–7 Apr 2026',
    children: [
      { id: 'd1', label: '1 Apr', field: 'd1', width: 70, align: 'right' },
      { id: 'd2', label: '2 Apr', field: 'd2', width: 70, align: 'right' },
    ],
  },

  // Standalone leaf outside any group → gets rowspan=2 automatically
  { id: 'total', label: 'Total', field: 'stock', width: 90, align: 'right' },
];`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset} columns={groupedColumns} features={{ toolbar: false, footer: false }} label="Two-level header with column groups" />
            <Callout type="tip">Groups are <strong>one level deep</strong> only. Standalone columns (not in any group) automatically receive rowspan=2.</Callout>
          </Section>

          {/* ════════════ COLUMN PINNING ════════════ */}
          <Section id="col-pinning" title="Column Pinning" subtitle="Freeze columns to the left or right edge. Pinned columns are rendered in separate overlay layers and never scroll out of view.">
            <Code>{`// Pin at definition time
{ id: 'name',    label: 'Name',    pinned: 'left'  }
{ id: 'actions', label: 'Actions', pinned: 'right' }

// Pin programmatically via the engine
engine.pinColumn('name', 'left');   // pin to left
engine.pinColumn('name', 'right');  // move to right
engine.pinColumn('name', null);     // unpin`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset} features={{ toolbar: false, footer: false }} label="Scroll right — 'Product' stays pinned" />
            <Callout type="info">Multiple pinned columns stack in order. Their combined width is subtracted from the scrollable viewport — virtualisation only applies to scrollable columns.</Callout>
          </Section>

          {/* ════════════ COLUMN RESIZE ════════════ */}
          <Section id="col-resize" title="Column Resize" subtitle="Drag the handle on the right edge of any header cell to resize. Respects minWidth and maxWidth constraints per column.">
            <Code>{`// Resize is enabled by default. Disable globally:
<LatticeGrid features={{ resize: false }} />

// Disable for a specific column:
{ id: 'id', label: 'ID', resizable: false }

// Constraints per column:
{ id: 'name', label: 'Name', width: 200, minWidth: 80, maxWidth: 500 }

// Callback when user finishes resizing:
<LatticeGrid onColumnResize={(columnId, newWidth) => save(columnId, newWidth)} />`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset} features={{ toolbar: false, footer: false }} label="Drag the right edge of any header to resize" />
          </Section>

          {/* ════════════ DRAG REORDER ════════════ */}
          <Section id="col-reorder" title="Drag & Reorder" subtitle="Drag any column header left or right to change its position. Works across pinned and scrollable columns.">
            <Code>{`// Enabled by default. Disable globally:
<LatticeGrid features={{ reorder: false }} />

// Disable for a specific column:
{ id: 'id', label: 'ID', draggable: false }

// Callback with new order:
<LatticeGrid onColumnReorder={newOrder => saveOrder(newOrder)} />`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset} features={{ toolbar: false, footer: false }} label="Drag column headers to reorder" />
          </Section>

          {/* ════════════ SHOW / HIDE ════════════ */}
          <Section id="col-hide" title="Show / Hide Columns" subtitle="Hover any column header to reveal the × hide button. Show hidden columns via the Column Manager panel or programmatically.">
            <Code>{`// Disabled globally with:
<LatticeGrid features={{ columnHide: false }} />

// Prevent a specific column from being hidden:
{ id: 'id', label: 'ID', hideable: false }

// Programmatic:
engine.toggleColumnVisibility('product');
engine.showAllColumns();

// Hidden on mount:
{ id: 'internal', label: 'Internal', hidden: true }`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset} features={{ footer: false }} label="Hover a column header then click × to hide it" />
          </Section>

          {/* ════════════ AUTO-FREEZE ════════════ */}
          <Section id="col-freeze" title="Auto-Freeze" subtitle="Specify a column that visually freezes when it scrolls behind the pinned-left band. The engine state is never mutated — virtualisation is unaffected.">
            <Code>{`<LatticeGrid freezeColId="dc" />

// When scrollLeft > offset[freezeColId], the column is rendered
// in a visual overlay slot at the right edge of the pinned band.
// Scrolling back left removes it seamlessly.`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset} freezeColId="dc" features={{ footer: false }} label="Scroll right — 'DC' auto-freezes next to 'Product'" />
            <Callout type="info">Only scrollable (non-pinned) columns can be auto-frozen. The frozen slot uses the <code>--vg-bg-frozen</code> token for its background colour.</Callout>
          </Section>

          {/* ════════════ COLUMN MANAGER ════════════ */}
          <Section id="col-manager" title="Column Manager" subtitle="Lets users show/hide and pin columns. Can be placed anywhere — built-in dropdown, sidebar, drawer, modal, or any custom location.">
            <SubSection title="Built-in (default)">
              <p style={{ fontSize: 13, color: dim, marginBottom: 8, lineHeight: 1.65 }}>By default the <strong>Columns</strong> button in the toolbar opens a dropdown panel. No configuration needed.</p>
              <LiveGrid height={220} theme={gTheme as ThemePreset} label="Click 'Columns' in the toolbar" />
            </SubSection>
            <SubSection title="Custom placement — render anywhere">
              <Code>{`const engineRef = useRef(null);

<LatticeGrid
  slots={{
    toolbar: (engine) => { engineRef.current = engine; return <MyToolbar />; },
    // Return null — suppress the built-in popup
    columnManager: ({ engine }) => { engineRef.current = engine; return null; },
  }}
/>

// Panel rendered OUTSIDE the grid — sidebar, drawer, modal
<aside>
  {engineRef.current && (
    <MyColumnPanel engine={engineRef.current} />
  )}
</aside>

function MyColumnPanel({ engine }) {
  return engine.orderedColumns.map(col => (
    <label key={col.id}>
      <input type="checkbox" checked={!col.hidden}
        onChange={() => engine.toggleColumnVisibility(col.id)} />
      {col.label}
    </label>
  ));
}`}</Code>
              {/* Live demo */}
              <div style={{ display: 'flex', gap: 10, height: 260, margin: '14px 0', border: `1px solid ${bdr}`, borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <LatticeGrid<InventoryRow>
                    columns={SIMPLE_COLS} data={DATA200.slice(0, 40)} height={260}
                    theme={gTheme as ThemePreset} rowHeight={34} headerHeight={36} getRowId={r => r.id}
                    slots={{ toolbar: colMgrToolbar, columnManager: colMgrSlot }}
                    features={{ toolbar: true, footer: false }}
                  />
                </div>
                <div style={{ width: 178, flexShrink: 0, borderLeft: `1px solid ${bdr}`, background: surf, overflow: 'auto' }}>
                  <div style={{ padding: '8px 12px', borderBottom: `1px solid ${bdr}`, fontWeight: 700, color: txt, fontSize: 11 }}>Column panel (sidebar)</div>
                  <ExternalColPanel engineRef={engineRef} isDark={isDark} />
                </div>
              </div>
            </SubSection>
          </Section>

          {/* ════════════ CLIENT SORTING ════════════ */}
          <Section id="sorting" title="Client Sorting" subtitle="Click any sortable column header to sort. Cycles through ascending → descending → unsorted. All sorting happens in-memory.">
            <Code>{`// Sorting is enabled by default. Disable globally:
<LatticeGrid features={{ sort: false }} />

// Disable on a specific column:
{ id: 'actions', label: 'Actions', sortable: false }

// React to sort changes:
<LatticeGrid onSortChange={({ columnId, direction }) => {
  console.log(columnId, direction); // 'stock', 'desc'
}} />`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset}
              onSortChange={(s: SortState) => setSortLog(`Sorted by "${s.columnId ?? 'none'}" · ${s.direction}`)}
              features={{ footer: false }} label="Click any column header to sort" />
            <div style={{ padding: '7px 12px', borderRadius: 6, fontSize: 11.5, background: isDark ? '#0a1420' : '#f0f4f8', fontFamily: 'monospace', color: isDark ? '#4ade80' : '#16a34a', marginTop: -6 }}>
              {sortLog}
            </div>
          </Section>

          {/* ════════════ SERVER-SIDE SORT ════════════ */}
          <Section id="server-sort" title="Server-Side Sort" badge={{ text: 'sortMode="server"', color: '#2563eb' }}
            subtitle="When sortMode is 'server', the grid skips internal sorting and renders data as-is. Your onSortChange fetches the sorted page from your API.">
            <Code>{`function ServerGrid() {
  const [data, setData]       = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <LatticeGrid
      sortMode="server"         // disable internal sort
      data={data}               // your pre-sorted server data
      loading={loading}         // show spinner while fetching
      onSortChange={async (sort) => {
        setLoading(true);
        setData(await api.get('/rows', { params: sort }));
        setLoading(false);
      }}
    />
  );
}`}</Code>
            <div style={{ padding: '7px 12px', borderRadius: 6, fontSize: 11.5, background: isDark ? '#0a1420' : '#f0f4f8', fontFamily: 'monospace', color: isDark ? '#4ade80' : '#16a34a', margin: '10px 0' }}>
              {sortLog}
            </div>
            <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${bdr}` }}>
              <LatticeGrid<InventoryRow>
                columns={SIMPLE_COLS} data={serverData} height={220} theme={gTheme as ThemePreset}
                rowHeight={34} headerHeight={36} getRowId={r => r.id}
                sortMode="server" loading={serverLoading} onSortChange={handleServerSort}
                features={{ toolbar: false, footer: false }}
              />
            </div>
            <Callout type="tip">With server-side sort you typically also do server-side pagination. Pass each page as <code>data</code> — the grid renders it as-is.</Callout>
          </Section>

          {/* ════════════ FILTERING ════════════ */}
          <Section id="filtering" title="Filtering" subtitle="useColumnFilter provides client-side column filtering. Pass filteredData to the grid. Compose freely with pagination and selection.">
            <Code>{`import { useColumnFilter } from '@lattice-grid-lib/core';

function FilterableGrid() {
  const filter = useColumnFilter({ data, columns: leafColumns });

  return (
    <>
      <input placeholder="Filter product…"
        onChange={e => filter.setFilter('product', e.target.value)} />
      {filter.isFiltered && <button onClick={filter.clearAllFilters}>Clear</button>}

      <LatticeGrid data={filter.filteredData} columns={columns} />
    </>
  );
}

// Custom matcher — numeric >=
useColumnFilter({ data, columns,
  matchers: { stock: (cell, val) => Number(cell) >= Number(val) },
})`}</Code>
            {/* Live */}
            <div style={{ margin: '14px 0' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                {[{ id: 'product', ph: 'Filter product…' }, { id: 'dc', ph: 'Filter DC…' }, { id: 'status', ph: 'Filter status…' }].map(({ id, ph }) => (
                  <input key={id} placeholder={ph} onChange={e => filter.setFilter(id, e.target.value)}
                    style={{ flex: '1 1 140px', padding: '6px 10px', borderRadius: 6, border: `1px solid ${bdr}`, background: surf, color: txt, fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                ))}
                {filter.isFiltered && (
                  <button onClick={filter.clearAllFilters} style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${bdr}`, background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Clear</button>
                )}
              </div>
              <div style={{ fontSize: 11, color: dim, marginBottom: 6 }}>
                {filter.filteredData.length} / {DATA200.length} rows
                {filter.activeFilterCount > 0 && ` · ${filter.activeFilterCount} active filter${filter.activeFilterCount > 1 ? 's' : ''}`}
              </div>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${bdr}` }}>
                <LatticeGrid<InventoryRow> columns={SIMPLE_COLS} data={filter.filteredData} height={220}
                  theme={gTheme as ThemePreset} rowHeight={34} headerHeight={36} getRowId={r => r.id}
                  features={{ toolbar: false, footer: false }} />
              </div>
            </div>
            <PropsTable>
              <PropRow prop="filteredData"       type="TData[]"             def="—"     desc="Filtered data subset — pass this as the grid's data." />
              <PropRow prop="activeFilterCount"  type="number"              def="0"     desc="Number of columns with an active filter." />
              <PropRow prop="isFiltered"         type="boolean"             def="false" desc="True when any filter is active." />
              <PropRow prop="setFilter"          type="(id, value) => void" def="—"     desc="Set the filter value for a column." />
              <PropRow prop="clearFilter"        type="(id) => void"        def="—"     desc="Clear the filter for one column." />
              <PropRow prop="clearAllFilters"    type="() => void"          def="—"     desc="Clear all active filters." />
            </PropsTable>
          </Section>

          {/* ════════════ ROW GROUPING ════════════ */}
          <Section id="row-grouping" title="Row Grouping" subtitle="Use AG Grid-style column config for the easy path, or pass groupBy when you need controlled app state. Each grouping level renders an expandable group row.">
            <Code>{`const columns = [
  { id: 'product', label: 'Product', field: 'product', width: 220 },

  // Easy path: declare grouping on the columns.
  // rowGroupIndex controls nesting order.
  { id: 'channel', label: 'Channel', field: 'channel', rowGroupIndex: 0 },
  { id: 'dc',      label: 'DC',      field: 'dc',      rowGroupIndex: 1 },
  { id: 'status',  label: 'Status',  field: 'status',  rowGroupIndex: 2 },
];

function GroupedInventoryGrid() {
  return (
    <LatticeGrid
      columns={columns}
      data={rows}
      getRowId={row => row.id}
    />
  );
}`}</Code>
            <Code>{`function ControlledGroupingGrid() {
  const [groupBy, setGroupBy] = useState<string[] | undefined>(undefined);

  return (
    <>
      <button onClick={() => setGroupBy(['channel', 'dc', 'status'])}>
        Channel → DC → Status
      </button>
      <button onClick={() => setGroupBy(['status', 'dc'])}>
        Status → DC
      </button>
      <button onClick={() => setGroupBy([])}>
        Clear grouping
      </button>

      <LatticeGrid
        columns={columns}
        data={rows}
        groupBy={groupBy}              // undefined = use column rowGroup config
        onGroupingChange={setGroupBy}
        getRowId={row => row.id}
      />
    </>
  );
}`}</Code>
            <LiveGrid
              height={300}
              theme={gTheme as ThemePreset}
              columns={ROW_GROUP_COLS}
              features={{ toolbar: true, footer: true, rowSelection: true }}
              label="Column config default: Channel → DC → Status"
            />
            <Callout type="info">Filtering should be applied before the grouped data reaches the grid. Sorting still applies to the leaf rows first, then the grouped row model is built from that sorted/filtered result.</Callout>
            <PropsTable>
              <PropRow prop="column.rowGroup" type="boolean" def="false" desc="Include the column in row grouping when groupBy is not explicitly passed." />
              <PropRow prop="column.rowGroupIndex" type="number" def="—" desc="Grouping order. Supplying an index also enables row grouping for that column." />
              <PropRow prop="column.rowGroupValueGetter" type="(row) => unknown" def="—" desc="Custom grouping key used only for grouping." />
              <PropRow prop="groupBy" type="string[]" def="column config" desc="Ordered column ids used to build group levels. Pass [] to explicitly disable column-config grouping." />
              <PropRow prop="onGroupingChange" type="(groupBy) => void" def="—" desc="Called when grouping columns change through the grid engine." />
              <PropRow prop="engine.setGroupingColumns" type="(ids) => void" def="—" desc="Set grouping columns from a custom toolbar or slot." />
              <PropRow prop="engine.toggleGroup" type="(groupId) => void" def="—" desc="Expand or collapse one group row by its stable group id." />
              <PropRow prop="engine.expandAllGroups" type="(ids) => void" def="—" desc="Mark a list of group ids as expanded." />
              <PropRow prop="engine.collapseAllGroups" type="() => void" def="—" desc="Collapse every group row." />
              <PropRow prop="engine.clearGrouping" type="() => void" def="—" desc="Remove all row grouping and return to the flat row model." />
            </PropsTable>
          </Section>

          {/* ════════════ ROW SELECTION ════════════ */}
          <Section id="row-select" title="Row Selection" subtitle="Click any row to select it. The same highlight spans every cell including pinned columns. useRowSelection adds multi-select with shift+click range support.">
            <Code>{`import { useRowSelection } from '@lattice-grid-lib/core';

const sel = useRowSelection({
  data,
  getRowId: r => r.id,
  mode: 'multi',           // 'single' | 'multi'
  onSelectionChange: (ids, rows) => console.log(ids),
});

<LatticeGrid
  features={{ rowSelection: true }}
  onRowClick={(row, index, event) => sel.handleRowClick(row, index, event)}
/>

sel.selectedIds    // Set<RowId>
sel.selectedRows   // TData[]
sel.allSelected    // boolean
sel.someSelected   // boolean — for indeterminate checkbox state
sel.selectAll()
sel.clearSelection()`}</Code>
            {/* Live */}
            <div style={{ margin: '14px 0' }}>
              <div style={{ fontSize: 12, color: dim, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span><strong style={{ color: txt }}>{sel.selectedIds.size}</strong> row{sel.selectedIds.size !== 1 ? 's' : ''} selected</span>
                {sel.selectedIds.size > 0 && <button onClick={sel.clearSelection} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 11, padding: 0 }}>Clear selection</button>}
              </div>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${bdr}` }}>
                <LatticeGrid<InventoryRow> columns={SIMPLE_COLS} data={DATA200.slice(0, 50)} height={240}
                  theme={gTheme as ThemePreset} rowHeight={34} headerHeight={36} getRowId={r => r.id}
                  features={{ toolbar: false, footer: false, rowSelection: true }}
                  onRowClick={(row) => sel.toggleRow((row as InventoryRow).id)} />
              </div>
            </div>
          </Section>

          {/* ════════════ KEYBOARD INTERACTION ════════════ */}
          <Section
            id="keyboard"
            title="Keyboard Interactivity"
            subtitle="WCAG-friendly ARIA grid navigation, selection, custom cell activation, row operations, and column shortcuts using a roving tabindex focus model."
            badge={{ text: 'ARIA Grid', color: '#7c3aed' }}
          >
            <Callout type="tip">
              Click any cell in the live grid, then use the keyboard. Tab and Shift+Tab intentionally leave the grid, so focus is never trapped. Enter or F2 activates controls that your renderCell output already provides.
            </Callout>

            <LiveGrid
              height={300}
              theme={gTheme as ThemePreset}
              columns={keyboardColumns}
              data={keyboardRows}
              label={keyboardLog}
              features={{ toolbar: true, footer: false, rowSelection: true }}
              onRowsDelete={handleKeyboardDelete}
              onRowInsert={handleKeyboardInsert}
            />

            <SubSection title="Navigation">
              <PropsTable>
                <PropRow prop="Arrow keys" type="Up / Down / Left / Right" def="-" desc="Move active cell focus one row or column while preserving grid boundaries and scrolling virtualized rows into view." />
                <PropRow prop="Home / End" type="key" def="-" desc="Move to the first or last cell in the current row." />
                <PropRow prop="Ctrl/Cmd + Home / End" type="shortcut" def="-" desc="Move to the first or last cell in the entire grid." />
                <PropRow prop="Page Up / Page Down" type="key" def="-" desc="Move by one visible viewport of rows and keep the newly focused row visible." />
                <PropRow prop="Tab / Shift+Tab" type="browser focus" def="not trapped" desc="Leaves the grid and moves to the next or previous focusable element on the page." />
              </PropsTable>
            </SubSection>

            <SubSection title="Selection">
              <PropsTable>
                <PropRow prop="Space" type="key" def="-" desc="Selects the current row, matching mouse row selection." />
                <PropRow prop="Ctrl/Cmd + Space" type="shortcut" def="-" desc="Toggles the current row without clearing other selected rows." />
                <PropRow prop="Shift + Arrow keys" type="shortcut" def="-" desc="Extends the selected row range from the selection anchor to the focused row." />
                <PropRow prop="Ctrl/Cmd + A" type="shortcut" def="-" desc="Selects all currently rendered data rows in the grid model." />
              </PropsTable>
            </SubSection>

            <SubSection title="Cell Activation & Row Operations">
              <PropsTable>
                <PropRow prop="Enter" type="key" def="-" desc="Activates the first focusable control rendered inside the current cell, such as an input, select, button, link, or contenteditable element." />
                <PropRow prop="F2" type="key" def="-" desc="Activates the current cell's rendered control without the grid creating an editor." />
                <PropRow prop="Delete" type="key" def="callback" desc="Confirms deletion and calls onRowsDelete with the selected rows and row indexes." />
                <PropRow prop="Insert" type="key" def="callback" desc="Calls onRowInsert so the parent application can create a new row." />
              </PropsTable>
            </SubSection>

            <SubSection title="Column Shortcuts">
              <PropsTable>
                <PropRow prop="Alt + Arrow Left / Right" type="shortcut" def="10px step" desc="Resizes the active column left or right using the same resize engine as pointer resizing." />
                <PropRow prop="Ctrl/Cmd + Shift + Arrow Left / Right" type="shortcut" def="-" desc="Reorders the active column left or right using the same order state as drag reorder." />
              </PropsTable>
            </SubSection>

            <SubSection title="Implementation">
              <Code>{`<LatticeGrid
  columns={[
    { id: 'product', label: 'Product', field: 'product', renderCell: (value, row) => (
      <input
        value={String(value ?? '')}
        onChange={event => updateRow(row.id, { product: event.target.value })}
      />
    )},
    ...columns
  ]}
  data={rows}
  getRowId={row => row.id}
  features={{ rowSelection: true }}
  onRowsDelete={(selectedRows, rowIndexes) => {
    const ids = new Set(selectedRows.map(row => row.id));
    setRows(prev => prev.filter(row => !ids.has(row.id)));
  }}
  onRowInsert={() => {
    setRows(prev => [createEmptyRow(), ...prev]);
  }}
/>`}</Code>
              <PropsTable>
                <PropRow prop="renderCell" type="(value, row) => ReactNode" def="-" desc="Render your own input, select, button, link, or contenteditable control when a cell should be interactive. The grid does not create editors internally." />
                <PropRow prop="onRowsDelete" type="(rows, indexes) => void" def="-" desc="Called after Delete and confirmation. The parent decides how to remove rows." />
                <PropRow prop="onRowInsert" type="() => void" def="-" desc="Called when Insert is pressed. The parent decides the inserted row shape and position." />
              </PropsTable>
            </SubSection>

            <SubSection title="Accessibility Contract">
              <p style={{ fontSize: 13, color: dim, lineHeight: 1.7 }}>
                The grid uses <code>role="grid"</code>, <code>role="row"</code>, <code>role="columnheader"</code>, and <code>role="gridcell"</code>. Cells expose <code>aria-colindex</code>, rows expose <code>aria-rowindex</code>, and selected rows/cells expose <code>aria-selected</code>. Only one cell is tabbable at a time through roving <code>tabIndex</code>, and live-region announcements report selection and row-operation state changes.
              </p>
            </SubSection>
          </Section>

          {/* ════════════ PAGINATION ════════════ */}
          <Section id="pagination" title="Pagination" subtitle="useGridPagination slices your data into pages client-side. Compose with useColumnFilter for filtered pagination.">
            <Code>{`import { useGridPagination } from '@lattice-grid-lib/core';

// Client-side
const page = useGridPagination({ data: allRows, pageSize: 50 });
<LatticeGrid data={page.pageData} />

// Server-side
const page = useGridPagination({ totalRows: 50_000, pageSize: 100 });
useEffect(() => fetchPage(page.currentPage), [page.currentPage]);

page.currentPage  page.pageCount   page.totalRows
page.canGoPrev    page.canGoNext
page.nextPage()   page.prevPage()  page.goToPage(n)`}</Code>
            {/* Live */}
            <div style={{ margin: '14px 0' }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${bdr}` }}>
                <LatticeGrid<InventoryRow> columns={SIMPLE_COLS} data={page.pageData as InventoryRow[]} height={220}
                  theme={gTheme as ThemePreset} rowHeight={34} headerHeight={36} getRowId={r => r.id}
                  features={{ toolbar: false, footer: false }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', border: `1px solid ${bdr}`, borderTop: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, background: surf }}>
                <span style={{ fontSize: 12, color: dim, flex: 1 }}>Page {page.currentPage} of {page.pageCount} · {page.totalRows} rows</span>
                <button disabled={!page.canGoPrev} onClick={page.prevPage} style={{ padding: '4px 10px', borderRadius: 5, fontSize: 12, border: `1px solid ${bdr}`, background: 'transparent', color: page.canGoPrev ? txt : dim, cursor: page.canGoPrev ? 'pointer' : 'default', fontFamily: 'inherit' }}>← Prev</button>
                {[...Array(Math.min(page.pageCount, 5))].map((_, i) => {
                  const p = i + 1;
                  const isActive = page.currentPage === p;
                  return <button key={p} onClick={() => page.goToPage(p)} style={{ width: 30, height: 28, borderRadius: 5, fontSize: 12, border: `1px solid ${isActive ? '#2563eb' : bdr}`, background: isActive ? (isDark ? '#1e3558' : '#dbeafe') : 'transparent', color: isActive ? '#2563eb' : txt, cursor: 'pointer', fontFamily: 'inherit', fontWeight: isActive ? 700 : 400 }}>{p}</button>;
                })}
                <button disabled={!page.canGoNext} onClick={page.nextPage} style={{ padding: '4px 10px', borderRadius: 5, fontSize: 12, border: `1px solid ${bdr}`, background: 'transparent', color: page.canGoNext ? txt : dim, cursor: page.canGoNext ? 'pointer' : 'default', fontFamily: 'inherit' }}>Next →</button>
              </div>
            </div>
          </Section>

          {/* ════════════ EXPORT ════════════ */}
          <Section id="export" title="Export" subtitle="useGridExport generates CSV or JSON from the current data and visible columns. Downloads trigger natively in the browser — no server needed.">
            <Code>{`import { useGridExport } from '@lattice-grid-lib/core';

const exporter = useGridExport({
  data:    filteredSortedData,
  columns: engine.visibleColumns,
});

exporter.exportCSV('inventory.csv');    // triggers download
exporter.exportJSON('inventory.json');
const csv  = exporter.getCSVString();   // returns string
const json = exporter.getJSONString();`}</Code>
            {/* Live */}
            <div style={{ margin: '14px 0' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <button onClick={() => exporter.exportCSV('lattice-export.csv')} style={{ padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: `1.5px solid #2563eb`, background: isDark ? '#1e3558' : '#dbeafe', color: isDark ? '#93c5fd' : '#1d4ed8', cursor: 'pointer', fontFamily: 'inherit' }}>↓ Export CSV</button>
                <button onClick={() => exporter.exportJSON('lattice-export.json')} style={{ padding: '7px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: `1.5px solid ${bdr}`, background: 'transparent', color: txt, cursor: 'pointer', fontFamily: 'inherit' }}>↓ Export JSON</button>
              </div>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: `1px solid ${bdr}` }}>
                <LatticeGrid<InventoryRow> columns={SIMPLE_COLS} data={DATA200.slice(0, 50)} height={200}
                  theme={gTheme as ThemePreset} rowHeight={34} headerHeight={36} getRowId={r => r.id}
                  features={{ toolbar: false, footer: false }} />
              </div>
              <p style={{ fontSize: 11, color: dim, margin: '6px 0 0' }}>50 rows exported.</p>
            </div>
          </Section>

          {/* ════════════ CELL RENDERERS ════════════ */}
          <Section id="cell-render" title="Cell Renderers" subtitle="Replace the default cell content with any React element. The renderer receives the raw cell value and the full row object.">
            <Code>{`const columns = [
  {
    id: 'status',
    renderCell: (value, row) => {
      const colors = { active: '#22c55e', low: '#f59e0b', out: '#ef4444' };
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
          background: colors[value] + '22', color: colors[value],
          borderRadius: 4, padding: '2px 8px', fontWeight: 600 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: colors[value] }} />
          {value}
        </span>
      );
    },
  },
  {
    id: 'stock',
    accessor: row => row.stock,     // can also use accessor
    renderCell: (value) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 44, height: 4, background: '#e5e7eb', borderRadius: 2 }}>
          <div style={{ width: value / 2 + '%', height: '100%', background: '#2563eb' }} />
        </div>
        <span>{value}</span>
      </div>
    ),
  },
];`}</Code>
            <LiveGrid height={240} theme={gTheme as ThemePreset} columns={customCellColumns} features={{ toolbar: false, footer: false }} label="Status badge · Channel badge · Stock progress bar" />
          </Section>

          {/* ════════════ HEADER RENDERERS ════════════ */}
          <Section id="header-render" title="Header Renderers" subtitle="Replace the default header label with any React element. The renderer receives the resolved column and the full grid engine.">
            <Code>{`const columns = [
  {
    id: 'product',
    sortable: true,
    // col    = ResolvedColumn (id, label, width, sortable, …)
    // engine = GridEngine     (sortState, toggleSort, pinColumn, …)
    renderHeader: (col, engine) => {
      const sorted = engine?.sortState.columnId === col.id;
      return (
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {col.label}
          {sorted && (
            <span style={{ fontSize: 9, background: '#dbeafe', color: '#1d4ed8',
                           borderRadius: 3, padding: '1px 5px', fontWeight: 700 }}>
              {engine.sortState.direction === 'asc' ? '↑ ASC' : '↓ DESC'}
            </span>
          )}
        </span>
      );
    },
  },

  // Filter input embedded in the header
  {
    id: 'status',
    renderHeader: (col) => (
      <div onClick={e => e.stopPropagation()}>
        <input placeholder="Filter…" style={{ width: '100%', border: 'none', background: 'transparent' }}
          onChange={e => myFilter.setFilter(col.id, e.target.value)} />
      </div>
    ),
  },
];`}</Code>
            <LiveGrid height={220} theme={gTheme as ThemePreset} columns={renderHeaderColumns} features={{ toolbar: false, footer: false }} label="Click 'Product' or 'Stock' to see sort badge appear" />
          </Section>

          {/* ════════════ THEMING ════════════ */}
          <Section id="theming" title="Theming & Tokens" subtitle="Every visual detail is a CSS custom property. Choose a built-in preset or override any token. All tokens are prefixed --vg-.">
            <SubSection title="Built-in presets">
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {(['light', 'dark', 'ocean', 'forest', 'sunset'] as ThemePreset[]).map(t => (
                  <button key={t} onClick={() => setActiveTheme(t)} style={{ padding: '5px 14px', borderRadius: 6, fontWeight: 600, fontSize: 12, border: `1.5px solid ${activeTheme === t ? '#2563eb' : bdr}`, background: activeTheme === t ? (isDark ? '#1e3558' : '#dbeafe') : surf, color: activeTheme === t ? '#2563eb' : dim, cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'inherit' }}>{t}</button>
                ))}
              </div>
              <LiveGrid height={200} theme={activeTheme} features={{ footer: false }} label={`Theme: ${activeTheme}`} />
            </SubSection>
            <SubSection title="Token overrides">
              <Code>{`// Option 1 — named preset
<LatticeGrid theme="dark" />

// Option 2 — partial token override (merges on top of 'light')
<LatticeGrid
  theme={{
    '--vg-accent':          '#7c3aed',
    '--vg-accent-bg':       '#ede9fe',
    '--vg-bg-row-selected': '#ede9fe',
    '--vg-radius':          '2px',
    '--vg-font-size':       '13px',
  }}
/>

// Option 3 — start from a preset and override
import { GRID_THEMES } from '@lattice-grid-lib/core';
<LatticeGrid theme={{ ...GRID_THEMES.dark, '--vg-accent': '#a855f7' }} />`}</Code>
            </SubSection>
          </Section>

          {/* ════════════ FEATURE FLAGS ════════════ */}
          <Section id="features" title="Feature Flags" subtitle="Turn individual capabilities on or off. All flags default to true. Per-column sortable/resizable/draggable/hideable override these grid-level flags.">
            <Code>{`<LatticeGrid
  features={{
    sort:          true,  // header click to sort (asc → desc → clear)
    resize:        true,  // drag resize handle on column headers
    reorder:       true,  // drag-and-drop column reorder
    columnHide:    true,  // × button on header hover
    columnPin:     true,  // pin option in column manager
    alternateRows: true,  // zebra-stripe alternating rows
    toolbar:       true,  // show built-in toolbar
    footer:        true,  // show built-in footer
    rowSelection:  true,  // click row to highlight it
  }}
/>`}</Code>
            <PropsTable>
              <PropRow prop="sort"          type="boolean" def="true" desc="Column sort on header click. Cycles asc → desc → none." />
              <PropRow prop="resize"        type="boolean" def="true" desc="Drag handle on right edge of header cell." />
              <PropRow prop="reorder"       type="boolean" def="true" desc="Drag column header to reorder." />
              <PropRow prop="columnHide"    type="boolean" def="true" desc="Hover header to reveal × hide button." />
              <PropRow prop="columnPin"     type="boolean" def="true" desc="Pin option shown in column manager." />
              <PropRow prop="alternateRows" type="boolean" def="true" desc="Zebra-stripe alternating row backgrounds." />
              <PropRow prop="toolbar"       type="boolean" def="true" desc="Show built-in toolbar." />
              <PropRow prop="footer"        type="boolean" def="true" desc="Show built-in footer." />
              <PropRow prop="rowSelection"  type="boolean" def="true" desc="Click a row to highlight it." />
            </PropsTable>
          </Section>

          {/* ════════════ ICONS ════════════ */}
          <Section id="icons" title="Icons" subtitle="Replace any built-in SVG icon with your own ReactNode. Works with any icon library, inline SVG, or emoji.">
            <Code>{`import { ChevronUp, ChevronDown, EyeOff, Columns } from 'lucide-react';

<LatticeGrid
  icons={{
    sortAsc:      <ChevronUp size={10} />,
    sortDesc:     <ChevronDown size={10} />,
    sortNone:     <span style={{ opacity: 0.3 }}>⇅</span>,
    hideColumn:   <EyeOff size={10} />,
    columnsPanel: <Columns size={13} />,
  }}
/>`}</Code>
            <PropsTable>
              <PropRow prop="sortAsc"      type="ReactNode" def="SVG ▲" desc="Icon on active ascending sort column." />
              <PropRow prop="sortDesc"     type="ReactNode" def="SVG ▼" desc="Icon on active descending sort column." />
              <PropRow prop="sortNone"     type="ReactNode" def="⇅"     desc="Icon on sortable but unsorted columns." />
              <PropRow prop="hideColumn"   type="ReactNode" def="SVG ×" desc="Icon for the hide-column button in header." />
              <PropRow prop="columnsPanel" type="ReactNode" def="SVG"   desc="Icon for the Columns toolbar button." />
            </PropsTable>
          </Section>

          {/* ════════════ CSS CLASSES ════════════ */}
          <Section id="classnames" title="CSS Class Names" subtitle="Inject your own CSS classes on any grid region. Target them from your own stylesheet.">
            <Code lang="css">{`/* your-grid.css */
.my-grid         { box-shadow: 0 4px 24px rgba(0,0,0,.08); }
.my-header       { text-transform: uppercase; letter-spacing: .06em; }
.my-row          { transition: background .08s; }
.my-row-selected { background: #fef9c3 !important; font-weight: 600; }
.my-cell         { font-variant-numeric: tabular-nums; }`}</Code>
            <Code>{`<LatticeGrid
  classNames={{
    root:            'my-grid',
    toolbar:         'my-toolbar',
    headerRow:       'my-header-row',
    groupRow:        'my-group-row',
    headerCell:      'my-header',
    row:             'my-row',
    rowSelected:     'my-row-selected',
    cell:            'my-cell',
    pinnedCell:      'my-pinned-cell',
    footer:          'my-footer',
    columnPanel:     'my-col-panel',
  }}
/>`}</Code>
          </Section>

          {/* ════════════ STYLE OVERRIDES ════════════ */}
          <Section id="styles" title="Style Overrides" subtitle="Apply CSSProperties directly to any grid region. Applied on top of token styles.">
            <Code>{`<LatticeGrid
  styles={{
    root:            { borderRadius: 0, border: 'none' },
    toolbar:         { padding: '10px 16px' },
    headerRow:       { fontFamily: 'monospace', letterSpacing: '.04em' },
    groupRow:        { background: '#1e3a8a', color: '#fff' },
    headerCell:      { textTransform: 'uppercase', fontSize: 11 },
    row:             { borderBottom: '1px solid #f0f0f0' },
    rowSelected:     { background: '#fef9c3', fontWeight: 600 },
    cell:            { borderRight: 'none' },
    pinnedCell:      { background: '#f8fafc' },
    footer:          { justifyContent: 'flex-start' },
  }}
/>`}</Code>
          </Section>

          {/* ════════════ SLOTS ════════════ */}
          <Section id="slots" title="Slots" subtitle="Replace entire UI sections with your own components. Every slot receives the grid engine for full interactivity.">
            <Code>{`<LatticeGrid
  slots={{
    toolbar: (engine) => (
      <div className="my-toolbar">
        <span>{engine.visibleColumns.length}/{engine.orderedColumns.length} cols</span>
        <button onClick={engine.resetColumns}>Reset</button>
        <button onClick={engine.showAllColumns}>Show all</button>
      </div>
    ),

    // Or replace just left / right sections
    toolbarLeft:  <span>Inventory · April 2026</span>,
    toolbarRight: <button onClick={exportCSV}>Export CSV</button>,

    // Column manager — render anywhere (sidebar, drawer, modal)
    columnManager: ({ engine, onClose }) => (
      <MySidebar engine={engine} onClose={onClose} />
    ),

    // Footer
    footer: ({ startRow, endRow, totalRows }) => (
      <MyFooter start={startRow} end={endRow} total={totalRows} />
    ),

    emptyState:     <div style={{ textAlign: 'center', padding: 48 }}>No results.</div>,
    loadingOverlay: <MySpinner />,
  }}
  loading={isFetching}
/>`}</Code>
            <PropsTable>
              <PropRow prop="toolbar"        type="(engine) => ReactNode"         def="—" desc="Completely replaces the toolbar." />
              <PropRow prop="toolbarLeft"    type="ReactNode"                     def="—" desc="Replaces left section of built-in toolbar." />
              <PropRow prop="toolbarRight"   type="ReactNode"                     def="—" desc="Replaces right section of built-in toolbar." />
              <PropRow prop="columnManager"  type="({engine,onClose})=>ReactNode" def="—" desc="Replaces column manager panel. Return null to suppress popup." />
              <PropRow prop="footer"         type="(props) => ReactNode"          def="—" desc="Replaces footer. Receives startRow, endRow, totalRows, visibleCols, totalCols." />
              <PropRow prop="emptyState"     type="ReactNode"                     def="—" desc="Shown when data array is empty." />
              <PropRow prop="loadingOverlay" type="ReactNode"                     def="—" desc="Shown when loading prop is true." />
            </PropsTable>
          </Section>

          {/* ════════════ PERSISTENCE ════════════ */}
          <Section id="persistence" title="Persistence" badge={{ text: 'onColumnStateChange', color: '#16a34a' }}
            subtitle="Save column layout whenever the user changes it. Restore on next visit by reading saved state on mount.">
            <Code>{`import { type ColumnState } from '@lattice-grid-lib/core';
// { id: string; hidden: boolean; pinned: PinSide|null; width: number; order: number }

function MyGrid() {
  return (
    <LatticeGrid
      columns={columns}
      data={data}
      // Called after every hide, pin, resize, or reorder
      onColumnStateChange={(state: ColumnState[]) => {
        localStorage.setItem('grid-prefs', JSON.stringify(state));
        // Or: await api.post('/user/grid-prefs', { columns: state });
      }}
    />
  );
}`}</Code>
            <Callout type="tip"><code>onColumnStateChange</code> fires after every hide, pin, resize, or reorder. Debounce the API call (~800ms) to avoid hammering your server during drag-resize.</Callout>
            <LiveGrid height={220} theme={gTheme as ThemePreset} onColumnStateChange={handlePersist} features={{ footer: false }} label="Hide/pin/resize columns — state captured below" />
            {persistLog && (
              <div style={{ padding: '7px 12px', borderRadius: 6, fontSize: 11.5, marginTop: -6, background: isDark ? '#052e16' : '#f0fdf4', color: isDark ? '#4ade80' : '#16a34a', fontFamily: 'monospace' }}>
                ✓ Saved — {persistLog}
              </div>
            )}
          </Section>

          {/* ════════════ HEADLESS API ════════════ */}
          <Section id="headless" title="Headless API" subtitle="Use the engine directly to build a completely custom grid UI. Zero default rendering — you own every pixel.">
            <Code>{`import { useGridEngine, useVirtualRows, buildColumnOffsets, calcColWindow } from '@lattice-grid-lib/core';

function MyCustomGrid({ columns, data }) {
  const engine = useGridEngine(columns);
  const { pinnedLeftColumns, scrollableColumns, pinnedLeftWidth, sortState } = engine;

  const [scrollTop, setScrollTop]   = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const offsets = buildColumnOffsets(scrollableColumns);
  const widths  = scrollableColumns.map(c => c.width);

  // Row virtualisation
  const vRows = useVirtualRows({ rowCount: data.length, rowHeight: 36, scrollTop, viewportHeight: 400 });

  // Column virtualisation
  const vCols = calcColWindow(offsets, widths, scrollLeft - pinnedLeftWidth, 800);

  return (
    <div onScroll={e => { setScrollTop(e.currentTarget.scrollTop); setScrollLeft(e.currentTarget.scrollLeft); }}
      style={{ height: 400, overflow: 'auto', position: 'relative' }}>
      {/* Render rows vRows.startIndex to vRows.endIndex */}
      {/* Render columns vCols.startIndex to vCols.endIndex */}
    </div>
  );
}`}</Code>
            <Callout type="info">The headless API lets you build canvas-rendered grids, infinite-scroll tables, or fully custom accessible grids while reusing the engine's column state and virtualisation math.</Callout>
          </Section>

          {/* ════════════ VIRTUALISATION ════════════ */}
          <Section id="virtualisation" title="How Virtualisation Works" subtitle="Understanding the rendering architecture helps when building custom grids or debugging scroll performance.">
            <Code lang="text">{`grid-root  (overflow: hidden, flex column)
  toolbar
  body-wrap  (position: relative, overflow: hidden)
    │
    ├── scroll-area  (position: absolute, overflow: auto)
    │     Full virtual canvas (width × height).
    │     Header is position:sticky top:0 → scrolls horizontally,
    │     stays vertically pinned. Only SCROLLABLE columns here.
    │
    ├── pin-left-layer  (position: absolute, left: 0)
    │     Header: position:absolute top:0 — always visible.
    │     Body:   transform:translateY(-scrollTop) synced via direct
    │             DOM ref — same frame as scroll event, zero React lag.
    │
    └── pin-right-layer  (position: absolute, right: 0)
          Same structure as pin-left-layer.
  footer`}</Code>
            <p style={{ fontSize: 13, lineHeight: 1.85, color: dim, margin: '12px 0' }}>
              <strong style={{ color: txt }}>Row virtualisation</strong> — only rows in the visible vertical window (+ 8 rows overscan) are rendered. Each row is <code>position:absolute</code> at <code>top = index × rowHeight</code>.
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.85, color: dim, marginBottom: 12 }}>
              <strong style={{ color: txt }}>Column virtualisation</strong> — only scrollable columns in the visible horizontal window (+ 500px overscan) are rendered. The window is computed synchronously from a DOM ref, not React state, so there is no 1-frame flash during fast horizontal scroll.
            </p>
            <Callout type="info">With 5,000 rows × 300 columns, only ~15 rows and ~12 columns are in the DOM at any time.</Callout>
          </Section>

          {/* ════════════ PROPS REFERENCE ════════════ */}
          <Section id="ref-props" title="Props Reference" subtitle="Every prop the LatticeGrid component accepts.">
            <PropsTable>
              <PropRow prop="columns"             type="ColumnDef<TData>[]"       def="required"  desc="Column definitions array. Supports flat and grouped arrays." />
              <PropRow prop="data"                type="TData[]"                  def="required"  desc="Row data array." />
              <PropRow prop="getRowId"            type="(row,i)=>string|number"   def="row index" desc="Stable row key getter. Highly recommended." />
              <PropRow prop="height"              type="number"                   def="—"         desc="Fixed grid height in px. If omitted, sizes to content up to maxHeight." />
              <PropRow prop="maxHeight"           type="number"                   def="600"       desc="Maximum height when no fixed height is set." />
              <PropRow prop="rowHeight"           type="number"                   def="36"        desc="Fixed row height in px." />
              <PropRow prop="headerHeight"        type="number"                   def="38"        desc="Leaf header row height in px." />
              <PropRow prop="groupHeaderHeight"   type="number"                   def="28"        desc="Group header row height in px." />
              <PropRow prop="theme"               type="ThemePreset | GridTokens" def="'light'"   desc="Preset name or partial/full CSS variable map." />
              <PropRow prop="features"            type="GridFeatures"             def="all true"  desc="Feature flags object." />
              <PropRow prop="icons"               type="GridIcons"                def="—"         desc="Custom icon overrides." />
              <PropRow prop="classNames"          type="GridClassNames"           def="—"         desc="CSS class names per grid region." />
              <PropRow prop="styles"              type="GridStyles"               def="—"         desc="Inline CSSProperties per grid region." />
              <PropRow prop="slots"               type="GridSlots<TData>"         def="—"         desc="Render-prop replacements for UI sections." />
              <PropRow prop="freezeColId"         type="string"                   def="—"         desc="Column id to auto-freeze when scrolled behind pinned-left band." />
              <PropRow prop="loading"             type="boolean"                  def="false"     desc="Show loading overlay." />
              <PropRow prop="sortMode"            type="'client'|'server'"        def="'client'"  desc="'server' disables internal sort. Data rendered as-is." />
              <PropRow prop="groupBy"             type="string[]"                 def="column config" desc="Ordered column ids for hierarchical row grouping. Pass [] to explicitly disable rowGroup column config." />
              <PropRow prop="onRowClick"          type="(row,index)=>void"        def="—"         desc="Called when a row is clicked." />
              <PropRow prop="onSortChange"        type="(sort)=>void"             def="—"         desc="Called when sort state changes." />
              <PropRow prop="onGroupingChange"    type="(groupBy)=>void"          def="—"         desc="Called when row grouping columns change." />
              <PropRow prop="onColumnResize"      type="(id,width)=>void"         def="—"         desc="Called when a column finishes resizing." />
              <PropRow prop="onColumnReorder"     type="(order)=>void"            def="—"         desc="Called when columns are drag-reordered." />
              <PropRow prop="onColumnStateChange" type="(state)=>void"            def="—"         desc="Called on any column layout change. Use for persistence." />
              <PropRow prop="ariaLabel"           type="string"                   def="'Data grid'" desc="aria-label for the grid root element." />
              <PropRow prop="className"           type="string"                   def="—"         desc="CSS class on the grid root element." />
              <PropRow prop="style"               type="CSSProperties"            def="—"         desc="Inline style on the grid root element." />
            </PropsTable>
          </Section>

          {/* ════════════ TOKEN REFERENCE ════════════ */}
          <Section id="ref-tokens" title="Token Reference" subtitle="Every CSS variable the grid uses internally. Override any via the theme prop.">
            <PropsTable>
              <PropRow prop="--vg-font"            type="font-family" def="'DM Sans', sans-serif"       desc="Primary typeface." />
              <PropRow prop="--vg-font-mono"       type="font-family" def="'JetBrains Mono', monospace" desc="Monospace typeface." />
              <PropRow prop="--vg-font-size"       type="length"      def="12.5px"                      desc="Base font size." />
              <PropRow prop="--vg-radius"          type="length"      def="7px"                         desc="Grid root border-radius." />
              <PropRow prop="--vg-bg"              type="color"       def="#ffffff"                      desc="Main grid background." />
              <PropRow prop="--vg-bg-header"       type="color"       def="#f7f8fa"                      desc="Header row background." />
              <PropRow prop="--vg-bg-group"        type="color"       def="#f0f2f6"                      desc="Group header background." />
              <PropRow prop="--vg-bg-row-alt"      type="color"       def="#fafbfc"                      desc="Alternating row background." />
              <PropRow prop="--vg-bg-row-hover"    type="color"       def="#f0f5ff"                      desc="Row hover background." />
              <PropRow prop="--vg-bg-row-selected" type="color"       def="#dbeafe"                      desc="Selected row background." />
              <PropRow prop="--vg-bg-pinned"       type="color"       def="#ffffff"                      desc="Pinned column cell background." />
              <PropRow prop="--vg-bg-frozen"       type="color"       def="#eff6ff"                      desc="Auto-frozen column background." />
              <PropRow prop="--vg-bg-toolbar"      type="color"       def="#ffffff"                      desc="Toolbar and footer background." />
              <PropRow prop="--vg-text"            type="color"       def="#111827"                      desc="Body text colour." />
              <PropRow prop="--vg-text-dim"        type="color"       def="#6b7280"                      desc="Muted / secondary text." />
              <PropRow prop="--vg-text-header"     type="color"       def="#374151"                      desc="Header cell text." />
              <PropRow prop="--vg-border"          type="color"       def="#e5e7eb"                      desc="Default border." />
              <PropRow prop="--vg-border-strong"   type="color"       def="#d1d5db"                      desc="Emphasis border." />
              <PropRow prop="--vg-accent"          type="color"       def="#2563eb"                      desc="Primary accent colour." />
              <PropRow prop="--vg-accent-bg"       type="color"       def="#dbeafe"                      desc="Accent background tint." />
              <PropRow prop="--vg-accent-text"     type="color"       def="#1d4ed8"                      desc="Text on accent-bg surfaces." />
              <PropRow prop="--vg-sort-active"     type="color"       def="#2563eb"                      desc="Active sort indicator colour." />
              <PropRow prop="--vg-resize-hover"    type="color"       def="#2563eb"                      desc="Resize handle hover colour." />
              <PropRow prop="--vg-shadow-panel"    type="shadow"      def="0 8px 24px rgba(0,0,0,.12)"   desc="Column manager panel shadow." />
              <PropRow prop="--vg-transition"      type="duration"    def="0.12s ease"                   desc="Default CSS transition." />
            </PropsTable>
          </Section>

          {/* ════════════ HOOKS ════════════ */}
          <Section id="ref-hooks" title="Hooks Reference" subtitle="All hooks are exported individually so you can compose only what you need.">
            <SubSection title="useGridEngine">
              <Code>{`const engine = useGridEngine(columns);

// State
engine.orderedColumns     engine.visibleColumns
engine.pinnedLeftColumns  engine.pinnedRightColumns
engine.scrollableColumns  engine.pinnedLeftWidth
engine.sortState          // { columnId: string|null, direction: 'asc'|'desc' }
engine.hasGroups

// Actions
engine.toggleSort(id)            engine.resizeColumn(id, deltaPx)
engine.setColumnWidth(id, px)    engine.pinColumn(id, side | null)
engine.toggleColumnVisibility(id) engine.showAllColumns()
engine.moveColumnBefore(src, tgt) engine.resetColumns()`}</Code>
            </SubSection>
            <SubSection title="useVirtualRows">
              <Code>{`const vRows = useVirtualRows({ rowCount, rowHeight, scrollTop, viewportHeight });
vRows.startIndex   vRows.endIndex   vRows.totalHeight`}</Code>
            </SubSection>
            <SubSection title="calcColWindow / buildColumnOffsets">
              <Code>{`const offsets = buildColumnOffsets(scrollableColumns);
const widths  = scrollableColumns.map(c => c.width);
const { startIndex, endIndex } = calcColWindow(
  offsets, widths,
  scrollLeft - pinnedLeftWidth,  // bandScroll
  viewportWidth,
);`}</Code>
            </SubSection>
            <SubSection title="useRowSelection">
              <Code>{`const sel = useRowSelection({ data, getRowId, mode: 'multi', onSelectionChange });
sel.selectedIds   sel.selectedRows  sel.allSelected  sel.someSelected
sel.isSelected(id)  sel.toggleRow(id)
sel.selectAll()   sel.clearSelection()
sel.handleRowClick(row, index, event)  // shift+click range selection`}</Code>
            </SubSection>
            <SubSection title="useColumnFilter">
              <Code>{`const filter = useColumnFilter({ data, columns, matchers? });
filter.filteredData  filter.filterValues  filter.activeFilterCount  filter.isFiltered
filter.setFilter(id, value)  filter.clearFilter(id)  filter.clearAllFilters()`}</Code>
            </SubSection>
            <SubSection title="useGridPagination">
              <Code>{`const page = useGridPagination({ data?, totalRows?, pageSize });
page.pageData  page.currentPage  page.pageCount  page.totalRows
page.canGoPrev  page.canGoNext
page.nextPage()  page.prevPage()  page.goToPage(n)  page.setPageSize(n)`}</Code>
            </SubSection>
            <SubSection title="useGridExport">
              <Code>{`const exp = useGridExport({ data, columns });
exp.exportCSV(filename)   exp.exportJSON(filename)
exp.getCSVString()        exp.getJSONString()`}</Code>
            </SubSection>
          </Section>

          {/* ════════════ TYPE REFERENCE ════════════ */}
          <Section id="ref-types" title="Type Reference" subtitle="All exported TypeScript types from @lattice-grid-lib/core.">
            <Code>{`import type {
  LatticeGridProps,         // main component props
  ColumnDef,                // LeafColumnDef | GroupColumnDef
  LeafColumnDef,
  GroupColumnDef,
  ResolvedColumn,           // engine output — passed to renderers
  GridEngine,               // engine state + all actions
  SortState,                // { columnId: string|null, direction: SortDirection }
  ColumnState,              // { id, hidden, pinned, width, order }
  PinSide,                  // 'left' | 'right'
  SortDirection,            // 'asc' | 'desc'
  ThemePreset,              // 'light'|'dark'|'ocean'|'forest'|'sunset'
  GridTokens,               // Partial<Record<\`--vg-\${string}\`, string>>
  GridFeatures,
  GridIcons,
  GridClassNames,
  GridStyles,
  GridSlots,
  ColumnManagerRenderProps, // { engine: GridEngine, onClose: () => void }
  VirtualRowWindow,         // { startIndex, endIndex, totalHeight }
  VirtualColWindow,         // { startIndex, endIndex }
} from '@lattice-grid-lib/core';`}</Code>
          </Section>

        </div>
      </div>

      {/* ── RIGHT TOC ─────────────────────────────────────────────────────── */}
      {/* <div style={{ width: 192, flexShrink: 0, borderLeft: `1px solid ${bdr}`, background: surf, overflowY: 'auto', padding: '24px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.09em', color: dim, padding: '0 16px 10px' }}>On this page</div>
        {NAV_GROUPS.flatMap(g => g.items).map(item => {
          const active = activeId === item.id;
          return (
            <a key={item.id} href={`#${item.id}`}
              onClick={e => { e.preventDefault(); scrollTo(item.id); }}
              style={{
                display: 'block', padding: '3px 16px', fontSize: 12,
                color: active ? 'var(--doc-nav-active-txt)' : dim,
                textDecoration: 'none', fontWeight: active ? 600 : 400,
                borderLeft: `2px solid ${active ? '#2563eb' : 'transparent'}`,
                transition: 'all 0.1s', lineHeight: 1.4,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = txt; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = dim; }}
            >
              {item.label}
            </a>
          );
        })}
      </div> */}

    </div>
  );
}
