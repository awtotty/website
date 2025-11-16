import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Code2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { projects } from "~/data/projects";
import { ColorCycleButton } from "~/components/ColorCycleButton";

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
      <ColorCycleButton />
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute top-40 -right-20 w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-16 relative z-10">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight pb-2">
              Austin Totty
            </h1>
            {/* Social Links */}
            <div className="flex justify-center gap-4 mb-12">
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="https://www.linkedin.com/in/austin-totty-90441a74/"
                  target="_blank"
                >
                  <Image
                    src="https://www.linkedin.com/favicon.ico"
                    alt="LinkedIn"
                    width={20}
                    height={20}
                    className="w-5 h-5 mr-2 object-contain"
                  />
                  LinkedIn
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="https://github.com/awtotty" target="_blank">
                  <div className="w-5 h-5 mr-2 bg-white rounded-full p-0.5 flex items-center justify-center">
                    <Image
                      src="https://github.com/favicon.ico"
                      alt="GitHub"
                      width={16}
                      height={16}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                  GitHub
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="https://austintotty.substack.com" target="_blank">
                  <Image
                    src="https://substack.com/favicon.ico"
                    alt="Substack"
                    width={20}
                    height={20}
                    className="w-5 h-5 mr-2 object-contain"
                  />
                  Substack
                </Link>
              </Button>
            </div>
          </section>

          {/* Projects Section */}
          <section>
            <h2 className="text-xl text-center md:text-2xl text-foreground mb-8 max-w-2xl mx-auto">
              Here are some things I&apos;ve built
            </h2>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.length > 0
                ? (
                  projects.map((project) => (
                    <Card
                      key={project.id}
                      className="flex flex-col backdrop-blur-sm"
                    >
                      <CardHeader />
                      <CardContent className="flex-1">
                        <CardTitle className="flex items-center gap-3 mb-4">
                          {project.icon ? (
                            <Image
                              src={project.icon}
                              alt={`${project.title} favicon`}
                              width={24}
                              height={24}
                              className="rounded-sm w-6 h-6 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <Code2 className="h-6 w-6 text-muted-foreground" />
                          )}
                          {project.title}
                        </CardTitle>
                        <p className="text-muted-foreground">
                          {project.description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <div className="flex flex-col gap-2 w-full">
                          {project.hasDetailPage && project.liveUrl ? (
                            <>
                              <Button variant="outline" asChild className="flex-1">
                                <Link href={`/projects/${project.id}`}>
                                  Learn More
                                </Link>
                              </Button>
                              <Button asChild className="flex-1">
                                <Link href={project.liveUrl} target="_blank">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Check it out!
                                </Link>
                              </Button>
                            </>
                          ) : project.hasDetailPage ? (
                            <Button asChild className="flex-1">
                              <Link href={`/projects/${project.id}`}>
                                Learn More
                              </Link>
                            </Button>
                          ) : project.liveUrl ? (
                            <Button asChild className="flex-1">
                              <Link href={project.liveUrl} target="_blank">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Check it out!
                              </Link>
                            </Button>
                          ) : (
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
