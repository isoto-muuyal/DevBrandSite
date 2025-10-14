import { useQuery } from "@tanstack/react-query";
import { type Article } from "@shared/schema";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";

export default function BlogPage() {
  const { t } = useLanguage();
  const { data: articles, isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation activeSection="blog" onSectionClick={() => {}} />
        <div className="pt-20 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-3xl lg:text-5xl font-bold text-primary-900 dark:text-white mb-4">{t.blog.pageTitle}</h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">{t.blog.loading}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation activeSection="blog" onSectionClick={() => {}} />
      {/* Header */}
      <header className="pt-16 bg-gradient-to-br from-primary-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a
            href="/"
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-8 transition-colors duration-200"
            data-testid="back-to-home"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.blog.backToHome}
          </a>
          <div className="text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-primary-900 dark:text-white mb-4" data-testid="blog-page-title">
              {t.blog.pageTitle}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              {t.blog.subtitle}
            </p>
          </div>
        </div>
      </header>

      {/* Articles */}
      <main className="py-20 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles && articles.length > 0 ? (
            <div className="space-y-12">
              {articles.map((article, index) => (
                <article
                  key={article.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300"
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
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span data-testid={`blog-article-date-${index}`}>{article.publishedDate}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1" />
                        <span data-testid={`blog-article-read-time-${index}`}>{article.readTime}</span>
                      </div>
                      
                      <h2 className="text-2xl font-bold text-primary-900 dark:text-white mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
                        <a href="#" data-testid={`blog-article-title-${index}`}>
                          {article.title}
                        </a>
                      </h2>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed text-lg" data-testid={`blog-article-excerpt-${index}`}>
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {article.tags.map((tag, tagIndex) => (
                            <span
                              key={tag}
                              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium"
                              data-testid={`blog-article-tag-${index}-${tagIndex}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <a
                          href="#"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          data-testid={`blog-article-read-more-${index}`}
                        >
                          {t.blog.readMore} →
                        </a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl text-gray-300 dark:text-gray-700 mb-6">📝</div>
              <h2 className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-4">{t.blog.noArticlesTitle}</h2>
              <p className="text-xl text-gray-500 dark:text-gray-500 mb-8">
                {t.blog.noArticlesMessage}
              </p>
              <a
                href="/"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.blog.backToHome}
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}