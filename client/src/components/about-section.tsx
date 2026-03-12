import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutSection() {
  const { t } = useLanguage();
  
  const skillCategories = [
    {
      name: t.about.skillCategories.frontend,
      skills: ["React.js", "TypeScript", "Next.js"]
    },
    {
      name: t.about.skillCategories.backend,
      skills: ["Java", "Spring Boot", "Node.js","REST", "PostgreSQL", "MongoDB"]
    },
    {
      name: t.about.skillCategories.sdet,
      skills: ["Selenium", "Selenium GRID", "Test Case design", "Framework Design", "JMeter"]
    },
    {
      name: t.about.skillCategories.cloudDevOps,
      skills: ["AWS", "Docker", "Jenkins", "CI/CD"]
    }
  ];

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-900 dark:text-white mb-4" data-testid="about-title">
            {t.about.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t.about.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <h3 className="text-2xl font-bold text-primary-800 dark:text-blue-400 mb-6">{t.about.journeyTitle}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed" data-testid="text-bio">
              {t.about.journeyText}
            </p>
            
            <h4 className="text-xl font-semibold text-primary-800 dark:text-blue-400 mb-4">{t.about.careerGoalsTitle}</h4>
            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
              {t.about.careerGoals.map((goal, index) => (
                <li key={index} className="flex items-center" data-testid={`goal-${index}`}>
                  <i className="fas fa-check text-blue-600 mr-3"></i>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-primary-800 dark:text-blue-400 mb-6">{t.about.skillsTitle}</h3>
            
            {skillCategories.map((category, categoryIndex) => (
              <div key={category.name} className="mb-8">
                <h4 className="text-lg font-semibold text-primary-700 dark:text-blue-300 mb-4" data-testid={`skill-category-${categoryIndex}`}>
                  {category.name}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skill}
                      className="bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-colors duration-200"
                      data-testid={`skill-${categoryIndex}-${skillIndex}`}
                    >
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}
