# Portfolio Website

## Overview

A modern, responsive personal portfolio website for a full stack developer showcasing projects, skills, and experience. Built with React, TypeScript, and a Node.js/Express backend, the application features a clean design with sections for hero introduction, about information, featured projects, blog articles, and contact functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent, accessible UI components
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **API Design**: RESTful API endpoints for projects, articles, and contact form submissions
- **Data Layer**: In-memory storage implementation with interface abstraction for future database integration
- **Development**: Hot module replacement via Vite middleware in development mode

### Data Storage
- **ORM**: Drizzle ORM configured for PostgreSQL with schema definitions
- **Schema**: Structured tables for projects, contact messages, and articles with proper relationships
- **Development Storage**: Memory-based storage implementation with seed data for development
- **Production Ready**: Database schema and migrations prepared for PostgreSQL deployment

### Component Architecture
- **Design System**: shadcn/ui components with consistent theming via CSS custom properties
- **Layout**: Single-page application with smooth scrolling navigation between sections
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints
- **Accessibility**: Proper semantic HTML and ARIA attributes throughout

### Development Workflow
- **Build System**: Vite for frontend bundling and esbuild for server compilation
- **Type Safety**: Shared TypeScript types between frontend and backend via shared schema
- **Path Aliases**: Configured absolute imports for cleaner code organization

## External Dependencies

### Core Frameworks
- **React ecosystem**: React 18, React DOM, React Hook Form, TanStack Query
- **Backend**: Express.js, Node.js runtime
- **TypeScript**: Full-stack type safety with shared schemas

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing
- **Radix UI**: Unstyled, accessible component primitives for complex interactions
- **Lucide React**: Modern icon library for consistent iconography
- **Class Variance Authority**: Type-safe CSS class management

### Database and Validation
- **Drizzle ORM**: Type-safe database queries and schema management
- **Neon Database**: Serverless PostgreSQL for production deployment
- **Zod**: Schema validation library for runtime type checking

### Development Tools
- **Vite**: Fast build tool with HMR and development server
- **ESBuild**: Fast bundler for production server builds
- **Replit Integration**: Development environment plugins and error handling