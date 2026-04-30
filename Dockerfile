# Build the Vite frontend
FROM node:20-alpine AS web-builder
WORKDIR /build
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Run Fastify API + serve built SPA from /public
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=web-builder /build/dist ./public
EXPOSE 3001
CMD ["node", "index.js"]
