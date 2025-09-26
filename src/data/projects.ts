export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  blogUrl?: string;
  hasDetailPage: boolean;
  icon?: string;
  longDescription?: string;
  technologies?: string[];
  challenges?: string[];
}

export const projects: Project[] = [
  {
    id: "formula",
    title: "Formula",
    description: "AI-powered forms that have a conversation with responders",
    tags: ["LLM", "Nextjs", "TypeScript"],
    liveUrl: "https://formulaforms.app",
    blogUrl: "https://austintotty.substack.com/p/introducing-formula-ai-powered-forms",
    hasDetailPage: false,
    icon: "/project_images/formula_favicon.ico",
  },
  {
    id: "kenmo",
    title: "Kenmo",
    description: "Digital platform for sending and receiving Ken Cash, an educational currency used in the math classroom",
    tags: ["Nextjs", "Vercel", "Ledger"],
    liveUrl: "https://kenmo.in",
    githubUrl: "https://github.com/awtotty/kenmo-v2",
    blogUrl: "test",
    hasDetailPage: true,
    icon: "/project_images/kenmo_favicon.ico",
    longDescription: `
      Kenmo is a comprehensive digital platform that facilitates the use of Ken Cash, a fake currency designed for educational purposes in math classrooms. The platform enables teachers to create engaging, real-world financial scenarios for students while teaching mathematical concepts.

      Key features include:
      • Digital wallet system for students and teachers
      • Transaction history and ledger management
      • Real-time balance updates and notifications
      • Classroom management tools for educators
      • Double-entry bookkeeping system for accuracy
      • Mobile-responsive design for accessibility

      Built with modern web technologies, Kenmo provides a secure and scalable solution for educational institutions looking to gamify financial literacy and mathematical learning.
    `,
    technologies: [
      "Frontend: Next.js with React 18",
      "Backend: Next.js API routes",
      "Database: PostgreSQL with Prisma ORM",
      "Authentication: NextAuth.js",
      "Deployment: Vercel platform",
      "Styling: Tailwind CSS"
    ],
    challenges: [
      "Implementing reliable double-entry bookkeeping system",
      "Ensuring transaction consistency and data integrity",
      "Creating intuitive user interface for educational use",
      "Managing real-time updates across multiple users",
      "Designing secure authentication for students"
    ]
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getProjectsWithDetailPages = (): Project[] => {
  return projects.filter(project => project.hasDetailPage);
};
