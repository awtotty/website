import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, ExternalLink, Github, Linkedin, Code2 } from "lucide-react";
                    <p className="text-muted-foreground text-sm mt-2">
                      Try searching for different keywords or technologies.
                    </p>

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { projects } from "~/data/projects";

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
                      className="hover:shadow-lg transition-shadow flex flex-col"
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {project.icon ? (
                              <Image
                                src={project.icon}
                                alt={`${project.title} favicon`}
                                width={24}
                                height={24}
                                className="rounded-sm"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Code2 className="h-6 w-6 text-muted-foreground" />
                            )}
                            {project.title}
                          </div>
                          <div className="flex gap-2">
                            {project.githubUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={project.githubUrl} target="_blank">
                                  <Github className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                            {project.blogUrl && (
                              <Button variant="outline" size="sm" asChild>
                                <Link href={project.blogUrl} target="_blank">
                                  <BookOpen className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <p className="text-muted-foreground mb-4">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex gap-2 w-full">
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
                      </CardFooter>
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
