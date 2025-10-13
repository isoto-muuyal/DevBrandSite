import { Github, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <div className="text-2xl font-bold mb-2" data-testid="footer-name">
              {t.footer.name}
            </div>
            <p className="text-gray-300">{t.footer.title}</p>
          </div>
          <div className="flex space-x-6">
            <a
              href="https://github.com/isoto-muuyal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              data-testid="footer-github"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/israel-soto-923649b8/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              data-testid="footer-linkedin"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="mailto:israel.soto@muuyal.tech"
              className="text-gray-300 hover:text-white transition-colors duration-200"
              data-testid="footer-email"
            >
              <Mail className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="text-center mt-6 text-gray-400">
          <p className="text-sm">
            <strong>{t.footer.location}</strong> {t.footer.locationValue}
          </p>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-400" data-testid="footer-copyright">
            {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
