import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, Activity, Inbox, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../../lib/firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { AppShell, AppBody, AppSidebar, AppContent, AppCard, appInputClass } from '../ui/AppShell';
import { SystemRow, SystemRowGroup, SystemRowDivider } from '../ui/SystemRow';
import { cn } from '../../lib/utils';

const RATE_LIMIT_KEY = 'genos_feedback_ts';
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes between submissions
const NAME_MAX = 60;
const MESSAGE_MAX = 400;

interface FeedbackItem {
  id: string;
  name: string;
  message: string;
  timestamp: any;
  status: 'pending' | 'approved' | 'hidden';
}

function stripLinks(text: string): string {
  return text.replace(/https?:\/\/\S+/gi, '[link removed]');
}

function isRateLimited(): boolean {
  try {
    const ts = localStorage.getItem(RATE_LIMIT_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts, 10) < RATE_LIMIT_MS;
  } catch {
    return false;
  }
}

function markSubmitted(): void {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function Feedback() {
  const [activeTab, setActiveTab] = useState<'submit' | 'recent'>('submit');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'ratelimit'>('idle');
  const [submitError, setSubmitError] = useState('');
  const [recentFeedback, setRecentFeedback] = useState<FeedbackItem[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'os-feedback'),
      where('status', '==', 'approved'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FeedbackItem[];
      setRecentFeedback(items);
    }, () => {
      setRecentFeedback([]);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedMessage || isSubmitting) return;

    if (isRateLimited()) {
      setSubmitStatus('ratelimit');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitError('');

    try {
      await addDoc(collection(db, 'os-feedback'), {
        name: trimmedName.slice(0, NAME_MAX),
        message: stripLinks(trimmedMessage).slice(0, MESSAGE_MAX),
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      markSubmitted();
      setSubmitStatus('success');
      setName('');
      setMessage('');
      setTimeout(() => setSubmitStatus('idle'), 4000);
    } catch (err: any) {
      console.error('Feedback submission failed:', err);
      setSubmitError(err?.message || 'The message could not be saved.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <AppBody>
        {/* Sidebar */}
        <AppSidebar>
          <SystemRowGroup context="chrome">Feedback</SystemRowGroup>
          <SystemRow
            label="Share Thoughts"
            icon={<MessageSquarePlus className="w-4 h-4" />}
            context="chrome"
            selected={activeTab === 'submit'}
            onClick={() => setActiveTab('submit')}
          />
          <SystemRow
            label="Recent Activity"
            icon={<Activity className="w-4 h-4" />}
            context="chrome"
            selected={activeTab === 'recent'}
            onClick={() => setActiveTab('recent')}
          />
          <SystemRowDivider context="chrome" className="mt-auto" />
          <p className="px-3 py-3 text-[10px] text-white/20 leading-relaxed">
            Feedback is moderated before appearing publicly. Links are removed automatically.
          </p>
        </AppSidebar>

        {/* Content */}
        <AppContent>
          <AnimatePresence mode="wait">
            {activeTab === 'submit' ? (
              <motion.div
                key="submit"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-6 max-w-lg"
              >
                <h2 className="text-sm font-semibold text-white/80 mb-1">Share your thoughts</h2>
                <p className="text-xs text-white/40 mb-6">
                  Help improve GenOS. Plain text only — links are removed before saving.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30 mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
                      placeholder="Your name"
                      className={cn(appInputClass, 'px-3 py-2 text-sm w-full')}
                      required
                    />
                    <p className="text-right text-[10px] text-white/20 mt-1">{name.length}/{NAME_MAX}</p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30 mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
                      placeholder="What's on your mind?"
                      rows={5}
                      className={cn(appInputClass, 'px-3 py-2 text-sm w-full resize-none')}
                      required
                    />
                    <p className="text-right text-[10px] text-white/20 mt-1">{message.length}/{MESSAGE_MAX}</p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !name.trim() || !message.trim()}
                    className={cn(
                      'os-interactive os-focus-ring flex items-center gap-2 px-4 py-2 rounded text-sm font-medium',
                      'bg-os-ink-800 text-white/80 border border-os-line-dark',
                      'hover:border-os-line-dark-hover hover:bg-os-ink-700 hover:text-white',
                      'disabled:opacity-40 disabled:pointer-events-none'
                    )}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    {isSubmitting ? 'Submitting…' : 'Submit feedback'}
                  </button>

                  <AnimatePresence>
                    {submitStatus === 'success' && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        <p className="text-xs text-emerald-300">Received — thanks for your feedback.</p>
                      </motion.div>
                    )}
                    {submitStatus === 'error' && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                        <p className="text-xs text-red-300">{submitError || 'Something went wrong - please try again.'}</p>
                      </motion.div>
                    )}
                    {submitStatus === 'ratelimit' && (
                      <motion.div
                        key="ratelimit"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2 p-3 rounded-lg bg-os-ink-900 border border-os-line-dark"
                      >
                        <AlertCircle className="w-4 h-4 text-white/40 shrink-0" />
                        <p className="text-xs text-white/50">Please wait a few minutes before submitting again.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="recent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-6"
              >
                <h2 className="text-sm font-semibold text-white/80 mb-1">Recent feedback</h2>
                <p className="text-xs text-white/40 mb-6">Moderated and approved by the admin.</p>

                <div className="space-y-2">
                  {recentFeedback.length > 0 ? (
                    recentFeedback.map((item) => (
                      <AppCard key={item.id} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-white/80">{item.name}</span>
                          <span className="text-[10px] text-white/30">
                            {item.timestamp?.toDate().toLocaleDateString('en-ZA', {
                              day: 'numeric', month: 'short', year: 'numeric'
                            }) ?? '—'}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 leading-relaxed">{item.message}</p>
                      </AppCard>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Inbox className="w-8 h-8 text-white/15 mb-3" />
                      <p className="text-sm text-white/30">No approved feedback yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </AppContent>
      </AppBody>
    </AppShell>
  );
}
