export default function HeroSection() {
  const handleViewWork = () => {
    const element = document.getElementById('projects');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetInTouch = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-900 mb-6 leading-tight">
              Full Stack Developer & <span className="text-blue-600">Tech Innovator</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Building scalable web applications with modern technologies. Passionate about microservices, AI integration, and creating exceptional user experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleViewWork}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 text-center"
                data-testid="button-view-work"
              >
                View My Work
              </button>
              <button
                onClick={handleGetInTouch}
                className="border-2 border-primary-800 text-primary-800 px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 hover:text-white transition-all duration-200 transform hover:scale-105 text-center"
                data-testid="button-get-in-touch"
              >
                Get In Touch
              </button>
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Developer workspace with multiple monitors showing code"
              className="rounded-2xl shadow-2xl w-full h-auto"
              data-testid="img-hero"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" data-testid="status-indicator"></div>
                <span className="text-sm font-medium text-gray-700">Available for new projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
