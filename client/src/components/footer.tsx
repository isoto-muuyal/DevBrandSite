import { Github, Linkedin, Twitter, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="text-2xl font-bold mb-2" data-testid="footer-name">
              Alex Johnson
            </div>
            <p className="text-gray-300">Full Stack Developer & Tech Innovator</p>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              data-testid="footer-github"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              data-testid="footer-linkedin"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              data-testid="footer-twitter"
            >
              <Twitter className="w-6 h-6" />
            </a>
            <a
              href="mailto:alex.johnson@example.com"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              data-testid="footer-email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400" data-testid="footer-copyright">
            &copy; 2024 Alex Johnson. Built with passion and modern web technologies.
          </p>
        </div>
      </div>
    </footer>
  );
}
