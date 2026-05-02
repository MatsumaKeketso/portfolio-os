import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useUserStore } from '../../store/userStore';

type Tab = 'profile' | 'experience' | 'skills' | 'projects' | 'contact' | 'files';

const TABS: { id: Tab; label: string; icon: keyof typeof Icons }[] = [
  { id: 'profile', label: 'Profile', icon: 'User' },
  { id: 'experience', label: 'Experience', icon: 'Briefcase' },
  { id: 'skills', label: 'Skills', icon: 'Zap' },
  { id: 'projects', label: 'Projects', icon: 'FolderOpen' },
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
  'In Progress': 'bg-blue-100 text-blue-700',
  Completed: 'bg-green-100 text-green-700',
  Archived: 'bg-gray-100 text-gray-500',
};

export function CV() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { profile } = useUserStore();
  const { personal, social, resume, skills, projects, preferences } = profile;

  return (
    <div className="flex flex-col h-full bg-os-canvas text-os-text-strong">
      {/* Header */}
      <div className="border-b border-os-line-light px-6 py-4 flex items-center justify-between bg-os-canvas-raised">
        <div>
          <h1 className="text-base font-semibold text-os-text-strong">{personal.name || 'Your Name'}</h1>
          <p className="text-xs text-os-text-muted">{personal.title || 'Title'} · {personal.location || 'Location'}</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-os-line-light rounded-md text-os-text-strong hover:bg-os-canvas-warm transition-colors"
        >
          <Icons.Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-os-line-light bg-white px-4 overflow-x-auto">
        {TABS.map(({ id, label, icon }) => {
          const Icon = Icons[icon] as React.ComponentType<{ className?: string }>;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-os-ink-950 text-os-ink-950'
                  : 'border-transparent text-os-text-muted hover:text-os-text-strong'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'profile' && <ProfileTab personal={personal} summary={resume.summary} />}
        {activeTab === 'experience' && <ExperienceTab resume={resume} />}
        {activeTab === 'skills' && <SkillsTab categories={skills.categories} />}
        {activeTab === 'projects' && <ProjectsTab projects={projects} />}
        {activeTab === 'contact' && <ContactTab personal={personal} social={social} preferences={preferences} />}
        {activeTab === 'files' && <FilesTab name={personal.name} />}
      </div>
    </div>
  );
}

function ProfileTab({ personal, summary }: { personal: any; summary: string }) {
  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-start gap-5 mb-6">
        {personal.photo ? (
          <img src={personal.photo} alt={personal.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-os-line-light" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-os-canvas-warm border border-os-line-light flex items-center justify-center flex-shrink-0">
            <Icons.User className="w-7 h-7 text-os-text-faint" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-os-text-strong">{personal.name}</h2>
          <p className="text-sm text-os-text-muted">{personal.title}</p>
          {personal.subtitle && <p className="text-xs text-os-text-faint mt-0.5">{personal.subtitle}</p>}
          <div className="flex items-center gap-1 mt-2 text-xs text-os-text-muted">
            <Icons.MapPin className="w-3 h-3" />
            {personal.location}
          </div>
        </div>
      </div>

      {summary && (
        <Section title="Summary">
          <p className="text-sm text-[#444] leading-relaxed">{summary}</p>
        </Section>
      )}

      {personal.bio?.length > 0 && (
        <Section title="About">
          {personal.bio.map((paragraph: string, i: number) => (
            <p key={i} className="text-sm text-[#444] leading-relaxed mb-2 last:mb-0">{paragraph}</p>
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
              <div key={exp.id} className="border border-os-line-light rounded-lg p-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-semibold text-os-text-strong">{exp.position}</p>
                    <p className="text-xs text-os-text-muted">{exp.company}{exp.location ? ` · ${exp.location}` : ''}</p>
                  </div>
                  <span className="text-xs text-os-text-faint whitespace-nowrap ml-4">{exp.startDate} – {exp.endDate}</span>
                </div>
                {exp.description?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {exp.description.map((line: string, i: number) => (
                      <li key={i} className="text-xs text-[#555] flex items-start gap-2">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[#bbb] flex-shrink-0" />
                        {line}
                      </li>
                    ))}
                  </ul>
                )}
                {exp.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {exp.technologies.map((tech: string) => (
                      <span key={tech} className="px-2 py-0.5 bg-os-canvas-warm border border-os-line-light rounded text-[10px] text-[#555]">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.education?.length > 0 && (
        <Section title="Education">
          <div className="space-y-3">
            {resume.education.map((edu: any) => (
              <div key={edu.id} className="border border-os-line-light rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-os-text-strong">{edu.degree} in {edu.field}</p>
                    <p className="text-xs text-os-text-muted">{edu.institution}</p>
                  </div>
                  <span className="text-xs text-os-text-faint whitespace-nowrap ml-4">{edu.startDate} – {edu.endDate}</span>
                </div>
                {edu.gpa && <p className="text-xs text-os-text-muted mt-1">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {resume.certifications?.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-2">
            {resume.certifications.map((cert: any) => (
              <div key={cert.id} className="flex items-center justify-between border border-os-line-light rounded-lg px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-os-text-strong">{cert.name}</p>
                  <p className="text-xs text-os-text-muted">{cert.issuer}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-os-text-faint">{cert.date}</p>
                  {cert.url && (
                    <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-600 hover:underline">View</a>
                  )}
                </div>
              </div>
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
                <span className="text-xs text-os-text-strong w-36 truncate flex-shrink-0">{skill.name}</span>
                <div className="flex-1 h-1.5 bg-[#f0f0ee] rounded-full overflow-hidden">
                  <div className={`h-full bg-os-ink-950 rounded-full ${proficiencyWidth[skill.proficiency]}`} />
                </div>
                <span className="text-[10px] text-os-text-faint w-20 text-right">{skill.proficiency}</span>
                {skill.yearsOfExperience && (
                  <span className="text-[10px] text-[#bbb] w-12 text-right">{skill.yearsOfExperience}yr</span>
                )}
              </div>
            ))}
          </div>
        </Section>
      ))}
    </div>
  );
}

function ProjectsTab({ projects }: { projects: any[] }) {
  if (!projects?.length) return <div className="p-6"><Empty message="No projects yet. Add them through Settings → Profile or the Admin Panel." /></div>;

  return (
    <div className="p-6 max-w-2xl space-y-3">
      <p className="text-xs text-os-text-faint mb-4">Selected work. Launch individual project apps from the desktop or Start Menu for the full view.</p>
      {projects.map((project: any) => (
        <div key={project.id} className="border border-os-line-light rounded-lg p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              {project.featured && <Icons.Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
              <p className="text-sm font-semibold text-os-text-strong">{project.name}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[project.status] || 'bg-gray-100 text-gray-500'}`}>
              {project.status}
            </span>
          </div>
          <p className="text-xs text-[#555] mb-2">{project.description}</p>
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {project.technologies.map((tech: string) => (
                <span key={tech} className="px-2 py-0.5 bg-os-canvas-warm border border-os-line-light rounded text-[10px] text-[#555]">{tech}</span>
              ))}
            </div>
          )}
          <div className="flex items-center gap-3 mt-2">
            {project.links?.live && (
              <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-emerald-600 hover:underline">
                <Icons.ExternalLink className="w-3 h-3" /> Live
              </a>
            )}
            {project.links?.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-[#555] hover:underline">
                <Icons.Github className="w-3 h-3" /> GitHub
              </a>
            )}
          </div>
        </div>
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
          <div className="flex items-center justify-between border border-os-line-light rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Icons.FileText className="w-4 h-4 text-os-text-muted" />
              <div>
                <p className="text-sm font-medium text-os-text-strong">{name || 'Resume'} — CV</p>
                <p className="text-xs text-os-text-faint">Print or export from the Profile tab</p>
              </div>
            </div>
            <Icons.Download className="w-4 h-4 text-[#bbb]" />
          </div>
        </div>
      </Section>
      <p className="text-xs text-os-text-faint mt-4">Open File Explorer to browse portfolio assets and project files.</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase tracking-wider text-os-text-faint mb-3">{title}</h3>
      {children}
    </div>
  );
}

function Row({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  const content = (
    <div className="flex items-center gap-3 px-4 py-2.5 border border-os-line-light rounded-lg">
      <span className="text-os-text-muted">{icon}</span>
      <span className="text-xs text-os-text-faint w-16 flex-shrink-0">{label}</span>
      <span className="text-xs text-os-text-strong truncate">{value}</span>
    </div>
  );

  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:bg-os-canvas-raised transition-colors rounded-lg">{content}</a>;
  return <div>{content}</div>;
}

function Empty({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Icons.Inbox className="w-8 h-8 text-[#ddd] mx-auto mb-3" />
      <p className="text-sm text-os-text-faint">{message}</p>
    </div>
  );
}
