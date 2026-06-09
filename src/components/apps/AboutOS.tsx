import { useState, useRef } from 'react';
import * as Icons from 'lucide-react';
import { SystemRow, SystemRowGroup } from '../ui/SystemRow';
import { AppShell, AppBody, AppSidebar, AppContent } from '../ui/AppShell';
import { useDesktopStore } from '../../store/desktopStore';

const VERSION = '2.1.0';
const BUILD_DATE = '2026-05-02';

const STACK = [
  { name: 'React 18', role: 'UI framework', icon: 'Layers' },
  { name: 'TypeScript 5.5', role: 'Type safety', icon: 'FileCode' },
  { name: 'Vite 5.4', role: 'Build tool', icon: 'Zap' },
  { name: 'Tailwind CSS 3.4', role: 'Styling', icon: 'Paintbrush' },
  { name: 'Framer Motion 12', role: 'Animation', icon: 'Play' },
  { name: 'Zustand 5', role: 'State management', icon: 'Database' },
  { name: 'Firebase 11', role: 'Backend — Auth, Firestore, Storage', icon: 'Server' },
  { name: 'Lucide React', role: 'Icons', icon: 'Grid3x3' },
];

const SECTIONS = ['system', 'concept', 'keketso', 'studio', 'credits', 'build'] as const;
type Section = typeof SECTIONS[number];

const SECTION_LABELS: Record<Section, string> = {
  system: 'System',
  concept: 'Concept',
  keketso: 'Keketso',
  studio: 'Generative Studio',
  credits: 'Credits',
  build: 'Build',
};

export function AboutOS() {
  const [activeSection, setActiveSection] = useState<Section>('system');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { apps, openWindow } = useDesktopStore();

  const scrollToSection = (section: Section) => {
    setActiveSection(section);
    const el = scrollRef.current?.querySelector(`#about-${section}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openCV = () => {
    const cvApp = apps.find((app) => app.id === 'cv');
    if (cvApp) openWindow(cvApp);
  };

  const openInBrowser = (url: string) => {
    const browserApp = apps.find((app) => app.id === 'browser');
    if (!browserApp) return;
    openWindow({
      ...browserApp,
      id: `browser-${url}`,
      name: new URL(url).hostname.replace('www.', ''),
      url,
    });
  };

  return (
    <AppShell>
      <AppBody>
        {/* Side nav */}
        <AppSidebar>
          <SystemRowGroup context="chrome">About</SystemRowGroup>
          {SECTIONS.map((section) => (
            <SystemRow
              key={section}
              label={SECTION_LABELS[section]}
              context="chrome"
              selected={activeSection === section}
              accentRail={activeSection === section}
              onClick={() => scrollToSection(section)}
            />
          ))}
        </AppSidebar>

        {/* Content */}
        <AppContent>
          <div ref={scrollRef}>
            <div className="max-w-xl px-8 py-6 space-y-10">

              {/* System */}
              <section id="about-system">
                <SectionHeader icon={<Icons.Monitor className="w-4 h-4" />} title="System" />
                <div className="space-y-2">
                  <InfoRow label="Name" value="GenOS" />
                  <InfoRow label="Version" value={VERSION} />
                  <InfoRow label="Build date" value={BUILD_DATE} />
                  <InfoRow label="Type" value="Portfolio operating system" />
                  <InfoRow label="Platform" value="Browser (Progressive Web App)" />
                  <InfoRow label="Runtime" value="React + Vite, deployed via Firebase Hosting" />
                </div>

                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/48 mt-5 mb-3">Stack</p>
                <div className="space-y-1">
                  {STACK.map(({ name, role, icon }) => {
                    const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
                    return (
                      <div key={name} className="flex items-center gap-3 py-2 border-b border-os-line-dark last:border-0">
                        <Icon className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />
                        <span className="text-xs font-medium text-white/80 w-36">{name}</span>
                        <span className="text-xs text-white/60">{role}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Concept */}
              <section id="about-concept">
                <SectionHeader icon={<Icons.Lightbulb className="w-4 h-4" />} title="Concept" />
                <div className="space-y-3 text-sm text-white/75 leading-relaxed">
                  <p>
                    GenOS is not a portfolio website with desktop styling. It is a working environment where Keketso Matsuma's projects, process, tools, and design decisions can be explored through the logic of a system.
                  </p>
                  <p>
                    The desktop, windows, app model, file explorer, admin panel, theme system, motion language, and interaction patterns are all evidence of the portfolio. The operating system itself is the work.
                  </p>
                  <p>
                    Projects are launched as apps. CV, skills, and contact live together in a single tabbed surface. Archive includes a public Visitor Gallery. The Admin Panel is a publishing console, not a settings screen.
                  </p>
                  <p>
                    The goal is to make complexity legible — layered but understandable interfaces, motion that explains structure, dense UI that still scans cleanly, systems within systems.
                  </p>

                  <div className="pt-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/48 mb-3">Design Layers</p>
                    <div className="space-y-3">
                      <p>
                        The operating system form was chosen because it can hold many domains at once without flattening them. Visual design, user experience, data, storage, publishing, permissions, and app behavior all have a place to live.
                      </p>
                      <p>
                        GenOS connects fundamentals like spacing, contrast, rhythm, color theory, and accessibility with deeper systems like persistence, routing, window behavior, and infrastructure. The emotional experience comes from those layers agreeing with each other.
                      </p>
                      <p>
                        Motion is not decoration here; it explains attention. Layout is not only arrangement; it teaches where things belong. The system is built to make complexity feel touchable, understandable, and intentional.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Keketso */}
              <section id="about-keketso">
                <SectionHeader icon={<Icons.User className="w-4 h-4" />} title="Keketso" />
                <div className="space-y-3 text-sm text-white/75 leading-relaxed">
                  <p>
                    Keketso Matsuma is a software developer based in Johannesburg, South Africa. He works with React, TypeScript, and modern web platforms to build complex interactive systems.
                  </p>
                  <p>
                    His work gravitates toward dynamic interfaces, motion graphics, complicated systems, and the practice of finding internal logic in complexity and turning it into reusable patterns.
                  </p>
                  <p>
                    GenOS is the primary evidence of that approach.
                  </p>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={openCV}
                    className="os-interactive os-focus-ring flex items-center gap-1.5 px-3 py-1.5 border border-os-line-dark rounded-md text-xs text-white/70 hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:text-white"
                  >
                    <Icons.UserCheck className="w-3.5 h-3.5" />
                    Open CV
                  </button>
                  <button
                    type="button"
                    onClick={() => openInBrowser('https://github.com/MatsumaKeketso')}
                    className="os-interactive os-focus-ring flex items-center gap-1.5 px-3 py-1.5 border border-os-line-dark rounded-md text-xs text-white/70 hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:text-white"
                  >
                    <Icons.Github className="w-3.5 h-3.5" />
                    GitHub
                  </button>
                  <a
                    href="mailto:keketso@genos.dev"
                    className="os-interactive os-focus-ring flex items-center gap-1.5 px-3 py-1.5 border border-os-line-dark rounded-md text-xs text-white/70 hover:border-os-line-dark-hover hover:bg-os-ink-800 hover:text-white"
                  >
                    <Icons.Mail className="w-3.5 h-3.5" />
                    keketso@genos.dev
                  </a>
                </div>
              </section>

              {/* Generative Studio */}
              <section id="about-studio">
                <SectionHeader icon={<Icons.Cpu className="w-4 h-4" />} title="Generative Studio" />
                <div className="space-y-3 text-sm text-white/75 leading-relaxed">
                  <p>
                    GenOS was designed and built by <strong className="text-white/90">Generative Studio</strong> — a system-design practice focused on complex interactive products, motion systems, and developer tooling.
                  </p>
                  <p>
                    Generative Studio builds operating system concepts, generative interfaces, and pattern systems where the structure of the product is itself the message.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-os-ink-900 border border-os-line-dark rounded-md">
                    <Icons.Sparkles className="w-3.5 h-3.5 text-white/70" />
                    <span className="text-xs text-white/80 font-medium">Generative Studio</span>
                  </div>
                </div>
              </section>

              {/* Credits */}
              <section id="about-credits">
                <SectionHeader icon={<Icons.Heart className="w-4 h-4" />} title="Credits" />
                <div className="space-y-1">
                  {[
                    { name: 'React', note: 'UI library — Meta Open Source' },
                    { name: 'Framer Motion', note: 'Animation — Framer' },
                    { name: 'Tailwind CSS', note: 'Styling — Tailwind Labs' },
                    { name: 'Zustand', note: 'State management — pmndrs' },
                    { name: 'Firebase', note: 'Backend platform — Google' },
                    { name: 'Lucide React', note: 'Icons — Lucide contributors' },
                    { name: 'Vite', note: 'Build tool — Evan You & contributors' },
                    { name: 'Windows 11', note: 'Desktop paradigm inspiration' },
                    { name: 'macOS', note: 'Window management patterns' },
                    { name: 'Star Citizen', note: 'Sci-fi HUD aesthetic' },
                  ].map(({ name, note }) => (
                    <div key={name} className="flex items-center gap-3 py-2 border-b border-os-line-dark last:border-0">
                      <span className="text-xs font-medium text-white/80 w-36">{name}</span>
                      <span className="text-xs text-white/60">{note}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Build */}
              <section id="about-build">
                <SectionHeader icon={<Icons.Terminal className="w-4 h-4" />} title="Build" />
                <div className="space-y-2">
                  <InfoRow label="Repository" value="github.com/MatsumaKeketso/portfolio-os" />
                  <InfoRow label="Live" value="genos.dev" />
                  <InfoRow label="Hosting" value="Firebase Hosting" />
                  <InfoRow label="Auth" value="Firebase Auth — Email/Password" />
                  <InfoRow label="Database" value="Firebase Firestore — os-site_content" />
                  <InfoRow label="Storage" value="Firebase Cloud Storage — portfolio-files/" />
                  <InfoRow label="Build tool" value="Vite 5.4" />
                  <InfoRow label="Node target" value="ES2020" />
                  <InfoRow label="TypeScript" value="Strict mode, noUnusedLocals" />
                </div>
              </section>

            </div>
          </div>
        </AppContent>
      </AppBody>
    </AppShell>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-os-line-dark">
      <span className="text-white/50">{icon}</span>
      <h2 className="text-sm font-semibold text-white/80">{title}</h2>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-os-line-dark last:border-0">
      <span className="text-xs text-white/48 w-28 flex-shrink-0">{label}</span>
      <span className="text-xs text-white/70">{value}</span>
    </div>
  );
}
