# Internationalization Deployment Guide

This guide lists all new files and modifications needed to add English/Spanish language support to your portfolio.

## NEW FILES TO CREATE

### 1. `client/src/locales/en.json` (93 lines)
Create this file with English translations - see full content below.

### 2. `client/src/locales/es.json` (93 lines)
Create this file with Spanish translations - see full content below.

### 3. `client/src/contexts/LanguageContext.tsx` (54 lines)
Create this file for language management - see full content below.

### 4. `client/src/components/language-selector.tsx` (34 lines)
Create this file for the flag buttons - see full content below.

---

## MODIFIED FILES - LINE BY LINE CHANGES

### `client/src/App.tsx`

**Line 1-8: ADD these imports**
```typescript
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";  // <-- ADD THIS LINE
import Home from "@/pages/home";
import BlogPage from "@/pages/blog";
import NotFound from "@/pages/not-found";
```

**Lines 20-29: WRAP with LanguageProvider**
```typescript
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>  {/* <-- ADD THIS WRAPPER */}
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>  {/* <-- ADD THIS CLOSING TAG */}
    </QueryClientProvider>
  );
}
```

---

### `client/src/components/navigation.tsx`

**Lines 1-4: ADD imports**
```typescript
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";  // <-- ADD
import LanguageSelector from "@/components/language-selector";  // <-- ADD
```

**Lines 9-18: REPLACE navItems definition**
```typescript
export default function Navigation({ activeSection, onSectionClick }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useLanguage();  // <-- ADD THIS LINE

  const navItems = [
    { id: "home", label: t.navigation.home },      // <-- CHANGE FROM "Home"
    { id: "about", label: t.navigation.about },    // <-- CHANGE FROM "About"
    { id: "projects", label: t.navigation.projects },  // <-- CHANGE FROM "Projects"
    { id: "blog", label: t.navigation.blog },      // <-- CHANGE FROM "Blog"
    { id: "contact", label: t.navigation.contact },  // <-- CHANGE FROM "Contact"
  ];
```

**Line 39-46: REPLACE the logo**
```typescript
<div className="font-bold text-xl text-primary-800" data-testid="nav-logo">
  {t.navigation.name}  {/* <-- CHANGE FROM "Israel Soto" */}
</div>
```

**Lines 44-66: REPLACE desktop navigation section**
```typescript
{/* Desktop Navigation */}
<div className="hidden md:flex items-center space-x-8">  {/* <-- ADD items-center */}
  {navItems.map((item) => (
    <button
      key={item.id}
      onClick={() => handleNavClick(item.id)}
      className={`transition-colors duration-200 ${
        activeSection === item.id
          ? "text-blue-600"
          : "text-gray-600 hover:text-blue-600"
      }`}
      data-testid={`nav-${item.id}`}
    >
      {item.label}
    </button>
  ))}
  <LanguageSelector />  {/* <-- ADD THIS LINE */}
</div>
```

**Lines 61-73: REPLACE mobile menu button**
```typescript
{/* Mobile Menu and Language Selector */}
<div className="md:hidden flex items-center space-x-4">  {/* <-- CHANGE wrapper */}
  <LanguageSelector />  {/* <-- ADD THIS */}
  <button
    className="text-gray-600"  {/* <-- REMOVE md:hidden class */}
    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    data-testid="mobile-menu-toggle"
  >
    {isMobileMenuOpen ? (
      <X className="h-6 w-6" />
    ) : (
      <Menu className="h-6 w-6" />
    )}
  </button>
</div>
```

---

### `client/src/components/hero-section.tsx`

**Line 1: ADD import at the top**
```typescript
import { useLanguage } from "@/contexts/LanguageContext";  // <-- ADD THIS
```

**Lines 1-3: ADD useLanguage hook**
```typescript
export default function HeroSection() {
  const { t } = useLanguage();  // <-- ADD THIS LINE
  
  const handleViewWork = () => {
```

**Lines 21-25: REPLACE title and subtitle**
```typescript
<h1 className="text-4xl lg:text-6xl font-bold text-primary-900 mb-6 leading-tight">
  {t.hero.title}<span className="text-blue-600">{t.hero.titleHighlight}</span>
</h1>
<p className="text-xl text-gray-600 mb-8 leading-relaxed">
  {t.hero.subtitle}
</p>
```

**Lines 28-34: REPLACE button text**
```typescript
<button
  onClick={handleViewWork}
  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 text-center"
  data-testid="button-view-work"
>
  {t.hero.viewWorkButton}  {/* <-- CHANGE FROM "View My Work" */}
</button>
```

**Lines 35-41: REPLACE second button**
```typescript
<button
  onClick={handleGetInTouch}
  className="border-2 border-primary-800 text-primary-800 px-8 py-3 rounded-lg font-semibold hover:bg-primary-800 hover:text-white transition-all duration-200 transform hover:scale-105 text-center"
  data-testid="button-get-in-touch"
>
  {t.hero.getInTouchButton}  {/* <-- CHANGE FROM "Get In Touch" */}
</button>
```

**Lines 45-48: REPLACE image alt text**
```typescript
<img
  src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
  alt={t.hero.imageAlt}  {/* <-- CHANGE FROM hardcoded text */}
  className="rounded-2xl shadow-2xl w-full h-auto"
  data-testid="img-hero"
/>
```

**Line 54: REPLACE status text**
```typescript
<span className="text-sm font-medium text-gray-700">{t.hero.availableStatus}</span>
{/* <-- CHANGE FROM "Available for new projects" */}
```

---

### `client/src/components/about-section.tsx`

**Line 1: ADD import**
```typescript
import { useLanguage } from "@/contexts/LanguageContext";  // <-- ADD THIS
```

**Lines 2-18: REPLACE with useLanguage and translated skill categories**
```typescript
export default function AboutSection() {
  const { t } = useLanguage();  // <-- ADD THIS
  
  const skillCategories = [
    {
      name: t.about.skillCategories.frontend,  // <-- CHANGE
      skills: ["React.js", "TypeScript", "Tailwind CSS", "Next.js"]
    },
    {
      name: t.about.skillCategories.backend,  // <-- CHANGE
      skills: ["Node.js", "Spring Boot", "PostgreSQL", "MongoDB"]
    },
    {
      name: t.about.skillCategories.cloudDevOps,  // <-- CHANGE
      skills: ["AWS", "Docker", "Kubernetes", "CI/CD"]
    }
  ];
```

**Lines 30-35: REPLACE titles and subtitle**
```typescript
<h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="about-title">
  {t.about.title}  {/* <-- CHANGE FROM "About Me" */}
</h2>
<p className="text-xl text-gray-600 max-w-3xl mx-auto">
  {t.about.subtitle}  {/* <-- CHANGE FROM hardcoded text */}
</p>
```

**Lines 38-42: REPLACE journey section**
```typescript
<h3 className="text-2xl font-bold text-primary-800 mb-6">{t.about.journeyTitle}</h3>
<p className="text-gray-600 mb-6 leading-relaxed" data-testid="text-bio">
  {t.about.journeyText}  {/* <-- CHANGE FROM hardcoded text */}
</p>

<h4 className="text-xl font-semibold text-primary-800 mb-4">{t.about.careerGoalsTitle}</h4>
```

**Lines 45-50: REPLACE goals mapping**
```typescript
<ul className="space-y-2 text-gray-600">
  {t.about.careerGoals.map((goal, index) => (  {/* <-- CHANGE from careerGoals array */}
    <li key={index} className="flex items-center" data-testid={`goal-${index}`}>
      <i className="fas fa-check text-blue-600 mr-3"></i>
      {goal}
    </li>
  ))}
</ul>
```

**Line 55: REPLACE skills title**
```typescript
<h3 className="text-2xl font-bold text-primary-800 mb-6">{t.about.skillsTitle}</h3>
{/* <-- CHANGE FROM "Skills & Technologies" */}
```

---

### `client/src/components/projects-section.tsx`

**Lines 1-4: ADD import**
```typescript
import { useQuery } from "@tanstack/react-query";
import { type Project } from "@shared/schema";
import { ExternalLink, Github } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";  // <-- ADD THIS
```

**Lines 5-7: ADD useLanguage**
```typescript
export default function ProjectsSection() {
  const { t } = useLanguage();  // <-- ADD THIS
  const { data: projects, isLoading } = useQuery<Project[]>({
```

**Lines 16-18: REPLACE loading state**
```typescript
<h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4">{t.projects.title}</h2>
<p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.projects.loading}</p>
```

**Lines 44-49: REPLACE main section titles**
```typescript
<h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="projects-title">
  {t.projects.title}  {/* <-- CHANGE FROM "Featured Projects" */}
</h2>
<p className="text-xl text-gray-600 max-w-3xl mx-auto">
  {t.projects.subtitle}  {/* <-- CHANGE FROM hardcoded text */}
</p>
```

**Line 120: REPLACE View Details button**
```typescript
{t.projects.viewDetails}  {/* <-- CHANGE FROM "View Details" */}
```

---

### `client/src/components/blog-section.tsx`

**Lines 1-4: ADD import**
```typescript
import { useQuery } from "@tanstack/react-query";
import { type Article } from "@shared/schema";
import { Calendar, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";  // <-- ADD THIS
```

**Lines 5-7: ADD useLanguage**
```typescript
export default function BlogSection() {
  const { t } = useLanguage();  // <-- ADD THIS
  const { data: articles, isLoading } = useQuery<Article[]>({
```

**Lines 15-17: REPLACE loading state**
```typescript
<h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4">{t.blog.title}</h2>
<p className="text-xl text-gray-600 max-w-3xl mx-auto">{t.blog.loading}</p>
```

**Lines 27-32: REPLACE section titles**
```typescript
<h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="blog-title">
  {t.blog.title}  {/* <-- CHANGE FROM "Latest Articles" */}
</h2>
<p className="text-xl text-gray-600 max-w-3xl mx-auto">
  {t.blog.subtitle}  {/* <-- CHANGE FROM hardcoded text */}
</p>
```

**Lines 93-96: REPLACE empty state**
```typescript
<h3 className="text-xl font-semibold text-gray-600 mb-2">{t.blog.noArticlesTitle}</h3>
<p className="text-gray-500">{t.blog.noArticlesMessage}</p>
```

**Line 107: REPLACE view all button**
```typescript
<span>{t.blog.viewAll}</span>  {/* <-- CHANGE FROM "View All Articles" */}
```

---

### `client/src/components/contact-section.tsx`

**Lines 1-12: ADD import**
```typescript
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactMessageSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, MapPin, Download, Github, Linkedin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";  // <-- ADD THIS
import type { z } from "zod";
```

**Lines 17-19: ADD useLanguage**
```typescript
export default function ContactSection() {
  const { t } = useLanguage();  // <-- ADD THIS
  const { toast } = useToast();
```

**Lines 36-44: REPLACE toast messages with translations**
```typescript
onSuccess: () => {
  toast({
    title: t.contact.successTitle,        // <-- CHANGE
    description: t.contact.successDescription,  // <-- CHANGE
  });
  form.reset();
},
onError: () => {
  toast({
    title: t.contact.errorTitle,          // <-- CHANGE
    description: t.contact.errorDescription,  // <-- CHANGE
    variant: "destructive",
  });
},
```

**Lines 65-77: REPLACE resume toast messages**
```typescript
toast({
  title: t.contact.resumeSuccessTitle,        // <-- CHANGE
  description: t.contact.resumeSuccessDescription,  // <-- CHANGE
});
// ... (in catch block)
toast({
  title: t.contact.resumeErrorTitle,          // <-- CHANGE
  description: t.contact.resumeErrorDescription,  // <-- CHANGE
  variant: "destructive",
});
```

**Lines 89-94: REPLACE section title**
```typescript
<h2 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="contact-title">
  {t.contact.title}  {/* <-- CHANGE FROM "Let's Work Together" */}
</h2>
<p className="text-xl text-gray-600 max-w-2xl mx-auto">
  {t.contact.subtitle}  {/* <-- CHANGE FROM hardcoded text */}
</p>
```

**Lines 100-140: REPLACE all contact information labels**
```typescript
<h3 className="text-2xl font-bold text-primary-800 mb-6">{t.contact.getInTouchTitle}</h3>
{/* ... Email section ... */}
<div className="font-medium text-primary-800">{t.contact.emailLabel}</div>
{/* ... LinkedIn section ... */}
<div className="font-medium text-primary-800">{t.contact.linkedinLabel}</div>
{/* ... GitHub section ... */}
<div className="font-medium text-primary-800">{t.contact.githubLabel}</div>
{/* ... Location section ... */}
<div className="font-medium text-primary-800">{t.contact.locationLabel}</div>
<div className="text-gray-600">{t.contact.locationValue}</div>

{/* Resume section */}
<h4 className="text-lg font-semibold text-primary-800 mb-3">{t.contact.resumeTitle}</h4>
<p className="text-gray-600 mb-4">{t.contact.resumeDescription}</p>
<span>{t.contact.downloadResume}</span>
```

**Line 157: REPLACE form title**
```typescript
<h3 className="text-2xl font-bold text-primary-800 mb-6">{t.contact.sendMessageTitle}</h3>
```

**Lines 165-246: REPLACE all form labels and placeholders**
```typescript
{/* Name field */}
<FormLabel>{t.contact.nameLabel}</FormLabel>
<Input placeholder={t.contact.namePlaceholder} ... />

{/* Email field */}
<FormLabel>{t.contact.emailLabel}</FormLabel>
<Input placeholder={t.contact.emailPlaceholder} ... />

{/* Subject field */}
<FormLabel>{t.contact.subjectLabel}</FormLabel>
<Input placeholder={t.contact.subjectPlaceholder} ... />

{/* Message field */}
<FormLabel>{t.contact.messageLabel}</FormLabel>
<Textarea placeholder={t.contact.messagePlaceholder} ... />

{/* Submit button */}
{contactMutation.isPending ? t.contact.sendingButton : t.contact.sendButton}
```

---

### `client/src/components/footer.tsx`

**Lines 1-2: ADD import**
```typescript
import { Github, Linkedin, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";  // <-- ADD THIS
```

**Lines 3-5: ADD useLanguage**
```typescript
export default function Footer() {
  const { t } = useLanguage();  // <-- ADD THIS
  
  return (
```

**Lines 9-12: REPLACE name and title**
```typescript
<div className="text-2xl font-bold mb-2" data-testid="footer-name">
  {t.footer.name}  {/* <-- CHANGE FROM "Israel Soto" */}
</div>
<p className="text-gray-300">{t.footer.title}</p>  {/* <-- CHANGE */}
```

**Lines 43-48: REPLACE location and copyright**
```typescript
<p className="text-sm">
  <strong>{t.footer.location}</strong> {t.footer.locationValue}  {/* <-- CHANGE */}
</p>
{/* ... */}
<p className="text-gray-400" data-testid="footer-copyright">
  {t.footer.copyright}  {/* <-- CHANGE FROM hardcoded text */}
</p>
```

---

### `client/src/pages/blog.tsx`

**Lines 1-5: ADD imports**
```typescript
import { useQuery } from "@tanstack/react-query";
import { type Article } from "@shared/schema";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";  // <-- ADD
import Navigation from "@/components/navigation";  // <-- ADD
import Footer from "@/components/footer";  // <-- ADD
```

**Lines 7-9: ADD useLanguage**
```typescript
export default function BlogPage() {
  const { t } = useLanguage();  // <-- ADD THIS
  const { data: articles, isLoading } = useQuery<Article[]>({
```

**Lines 13-25: REPLACE loading state with Navigation**
```typescript
if (isLoading) {
  return (
    <div className="min-h-screen bg-white">
      <Navigation activeSection="blog" onSectionClick={() => {}} />  {/* <-- ADD */}
      <div className="pt-20 py-20">  {/* <-- ADD pt-20 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4">{t.blog.pageTitle}</h1>
            <p className="text-xl text-gray-600">{t.blog.loading}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**Lines 29-33: ADD Navigation and change header padding**
```typescript
return (
  <div className="min-h-screen bg-white">
    <Navigation activeSection="blog" onSectionClick={() => {}} />  {/* <-- ADD */}
    {/* Header */}
    <header className="pt-16 bg-gradient-to-br from-primary-50 to-blue-50 py-20">  {/* <-- ADD pt-16 */}
```

**Lines 33-46: REPLACE all text with translations**
```typescript
<ArrowLeft className="w-4 h-4 mr-2" />
{t.blog.backToHome}  {/* <-- CHANGE */}

<h1 className="text-3xl lg:text-5xl font-bold text-primary-900 mb-4" data-testid="blog-page-title">
  {t.blog.pageTitle}  {/* <-- CHANGE */}
</h1>
<p className="text-xl text-gray-600 max-w-3xl mx-auto">
  {t.blog.subtitle}  {/* <-- CHANGE */}
</p>
```

**Line 103: REPLACE read more link**
```typescript
{t.blog.readMore} →  {/* <-- CHANGE FROM "Read Full Article" */}
```

**Lines 112-128: REPLACE empty state**
```typescript
<h2 className="text-3xl font-bold text-gray-600 mb-4">{t.blog.noArticlesTitle}</h2>
<p className="text-xl text-gray-500 mb-8">
  {t.blog.noArticlesMessage}  {/* <-- CHANGE */}
</p>
<a href="/" ...>
  <ArrowLeft className="w-4 h-4 mr-2" />
  {t.blog.backToHome}  {/* <-- CHANGE */}
</a>
```

**Line 136: ADD Footer at the end**
```typescript
      </main>
      <Footer />  {/* <-- ADD THIS */}
    </div>
  );
}
```

---

## SUMMARY

**New Files (4):**
1. `client/src/locales/en.json`
2. `client/src/locales/es.json`
3. `client/src/contexts/LanguageContext.tsx`
4. `client/src/components/language-selector.tsx`

**Modified Files (9):**
1. `client/src/App.tsx` - Added LanguageProvider wrapper
2. `client/src/components/navigation.tsx` - Added language selector and translations
3. `client/src/components/hero-section.tsx` - Replaced all text with translations
4. `client/src/components/about-section.tsx` - Replaced all text with translations
5. `client/src/components/projects-section.tsx` - Replaced all text with translations
6. `client/src/components/blog-section.tsx` - Replaced all text with translations
7. `client/src/components/contact-section.tsx` - Replaced all text and messages with translations
8. `client/src/components/footer.tsx` - Replaced all text with translations
9. `client/src/pages/blog.tsx` - Added Navigation/Footer and replaced all text with translations

**After deployment, rebuild the application:**
```bash
npm run build
```

The language switcher will appear in the top right corner with USA and Mexico flags.
