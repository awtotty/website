import Head from "next/head";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Github, Linkedin, BookOpen, ExternalLink, Search } from "lucide-react";
import Fuse from "fuse.js";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";

const projects = [
  {
    id: "project-1",
    title: "Project Alpha",
    description: "A full-stack web application built with modern technologies",
    tags: ["React", "TypeScript", "Node.js"],
    liveUrl: "https://project-alpha.example.com",
    githubUrl: "https://github.com/austintotty/project-alpha",
    blogUrl: "https://austintotty.substack.com/p/building-project-alpha",
    hasDetailPage: true,
  },
  {
    id: "project-2",
    title: "API Gateway",
    description: "High-performance API gateway for microservices architecture",
    tags: ["Go", "Docker", "Kubernetes"],
    liveUrl: "https://api-gateway.example.com",
    githubUrl: "https://github.com/austintotty/api-gateway",
    hasDetailPage: false,
  },
  {
    id: "project-3",
    title: "Data Visualization Tool",
    description: "Interactive dashboards for complex data analysis",
    tags: ["D3.js", "Python", "FastAPI"],
    blogUrl: "https://austintotty.substack.com/p/data-viz-insights",
    hasDetailPage: true,
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Configure Fuse.js for fuzzy search
  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: [
          { name: "title", weight: 0.4 },
          { name: "description", weight: 0.3 },
          { name: "tags", weight: 0.3 },
        ],
        threshold: 0.4,
        includeScore: true,
      }),
    []
  );

  // Filter projects based on search query
  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [searchQuery, fuse]);

  return (
    <>
      <Head>
        <title>Austin Totty - Developer Portfolio</title>
        <meta name="description" content="Full-stack developer specializing in modern web technologies" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Austin Totty
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Full-stack developer passionate about building scalable applications
              and sharing insights about modern web development.
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-12">
              <Button variant="outline" size="lg" asChild>
                <Link href="https://linkedin.com/in/austintotty" target="_blank">
                  <Linkedin className="h-5 w-5 mr-2" />
                  LinkedIn
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="https://github.com/austintotty" target="_blank">
                  <Github className="h-5 w-5 mr-2" />
                  GitHub
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="https://austintotty.substack.com" target="_blank">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Substack
                </Link>
              </Button>
            </div>
          </section>

          {/* Projects Section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">Featured Projects</h2>

            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search projects by title, description, or technology..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {project.title}
                      <div className="flex gap-2">
                        {project.githubUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={project.githubUrl} target="_blank">
                              <Github className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {project.blogUrl && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={project.blogUrl} target="_blank">
                              <BookOpen className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      {project.hasDetailPage ? (
                        <Button asChild className="flex-1">
                          <Link href={`/projects/${project.id}`}>
                            Learn More
                          </Link>
                        </Button>
                      ) : project.liveUrl ? (
                        <Button asChild className="flex-1">
                          <Link href={project.liveUrl} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Live Demo
                          </Link>
                        </Button>
                      ) : (
                        <Button disabled className="flex-1">
                          Coming Soon
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No projects found matching &quot;{searchQuery}&quot;
                  </p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Try searching for different keywords or technologies.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
