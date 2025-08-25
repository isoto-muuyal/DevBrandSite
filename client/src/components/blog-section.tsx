import { useQuery } from "@tanstack/react-query";
import { type Article } from "@shared/schema";
import { Calendar, Clock } from "lucide-react";

export default function BlogSection() {
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) {
    return (
      <section id="blog" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4">Latest Articles</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Loading articles...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="blog" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="blog-title">
            Latest Articles
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Sharing insights, tutorials, and thoughts on modern web development and technology trends.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {articles?.map((article, index) => (
            <article
              key={article.id}
              className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              data-testid={`article-card-${index}`}
            >
              <img
                src={article.imageUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400"}
                alt={`${article.title} illustration`}
                className="w-full h-48 object-cover"
                data-testid={`article-image-${index}`}
              />
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span data-testid={`article-date-${index}`}>{article.publishedDate}</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-1" />
                  <span data-testid={`article-read-time-${index}`}>{article.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-primary-900 mb-3 hover:text-blue-600 transition-colors duration-200">
                  <a href="#" data-testid={`article-title-${index}`}>
                    {article.title}
                  </a>
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed" data-testid={`article-excerpt-${index}`}>
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {article.tags.slice(0, 2).map((tag, tagIndex) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        data-testid={`article-tag-${index}-${tagIndex}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href="#"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    data-testid={`article-read-more-${index}`}
                  >
                    Read More →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="#"
            className="inline-flex items-center space-x-2 bg-primary-800 text-white px-6 py-3 rounded-lg hover:bg-primary-900 transition-colors duration-200"
            data-testid="view-all-articles"
          >
            <i className="fas fa-book-open"></i>
            <span>View All Articles</span>
          </a>
        </div>
      </div>
    </section>
  );
}
