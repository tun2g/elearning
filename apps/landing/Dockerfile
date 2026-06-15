# @elearning/landing — Next.js (port 3001).
#
# Build context is the monorepo ROOT (pnpm workspace), so this is built with:
#   docker build -f apps/landing/Dockerfile .
#
# NEXT_PUBLIC_* are baked at build time — pass via --build-arg (CI sets them).

FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---- deps: install the whole workspace from the lockfile ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/landing/package.json apps/landing/package.json
COPY apps/mobile/package.json apps/mobile/package.json
COPY packages/contracts/package.json packages/contracts/package.json
COPY packages/core/package.json packages/core/package.json
COPY packages/theme/package.json packages/theme/package.json
COPY packages/crawler/package.json packages/crawler/package.json
COPY packages/seed-data/package.json packages/seed-data/package.json
RUN pnpm install --frozen-lockfile

# ---- build: landing + its workspace deps only ----
FROM deps AS build
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN pnpm exec turbo run build --filter=@elearning/landing

# ---- runner ----
FROM node:22-alpine AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 3001
CMD ["pnpm", "--filter", "@elearning/landing", "start"]
