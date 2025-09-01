export default function AboutSection() {
  const skillCategories = [
    {
      name: "Frontend Development",
      skills: ["React.js", "TypeScript", "Tailwind CSS", "Next.js"]
    },
    {
      name: "Backend Development",
      skills: ["Node.js", "Spring Boot", "PostgreSQL", "MongoDB"]
    },
    {
      name: "Cloud & DevOps",
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"]
    }
  ];



  const careerGoals = [
    "Lead innovative tech projects at a forward-thinking company",
    "Contribute to open-source projects and developer community", 
    "Mentor junior developers and share knowledge through content",
    "Explore cutting-edge technologies like AI/ML integration"
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="about-title">
            About Me
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Passionate about new technology and how to solve problems with coding.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <h3 className="text-2xl font-bold text-primary-800 mb-6">My Journey</h3>
            <p className="text-gray-600 mb-6 leading-relaxed" data-testid="text-bio">
              I've worked on many roles with great results, I started as IT engineer and during 5 years progress to be in charge of projects overseas, IT specialist and more. Then I migrated to coding where I've worked for Hewlett-Packard for 7 years on multiple internal projects as well as for external clients. And the for the last 7 years I've work as a Technical Leader on diverse projects.
            </p>
            
            <h4 className="text-xl font-semibold text-primary-800 mb-4">Career Goals</h4>
            <ul className="space-y-2 text-gray-600">
              {careerGoals.map((goal, index) => (
                <li key={index} className="flex items-center" data-testid={`goal-${index}`}>
                  <i className="fas fa-check text-blue-600 mr-3"></i>
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-primary-800 mb-6">Skills & Technologies</h3>
            
            {skillCategories.map((category, categoryIndex) => (
              <div key={category.name} className="mb-8">
                <h4 className="text-lg font-semibold text-primary-700 mb-4" data-testid={`skill-category-${categoryIndex}`}>
                  {category.name}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {category.skills.map((skill, skillIndex) => (
                    <div
                      key={skill}
                      className="bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200"
                      data-testid={`skill-${categoryIndex}-${skillIndex}`}
                    >
                      <span className="text-sm font-medium text-gray-700">{skill}</span>
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
