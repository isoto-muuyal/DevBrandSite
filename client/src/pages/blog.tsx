import { useQuery } from "@tanstack/react-query";
import { type Article } from "@shared/schema";
import { Calendar, Clock, ArrowLeft } from "lucide-react";

export default function BlogPage() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4">Blog</h1>
            <p className="text-xl text-gray-600">Loading articles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-br from-primary-50 to-blue-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8 transition-colors duration-200"
            data-testid="back-to-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </a>
          <div className="text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="blog-page-title">
              Blog & Articles
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sharing insights, tutorials, and thoughts on modern web development and technology trends.
            </p>
          </div>
        </div>
      </header>

      {/* Articles */}
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles && articles.length > 0 ? (
            <div className="space-y-12">
              {articles.map((article, index) => (
                <article
                  key={article.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  data-testid={`blog-article-${index}`}
                >
                  <div className="grid lg:grid-cols-3 gap-0">
                    <div className="lg:col-span-1">
                      <img
                        src={article.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                        alt={`${article.title} illustration`}
                        className="w-full h-64 lg:h-full object-cover"
                        data-testid={`blog-article-image-${index}`}
                      />
                    </div>
                    <div className="lg:col-span-2 p-8">
                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span data-testid={`blog-article-date-${index}`}>{article.publishedDate}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span data-testid={`blog-article-read-time-${index}`}>{article.readTime}</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-primary-900 mb-4 hover:text-blue-600 transition-colors duration-200">
                        <a href="#" data-testid={`blog-article-title-${index}`}>
                          {article.title}
                        </a>
                      </h2>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed text-lg" data-testid={`blog-article-excerpt-${index}`}>
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {article.tags.map((tag, tagIndex) => (
                            <span
                              key={tag}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                              data-testid={`blog-article-tag-${index}-${tagIndex}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <a
                          href="#"
                          className="text-blue-600 hover:text-blue-700 font-medium"
                          data-testid={`blog-article-read-more-${index}`}
                        >
                          Read Full Article →
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl text-gray-300 mb-6">📝</div>
              <h2 className="text-3xl font-bold text-gray-600 mb-4">No Articles Published Yet</h2>
              <p className="text-xl text-gray-500 mb-8">
                Articles will appear here when added to the articles.json file.
              </p>
              <a
                href="/"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}