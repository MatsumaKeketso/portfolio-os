import { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useUserStore, UserProfile } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/button';
import { compressImage, validateImageFile } from '../../lib/imageUtils';
import { AppShell } from '../ui/AppShell';

type TabType = 'overview' | 'experience' | 'projects' | 'skills' | 'contact';

export function About() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const { isAdmin } = useAuthStore();
  const {
    profile,
    isLoading,
    error,
    updatePersonal,
    updateSocial,
    updateProject,
    addProject,
    removeProject,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addCertification,
    updateCertification,
    removeCertification,
    updateResumeSummary,
    addSkillCategory,
    updateSkillCategory,
    removeSkillCategory,
    updatePreferences
  } = useUserStore();

  // Local state for form editing (to allow cancel)
  const [editForm, setEditForm] = useState({
    personal: { ...profile.personal },
    social: { ...profile.social },
    projects: [...profile.projects],
    experience: [...profile.resume.experience],
    education: [...profile.resume.education],
    certifications: [...profile.resume.certifications],
    summary: profile.resume.summary,
    skills: JSON.parse(JSON.stringify(profile.skills)),
    preferences: { ...profile.preferences }
  });

  // Effect to update local form state when profile changes (if not editing)
  // This ensures that if data arrives late (after loading), the form is ready to edit with fresh data
  useEffect(() => {
    if (!isEditing) {
      setEditForm({
        personal: { ...profile.personal },
        social: { ...profile.social },
        projects: [...profile.projects],
        experience: [...profile.resume.experience],
        education: [...profile.resume.education],
        certifications: [...profile.resume.certifications],
        summary: profile.resume.summary,
        skills: JSON.parse(JSON.stringify(profile.skills)),
        preferences: { ...profile.preferences }
      });
    }
  }, [profile, isEditing]);

  if (isLoading) {
    return (
      <div className="w-full h-full bg-black/50 flex items-center justify-center">
        <Icons.Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <span className="ml-3 text-white font-medium">Loading profile...</span>
      </div>
    );
  }



  const handleSave = () => {
    // Save based on active tab
    switch (activeTab) {
      case 'overview':
        updatePersonal(editForm.personal);
        updateSocial(editForm.social);
        break;
      case 'projects':
        // Handle project updates
        profile.projects.forEach(p => {
          const exists = editForm.projects.find(ep => ep.id === p.id);
          if (!exists) removeProject(p.id);
        });
        editForm.projects.forEach(ep => {
          if (ep.id.startsWith('temp-')) {
            const { id, ...projectData } = ep;
            addProject(projectData);
          } else {
            updateProject(ep.id, ep);
          }
        });
        break;
      case 'experience':
        // Handle resume summary update
        updateResumeSummary(editForm.summary);

        // Handle experience updates
        profile.resume.experience.forEach(e => {
          const exists = editForm.experience.find(ee => ee.id === e.id);
          if (!exists) removeExperience(e.id);
        });
        editForm.experience.forEach(ee => {
          if (ee.id.startsWith('temp-')) {
            const { id, ...expData } = ee;
            addExperience(expData);
          } else {
            updateExperience(ee.id, ee);
          }
        });

        // Handle education updates
        profile.resume.education.forEach(e => {
          const exists = editForm.education.find(ed => ed.id === e.id);
          if (!exists) removeEducation(e.id);
        });
        editForm.education.forEach(ed => {
          if (ed.id.startsWith('temp-')) {
            const { id, ...eduData } = ed;
            addEducation(eduData);
          } else {
            updateEducation(ed.id, ed);
          }
        });

        // Handle certification updates
        profile.resume.certifications.forEach(c => {
          const exists = editForm.certifications.find(cert => cert.id === c.id);
          if (!exists) removeCertification(c.id);
        });
        editForm.certifications.forEach(cert => {
          if (cert.id.startsWith('temp-')) {
            const { id, ...certData } = cert;
            addCertification(certData);
          } else {
            updateCertification(cert.id, cert);
          }
        });
        break;
      case 'skills':
        // Update skill categories
        profile.skills.categories.forEach(c => {
          const exists = editForm.skills.categories.find((ec: UserProfile['skills']['categories'][0]) => ec.id === c.id);
          if (!exists) removeSkillCategory(c.id);
        });
        editForm.skills.categories.forEach((ec: UserProfile['skills']['categories'][0]) => {
          if (ec.id.startsWith('temp-')) {
            const { id, ...catData } = ec;
            addSkillCategory(catData);
          } else {
            updateSkillCategory(ec.id, ec);
          }
        });
        break;
      case 'contact':
        updatePersonal({
          email: editForm.personal.email,
          phone: editForm.personal.phone,
          location: editForm.personal.location
        });
        updatePreferences(editForm.preferences);
        break;
    }

    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form to current profile data
    setEditForm({
      personal: { ...profile.personal },
      social: { ...profile.social },
      projects: [...profile.projects],
      experience: [...profile.resume.experience],
      education: [...profile.resume.education],
      certifications: [...profile.resume.certifications],
      summary: profile.resume.summary,
      skills: JSON.parse(JSON.stringify(profile.skills)),
      preferences: { ...profile.preferences }
    });
    setIsEditing(false);
  };

  return (
    <AppShell>
      {/* Header with Edit Controls */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-os-line-dark">
        <h1 className="text-2xl font-bold text-white">About Me</h1>
        {isAdmin && (
          <div className="flex gap-2">
            {!isEditing ? (
              <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                <Icons.Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button variant="success" size="sm" onClick={handleSave}>
                  <Icons.Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="secondary" size="sm" onClick={handleCancel}>
                  <Icons.X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="px-6 py-2 bg-error-subtle border-b border-stroke-error/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-fg-error text-sm">
            <Icons.AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-fg-error hover:text-white hover:bg-error-subtle"
            onClick={() => useUserStore.setState({ error: null })}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 px-6 py-3 border-b border-os-line-dark bg-os-ink-800/40">
        <Button
          variant={activeTab === 'overview' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('overview')}
        >
          <Icons.User className="w-4 h-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={activeTab === 'experience' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('experience')}
        >
          <Icons.Briefcase className="w-4 h-4 mr-2" />
          Experience
        </Button>
        <Button
          variant={activeTab === 'projects' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('projects')}
        >
          <Icons.FolderGit2 className="w-4 h-4 mr-2" />
          Projects
        </Button>
        <Button
          variant={activeTab === 'skills' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('skills')}
        >
          <Icons.Zap className="w-4 h-4 mr-2" />
          Skills
        </Button>
        <Button
          variant={activeTab === 'contact' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setActiveTab('contact')}
        >
          <Icons.Mail className="w-4 h-4 mr-2" />
          Contact
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-500 to-tertiary-600 flex items-center justify-center mx-auto mb-4">
                  {profile.personal.photo ? (
                    <img src={profile.personal.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <Icons.User className="w-16 h-16 text-white" />
                  )}
                </div>
                {isEditing && (
                  <label className="cursor-pointer text-primary-400 hover:text-primary-300 text-sm">
                    <Icons.Upload className="w-4 h-4 inline mr-1" />
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate image
                          const validation = validateImageFile(file, { maxSizeMB: 5 });
                          if (!validation.valid) {
                            alert(validation.error);
                            e.target.value = ''; // Reset input
                            return;
                          }

                          try {
                            // Compress image
                            const compressed = await compressImage(file, {
                              maxWidth: 400,
                              maxHeight: 400,
                              quality: 0.85
                            });

                            setEditForm({
                              ...editForm,
                              personal: { ...editForm.personal, photo: compressed }
                            });
                          } catch (error) {
                            alert('Failed to process image. Please try another file.');
                            console.error('Image compression error:', error);
                          }
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              {/* Name and Title */}
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">Name</label>
                      <input
                        type="text"
                        value={editForm.personal.name}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          personal: { ...editForm.personal, name: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Title</label>
                      <input
                        type="text"
                        value={editForm.personal.title}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          personal: { ...editForm.personal, title: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Subtitle</label>
                      <input
                        type="text"
                        value={editForm.personal.subtitle}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          personal: { ...editForm.personal, subtitle: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-4 py-2 text-white"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-2">{profile.personal.name}</h2>
                    <p className="text-xl text-primary-400 mb-1">{profile.personal.title}</p>
                    <p className="text-white/60">{profile.personal.subtitle}</p>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.FileText className="w-5 h-5" />
                  Biography
                </h3>
                {isEditing ? (
                  <div className="space-y-4">
                    {editForm.personal.bio.map((bioItem, index) => (
                      <textarea
                        key={index}
                        value={bioItem}
                        onChange={(e) => {
                          const newBio = [...editForm.personal.bio];
                          newBio[index] = e.target.value;
                          setEditForm({
                            ...editForm,
                            personal: { ...editForm.personal, bio: newBio }
                          });
                        }}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-4 py-2 text-white min-h-[100px]"
                        rows={3}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile.personal.bio.map((bioItem, index) => (
                      <p key={index} className="text-white/70 leading-relaxed">{bioItem}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Icons.Link className="w-5 h-5" />
                  Social Links
                </h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">GitHub</label>
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={editForm.social.github || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          social: { ...editForm.social, github: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">LinkedIn</label>
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={editForm.social.linkedin || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          social: { ...editForm.social, linkedin: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Twitter</label>
                      <input
                        type="url"
                        placeholder="https://twitter.com/username"
                        value={editForm.social.twitter || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          social: { ...editForm.social, twitter: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-1 block">Website</label>
                      <input
                        type="url"
                        placeholder="https://yourwebsite.com"
                        value={editForm.social.website || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          social: { ...editForm.social, website: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs mb-2 block">Custom Links</label>
                      <div className="space-y-2">
                        {editForm.social.custom.map((link, index) => (
                          <div key={link.id} className="flex gap-2 bg-os-ink-800/40 rounded-lg p-3">
                            <input
                              type="text"
                              placeholder="Link name"
                              value={link.name}
                              onChange={(e) => {
                                const newCustom = [...editForm.social.custom];
                                newCustom[index] = { ...newCustom[index], name: e.target.value };
                                setEditForm({
                                  ...editForm,
                                  social: { ...editForm.social, custom: newCustom }
                                });
                              }}
                              className="flex-1 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                            />
                            <input
                              type="url"
                              placeholder="https://..."
                              value={link.url}
                              onChange={(e) => {
                                const newCustom = [...editForm.social.custom];
                                newCustom[index] = { ...newCustom[index], url: e.target.value };
                                setEditForm({
                                  ...editForm,
                                  social: { ...editForm.social, custom: newCustom }
                                });
                              }}
                              className="flex-1 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Icon (e.g., rocket)"
                              value={link.icon}
                              onChange={(e) => {
                                const newCustom = [...editForm.social.custom];
                                newCustom[index] = { ...newCustom[index], icon: e.target.value };
                                setEditForm({
                                  ...editForm,
                                  social: { ...editForm.social, custom: newCustom }
                                });
                              }}
                              className="w-32 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setEditForm({
                                  ...editForm,
                                  social: {
                                    ...editForm.social,
                                    custom: editForm.social.custom.filter((_, i) => i !== index)
                                  }
                                });
                              }}
                            >
                              <Icons.X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          setEditForm({
                            ...editForm,
                            social: {
                              ...editForm.social,
                              custom: [...editForm.social.custom, {
                                id: `temp-${Date.now()}`,
                                name: '',
                                url: '',
                                icon: 'link'
                              }]
                            }
                          });
                        }}
                      >
                        <Icons.Plus className="w-4 h-4 mr-1" />
                        Add Custom Link
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {profile.social.github && (
                      <a
                        href={profile.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-os-ink-800/40 hover:bg-os-ink-800/80 rounded-lg p-4 transition-all"
                      >
                        <Icons.Github className="w-6 h-6 text-white" />
                        <span className="text-white font-medium">GitHub</span>
                      </a>
                    )}
                    {profile.social.linkedin && (
                      <a
                        href={profile.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-os-ink-800/40 hover:bg-os-ink-800/80 rounded-lg p-4 transition-all"
                      >
                        <Icons.Linkedin className="w-6 h-6 text-white" />
                        <span className="text-white font-medium">LinkedIn</span>
                      </a>
                    )}
                    {profile.social.twitter && (
                      <a
                        href={profile.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-os-ink-800/40 hover:bg-os-ink-800/80 rounded-lg p-4 transition-all"
                      >
                        <Icons.Twitter className="w-6 h-6 text-white" />
                        <span className="text-white font-medium">Twitter</span>
                      </a>
                    )}
                    {profile.social.website && (
                      <a
                        href={profile.social.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 bg-os-ink-800/40 hover:bg-os-ink-800/80 rounded-lg p-4 transition-all"
                      >
                        <Icons.Globe className="w-6 h-6 text-white" />
                        <span className="text-white font-medium">Website</span>
                      </a>
                    )}
                    {profile.social.custom.map((link) => {
                      const IconComponent = (Icons as any)[link.icon.split('-').map((word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join('')] || Icons.Link;
                      return (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-os-ink-800/40 hover:bg-os-ink-800/80 rounded-lg p-4 transition-all"
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                          <span className="text-white font-medium">{link.name}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === 'experience' && (
            <div className="space-y-6">
              {/* Resume Summary */}
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                <h3 className="text-xl font-semibold text-white mb-4">Resume Summary</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.summary}
                    onChange={(e) => setEditForm({ ...editForm, summary: e.target.value })}
                    placeholder="Professional summary for your resume..."
                    className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-4 py-3 text-white min-h-[120px]"
                    rows={5}
                  />
                ) : (
                  <p className="text-white/70 leading-relaxed">{profile.resume.summary}</p>
                )}
              </div>

              {/* Work Experience */}
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                <h3 className="text-xl font-semibold text-white mb-4">Work Experience</h3>
                {editForm.experience.length === 0 ? (
                  <p className="text-white/40 text-center py-8">No experience added yet. Click Edit to add your work history.</p>
                ) : (
                  <div className="space-y-4">
                    {editForm.experience.map((exp, index) => (
                      <div key={exp.id} className="bg-os-ink-800/40 rounded-lg p-4 border border-os-line-dark">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Position"
                                value={exp.position}
                                onChange={(e) => {
                                  const newExp = [...editForm.experience];
                                  newExp[index] = { ...newExp[index], position: e.target.value };
                                  setEditForm({ ...editForm, experience: newExp });
                                }}
                                className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Company"
                                value={exp.company}
                                onChange={(e) => {
                                  const newExp = [...editForm.experience];
                                  newExp[index] = { ...newExp[index], company: e.target.value };
                                  setEditForm({ ...editForm, experience: newExp });
                                }}
                                className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Location (e.g., Johannesburg, South Africa)"
                              value={exp.location}
                              onChange={(e) => {
                                const newExp = [...editForm.experience];
                                newExp[index] = { ...newExp[index], location: e.target.value };
                                setEditForm({ ...editForm, experience: newExp });
                              }}
                              className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                            />
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">Start Date</label>
                                <input
                                  type="date"
                                  value={exp.startDate}
                                  onChange={(e) => {
                                    const newExp = [...editForm.experience];
                                    newExp[index] = { ...newExp[index], startDate: e.target.value };
                                    setEditForm({ ...editForm, experience: newExp });
                                  }}
                                  className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">End Date (or "Present")</label>
                                <input
                                  type="text"
                                  placeholder="Present or date"
                                  value={exp.endDate}
                                  onChange={(e) => {
                                    const newExp = [...editForm.experience];
                                    newExp[index] = { ...newExp[index], endDate: e.target.value };
                                    setEditForm({ ...editForm, experience: newExp });
                                  }}
                                  className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Description (one per line)</label>
                              {exp.description.map((desc, descIndex) => (
                                <div key={descIndex} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Achievement or responsibility"
                                    value={desc}
                                    onChange={(e) => {
                                      const newExp = [...editForm.experience];
                                      const newDesc = [...newExp[index].description];
                                      newDesc[descIndex] = e.target.value;
                                      newExp[index] = { ...newExp[index], description: newDesc };
                                      setEditForm({ ...editForm, experience: newExp });
                                    }}
                                    className="flex-1 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                                  />
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                      const newExp = [...editForm.experience];
                                      newExp[index].description = newExp[index].description.filter((_, i) => i !== descIndex);
                                      setEditForm({ ...editForm, experience: newExp });
                                    }}
                                  >
                                    <Icons.X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  const newExp = [...editForm.experience];
                                  newExp[index].description = [...newExp[index].description, ''];
                                  setEditForm({ ...editForm, experience: newExp });
                                }}
                              >
                                <Icons.Plus className="w-4 h-4 mr-1" />
                                Add Description Line
                              </Button>
                            </div>
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Technologies (comma-separated)</label>
                              <input
                                type="text"
                                placeholder="React, TypeScript, Node.js"
                                value={exp.technologies.join(', ')}
                                onChange={(e) => {
                                  const newExp = [...editForm.experience];
                                  newExp[index] = {
                                    ...newExp[index],
                                    technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                                  };
                                  setEditForm({ ...editForm, experience: newExp });
                                }}
                                className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                              />
                            </div>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setEditForm({
                                  ...editForm,
                                  experience: editForm.experience.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              <Icons.Trash2 className="w-4 h-4 mr-2" />
                              Remove Experience
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-lg font-semibold text-white">{exp.position}</h4>
                                <p className="text-primary-400 font-medium">{exp.company}</p>
                                {exp.location && <p className="text-white/40 text-sm">{exp.location}</p>}
                              </div>
                              <span className="text-white/40 text-sm">{exp.startDate} - {exp.endDate}</span>
                            </div>
                            {exp.description.length > 0 && (
                              <ul className="list-disc list-inside space-y-1 mb-3">
                                {exp.description.map((desc, i) => (
                                  <li key={i} className="text-white/60 text-sm">{desc}</li>
                                ))}
                              </ul>
                            )}
                            {exp.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {exp.technologies.map((tech, i) => (
                                  <span key={i} className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isEditing && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        experience: [...editForm.experience, {
                          id: `temp-${Date.now()}`,
                          company: '',
                          position: '',
                          location: '',
                          startDate: '',
                          endDate: 'Present',
                          description: [''],
                          technologies: []
                        }]
                      });
                    }}
                  >
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Experience
                  </Button>
                )}
              </div>

              {/* Education */}
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                <h3 className="text-xl font-semibold text-white mb-4">Education</h3>
                {editForm.education.length === 0 ? (
                  <p className="text-white/40 text-center py-8">No education added yet. Click Edit to add your education history.</p>
                ) : (
                  <div className="space-y-4">
                    {editForm.education.map((edu, index) => (
                      <div key={edu.id} className="bg-os-ink-800/40 rounded-lg p-4 border border-os-line-dark">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Institution"
                                value={edu.institution}
                                onChange={(e) => {
                                  const newEdu = [...editForm.education];
                                  newEdu[index] = { ...newEdu[index], institution: e.target.value };
                                  setEditForm({ ...editForm, education: newEdu });
                                }}
                                className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Degree"
                                value={edu.degree}
                                onChange={(e) => {
                                  const newEdu = [...editForm.education];
                                  newEdu[index] = { ...newEdu[index], degree: e.target.value };
                                  setEditForm({ ...editForm, education: newEdu });
                                }}
                                className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Field of Study"
                              value={edu.field}
                              onChange={(e) => {
                                const newEdu = [...editForm.education];
                                newEdu[index] = { ...newEdu[index], field: e.target.value };
                                setEditForm({ ...editForm, education: newEdu });
                              }}
                              className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                            />
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">Start Date</label>
                                <input
                                  type="date"
                                  value={edu.startDate}
                                  onChange={(e) => {
                                    const newEdu = [...editForm.education];
                                    newEdu[index] = { ...newEdu[index], startDate: e.target.value };
                                    setEditForm({ ...editForm, education: newEdu });
                                  }}
                                  className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">End Date</label>
                                <input
                                  type="date"
                                  value={edu.endDate}
                                  onChange={(e) => {
                                    const newEdu = [...editForm.education];
                                    newEdu[index] = { ...newEdu[index], endDate: e.target.value };
                                    setEditForm({ ...editForm, education: newEdu });
                                  }}
                                  className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">GPA (optional)</label>
                                <input
                                  type="text"
                                  placeholder="3.8/4.0"
                                  value={edu.gpa || ''}
                                  onChange={(e) => {
                                    const newEdu = [...editForm.education];
                                    newEdu[index] = { ...newEdu[index], gpa: e.target.value };
                                    setEditForm({ ...editForm, education: newEdu });
                                  }}
                                  className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Achievements (one per line)</label>
                              {edu.achievements.map((achievement, achIndex) => (
                                <div key={achIndex} className="flex gap-2 mb-2">
                                  <input
                                    type="text"
                                    placeholder="Achievement or honor"
                                    value={achievement}
                                    onChange={(e) => {
                                      const newEdu = [...editForm.education];
                                      const newAchievements = [...newEdu[index].achievements];
                                      newAchievements[achIndex] = e.target.value;
                                      newEdu[index] = { ...newEdu[index], achievements: newAchievements };
                                      setEditForm({ ...editForm, education: newEdu });
                                    }}
                                    className="flex-1 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                                  />
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => {
                                      const newEdu = [...editForm.education];
                                      newEdu[index].achievements = newEdu[index].achievements.filter((_, i) => i !== achIndex);
                                      setEditForm({ ...editForm, education: newEdu });
                                    }}
                                  >
                                    <Icons.X className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  const newEdu = [...editForm.education];
                                  newEdu[index].achievements = [...newEdu[index].achievements, ''];
                                  setEditForm({ ...editForm, education: newEdu });
                                }}
                              >
                                <Icons.Plus className="w-4 h-4 mr-1" />
                                Add Achievement
                              </Button>
                            </div>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setEditForm({
                                  ...editForm,
                                  education: editForm.education.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              <Icons.Trash2 className="w-4 h-4 mr-2" />
                              Remove Education
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-lg font-semibold text-white">{edu.degree} in {edu.field}</h4>
                                <p className="text-primary-400 font-medium">{edu.institution}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-white/40 text-sm">{edu.startDate} - {edu.endDate}</span>
                                {edu.gpa && <p className="text-white/60 text-xs mt-1">GPA: {edu.gpa}</p>}
                              </div>
                            </div>
                            {edu.achievements.length > 0 && (
                              <ul className="list-disc list-inside space-y-1">
                                {edu.achievements.map((achievement, i) => (
                                  <li key={i} className="text-white/60 text-sm">{achievement}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isEditing && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        education: [...editForm.education, {
                          id: `temp-${Date.now()}`,
                          institution: '',
                          degree: '',
                          field: '',
                          startDate: '',
                          endDate: '',
                          achievements: ['']
                        }]
                      });
                    }}
                  >
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Education
                  </Button>
                )}
              </div>

              {/* Certifications */}
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                <h3 className="text-xl font-semibold text-white mb-4">Certifications</h3>
                {editForm.certifications.length === 0 ? (
                  <p className="text-white/40 text-center py-8">No certifications added yet. Click Edit to add your professional certifications.</p>
                ) : (
                  <div className="space-y-4">
                    {editForm.certifications.map((cert, index) => (
                      <div key={cert.id} className="bg-os-ink-800/40 rounded-lg p-4 border border-os-line-dark">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="text"
                                placeholder="Certification Name"
                                value={cert.name}
                                onChange={(e) => {
                                  const newCerts = [...editForm.certifications];
                                  newCerts[index] = { ...newCerts[index], name: e.target.value };
                                  setEditForm({ ...editForm, certifications: newCerts });
                                }}
                                className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                              />
                              <input
                                type="text"
                                placeholder="Issuing Organization"
                                value={cert.issuer}
                                onChange={(e) => {
                                  const newCerts = [...editForm.certifications];
                                  newCerts[index] = { ...newCerts[index], issuer: e.target.value };
                                  setEditForm({ ...editForm, certifications: newCerts });
                                }}
                                className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">Issue Date</label>
                                <input
                                  type="date"
                                  value={cert.date}
                                  onChange={(e) => {
                                    const newCerts = [...editForm.certifications];
                                    newCerts[index] = { ...newCerts[index], date: e.target.value };
                                    setEditForm({ ...editForm, certifications: newCerts });
                                  }}
                                  className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">Credential ID (optional)</label>
                                <input
                                  type="text"
                                  placeholder="ABC-123456"
                                  value={cert.credentialId || ''}
                                  onChange={(e) => {
                                    const newCerts = [...editForm.certifications];
                                    newCerts[index] = { ...newCerts[index], credentialId: e.target.value };
                                    setEditForm({ ...editForm, certifications: newCerts });
                                  }}
                                  className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-white/40 text-xs mb-1 block">Credential URL (optional)</label>
                                <input
                                  type="url"
                                  placeholder="https://..."
                                  value={cert.url || ''}
                                  onChange={(e) => {
                                    const newCerts = [...editForm.certifications];
                                    newCerts[index] = { ...newCerts[index], url: e.target.value };
                                    setEditForm({ ...editForm, certifications: newCerts });
                                  }}
                                  className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                                />
                              </div>
                            </div>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setEditForm({
                                  ...editForm,
                                  certifications: editForm.certifications.filter((_, i) => i !== index)
                                });
                              }}
                            >
                              <Icons.Trash2 className="w-4 h-4 mr-2" />
                              Remove Certification
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-white">{cert.name}</h4>
                                <p className="text-primary-400 font-medium">{cert.issuer}</p>
                                {cert.credentialId && (
                                  <p className="text-white/40 text-xs mt-1">Credential ID: {cert.credentialId}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <span className="text-white/40 text-sm">{cert.date}</span>
                                {cert.url && (
                                  <div className="mt-2">
                                    <a
                                      href={cert.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1 justify-end"
                                    >
                                      <Icons.ExternalLink className="w-3 h-3" />
                                      Verify
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isEditing && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        certifications: [...editForm.certifications, {
                          id: `temp-${Date.now()}`,
                          name: '',
                          issuer: '',
                          date: ''
                        }]
                      });
                    }}
                  >
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Certification
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div className="space-y-6">
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                <h3 className="text-xl font-semibold text-white mb-4">Portfolio Projects</h3>
                <div className="space-y-4">
                  {editForm.projects.map((project, index) => (
                    <div key={project.id} className="bg-os-ink-800/40 rounded-lg p-4 border border-os-line-dark">
                      {isEditing ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Project Name"
                            value={project.name}
                            onChange={(e) => {
                              const newProjects = [...editForm.projects];
                              newProjects[index] = { ...newProjects[index], name: e.target.value };
                              setEditForm({ ...editForm, projects: newProjects });
                            }}
                            className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                          />
                          <textarea
                            placeholder="Short Description"
                            value={project.description}
                            onChange={(e) => {
                              const newProjects = [...editForm.projects];
                              newProjects[index] = { ...newProjects[index], description: e.target.value };
                              setEditForm({ ...editForm, projects: newProjects });
                            }}
                            className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                            rows={2}
                          />
                          <div>
                            <label className="text-white/40 text-xs mb-1 block">Technologies (comma-separated)</label>
                            <input
                              type="text"
                              placeholder="React, TypeScript, Node.js"
                              value={project.technologies.join(', ')}
                              onChange={(e) => {
                                const newProjects = [...editForm.projects];
                                newProjects[index] = {
                                  ...newProjects[index],
                                  technologies: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                                };
                                setEditForm({ ...editForm, projects: newProjects });
                              }}
                              className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Status</label>
                              <select
                                value={project.status}
                                onChange={(e) => {
                                  const newProjects = [...editForm.projects];
                                  newProjects[index] = { ...newProjects[index], status: e.target.value as any };
                                  setEditForm({ ...editForm, projects: newProjects });
                                }}
                                className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white"
                              >
                                <option value="In Progress" className="bg-black/30">In Progress</option>
                                <option value="Completed" className="bg-black/30">Completed</option>
                                <option value="Archived" className="bg-black/30">Archived</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Featured</label>
                              <label className="flex items-center gap-2 mt-2">
                                <input
                                  type="checkbox"
                                  checked={project.featured}
                                  onChange={(e) => {
                                    const newProjects = [...editForm.projects];
                                    newProjects[index] = { ...newProjects[index], featured: e.target.checked };
                                    setEditForm({ ...editForm, projects: newProjects });
                                  }}
                                  className="w-4 h-4"
                                />
                                <span className="text-white text-sm">Featured</span>
                              </label>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Live URL</label>
                              <input
                                type="url"
                                placeholder="https://example.com"
                                value={project.links.live || ''}
                                onChange={(e) => {
                                  const newProjects = [...editForm.projects];
                                  newProjects[index] = {
                                    ...newProjects[index],
                                    links: { ...newProjects[index].links, live: e.target.value }
                                  };
                                  setEditForm({ ...editForm, projects: newProjects });
                                }}
                                className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">GitHub URL</label>
                              <input
                                type="url"
                                placeholder="https://github.com/..."
                                value={project.links.github || ''}
                                onChange={(e) => {
                                  const newProjects = [...editForm.projects];
                                  newProjects[index] = {
                                    ...newProjects[index],
                                    links: { ...newProjects[index].links, github: e.target.value }
                                  };
                                  setEditForm({ ...editForm, projects: newProjects });
                                }}
                                className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-white/40 text-xs mb-1 block">Demo URL</label>
                              <input
                                type="url"
                                placeholder="https://demo.com"
                                value={project.links.demo || ''}
                                onChange={(e) => {
                                  const newProjects = [...editForm.projects];
                                  newProjects[index] = {
                                    ...newProjects[index],
                                    links: { ...newProjects[index].links, demo: e.target.value }
                                  };
                                  setEditForm({ ...editForm, projects: newProjects });
                                }}
                                className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                              />
                            </div>
                          </div>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              setEditForm({
                                ...editForm,
                                projects: editForm.projects.filter((_, i) => i !== index)
                              });
                            }}
                          >
                            <Icons.Trash2 className="w-4 h-4 mr-2" />
                            Remove Project
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                              {project.name}
                              {project.featured && <Icons.Star className="w-4 h-4 text-fg-warning fill-current" />}
                            </h4>
                            <span className={`text-xs px-2 py-1 rounded ${project.status === 'Completed' ? 'bg-success-subtle text-fg-success' :
                              project.status === 'In Progress' ? 'bg-warning-subtle text-fg-warning' :
                                'bg-os-ink-800/80 text-white/40'
                              }`}>
                              {project.status}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm mb-3">{project.description}</p>
                          {project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {project.technologies.map((tech, i) => (
                                <span key={i} className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded text-xs">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                          {(project.links.live || project.links.github || project.links.demo) && (
                            <div className="flex gap-2">
                              {project.links.live && (
                                <a href={project.links.live} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1">
                                  <Icons.ExternalLink className="w-3 h-3" /> Live
                                </a>
                              )}
                              {project.links.github && (
                                <a href={project.links.github} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1">
                                  <Icons.Github className="w-3 h-3" /> GitHub
                                </a>
                              )}
                              {project.links.demo && (
                                <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 text-xs flex items-center gap-1">
                                  <Icons.Play className="w-3 h-3" /> Demo
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setEditForm({
                        ...editForm,
                        projects: [...editForm.projects, {
                          id: `temp-${Date.now()}`,
                          name: 'New Project',
                          description: 'Project description',
                          technologies: [],
                          images: [],
                          links: {},
                          featured: false,
                          status: 'In Progress'
                        }]
                      });
                    }}
                  >
                    <Icons.Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <div className="space-y-6">
              {editForm.skills.categories.map((category: UserProfile['skills']['categories'][0], catIndex: number) => (
                <div key={category.id} className="bg-black/30 rounded p-6 border border-os-line-dark">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <input
                          type="text"
                          placeholder="Category Name"
                          value={category.name}
                          onChange={(e) => {
                            const newSkills = JSON.parse(JSON.stringify(editForm.skills));
                            newSkills.categories[catIndex].name = e.target.value;
                            setEditForm({ ...editForm, skills: newSkills });
                          }}
                          className="flex-1 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white font-semibold"
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            const newSkills = JSON.parse(JSON.stringify(editForm.skills));
                            newSkills.categories = newSkills.categories.filter((_: any, i: number) => i !== catIndex);
                            setEditForm({ ...editForm, skills: newSkills });
                          }}
                        >
                          <Icons.Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {category.skills.map((skill: UserProfile['skills']['categories'][0]['skills'][0], skillIndex: number) => (
                          <div key={skillIndex} className="flex items-center gap-2 bg-os-ink-800/40 rounded-lg p-3">
                            <input
                              type="text"
                              placeholder="Skill name"
                              value={skill.name}
                              onChange={(e) => {
                                const newSkills = JSON.parse(JSON.stringify(editForm.skills));
                                newSkills.categories[catIndex].skills[skillIndex].name = e.target.value;
                                setEditForm({ ...editForm, skills: newSkills });
                              }}
                              className="flex-1 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                            />
                            <select
                              value={skill.proficiency}
                              onChange={(e) => {
                                const newSkills = JSON.parse(JSON.stringify(editForm.skills));
                                newSkills.categories[catIndex].skills[skillIndex].proficiency = e.target.value;
                                setEditForm({ ...editForm, skills: newSkills });
                              }}
                              className="bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                            >
                              <option value="Beginner" className="bg-black/30">Beginner</option>
                              <option value="Intermediate" className="bg-black/30">Intermediate</option>
                              <option value="Advanced" className="bg-black/30">Advanced</option>
                              <option value="Expert" className="bg-black/30">Expert</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Years"
                              value={skill.yearsOfExperience || ''}
                              onChange={(e) => {
                                const newSkills = JSON.parse(JSON.stringify(editForm.skills));
                                newSkills.categories[catIndex].skills[skillIndex].yearsOfExperience = e.target.value ? parseInt(e.target.value) : undefined;
                                setEditForm({ ...editForm, skills: newSkills });
                              }}
                              className="w-20 bg-os-ink-800/60 border border-os-line-dark rounded px-3 py-2 text-white text-sm"
                              min="0"
                              max="50"
                            />
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                const newSkills = JSON.parse(JSON.stringify(editForm.skills));
                                newSkills.categories[catIndex].skills = newSkills.categories[catIndex].skills.filter((_: any, i: number) => i !== skillIndex);
                                setEditForm({ ...editForm, skills: newSkills });
                              }}
                            >
                              <Icons.X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          const newSkills = JSON.parse(JSON.stringify(editForm.skills));
                          newSkills.categories[catIndex].skills.push({
                            name: '',
                            proficiency: 'Intermediate',
                            yearsOfExperience: 1
                          });
                          setEditForm({ ...editForm, skills: newSkills });
                        }}
                      >
                        <Icons.Plus className="w-4 h-4 mr-1" />
                        Add Skill
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-white mb-4">{category.name}</h3>
                      <div className="space-y-2">
                        {category.skills.map((skill: UserProfile['skills']['categories'][0]['skills'][0], skillIndex: number) => (
                          <div key={skillIndex} className="flex items-center justify-between bg-os-ink-800/40 rounded-lg p-3">
                            <div className="flex items-center gap-3">
                              <span className="text-white font-medium">{skill.name}</span>
                              {skill.yearsOfExperience && (
                                <span className="text-white/40 text-xs">
                                  {skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}
                                </span>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded text-sm ${skill.proficiency === 'Expert' ? 'bg-tertiary-500/20 text-tertiary-300' :
                              skill.proficiency === 'Advanced' ? 'bg-primary-500/20 text-primary-300' :
                                skill.proficiency === 'Intermediate' ? 'bg-success-subtle text-fg-success' :
                                  'bg-os-ink-800/80 text-white/60'
                              }`}>
                              {skill.proficiency}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    const newSkills = JSON.parse(JSON.stringify(editForm.skills));
                    newSkills.categories.push({
                      id: `temp-${Date.now()}`,
                      name: 'New Category',
                      skills: []
                    });
                    setEditForm({ ...editForm, skills: newSkills });
                  }}
                >
                  <Icons.Plus className="w-4 h-4 mr-2" />
                  Add Skill Category
                </Button>
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="bg-black/30 rounded p-6 border border-os-line-dark">
                <h3 className="text-xl font-semibold text-white mb-4">Contact Information</h3>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">Email</label>
                      <input
                        type="email"
                        value={editForm.personal.email || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          personal: { ...editForm.personal, email: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Phone</label>
                      <input
                        type="tel"
                        value={editForm.personal.phone || ''}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          personal: { ...editForm.personal, phone: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-4 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="text-white text-sm mb-2 block">Location</label>
                      <input
                        type="text"
                        value={editForm.personal.location}
                        onChange={(e) => setEditForm({
                          ...editForm,
                          personal: { ...editForm.personal, location: e.target.value }
                        })}
                        className="w-full bg-os-ink-800/60 border border-os-line-dark rounded px-4 py-2 text-white"
                      />
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-os-line-dark">
                      <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.preferences.showEmail}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            preferences: { ...editForm.preferences, showEmail: e.target.checked }
                          })}
                          className="w-4 h-4"
                        />
                        Show email publicly
                      </label>
                      <label className="flex items-center gap-2 text-white cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.preferences.showPhone}
                          onChange={(e) => setEditForm({
                            ...editForm,
                            preferences: { ...editForm.preferences, showPhone: e.target.checked }
                          })}
                          className="w-4 h-4"
                        />
                        Show phone publicly
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {profile.preferences.showEmail && profile.personal.email && (
                      <div className="flex items-center gap-3">
                        <Icons.Mail className="w-5 h-5 text-primary-400" />
                        <a href={`mailto:${profile.personal.email}`} className="text-white hover:text-primary-400">
                          {profile.personal.email}
                        </a>
                      </div>
                    )}
                    {profile.preferences.showPhone && profile.personal.phone && (
                      <div className="flex items-center gap-3">
                        <Icons.Phone className="w-5 h-5 text-primary-400" />
                        <a href={`tel:${profile.personal.phone}`} className="text-white hover:text-primary-400">
                          {profile.personal.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Icons.MapPin className="w-5 h-5 text-primary-400" />
                      <span className="text-white">{profile.personal.location}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
