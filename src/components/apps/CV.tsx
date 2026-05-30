import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { AppShell, AppToolbar, AppContent, AppCard, appSoftButtonClass } from '../ui/AppShell';
import { cn } from '../../lib/utils';

type Tab = 'profile' | 'experience' | 'skills' | 'contact' | 'files';

const TABS: { id: Tab; label: string; icon: keyof typeof Icons }[] = [
  { id: 'profile', label: 'Profile', icon: 'User' },
  { id: 'experience', label: 'Experience', icon: 'Briefcase' },
  { id: 'skills', label: 'Skills', icon: 'Zap' },
  { id: 'contact', label: 'Contact', icon: 'Mail' },
  { id: 'files', label: 'Files', icon: 'Paperclip' },
];

const proficiencyWidth: Record<string, string> = {
  Beginner: 'w-1/4',
  Intermediate: 'w-1/2',
  Advanced: 'w-3/4',
  Expert: 'w-full',
};

const statusColor: Record<string, string> = {
  'In Progress': 'bg-os-ink-800 text-fg-info border border-stroke-info/40',
  Completed: 'bg-success-subtle text-fg-success border border-stroke-success/40',
  Archived: 'bg-os-ink-800 text-os-text-inverse/40 border border-os-line-dark-hover',
};

export function CV() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [seedStatus, setSeedStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const { profile, seedCVProfile } = useUserStore();
  const { isAdmin } = useAuthStore();
  const { personal, social, resume, skills, preferences } = profile;
  const needsSeed = !resume.experience?.length || !skills.categories?.length;

  const handleSeedProfile = async () => {
    const shouldSeed = window.confirm('Publish the attached CV information to Firebase? The CV app will update only after Firebase accepts the write.');
    if (!shouldSeed) return;
    setIsSeeding(true);
    setSeedStatus(null);
    const result = await seedCVProfile();
    setIsSeeding(false);
    if (result.success) {
      setSeedStatus({ type: 'success', message: 'CV profile published to Firebase.' });
    } else {
      setSeedStatus({ type: 'error', message: result.error || 'Firebase rejected the CV profile write.' });
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="shrink-0 border-b border-os-line-dark px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="os-type-title-4 text-os-text-inverse/90">{personal.name || 'Your Name'}</h1>
          <p className="os-type-caption text-os-text-inverse/40">{personal.title || 'Title'} · {personal.location || 'Location'}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={handleSeedProfile}
              disabled={isSeeding}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium',
                needsSeed
                  ? 'os-interactive os-focus-ring rounded-md border border-stroke-brand/40 bg-primary-500/10 text-primary-300 hover:bg-primary-500/15'
                  : cn(appSoftButtonClass, 'rounded-md'),
                isSeeding && 'opacity-50 pointer-events-none'
              )}
            >
              {isSeeding ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icons.Database className="w-3.5 h-3.5" />}
              {isSeeding ? 'Publishing' : 'Populate CV'}
            </button>
          )}
          <button
            onClick={() => window.print()}
            className={cn(appSoftButtonClass, 'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md')}
          >
            <Icons.Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {seedStatus && (
        <div className={cn(
          'border-b px-6 py-2 text-xs',
          seedStatus.type === 'success'
            ? 'border-stroke-success/30 bg-success-subtle text-fg-success'
            : 'border-stroke-error/30 bg-error-subtle text-fg-error'
        )}>
          {seedStatus.message}
        </div>
      )}

      {/* Tabs */}
      <AppToolbar className="gap-0 px-2 overflow-x-auto">
        {TABS.map(({ id, label, icon }) => {
          const Icon = Icons[icon] as React.ComponentType<{ className?: string }>;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'os-interactive flex items-center gap-1.5 px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2',
                activeTab === id
                  ? 'border-stroke-brand text-os-text-inverse/90'
                  : 'border-transparent text-os-text-inverse/40 hover:text-os-text-inverse/70'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </AppToolbar>

      {/* Content */}
      <AppContent>
        {activeTab === 'profile' && <ProfileTab personal={personal} summary={resume.summary} />}
        {activeTab === 'experience' && <ExperienceTab resume={resume} />}
        {activeTab === 'skills' && <SkillsTab categories={skills.categories} />}
        {activeTab === 'contact' && <ContactTab personal={personal} social={social} preferences={preferences} />}
        {activeTab === 'files' && <FilesTab name={personal.name} />}
      </AppContent>
    </AppShell>
  );
}

function ProfileTab({ personal, summary }: { personal: any; summary: string }) {
  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-end gap-5 mb-6 border-b border-os-line-dark">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/generative-studio.appspot.com/o/profile%2Fcompressed__9BP5381%20(1).png?alt=media&token=96691a14-ea96-4da3-bf1c-5190b2ce8cc8"
          alt={personal.name}
          className="w-40 h-72 object-cover object-top flex-shrink-0"
        />
        <div className="pb-6">
          <h2 className="text-2xl font-bold text-white/90">{personal.name}</h2>
          <p className="text-base text-white/55 mt-0.5">{personal.title}</p>
          {personal.subtitle && <p className="text-sm text-white/35 mt-0.5">{personal.subtitle}</p>}
          <div className="flex items-center gap-1.5 mt-3 text-sm text-white/40">
            <Icons.MapPin className="w-3.5 h-3.5" />
            {personal.location}
          </div>
        </div>
      </div>

      {summary && (
        <Section title="Summary">
          <p className="text-sm text-white/60 leading-relaxed">{summary}</p>
        </Section>
      )}

      {personal.bio?.length > 0 && (
        <Section title="About">
          {personal.bio.map((paragraph: string, i: number) => (
            <p key={i} className="text-sm text-white/60 leading-relaxed mb-2 last:mb-0">{paragraph}</p>
          ))}
        </Section>
      )}
    </div>
  );
}

function ExperienceTab({ resume }: { resume: any }) {
  return (
    <div className="p-6 max-w-2xl space-y-6">
      {resume.experience?.length > 0 && (
        <Section title="Experience">
          <div className="space-y-4">
            {resume.experience.map((exp: any) => (
              <AppCard key={exp.id} className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-semibold text-white/80">{exp.position}</p>
                    <p className="text-xs text-white/50">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                  </div>
                  <span className="text-xs text-white/30 whitespace-nowrap ml-4">{exp.startDate} – {exp.endDate}</span>
                </div>
                {exp.description?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.description.map((line: string, i: number) => (
                      <li key={i} className="text-xs text-white/50 flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
                {exp.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {exp.technologies.map((tech: string) => (
                      <span key={tech} className="px-2 py-0.5 bg-os-ink-800/60 border border-os-line-dark rounded text-[10px] text-white/50">{tech}</span>
                    ))}
                  </div>
                )}
              </AppCard>
            ))}
          </div>
        </Section>
      )}

      {resume.education?.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {resume.education.map((edu: any) => (
              <AppCard key={edu.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white/80">{edu.degree} in {edu.field}</p>
                    <p className="text-xs text-white/50">{edu.institution}</p>
                  </div>
                  <span className="text-xs text-white/30 whitespace-nowrap ml-4">{edu.startDate} – {edu.endDate}</span>
                </div>
                {edu.gpa && <p className="text-xs text-white/40 mt-1">GPA: {edu.gpa}</p>}
              </AppCard>
            ))}
          </div>
        </Section>
      )}

      {resume.certifications?.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-2">
            {resume.certifications.map((cert: any) => (
              <AppCard key={cert.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white/80">{cert.name}</p>
                  <p className="text-xs text-white/50">{cert.issuer}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/30">{cert.date}</p>
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-fg-success hover:underline">View</a>
                  )}
                </div>
              </AppCard>
            ))}
          </div>
        </Section>
      )}

      {!resume.experience?.length && !resume.education?.length && !resume.certifications?.length && (
        <Empty message="No experience entries yet. Add them through Settings → Profile." />
      )}
    </div>
  );
}

function SkillsTab({ categories }: { categories: any[] }) {
  if (!categories?.length) return <div className="p-6"><Empty message="No skills added yet. Add them through Settings → Profile." /></div>;

  return (
    <div className="p-6 max-w-2xl space-y-4">
      {categories.map((cat: any) => (
        <Section key={cat.id} title={cat.name}>
          <div className="space-y-2">
            {cat.skills.map((skill: any) => (
              <div key={skill.name} className="flex items-center gap-3">
                <span className="text-xs text-white/70 w-36 truncate flex-shrink-0">{skill.name}</span>
                <div className="flex-1 h-1.5 bg-os-line-dark-hover rounded-full overflow-hidden">
                  <div className={`h-full bg-white/40 rounded-full ${proficiencyWidth[skill.proficiency]}`} />
                </div>
                <span className="text-[10px] text-white/30 w-20 text-right">{skill.proficiency}</span>
                {skill.yearsOfExperience && (
                  <span className="text-[10px] text-white/20 w-12 text-right">{skill.yearsOfExperience}yr</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

export function ProjectsTab({ projects }: { projects: any[] }) {
  if (!projects?.length) return <div className="p-6"><Empty message="No projects yet. Add them through Settings → Profile or the Admin Panel." /></div>;

  return (
    <div className="p-6 max-w-2xl space-y-3">
      <p className="text-xs text-white/30 mb-4">Selected work. Launch individual project apps from the desktop or Start Menu for the full view.</p>
      {projects.map((project: any) => (
        <AppCard key={project.id} className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {project.featured && <Icons.Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
              <p className="text-sm font-semibold text-white/80">{project.name}</p>
            </div>
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded-full font-medium',
              statusColor[project.status] || 'bg-os-ink-800/60 text-white/40 border border-os-line-dark'
            )}>
              {project.status}
            </span>
          </div>
          <p className="text-xs text-white/50 mb-2">{project.description}</p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {project.technologies.map((tech: string) => (
                <span key={tech} className="px-2 py-0.5 bg-os-ink-800/60 border border-os-line-dark rounded text-[10px] text-white/50">{tech}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            {project.links?.live && (
              <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-fg-success hover:underline">
                <Icons.ExternalLink className="w-3 h-3" /> Live
              </a>
            )}
            {project.links?.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-white/40 hover:underline">
                <Icons.Github className="w-3 h-3" /> GitHub
              </a>
            )}
          </div>
        </AppCard>
      ))}
    </div>
  );
}

function ContactTab({ personal, social, preferences }: { personal: any; social: any; preferences: any }) {
  return (
    <div className="p-6 max-w-md space-y-4">
      <Section title="Direct">
        <div className="space-y-2">
          {preferences.showEmail && personal.email && (
            <Row icon={<Icons.Mail className="w-3.5 h-3.5" />} label="Email" value={personal.email} href={`mailto:${personal.email}`} />
          )}
          {preferences.showPhone && personal.phone && (
            <Row icon={<Icons.Phone className="w-3.5 h-3.5" />} label="Phone" value={personal.phone} href={`tel:${personal.phone}`} />
          )}
          {personal.location && (
            <Row icon={<Icons.MapPin className="w-3.5 h-3.5" />} label="Location" value={personal.location} />
          )}
        </div>
      </Section>

      <Section title="Online">
        <div className="space-y-2">
          {social.github && (
            <Row icon={<Icons.Github className="w-3.5 h-3.5" />} label="GitHub" value={social.github} href={social.github} />
          )}
          {social.linkedin && (
            <Row icon={<Icons.Linkedin className="w-3.5 h-3.5" />} label="LinkedIn" value={social.linkedin} href={social.linkedin} />
          )}
          {social.twitter && (
            <Row icon={<Icons.Twitter className="w-3.5 h-3.5" />} label="Twitter" value={social.twitter} href={social.twitter} />
          )}
          {social.website && (
            <Row icon={<Icons.Globe className="w-3.5 h-3.5" />} label="Website" value={social.website} href={social.website} />
          )}
          {social.custom?.map((link: any) => (
            <Row key={link.id} icon={<Icons.Link className="w-3.5 h-3.5" />} label={link.name} value={link.url} href={link.url} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function FilesTab({ name }: { name: string }) {
  return (
    <div className="p-6 max-w-md">
      <Section title="Downloads">
        <div className="space-y-2">
          <AppCard className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <Icons.FileText className="w-4 h-4 text-white/40" />
              <div>
                <p className="text-sm font-medium text-white/70">{name || 'Resume'} — CV</p>
                <p className="text-xs text-white/30">Print or export from the Profile tab</p>
              </div>
            </div>
            <Icons.Download className="w-4 h-4 text-white/20" />
          </AppCard>
        </div>
      </Section>
      <p className="text-xs text-white/30 mt-4">Open Archive to browse portfolio assets and project files.</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="os-type-label text-white/30 mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <AppCard className="flex items-center gap-3 px-4 py-2.5">
      <span className="text-white/40">{icon}</span>
      <span className="text-xs text-white/30 w-16 flex-shrink-0">{label}</span>
      <span className="text-xs text-white/70 truncate">{value}</span>
    </AppCard>
  );

  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="os-interactive block rounded-lg">{content}</a>;
  return <div>{content}</div>;
}

function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Icons.Inbox className="w-8 h-8 text-white/10 mx-auto mb-3" />
      <p className="text-sm text-white/30">{message}</p>
    </div>
  );
}
