import { useQuery } from "@tanstack/react-query";
import { type Project } from "@shared/schema";
import { ExternalLink, Github } from "lucide-react";

export default function ProjectsSection() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects/featured"],
  });

  const githubStats = {
    repos: 47,
    commits: 1247,
    stars: 156,
    followers: 89
  };

  if (isLoading) {
    return (
      <section id="projects" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Development":
        return "bg-blue-100 text-blue-800";
      case "Open Source":
        return "bg-purple-100 text-purple-800";
      case "Published":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section id="projects" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="projects-title">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A showcase of my recent work, from full-stack applications to microservices architecture and AI integrations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {projects?.map((project, index) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              data-testid={`project-card-${index}`}
            >
              <img
                src={project.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                alt={`${project.name} project screenshot`}
                className="w-full h-48 object-cover"
                data-testid={`project-image-${index}`}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-primary-900" data-testid={`project-title-${index}`}>
                    {project.name}
                  </h3>
                  <div className="flex space-x-2">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        data-testid={`project-github-${index}`}
                      >
                        <Github className="w-5 h-5" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        data-testid={`project-live-${index}`}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed" data-testid={`project-description-${index}`}>
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech, techIndex) => (
                    <span
                      key={tech}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}
                      data-testid={`project-tech-${index}-${techIndex}`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500" data-testid={`project-status-${index}`}>
                    {project.status}
                  </span>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    data-testid={`project-details-${index}`}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* GitHub Stats */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-primary-900 mb-4" data-testid="github-stats-title">
              GitHub Activity
            </h3>
            <p className="text-gray-600">Check out my open source contributions and code repositories</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div data-testid="github-repos">
              <div className="text-3xl font-bold text-blue-600 mb-2">{githubStats.repos}</div>
              <div className="text-gray-600">Repositories</div>
            </div>
            <div data-testid="github-commits">
              <div className="text-3xl font-bold text-green-600 mb-2">{githubStats.commits}</div>
              <div className="text-gray-600">Commits</div>
            </div>
            <div data-testid="github-stars">
              <div className="text-3xl font-bold text-purple-600 mb-2">{githubStats.stars}</div>
              <div className="text-gray-600">Stars</div>
            </div>
            <div data-testid="github-followers">
              <div className="text-3xl font-bold text-orange-600 mb-2">{githubStats.followers}</div>
              <div className="text-gray-600">Followers</div>
            </div>
          </div>
          <div className="text-center mt-8">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-primary-800 text-white px-6 py-3 rounded-lg hover:bg-primary-900 transition-colors duration-200"
              data-testid="github-profile-link"
            >
              <Github className="w-5 h-5" />
              <span>View GitHub Profile</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
