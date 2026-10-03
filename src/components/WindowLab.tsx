import { useEffect, useRef, useState } from 'react';
import { Archive, ArrowLeft, FileText, Maximize2, Minimize2, PanelRight, RotateCcw, Settings2, Grid2X2, X, Info } from 'lucide-react';
import { Button } from './ui/button';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LabContent } from './WindowLabContent';
import { LAB_MIN_WIDTH, LAB_MIN_HEIGHT, LAB_VISIBLE_HEADER } from '../lib/windowLab';
import { navigateWithinOS } from '../lib/appNavigation';
import { clamp, compactVariant, contentDockEdge, iconDragCentre, dockSlots, dragScalePosition, grabbedPosition, releaseDockEdge, retainedDockEdge, resizeRect, windowScale, parseLabSettings, LAB_SETTINGS_KEY, type Corner, type Edge, type Rect } from '../lib/windowLab';

type LabWindow = { id: string; title: string; x: number; y: number; edge: Edge; maximized: boolean; compact?: boolean; scaleX?: number; manualSize?: { width: number; height: number } };
const initial: LabWindow[] = [
  { id: 'archive', title: 'File Explorer', x: 0.5, y: 0.45, edge: null, maximized: false },
  { id: 'notes', title: 'Notes', x: 0.05, y: 0.3, edge: 'left', maximized: false },
  { id: 'timeline', title: 'Timeline', x: 0.95, y: 0.35, edge: 'right', maximized: false },
];
const icons = { archive: Archive, notes: FileText, timeline: PanelRight };

export function WindowLab() {
  const [windows, setWindows] = useState(initial);
  const [active, setActive] = useState('archive');
  const [size, setSize] = useState({ width: 1000, height: 600 });
  const [settings, setSettings] = useState(() => {
    try { return parseLabSettings(localStorage.getItem(LAB_SETTINGS_KEY)); } catch { return parseLabSettings(null); }
  });
  const { releaseDistance, leftWidth, rightWidth, showZones } = settings;
  const [panel, setPanel] = useState<'settings' | 'start' | 'about' | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(LAB_SETTINGS_KEY, JSON.stringify(settings)); setStorageFailed(false); }
    catch { setStorageFailed(true); }
  }, [settings]);
  const scaleAt = (x: number) => windowScale(x, size.width, leftWidth, rightWidth);
  const openApp = (id: string) => {
    setWindows(items => {
      const existing = items.find(item => item.id === id);
      if (existing) return items.map(item => item.id === id ? { ...item, edge: null, maximized: false, compact: false, x: 0.5, scaleX: 0.5, y: 0.45 } : item);
      const template = initial.find(item => item.id === id)!;
      return [...items, { ...template, edge: null, x: 0.5, y: 0.45 }];
    });
    setActive(id); setPanel(null);
  };
  const stage = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: string; startX: number; startY: number; startScale: number; grabX: number; grabY: number; edge: Edge; pointerX: number; pointerY: number; dockCandidate?: Edge } | null>(null);
  const [interaction, setInteraction] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ id: string; edge: Edge } | null>(null);
  const reducedMotion = useReducedMotion();
  const moved = useRef(false);
  const resize = useRef<{ id: string; corner: Corner; startX: number; startY: number; rect: Rect } | null>(null);
  const [note, setNote] = useState('A thought worth keeping.');
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const update = (id: string, patch: Partial<LabWindow>) => setWindows(items => items.map(item => {
    if (item.id !== id) return item;
    const next = { ...item, ...patch };
    return { ...next, compact: compactVariant(scaleAt((next.scaleX ?? next.x) * size.width), !!item.compact) };
  }));
  const applyResize = (id: string, rect: Rect) => {
    const x = (rect.left + rect.width / 2) / size.width;
    const scale = scaleAt(x * size.width);
    update(id, { x, scaleX: x, y: (rect.top + rect.height / 2) / size.height, manualSize: { width: rect.width / scale, height: rect.height / scale } });
  };
  const slots = Object.fromEntries((['left', 'right'] as const).flatMap(edge => Object.entries(dockSlots(windows.filter(item => item.edge === edge).map(item => ({ id: item.id, y: item.y * size.height })), size.height))));
  return (
    <main className="flex h-dvh min-h-[400px] flex-col bg-background-chrome text-fg-primary">
      <div ref={stage} className="relative min-h-0 flex-1 overflow-hidden bg-background-primary">
        {showZones && <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0 border-x border-dashed border-stroke-brand bg-background-chrome-raised/30" style={{ left: `${(100-leftWidth)/2}%`, right: `${(100-rightWidth)/2}%` }}><span className="absolute inset-x-0 top-5 text-center os-type-caption text-fg-secondary">Desktop zone · Left {leftWidth}% / Right {rightWidth}%</span></div>
          {(['left','right'] as const).map(edge => <div key={edge} className="absolute inset-y-0 border-dotted border-stroke-secondary" style={{ [edge]: 0, width: releaseDistance, borderRightWidth: edge === 'left' ? 1 : 0, borderLeftWidth: edge === 'right' ? 1 : 0 }}><span className="absolute inset-x-0 top-16 text-center os-type-caption text-fg-secondary">Unstick {releaseDistance}px</span><div className="absolute inset-y-0 bg-background-chrome-raised/50" style={{ [edge]: 0, width: 18 }} /></div>)}
          {interaction && <div className="absolute inset-y-0 border-l border-stroke-brand" style={{ left: (windows.find(item=>item.id===interaction)?.scaleX ?? 0.5)*size.width }} />}
        </div>}
        {windows.map(item => {
          const Icon = icons[item.id as keyof typeof icons];
          const scale = scaleAt((item.scaleX ?? item.x) * size.width);
          const compact = !item.maximized && compactVariant(scale, !!item.compact);
          const baseWidth = item.manualSize?.width ?? Math.min(820, Math.max(220, size.width * 0.64));
          const baseHeight = item.manualSize?.height ?? Math.min(520, Math.max(160, size.height * 0.68));
          const width = item.maximized ? size.width : item.edge ? 48 : clamp(baseWidth * scale, Math.min(LAB_MIN_WIDTH, size.width - 16), size.width - 16);
          const height = item.maximized ? size.height : item.edge ? 48 : clamp(baseHeight * scale, Math.min(LAB_MIN_HEIGHT, size.height - 16), size.height - 16);
          const left = item.maximized ? 0 : item.edge === 'left' ? 8 : item.edge === 'right' ? size.width - 56 : clamp(item.x * size.width - width / 2, -8, size.width - Math.min(LAB_VISIBLE_HEADER,size.width-16));
          const top = item.maximized ? 0 : item.edge ? slots[item.id] - 24 : clamp(item.y * size.height - height / 2, 0, size.height - 40);
          const leftIconOverlap = !item.edge && !item.maximized && left < 64 && windows.some(other => other.edge === 'left' && slots[other.id]+24 > top && slots[other.id]-24 < top+height);
          return (
            <section key={item.id} tabIndex={item.edge ? -1 : 0} onKeyDown={event => {
              if (event.target !== event.currentTarget || item.maximized) return;
              if (event.key === 'Enter') { const edge = releaseDockEdge((item.scaleX ?? item.x) * size.width, size.width); if (edge) { event.preventDefault(); update(item.id, { edge }); setPreview(null); } return; }
              if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
              event.preventDefault();
              const x = clamp(item.x * size.width + (event.key === 'ArrowLeft' ? -40 : event.key === 'ArrowRight' ? 40 : 0), 0, size.width);
              const y = clamp(item.y * size.height + (event.key === 'ArrowUp' ? -40 : event.key === 'ArrowDown' ? 40 : 0), 36, size.height - 36);
              update(item.id, { x: x / size.width, scaleX: x / size.width, y: y / size.height });
              setPreview({ id: item.id, edge: releaseDockEdge(x, size.width) });
            }} aria-label={`${item.title} ${item.edge ? 'edge icon' : compact ? 'widget' : 'window'}`} className={`os-focus-ring absolute overflow-hidden rounded-lg border bg-background-chrome shadow-os-window ${preview?.id === item.id && preview.edge ? 'border-stroke-brand' : 'border-stroke-secondary'}`} style={{ left, top, width, height, zIndex: item.maximized ? 50 : item.edge ? 40 : active === item.id ? 20 : 10, transition: reducedMotion || interaction === item.id ? 'none' : 'left 320ms ease, top 320ms ease, width 320ms ease, height 320ms ease' }}>
              <div className="flex h-full touch-none select-none flex-col" onPointerDown={event => {
                if ((event.target as HTMLElement).closest('button,a,input,textarea,select') || item.maximized) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                moved.current = false;
                setActive(item.id);
                setInteraction(item.id);
                drag.current = { id: item.id, startX: event.clientX, startY: event.clientY, startScale: item.scaleX ?? item.x, grabX: clamp((event.clientX - (stage.current?.getBoundingClientRect().left ?? 0) - left) / width, 0, 1), grabY: clamp((event.clientY - (stage.current?.getBoundingClientRect().top ?? 0) - top) / height, 0, 1), edge: item.edge, pointerX: event.clientX - (stage.current?.getBoundingClientRect().left ?? 0), pointerY: event.clientY - (stage.current?.getBoundingClientRect().top ?? 0) };
              }} onPointerMove={event => {
                const current = drag.current;
                if (current?.id !== item.id) return;
                if (Math.abs(event.clientX - current.startX) + Math.abs(event.clientY - current.startY) > 4) moved.current = true;
                const rect = stage.current?.getBoundingClientRect();
                const pointerX = clamp(event.clientX - (rect?.left ?? 0), 0, size.width);
                const pointerY = clamp(event.clientY - (rect?.top ?? 0), 36, size.height - 36);
                current.pointerX = pointerX;
                current.pointerY = pointerY;
                const dockCentre = current.edge ? iconDragCentre(current.edge,event.clientX-current.startX,size.width) : pointerX;
                const edge = retainedDockEdge(dockCentre, size.width, current.edge, releaseDistance);
                if (!edge) current.edge = null;
                const scaleX = dragScalePosition(current.startScale, event.clientX - current.startX, size.width);
                const nextScale = scaleAt(scaleX * size.width);
                const nextWidth = edge ? 48 : clamp(baseWidth * nextScale, Math.min(LAB_MIN_WIDTH, size.width - 16), size.width - 16);
                const nextHeight = edge ? 48 : clamp(baseHeight * nextScale, Math.min(LAB_MIN_HEIGHT, size.height - 16), size.height - 16);
                const centre = grabbedPosition(pointerX, current.grabX, nextWidth);
                current.dockCandidate = edge ? null : contentDockEdge(pointerX,size.width);
                update(item.id, { x: centre / size.width, scaleX, y: grabbedPosition(pointerY, current.grabY, nextHeight) / size.height, edge });
                setPreview({ id: item.id, edge: current.dockCandidate });
              }} onPointerUp={() => {
                const current = drag.current;
                if (current?.id === item.id) {
                  if (item.edge && !moved.current) update(item.id, { edge: null, x: 0.5, scaleX: 0.5, y: 0.5 });
                  else if (moved.current && !current.edge) {
                    const edge = current.dockCandidate ?? releaseDockEdge(current.pointerX, size.width);
                    update(item.id, edge ? { edge, y: current.pointerY / size.height } : { edge: null });
                  }
                }
                drag.current = null; setInteraction(null); setPreview(null);
              }} onPointerCancel={() => { drag.current = null; setInteraction(null); setPreview(null); }} onLostPointerCapture={() => { drag.current = null; setInteraction(null); setPreview(null); }}>
                {item.edge ? (
                  <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reducedMotion ? 0 : 0.25 }} className="os-focus-ring flex h-full w-full touch-none items-center justify-center text-fg-secondary" title={`Open ${item.title}`} aria-label={`Open ${item.title}`} onPointerDown={event => {
                    event.stopPropagation();
                    event.currentTarget.parentElement?.setPointerCapture(event.pointerId);
                    moved.current = false;
                    setActive(item.id);
                    setInteraction(item.id);
                    drag.current = { id: item.id, startX: event.clientX, startY: event.clientY, startScale: item.edge === 'left' ? 0 : 1, grabX: 0.5, grabY: 0.5, edge: item.edge, pointerX: item.edge === 'left' ? 32 : size.width - 32, pointerY: slots[item.id] };
                  }} onClick={event => { if (event.detail === 0) update(item.id, { edge: null, x: 0.5, scaleX: 0.5, y: 0.5 }); }} onKeyDown={event => {
                    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') { event.preventDefault(); update(item.id, { y: clamp(item.y + (event.key === 'ArrowUp' ? -60 : 60) / size.height, 0.05, 0.95) }); }
                  }}><Icon className="h-5 w-5" /></motion.button>
                ) : (
                  <>
                    <header className="relative flex shrink-0 items-center gap-2 border-b border-os-line-dark px-3 py-2" style={{paddingLeft:leftIconOverlap?64-left:12+Math.max(0,-left)}}>
                      <div className="flex min-w-[180px] shrink-0 items-center gap-2"><Icon className="h-4 w-4 shrink-0 text-fg-secondary" /><h2 className="os-type-body-strong whitespace-nowrap">{item.title}</h2></div>
                      <div className="ml-auto flex shrink-0 items-center gap-1 bg-background-chrome">
                      <button title={item.maximized ? 'Restore' : 'Maximize'} aria-label={`${item.maximized ? 'Restore' : 'Maximize'} ${item.title}`} className="os-focus-ring rounded p-1" onClick={() => { setActive(item.id); update(item.id, { maximized: !item.maximized }); }}>{item.maximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</button>
                      <button title={`Close ${item.title}`} aria-label={`Close ${item.title}`} className="os-focus-ring rounded p-1" onClick={() => setWindows(items => items.filter(window => window.id !== item.id))}><X className="h-4 w-4" /></button>
                      </div>
                    </header>
                    <div className="flex min-h-0 flex-1 flex-col" style={{paddingLeft:leftIconOverlap?Math.max(0,56-left):Math.max(0,-left)}}>
                    <LabContent id={item.id} compact={compact} note={note} onNoteChange={setNote} />
                    </div>
                  </>
                )}
              </div>
              {!item.edge && !item.maximized && (['nw', 'ne', 'sw', 'se'] as Corner[]).map(corner => (
                <button key={corner} aria-label={`Resize ${item.title} ${corner}`} title={`Resize ${corner}`} className={`os-focus-ring absolute z-30 h-4 w-4 touch-none ${corner.includes('n') ? 'top-0' : 'bottom-0'} ${corner.includes('w') ? 'left-0' : 'right-0'} ${corner === 'nw' || corner === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize'}`} onPointerDown={event => {
                  event.stopPropagation();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setActive(item.id);
                  setInteraction(item.id);
                  resize.current = { id: item.id, corner, startX: event.clientX, startY: event.clientY, rect: { left, top, width, height } };
                }} onPointerMove={event => {
                  const current = resize.current;
                  if (current?.id !== item.id) return;
                  applyResize(item.id, resizeRect(current.rect, corner, event.clientX - current.startX, event.clientY - current.startY, size));
                }} onPointerUp={() => { resize.current = null; setInteraction(null); }} onPointerCancel={() => { resize.current = null; setInteraction(null); }} onKeyDown={event => {
                  if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
                  event.preventDefault();
                  event.stopPropagation();
                  applyResize(item.id, resizeRect({ left, top, width, height }, corner, event.key === 'ArrowLeft' ? -20 : event.key === 'ArrowRight' ? 20 : 0, event.key === 'ArrowUp' ? -20 : event.key === 'ArrowDown' ? 20 : 0, size));
                }} />
              ))}
            </section>
          );
        })}
        <div className="absolute bottom-4 left-1/2 z-[60] flex max-w-[calc(100%-16px)] -translate-x-1/2 items-center gap-1 rounded-lg border border-stroke-secondary bg-background-chrome p-2 shadow-os-window">
          <a href="/" onClick={event=>{if(event.button===0&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey){event.preventDefault();navigateWithinOS('/');}}} title="Back to GenOS" aria-label="Back to GenOS" className="os-focus-ring rounded p-2"><ArrowLeft className="h-4 w-4" /></a>
          <Button variant="ghost" size="icon" title="Start" aria-label="Start" aria-expanded={panel==='start'} onClick={()=>setPanel(panel==='start'?null:'start')}><Grid2X2 className="h-4 w-4" /></Button>
          {initial.map(app=>{const Icon=icons[app.id as keyof typeof icons]; return <Button key={app.id} variant="ghost" size="icon" title={`Launch ${app.title}`} aria-label={`Launch ${app.title}`} onClick={()=>openApp(app.id)}><Icon className="h-4 w-4" /><span className={`absolute bottom-1 h-1 w-1 rounded-full ${windows.some(item=>item.id===app.id)?'bg-fg-primary':'bg-transparent'}`} /></Button>;})}
          <Button variant="ghost" size="icon" title="Lab settings" aria-label="Lab settings" aria-expanded={panel==='settings'} onClick={()=>setPanel(panel==='settings'?null:'settings')}><Settings2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" title="About this lab" aria-label="About this lab" aria-expanded={panel==='about'} onClick={()=>setPanel(panel==='about'?null:'about')}><Info className="h-4 w-4" /></Button>
        </div>
        <AnimatePresence mode="wait">
        {panel && <div key={panel} className={`absolute bottom-20 left-1/2 z-[60] max-w-[calc(100%-24px)] -translate-x-1/2 ${panel==='about'?'w-[560px]':'w-[340px]'}`}>
        <motion.aside initial={{opacity:0,y:reducedMotion?0:14,scale:reducedMotion?1:0.96}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:reducedMotion?0:8,scale:reducedMotion?1:0.98,transition:{duration:reducedMotion?0:0.14}}} transition={reducedMotion?{duration:0}:{type:'spring',stiffness:380,damping:32,mass:0.8}} style={{transformOrigin:'bottom center',maxHeight:'calc(100dvh - 100px)'}} aria-label={panel==='settings'?'Lab settings panel':panel==='about'?'About this lab':'Start applications'} onKeyDown={event=>{if(event.key==='Escape')setPanel(null);}} className={`overflow-auto rounded-lg border border-stroke-secondary bg-background-chrome shadow-os-window ${panel==='about'?'p-6 sm:p-8':'p-5'}`}>
          <div className={`flex items-start justify-between gap-4 ${panel==='about'?'mb-6':'mb-4'}`}><div className="min-w-0">{panel==='about'&&<p className="mb-2 os-type-caption text-fg-secondary">Window lab / An interaction experiment</p>}<h1 className={panel==='about'?'text-[30px] font-light leading-[1.2] text-fg-primary':'os-type-body-strong'}>{panel==='settings'?'Spatial desktop':panel==='about'?'A different way to keep things close':'Applications'}</h1></div><button aria-label="Close menu" title="Close menu" className="os-focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded text-fg-secondary transition-colors hover:bg-background-chrome-raised hover:text-fg-primary" onClick={()=>setPanel(null)}><X className="h-4 w-4" /></button></div>
          {panel==='about'?<article className="space-y-5 text-[15px] leading-7 text-fg-secondary"><p className="text-[17px] leading-7 text-fg-primary">What if moving a window aside felt like leaving a book open beside you, rather than putting it back on a shelf?</p><p>Bring a window into the middle to work with it. Move it aside and it becomes a smaller companion, keeping a little of its world in view. At the edge, it becomes a familiar marker, waiting where you placed it.</p><section className="border-y border-stroke-secondary py-5"><h2 className="mb-2 text-sm font-semibold text-fg-primary">Picture your workspace</h2><p>You're writing a note, with your files nearby and your timeline off to the side. Returning to them is less like searching a drawer and more like reaching across your desk. You remember the place, not just the icon.</p></section><section><h2 className="mb-2 text-sm font-semibold text-fg-primary">What we're exploring</h2><p>Can that sense of place make switching tasks feel more natural? Nothing here is settled yet. This desktop is a space to try a different relationship with windows and feel what works.</p></section><footer className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 os-type-caption text-fg-secondary"><span>Experimental prototype</span><span aria-hidden="true">/</span><span>Sample workspace</span></footer></article>:panel==='settings'?<div className="space-y-4">
            <label className="block os-type-caption">Unstick boundary <output className="float-right tabular-nums">{releaseDistance}px</output><input className="mt-3 w-full accent-current text-fg-primary" type="range" min={70} max={180} step={10} value={releaseDistance} aria-label="Unstick distance" onChange={event=>setSettings(value=>({...value,releaseDistance:Number(event.target.value)}))} /></label>
            {(['leftWidth','rightWidth'] as const).map(key=><label key={key} className="block os-type-caption">{key==='leftWidth'?'Left desktop zone':'Right desktop zone'}<output className="float-right tabular-nums">{settings[key]}%</output><input className="mt-3 w-full accent-current text-fg-primary" type="range" min={20} max={80} step={5} value={settings[key]} aria-label={key==='leftWidth'?'Left desktop zone':'Right desktop zone'} onChange={event=>setSettings(value=>({...value,[key]:Number(event.target.value)}))} /></label>)}
            <label className="flex items-center gap-2 os-type-caption"><input type="checkbox" checked={showZones} onChange={event=>setSettings(value=>({...value,showZones:event.target.checked}))} />Show threshold zones</label>
            <p role="status" className="os-type-caption text-fg-secondary">{storageFailed?'Local saving unavailable':'Saved on this device'}</p>
            <div className="flex items-center justify-between border-t border-stroke-secondary pt-3"><span className="os-type-caption text-fg-secondary">Window positions</span><button className="os-focus-ring rounded p-2 text-fg-secondary hover:bg-background-chrome-raised hover:text-fg-primary" title="Reset windows" aria-label="Reset windows" onClick={()=>{setWindows(initial);setActive('archive');}}><RotateCcw className="h-4 w-4" /></button></div>
          </div>:<div className="space-y-1">{initial.map(app=><button key={app.id} onClick={()=>openApp(app.id)} className="os-focus-ring flex w-full items-center justify-between rounded p-3 text-left os-type-body"><span>{app.title}</span><span className="os-type-caption text-fg-secondary">{windows.find(item=>item.id===app.id)?.edge?'Docked':windows.some(item=>item.id===app.id)?'Open':'Closed'}</span></button>)}{['Browser','Calculator','Music'].map(name=><div key={name} className="flex justify-between p-3 os-type-body text-fg-secondary"><span>{name}</span><span className="os-type-caption">Sample</span></div>)}</div>}
        </motion.aside></div>}
        </AnimatePresence>
      </div>
    </main>
  );
}

