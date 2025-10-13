# AWS Amplify Deployment Guide

## Overview
This guide will help you deploy your portfolio website to AWS Amplify. Since your app is currently a full-stack application with both frontend and backend, you have two main deployment options.

## Option 1: Frontend-Only Deployment (Recommended for Portfolio)

Since your portfolio is primarily a content showcase, you can deploy just the frontend to Amplify and serve the JSON data statically.

### Steps:

1. **Prepare Static Data**
   - Move `projects.json` and `articles.json` to `client/public/data/`
   - Update API calls to fetch from static URLs instead of `/api/` endpoints

2. **Update Frontend Code**
   - Modify the queryClient base URL to use static file paths
   - Update all API calls to fetch from `/data/projects.json` and `/data/articles.json`

3. **Build Configuration**
   - The existing `amplify.yml` file is configured for frontend-only deployment
   - Uses `npm run build` command which builds the frontend with Vite

4. **Deploy to Amplify**
   - Connect your GitHub repository to AWS Amplify
   - Choose "Deploy app" → "GitHub" → Select your repository
   - Amplify will automatically detect the `amplify.yml` build settings
   - Deploy!

### Pros:
- Simpler deployment
- Cost-effective (no server costs)
- Fast global CDN delivery
- Perfect for a portfolio website

### Cons:
- No dynamic backend functionality
- Contact form would need external service (like Formspree or Netlify Forms)

## Option 2: Full-Stack Deployment with Amplify + Lambda

For full backend functionality, you'd need to:

1. **Separate Frontend and Backend**
   - Deploy frontend to Amplify Hosting
   - Deploy backend as AWS Lambda functions
   - Use API Gateway for routing

2. **Required Changes**
   - Convert Express routes to Lambda functions
   - Set up API Gateway
   - Configure CORS for cross-origin requests
   - Set up database (if needed) with RDS or DynamoDB

### This option requires more complex setup and AWS configuration.

## Current Configuration

Your project includes:
- ✅ `amplify.yml` - Build configuration for Amplify
- ✅ Frontend build process with Vite
- ✅ Static assets ready for CDN deployment

## Next Steps

**For Option 1 (Recommended):**
1. Move JSON data files to static directory
2. Update API calls to use static file paths
3. Connect repository to AWS Amplify
4. Deploy!

**For Option 2:**
1. Requires significant refactoring
2. AWS Lambda and API Gateway setup
3. More complex but maintains full functionality

## Cost Estimation

- **Option 1**: ~$1-5/month for hosting (very low traffic)
- **Option 2**: ~$10-50/month depending on usage (Lambda + API Gateway + hosting)

For a portfolio website, Option 1 is typically the best choice.