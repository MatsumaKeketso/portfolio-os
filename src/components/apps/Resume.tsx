import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useDesktopStore } from '../../store/desktopStore';
import { Button } from '../ui/button';
import { AppShell } from '../ui/AppShell';

type TemplateType = 'classic' | 'modern' | 'minimalist';

export function Resume() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
  const { profile } = useUserStore();
  const { isAdmin } = useAuthStore();
  const { openWindow, apps } = useDesktopStore();

  const openAboutApp = () => {
    const aboutApp = apps.find(app => app.id === 'about');
    if (aboutApp) {
      openWindow(aboutApp);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const getDateRange = (startDate: string, endDate: string | 'Present') => {
    const start = formatDate(startDate);
    const end = endDate === 'Present' ? 'Present' : formatDate(endDate);
    return `${start} - ${end}`;
  };

  // Template Components
  const ClassicTemplate = () => (
    <div className="max-w-4xl mx-auto bg-white text-gray-900 p-12 shadow-lg print:shadow-none">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
        <h1 className="text-4xl font-bold mb-2">{profile.personal.name}</h1>
        <h2 className="text-xl text-gray-600 mb-3">{profile.personal.title}</h2>
        <div className="flex justify-center gap-4 text-sm text-gray-600">
          {profile.preferences.showEmail && profile.personal.email && (
            <span>{profile.personal.email}</span>
          )}
          {profile.preferences.showPhone && profile.personal.phone && (
            <span>{profile.personal.phone}</span>
          )}
          {profile.personal.location && <span>{profile.personal.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {profile.resume.summary && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-2 uppercase">Professional Summary</h3>
          <p className="text-gray-700 leading-relaxed">{profile.resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {profile.resume.experience.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 uppercase">Experience</h3>
          {profile.resume.experience.map((exp) => (
            <div key={exp.id} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h4 className="font-bold">{exp.position}</h4>
                <span className="text-sm text-gray-600">
                  {getDateRange(exp.startDate, exp.endDate)}
                </span>
              </div>
              <p className="text-gray-700 italic">{exp.company}{exp.location && ` - ${exp.location}`}</p>
              {exp.description.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-gray-700">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              )}
              {exp.technologies.length > 0 && (
                <p className="text-gray-600 text-sm mt-1">
                  <strong>Technologies:</strong> {exp.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {profile.resume.education.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 uppercase">Education</h3>
          {profile.resume.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h4 className="font-bold">{edu.degree} in {edu.field}</h4>
                <span className="text-sm text-gray-600">
                  {getDateRange(edu.startDate, edu.endDate)}
                </span>
              </div>
              <p className="text-gray-700 italic">{edu.institution}</p>
              {edu.gpa && <p className="text-gray-600 text-sm">GPA: {edu.gpa}</p>}
              {edu.achievements.length > 0 && (
                <ul className="list-disc list-inside mt-1 text-gray-700 text-sm">
                  {edu.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {profile.skills.categories.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 uppercase">Skills</h3>
          {profile.skills.categories.map((category) => (
            <div key={category.id} className="mb-2">
              <span className="font-semibold">{category.name}: </span>
              <span className="text-gray-700">
                {category.skills.map(s => s.name).join(', ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {profile.resume.certifications.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-3 uppercase">Certifications</h3>
          {profile.resume.certifications.map((cert) => (
            <div key={cert.id} className="mb-2">
              <span className="font-bold">{cert.name}</span>
              <span className="text-gray-600"> - {cert.issuer}, {formatDate(cert.date)}</span>
              {cert.credentialId && (
                <span className="text-gray-500 text-sm"> (ID: {cert.credentialId})</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ModernTemplate = () => (
    <div className="max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 p-12 shadow-lg print:shadow-none print:bg-white">
      {/* Header with accent */}
      <div className="bg-gradient-to-r from-primary-600 to-tertiary-600 text-white p-8 rounded-lg mb-6 print:bg-gray-800">
        <h1 className="text-4xl font-bold mb-2">{profile.personal.name}</h1>
        <h2 className="text-xl mb-3">{profile.personal.title}</h2>
        <div className="flex gap-4 text-sm">
          {profile.preferences.showEmail && profile.personal.email && (
            <div className="flex items-center gap-1">
              <Icons.Mail className="w-4 h-4" />
              <span>{profile.personal.email}</span>
            </div>
          )}
          {profile.preferences.showPhone && profile.personal.phone && (
            <div className="flex items-center gap-1">
              <Icons.Phone className="w-4 h-4" />
              <span>{profile.personal.phone}</span>
            </div>
          )}
          {profile.personal.location && (
            <div className="flex items-center gap-1">
              <Icons.MapPin className="w-4 h-4" />
              <span>{profile.personal.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {profile.resume.summary && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm print:shadow-none">
          <h3 className="text-lg font-bold mb-3 text-primary-600 flex items-center gap-2">
            <Icons.User className="w-5 h-5" />
            Professional Summary
          </h3>
          <p className="text-gray-700 leading-relaxed">{profile.resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {profile.resume.experience.length > 0 && (
        <div className="mb-6 bg-white p-6 rounded-lg shadow-sm print:shadow-none">
          <h3 className="text-lg font-bold mb-4 text-primary-600 flex items-center gap-2">
            <Icons.Briefcase className="w-5 h-5" />
            Experience
          </h3>
          {profile.resume.experience.map((exp, index) => (
            <div key={exp.id} className={index > 0 ? 'mt-4 pt-4 border-t' : ''}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-lg">{exp.position}</h4>
                  <p className="text-gray-700 font-medium">{exp.company}</p>
                  {exp.location && <p className="text-gray-600 text-sm">{exp.location}</p>}
                </div>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded print:bg-gray-200">
                  {getDateRange(exp.startDate, exp.endDate)}
                </span>
              </div>
              {exp.description.length > 0 && (
                <ul className="list-disc list-inside mt-2 text-gray-700 leading-relaxed">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              )}
              {exp.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {exp.technologies.map((tech, i) => (
                    <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs print:bg-gray-200 print:text-gray-800">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education & Certifications in Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Education */}
        {profile.resume.education.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
            <h3 className="text-lg font-bold mb-4 text-primary-600 flex items-center gap-2">
              <Icons.GraduationCap className="w-5 h-5" />
              Education
            </h3>
            {profile.resume.education.map((edu) => (
              <div key={edu.id} className="mb-3">
                <h4 className="font-bold">{edu.degree} in {edu.field}</h4>
                <p className="text-gray-600 text-sm">{edu.institution}</p>
                <p className="text-gray-500 text-xs">{getDateRange(edu.startDate, edu.endDate)}</p>
                {edu.gpa && <p className="text-gray-600 text-xs mt-1">GPA: {edu.gpa}</p>}
              </div>
            ))}
          </div>
        )}

        {/* Certifications */}
        {profile.resume.certifications.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
            <h3 className="text-lg font-bold mb-4 text-primary-600 flex items-center gap-2">
              <Icons.Award className="w-5 h-5" />
              Certifications
            </h3>
            {profile.resume.certifications.map((cert) => (
              <div key={cert.id} className="mb-3">
                <h4 className="font-bold">{cert.name}</h4>
                <p className="text-gray-600 text-sm">{cert.issuer}</p>
                <p className="text-gray-500 text-xs">{formatDate(cert.date)}</p>
                {cert.credentialId && <p className="text-gray-500 text-xs">ID: {cert.credentialId}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills */}
      {profile.skills.categories.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm print:shadow-none">
          <h3 className="text-lg font-bold mb-4 text-primary-600 flex items-center gap-2">
            <Icons.Zap className="w-5 h-5" />
            Skills
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {profile.skills.categories.map((category) => (
              <div key={category.id}>
                <h4 className="font-semibold mb-2">{category.name}</h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm print:bg-gray-200 print:text-gray-800"
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const MinimalistTemplate = () => (
    <div className="max-w-3xl mx-auto bg-white text-gray-900 p-12 print:p-8">
      {/* Header - Ultra Clean */}
      <div className="mb-8">
        <h1 className="text-5xl font-light mb-1">{profile.personal.name}</h1>
        <div className="w-16 h-0.5 bg-black/30 mb-3"></div>
        <h2 className="text-lg text-gray-600 font-light mb-4">{profile.personal.title}</h2>
        <div className="flex gap-3 text-xs text-gray-600">
          {profile.preferences.showEmail && profile.personal.email && (
            <span>{profile.personal.email}</span>
          )}
          {profile.preferences.showPhone && profile.personal.phone && (
            <span>{profile.personal.phone}</span>
          )}
          {profile.personal.location && <span>{profile.personal.location}</span>}
        </div>
      </div>

      {/* Summary */}
      {profile.resume.summary && (
        <div className="mb-8">
          <p className="text-gray-700 leading-relaxed font-light">{profile.resume.summary}</p>
        </div>
      )}

      {/* Experience */}
      {profile.resume.experience.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Experience</h3>
          {profile.resume.experience.map((exp, index) => (
            <div key={exp.id} className={index > 0 ? 'mt-5' : ''}>
              <div className="flex justify-between items-baseline mb-1">
                <h4 className="font-medium">{exp.position}</h4>
                <span className="text-xs text-gray-500">
                  {getDateRange(exp.startDate, exp.endDate)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{exp.company}{exp.location && ` Â· ${exp.location}`}</p>
              {exp.description.length > 0 && (
                <ul className="list-disc list-inside text-sm text-gray-700 font-light leading-relaxed space-y-1">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {profile.resume.education.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Education</h3>
          {profile.resume.education.map((edu) => (
            <div key={edu.id} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h4 className="font-medium">{edu.degree} Â· {edu.field}</h4>
                <span className="text-xs text-gray-500">{getDateRange(edu.startDate, edu.endDate)}</span>
              </div>
              <p className="text-sm text-gray-600">{edu.institution}</p>
              {edu.gpa && <p className="text-xs text-gray-500 mt-1">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {profile.skills.categories.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Skills</h3>
          {profile.skills.categories.map((category) => (
            <div key={category.id} className="mb-2">
              <span className="text-sm font-medium">{category.name}: </span>
              <span className="text-sm text-gray-700 font-light">
                {category.skills.map(s => s.name).join(' Â· ')}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {profile.resume.certifications.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Certifications</h3>
          {profile.resume.certifications.map((cert) => (
            <div key={cert.id} className="mb-2">
              <span className="text-sm font-medium">{cert.name}</span>
              <span className="text-sm text-gray-600 font-light"> Â· {cert.issuer} Â· {formatDate(cert.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTemplate = () => {
    switch (selectedTemplate) {
      case 'classic':
        return <ClassicTemplate />;
      case 'modern':
        return <ModernTemplate />;
      case 'minimalist':
        return <MinimalistTemplate />;
      default:
        return <ModernTemplate />;
    }
  };

  return (
    <>
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .resume-print-area,
          .resume-print-area * {
            visibility: visible;
          }
          .resume-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <AppShell className="bg-os-ink-950/50">
        {/* Header with Controls */}
        <div className="px-6 py-4 border-b border-os-line-dark no-print">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Icons.FileText className="w-6 h-6" />
                Resume
              </h1>
              <p className="text-white/40 text-sm mt-1">Professional CV and resume</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Template Selector */}
              <div className="flex items-center gap-2">
                <label className="text-white text-sm">Template:</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value as TemplateType)}
                  className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-1.5 text-white text-sm"
                >
                  <option value="modern" className="bg-black/30">Modern</option>
                  <option value="classic" className="bg-black/30">Classic</option>
                  <option value="minimalist" className="bg-black/30">Minimalist</option>
                </select>
              </div>

              {isAdmin && (
                <Button variant="secondary" size="sm" onClick={openAboutApp}>
                  <Icons.Edit className="w-4 h-4 mr-2" />
                  Edit Resume
                </Button>
              )}

              <Button variant="primary" size="sm" onClick={handlePrint}>
                <Icons.Printer className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Resume Content */}
        <div className="flex-1 overflow-y-auto p-8 resume-print-area">
          {renderTemplate()}
        </div>
      </AppShell>
    </>
  );
}
