// test gh
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Code2 } from "lucide-react";
<p className="text-muted-foreground text-sm mt-2">
  Try searching for different keywords or technologies.
</p>

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
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
              Here are some things I`&apos;`ve built.
            </p>

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
                        <CardTitle className="flex items-center gap-3">
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
                      </CardHeader>
                      <CardContent className="flex-1">
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
