# EC2 Setup for GitHub Actions + Docker Deploy

This project deploys from GitHub Actions to EC2 using Docker and GHCR.

## 1. What app folder is for

The app folder on EC2 stores deployment-side files that should not live in the container image, mainly:
- `.env`
- any future runtime-only files

For your convention, this setup uses:
- `~/apps/devbrandsite/.env`

`/opt/devbrandsite` was only a suggestion. It is not required.

## 2. One-time EC2 setup

```bash
# SSH into EC2
ssh -i ~/.ssh/your-key.pem ubuntu@<EC2_HOST>

# Install Docker + compose plugin (Ubuntu)
sudo apt update
sudo apt install -y docker.io docker-compose-plugin

# Let your user run docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Create app folder and env file
mkdir -p ~/apps/devbrandsite
cat > ~/apps/devbrandsite/.env << 'EOF'
NODE_ENV=production
PORT=5000
EOF
```

Notes:
- You can add more env vars to this file at any time.
- The workflow now expects `~/apps/devbrandsite/.env`.

## 3. GitHub secrets to configure

Repository -> Settings -> Secrets and variables -> Actions -> New repository secret

Required:
- `EC2_HOST`: `muuyal.tech` or EC2 public IP/DNS (no `https://`)
- `EC2_USER`: Linux SSH user (for Ubuntu: `ubuntu`)
- `EC2_SSH_KEY`: full private key content (`-----BEGIN...` to `-----END...`)
- `EC2_PORT`: usually `22`
- `GHCR_USERNAME`: your GitHub username (not email)
- `GHCR_TOKEN`: PAT with at least `read:packages`

Optional:
- `APP_HOST_PORT`: host port exposed publicly (default: `80`)
- `APP_CONTAINER_PORT`: container internal port (default: `5000`)

## 4. Port changes: what must be updated

If you change app port behavior, update all relevant layers:

1. Container app port (`PORT` in `.env`)
- Example: `PORT=5001`

2. Docker port mapping (workflow)
- Controlled by secret `APP_CONTAINER_PORT` and `APP_HOST_PORT`
- Keep `APP_CONTAINER_PORT` equal to `PORT` in `.env`

3. EC2 security group inbound rules
- Allow traffic on the chosen host port (`APP_HOST_PORT`) if not using a reverse proxy

4. Reverse proxy (if using Nginx/Caddy)
- Proxy target must match app host+port (commonly `127.0.0.1:5000`)

Common setups:
- Direct HTTP: host `80` -> container `5000`
- Custom direct port: host `8080` -> container `5000`
- With Nginx: host `80/443` on Nginx, proxy to local app port

## 5. First deployment test

After pushing to `main`:

```bash
# on EC2
docker ps
docker logs devbrandsite --tail 100
curl -i http://localhost:5000/api/health
```

If host port is 80, public health check:

```bash
curl -i http://<EC2_HOST>/api/health
```

## 6. If deploy fails

Quick checks:
- Missing `~/apps/devbrandsite/.env`
- Wrong `EC2_HOST` or `EC2_SSH_KEY`
- `GHCR_TOKEN` missing `read:packages`
- Security group does not allow your host port
- Domain DNS not pointing to this EC2 instance
