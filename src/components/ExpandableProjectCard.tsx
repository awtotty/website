import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Code2, ChevronDown, ChevronUp } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { Project } from "~/data/projects";

interface ExpandableProjectCardProps {
  project: Project;
}

export function ExpandableProjectCard({ project }: ExpandableProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="flex flex-col backdrop-blur-sm transition-all duration-300">
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
        <p className="text-muted-foreground mb-4">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Expandable Content */}
        {(project.longDescription ?? project.technologies ?? project.challenges) && (
          <div
            className={`overflow-hidden transition-all duration-300 ${
              isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="pt-4 border-t border-border mt-4">
              {/* Long Description */}
              {project.longDescription && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-3">About This Project</h3>
                  <div className="space-y-3">
                    {project.longDescription.split('\n').map((paragraph, index) => (
                      paragraph.trim() && (
                        <p key={index} className="text-sm text-muted-foreground leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Technologies */}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-sm mb-3">Technologies Used</h3>
                  <ul className="space-y-2">
                    {project.technologies.map((tech, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Challenges */}
              {project.challenges && project.challenges.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-semibold text-sm mb-3">Key Challenges</h3>
                  <ul className="space-y-2">
                    {project.challenges.map((challenge, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        • {challenge}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="flex flex-col gap-2 w-full">
          {/* Action Buttons */}
          <div className="flex gap-2">
            {project.liveUrl && (
              <Button asChild className="flex-1">
                <Link href={project.liveUrl} target="_blank">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Check it out!
                </Link>
              </Button>
            )}
            {project.githubUrl && (
              <Button variant="outline" asChild className="flex-1">
                <Link href={project.githubUrl} target="_blank">
                  <div className="w-4 h-4 mr-2 bg-white rounded-full p-0.5 flex items-center justify-center">
                    <Image
                      src="https://github.com/favicon.ico"
                      alt="GitHub"
                      width={12}
                      height={12}
                      className="w-3 h-3 object-contain"
                    />
                  </div>
                  Code
                </Link>
              </Button>
            )}
            {project.blogUrl && (
              <Button variant="outline" asChild className="flex-1">
                <Link href={project.blogUrl} target="_blank">
                  <Image
                    src="https://substack.com/favicon.ico"
                    alt="Substack"
                    width={16}
                    height={16}
                    className="w-4 h-4 mr-2 object-contain"
                  />
                  Blog
                </Link>
              </Button>
            )}
          </div>

          {/* Expand/Collapse Button */}
          {(project.longDescription ?? project.technologies ?? project.challenges) && (
            <Button
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-2" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Learn More
                </>
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
