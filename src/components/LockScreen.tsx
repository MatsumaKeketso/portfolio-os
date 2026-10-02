import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { ADMIN_EMAIL, useAuthStore } from '../store/authStore';
import { useDesktopStore } from '../store/desktopStore';
import { useUserStore } from '../store/userStore';
import { useMediaStore } from '../store/mediaStore';
import { audioEngine } from '../lib/audioEngine';
import { theme } from '../theme/theme';
import { DesktopBackground } from './Desktop';
import { Button } from './ui/button';
import { appInputClass } from './ui/AppShell';
import { Typography } from './ui/Typography';
import { cn } from '../lib/utils';
import logoWhite from '../assets/png-white-symbol.png';

export function LockScreen() {
  const [stage, setStage] = useState<'locked' | 'signin'>('locked');
  const [mode, setMode] = useState<'superuser' | 'guest'>('superuser');
  const [now, setNow] = useState(() => new Date());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const continueRef = useRef<HTMLButtonElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const swipeStart = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();
  const { isAuthenticated, isAdmin, user, login, unlockSession } = useAuthStore();
  const { backgrounds, selectedBackgroundId, unlockScreen } = useDesktopStore();
  const background = backgrounds.find(item => item.id === selectedBackgroundId) ?? backgrounds[0];
  const personal = useUserStore(state => state.profile.personal);
  const { currentTrack, status, queue } = useMediaStore();
  const isOwner = isAuthenticated ? isAdmin : mode === 'superuser';
  const displayName = isOwner ? 'genos' : user?.displayName || user?.email || 'Guest';
  const transition = { duration: reducedMotion ? 0 : 0.24 };
  const queueIndex = queue.findIndex(track => track.id === currentTrack?.id);

  useEffect(() => {
    const timer = globalThis.setInterval(() => setNow(new Date()), 1000);
    return () => globalThis.clearInterval(timer);
  }, []);

  useEffect(() => {
    setPassword('');
    setError('');
    if (stage === 'locked') continueRef.current?.focus();
    else if (!isAuthenticated && mode === 'guest') emailRef.current?.focus();
    else passwordRef.current?.focus();
  }, [stage, mode, isAuthenticated, user?.uid]);

  const returnToLock = () => {
    if (submittingRef.current) return;
    setPassword('');
    setError('');
    setStage('locked');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setError('');
    try {
      const result = isAuthenticated
        ? await unlockSession(password)
        : await login(password, mode === 'superuser' ? ADMIN_EMAIL : email);
      if (result.success) {
        setPassword('');
        unlockScreen();
      } else {
        setError(result.error || 'Unable to sign in. Please try again.');
        setPassword('');
        passwordRef.current?.focus();
      }
    } catch {
      setError('Unable to connect. Please try again.');
      setPassword('');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      returnToLock();
    }
    if (event.key === 'Tab') {
      const controls = panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled):not([tabindex="-1"]), input:not(:disabled)');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <motion.div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={stage === 'locked' ? 'GenOS lock screen' : 'Unlock GenOS'}
      className="fixed inset-0 isolate overflow-hidden bg-background-chrome text-fg-primary"
      style={{ zIndex: theme.zIndex.lockScreen }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      onKeyDown={handleKeyDown}
      onContextMenu={event => event.preventDefault()}
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden"
        animate={{ filter: stage === 'signin' ? 'blur(18px)' : 'blur(0px)', scale: stage === 'signin' ? 1.06 : 1 }}
        transition={transition}
      >
        <DesktopBackground
          url={background?.url || '/wallpaper.jpg'}
          thumbnail={background?.thumbnail}
          isGradient={!!background?.url?.startsWith('linear-gradient')}
          type={background?.type}
          config={background?.config}
          fallbackUrl="/wallpaper.jpg"
        />
      </motion.div>
      <div aria-hidden="true" className={cn('absolute inset-0 bg-background-chrome/25', stage === 'signin' && 'bg-background-chrome/80')} />
      <AnimatePresence mode="wait" initial={false}>
        {stage === 'locked' ? (
          <motion.div key="clock" className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} onAnimationComplete={() => continueRef.current?.focus()}>
            <button
              type="button"
              tabIndex={-1}
              aria-label="Show sign-in screen"
              className="absolute inset-0 touch-none cursor-default"
              onClick={() => setStage('signin')}
              onPointerDown={event => { swipeStart.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }}
              onPointerUp={event => {
                if (swipeStart.current !== null && swipeStart.current - event.clientY > 40) setStage('signin');
                swipeStart.current = null;
              }}
              onPointerCancel={() => { swipeStart.current = null; }}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background-chrome via-background-chrome/70 to-transparent" />
            <img src={logoWhite} alt="GenOS" className="absolute left-6 top-6 h-8 w-8 object-contain md:left-12 md:top-10" />
            <div className="absolute inset-x-0 bottom-0 grid grid-cols-1 items-end gap-6 px-6 pb-[max(2rem,env(safe-area-inset-bottom))] md:grid-cols-3 md:px-12 md:pb-16">
              <div className="pointer-events-none">
                <time dateTime={now.toISOString()} className="block text-5xl font-medium leading-none tabular-nums md:text-6xl">
                  {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </time>
                <Typography className="mt-2" tone="inherit">
                  {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </Typography>
              </div>
              <button ref={continueRef} type="button" onClick={() => setStage('signin')} className="os-focus-ring flex min-h-12 flex-col items-center gap-1 justify-self-center rounded px-6 py-2 text-fg-primary">
                <Icons.ChevronUp className="h-6 w-6" aria-hidden="true" />
                <Typography as="span" variant="bodyStrong">{isAuthenticated ? 'Unlock' : 'Enter GenOS'}</Typography>
              </button>
              {currentTrack && status !== 'idle' && (
                <section aria-label="Now playing" className="flex w-full min-w-0 max-w-xs items-center gap-3 justify-self-center md:justify-self-end">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-background-chrome border border-os-line-dark">
                    <Icons.Music className="h-5 w-5 text-fg-brand" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Typography variant="bodyStrong" truncate>{currentTrack.title}</Typography>
                    {currentTrack.artist && <Typography variant="caption" truncate>{currentTrack.artist}</Typography>}
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="Previous track" aria-label="Previous track" disabled={queueIndex < 0} onClick={audioEngine.prev}><Icons.SkipBack className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" title={status === 'playing' ? 'Pause' : 'Play'} aria-label={status === 'playing' ? 'Pause' : 'Play'} onClick={status === 'playing' ? audioEngine.pause : audioEngine.resume}>{status === 'playing' ? <Icons.Pause className="h-4 w-4" /> : <Icons.Play className="h-4 w-4" />}</Button>
                      <Button variant="ghost" size="icon" title="Next track" aria-label="Next track" disabled={queueIndex < 0 || queueIndex >= queue.length - 1} onClick={audioEngine.next}><Icons.SkipForward className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </section>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="signin" className="absolute inset-0 overflow-y-auto" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transition} onAnimationComplete={() => { if (!isAuthenticated && mode === 'guest') emailRef.current?.focus(); else passwordRef.current?.focus(); }}>
            <div className="flex min-h-full flex-col items-center justify-center px-6 py-12">
              <div className="flex w-full max-w-xs flex-col items-center text-center">
                <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-os-line-dark-hover bg-background-chrome">
                  {isOwner && personal.photo ? <img src={personal.photo} alt="" className="h-full w-full object-cover" /> : <Icons.UserRound className="h-10 w-10 text-fg-secondary" aria-hidden="true" />}
                </div>
                <Typography as="h1" variant="title3" className="w-full break-words">{displayName}</Typography>
                <Typography variant="caption" className="mt-1 text-fg-secondary">{isOwner ? 'Your creative workspace' : isAuthenticated ? 'Session locked' : 'Guest account'}</Typography>
                <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4 text-left" aria-busy={isSubmitting}>
                  {!isAuthenticated && mode === 'guest' && (
                    <div>
                      <label htmlFor="lock-email" className="mb-1.5 block os-type-caption text-fg-secondary">Email</label>
                      <input ref={emailRef} id="lock-email" name="email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} disabled={isSubmitting} className={cn(appInputClass, 'w-full px-3 py-2')} />
                    </div>
                  )}
                  <div>
                    <label htmlFor="lock-password" className="mb-1.5 block os-type-caption text-fg-secondary">Password</label>
                    <input ref={passwordRef} id="lock-password" name="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} disabled={isSubmitting} aria-invalid={!!error} aria-describedby={error ? 'lock-error' : undefined} className={cn(appInputClass, 'w-full px-3 py-2')} />
                  </div>
                  {error && <p id="lock-error" role="alert" className="os-type-caption text-fg-error">{error}</p>}
                  <Button type="submit" variant="solid-system-primary" className="w-full rounded" disabled={isSubmitting}>
                    {isSubmitting ? <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Icons.ArrowRight className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Signing in...' : isAuthenticated ? 'Unlock' : 'Sign in'}
                  </Button>
                  {!isAuthenticated && mode === 'guest' && <Typography variant="caption" className="text-fg-secondary">New emails create a guest account.</Typography>}
                </form>
                {!isAuthenticated && (
                  <div className="mt-4 flex w-full flex-col gap-2">
                    <Button variant="soft-system-secondary" className="w-full rounded" disabled={isSubmitting} onClick={() => { if (!useAuthStore.getState().isAuthenticated) unlockScreen(); }}>Continue as visitor</Button>
                    <Button variant="ghost" disabled={isSubmitting} onClick={() => setMode(mode === 'superuser' ? 'guest' : 'superuser')}>{mode === 'superuser' ? 'Guest account' : 'Owner sign in'}</Button>
                  </div>
                )}
                <Button variant="ghost" className="mt-8 flex-col gap-1 h-auto py-2" disabled={isSubmitting} onClick={returnToLock}>
                  <Icons.XCircle className="h-6 w-6" aria-hidden="true" />
                  <Typography as="span" variant="caption">Cancel</Typography>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
