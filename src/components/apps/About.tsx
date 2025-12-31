import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';

interface AboutContent {
  title: string;
  subtitle: string;
  bio1: string;
  bio2: string;
  projects: Array<{ name: string; description: string }>;
}

const defaultContent: AboutContent = {
  title: 'PortfolioOS',
  subtitle: 'Interactive Portfolio Showcase',
  bio1: 'Software Developer based in Johannesburg, South Africa. Passionate about creating innovative web applications and interactive experiences that push the boundaries of what\'s possible in the browser.',
  bio2: 'Specializing in React, TypeScript, and modern web technologies, with a focus on building intuitive user interfaces and seamless user experiences.',
  projects: [
    { name: 'NailHub Social', description: 'Social platform connecting nail artists and enthusiasts' },
    { name: 'Delegation Coach', description: 'AI-powered tool for effective task delegation' },
    { name: '3D ShapeShift', description: 'Interactive 3D modeling and visualization' }
  ]
};

export function About() {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState<AboutContent>(defaultContent);

  useEffect(() => {
    const stored = localStorage.getItem('portfolioOS_about');
    if (stored) {
      try {
        setContent(JSON.parse(stored));
      } catch (e) {
        setContent(defaultContent);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('portfolioOS_about', JSON.stringify(content));
    setIsEditing(false);
  };

  const handleCancel = () => {
    const stored = localStorage.getItem('portfolioOS_about');
    if (stored) {
      setContent(JSON.parse(stored));
    } else {
      setContent(defaultContent);
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 p-8 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        {/* Edit Controls */}
        <div className="flex justify-end mb-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
            >
              <Icons.Edit2 className="w-4 h-4" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
              >
                <Icons.Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
              >
                <Icons.X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Icons.Code2 className="w-16 h-16 text-white" />
          </div>
          {isEditing ? (
            <>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="text-4xl font-bold text-white mb-2 bg-white/10 border border-white/20 rounded px-4 py-2 w-full text-center"
              />
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                className="text-slate-300 text-lg bg-white/10 border border-white/20 rounded px-4 py-2 w-full text-center"
              />
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white mb-2">{content.title}</h1>
              <p className="text-slate-300 text-lg">{content.subtitle}</p>
            </>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Icons.User className="w-6 h-6" />
            About the Developer
          </h2>
          {isEditing ? (
            <>
              <textarea
                value={content.bio1}
                onChange={(e) => setContent({ ...content, bio1: e.target.value })}
                className="text-slate-200 leading-relaxed mb-4 bg-white/10 border border-white/20 rounded px-4 py-2 w-full min-h-[100px]"
                rows={3}
              />
              <textarea
                value={content.bio2}
                onChange={(e) => setContent({ ...content, bio2: e.target.value })}
                className="text-slate-200 leading-relaxed bg-white/10 border border-white/20 rounded px-4 py-2 w-full min-h-[100px]"
                rows={3}
              />
            </>
          ) : (
            <>
              <p className="text-slate-200 leading-relaxed mb-4">{content.bio1}</p>
              <p className="text-slate-200 leading-relaxed">{content.bio2}</p>
            </>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Icons.Briefcase className="w-6 h-6" />
            Featured Projects
          </h2>
          <div className="space-y-3">
            {content.projects.map((project, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => {
                        const newProjects = [...content.projects];
                        newProjects[index].name = e.target.value;
                        setContent({ ...content, projects: newProjects });
                      }}
                      className="text-lg font-semibold text-white mb-2 bg-white/10 border border-white/20 rounded px-3 py-1 w-full"
                    />
                    <textarea
                      value={project.description}
                      onChange={(e) => {
                        const newProjects = [...content.projects];
                        newProjects[index].description = e.target.value;
                        setContent({ ...content, projects: newProjects });
                      }}
                      className="text-slate-300 text-sm bg-white/10 border border-white/20 rounded px-3 py-1 w-full"
                      rows={2}
                    />
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-semibold text-white mb-1">{project.name}</h3>
                    <p className="text-slate-300 text-sm">{project.description}</p>
                  </>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={() => {
                  setContent({
                    ...content,
                    projects: [...content.projects, { name: 'New Project', description: 'Project description' }]
                  });
                }}
                className="w-full bg-white/5 hover:bg-white/10 rounded-lg p-4 text-white border-2 border-dashed border-white/20 transition-all"
              >
                <Icons.Plus className="w-5 h-5 inline mr-2" />
                Add Project
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
            <Icons.Link className="w-6 h-6" />
            Connect
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
              <Icons.Github className="w-6 h-6 text-white" />
              <span className="text-white font-medium">GitHub</span>
            </a>
            <a
              href="https://base44.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
              <Icons.Rocket className="w-6 h-6 text-white" />
              <span className="text-white font-medium">Base44</span>
            </a>
            <a
              href="https://www.udemy.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
              <Icons.GraduationCap className="w-6 h-6 text-white" />
              <span className="text-white font-medium">Udemy</span>
            </a>
            <a
              href="https://www.nailhub.co.za"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white/5 hover:bg-white/10 rounded-lg p-4 transition-all"
            >
              <Icons.Heart className="w-6 h-6 text-white" />
              <span className="text-white font-medium">NailHub</span>
            </a>
          </div>
        </div>

        <div className="text-center mt-8 text-slate-400 text-sm">
          <p>Version 1.0.0 • Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
