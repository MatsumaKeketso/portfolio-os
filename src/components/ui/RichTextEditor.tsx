import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import * as Icons from 'lucide-react';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
  /** Initial HTML content. */
  value: string;
  /** Fires with the editor HTML on every change. */
  onChange: (html: string) => void;
  /** Upload an image file and return its URL (or null on failure). */
  uploadImage?: (file: File) => Promise<string | null>;
  placeholder?: string;
  className?: string;
}

// Toolbar button — tokenized, active-state aware.
function TBtn({
  icon: Icon, onClick, active, title, disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  active?: boolean;
  title: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection
      onClick={onClick}
      className={cn(
        'h-7 w-7 inline-flex items-center justify-center rounded transition-colors',
        active ? 'bg-brand-600/20 text-fg-brand' : 'text-white/55 hover:bg-os-ink-800 hover:text-white/85',
        disabled && 'opacity-30 pointer-events-none',
      )}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

const Divider = () => <span className="mx-0.5 h-4 w-px bg-os-line-dark" aria-hidden />;

/**
 * Headless rich text editor (Tiptap) styled to the GenOS design system.
 * Outputs HTML; render it back with `sanitizeReadHtml` + `.case-study-prose`.
 * The editable surface reuses `.case-study-prose` so editing is WYSIWYG.
 */
export function RichTextEditor({ value, onChange, uploadImage, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const insertImageFile = async (file: File) => {
    if (!uploadImage) return;
    setBusy(true);
    try {
      const url = await uploadImage(file);
      if (url) editorRef.current?.chain().focus().setImage({ src: url, alt: file.name.replace(/\.[^.]+$/, '') }).run();
    } finally {
      setBusy(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: placeholder || 'Write the case study…' }),
    ],
    content: value || '',
    editorProps: {
      attributes: { class: 'case-study-prose focus:outline-none min-h-[220px] px-3 py-2.5' },
      handlePaste: (_view, event) => {
        const items = event.clipboardData?.items;
        if (!items || !uploadImage) return false;
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file) { event.preventDefault(); void insertImageFile(file); return true; }
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  // Sync when the external value changes (e.g. different project selected).
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
  }, [value, editor]);

  if (!editor) return null;

  const applyLink = () => {
    const url = linkUrl.trim();
    if (!url) {
      editor.chain().focus().unsetLink().run();
    } else {
      const href = /^https?:\/\//i.test(url) || url.startsWith('/') ? url : `https://${url}`;
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    setLinkOpen(false);
    setLinkUrl('');
  };

  return (
    <div className={cn('flex flex-col rounded-lg border border-os-line-dark bg-os-ink-900/40 overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="shrink-0 flex flex-wrap items-center gap-0.5 px-1.5 py-1 border-b border-os-line-dark bg-os-ink-900/60">
        <TBtn icon={Icons.Bold} title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <TBtn icon={Icons.Italic} title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <TBtn icon={Icons.Strikethrough} title="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
        <TBtn icon={Icons.Code} title="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} />
        <Divider />
        <TBtn icon={Icons.Heading1} title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} />
        <TBtn icon={Icons.Heading2} title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
        <TBtn icon={Icons.Heading3} title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
        <Divider />
        <TBtn icon={Icons.List} title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <TBtn icon={Icons.ListOrdered} title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <TBtn icon={Icons.Quote} title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
        <TBtn icon={Icons.SquareCode} title="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
        <Divider />
        <TBtn
          icon={Icons.Link} title="Link" active={editor.isActive('link')}
          onClick={() => {
            const prev = editor.getAttributes('link').href as string | undefined;
            setLinkUrl(prev || '');
            setLinkOpen((o) => !o);
          }}
        />
        {uploadImage && (
          <TBtn icon={busy ? Icons.Loader : Icons.Image} title="Insert image" disabled={busy} onClick={() => imageInputRef.current?.click()} />
        )}
        <TBtn icon={Icons.Minus} title="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()} />
        <Divider />
        <TBtn icon={Icons.Undo2} title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <TBtn icon={Icons.Redo2} title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
      </div>

      {/* Inline link input */}
      {linkOpen && (
        <div className="shrink-0 flex items-center gap-2 px-2 py-1.5 border-b border-os-line-dark bg-os-ink-900/80">
          <Icons.Link className="h-3.5 w-3.5 text-white/40 shrink-0" />
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } if (e.key === 'Escape') setLinkOpen(false); }}
            placeholder="https://…  (empty to remove)"
            className="flex-1 bg-transparent text-xs text-white placeholder-white/30 focus:outline-none"
          />
          <button type="button" onClick={applyLink} className="text-[11px] font-medium text-fg-brand hover:underline">Apply</button>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void insertImageFile(f); e.target.value = ''; }}
      />
    </div>
  );
}
