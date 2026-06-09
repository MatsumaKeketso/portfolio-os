import { useEffect, useState } from 'react';
import * as Icons from 'lucide-react';
import type { FileItem } from '../../types';
import { useFileStore } from '../../store/fileStore';
import { useNotificationStore } from '../../store/notificationStore';
import { uploadFile } from '../../lib/uploadUtils';
import { renderMarkdown } from '../../lib/markdown';
import { sanitizeReadHtml } from '../../lib/reads';
import { appInputClass, appSoftButtonClass } from '../ui/AppShell';
import { RichTextEditor } from '../ui/RichTextEditor';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ProjectCaseStudyPanelProps {
  /** The project folder whose case study is shown. Undefined = nothing selected. */
  project?: FileItem;
  isAdmin: boolean;
}

/** Resolve the renderable HTML for a case study (html preferred, markdown fallback). */
function caseStudyHtml(project?: FileItem): string {
  const cs = project?.caseStudy;
  if (!cs) return '';
  if (cs.html?.trim()) return sanitizeReadHtml(cs.html);
  if (cs.markdown?.trim()) return renderMarkdown(cs.markdown);
  return '';
}

/**
 * Projects side panel — shows a selected project's rich case study. Read-only
 * for visitors; the owner edits with a Tiptap rich text editor (paste/upload
 * images). Lives beside the Projects grid so it never reflows it.
 */
export function ProjectCaseStudyPanel({ project, isAdmin }: ProjectCaseStudyPanelProps) {
  const setCaseStudy = useFileStore((s) => s.setCaseStudy);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [summaryDraft, setSummaryDraft] = useState('');
  const [media, setMedia] = useState<string[]>([]);

  // Reset whenever the selected project changes.
  useEffect(() => {
    setEditing(false);
    const cs = project?.caseStudy;
    setDraft(cs?.html?.trim() ? cs.html : cs?.markdown?.trim() ? renderMarkdown(cs.markdown) : '');
    setSummaryDraft(cs?.summary ?? '');
    setMedia(cs?.media ?? []);
  }, [project?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!project) {
    return (
      <aside className="w-[340px] shrink-0 border-l border-os-line-dark bg-os-ink-950/40 flex flex-col items-center justify-center p-8 text-center">
        <Icons.PanelRight className="w-8 h-8 text-white/15 mb-3" />
        <p className="text-sm text-white/40">Select a project to see its case study.</p>
      </aside>
    );
  }

  const renderedHtml = caseStudyHtml(project);
  const hasContent = Boolean(renderedHtml);

  const uploadImage = async (file: File): Promise<string | null> => {
    // portfolio-files/ is admin-write / public-read per storage.rules — correct
    // for owner case-study media (a new top-level folder would be public-writable
    // via the catch-all rule, so we deliberately reuse this managed path).
    const res = await uploadFile(file, { folder: 'portfolio-files', maxSizeMB: 8, allowedTypes: ['image/*'] });
    if (res.url && !res.error) {
      setMedia((m) => (m.includes(res.url!) ? m : [...m, res.url!]));
      return res.url;
    }
    addNotification({ type: 'error', title: 'Image upload failed', message: res.error || 'Could not upload image' });
    return null;
  };

  const save = () => {
    setCaseStudy(project.id, { html: draft, summary: summaryDraft.trim() || undefined, media });
    setEditing(false);
    addNotification({ type: 'success', title: 'Case study saved', message: `${project.name} updated`, duration: 2000 });
  };

  const startEdit = () => {
    const cs = project.caseStudy;
    setDraft(cs?.html?.trim() ? cs.html : cs?.markdown?.trim() ? renderMarkdown(cs.markdown) : '');
    setSummaryDraft(cs?.summary ?? '');
    setMedia(cs?.media ?? []);
    setEditing(true);
  };

  return (
    <aside className="w-[340px] shrink-0 border-l border-os-line-dark bg-os-ink-950/40 flex flex-col min-h-0">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-os-line-dark">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white truncate">{project.name}</h2>
            {!editing && project.caseStudy?.summary && (
              <p className="mt-1 text-xs text-white/65 whitespace-pre-wrap leading-relaxed">{project.caseStudy.summary}</p>
            )}
          </div>
          {isAdmin && !editing && (
            <button onClick={startEdit} className={cn(appSoftButtonClass, 'shrink-0 px-2 py-1 text-[11px] flex items-center gap-1')}>
              <Icons.Pencil className="w-3 h-3" /> {hasContent ? 'Edit' : 'Add'}
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {editing ? (
        <div className="flex-1 min-h-0 flex flex-col p-4 gap-3">
          <div className="shrink-0">
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">Summary</label>
            <textarea
              value={summaryDraft}
              onChange={(e) => setSummaryDraft(e.target.value)}
              placeholder="Short intro / summary — shown under the project title."
              rows={3}
              className={cn(appInputClass, 'mt-1 w-full px-2.5 py-1.5 text-xs leading-relaxed resize-y min-h-[3.5rem]')}
            />
          </div>
          <RichTextEditor
            value={draft}
            onChange={setDraft}
            uploadImage={uploadImage}
            placeholder="Describe the project — problem, approach, outcome. Paste or add images."
            className="flex-1 min-h-0"
          />
          <div className="shrink-0 flex gap-2">
            <Button variant="solid-brand-primary" size="sm" className="flex-1" onClick={save}>Save</Button>
            <Button variant="soft-system-primary" size="sm" className="flex-1" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          {hasContent ? (
            <div className="case-study-prose text-sm text-white/85" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-white/35 px-4">
              <Icons.FileText className="w-7 h-7 mb-2 opacity-40" />
              <p className="text-xs">
                {isAdmin ? 'No case study yet. Click “Add” to write one.' : 'No case study for this project yet.'}
              </p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
