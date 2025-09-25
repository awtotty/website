import Head from "next/head";
import Link from "next/link";
import { BookOpen, ExternalLink, Github, Linkedin } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

const projects = [
  {
    id: "project-1",
    title: "Formula",
    description: "AI-powered forms that talk back to users",
    tags: ["LLM", "Nextjs", "TypeScript"],
    liveUrl: "https://formulaforms.app",
    blogUrl:
      "https://austintotty.substack.com/p/introducing-formula-ai-powered-forms",
    hasDetailPage: false,
  },
  {
    id: "project-2",
    title: "Kenmo",
    description:
      "Digital platform for sending and receiving Ken Kash, an educational currency used in the math classroom",
    tags: ["Nextjs", "Vercel", "Double-entry bookkeeping"],
    liveUrl: "https://kenmo.in",
    githubUrl: "https://github.com/awtotty/kenmo-v2",
    hasDetailPage: false,
  },
];

export default function Home() {
  return (
    <>
      <Head>
        <title>Austin Totty - Portfolio</title>
        <meta
          name="description"
          content="Full-stack developer specializing in modern web technologies"
        />
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
              I like building things. You can see some of those things below.
            </p>

            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-12">
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="https://www.linkedin.com/in/austin-totty-90441a74/"
                  target="_blank"
                >
                  <Linkedin className="h-5 w-5 mr-2" />
                  LinkedIn
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="https://github.com/awtotty" target="_blank">
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
            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.length > 0
                ? (
                  projects.map((project) => (
                    <Card
                      key={project.id}
                      className="hover:shadow-lg transition-shadow"
                    >
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
                        <p className="text-muted-foreground mb-4">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          {project.hasDetailPage
                            ? (
                              <Button asChild className="flex-1">
                                <Link href={`/projects/${project.id}`}>
                                  Learn More
                                </Link>
                              </Button>
                            )
                            : project.liveUrl
                            ? (
                              <Button asChild className="flex-1">
                                <Link href={project.liveUrl} target="_blank">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Check it out!
                                </Link>
                              </Button>
                            )
                            : (
                              <Button disabled className="flex-1">
                                Coming Soon
                              </Button>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )
                : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground text-lg">
                      There&amp;s nothing here :(
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
