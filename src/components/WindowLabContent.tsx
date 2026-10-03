import { useState } from 'react';
import workspaceArtwork from '../assets/png-color-symbol.png';
import { Clock3, FileText, Folder, HardDrive, Image, Search, Star, Check, Pencil, LayoutGrid, List } from 'lucide-react';

const files = [
  { name: 'Workspace concept', type: 'Design', size: '2.4 MB', icon: Image },
  { name: 'Interaction notes', type: 'Document', size: '18 KB', icon: FileText },
  { name: 'Desktop wallpaper', type: 'Image', size: '840 KB', icon: Image },
  { name: 'Release checklist', type: 'Document', size: '12 KB', icon: FileText },
];
const activity = [
  { title: 'Workspace concept updated', detail: 'File Explorer / Projects', time: '09:42', icon: Image },
  { title: 'Interaction notes revised', detail: 'Notes / Drafts', time: '09:30', icon: Pencil },
  { title: 'Release checklist completed', detail: 'File Explorer / Documents', time: '09:12', icon: Check },
  { title: 'Desktop wallpaper added', detail: 'File Explorer / Images', time: 'Yesterday', icon: Image },
];

export function LabContent({ id, compact, note, onNoteChange }: { id: string; compact: boolean; note: string; onNoteChange: (value: string) => void }) {
  const [location, setLocation] = useState('Recent');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [selected, setSelected] = useState<string | null>(null);
  if (id === 'notes') return <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
    {!compact && <div className="flex items-center gap-3 border-b border-stroke-secondary pb-3"><Pencil className="h-6 w-6 text-fg-secondary" /><div><h3 className="os-type-body-strong">Interaction journal</h3><p className="os-type-caption text-fg-secondary">Personal / Drafts</p></div></div>}
    <label htmlFor="lab-note" className="os-type-caption text-fg-secondary">{compact ? 'Quick note' : 'Today\'s draft'}</label>
    <textarea id="lab-note" value={note} onChange={event => onNoteChange(event.target.value)} className="os-focus-ring min-h-24 flex-1 resize-none rounded border border-stroke-secondary bg-background-chrome-raised p-3 os-type-body text-fg-primary" />
    <span className="os-type-caption text-fg-secondary">{note.trim().split(/\s+/).filter(Boolean).length} words</span>
  </div>;
  if (id === 'timeline') return <div className="min-h-0 flex-1 overflow-auto p-4">
    <div className="mb-4 flex items-center justify-between"><h3 className="os-type-body-strong">{compact ? 'Latest activity' : 'Workspace activity'}</h3><Clock3 className="h-4 w-4 text-fg-secondary" /></div>
    {!compact && <div className="mb-5 flex gap-6 border-b border-stroke-secondary pb-4"><div><strong className="os-type-title-3 tabular-nums">4</strong><p className="os-type-caption text-fg-secondary">Updates</p></div><div><strong className="os-type-title-3 tabular-nums">2</strong><p className="os-type-caption text-fg-secondary">Applications</p></div></div>}
    <ol className="space-y-4">{activity.slice(0,compact?2:4).map((item,index)=><li key={item.title} className="relative flex gap-3">{index< (compact?1:3) && <span aria-hidden="true" className="absolute bottom-[-16px] left-4 top-8 border-l border-stroke-secondary" />}<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-background-chrome-raised"><item.icon className="h-4 w-4 text-fg-secondary" /></span><div className="min-w-0"><p className="os-type-body">{item.title}</p>{!compact && <p className="mt-1 os-type-caption text-fg-secondary">{item.detail}</p>}<time className="os-type-caption text-fg-secondary">{item.time}</time></div></li>)}</ol>
  </div>;
  const visible = files.filter((file,index)=>file.name.toLowerCase().includes(query.toLowerCase()) && (location!=='Images'||file.type==='Image'||file.type==='Design') && (location!=='Documents'||file.type==='Document') && (location!=='Projects'||file.type==='Design') && (location!=='Starred'||index===0||index===1));
  return <div className="flex min-h-0 flex-1 overflow-hidden">
    {!compact && <nav aria-label="File locations" className="w-36 shrink-0 overflow-auto border-r border-stroke-secondary p-3"><p className="mb-3 os-type-caption text-fg-secondary">Workspace</p>{['Recent','Starred','Projects','Documents','Images'].map(name=><button key={name} aria-pressed={location===name} onClick={()=>{setLocation(name);setSelected(null);}} className={`os-focus-ring mb-1 flex w-full items-center gap-2 rounded px-2 py-2 text-left os-type-caption ${location===name?'bg-background-chrome-raised text-fg-primary':'text-fg-secondary'}`}>{name==='Recent'?<Clock3 className="h-4 w-4 shrink-0" />:name==='Starred'?<Star className="h-4 w-4 shrink-0" />:<Folder className="h-4 w-4 shrink-0" />}{name}</button>)}<div className="mt-6 border-t border-stroke-secondary pt-3"><HardDrive className="mb-2 h-5 w-5 text-fg-secondary" /><p className="os-type-caption">Workspace storage</p><progress aria-label="Storage used" value={32} max={100} className="mt-2 h-1 w-full accent-current" /><p className="mt-2 os-type-caption text-fg-secondary">3.2 GB / 10 GB</p></div></nav>}
    <div className="min-w-0 flex-1 overflow-auto p-4">
      <div className="mb-3 flex items-center justify-between gap-2"><h3 className="os-type-body-strong">{compact&&location==='Recent'?'Recent files':location}</h3>{compact?<span className="os-type-caption tabular-nums text-fg-secondary">{visible.length}</span>:<div className="flex gap-1">{(['list','grid'] as const).map(mode=><button key={mode} aria-label={`${mode} view`} aria-pressed={view===mode} title={`${mode} view`} onClick={()=>setView(mode)} className="os-focus-ring rounded p-1 text-fg-secondary">{mode==='grid'?<LayoutGrid className="h-4 w-4" />:<List className="h-4 w-4" />}</button>)}</div>}</div>
      {!compact && <><label className="mb-4 flex items-center gap-2 rounded border border-stroke-secondary px-2 py-2"><Search className="h-4 w-4 text-fg-secondary" /><input aria-label="Search files" placeholder="Search files" value={query} onChange={event=>setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent os-type-caption outline-none" /></label><div className="mb-4 flex items-center gap-4 border-b border-stroke-secondary pb-4"><img src={workspaceArtwork} alt="GenOS workspace artwork" className="h-20 w-28 shrink-0 rounded bg-background-chrome-raised object-contain p-3" /><div className="min-w-0"><p className="os-type-body-strong">Desktop collection</p><p className="mt-1 os-type-caption text-fg-secondary">Artwork, drafts and workspace files</p><p className="mt-2 os-type-caption text-fg-secondary">4 files / Updated today</p></div></div></>}
      <div className={!compact&&view==='grid'?'grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2':'divide-y divide-stroke-secondary'}>{visible.map(file=><button key={file.name} onClick={()=>setSelected(selected===file.name?null:file.name)} aria-pressed={selected===file.name} className={`os-focus-ring flex w-full items-center gap-3 py-3 text-left ${selected===file.name?'bg-background-chrome-raised':''} ${!compact&&view==='grid'?'flex-col items-start rounded border border-stroke-secondary p-3':''}`}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-background-chrome-raised"><file.icon className="h-4 w-4 text-fg-secondary" /></span><div className="min-w-0 flex-1"><p className="os-type-caption break-words">{file.name}</p><p className="mt-1 os-type-caption text-fg-secondary">{compact?file.type:`${file.type} / ${file.size}`}</p></div>{selected===file.name&&<Check className="h-4 w-4 shrink-0 text-fg-secondary" />}</button>)}</div>
      {!visible.length && <p className="py-6 os-type-caption text-fg-secondary">No matching files</p>}
      {selected && <p className="mt-3 border-t border-stroke-secondary pt-3 os-type-caption text-fg-secondary">{selected} / Sample file</p>}
    </div>
  </div>;
}
