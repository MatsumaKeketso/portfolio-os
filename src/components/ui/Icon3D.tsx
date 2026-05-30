import { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame, type GroupProps } from '@react-three/fiber';
import * as THREE from 'three';
import * as Icons from 'lucide-react';
import { useInView } from '../../hooks/useInView';
import { cn } from '../../lib/utils';

export type Icon3DType =
  | 'folder'
  | 'folder-documents'
  | 'folder-downloads'
  | 'folder-projects'
  | 'folder-cv'
  | 'folder-images'
  | 'folder-system'
  | 'folder-trash'
  | 'folder-gallery'
  | 'folder-desktop'
  | 'file'
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'doc'
  | 'code'
  | 'text';

const DEFAULT_TINTS: Record<Icon3DType, string> = {
  'folder': '#f5b340',
  'folder-documents': '#5aa9ff',
  'folder-downloads': '#34d399',
  'folder-projects': '#a78bfa',
  'folder-cv': '#fbbf24',
  'folder-images': '#f472b6',
  'folder-system': '#94a3b8',
  'folder-trash': '#9ca3af',
  'folder-gallery': '#10b981',
  'folder-desktop': '#cbd5e1',
  'file': '#e2e8f0',
  'pdf': '#ef4444',
  'image': '#f472b6',
  'video': '#a78bfa',
  'audio': '#f59e0b',
  'doc': '#5aa9ff',
  'code': '#22d3ee',
  'text': '#e5e7eb',
};

const FALLBACK_2D_ICON: Record<Icon3DType, keyof typeof Icons> = {
  'folder': 'Folder',
  'folder-documents': 'FolderOpen',
  'folder-downloads': 'Download',
  'folder-projects': 'Briefcase',
  'folder-cv': 'UserCheck',
  'folder-images': 'Image',
  'folder-system': 'HardDrive',
  'folder-trash': 'Trash2',
  'folder-gallery': 'Users',
  'folder-desktop': 'Monitor',
  'file': 'File',
  'pdf': 'FileText',
  'image': 'Image',
  'video': 'PlayCircle',
  'audio': 'Music',
  'doc': 'FileText',
  'code': 'Code',
  'text': 'FileText',
};

function lighten(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color('#ffffff'), amount);
  return `#${c.getHexString()}`;
}

function darken(hex: string, amount: number): string {
  const c = new THREE.Color(hex);
  c.lerp(new THREE.Color('#000000'), amount);
  return `#${c.getHexString()}`;
}

interface MeshProps extends GroupProps {
  tint: string;
  /** Whether this mesh should self-animate (rotate). */
  animate?: boolean;
}

function useIdleRotation(animate: boolean, speed = 0.4, restAngle = 0.18) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    if (animate) {
      ref.current.rotation.y += dt * speed;
    } else {
      // Slowly settle to a 3/4-view resting pose so we don't snap if animation
      // is toggled mid-rotation.
      const target = restAngle;
      ref.current.rotation.y += (target - ref.current.rotation.y) * 0.08;
    }
  });
  return ref;
}

function FolderMesh({ tint, animate = false, ...props }: MeshProps) {
  const ref = useIdleRotation(animate);
  const front = useMemo(() => lighten(tint, 0.22), [tint]);
  const back = useMemo(() => darken(tint, 0.22), [tint]);
  const highlight = useMemo(() => lighten(tint, 0.55), [tint]);
  const paper = '#fafafa';

  return (
    <group ref={ref} rotation={[0.2, 0.18, 0]} {...props}>
      {/* Back panel + tab — single visual unit */}
      <mesh position={[0, 0.02, -0.06]} castShadow receiveShadow>
        <boxGeometry args={[1.85, 1.18, 0.08]} />
        <meshPhysicalMaterial
          color={back}
          roughness={0.55}
          metalness={0.05}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
        />
      </mesh>
      <mesh position={[-0.55, 0.65, -0.06]} castShadow>
        <boxGeometry args={[0.78, 0.26, 0.08]} />
        <meshPhysicalMaterial
          color={back}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* Inner papers peeking out the top */}
      <mesh position={[0.04, 0.46, 0.0]}>
        <boxGeometry args={[1.55, 0.28, 0.02]} />
        <meshStandardMaterial color={paper} roughness={0.95} />
      </mesh>
      <mesh position={[-0.06, 0.5, 0.005]}>
        <boxGeometry args={[1.5, 0.22, 0.02]} />
        <meshStandardMaterial color="#e8e8e8" roughness={0.95} />
      </mesh>

      {/* Front flap */}
      <mesh position={[0, -0.04, 0.06]} castShadow>
        <boxGeometry args={[1.82, 1.06, 0.08]} />
        <meshPhysicalMaterial
          color={front}
          roughness={0.45}
          metalness={0.06}
          clearcoat={0.35}
          clearcoatRoughness={0.35}
        />
      </mesh>

      {/* Top-edge highlight */}
      <mesh position={[0, 0.48, 0.11]}>
        <boxGeometry args={[1.75, 0.03, 0.005]} />
        <meshStandardMaterial color={highlight} roughness={0.2} emissive={highlight} emissiveIntensity={0.12} />
      </mesh>
    </group>
  );
}

function FileMesh({ tint, animate = false, ...props }: MeshProps) {
  const ref = useIdleRotation(animate);
  const surface = '#f8fafc';
  const accent = useMemo(() => tint, [tint]);
  const shadow = useMemo(() => darken(tint, 0.25), [tint]);

  return (
    <group ref={ref} rotation={[0.15, 0.15, 0]} {...props}>
      {/* Back sheet — slightly offset to suggest depth */}
      <mesh position={[0.04, -0.04, -0.06]}>
        <boxGeometry args={[1.4, 1.78, 0.04]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.9} />
      </mesh>
      {/* Main sheet */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.42, 1.8, 0.06]} />
        <meshPhysicalMaterial
          color={surface}
          roughness={0.7}
          metalness={0.02}
          clearcoat={0.15}
        />
      </mesh>
      {/* Folded corner (top-right) */}
      <mesh position={[0.6, 0.78, 0.035]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.36, 0.36, 0.02]} />
        <meshStandardMaterial color={shadow} roughness={0.6} />
      </mesh>
      {/* Color band at bottom */}
      <mesh position={[0, -0.62, 0.04]}>
        <boxGeometry args={[1.1, 0.22, 0.012]} />
        <meshPhysicalMaterial
          color={accent}
          roughness={0.35}
          metalness={0.15}
          clearcoat={0.4}
          emissive={accent}
          emissiveIntensity={0.1}
        />
      </mesh>
      {/* Text-line accents */}
      <mesh position={[-0.15, 0.18, 0.04]}>
        <boxGeometry args={[0.9, 0.06, 0.008]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
      <mesh position={[-0.25, 0.02, 0.04]}>
        <boxGeometry args={[0.7, 0.06, 0.008]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
      <mesh position={[-0.2, -0.14, 0.04]}>
        <boxGeometry args={[0.8, 0.06, 0.008]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.9} />
      </mesh>
    </group>
  );
}

function ImageMesh({ tint, animate = false, ...props }: MeshProps) {
  const ref = useIdleRotation(animate);
  const frame = '#fafafa';
  return (
    <group ref={ref} rotation={[0.12, 0.18, 0]} {...props}>
      {/* Polaroid frame */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 1.85, 0.08]} />
        <meshPhysicalMaterial
          color={frame}
          roughness={0.5}
          metalness={0.03}
          clearcoat={0.3}
        />
      </mesh>
      {/* Photo window */}
      <mesh position={[0, 0.18, 0.045]}>
        <boxGeometry args={[1.35, 1.35, 0.01]} />
        <meshPhysicalMaterial
          color={tint}
          roughness={0.15}
          metalness={0.2}
          clearcoat={0.6}
          emissive={tint}
          emissiveIntensity={0.15}
        />
      </mesh>
      {/* Sun/horizon hint in the photo */}
      <mesh position={[0.3, 0.5, 0.052]}>
        <circleGeometry args={[0.18, 24]} />
        <meshStandardMaterial color={lighten(tint, 0.5)} roughness={0.3} />
      </mesh>
    </group>
  );
}

function MediaCubeMesh({ tint, animate = false, ...props }: MeshProps) {
  const ref = useIdleRotation(animate, 0.5);
  return (
    <group ref={ref} {...props}>
      <mesh castShadow>
        <boxGeometry args={[1.3, 1.3, 1.3]} />
        <meshPhysicalMaterial
          color={tint}
          roughness={0.3}
          metalness={0.25}
          clearcoat={0.5}
        />
      </mesh>
      {/* Play triangle inset (front face) */}
      <mesh position={[0, 0, 0.66]}>
        <cylinderGeometry args={[0.32, 0.32, 0.04, 3]} />
        <meshStandardMaterial color={lighten(tint, 0.7)} roughness={0.3} />
      </mesh>
    </group>
  );
}

function PDFMesh(props: MeshProps) {
  return <FileMesh {...props} />;
}

function pickMesh(type: Icon3DType, tint: string, animate: boolean) {
  if (type.startsWith('folder')) return <FolderMesh tint={tint} animate={animate} />;
  if (type === 'pdf') return <PDFMesh tint={tint} animate={animate} />;
  if (type === 'image') return <ImageMesh tint={tint} animate={animate} />;
  if (type === 'video' || type === 'audio') return <MediaCubeMesh tint={tint} animate={animate} />;
  return <FileMesh tint={tint} animate={animate} />;
}

export interface Icon3DProps {
  type: Icon3DType;
  /** Pixel size of the icon (square). */
  size?: number;
  /** Override the default tint for this type. */
  tint?: string;
  /** When true the icon spins; otherwise renders a static frame. */
  animate?: boolean;
  className?: string;
}

/**
 * Icon3D — viewport-gated, demand-rendered 3D icon.
 *
 * Performance contract:
 * 1. Mounts no WebGL context until the parent enters the viewport (with a
 *    200px buffer), so a folder with 100 items only ever runs ~12 GL contexts
 *    at a time.
 * 2. Defaults to `frameloop="demand"` — the canvas renders once and stops.
 *    Set `animate` to spin continuously (e.g. on the selected card).
 * 3. While off-screen, falls back to a flat Lucide glyph (cheap DOM).
 *
 * Callers should default `animate` to `false` and only flip it true for
 * the currently focused/selected item.
 */
export function Icon3D({ type, size = 120, tint, animate = false, className }: Icon3DProps) {
  const resolvedTint = tint ?? DEFAULT_TINTS[type] ?? '#cbd5e1';
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { rootMargin: '200px' });
  const FallbackIcon = Icons[FALLBACK_2D_ICON[type]] as React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
    strokeWidth?: number;
  }>;

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {inView ? (
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 30 }}
          dpr={[1, 1.5]}
          frameloop={animate ? 'always' : 'demand'}
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          style={{ background: 'transparent' }}
        >
          {/* Three-point lighting: warm key, cool fill, gentle rim. */}
          <ambientLight intensity={0.42} />
          <directionalLight position={[3.5, 4, 4]} intensity={1.2} color="#fff5e6" />
          <directionalLight position={[-3, -1, 2]} intensity={0.45} color="#a8c5ff" />
          <directionalLight position={[0, 2, -3]} intensity={0.25} color="#ffffff" />
          <Suspense fallback={null}>
            {pickMesh(type, resolvedTint, animate)}
          </Suspense>
        </Canvas>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          {FallbackIcon && (
            <FallbackIcon
              className="w-1/2 h-1/2"
              style={{ color: resolvedTint }}
              strokeWidth={1.5}
            />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Map a FileItem-like shape onto an Icon3D type. Falls back to 'file' for
 * unknown extensions.
 */
export function resolveIcon3DType(
  file: { type?: string; mimeType?: string; name?: string; id?: string },
  parentLocationId?: string | null,
): Icon3DType {
  if (file.type === 'folder') {
    if (file.id === parentLocationId) return 'folder';
    if (file.id?.startsWith('folder-documents')) return 'folder-documents';
    if (file.id?.startsWith('folder-downloads')) return 'folder-downloads';
    if (file.id?.startsWith('folder-projects')) return 'folder-projects';
    if (file.id?.startsWith('folder-cv')) return 'folder-cv';
    if (file.id?.startsWith('folder-images')) return 'folder-images';
    if (file.id?.startsWith('folder-system')) return 'folder-system';
    if (file.id?.startsWith('folder-desktop')) return 'folder-desktop';
    if (file.id?.includes('trash')) return 'folder-trash';
    if (file.id?.includes('visitor-gallery') || file.id?.includes('gallery')) return 'folder-gallery';
    return 'folder';
  }
  if (file.type === 'image') return 'image';
  if (file.type === 'video') return 'video';
  if (file.type === 'audio') return 'audio';
  if (file.mimeType === 'application/pdf') return 'pdf';
  const ext = file.name?.split('.').pop()?.toLowerCase() ?? '';
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx', 'odt'].includes(ext)) return 'doc';
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'json', 'yml', 'yaml'].includes(ext)) return 'code';
  if (['txt', 'md', 'csv'].includes(ext)) return 'text';
  return 'file';
}
