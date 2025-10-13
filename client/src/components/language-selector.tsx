import { useLanguage } from "@/contexts/LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center space-x-2" data-testid="language-selector">
      <button
        onClick={() => setLanguage("en")}
        className={`transition-all duration-200 ${
          language === "en" 
            ? "opacity-100 scale-110 ring-2 ring-blue-600 ring-offset-2 rounded-md" 
            : "opacity-60 hover:opacity-100"
        }`}
        title="English"
        data-testid="language-en"
      >
        <span className="text-2xl">🇺🇸</span>
      </button>
      <button
        onClick={() => setLanguage("es")}
        className={`transition-all duration-200 ${
          language === "es" 
            ? "opacity-100 scale-110 ring-2 ring-blue-600 ring-offset-2 rounded-md" 
            : "opacity-60 hover:opacity-100"
        }`}
        title="Español"
        data-testid="language-es"
      >
        <span className="text-2xl">🇲🇽</span>
      </button>
    </div>
  );
}
