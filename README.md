# Israel Soto - Portfolio Website

A modern, responsive personal portfolio website showcasing projects, skills, and experience as a full stack developer. Built with React, TypeScript, and Node.js.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Tech Stack**: React 18, TypeScript, Express.js, and Vite
- **Professional Sections**:
  - Hero introduction with call-to-action
  - About section with skills and certifications
  - Featured projects showcase
  - Blog/Articles section
  - Contact form with resume download
- **Dark/Light Theme**: Automatic theme switching
- **Type Safety**: Full-stack TypeScript with shared schemas
- **Fast Development**: Hot module replacement with Vite

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type safety throughout the application
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI component library
- **TanStack Query** - Server state management
- **React Hook Form** - Form handling with validation
- **Wouter** - Lightweight routing library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe server development
- **Drizzle ORM** - Type-safe database toolkit
- **Zod** - Schema validation library

### Development Tools
- **ESBuild** - Fast bundler for server builds
- **PostCSS** - CSS processing with Tailwind
- **Lucide React** - Modern icon library

## 📋 Prerequisites

Before running this project locally, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **Git** for version control

## 🚀 Getting Started

Follow these steps to run the portfolio website locally:

### 1. Clone the Repository

```bash
git clone <repository-url>
cd portfolio-website
```

### 2. Install Dependencies

```bash
npm install
```

This will install all the required dependencies for both frontend and backend.

### 3. Environment Setup

The project uses environment variables for configuration. Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following variables (optional for local development):

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_database_url_here
```

**Note**: For local development, the app uses in-memory storage by default, so a database connection is not required.

### 4. Start the Development Server

```bash
npm run dev
```

This command will:
- Start the Express.js backend server on port 5000
- Start the Vite development server for the frontend
- Enable hot module replacement for instant updates
- Serve both frontend and backend on the same port

### 5. Access the Application

Open your web browser and navigate to:

```
http://localhost:5000
```

The portfolio website should now be running locally with all features available.

## 📁 Project Structure

```
portfolio-website/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configuration
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Vite middleware configuration
├── shared/                 # Shared TypeScript schemas
│   └── schema.ts           # Database and validation schemas
├── package.json            # Project dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── tsconfig.json           # TypeScript configuration
```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run type-check` - Run TypeScript type checking

## 📊 Development Features

### Hot Module Replacement
The development server supports hot module replacement, so changes to your code will be reflected immediately in the browser without losing application state.

### Type Safety
The project uses TypeScript throughout with shared schemas between frontend and backend, ensuring type safety across the entire application.

### Component Library
Built with shadcn/ui components for consistent, accessible, and customizable UI elements.

### API Integration
The frontend uses TanStack Query for efficient data fetching and caching with the Express.js backend.

## 🎨 Customization

### Updating Personal Information
1. Edit the seed data in `server/storage.ts` to update projects, articles, and personal information
2. Modify the resume content in `server/routes.ts` for the downloadable resume
3. Update social media links and contact information in the respective components

### Styling and Theming
1. Modify colors and design tokens in `client/src/index.css`
2. Customize Tailwind configuration in `tailwind.config.ts`
3. Add or modify UI components in the `client/src/components/` directory

### Adding New Sections
1. Create new components in `client/src/components/`
2. Add corresponding API routes in `server/routes.ts` if needed
3. Update the storage interface in `server/storage.ts` for new data models

## 🚀 Deployment

### Docker Deployment

#### Prerequisites for Docker
- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)

#### Quick Start with Docker
1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

2. **Or build and run manually:**
   ```bash
   # Build the Docker image
   docker build -t portfolio-website .
   
   # Run the container
   docker run -p 5000:5000 portfolio-website
   ```

3. **Access the application:**
   ```
   http://localhost:5000
   ```

#### Docker Features
- **Multi-stage build** for optimized image size
- **Non-root user** for enhanced security
- **Health checks** to monitor container status
- **Alpine Linux** base image for minimal footprint
- **Production-ready** configuration with proper environment variables

#### Docker Commands

**Build the image:**
```bash
docker build -t portfolio-website .
```

**Run in detached mode:**
```bash
docker run -d -p 5000:5000 --name portfolio portfolio-website
```

**View logs:**
```bash
docker logs portfolio
```

**Stop the container:**
```bash
docker stop portfolio
```

**Remove the container:**
```bash
docker rm portfolio
```

#### Environment Variables for Docker
You can pass environment variables to the Docker container:

```bash
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  portfolio-website
```

### Replit Deployment
This project is optimized for deployment on Replit:

1. The `Start application` workflow is pre-configured
2. All dependencies are properly listed in `package.json`
3. The server is configured to bind to `0.0.0.0` for accessibility

### Other Platforms
For deployment on other platforms:

1. Build the application: `npm run build`
2. Set environment variables for production
3. Configure your hosting platform to run: `npm start`
4. Ensure the server can bind to the correct host and port

## 🤝 Contributing

This is a personal portfolio project, but if you'd like to suggest improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for personal use. Feel free to use it as inspiration for your own portfolio website.

## 📞 Contact

- **Email**: israel.soto@example.com
- **LinkedIn**: [linkedin.com/in/israelsoto](https://linkedin.com/in/israelsoto)
- **GitHub**: [github.com/israelsoto](https://github.com/israelsoto)

---

Built with ❤️ using React, TypeScript, and modern web technologies.