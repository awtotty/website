export interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  liveUrl?: string;
  githubUrl?: string;
  blogUrl?: string;
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
    icon: "https://formulaforms.app/favicon.ico",
    longDescription: `
      Formula Forms is an AI-powered form creation platform that revolutionizes data collection through intelligent, conversational form experiences. Unlike traditional static forms, Formula creates dynamic questionnaires that adapt and respond to users in real-time.

      Key features include:
      • AI Form Assistant that generates complete questionnaires from simple descriptions
      • Conversational forms that dynamically adapt based on user responses
      • Multiple embedding options including popups and chat widgets
      • Unlimited forms and responses with detailed analytics
      • Real-time form adaptation for improved user engagement

      Built for creators, educators, sales teams, and researchers, Formula Forms makes data collection more engaging and intelligent. The platform offers both free and premium tiers, with the premium version unlocking advanced AI-powered conversation features and form generation capabilities.

      This project demonstrates expertise in modern AI integration, user experience design, and building scalable SaaS platforms with complex interactive features. 
      Check out the blog post linked at the top of this page for more on the process of creating this application. 
    `, 
    technologies: [
      "Frontend: Next.js with React 18",
      "Backend: tRPC",
      "Database: Supabase PostgreSQL with Prisma ORM",
      "Authentication: NextAuth",
      "Deployment: Vercel",
      "UI: Shadcn, Tailwind",
      "Purchases: Stripe"
    ], 
    challenges: [
      "Cost-efficient use of LLMs", 
      "Maintaining Claude Code output quality as complexity grows", 
      "First time setting up Stripe and Google Ads"
    ],
  },
  {
    id: "kenmo",
    title: "Kenmo",
    description: "Digital platform for sending and receiving Ken Cash, an educational currency used in the math classroom",
    tags: ["Nextjs", "Vercel", "Ledger"],
    liveUrl: "https://kenmo.in",
    githubUrl: "https://github.com/awtotty/kenmo-v2",
    icon: "https://kenmo.in/favicon.ico",
    longDescription: `
      Kenmo is a comprehensive digital platform that facilitates the use of Ken Cash, a fake currency designed for educational purposes in math classrooms. The platform enables teachers to create engaging, real-world financial scenarios for students while teaching mathematical concepts.

      Key features include:
      • Digital wallet system for students and teachers
      • Transaction history and ledger management
      • Real-time balance updates and notifications
      • Double-entry bookkeeping system for accuracy
      • Mobile-responsive design for accessibility

      Built with modern web technologies, Kenmo provides a secure and scalable solution for educational institutions looking to gamify financial literacy and mathematical learning.
    `,
    technologies: [
      "Frontend: Next.js with React 18",
      "Backend: tRPC",
      "Database: Supabase PostgreSQL with Prisma ORM",
      "Authentication: Clerk",
      "Deployment: Vercel",
      "UI: Tailwind"
    ],
    challenges: [
      "Implementing reliable double-entry bookkeeping system",
      "Ensuring transaction consistency and data integrity",
      "Creating intuitive user interface for educational use",
      "Designing secure authentication for students"
    ]
  },
];

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};
