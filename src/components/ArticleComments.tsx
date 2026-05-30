import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import {
  collection, doc, onSnapshot, addDoc, updateDoc,
  increment, serverTimestamp, query, orderBy, setDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';
import { appInputClass } from './ui/AppShell';
import { cn } from '../lib/utils';

interface Comment {
  id: string;
  name: string;
  message: string;
  createdAt: Date | null;
  likes: number;
  status: 'visible' | 'hidden';
}

interface Stats {
  views: number;
  likes: number;
  commentCount: number;
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function nameHue(name: string): number {
  return [...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) & 0xffffff, 0) % 360;
}

function initials(name: string): string {
  return name.trim().split(/\s+/).map(w => w[0] ?? '').join('').slice(0, 2).toUpperCase() || '?';
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const viewKey   = (slug: string) => `genos_view_${slug}`;
const likeKey   = (slug: string) => `genos_like_${slug}`;
const cLikeKey  = (id: string)   => `genos_clke_${id}`;
const cooldown  = (slug: string) => `genos_ccd_${slug}`;
const COOLDOWN_MS = 60_000;
const MAX_MSG = 600;
const MAX_NAME = 60;

interface ArticleCommentsProps {
  slug: string;
}

export function ArticleComments({ slug }: ArticleCommentsProps) {
  const { isAdmin, isAuthenticated } = useAuthStore();
  const [stats, setStats]         = useState<Stats>({ views: 0, likes: 0, commentCount: 0 });
  const [comments, setComments]   = useState<Comment[]>([]);
  const [name, setName]           = useState('');
  const [message, setMessage]     = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [hasLiked, setHasLiked]   = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const viewTracked = useRef(false);

  const statsDocRef   = doc(db, 'os-comments', slug);
  const itemsColRef   = collection(db, 'os-comments', slug, 'items');

  // Subscribe to stats
  useEffect(() => {
    const unsub = onSnapshot(statsDocRef, snap => {
      if (snap.exists()) {
        const d = snap.data();
        setStats({
          views:        d.views        ?? 0,
          likes:        d.likes        ?? 0,
          commentCount: d.commentCount ?? 0,
        });
      }
    });
    return unsub;
  }, [slug]);

  // Subscribe to comments
  useEffect(() => {
    const q = query(itemsColRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setComments(snap.docs.map(d => ({
        id:        d.id,
        name:      d.data().name      ?? 'Anonymous',
        message:   d.data().message   ?? '',
        createdAt: d.data().createdAt?.toDate() ?? null,
        likes:     d.data().likes     ?? 0,
        status:    d.data().status    ?? 'visible',
      })));
    });
    return unsub;
  }, [slug]);

  // Count view once per day per article
  useEffect(() => {
    if (viewTracked.current) return;
    viewTracked.current = true;
    const today = new Date().toDateString();
    const stored = localStorage.getItem(viewKey(slug));
    if (stored === today) return;
    localStorage.setItem(viewKey(slug), today);
    setDoc(statsDocRef, { views: increment(1) }, { merge: true }).catch(() => {});
  }, [slug]);

  // Init like states from localStorage
  useEffect(() => {
    setHasLiked(localStorage.getItem(likeKey(slug)) === '1');
    setLikedComments(prev => {
      const next = new Set(prev);
      comments.forEach(c => {
        if (localStorage.getItem(cLikeKey(c.id)) === '1') next.add(c.id);
      });
      return next;
    });
  }, [slug, comments]);

  const handleArticleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    localStorage.setItem(likeKey(slug), '1');
    await setDoc(statsDocRef, { likes: increment(1) }, { merge: true }).catch(() => {});
  };

  const handleCommentLike = async (comment: Comment) => {
    if (likedComments.has(comment.id)) return;
    setLikedComments(prev => new Set([...prev, comment.id]));
    localStorage.setItem(cLikeKey(comment.id), '1');
    await updateDoc(doc(db, 'os-comments', slug, 'items', comment.id), { likes: increment(1) }).catch(() => {});
  };

  const handleHide = async (comment: Comment) => {
    const next = comment.status === 'visible' ? 'hidden' : 'visible';
    await updateDoc(doc(db, 'os-comments', slug, 'items', comment.id), { status: next }).catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    const n = name.trim();
    const m = message.trim();
    if (!n) { setSubmitError('Please enter your name.'); return; }
    if (!m) { setSubmitError('Please enter a message.'); return; }

    const lastAt = Number(localStorage.getItem(cooldown(slug)) ?? 0);
    if (Date.now() - lastAt < COOLDOWN_MS) {
      setSubmitError(`Please wait ${Math.ceil((COOLDOWN_MS - (Date.now() - lastAt)) / 1000)}s before posting again.`);
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(itemsColRef, {
        name: n.slice(0, MAX_NAME),
        message: m.slice(0, MAX_MSG),
        createdAt: serverTimestamp(),
        likes: 0,
        status: 'visible',
      });
      await setDoc(statsDocRef, { commentCount: increment(1) }, { merge: true });
      localStorage.setItem(cooldown(slug), String(Date.now()));
      setName('');
      setMessage('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3500);
    } catch {
      setSubmitError('Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const visibleComments = isAdmin ? comments : comments.filter(c => c.status === 'visible');

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-white/45">
        <span className="flex items-center gap-1.5">
          <Icons.Eye className="w-3.5 h-3.5" />
          {formatCount(stats.views)} {stats.views === 1 ? 'view' : 'views'}
        </span>
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <span className="flex items-center gap-1.5">
          <Icons.MessageCircle className="w-3.5 h-3.5" />
          {formatCount(stats.commentCount)} {stats.commentCount === 1 ? 'comment' : 'comments'}
        </span>
        <span className="h-1 w-1 rounded-full bg-white/20" />
        <button
          onClick={handleArticleLike}
          disabled={hasLiked}
          className={cn(
            'flex items-center gap-1.5 transition-colors',
            hasLiked
              ? 'text-primary-400 cursor-default'
              : 'hover:text-primary-400 cursor-pointer'
          )}
          title={hasLiked ? 'You liked this' : 'Like this article'}
        >
          <Icons.Heart className={cn('w-3.5 h-3.5', hasLiked && 'fill-primary-400')} />
          {formatCount(stats.likes)} {stats.likes === 1 ? 'like' : 'likes'}
        </button>
      </div>

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="rounded-xl border border-os-line-dark bg-os-ink-900/60 p-4 space-y-3">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-[0.08em]">Leave a comment</p>
          <div className="space-y-2.5">
            <input
              value={name}
              onChange={e => setName(e.target.value.slice(0, MAX_NAME))}
              placeholder="Your name"
              className={cn(appInputClass, 'px-3 py-2 text-sm max-w-[220px] w-full')}
            />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value.slice(0, MAX_MSG))}
              placeholder="Share your thoughts…"
              rows={3}
              className={cn(appInputClass, 'px-3 py-2 text-sm w-full resize-none')}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {submitError && (
                <p className="text-xs text-fg-error">{submitError}</p>
              )}
              {submitted && (
                <p className="text-xs text-fg-success flex items-center gap-1">
                  <Icons.CheckCircle2 className="w-3.5 h-3.5" /> Comment posted
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] text-white/25 tabular-nums">
                {message.length}/{MAX_MSG}
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-primary-400 disabled:opacity-50"
              >
                {submitting ? <Icons.Loader2 className="w-3 h-3 animate-spin" /> : <Icons.Send className="w-3 h-3" />}
                Post
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-os-line-dark bg-os-ink-900/60 p-4">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-[0.08em] mb-2">Leave a comment</p>
          <p className="text-sm text-white/40">Sign in to join the discussion. Reactions are open to everyone.</p>
        </div>
      )}

      {/* Comment list */}
      {visibleComments.length === 0 ? (
        <div className="py-8 text-center text-sm text-white/25">
          No comments yet — be the first.
        </div>
      ) : (
        <div className="space-y-3">
          {visibleComments.map(comment => {
            const hue = nameHue(comment.name);
            const liked = likedComments.has(comment.id);
            return (
              <div
                key={comment.id}
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  comment.status === 'hidden'
                    ? 'border-os-line-dark bg-os-ink-900/30 opacity-50'
                    : 'border-os-line-dark bg-os-ink-900/60'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold text-white/80"
                    style={{ background: `hsl(${hue},45%,24%)` }}
                  >
                    {initials(comment.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-white/80">{comment.name}</span>
                      {comment.createdAt && (
                        <span className="text-[10px] text-white/30">{timeAgo(comment.createdAt)}</span>
                      )}
                      {comment.status === 'hidden' && isAdmin && (
                        <span className="text-[10px] text-fg-warning border border-stroke-warning/40 rounded px-1">hidden</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-white/70 leading-relaxed whitespace-pre-wrap break-words">
                      {comment.message}
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleCommentLike(comment)}
                        disabled={liked}
                        className={cn(
                          'flex items-center gap-1 text-[11px] transition-colors',
                          liked ? 'text-primary-400 cursor-default' : 'text-white/30 hover:text-primary-400 cursor-pointer'
                        )}
                      >
                        <Icons.Heart className={cn('w-3 h-3', liked && 'fill-primary-400')} />
                        {comment.likes > 0 && comment.likes}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={() => handleHide(comment)}
                          className="flex items-center gap-1 text-[11px] text-white/20 hover:text-white/60 transition-colors"
                        >
                          {comment.status === 'visible'
                            ? <><Icons.EyeOff className="w-3 h-3" /> Hide</>
                            : <><Icons.Eye className="w-3 h-3" /> Show</>
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
