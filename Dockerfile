# 0. Base image
FROM node:18-alpine AS base

# Common base env
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Dependencies layer
FROM base AS deps

# libc6-compat sometimes needed for native deps
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy manifest files
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies (use npm install instead of npm ci to avoid lockfile mismatch issues)
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm install; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm install --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 2. Build layer
FROM base AS builder

WORKDIR /app

# Reuse node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the source code
COPY . .

# ---- HARD-CODED BUILD-TIME ENVS (for now) ----
ENV NEXT_PUBLIC_API_URL=https://api.gyanaangan.in/api
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=816282356194-tj4ldf159tc26i4erooi4m219h2ktipf.apps.googleusercontent.com
ENV PORT=3000

# Build the Next.js app (must have `output: 'standalone'` in next.config.js)
RUN npm run build

# 3. Runtime image
FROM node:18-alpine AS runner

WORKDIR /app

# Runtime envs (also hardcoded for now)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:8000/api
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=816282356194-tj4ldf159tc26i4erooi4m219h2ktipf.apps.googleusercontent.com
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Prepare .next dir
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone output from builder
# Make sure next.config.js has: output: 'standalone'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./ 
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

# server.js is created by `next build` when using standalone output
CMD ["node", "server.js"]
