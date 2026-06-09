import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { MotionValue, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useDesktopStore } from '../store/desktopStore';

type HostRect = { left: number; top: number; width: number; height: number; centerX: number };
type StripVariant = 'taskbar' | 'header' | 'boot';

const TASKBAR_STRIP_INSET = 18;

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function buildWavePath(cursorX: number, brightness: number, phase: number, amplitudeMultiplier = 1) {
  const centerY = 12;
  const amplitude = (1.35 + brightness * 3.8) * amplitudeMultiplier;
  const points: Array<{ x: number; y: number }> = [];

  for (let x = 0; x <= 100; x += 2) {
    const distance = Math.abs(x - cursorX);
    const envelope = Math.max(0.22, 1 - distance / 58);
    const edgeTaper = smoothstep(0, 14, x) * (1 - smoothstep(86, 100, x));
    const y = centerY + Math.sin((x - cursorX) * 0.24 + phase) * amplitude * envelope * edgeTaper;
    points.push({ x, y });
  }

  const [first, ...rest] = points;
  return rest.reduce((path, point) => `${path} L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`, `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`);
}

function buildOutwardWavePath(centerX: number, brightness: number, phase: number, amplitudeMultiplier = 1) {
  const centerY = 12;
  const amplitude = (1.35 + brightness * 3.8) * amplitudeMultiplier;
  const points: Array<{ x: number; y: number }> = [];

  for (let x = 0; x <= 100; x += 2) {
    const distance = Math.abs(x - centerX);
    const envelope = Math.max(0.2, 1 - distance / 60);
    const edgeTaper = smoothstep(0, 14, x) * (1 - smoothstep(86, 100, x));
    const y = centerY + Math.sin(distance * 0.28 - phase) * amplitude * envelope * edgeTaper;
    points.push({ x, y });
  }

  const [first, ...rest] = points;
  return rest.reduce((path, point) => `${path} L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`, `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`);
}

function LuminousStripSvg({
  x,
  bright,
  phase,
  variant = 'taskbar',
  active = true,
}: {
  x: MotionValue<number>;
  bright: MotionValue<number>;
  phase: MotionValue<number>;
  variant?: StripVariant;
  active?: boolean;
}) {
  const id = useId().replace(/:/g, '');
  const isHeader = variant === 'header';
  const isBoot = variant === 'boot';
  const isActiveHeader = isHeader && active;
  const isInactiveHeader = isHeader && !active;
  const waveA = useTransform([x, bright, phase], ([xV, bV, pV]: number[]) =>
    isHeader || isBoot
      ? buildOutwardWavePath(xV, bV, pV, isBoot ? 4.45 : active ? 3.55 : 3.15)
      : buildWavePath(xV, bV, pV, 1)
  );
  const waveB = useTransform([x, bright, phase], ([xV, bV, pV]: number[]) =>
    isHeader || isBoot
      ? buildOutwardWavePath(xV, bV, pV + Math.PI * 0.78, isBoot ? 3.65 : active ? 2.7 : 2.4)
      : buildWavePath(xV, bV, pV + Math.PI * 0.78, 0.78)
  );
  const waveC = useTransform([x, bright, phase], ([xV, bV, pV]: number[]) =>
    isHeader || isBoot
      ? buildOutwardWavePath(xV, bV, pV + Math.PI * 1.52, isBoot ? 2.8 : active ? 1.95 : 1.72)
      : buildWavePath(xV, bV, pV + Math.PI * 1.52, 0.52)
  );

  const haloOpacity = useTransform(bright, [0, 1], isBoot ? [0.72, 1] : isHeader ? (active ? [0.66, 1] : [0.18, 0.34]) : [0.48, 1]);
  const wideGlowOpacity = useTransform(bright, [0, 1], isBoot ? [0.1, 0.24] : isHeader ? (active ? [0.03, 0.13] : [0, 0]) : [0.14, 0.42]);
  const midGlowOpacity = useTransform(bright, [0, 1], isBoot ? [0.18, 0.42] : isHeader ? (active ? [0.06, 0.2] : [0, 0]) : [0.32, 0.82]);
  const hotLineOpacity = useTransform(bright, [0, 1], isBoot ? [0.3, 0.64] : isHeader ? (active ? [0.12, 0.3] : [0, 0]) : [0.48, 0.96]);
  const flareOpacity = useTransform(bright, [0, 1], isBoot ? [0.08, 0.24] : isHeader ? (active ? [0.03, 0.14] : [0, 0]) : [0.18, 0.72]);
  const glowReach = isBoot ? 30 : isHeader ? 22 : 30;
  const glowRamp = isBoot ? 12 : isHeader ? 10 : 14;
  const glowStart = useTransform(x, (xV) => `${Math.max(0, xV - glowReach)}%`);
  const glowRampIn = useTransform(x, (xV) => `${Math.max(0, xV - glowRamp)}%`);
  const glowCenter = useTransform(x, (xV) => `${xV}%`);
  const glowRampOut = useTransform(x, (xV) => `${Math.min(100, xV + glowRamp)}%`);
  const glowEnd = useTransform(x, (xV) => `${Math.min(100, xV + glowReach)}%`);
  const svgTop = isBoot ? '-top-6' : isHeader ? '-top-5' : '-top-3';
  const svgHeight = isBoot ? 'h-40' : isHeader ? 'h-10' : 'h-6';

  return (
    <motion.svg
      className={`absolute left-0 ${svgTop} ${svgHeight} w-full min-w-full overflow-visible`}
      viewBox={isBoot ? '0 -12 100 54' : '0 0 100 24'}
      preserveAspectRatio="none"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id={`${id}-wide-glow`} x="-18%" y="-360%" width="136%" height="820%">
          <feGaussianBlur stdDeviation={isBoot ? '1.45' : isHeader ? '0.62' : '1.55'} />
        </filter>
        <filter id={`${id}-mid-glow`} x="-16%" y="-260%" width="132%" height="640%">
          <feGaussianBlur stdDeviation={isBoot ? '0.72' : isHeader ? '0.32' : '0.72'} />
        </filter>
        <filter id={`${id}-flare-glow`} x="-14%" y="-260%" width="128%" height="640%">
          <feGaussianBlur stdDeviation={isBoot ? '1.05' : isHeader ? '0.42' : '1.15'} />
        </filter>
        <linearGradient id={`${id}-base-red`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isInactiveHeader ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.055)'} />
          <stop offset="12%" stopColor={isInactiveHeader ? 'rgba(148,148,148,0.22)' : 'rgba(248,113,113,0.72)'} />
          <stop offset="50%" stopColor={isInactiveHeader ? 'rgba(178,178,178,0.32)' : 'rgba(255,125,125,1)'} />
          <stop offset="88%" stopColor={isInactiveHeader ? 'rgba(148,148,148,0.22)' : 'rgba(248,113,113,0.72)'} />
          <stop offset="100%" stopColor={isInactiveHeader ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.055)'} />
        </linearGradient>
        <linearGradient id={`${id}-base-blue`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isInactiveHeader ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.05)'} />
          <stop offset="12%" stopColor={isInactiveHeader ? 'rgba(130,130,130,0.2)' : 'rgba(129,140,248,0.72)'} />
          <stop offset="50%" stopColor={isInactiveHeader ? 'rgba(160,160,160,0.3)' : 'rgba(165,180,252,1)'} />
          <stop offset="88%" stopColor={isInactiveHeader ? 'rgba(130,130,130,0.2)' : 'rgba(129,140,248,0.72)'} />
          <stop offset="100%" stopColor={isInactiveHeader ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.05)'} />
        </linearGradient>
        <linearGradient id={`${id}-base-white`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,255,255,0.04)" />
          <stop offset="12%" stopColor="rgba(255,255,255,0.38)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="88%" stopColor="rgba(255,255,255,0.38)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
        </linearGradient>
        <linearGradient id={`${id}-glow-red`} x1="0" y1="0" x2="1" y2="0">
          <motion.stop offset={glowStart} stopColor="rgba(239,68,68,0)" />
          <motion.stop offset={glowRampIn} stopColor="rgba(239,68,68,0.46)" />
          <motion.stop offset={glowCenter} stopColor="rgba(255,255,255,0.78)" />
          <motion.stop offset={glowRampOut} stopColor="rgba(239,68,68,0.46)" />
          <motion.stop offset={glowEnd} stopColor="rgba(239,68,68,0)" />
        </linearGradient>
        <linearGradient id={`${id}-glow-blue`} x1="0" y1="0" x2="1" y2="0">
          <motion.stop offset={glowStart} stopColor="rgba(99,102,241,0)" />
          <motion.stop offset={glowRampIn} stopColor="rgba(99,102,241,0.52)" />
          <motion.stop offset={glowCenter} stopColor="rgba(255,255,255,0.88)" />
          <motion.stop offset={glowRampOut} stopColor="rgba(99,102,241,0.52)" />
          <motion.stop offset={glowEnd} stopColor="rgba(99,102,241,0)" />
        </linearGradient>
        <linearGradient id={`${id}-glow-white`} x1="0" y1="0" x2="1" y2="0">
          <motion.stop offset={glowStart} stopColor="rgba(255,255,255,0)" />
          <motion.stop offset={glowRampIn} stopColor="rgba(255,255,255,0.35)" />
          <motion.stop offset={glowCenter} stopColor="rgba(255,255,255,1)" />
          <motion.stop offset={glowRampOut} stopColor="rgba(255,255,255,0.35)" />
          <motion.stop offset={glowEnd} stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id={`${id}-soft-flare`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="30%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="58%" stopColor="rgba(99,102,241,0.32)" />
          <stop offset="82%" stopColor="rgba(239,68,68,0.18)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
      </defs>
      <motion.path d={waveA} fill="none" stroke={`url(#${id}-glow-red)`} strokeWidth={isBoot ? '7.4' : isHeader ? '2.4' : '4'} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" filter={`url(#${id}-wide-glow)`} style={{ opacity: wideGlowOpacity }} />
      <motion.path d={waveB} fill="none" stroke={`url(#${id}-glow-blue)`} strokeWidth={isBoot ? '6.4' : isHeader ? '2' : '3.6'} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" filter={`url(#${id}-mid-glow)`} style={{ opacity: midGlowOpacity }} />
      <motion.path d={waveC} fill="none" stroke={`url(#${id}-glow-white)`} strokeWidth={isBoot ? '4.8' : isHeader ? '1.45' : '2.3'} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" filter={`url(#${id}-mid-glow)`} style={{ opacity: hotLineOpacity }} />
      <motion.ellipse cx={x} cy="12" rx={isBoot ? '14' : isHeader ? '7.5' : '6.5'} ry={isBoot ? '3.1' : isHeader ? '1.8' : '1.45'} fill={`url(#${id}-soft-flare)`} filter={`url(#${id}-flare-glow)`} style={{ opacity: flareOpacity }} />
      <motion.path d={waveA} fill="none" stroke={`url(#${id}-base-red)`} strokeWidth={isBoot ? '1.9' : isHeader ? '0.72' : '0.92'} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ opacity: haloOpacity }} />
      <motion.path d={waveB} fill="none" stroke={`url(#${id}-base-blue)`} strokeWidth={isBoot ? '1.55' : isHeader ? '0.66' : '0.82'} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" style={{ opacity: haloOpacity }} />
      <motion.path d={waveC} fill="none" stroke={`url(#${id}-base-white)`} strokeWidth={isBoot ? '1.08' : isHeader ? '0.5' : '0.54'} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" opacity={isBoot ? 0.86 : isActiveHeader ? 0.72 : 0.2} />
    </motion.svg>
  );
}

export function BootHeaderStrip() {
  const shouldReduceMotion = useReducedMotion();
  const rawX = useMotionValue(50);
  const rawBright = useMotionValue(0.72);
  const rawPhase = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 44, damping: 20 });
  const bright = useSpring(rawBright, { stiffness: 82, damping: 22 });
  const phase = useSpring(rawPhase, { stiffness: 34, damping: 18 });

  useEffect(() => {
    if (shouldReduceMotion) return;
    let raf: number;
    let lastTs = performance.now();
    let t = 0;
    const tick = (ts: number) => {
      // Cap dt so a tab-resume frame doesn't fast-forward the animation.
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      t += dt;
      rawPhase.set(t * 2.4);
      rawX.set(50 + Math.sin(t * 0.74) * 8);
      rawBright.set(0.64 + Math.sin(t * 0.92) * 0.12);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rawBright, rawPhase, rawX, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-0 h-[2px] bg-brand-600/45" />;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-0 h-36 overflow-visible">
      <LuminousStripSvg x={x} bright={bright} phase={phase} variant="boot" active />
    </div>
  );
}

export function WindowHeaderStrip({ active }: { active: boolean }) {
  const shouldReduceMotion = useReducedMotion();
  const activeRef = useRef(active);
  const rawX = useMotionValue(50);
  const rawBright = useMotionValue(active ? 0.54 : 0.1);
  const rawPhase = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 60, damping: 20 });
  const bright = useSpring(rawBright, { stiffness: 100, damping: 24 });
  const phase = useSpring(rawPhase, { stiffness: 38, damping: 18 });

  useEffect(() => {
    activeRef.current = active;
    rawBright.set(active ? 0.54 : 0.08);
  }, [active, rawBright]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    let raf: number;
    let lastTs = performance.now();
    let phaseValue = 0;
    const tick = (ts: number) => {
      // Cap dt: if the tab was hidden, performance.now() jumps but we want
      // the next frame to advance phase by ~one frame's worth, not minutes.
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      // Phase advances at radians-per-second. Changing the rate at the
      // active/inactive boundary produces an incremental dt*delta difference,
      // not a multiplicative t*rate jump that whips the spring.
      const phaseRate = activeRef.current ? 2.6 : 1.1;
      phaseValue += dt * phaseRate;
      // Wrap occasionally to bound float precision over long sessions.
      if (phaseValue > Math.PI * 2000) phaseValue -= Math.PI * 2000;
      rawPhase.set(phaseValue);
      rawX.set(50);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rawPhase, rawX, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <div aria-hidden className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-brand-600/10" />;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute left-4 right-4 top-0 z-[1] h-10 overflow-hidden opacity-90">
      <LuminousStripSvg x={x} bright={bright} phase={phase} variant="header" active={active} />
    </div>
  );
}

export function TaskbarStrip() {
  const stripEl = useRef<HTMLDivElement>(null);
  const { windows } = useDesktopStore();
  const shouldReduceMotion = useReducedMotion();
  const [taskbarRect, setTaskbarRect] = useState<HostRect | null>(null);
  const rawX = useMotionValue(50);
  const rawBright = useMotionValue(0.25);
  const rawPhase = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 170, damping: 24, mass: 0.55 });
  const bright = useSpring(rawBright, { stiffness: 165, damping: 24 });
  const phase = useSpring(rawPhase, { stiffness: 54, damping: 18 });
  const lastEventAt = useRef(Date.now());
  const tDrift = useRef(0);
  const isMounted = useRef(false);
  const prevFocusId = useRef<string | null>(null);
  const prevWinCount = useRef(windows.length);
  const clickImpulseTimeout = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);
  const pointerFrame = useRef<number | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);

  const getStripMetrics = (rect: HostRect) => {
    const width = Math.max(1, rect.width - TASKBAR_STRIP_INSET * 2);
    const left = rect.left + TASKBAR_STRIP_INSET;
    return { left, width, top: rect.top };
  };

  const applyPointer = useCallback((pointer: { x: number; y: number }, rect: HostRect) => {
    const strip = getStripMetrics(rect);
    lastPointer.current = pointer;
    lastEventAt.current = Date.now();
    rawX.set(Math.max(0, Math.min(100, ((pointer.x - strip.left) / strip.width) * 100)));
    const dist = Math.abs(pointer.y - strip.top);
    rawBright.set(dist < 150 ? 0.2 + (1 - dist / 150) * 0.78 : 0.2);
  }, [rawBright, rawX]);

  useEffect(() => {
    const updateBounds = () => {
      const taskbar = stripEl.current?.closest<HTMLElement>('#genos-taskbar');
      if (!taskbar) return;
      const rect = taskbar.getBoundingClientRect();
      setTaskbarRect((current) => {
        const next = { left: rect.left, top: rect.top, width: rect.width, height: rect.height, centerX: rect.left + rect.width / 2 };
        if (
          current &&
          Math.abs(current.left - next.left) < 0.5 &&
          Math.abs(current.top - next.top) < 0.5 &&
          Math.abs(current.width - next.width) < 0.5 &&
          Math.abs(current.height - next.height) < 0.5
        ) {
          return current;
        }
        return next;
      });
    };

    updateBounds();
    requestAnimationFrame(updateBounds);
    const taskbar = stripEl.current?.closest<HTMLElement>('#genos-taskbar');
    const observer = taskbar ? new ResizeObserver(updateBounds) : null;
    if (taskbar && observer) observer.observe(taskbar);
    window.addEventListener('resize', updateBounds);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateBounds);
    };
  }, [windows.length]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    let raf: number;
    let lastTs = performance.now();
    const tick = (ts: number) => {
      // Cap dt to absorb tab-resume bursts (would otherwise jump tDrift forward
      // by the entire hidden duration in a single frame and visibly snap the strip).
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTs = ts;
      tDrift.current += dt;
      rawPhase.set(tDrift.current * 2.4);
      if (Date.now() - lastEventAt.current > 1800) {
        const t = tDrift.current;
        rawX.set(Math.max(6, Math.min(94, 50 + Math.sin(t * 0.59) * 23 + Math.sin(t * 1.43) * 10 + Math.sin(t * 0.27) * 6)));
        rawBright.set(0.2 + Math.sin(t * 0.83) * 0.055);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [shouldReduceMotion, rawBright, rawPhase, rawX]);

  useEffect(() => {
    if (shouldReduceMotion || !taskbarRect) return;
    const flushPointer = () => {
      pointerFrame.current = null;
      const pointer = pendingPointer.current;
      if (!pointer) return;
      applyPointer(pointer, taskbarRect);
    };
    const onMove = (event: MouseEvent) => {
      pendingPointer.current = { x: event.clientX, y: event.clientY };
      if (pointerFrame.current == null) pointerFrame.current = requestAnimationFrame(flushPointer);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (pointerFrame.current != null) cancelAnimationFrame(pointerFrame.current);
    };
  }, [shouldReduceMotion, taskbarRect, applyPointer]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const onLeave = () => {
      rawX.set(15 + Math.random() * 70);
      rawBright.set(0.88);
      lastEventAt.current = 0;
      window.setTimeout(() => rawBright.set(0.2), 380);
    };
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => document.documentElement.removeEventListener('mouseleave', onLeave);
  }, [shouldReduceMotion, rawBright, rawX]);

  useEffect(() => {
    if (shouldReduceMotion || !taskbarRect) return;
    const onClick = (event: MouseEvent) => {
      const pointer = { x: event.clientX, y: event.clientY };
      const strip = getStripMetrics(taskbarRect);
      rawX.set(Math.max(0, Math.min(100, ((pointer.x - strip.left) / strip.width) * 100)));
      lastEventAt.current = Date.now();
      rawBright.set(1);
      if (clickImpulseTimeout.current) window.clearTimeout(clickImpulseTimeout.current);
      clickImpulseTimeout.current = window.setTimeout(() => {
        const latestPointer = lastPointer.current ?? pointer;
        applyPointer(latestPointer, taskbarRect);
        clickImpulseTimeout.current = null;
      }, 260);
    };
    window.addEventListener('click', onClick);
    return () => {
      window.removeEventListener('click', onClick);
      if (clickImpulseTimeout.current) window.clearTimeout(clickImpulseTimeout.current);
    };
  }, [shouldReduceMotion, taskbarRect, applyPointer, rawBright, rawX]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (windows.length === prevWinCount.current) return;
    lastEventAt.current = Date.now();
    rawBright.set(0.88);
    const timeout = window.setTimeout(() => rawBright.set(0.35), 420);
    prevWinCount.current = windows.length;
    return () => window.clearTimeout(timeout);
  }, [shouldReduceMotion, windows.length, rawBright]);

  const focusedId = windows.filter(w => !w.isMinimized).sort((a, b) => b.zIndex - a.zIndex)[0]?.id ?? null;

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (!isMounted.current) {
      isMounted.current = true;
      prevFocusId.current = focusedId;
      return;
    }
    if (focusedId === prevFocusId.current) return;
    lastEventAt.current = Date.now();
    rawBright.set(0.68);
    const timeout = window.setTimeout(() => rawBright.set(0.35), 320);
    prevFocusId.current = focusedId;
    return () => window.clearTimeout(timeout);
  }, [focusedId, shouldReduceMotion, rawBright]);

  return (
    <div
      ref={stripEl}
      aria-hidden
      className="absolute top-0 h-0 pointer-events-none overflow-visible"
      style={{ left: TASKBAR_STRIP_INSET, right: TASKBAR_STRIP_INSET, zIndex: 1 }}
    >
      {shouldReduceMotion ? <div className="h-[2px] bg-brand-600/35" /> : <LuminousStripSvg x={x} bright={bright} phase={phase} />}
    </div>
  );
}
