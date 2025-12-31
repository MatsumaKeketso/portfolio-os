import { create } from 'zustand';

// Helper to generate unique IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

  metadata: {
    lastModified: number;
    version: string;
  };
}

// Default profile data
const defaultProfile: UserProfile = {
  personal: {
    name: 'Alex Portfolio',
    title: 'Full-Stack Software Engineer',
    subtitle: 'Building innovative web experiences',
    bio: [
      'Passionate software engineer with 5+ years of experience building scalable web applications and interactive user experiences. I specialize in modern JavaScript frameworks, cloud architecture, and creating delightful user interfaces that solve real-world problems.',
      'When I\'m not coding, you\'ll find me contributing to open-source projects, mentoring junior developers, or exploring the latest web technologies. I believe in writing clean, maintainable code and continuously learning to stay at the forefront of web development.'
    ],
    location: 'Johannesburg, South Africa',
    email: 'alex@example.com',
    phone: '+27 12 345 6789',
  },

  social: {
    github: 'https://github.com/alexportfolio',
    linkedin: 'https://linkedin.com/in/alexportfolio',
    twitter: 'https://twitter.com/alexportfolio',
    website: 'https://alexportfolio.dev',
    custom: [
      { id: '1', name: 'Base44', url: 'https://base44.co.za', icon: 'rocket' },
      { id: '2', name: 'Dev.to', url: 'https://dev.to/alexportfolio', icon: 'book-open' },
      { id: '3', name: 'CodePen', url: 'https://codepen.io/alexportfolio', icon: 'code' }
    ]
  },

  resume: {
    summary: 'Full-stack software engineer with 5+ years of experience designing and implementing scalable web applications. Proven track record of delivering high-quality solutions using modern technologies including React, TypeScript, Node.js, and cloud platforms. Strong advocate for clean code, test-driven development, and agile methodologies.',
    experience: [
      {
        id: generateId(),
        company: 'Tech Innovations Inc',
        position: 'Senior Full-Stack Engineer',
        location: 'Johannesburg, South Africa',
        startDate: '2022-03-01',
        endDate: 'Present',
        description: [
          'Led development of enterprise SaaS platform serving 10,000+ users',
          'Architected microservices infrastructure and implemented CI/CD pipelines, reducing deployment time by 60%',
          'Mentored team of 4 junior developers and conducted code reviews'
        ],
        technologies: ['React', 'TypeScript', 'Node.js', 'AWS', 'PostgreSQL', 'Docker']
      },
      {
        id: generateId(),
        company: 'StartupHub',
        position: 'Full-Stack Developer',
        location: 'Cape Town, South Africa',
        startDate: '2020-01-15',
        endDate: '2022-02-28',
        description: [
          'Built and maintained multiple client-facing web applications',
          'Developed RESTful APIs and integrated third-party services',
          'Collaborated with designers to implement responsive UI components and improve user experience'
        ],
        technologies: ['React', 'JavaScript', 'Express.js', 'MongoDB', 'Redis', 'Git']
      },
      {
        id: generateId(),
        company: 'Digital Solutions Ltd',
        position: 'Junior Developer',
        location: 'Pretoria, South Africa',
        startDate: '2019-06-01',
        endDate: '2019-12-31',
        description: [
          'Contributed to e-commerce platform development',
          'Implemented new features, fixed bugs, and wrote automated tests',
          'Participated in agile ceremonies and learned industry best practices'
        ],
        technologies: ['JavaScript', 'Vue.js', 'PHP', 'MySQL', 'HTML/CSS']
      }
    ],
    education: [
      {
        id: generateId(),
        institution: 'University of Johannesburg',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        startDate: '2015-02-01',
        endDate: '2018-11-30',
        gpa: '3.8/4.0',
        achievements: [
          'Dean\'s List - All semesters',
          'Best Final Year Project Award',
          'Computer Science Society President (2017-2018)'
        ]
      },
      {
        id: generateId(),
        institution: 'Online Learning Academy',
        degree: 'Certificate',
        field: 'Advanced React & TypeScript',
        startDate: '2021-01-01',
        endDate: '2021-03-31',
        achievements: ['Graduated with Distinction', 'Completed 50+ hands-on projects']
      }
    ],
    certifications: [
      {
        id: generateId(),
        name: 'AWS Certified Solutions Architect - Associate',
        issuer: 'Amazon Web Services',
        date: '2023-06-15',
        credentialId: 'AWS-ASA-123456',
        url: 'https://aws.amazon.com/certification'
      },
      {
        id: generateId(),
        name: 'Professional Scrum Master I (PSM I)',
        issuer: 'Scrum.org',
        date: '2022-09-20',
        credentialId: 'PSM-789012'
      },
      {
        id: generateId(),
        name: 'MongoDB Certified Developer',
        issuer: 'MongoDB University',
        date: '2021-11-10',
        url: 'https://university.mongodb.com'
      }
    ]
  },

  skills: {
    categories: [
      {
        id: generateId(),
        name: 'Frontend Development',
        skills: [
          { name: 'React', proficiency: 'Expert', yearsOfExperience: 5 },
          { name: 'TypeScript', proficiency: 'Expert', yearsOfExperience: 4 },
          { name: 'Next.js', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'Tailwind CSS', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'Vue.js', proficiency: 'Intermediate', yearsOfExperience: 2 },
          { name: 'HTML/CSS', proficiency: 'Expert', yearsOfExperience: 6 }
        ]
      },
      {
        id: generateId(),
        name: 'Backend Development',
        skills: [
          { name: 'Node.js', proficiency: 'Expert', yearsOfExperience: 5 },
          { name: 'Express.js', proficiency: 'Advanced', yearsOfExperience: 4 },
          { name: 'Python', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'GraphQL', proficiency: 'Intermediate', yearsOfExperience: 2 },
          { name: 'REST APIs', proficiency: 'Expert', yearsOfExperience: 5 }
        ]
      },
      {
        id: generateId(),
        name: 'Database & DevOps',
        skills: [
          { name: 'PostgreSQL', proficiency: 'Advanced', yearsOfExperience: 4 },
          { name: 'MongoDB', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'Redis', proficiency: 'Intermediate', yearsOfExperience: 2 },
          { name: 'Docker', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'AWS', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'CI/CD', proficiency: 'Advanced', yearsOfExperience: 4 }
        ]
      },
      {
        id: generateId(),
        name: 'Tools & Methodologies',
        skills: [
          { name: 'Git', proficiency: 'Expert', yearsOfExperience: 6 },
          { name: 'Agile/Scrum', proficiency: 'Advanced', yearsOfExperience: 4 },
          { name: 'Jest/Testing', proficiency: 'Advanced', yearsOfExperience: 4 },
          { name: 'Webpack/Vite', proficiency: 'Intermediate', yearsOfExperience: 3 }
        ]
      }
    ]
  },

  projects: [
    {
      id: generateId(),
      name: 'PortfolioOS',
      description: 'An innovative desktop OS-style portfolio platform built with React and TypeScript. Features a window management system, customizable desktop, and modular app architecture.',
      longDescription: 'PortfolioOS reimagines the traditional portfolio website by creating an interactive desktop operating system experience in the browser. Users can manage multiple windowed applications, customize their desktop environment, and showcase their work in a unique, memorable way.',
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Framer Motion', 'Vite'],
      images: [],
      links: {
        live: 'https://portfolioos.dev',
        github: 'https://github.com/alexportfolio/portfolioos'
      },
      featured: true,
      startDate: '2024-11-01',
      status: 'Completed'
    },
    {
      id: generateId(),
      name: 'NailHub Social',
      description: 'A social networking platform connecting nail artists and enthusiasts. Features include portfolio showcases, booking system, and community engagement tools.',
      longDescription: 'NailHub bridges the gap between nail artists and clients with a comprehensive platform featuring artist portfolios, service booking, real-time availability, and a vibrant community. Built with scalability in mind to serve thousands of users.',
      technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS S3', 'Stripe'],
      images: [],
      links: { live: 'https://www.nailhub.co.za', github: 'https://github.com/alexportfolio/nailhub' },
      featured: true,
      startDate: '2023-06-01',
      endDate: '2024-01-15',
      status: 'Completed'
    },
    {
      id: generateId(),
      name: 'Delegation Coach AI',
      description: 'AI-powered task delegation assistant that helps managers effectively assign tasks based on team members\' skills, availability, and workload.',
      longDescription: 'Leverages machine learning to analyze team dynamics and suggest optimal task assignments. Integrates with project management tools and provides insights on team productivity and capacity planning.',
      technologies: ['React', 'TypeScript', 'Python', 'TensorFlow', 'FastAPI', 'PostgreSQL'],
      images: [],
      links: { github: 'https://github.com/alexportfolio/delegation-coach' },
      featured: true,
      startDate: '2024-08-01',
      status: 'In Progress'
    },
    {
      id: generateId(),
      name: '3D ShapeShift Visualizer',
      description: 'Interactive 3D modeling tool for creating and manipulating geometric shapes in real-time using WebGL.',
      technologies: ['Three.js', 'React', 'WebGL', 'TypeScript'],
      images: [],
      links: {
        live: 'https://shapeshift.demo.dev',
        github: 'https://github.com/alexportfolio/3d-shapeshift'
      },
      featured: false,
      startDate: '2023-03-01',
      endDate: '2023-05-30',
      status: 'Completed'
    },
    {
      id: generateId(),
      name: 'Real-Time Analytics Dashboard',
      description: 'Enterprise analytics platform with real-time data visualization, custom metrics, and automated reporting.',
      technologies: ['React', 'D3.js', 'Socket.io', 'Node.js', 'ClickHouse'],
      images: [],
      links: {},
      featured: false,
      status: 'Completed'
    }
  ],

  preferences: {
    accentColor: '#667eea',
    fontSize: 'md',
    showEmail: false,
    showPhone: false
  },

  metadata: {
    lastModified: Date.now(),
    version: '1.0.0'
  }
};

// Migration from old About app localStorage
interface OldAboutContent {
  title: string;
  subtitle: string;
  bio1: string;
  bio2: string;
  projects: Array<{ name: string; description: string }>;
}

const migrateFromOldAbout = (): UserProfile | null => {
  const oldAbout = localStorage.getItem('portfolioOS_about');
  if (!oldAbout) return null;

  try {
    const parsed: OldAboutContent = JSON.parse(oldAbout);

    return {
      ...defaultProfile,
      personal: {
        ...defaultProfile.personal,
        name: parsed.title,
        title: parsed.subtitle,
        bio: [parsed.bio1, parsed.bio2]
      },
      projects: parsed.projects.map((p, index) => ({
        id: generateId(),
        name: p.name,
        description: p.description,
        technologies: [],
        images: [],
        links: {},
        featured: true,
        status: 'Completed' as const,
      })),
      metadata: {
        lastModified: Date.now(),
        version: '1.0.0'
      }
    };
  } catch (e) {
    console.error('Failed to migrate old About data:', e);
    return null;
  }
};

// Load profile from localStorage
const loadProfileFromStorage = (): UserProfile => {
  const stored = localStorage.getItem('portfolioOS_userProfile');

  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse userProfile from localStorage:', e);
      return defaultProfile;
    }
  }

  // Check for migration from old About app
  const migrated = migrateFromOldAbout();
  if (migrated) {
    // Save migrated data
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(migrated));
    return migrated;
  }

  return defaultProfile;
};

// User Store Interface
interface UserStore {
  profile: UserProfile;

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

  // Utility actions
  exportProfile: () => string;
  importProfile: (json: string) => boolean;
  resetProfile: () => void;
}

// Create the Zustand store
export const useUserStore = create<UserStore>((set, get) => ({
  profile: loadProfileFromStorage(),

  // Personal info actions
  updatePersonal: (updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      personal: { ...state.profile.personal, ...updates },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Social links actions
  updateSocial: (updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      social: { ...state.profile.social, ...updates },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  addCustomSocialLink: (link) => set((state) => {
    const newProfile = {
      ...state.profile,
      social: {
        ...state.profile.social,
        custom: [...state.profile.social.custom, { ...link, id: generateId() }]
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  removeCustomSocialLink: (id) => set((state) => {
    const newProfile = {
      ...state.profile,
      social: {
        ...state.profile.social,
        custom: state.profile.social.custom.filter(l => l.id !== id)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  updateCustomSocialLink: (id, updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      social: {
        ...state.profile.social,
        custom: state.profile.social.custom.map(l => l.id === id ? { ...l, ...updates } : l)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Projects actions
  addProject: (project) => set((state) => {
    const newProfile = {
      ...state.profile,
      projects: [...state.profile.projects, { ...project, id: generateId() }],
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  updateProject: (id, updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      projects: state.profile.projects.map(p => p.id === id ? { ...p, ...updates } : p),
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  removeProject: (id) => set((state) => {
    const newProfile = {
      ...state.profile,
      projects: state.profile.projects.filter(p => p.id !== id),
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Experience actions
  addExperience: (experience) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        experience: [...state.profile.resume.experience, { ...experience, id: generateId() }]
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  updateExperience: (id, updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        experience: state.profile.resume.experience.map(e => e.id === id ? { ...e, ...updates } : e)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  removeExperience: (id) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        experience: state.profile.resume.experience.filter(e => e.id !== id)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Education actions
  addEducation: (education) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        education: [...state.profile.resume.education, { ...education, id: generateId() }]
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  updateEducation: (id, updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        education: state.profile.resume.education.map(e => e.id === id ? { ...e, ...updates } : e)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  removeEducation: (id) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        education: state.profile.resume.education.filter(e => e.id !== id)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Certification actions
  addCertification: (certification) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        certifications: [...state.profile.resume.certifications, { ...certification, id: generateId() }]
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  updateCertification: (id, updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        certifications: state.profile.resume.certifications.map(c => c.id === id ? { ...c, ...updates } : c)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  removeCertification: (id) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: {
        ...state.profile.resume,
        certifications: state.profile.resume.certifications.filter(c => c.id !== id)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Skills actions
  addSkillCategory: (category) => set((state) => {
    const newProfile = {
      ...state.profile,
      skills: {
        categories: [...state.profile.skills.categories, { ...category, id: generateId() }]
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  updateSkillCategory: (id, updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      skills: {
        categories: state.profile.skills.categories.map(c => c.id === id ? { ...c, ...updates } : c)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  removeSkillCategory: (id) => set((state) => {
    const newProfile = {
      ...state.profile,
      skills: {
        categories: state.profile.skills.categories.filter(c => c.id !== id)
      },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  addSkillToCategory: (categoryId, skill) => set((state) => {
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
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  removeSkillFromCategory: (categoryId, skillName) => set((state) => {
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
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Resume summary
  updateResumeSummary: (summary) => set((state) => {
    const newProfile = {
      ...state.profile,
      resume: { ...state.profile.resume, summary },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Preferences actions
  updatePreferences: (updates) => set((state) => {
    const newProfile = {
      ...state.profile,
      preferences: { ...state.profile.preferences, ...updates },
      metadata: { ...state.profile.metadata, lastModified: Date.now() }
    };
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
    return { profile: newProfile };
  }),

  // Utility actions
  exportProfile: () => {
    return JSON.stringify(get().profile, null, 2);
  },

  importProfile: (json) => {
    try {
      const imported: UserProfile = JSON.parse(json);

      // Basic validation
      if (!imported.personal || !imported.social || !imported.projects) {
        return false;
      }

      const newProfile = {
        ...imported,
        metadata: { ...imported.metadata, lastModified: Date.now() }
      };

      localStorage.setItem('portfolioOS_userProfile', JSON.stringify(newProfile));
      set({ profile: newProfile });
      return true;
    } catch (e) {
      console.error('Failed to import profile:', e);
      return false;
    }
  },

  resetProfile: () => set(() => {
    localStorage.setItem('portfolioOS_userProfile', JSON.stringify(defaultProfile));
    return { profile: defaultProfile };
  })
}));
