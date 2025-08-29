# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy all source code
COPY . .

# Build the application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S portfolio -u 1001

# Change ownership of app directory to non-root user
RUN chown -R portfolio:nodejs /app
USER portfolio

# Expose port 5002
EXPOSE 5002

# Set environment variable for production
ENV NODE_ENV=production

# Health check to ensure container is running properly
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5002/api/health || exit 1

# Start the application
CMD ["npm", "start"]