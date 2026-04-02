import { useQuery } from "@tanstack/react-query";
import { type Article } from "@shared/schema";
import { ArrowLeft, Calendar, Clock, ExternalLink, Github } from "lucide-react";
import { useRoute } from "wouter";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function BlogEntryPage() {
  const [matched, params] = useRoute("/blog/:slug");
  const slug = matched ? params.slug : "";
  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ["/api/articles", slug],
    enabled: Boolean(slug),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation activeSection="blog" onSectionClick={() => {}} />
        <div className="mx-auto max-w-4xl px-4 py-28 sm:px-6 lg:px-8">
          <p className="text-lg text-gray-600 dark:text-gray-300">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation activeSection="blog" onSectionClick={() => {}} />
        <div className="mx-auto max-w-4xl px-4 py-28 sm:px-6 lg:px-8">
          <a
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </a>
          <h1 className="mt-6 text-4xl font-bold text-primary-900 dark:text-white">Article not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation activeSection="blog" onSectionClick={() => {}} />
      <main className="pt-16">
        <section className="bg-gradient-to-br from-primary-50 to-blue-50 py-16 dark:from-gray-800 dark:to-gray-900">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <a
              href="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </a>
            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="inline-flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  {article.publishedDate}
                </span>
                <span className="inline-flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  {article.readTime}
                </span>
              </div>
              <h1 className="text-4xl font-bold text-primary-900 dark:text-white">{article.title}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">{article.excerpt}</p>
              <div className="flex flex-wrap gap-3">
                {article.deployedUrl && (
                  <a
                    href={article.deployedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Deployed App
                  </a>
                )}
                {article.githubUrl && (
                  <a
                    href={article.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View GitHub Repo
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {article.imageUrl && (
              <img
                src={article.imageUrl}
                alt={`${article.title} cover`}
                className="mb-10 h-72 w-full rounded-2xl object-cover shadow-lg"
              />
            )}
            <article className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="whitespace-pre-wrap text-lg leading-8 text-gray-700 dark:text-gray-200">
                {article.content}
              </div>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
