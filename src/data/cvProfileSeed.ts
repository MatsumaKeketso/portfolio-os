import type { UserProfile } from '../store/userStore';

export const cvProfileSeed: UserProfile = {
  personal: {
    name: 'Keketso Matsuma',
    title: 'Full Stack Developer & UI/UX Designer',
    subtitle: 'Product design, front-end development, and system-focused interface work',
    bio: [
      'My passion spans both design and development, as both disciplines are integral to the creation of intricate systems.',
      'In the context of our developing nation, the imperative for adept development skills has become increasingly pronounced. This commitment to honing my abilities reflects my dedication to contributing meaningfully to the technological landscape.',
      'Functional problem solver with experience solving problems where the solution is not immediately obvious, identifying underlying rules or principles, comparing alternatives, and building on past knowledge.'
    ],
    location: 'Pretoria, Gauteng, South Africa',
    email: '',
    phone: '',
  },

  social: {
    github: 'https://github.com/MatsumaKeketso',
    linkedin: '',
    website: '',
    custom: [],
  },

  resume: {
    summary: 'Full Stack Developer and UI/UX Designer with experience across product design, design systems, development handoff, front-end tooling, and application development training. Skilled in creating structured, responsive interfaces and working across both design and implementation contexts.',
    experience: [
      {
        id: 'munch-cloud-product-designer',
        company: 'munch.cloud',
        position: 'Product Designer',
        location: '',
        startDate: 'June 2024',
        endDate: 'Present',
        description: [
          'Manage and maintain design system usage across product work.',
          'Ensure the team uses Auto Layout in Figma to test responsiveness across 1440, 1080, and 720 layouts.',
          'Work with Figma local variables and explore ways to improve UI functionality.',
          'Structure design-to-development handovers so developers can implement designs more easily.'
        ],
        technologies: ['Figma', 'Auto Layout', 'Design Systems', 'Responsive Design', 'Design Handoff'],
      },
      {
        id: 'mlab-ui-ux-designer',
        company: 'mLab',
        position: 'UI/UX Designer',
        location: '',
        startDate: 'June 2020',
        endDate: 'June 2024',
        description: [
          'Worked across UI/UX design responsibilities in a product and digital skills environment.'
        ],
        technologies: ['UI/UX Design', 'Product Design', 'Figma', 'Design Thinking'],
      },
      {
        id: 'codeup-app-development',
        company: 'CodeUp',
        position: 'App Development Programme',
        location: '',
        startDate: 'November 2019',
        endDate: 'April 2020',
        description: [
          'Completed a four-month application development programme.'
        ],
        technologies: ['App Development'],
      },
      {
        id: 'codetribe-app-development',
        company: 'CodeTribe',
        position: 'App Development Programme',
        location: '',
        startDate: 'May 2019',
        endDate: 'October 2019',
        description: [
          'Completed a six-month application development programme.'
        ],
        technologies: ['App Development'],
      },
    ],
    education: [
      {
        id: 'swgc-it-computer-science',
        institution: 'South West Gauteng College',
        degree: 'Information Technology & Computer Science',
        field: 'Information Technology & Computer Science',
        startDate: '2016',
        endDate: '2018',
        achievements: [],
      },
      {
        id: 'thabo-senior-secondary-school',
        institution: 'Thabo Senior Secondary School',
        degree: 'Matric Certificate',
        field: 'Bachelors Degree',
        startDate: '2014',
        endDate: '2014',
        achievements: [],
      },
    ],
    certifications: [
      {
        id: 'udemy-node-express-mongodb-bootcamp',
        name: 'Node.js, Express, MongoDB & More: The Complete Bootcamp',
        issuer: 'Udemy',
        date: 'February 2024',
      },
      {
        id: 'udemy-ux-web-design-master-course',
        name: 'UX & Web Design Master Course: Strategy, Design, Development',
        issuer: 'Udemy',
        date: 'May 2022',
      },
      {
        id: 'domestika-products-of-the-future',
        name: 'Designing Products of the Future',
        issuer: 'Domestika',
        date: '2022',
      },
      {
        id: 'sayouth-problem-solving-test',
        name: 'Functional Problem Solving Test',
        issuer: 'SAYouth',
        date: '',
      },
    ],
  },

  skills: {
    categories: [
      {
        id: 'design',
        name: 'Design',
        skills: [
          { name: 'Adobe Photoshop', proficiency: 'Advanced' },
          { name: 'Adobe Illustrator', proficiency: 'Advanced' },
          { name: 'Adobe InDesign', proficiency: 'Intermediate' },
          { name: 'Adobe After Effects', proficiency: 'Intermediate' },
        ],
      },
      {
        id: 'programming',
        name: 'Programming',
        skills: [
          { name: 'Python', proficiency: 'Intermediate' },
          { name: 'JavaScript', proficiency: 'Advanced' },
          { name: 'ExpressJS', proficiency: 'Intermediate' },
          { name: 'ReactJS', proficiency: 'Advanced' },
          { name: 'MongoDB', proficiency: 'Intermediate' },
          { name: 'React Native', proficiency: 'Intermediate' },
          { name: 'Firebase', proficiency: 'Intermediate' },
          { name: 'Angular', proficiency: 'Intermediate' },
        ],
      },
      {
        id: 'ui-ux',
        name: 'UI/UX',
        skills: [
          { name: 'Adobe XD', proficiency: 'Advanced' },
          { name: 'Framer', proficiency: 'Intermediate' },
          { name: 'Figma', proficiency: 'Advanced' },
          { name: 'Design Thinking', proficiency: 'Advanced' },
        ],
      },
    ],
  },

  projects: [],

  preferences: {
    accentColor: '#ef4444',
    fontSize: 'md',
    showEmail: false,
    showPhone: false,
  },

  milestones: [],

  metadata: {
    lastModified: Date.now(),
    version: '1.0.0',
  },
};
