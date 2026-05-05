import { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useDesktopStore } from '../../store/desktopStore';
import { Button } from '../ui/button';

type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';

export function Skills() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProficiency, setFilterProficiency] = useState<string>('all');
  const { profile } = useUserStore();
  const { isAdmin } = useAuthStore();
  const { openWindow, apps } = useDesktopStore();

  const openAboutApp = () => {
    const aboutApp = apps.find(app => app.id === 'about');
    if (aboutApp) {
      openWindow(aboutApp);
    }
  };

  // Filter skills based on search and proficiency
  const filteredCategories = useMemo(() => {
    return profile.skills.categories
      .map(category => ({
        ...category,
        skills: category.skills.filter(skill => {
          const matchesSearch = searchQuery === '' ||
            skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.name.toLowerCase().includes(searchQuery.toLowerCase());

          const matchesProficiency = filterProficiency === 'all' ||
            skill.proficiency === filterProficiency;

          return matchesSearch && matchesProficiency;
        })
      }))
      .filter(category => category.skills.length > 0);
  }, [profile.skills.categories, searchQuery, filterProficiency]);

  const getProficiencyColor = (proficiency: ProficiencyLevel) => {
    switch (proficiency) {
      case 'Beginner':
        return 'bg-white/40';
      case 'Intermediate':
        return 'bg-green-500';
      case 'Advanced':
        return 'bg-primary-500';
      case 'Expert':
        return 'bg-tertiary-500';
      default:
        return 'bg-white/40';
    }
  };

  const getProficiencyPercentage = (proficiency: ProficiencyLevel): number => {
    switch (proficiency) {
      case 'Beginner':
        return 25;
      case 'Intermediate':
        return 50;
      case 'Advanced':
        return 75;
      case 'Expert':
        return 100;
      default:
        return 0;
    }
  };

  const getProficiencyStars = (proficiency: ProficiencyLevel): number => {
    switch (proficiency) {
      case 'Beginner':
        return 1;
      case 'Intermediate':
        return 2;
      case 'Advanced':
        return 3;
      case 'Expert':
        return 4;
      default:
        return 0;
    }
  };

  const totalSkills = profile.skills.categories.reduce((sum, cat) => sum + cat.skills.length, 0);
  const filteredSkillsCount = filteredCategories.reduce((sum, cat) => sum + cat.skills.length, 0);

  return (
    <div className="w-full h-full bg-black/50 flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Icons.Zap className="w-6 h-6" />
              Skills & Technologies
            </h1>
            <p className="text-white/40 text-sm mt-1">
              {filteredSkillsCount} skill{filteredSkillsCount !== 1 ? 's' : ''} across {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>

          {isAdmin && (
            <Button variant="secondary" size="sm" onClick={openAboutApp}>
              <Icons.Edit className="w-4 h-4 mr-2" />
              Edit Skills
            </Button>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="px-6 py-3 border-b border-white/[0.08] bg-white/[0.04]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded px-9 py-1.5 text-white text-sm placeholder-white/30"
              />
            </div>
          </div>

          {/* Proficiency Filter */}
          <select
            value={filterProficiency}
            onChange={(e) => setFilterProficiency(e.target.value)}
            className="bg-white/[0.06] border border-white/[0.08] rounded px-3 py-1.5 text-white text-sm"
          >
            <option value="all" className="bg-black/30">All Levels</option>
            <option value="Beginner" className="bg-black/30">Beginner</option>
            <option value="Intermediate" className="bg-black/30">Intermediate</option>
            <option value="Advanced" className="bg-black/30">Advanced</option>
            <option value="Expert" className="bg-black/30">Expert</option>
          </select>
        </div>
      </div>

      {/* Skills Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Icons.Layers className="w-16 h-16 text-white/20 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No skills found</h3>
            <p className="text-white/40 mb-4">
              {searchQuery || filterProficiency !== 'all'
                ? 'Try adjusting your filters'
                : 'Start by adding your skills'}
            </p>
            <Button variant="primary" size="sm" onClick={openAboutApp}>
              <Icons.Plus className="w-4 h-4 mr-2" />
              Add Skills
            </Button>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-6">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="bg-black/30 rounded p-6 border border-white/[0.08]"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">{category.name}</h2>
                  <span className="text-white/40 text-sm">
                    {category.skills.length} skill{category.skills.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Skills Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skillIndex}
                      className="bg-white/[0.04] rounded-lg p-4 border border-white/[0.08] hover:border-white/[0.16] transition-all"
                    >
                      {/* Skill Name and Stars */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-semibold">{skill.name}</h3>
                        <div className="flex gap-0.5">
                          {[...Array(4)].map((_, index) => (
                            <Icons.Star
                              key={index}
                              className={`w-4 h-4 ${
                                index < getProficiencyStars(skill.proficiency)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-white/20'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Proficiency Bar */}
                      <div className="mb-2">
                        <div className="w-full bg-white/[0.12] rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full ${getProficiencyColor(skill.proficiency)} transition-all`}
                            style={{ width: `${getProficiencyPercentage(skill.proficiency)}%` }}
                          />
                        </div>
                      </div>

                      {/* Proficiency Level and Experience */}
                      <div className="flex items-center justify-between text-sm">
                        <span className={`${getProficiencyColor(skill.proficiency)} bg-opacity-20 text-white px-2 py-0.5 rounded`}>
                          {skill.proficiency}
                        </span>
                        {skill.yearsOfExperience && (
                          <span className="text-white/40">
                            {skill.yearsOfExperience} year{skill.yearsOfExperience !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {totalSkills > 0 && (
        <div className="px-6 py-3 border-t border-white/[0.08] bg-white/[0.04]">
          <div className="flex justify-center gap-8 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalSkills}</div>
              <div className="text-white/40">Total Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{profile.skills.categories.length}</div>
              <div className="text-white/40">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-tertiary-400">
                {profile.skills.categories.reduce((sum, cat) =>
                  sum + cat.skills.filter(s => s.proficiency === 'Expert').length, 0
                )}
              </div>
              <div className="text-white/40">Expert Level</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
