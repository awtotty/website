import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { getProjectById } from "~/data/projects";
import { ColorCycleButton } from "~/components/ColorCycleButton";

export default function ProjectDetail() {
  const router = useRouter();
  const { id } = router.query;

  const projectId = typeof id === 'string' ? id : '';
  const project = getProjectById(projectId);

  if (!project?.hasDetailPage) {
    return (
      <>
        <Head>
          <title>Project Not Found - Austin Totty</title>
        </Head>
        <ColorCycleButton />
        <main className="min-h-screen bg-background">
          <div className="mx-auto max-w-4xl px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
              <p className="text-muted-foreground mb-8">The project you&apos;re looking for doesn&apos;t exist or doesn&apos;t have a detail page.</p>
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
      <ColorCycleButton />
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-16">
          {/* Navigation */}
          <div className="mb-8">
            <Button variant="outline" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
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
                    Check it out! 
                  </Link>
                </Button>
              )}
              {project.githubUrl && (
                <Button variant="outline" size="lg" asChild>
                  <Link href={project.githubUrl} target="_blank">
                    <div className="w-5 h-5 mr-2 bg-white rounded-full p-0.5 flex items-center justify-center">
                      <Image
                        src="https://github.com/favicon.ico"
                        alt="GitHub"
                        width={16}
                        height={16}
                        className="w-4 h-4 object-contain"
                      />
                    </div>
                    Code
                  </Link>
                </Button>
              )}
              {project.blogUrl && (
                <Button variant="outline" size="lg" asChild>
                  <Link href={project.blogUrl} target="_blank">
                    <Image
                      src="https://substack.com/favicon.ico"
                      alt="Substack"
                      width={20}
                      height={20}
                      className="w-5 h-5 mr-2 object-contain"
                    />
                    Blog
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
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
            {/* Main Content */}
            <Card>
              <CardHeader />
              <CardContent>
                <CardTitle className="mb-4">About This Project</CardTitle>
                <div className="prose prose-gray max-w-none">
                  {project.longDescription?.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                        {paragraph.trim()}
                      </p>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sidebar */}
            <div className="flex flex-col gap-6 lg:w-[320px]">
              {/* Technologies Used */}
              <Card>
                <CardHeader />
                <CardContent>
                  <CardTitle className="mb-4">Technologies Used</CardTitle>
                  <ul className="space-y-2">
                    {project.technologies?.map((tech, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {tech}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Key Challenges */}
              <Card>
                <CardHeader />
                <CardContent>
                  <CardTitle className="mb-4">Key Challenges</CardTitle>
                  <ul className="space-y-2">
                    {project.challenges?.map((challenge, index) => (
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
