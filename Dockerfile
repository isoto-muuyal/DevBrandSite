FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/projects.json ./projects.json
COPY --from=builder /app/articles.json ./articles.json
COPY --from=builder /app/blog_entries ./blog_entries
COPY --from=builder /app/attached_assets ./attached_assets

RUN mkdir -p /app/data /app/data/blog_entries

ENV NODE_ENV=production
ENV PORT=5001
ENV CONTENT_DATA_DIR=/app/data

EXPOSE 5001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:5001/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "start"]
