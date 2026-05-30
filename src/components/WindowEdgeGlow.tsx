import { useEffect, useId, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '../lib/utils';

interface WindowEdgeGlowProps {
  active: boolean;
  rounded: boolean;
  /**
   * When the window has a taskbar cutout, the rectangular CSS-mask approach
   * can't follow the curved notch. Pass the perimeter path (viewport pixel
   * coords) and the cutout geometry to switch to an SVG-stroke variant that
   * traces the cutout exactly and adds floating particles above the notch.
   */
  cutout?: {
    path: string;
    viewportWidth: number;
    viewportHeight: number;
    /** Pixel coords of the notch — used for particle placement and cursor proximity. */
    left: number;
    right: number;
    top: number;
  };
}

/**
 * Cursor-reactive border overlay.
 *
 *   - **Box mode** (default): a crisp 1.5px CSS-masked ring at the perimeter
 *     + a wider blurred layer behind it that bleeds inward (the outer half is
 *     clipped by the parent's `overflow-hidden`).
 *   - **Cutout mode**: an SVG stroking the supplied perimeter path with a
 *     `userSpaceOnUse` radial gradient that tracks the cursor, plus a halo
 *     bloom stroke and Ori-style notch particles.
 *
 * Both modes use the red→white→indigo palette of the taskbar luminous strip.
 * `prefers-reduced-motion` returns null in both.
 */
export function WindowEdgeGlow({ active, rounded, cutout }: WindowEdgeGlowProps) {
  if (cutout) {
    return (
      <CutoutEdgeGlow
        active={active}
        path={cutout.path}
        viewportWidth={cutout.viewportWidth}
        viewportHeight={cutout.viewportHeight}
        notchLeft={cutout.left}
        notchRight={cutout.right}
        notchTop={cutout.top}
      />
    );
  }
  return <BoxEdgeGlow active={active} rounded={rounded} />;
}

// ---------------------------------------------------------------------------
// Box mode — rectangular CSS ring with inward bleed
// ---------------------------------------------------------------------------

function BoxEdgeGlow({ active, rounded }: { active: boolean; rounded: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;
    const flush = () => {
      rafRef.current = null;
      const el = ref.current;
      const p = pendingPointer.current;
      if (!el || !p) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const mx = p.x - rect.left;
      const my = p.y - rect.top;
      const w = rect.width;
      const h = rect.height;

      const insideMx = Math.max(0, Math.min(w, mx));
      const insideMy = Math.max(0, Math.min(h, my));
      const outside = mx < 0 || mx > w || my < 0 || my > h;
      const distToEdge = outside
        ? Math.hypot(mx - insideMx, my - insideMy)
        : Math.min(insideMx, w - insideMx, insideMy, h - insideMy);

      const REACH = 240;
      const proximity = Math.max(0, 1 - distToEdge / REACH);

      el.style.setProperty('--mx', `${mx}px`);
      el.style.setProperty('--my', `${my}px`);
      el.style.setProperty('--glow-strength', String(proximity));
    };

    const onMove = (e: MouseEvent) => {
      pendingPointer.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(flush);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  // Crisp ring opacity — dim baseline + reactive lift on cursor proximity.
  const crispBase = active ? 0.32 : 0.08;
  const crispLift = active ? 0.78 : 0.22;

  // Soft inward bleed — slightly weaker, blurred. The bleed reads as a
  // halo on top of the crisp ring.
  const bleedBase = active ? 0.28 : 0.06;
  const bleedLift = active ? 0.62 : 0.18;

  const ringRadius = rounded ? 'rounded-lg' : 'rounded-none';
  const sharedGradient =
    'radial-gradient(circle 360px at var(--mx, 50%) var(--my, 50%),' +
    ' rgba(255,255,255,0.95) 0%,' +
    ' rgba(239,68,68,0.78) 26%,' +
    ' rgba(129,140,248,0.45) 56%,' +
    ' rgba(239,68,68,0) 82%)';

  return (
    <div
      ref={ref}
      aria-hidden
      // Wrapper hosts the CSS vars (--mx/--my/--glow-strength). Children
      // inherit them automatically; no need to repeat ref handling per layer.
      className={cn(
        'pointer-events-none absolute inset-0 z-[30] transition-opacity duration-300',
        ringRadius,
      )}
    >
      {/* Layer 2 (rendered first → behind): soft inward bleed.
          A 1px ring blurred by ~5px becomes a ~11px wide soft band centered
          on the perimeter; the outer half is clipped by the motion.div's
          overflow-hidden, leaving a soft ~5px bleed into the window. */}
      <div
        className={cn('absolute inset-0 transition-opacity duration-300', ringRadius)}
        style={{
          padding: '1px',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          background: sharedGradient,
          filter: 'blur(5px)',
          opacity: `calc(${bleedBase} + ${bleedLift} * var(--glow-strength, 0))`,
        } as React.CSSProperties}
      />
      {/* Layer 1 (rendered last → on top): the crisp perimeter line. */}
      <div
        className={cn('absolute inset-0 transition-opacity duration-300', ringRadius)}
        style={{
          padding: '1.5px',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          background: sharedGradient,
          opacity: `calc(${crispBase} + ${crispLift} * var(--glow-strength, 0))`,
        } as React.CSSProperties}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Cutout mode — SVG ring + bloom + particles
// ---------------------------------------------------------------------------

interface CutoutGlowProps {
  active: boolean;
  path: string;
  viewportWidth: number;
  viewportHeight: number;
  notchLeft: number;
  notchRight: number;
  notchTop: number;
}

function CutoutEdgeGlow({
  active,
  path,
  viewportWidth,
  viewportHeight,
  notchLeft,
  notchRight,
  notchTop,
}: CutoutGlowProps) {
  const gradientRef = useRef<SVGRadialGradientElement>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);
  const shouldReduceMotion = useReducedMotion();
  const id = useId().replace(/:/g, '');

  useEffect(() => {
    if (shouldReduceMotion) return;
    const flush = () => {
      rafRef.current = null;
      const grad = gradientRef.current;
      const p = pendingPointer.current;
      if (!grad || !p) return;
      grad.setAttribute('cx', String(p.x));
      grad.setAttribute('cy', String(p.y));
    };

    const onMove = (e: MouseEvent) => {
      pendingPointer.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(flush);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <svg
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[30]"
      width={viewportWidth}
      height={viewportHeight}
      viewBox={`0 0 ${viewportWidth} ${viewportHeight}`}
    >
      <defs>
        <radialGradient
          ref={gradientRef}
          id={`${id}-glow`}
          gradientUnits="userSpaceOnUse"
          cx={viewportWidth / 2}
          cy={viewportHeight / 2}
          r="360"
        >
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="26%" stopColor="rgba(239,68,68,0.78)" />
          <stop offset="56%" stopColor="rgba(129,140,248,0.45)" />
          <stop offset="82%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
        <filter
          id={`${id}-bloom`}
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      {/* Static persistent outline — only when focused. Brighter than the old
          os-line-dark token so the line is actually noticeable. */}
      {active && (
        <path
          d={path}
          fill="none"
          stroke="rgba(255,255,255,0.22)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          shapeRendering="geometricPrecision"
        />
      )}

      {/* Soft inward bleed — same gradient, wider stroke, blurred. The outer
          half is clipped away by the motion.div's clipPath, so the visible
          result is a soft glow that bleeds inward from the perimeter. */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${id}-glow)`}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter={`url(#${id}-bloom)`}
        opacity={active ? 0.7 : 0.3}
      />

      {/* Crisp 1.5px stroke on top — keeps the perimeter sharp despite the
          bloom layer underneath. */}
      <path
        d={path}
        fill="none"
        stroke={`url(#${id}-glow)`}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={active ? 1 : 0.45}
      />

      <NotchParticles
        active={active}
        notchLeft={notchLeft}
        notchRight={notchRight}
        notchTop={notchTop}
        gradientIdPrefix={id}
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Notch particles — Ori-style luminous motes
// ---------------------------------------------------------------------------

type ParticleTint = 'warm' | 'cool' | 'white';
interface ParticleSpec {
  /** Constant spawn x — particles rise from this column. */
  baseX: number;
  /** Peak rise height above the notch line; tapers off toward the edges. */
  maxRise: number;
  /** Horizontal sway amplitude as the particle ascends. */
  swayAmp: number;
  swayFreq: number;
  swayPhase: number;
  /** Lifecycle pacing — how fast the particle ascends + cycles. */
  lifecycleSpeed: number;
  lifecyclePhase: number;
  /** Halo radius — kept small so particles read as motes, not blobs. */
  size: number;
  trailLength: number;
  /**
   * Distance from the notch center, normalized 0 (center) → 1 (edge). Used
   * to attenuate visibility at the edges so the column shape feels like a
   * flame: dense and tall in the middle, sparse and short at the sides.
   */
  edgeFalloff: number;
  tint: ParticleTint;
}

interface BaseParticleSpec extends ParticleSpec {
  baseOpacity: number;
}

/**
 * Cubic smoothstep. Returns 0 when value≤edge0, 1 when value≥edge1, with a
 * smooth (zero-derivative) transition between. Works for both directions —
 * pass edge0 > edge1 to get a decreasing ramp.
 */
function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Tiny deterministic PRNG — keeps the particle pattern stable across renders. */
function mulberry32(seed: number) {
  let a = seed;
  return function rng() {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function NotchParticles({
  active,
  notchLeft,
  notchRight,
  notchTop,
  gradientIdPrefix,
}: {
  active: boolean;
  notchLeft: number;
  notchRight: number;
  notchTop: number;
  gradientIdPrefix: string;
}) {
  const shouldReduceMotion = useReducedMotion();
  const id = gradientIdPrefix;
  const refs = useRef<Array<SVGCircleElement | null>>([]);
  const trailRefs = useRef<Array<SVGLineElement | null>>([]);
  const baseRefs = useRef<Array<SVGCircleElement | null>>([]);
  const baseTrailRefs = useRef<Array<SVGLineElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const cursorRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const lastTs = useRef<number>(performance.now());
  const tRef = useRef<number>(0);
  const activeRef = useRef(active);
  // Low-pass filter on cursor proximity. Without this, riseScale and edge
  // visibility snap whenever the cursor moves quickly — every particle
  // jumps in y-position the same frame. Smoothing it produces a settled feel.
  const smoothedProximityRef = useRef(0);

  const notchWidth = notchRight - notchLeft;

  const particles = useMemo<ParticleSpec[]>(() => {
    const rng = mulberry32(0x9e3779b1);
    const COUNT = 28;
    const arr: ParticleSpec[] = [];
    const halfWidth = notchWidth / 2;
    for (let i = 0; i < COUNT; i++) {
      // Spatial bias: power curve pulls spawn x toward the center.
      // exponent 2.0 → strong center concentration while leaving edge motes visible.
      const centered = rng() * 2 - 1; // -1 to 1
      const biased = Math.sign(centered) * Math.pow(Math.abs(centered), 2.0);
      const baseX = notchLeft + halfWidth + biased * halfWidth;
      const edgeFalloff = Math.min(1, Math.abs(biased)); // 0 center → 1 edge

      // Rise height: tall (60–95px) in the center, short (18–32px) at the edges.
      const riseRange = 60 + rng() * 35; // unscaled base
      const maxRise = riseRange * (1 - 0.72 * edgeFalloff);

      const tintRoll = rng();
      // Mostly warm + white for a fire palette; a few cool motes for variation.
      const tint: ParticleTint = tintRoll < 0.6 ? 'warm' : tintRoll < 0.92 ? 'white' : 'cool';

      arr.push({
        baseX,
        maxRise,
        // Slight horizontal sway that grows as the particle rises.
        swayAmp: 3 + rng() * 5,
        swayFreq: 0.4 + rng() * 0.6,
        swayPhase: rng() * Math.PI * 2,
        // Slow lifecycle: 4–8 seconds per rise cycle.
        lifecycleSpeed: 0.12 + rng() * 0.13,
        lifecyclePhase: rng(), // 0–1 (used modulo 1)
        // Smaller halos than before — particles read as motes, not blobs.
        size: 1.4 + rng() * 1.6,
        trailLength: 7 + rng() * 13,
        edgeFalloff,
        tint,
      });
    }
    return arr;
  }, [notchLeft, notchWidth]);

  const baseParticles = useMemo<BaseParticleSpec[]>(() => {
    const rng = mulberry32(0x4f1bbcdd);
    const COUNT = 22;
    const arr: BaseParticleSpec[] = [];
    const halfWidth = notchWidth / 2;
    for (let i = 0; i < COUNT; i++) {
      const centered = rng() * 2 - 1;
      const biased = Math.sign(centered) * Math.pow(Math.abs(centered), 2.7);
      const edgeFalloff = Math.min(1, Math.abs(biased));
      const baseX = notchLeft + halfWidth + biased * halfWidth * 0.72;
      const tintRoll = rng();
      const tint: ParticleTint = tintRoll < 0.72 ? 'warm' : tintRoll < 0.95 ? 'white' : 'cool';

      arr.push({
        baseX,
        maxRise: (20 + rng() * 26) * (1 - 0.58 * edgeFalloff),
        swayAmp: 1.5 + rng() * 3.2,
        swayFreq: 0.35 + rng() * 0.5,
        swayPhase: rng() * Math.PI * 2,
        lifecycleSpeed: 0.18 + rng() * 0.17,
        lifecyclePhase: rng(),
        size: 1 + rng() * 1.35,
        trailLength: 4 + rng() * 7,
        edgeFalloff,
        tint,
        baseOpacity: 0.32 + rng() * 0.28,
      });
    }
    return arr;
  }, [notchLeft, notchWidth]);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (shouldReduceMotion) return;
    let raf: number;
    const tick = (ts: number) => {
      // Cap dt — a tab-resume frame advances by one frame, not minutes.
      const dt = Math.min(0.05, (ts - lastTs.current) / 1000);
      lastTs.current = ts;
      tRef.current += dt;
      const t = tRef.current;

      // Cursor proximity to the notch top segment (notchLeft..notchRight at y=notchTop).
      const cursor = cursorRef.current;
      const cx = Math.max(notchLeft, Math.min(notchRight, cursor.x));
      const distToNotch = Math.hypot(cursor.x - cx, cursor.y - notchTop);
      const PROX_REACH = 360;
      const rawProximity = Math.max(0, 1 - distToNotch / PROX_REACH);

      // Exponential smoothing toward the raw proximity. tau≈0.18s reads as
      // responsive but never jumpy — eliminates the per-frame y-jitter that
      // happens when riseScale changes between consecutive frames.
      const tau = 0.18;
      const lerp = 1 - Math.exp(-dt / tau);
      smoothedProximityRef.current += (rawProximity - smoothedProximityRef.current) * lerp;
      const proximity = smoothedProximityRef.current;

      // Rise height scales with smoothed proximity.
      const riseScale = 0.5 + 0.5 * proximity;
      const activeMult = activeRef.current ? 1 : 0.4;
      const brightness = (0.3 + 0.7 * proximity) * activeMult;

      for (let i = 0; i < baseParticles.length; i++) {
        const p = baseParticles[i];
        const el = baseRefs.current[i];
        const trail = baseTrailRefs.current[i];
        if (!el) continue;

        const cycle = ((t * p.lifecycleSpeed + p.lifecyclePhase) % 1 + 1) % 1;
        const ease = 1 - Math.pow(1 - cycle, 1.35);
        const y = notchTop - ease * p.maxRise * (0.72 + 0.28 * proximity);
        const sway = p.swayAmp * Math.sin(cycle * Math.PI * p.swayFreq + p.swayPhase) * Math.sqrt(cycle);
        const x = p.baseX + sway;
        const lifeAlpha =
          cycle < 0.18
            ? smoothstep(0, 0.18, cycle)
            : smoothstep(0.62, 0.18, cycle);
        const centerWeight = 1 - p.edgeFalloff * 0.68;
        const opacity = lifeAlpha * brightness * centerWeight * p.baseOpacity;

        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', opacity.toFixed(3));

        if (trail) {
          const trailFade = Math.max(0, Math.min(1, opacity * 0.42));
          const trailEndY = y + p.trailLength * (0.55 + cycle * 0.55);
          trail.setAttribute('x1', (x - sway * 0.08).toFixed(1));
          trail.setAttribute('y1', trailEndY.toFixed(1));
          trail.setAttribute('x2', x.toFixed(1));
          trail.setAttribute('y2', y.toFixed(1));
          trail.setAttribute('opacity', trailFade.toFixed(3));
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const el = refs.current[i];
        const trail = trailRefs.current[i];
        if (!el) continue;

        // Lifecycle phase 0→1 looping. Each particle spawns at the notch
        // line (cycle=0), rises, then resets.
        const cycle = ((t * p.lifecycleSpeed + p.lifecyclePhase) % 1 + 1) % 1;

        // Rise easing — fast off the line, smoothly slowing as the particle cools.
        const ease = 1 - Math.pow(1 - cycle, 1.6);
        const y = notchTop - ease * p.maxRise * riseScale;

        // Sway: capped to at most half a sin oscillation per lifetime
        // (cycle * π instead of cycle * 2π) so each particle sweeps gently
        // to one side as it rises rather than wiggling back and forth.
        // Amplitude eases in with sqrt(cycle) — visible movement early but
        // without the abrupt start of linear scaling.
        const sway = p.swayAmp * Math.sin(cycle * Math.PI * p.swayFreq + p.swayPhase) * Math.sqrt(cycle);
        const x = p.baseX + sway;

        // Asymmetric life curve: fast ignition, lingering cool-down. Peaks
        // around cycle≈0.32 (vs 0.5 for the prior sin curve) and trails off
        // gently. Embers fade like fire, not like a heartbeat.
        const lifeAlpha =
          cycle < 0.32
            ? smoothstep(0, 0.32, cycle)
            : smoothstep(1, 0.32, cycle);

        // Edge attenuation: weaker baseline visibility at the sides; cursor
        // proximity restores their presence (closer cursor → more visible).
        const edgeVisibility = (1 - p.edgeFalloff * 0.55) + 0.55 * p.edgeFalloff * proximity;

        const opacity = lifeAlpha * brightness * edgeVisibility;

        el.setAttribute('cx', x.toFixed(1));
        el.setAttribute('cy', y.toFixed(1));
        el.setAttribute('opacity', opacity.toFixed(3));

        if (trail) {
          const trailFade = Math.max(0, Math.min(1, opacity * 0.48));
          const trailEndY = y + p.trailLength * (0.45 + cycle * 0.75);
          trail.setAttribute('x1', (x - sway * 0.12).toFixed(1));
          trail.setAttribute('y1', trailEndY.toFixed(1));
          trail.setAttribute('x2', x.toFixed(1));
          trail.setAttribute('y2', y.toFixed(1));
          trail.setAttribute('opacity', trailFade.toFixed(3));
        }
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      cursorRef.current = { x: e.clientX, y: e.clientY };
    };

    raf = requestAnimationFrame(tick);
    rafRef.current = raf;
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(raf);
    };
  }, [shouldReduceMotion, baseParticles, particles, notchLeft, notchRight, notchTop]);

  if (shouldReduceMotion) return null;

  return (
    <g>
      <defs>
        {/* Each tint: crisp white core (0–14%) + soft tinted falloff to transparent.
            The 14% stop on a ~5px radius particle yields a ~0.7px luminous core —
            sub-pixel-thin even on high-DPR, so it reads as crisp. */}
        <radialGradient id={`${id}-pwarm`}>
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="14%" stopColor="rgba(255,215,180,0.85)" />
          <stop offset="44%" stopColor="rgba(239,68,68,0.5)" />
          <stop offset="100%" stopColor="rgba(239,68,68,0)" />
        </radialGradient>
        <radialGradient id={`${id}-pcool`}>
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="14%" stopColor="rgba(200,210,255,0.85)" />
          <stop offset="44%" stopColor="rgba(129,140,248,0.5)" />
          <stop offset="100%" stopColor="rgba(129,140,248,0)" />
        </radialGradient>
        <radialGradient id={`${id}-pwhite`}>
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="22%" stopColor="rgba(255,255,255,0.75)" />
          <stop offset="65%" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      {baseParticles.map((p, i) => (
        <line
          key={`base-trail-${i}`}
          ref={(el) => {
            baseTrailRefs.current[i] = el;
          }}
          x1={p.baseX}
          y1={notchTop}
          x2={p.baseX}
          y2={notchTop}
          stroke={p.tint === 'cool' ? 'rgba(129,140,248,0.30)' : p.tint === 'white' ? 'rgba(255,255,255,0.28)' : 'rgba(239,68,68,0.34)'}
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity="0"
        />
      ))}
      {baseParticles.map((p, i) => (
        <circle
          key={`base-${i}`}
          ref={(el) => {
            baseRefs.current[i] = el;
          }}
          cx={p.baseX}
          cy={notchTop}
          r={p.size}
          fill={`url(#${id}-p${p.tint})`}
          opacity="0"
        />
      ))}
      {particles.map((p, i) => (
        <line
          key={`trail-${i}`}
          ref={(el) => {
            trailRefs.current[i] = el;
          }}
          x1={p.baseX}
          y1={notchTop}
          x2={p.baseX}
          y2={notchTop}
          stroke={p.tint === 'cool' ? 'rgba(129,140,248,0.48)' : p.tint === 'white' ? 'rgba(255,255,255,0.42)' : 'rgba(239,68,68,0.52)'}
          strokeWidth="0.85"
          strokeLinecap="round"
          opacity="0"
        />
      ))}
      {particles.map((p, i) => (
        <circle
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          cx={p.baseX}
          // Initial cy is the spawn line; the tick advances it upward via setAttribute.
          cy={notchTop}
          r={p.size}
          fill={`url(#${id}-p${p.tint})`}
          opacity="0"
        />
      ))}
    </g>
  );
}
