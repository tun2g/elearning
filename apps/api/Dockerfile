# @elearning/api — NestJS (port 4000).
#
# Build context is the monorepo ROOT (pnpm workspace), so this is built with:
#   docker build -f apps/api/Dockerfile .

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

# ---- build: api + its workspace deps only ----
FROM deps AS build
COPY . .
RUN pnpm exec turbo run build --filter=@elearning/api

# ---- runner ----
FROM node:22-alpine AS runner
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app
COPY --from=build /app /app
ENV NODE_ENV=production
EXPOSE 4000
CMD ["pnpm", "--filter", "@elearning/api", "start:prod"]
