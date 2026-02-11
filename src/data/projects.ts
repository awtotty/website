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
    id: "orc",
    title: "orc",
    description: "CLI for orchestrating multiple AI coding agents working on the same project simultaneously",
    tags: ["Python", "CLI", "AI Agents", "Multi-Agent"],
    githubUrl: "https://github.com/awtotty/orc",
    hasDetailPage: true,
    longDescription: `
      orc is a CLI-based orchestration system for managing multi-agent AI coding workflows. It enables developers to coordinate multiple AI agents (powered by Claude Code) working on the same project simultaneously — breaking down complex tasks, delegating to specialized workers, and monitoring progress through an elegant CLI and web dashboard.

      Key features include:
      • Multi-agent architecture with an orchestrator (@main) that delegates work to isolated worker rooms
      • Filesystem-based communication through JSON inboxes, status files, and molecule/atom work items
      • Git worktree isolation so each worker operates on its own branch without conflicts
      • Role-based system prompts that teach agents how to use the orc protocol
      • Docker sandbox environment with all development tools pre-installed
      • Interactive web dashboard for real-time monitoring of agents, rooms, and statuses
      • Tmux integration for live terminal access to each agent session
      • Universe system for coordinating work across multiple repositories

      The workflow is simple: run orc start to provision a sandbox, orc init to set up the orchestration structure, then tell the orchestrator what to build. It breaks work into atoms, spins up worker rooms with dedicated git branches, delegates tasks via inbox messages, and monitors progress — all while you watch from the web dashboard or CLI.

      orc was built to solve the problem of managing complex, multi-file coding tasks that benefit from parallelism and specialization. Instead of one agent context-switching between concerns, orc lets you have dedicated agents for frontend, backend, testing, and more — each working independently but coordinated through the filesystem.
    `,
    technologies: [
      "Language: Python 3.11+",
      "CLI Framework: Click + Rich",
      "Web Dashboard: HTML5 SPA with WebSockets",
      "Containerization: Docker",
      "Session Management: tmux",
      "AI Integration: Claude Code",
      "Version Control: Git worktrees for parallel branches"
    ],
    challenges: [
      "Designing a reliable filesystem-based inter-agent communication protocol",
      "Managing git worktree lifecycle and branch coordination across parallel workers",
      "Building a real-time web dashboard that monitors distributed agent state",
      "Keeping agent context focused while orchestrating complex multi-step workflows"
    ]
  },
  {
    id: "formula",
    title: "Formula",
    description: "AI-powered forms that have a conversation with responders",
    tags: ["LLM", "Nextjs", "TypeScript"],
    liveUrl: "https://formulaforms.app",
    blogUrl: "https://austintotty.substack.com/p/introducing-formula-ai-powered-forms",
    hasDetailPage: true,
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
    hasDetailPage: true,
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

export const getProjectsWithDetailPages = (): Project[] => {
  return projects.filter(project => project.hasDetailPage);
};
