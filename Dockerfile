# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy frontend package files
COPY frontend/package*.json ./

# Install ALL dependencies (including dev) for build
RUN npm ci

# Copy all frontend files
COPY frontend/ ./

# Build the Next.js app with production settings
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV SKIP_ENV_VALIDATION=true

# Disable type checking and linting during build
ENV NEXT_DISABLE_ESLINT_PLUGIN=true

# Set placeholder build-time env vars
ENV NEXT_PUBLIC_API_URL=https://api.placeholder.com
ENV NEXTAUTH_URL=https://app.placeholder.com
ENV NEXTAUTH_SECRET=placeholder-secret-for-build

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]