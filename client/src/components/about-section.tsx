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

  const certifications = [
    {
      name: "AWS Solutions Architect",
      issuer: "Amazon Web Services",
      date: "2023",
      icon: "fas fa-award"
    },
    {
      name: "Google Cloud Professional",
      issuer: "Google Cloud Platform",
      date: "2023",
      icon: "fas fa-certificate"
    },
    {
      name: "Kubernetes Administrator",
      issuer: "Cloud Native Computing Foundation",
      date: "2022",
      icon: "fas fa-medal"
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
            Passionate full-stack developer with expertise in modern web technologies and a drive for continuous learning.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          <div>
            <h3 className="text-2xl font-bold text-primary-800 mb-6">My Journey</h3>
            <p className="text-gray-600 mb-6 leading-relaxed" data-testid="text-bio">
              With over 5 years of experience in software development, I specialize in building scalable web applications using React, Node.js, and cloud technologies. My passion lies in creating efficient, user-friendly solutions that solve real-world problems.
            </p>
            <p className="text-gray-600 mb-6 leading-relaxed">
              I've worked with startups and established companies, leading development teams and architecting systems that handle millions of requests daily. My approach combines technical excellence with strategic thinking to deliver impactful results.
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

        {/* Certifications */}
        <div className="bg-gradient-to-r from-blue-50 to-primary-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-primary-800 mb-6 text-center" data-testid="certifications-title">
            Certifications & Achievements
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {certifications.map((cert, index) => (
              <div
                key={cert.name}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                data-testid={`certification-${index}`}
              >
                <div className="text-center">
                  <i className={`${cert.icon} text-3xl text-blue-600 mb-4`}></i>
                  <h4 className="font-semibold text-primary-800 mb-2">{cert.name}</h4>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  <p className="text-xs text-gray-500 mt-1">{cert.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
