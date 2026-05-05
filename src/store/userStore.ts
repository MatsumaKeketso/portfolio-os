import { create } from 'zustand';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cvProfileSeed } from '../data/cvProfileSeed';

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const SUPERUSER_EMAIL = 'admin@os.com';
const canWrite = () => auth.currentUser?.email?.toLowerCase() === SUPERUSER_EMAIL;
const PROFILE_BACKUP_KEY = 'portfolioOS_profile';

// User Profile Data Schema
export interface UserProfile {
  personal: {
    name: string;
    title: string;
    subtitle: string;
    bio: string[];
    photo?: string; // Base64 data URL
    location: string;
    email?: string;
    phone?: string;
  };

  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
    custom: Array<{
      id: string;
      name: string;
      url: string;
      icon: string; // Lucide icon name
    }>;
  };

  resume: {
    summary: string;
    experience: Array<{
      id: string;
      company: string;
      position: string;
      location: string;
      startDate: string;
      endDate: string | 'Present';
      description: string[];
      technologies: string[];
    }>;
    education: Array<{
      id: string;
      institution: string;
      degree: string;
      field: string;
      startDate: string;
      endDate: string;
      gpa?: string;
      achievements: string[];
    }>;
    certifications: Array<{
      id: string;
      name: string;
      issuer: string;
      date: string;
      credentialId?: string;
      url?: string;
    }>;
  };

  skills: {
    categories: Array<{
      id: string;
      name: string;
      skills: Array<{
        name: string;
        proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
        yearsOfExperience?: number;
      }>;
    }>;
  };

  projects: Array<{
    id: string;
    name: string;
    description: string;
    longDescription?: string;
    technologies: string[];
    images: string[]; // Base64 data URLs
    links: {
      live?: string;
      github?: string;
      demo?: string;
    };
    featured: boolean;
    startDate?: string;
    endDate?: string;
    status: 'In Progress' | 'Completed' | 'Archived';
  }>;

  preferences: {
    accentColor?: string;
    fontSize: 'sm' | 'md' | 'lg';
    showEmail: boolean;
    showPhone: boolean;
  };

  milestones: Array<{
    id: string;
    title: string;
    description: string;
    date: string; // ISO format YYYY-MM-DD
    category: 'achievement' | 'project' | 'education' | 'career' | 'personal' | 'other';
    images?: string[]; // Base64 data URLs
    links?: Array<{
      label: string;
      url: string;
    }>;
    tags?: string[];
    featured?: boolean;
  }>;

  metadata: {
    lastModified: number;
    version: string;
  };
}

// Export Project type for use in other components
export type Project = UserProfile['projects'][0];

// Default profile data (Fallback)
const defaultProfile: UserProfile = {
  personal: {
    name: 'Keketso Matsuma',
    title: 'Full-Stack Software Engineer',
    subtitle: 'Building innovative web experiences',
    bio: [
      'Passionate software engineer with experience building scalable web applications and interactive user experiences.',
      'I specialize in modern JavaScript frameworks, cloud architecture, and creating delightful user interfaces.'
    ],
    location: 'South Africa',
    email: 'keketso@genos.dev',
    phone: '',
  },

  social: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    custom: []
  },

  resume: {
    summary: 'Full-stack software engineer designing and implementing scalable web applications.',
    experience: [],
    education: [],
    certifications: []
  },

  skills: {
    categories: []
  },

  projects: [],

  preferences: {
    accentColor: '#ef4444',
    fontSize: 'md',
    showEmail: false,
    showPhone: false
  },

  milestones: [],

  metadata: {
    lastModified: Date.now(),
    version: '1.0.0'
  }
};

const loadLocalProfile = (): UserProfile | null => {
  try {
    const stored = localStorage.getItem(PROFILE_BACKUP_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { data?: UserProfile };
    return parsed.data ?? null;
  } catch {
    return null;
  }
};

const saveLocalProfile = (profile: UserProfile) => {
  try {
    localStorage.setItem(PROFILE_BACKUP_KEY, JSON.stringify({
      data: profile,
      updated_at: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to save local profile backup:', err);
  }
};

// Helper to debounce database updates


// User Store Interface
interface UserStore {
  profile: UserProfile;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;

  // Personal info actions
  updatePersonal: (updates: Partial<UserProfile['personal']>) => void;

  // Social links actions
  updateSocial: (updates: Partial<UserProfile['social']>) => void;
  addCustomSocialLink: (link: Omit<UserProfile['social']['custom'][0], 'id'>) => void;
  removeCustomSocialLink: (id: string) => void;
  updateCustomSocialLink: (id: string, updates: Partial<UserProfile['social']['custom'][0]>) => void;

  // Projects actions
  addProject: (project: Omit<UserProfile['projects'][0], 'id'>) => void;
  updateProject: (id: string, updates: Partial<UserProfile['projects'][0]>) => void;
  removeProject: (id: string) => void;

  // Experience actions
  addExperience: (experience: Omit<UserProfile['resume']['experience'][0], 'id'>) => void;
  updateExperience: (id: string, updates: Partial<UserProfile['resume']['experience'][0]>) => void;
  removeExperience: (id: string) => void;

  // Education actions
  addEducation: (education: Omit<UserProfile['resume']['education'][0], 'id'>) => void;
  updateEducation: (id: string, updates: Partial<UserProfile['resume']['education'][0]>) => void;
  removeEducation: (id: string) => void;

  // Certification actions
  addCertification: (certification: Omit<UserProfile['resume']['certifications'][0], 'id'>) => void;
  updateCertification: (id: string, updates: Partial<UserProfile['resume']['certifications'][0]>) => void;
  removeCertification: (id: string) => void;

  // Skills actions
  addSkillCategory: (category: Omit<UserProfile['skills']['categories'][0], 'id'>) => void;
  updateSkillCategory: (id: string, updates: Partial<UserProfile['skills']['categories'][0]>) => void;
  removeSkillCategory: (id: string) => void;
  addSkillToCategory: (categoryId: string, skill: UserProfile['skills']['categories'][0]['skills'][0]) => void;
  removeSkillFromCategory: (categoryId: string, skillName: string) => void;

  // Resume summary
  updateResumeSummary: (summary: string) => void;

  // Preferences actions
  updatePreferences: (updates: Partial<UserProfile['preferences']>) => void;

  // Milestones actions
  addMilestone: (milestone: Omit<UserProfile['milestones'][0], 'id'>) => void;
  updateMilestone: (id: string, updates: Partial<UserProfile['milestones'][0]>) => void;
  removeMilestone: (id: string) => void;
  getMilestonesByYear: (year: number) => UserProfile['milestones'];
  getMilestonesByMonth: (year: number, month: number) => UserProfile['milestones'];

  // Utility actions
  seedCVProfile: () => Promise<{ success: boolean; error?: string }>;
  resetProfile: () => void;
  exportProfile: () => void;
  importProfile: (profileData: UserProfile) => void;
}

// Create the Zustand store
export const useUserStore = create<UserStore>((set, get) => {
  // Helper to debounce database updates
  let saveTimeout: ReturnType<typeof setTimeout>;
  const saveToFirestore = async (profile: UserProfile) => {
    saveLocalProfile(profile);
    if (!canWrite()) return;
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      if (!canWrite()) return;
      try {
        await setDoc(doc(db, 'os-site_content', 'profile'), {
          data: profile,
          updated_at: new Date().toISOString(),
        });
        if (get().error) set({ error: null });
      } catch (e: any) {
        console.error('Failed to save profile:', e);
        set({ error: 'Failed to save profile: ' + e.message });
      }
    }, 1000);
  };

  return {
    profile: defaultProfile,
    isLoading: true,
    error: null,

    fetchProfile: async () => {
      try {
        set({ isLoading: true, error: null });
        const localProfile = loadLocalProfile();
        const docSnap = await getDoc(doc(db, 'os-site_content', 'profile'));
        if (docSnap.exists() && docSnap.data().data) {
          const remoteProfile = { ...defaultProfile, ...docSnap.data().data as UserProfile };
          saveLocalProfile(remoteProfile);
          set({ profile: remoteProfile, isLoading: false });
        } else {
          const profile = localProfile ? { ...defaultProfile, ...localProfile } : defaultProfile;
          saveToFirestore(profile);
          set({ profile, isLoading: false });
        }

      } catch (err: any) {
        console.error('Error fetching profile:', err);
        const localProfile = loadLocalProfile();
        if (localProfile) {
          set({ profile: { ...defaultProfile, ...localProfile }, error: null, isLoading: false });
        } else {
          set({ error: err.message, isLoading: false });
        }
      }
    },

    // Personal info actions
    updatePersonal: (updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        personal: { ...state.profile.personal, ...updates },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    // Social links actions
    updateSocial: (updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        social: { ...state.profile.social, ...updates },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    addCustomSocialLink: (link) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        social: {
          ...state.profile.social,
          custom: [...state.profile.social.custom, { ...link, id: generateId() }]
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    removeCustomSocialLink: (id) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        social: {
          ...state.profile.social,
          custom: state.profile.social.custom.filter(l => l.id !== id)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    updateCustomSocialLink: (id, updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        social: {
          ...state.profile.social,
          custom: state.profile.social.custom.map(l => l.id === id ? { ...l, ...updates } : l)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    // Projects actions
    addProject: (project) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        projects: [...state.profile.projects, { ...project, id: generateId() }],
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    updateProject: (id, updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        projects: state.profile.projects.map(p => p.id === id ? { ...p, ...updates } : p),
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    removeProject: (id) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        projects: state.profile.projects.filter(p => p.id !== id),
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    // Experience actions
    addExperience: (experience) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          experience: [...state.profile.resume.experience, { ...experience, id: generateId() }]
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    updateExperience: (id, updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          experience: state.profile.resume.experience.map(e => e.id === id ? { ...e, ...updates } : e)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    removeExperience: (id) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          experience: state.profile.resume.experience.filter(e => e.id !== id)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    // Education actions
    addEducation: (education) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          education: [...state.profile.resume.education, { ...education, id: generateId() }]
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    updateEducation: (id, updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          education: state.profile.resume.education.map(e => e.id === id ? { ...e, ...updates } : e)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    removeEducation: (id) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          education: state.profile.resume.education.filter(e => e.id !== id)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    // Certification actions
    addCertification: (certification) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          certifications: [...state.profile.resume.certifications, { ...certification, id: generateId() }]
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    updateCertification: (id, updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          certifications: state.profile.resume.certifications.map(c => c.id === id ? { ...c, ...updates } : c)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    removeCertification: (id) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          certifications: state.profile.resume.certifications.filter(c => c.id !== id)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    // Skills actions
    addSkillCategory: (category) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        skills: {
          categories: [...state.profile.skills.categories, { ...category, id: generateId() }]
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    updateSkillCategory: (id, updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        skills: {
          categories: state.profile.skills.categories.map(c => c.id === id ? { ...c, ...updates } : c)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    removeSkillCategory: (id) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        skills: {
          categories: state.profile.skills.categories.filter(c => c.id !== id)
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    addSkillToCategory: (categoryId, skill) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        skills: {
          categories: state.profile.skills.categories.map(c =>
            c.id === categoryId
              ? { ...c, skills: [...c.skills, skill] }
              : c
          )
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    removeSkillFromCategory: (categoryId, skillName) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        skills: {
          categories: state.profile.skills.categories.map(c =>
            c.id === categoryId
              ? { ...c, skills: c.skills.filter(s => s.name !== skillName) }
              : c
          )
        },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    // Resume summary
    updateResumeSummary: (summary) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        resume: {
          ...state.profile.resume,
          summary
        }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },
    updatePreferences: (updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        preferences: { ...state.profile.preferences, ...updates },
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    // Milestones actions
    addMilestone: (milestone) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        milestones: [...state.profile.milestones, { ...milestone, id: generateId() }],
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    updateMilestone: (id, updates) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        milestones: state.profile.milestones.map(m => m.id === id ? { ...m, ...updates } : m),
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    removeMilestone: (id) => {
      const state = get();
      const newProfile = {
        ...state.profile,
        milestones: state.profile.milestones.filter(m => m.id !== id),
        metadata: { ...state.profile.metadata, lastModified: Date.now() }
      };
      set({ profile: newProfile });
      saveToFirestore(newProfile);
    },

    getMilestonesByYear: (year) => {
      const state = get();
      return state.profile.milestones.filter(m => {
        const milestoneYear = new Date(m.date).getFullYear();
        return milestoneYear === year;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    getMilestonesByMonth: (year, month) => {
      const state = get();
      return state.profile.milestones.filter(m => {
        const date = new Date(m.date);
        return date.getFullYear() === year && date.getMonth() === month;
      }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    seedCVProfile: async () => {
      const state = get();
      const seededProfile: UserProfile = {
        ...state.profile,
        personal: {
          ...cvProfileSeed.personal,
          photo: state.profile.personal.photo,
        },
        social: cvProfileSeed.social,
        resume: cvProfileSeed.resume,
        skills: cvProfileSeed.skills,
        projects: cvProfileSeed.projects,
        preferences: {
          ...state.profile.preferences,
          accentColor: state.profile.preferences.accentColor || cvProfileSeed.preferences.accentColor,
        },
        milestones: state.profile.milestones,
        metadata: {
          ...state.profile.metadata,
          lastModified: Date.now(),
          version: state.profile.metadata.version || cvProfileSeed.metadata.version,
        },
      };

      if (!canWrite()) {
        const email = auth.currentUser?.email ?? 'no signed-in user';
        const error = `CV profile was not published. Signed-in user is ${email}, but superuser must be ${SUPERUSER_EMAIL}.`;
        set({ error });
        return { success: false, error };
      }

      try {
        await setDoc(doc(db, 'os-site_content', 'profile'), {
          data: seededProfile,
          updated_at: new Date().toISOString(),
        });
        saveLocalProfile(seededProfile);
        set({ profile: seededProfile, error: null });
        return { success: true };
      } catch (e: any) {
        const error = `Failed to publish CV profile to Firebase: ${e.message}`;
        console.error(error, e);
        set({ error });
        return { success: false, error };
      }
    },

    resetProfile: () => {
      set({ profile: defaultProfile });
      saveToFirestore(defaultProfile);
    },

    exportProfile: () => {
      const state = get();
      const dataStr = JSON.stringify(state.profile, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio_profile_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },

    importProfile: (profileData) => {
      // Merge with default profile to ensure all required fields exist
      const mergedProfile = {
        ...defaultProfile,
        ...profileData,
        metadata: {
          ...defaultProfile.metadata,
          ...profileData.metadata,
          lastModified: Date.now()
        }
      };
      set({ profile: mergedProfile });
      saveToFirestore(mergedProfile);
    },
  };
});

