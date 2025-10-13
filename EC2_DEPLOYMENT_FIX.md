# EC2 Deployment Fix

## Issue
The error occurs because `import.meta.dirname` is not available in Node.js v18. This property was introduced in Node.js v20+.

## Solution Options

### Option 1: Upgrade Node.js (Multiple Methods)

**Method A: NodeSource Repository (if previous attempt failed)**
```bash
# Remove existing Node.js
sudo yum remove -y nodejs npm

# Clear yum cache
sudo yum clean all

# Install Node.js v20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
```

**Method B: Using Node Version Manager (NVM)**
```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell or run:
source ~/.bashrc

# Install and use Node.js v20
nvm install 20
nvm use 20
nvm alias default 20

# Verify
node --version
```

**Method C: Download and Install Manually**
```bash
# Download Node.js v20 binary
wget https://nodejs.org/dist/v20.10.0/node-v20.10.0-linux-x64.tar.xz

# Extract
tar -xf node-v20.10.0-linux-x64.tar.xz

# Move to /usr/local
sudo mv node-v20.10.0-linux-x64 /usr/local/node

# Add to PATH
echo 'export PATH=/usr/local/node/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Verify
node --version
```

### Option 2: Use Alternative Start Commands (Node.js 18 Compatible)

**Method A: Direct Server Start**
```bash
# Run the server directly, bypassing vite config
NODE_ENV=development npx tsx server/index.ts
```

**Method B: Use Production Build**
```bash
# Build the application first
npm run build

# Start in production mode (works with Node.js 18)
npm start
```

**Method C: Environment Override**
```bash
# Set environment to bypass vite dev server
NODE_ENV=production npm run dev
```

**Method D: Check Current Node Path**
```bash
# Check which node is being used
which node
whereis node

# If multiple versions exist, use specific path
/usr/bin/node --version
/usr/local/bin/node --version
```

### Option 3: Manual Vite Config Fix
If you need to manually fix the vite.config.ts file (outside of this environment):

```typescript
// Replace the top of vite.config.ts with:
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // ... rest of config
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
  // ... rest of config
});
```

## Production Deployment for EC2

For production deployment on EC2, you should:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start in production mode:**
   ```bash
   npm start
   ```

3. **Set up PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name "portfolio"
   pm2 startup
   pm2 save
   ```

4. **Set up Nginx as reverse proxy:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## Environment Variables

Make sure to set any required environment variables:
```bash
export NODE_ENV=production
export PORT=5000
```

## Quick Fix for Immediate Testing

Try this command to run the development server:
```bash
NODE_ENV=development node --loader tsx/esm server/index.ts
```