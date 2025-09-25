import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArrowLeft, Github, BookOpen, ExternalLink } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const projectDetails = {
  "project-1": {
    title: "Project Alpha",
    description: "A comprehensive full-stack web application that demonstrates modern development practices and scalable architecture patterns.",
    longDescription: `
      Project Alpha showcases a complete full-stack solution built with React, TypeScript, and Node.js.
      The application features a responsive design, real-time updates, and a robust backend API.

      Key features include:
      • User authentication and authorization
      • Real-time data synchronization
      • Responsive mobile-first design
      • Comprehensive test coverage
      • CI/CD pipeline integration

      This project demonstrates expertise in modern web development technologies and best practices for
      building production-ready applications.
    `,
    tags: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    liveUrl: "https://project-alpha.example.com",
    githubUrl: "https://github.com/austintotty/project-alpha",
    blogUrl: "https://austintotty.substack.com/p/building-project-alpha",
    technologies: [
      "Frontend: React 18 with TypeScript",
      "Backend: Node.js with Express",
      "Database: PostgreSQL with Prisma ORM",
      "Authentication: JWT with refresh tokens",
      "Deployment: Docker containers on AWS",
      "Testing: Jest and React Testing Library"
    ],
    challenges: [
      "Implementing real-time features with WebSocket connections",
      "Optimizing database queries for large datasets",
      "Managing complex state with multiple user roles",
      "Ensuring responsive design across all device sizes"
    ]
  },
  "project-3": {
    title: "Data Visualization Tool",
    description: "An interactive dashboard system for complex data analysis and visualization, built for enterprise-scale data processing.",
    longDescription: `
      This data visualization tool transforms complex datasets into interactive, meaningful visualizations.
      Built with D3.js and Python, it handles large-scale data processing and provides real-time analytics.

      The system features:
      • Interactive charts and graphs with D3.js
      • Real-time data streaming capabilities
      • Custom visualization components
      • Advanced filtering and search functionality
      • Export capabilities for reports and presentations

      The backend is powered by FastAPI for high-performance data processing, with Redis for caching
      and PostgreSQL for persistent storage.
    `,
    tags: ["D3.js", "Python", "FastAPI", "Redis", "PostgreSQL"],
    liveUrl: undefined,
    githubUrl: undefined,
    blogUrl: "https://austintotty.substack.com/p/data-viz-insights",
    technologies: [
      "Frontend: D3.js with TypeScript",
      "Backend: Python with FastAPI",
      "Database: PostgreSQL for data storage",
      "Cache: Redis for performance optimization",
      "Processing: Pandas and NumPy for data manipulation",
      "Deployment: Kubernetes cluster"
    ],
    challenges: [
      "Rendering thousands of data points efficiently",
      "Creating smooth animations for large datasets",
      "Implementing real-time data updates",
      "Optimizing performance for mobile devices"
    ]
  }
};

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const projectId = typeof id === 'string' ? id : '';
  const project = projectDetails[projectId as keyof typeof projectDetails];

  if (!project) {
    return (
      <>
        <Head>
          <title>Project Not Found - Austin Totty</title>
        </Head>
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
              <p className="text-muted-foreground mb-8">The project you&apos;re looking for doesn&apos;t exist.</p>
              <Button asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{project.title} - Austin Totty</title>
        <meta name="description" content={project.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          {/* Navigation */}
          <div className="mb-8">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Portfolio
              </Link>
            </Button>
          </div>

          {/* Project Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {project.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-6 max-w-3xl mx-auto">
              {project.description}
            </p>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              {project.liveUrl && (
                <Button size="lg" asChild>
                  <Link href={project.liveUrl} target="_blank">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Live Demo
                  </Link>
                </Button>
              )}
              {project.githubUrl && (
                <Button variant="outline" size="lg" asChild>
                  <Link href={project.githubUrl} target="_blank">
                    <Github className="h-5 w-5 mr-2" />
                    View Code
                  </Link>
                </Button>
              )}
              {project.blogUrl && (
                <Button variant="outline" size="lg" asChild>
                  <Link href={project.blogUrl} target="_blank">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Read Article
                  </Link>
                </Button>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2">
              {project.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Project Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About This Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    {project.longDescription.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Technologies Used */}
              <Card>
                <CardHeader>
                  <CardTitle>Technologies Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.technologies.map((tech, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {tech}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Key Challenges */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Challenges</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {project.challenges.map((challenge, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {challenge}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}