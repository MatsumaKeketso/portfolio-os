import { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useDesktopStore } from '../../store/desktopStore';
import { Button } from '../ui/button';
import { Project } from '../../store/userStore';
import { AppShell } from '../ui/AppShell';

type ViewMode = 'grid' | 'list';

export function Portfolio() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTechnology, setFilterTechnology] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { profile } = useUserStore();
  const { isAdmin } = useAuthStore();
  const { openWindow, apps } = useDesktopStore();

  const openAboutApp = () => {
    const aboutApp = apps.find(app => app.id === 'about');
    if (aboutApp) {
      openWindow(aboutApp);
    }
  };

  // Get all unique technologies from projects
  const allTechnologies = useMemo(() => {
    const techs = new Set<string>();
    profile.projects.forEach(project => {
      project.technologies.forEach(tech => techs.add(tech));
    });
    return Array.from(techs).sort();
  }, [profile.projects]);

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return profile.projects.filter(project => {
      // Search filter
      const matchesSearch = searchQuery === '' ||
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = filterStatus === 'all' || project.status === filterStatus;

      // Technology filter
      const matchesTechnology = filterTechnology === 'all' ||
        project.technologies.includes(filterTechnology);

      // Featured filter
      const matchesFeatured = !showFeaturedOnly || project.featured;

      return matchesSearch && matchesStatus && matchesTechnology && matchesFeatured;
    });
  }, [profile.projects, searchQuery, filterStatus, filterTechnology, showFeaturedOnly]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setCurrentImageIndex(0);
  };

  const closeModal = () => {
    setSelectedProject(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProject && selectedProject.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProject.images.length);
    }
  };

  const prevImage = () => {
    if (selectedProject && selectedProject.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProject.images.length - 1 : prev - 1
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress':
        return 'bg-warning-subtle text-fg-warning border-stroke-warning/40';
      case 'Completed':
        return 'bg-success-subtle text-fg-success border-stroke-success/40';
      case 'Archived':
        return 'bg-os-ink-800/80 text-white/40 border-os-line-dark-hover';
      default:
        return 'bg-primary-500/20 text-primary-400 border-primary-500/30';
    }
  };

  const ProjectCard = ({ project }: { project: Project }) => (
    <div
      onClick={() => handleProjectClick(project)}
      className="bg-black/30 rounded p-5 border border-os-line-dark hover:border-primary-500/50 transition-all cursor-pointer group"
    >
      {/* Project Image */}
      {project.images.length > 0 && (
        <div className="w-full h-40 bg-os-ink-800/60 rounded-lg mb-4 overflow-hidden">
          <img
            src={project.images[0]}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}

      {/* Project Info */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-white font-semibold text-lg flex items-center gap-2">
          {project.name}
          {project.featured && <Icons.Star className="w-4 h-4 text-fg-warning fill-current" />}
        </h3>
        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(project.status)}`}>
          {project.status}
        </span>
      </div>

      <p className="text-white/60 text-sm mb-3 line-clamp-2">{project.description}</p>

      {/* Technologies */}
      {project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {project.technologies.slice(0, 3).map((tech: string, index: number) => (
            <span
              key={index}
              className="bg-primary-500/20 text-primary-300 text-xs px-2 py-0.5 rounded"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 3 && (
            <span className="text-white/40 text-xs px-2 py-0.5">
              +{project.technologies.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Links */}
      <div className="flex gap-2">
        {project.links.live && (
          <Icons.ExternalLink className="w-4 h-4 text-white/40" />
        )}
        {project.links.github && (
          <Icons.Github className="w-4 h-4 text-white/40" />
        )}
        {project.links.demo && (
          <Icons.Play className="w-4 h-4 text-white/40" />
        )}
      </div>
    </div>
  );

  const ProjectListItem = ({ project }: { project: Project }) => (
    <div
      onClick={() => handleProjectClick(project)}
      className="bg-black/30 rounded p-4 border border-os-line-dark hover:border-primary-500/50 transition-all cursor-pointer group flex gap-4"
    >
      {/* Thumbnail */}
      {project.images.length > 0 && (
        <div className="w-24 h-24 bg-os-ink-800/60 rounded-lg overflow-hidden flex-shrink-0">
          <img
            src={project.images[0]}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            {project.name}
            {project.featured && <Icons.Star className="w-4 h-4 text-fg-warning fill-current" />}
          </h3>
          <span className={`text-xs px-2 py-1 rounded border whitespace-nowrap ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>

        <p className="text-white/60 text-sm mb-2">{project.description}</p>

        {/* Technologies */}
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.technologies.map((tech: string, index: number) => (
              <span
                key={index}
                className="bg-primary-500/20 text-primary-300 text-xs px-2 py-0.5 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Links */}
      <div className="flex flex-col gap-2 items-end justify-center">
        {project.links.live && (
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Icons.ExternalLink className="w-4 h-4" />
            <span>Live</span>
          </div>
        )}
        {project.links.github && (
          <div className="flex items-center gap-1 text-white/40 text-xs">
            <Icons.Github className="w-4 h-4" />
            <span>Code</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppShell className="bg-os-ink-950/50">
      {/* Header */}
      <div className="px-6 py-4 border-b border-os-line-dark">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Icons.Briefcase className="w-6 h-6" />
              Portfolio
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
            </p>
          </div>

          {isAdmin && (
            <Button variant="secondary" size="sm" onClick={openAboutApp}>
              <Icons.Edit className="w-4 h-4 mr-2" />
              Edit Projects
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-3 border-b border-os-line-dark bg-os-ink-800/40">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-9 py-1.5 text-white text-sm placeholder-white/30"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-1.5 text-white text-sm"
          >
            <option value="all" className="bg-black/30">All Status</option>
            <option value="In Progress" className="bg-black/30">In Progress</option>
            <option value="Completed" className="bg-black/30">Completed</option>
            <option value="Archived" className="bg-black/30">Archived</option>
          </select>

          {/* Technology Filter */}
          <select
            value={filterTechnology}
            onChange={(e) => setFilterTechnology(e.target.value)}
            className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-1.5 text-white text-sm"
          >
            <option value="all" className="bg-black/30">All Technologies</option>
            {allTechnologies.map((tech) => (
              <option key={tech} value={tech} className="bg-black/30">{tech}</option>
            ))}
          </select>

          {/* Featured Toggle */}
          <label className="flex items-center gap-2 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={showFeaturedOnly}
              onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              className="w-4 h-4"
            />
            <Icons.Star className="w-4 h-4 text-fg-warning" />
            <span className="text-white text-sm">Featured Only</span>
          </label>

          {/* View Toggle */}
          <div className="flex gap-1 bg-os-ink-800/60 rounded p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <Icons.Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-white/40 hover:text-white'}`}
            >
              <Icons.List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icons.FolderOpen className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
            <p className="text-white/40 mb-4">
              {searchQuery || filterStatus !== 'all' || filterTechnology !== 'all' || showFeaturedOnly
                ? 'Try adjusting your filters'
                : 'Start by adding your first project'}
            </p>
            <Button variant="primary" size="sm" onClick={openAboutApp}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {filteredProjects.map((project) => (
              <ProjectListItem key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50"
          onClick={closeModal}
        >
          <div
            className="max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-1 bg-black/50 rounded border border-os-line-dark overflow-hidden flex flex-col shadow-os-window">
              {/* Modal Header - Fixed */}
              <div className="shrink-0 px-6 py-4 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {selectedProject.name}
                  {selectedProject.featured && (
                    <Icons.Star className="w-5 h-5 text-fg-warning fill-current" />
                  )}
                </h2>
                <span className={`inline-block text-xs px-2 py-1 rounded border mt-2 ${getStatusColor(selectedProject.status)}`}>
                  {selectedProject.status}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="text-white/40 hover:text-white transition-colors p-1 hover:bg-os-ink-800/80 rounded"
              >
                <Icons.X className="w-6 h-6" />
              </button>
            </div>
            </div>

            <div className="h-px bg-os-ink-800/70" />

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Image Carousel */}
              {selectedProject.images.length > 0 && (
                <div className="mb-6 relative">
                  <div className="w-full h-96 bg-black/50 rounded-lg overflow-hidden">
                    <img
                      src={selectedProject.images[currentImageIndex]}
                      alt={`${selectedProject.name} screenshot ${currentImageIndex + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {selectedProject.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <Icons.ChevronLeft className="w-6 h-6" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                      >
                        <Icons.ChevronRight className="w-6 h-6" />
                      </button>

                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {selectedProject.images.map((_: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-white/60 leading-relaxed">{selectedProject.description}</p>
              </div>

              {/* Technologies */}
              {selectedProject.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech: string, index: number) => (
                      <span
                        key={index}
                        className="bg-primary-500/20 text-primary-300 px-3 py-1.5 rounded-lg border border-stroke-brand/40"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {(selectedProject.links.live || selectedProject.links.github || selectedProject.links.demo) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Links</h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedProject.links.live && (
                      <a
                        href={selectedProject.links.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-os-ink-800/60 hover:bg-os-ink-700/80 text-white px-4 py-2 rounded-lg border border-os-line-dark-hover transition-all"
                      >
                        <Icons.ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    )}
                    {selectedProject.links.github && (
                      <a
                        href={selectedProject.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-os-ink-800/60 hover:bg-os-ink-700/80 text-white px-4 py-2 rounded-lg border border-os-line-dark-hover transition-all"
                      >
                        <Icons.Github className="w-4 h-4" />
                        Source Code
                      </a>
                    )}
                    {selectedProject.links.demo && (
                      <a
                        href={selectedProject.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-os-ink-800/60 hover:bg-os-ink-700/80 text-white px-4 py-2 rounded-lg border border-os-line-dark-hover transition-all"
                      >
                        <Icons.Play className="w-4 h-4" />
                        Video Demo
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
