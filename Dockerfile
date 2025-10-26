### Multi-stage Dockerfile for Next.js (production)
### Builds the app and produces a slim production image ready for Coolify/VPS

FROM node:20-bullseye as builder
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Install build tools and native deps required by some packages (sharp etc.)
RUN apt-get update && \
    apt-get install -y --no-install-recommends python3 build-essential pkg-config libcairo2-dev libjpeg-dev libgif-dev libvips-dev git ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy package manifests first for better caching
COPY package.json package-lock.json* ./

# Install dependencies (will create node_modules used later)
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copy the rest of the repo and build
COPY . .
RUN npm run build

### Production image
FROM node:20-bullseye-slim as runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
WORKDIR /app

# Install runtime native libs that sharp or other packages may need
RUN apt-get update && \
    apt-get install -y --no-install-recommends libcairo2 libjpeg62-turbo libgif7 libvips42 ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Copy built artifacts and node_modules from builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/app ./app
COPY --from=builder /app/data ./data

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD wget -qO- --tries=1 http://127.0.0.1:3000/ || exit 1

CMD ["npm", "run", "start"]
