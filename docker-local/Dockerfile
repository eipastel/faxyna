# syntax=docker/dockerfile:1

# ---- build: installs the workspace with the lockfile and exports the static site ----
FROM node:24-alpine AS build
WORKDIR /repo
ENV NEXT_TELEMETRY_DISABLED=1

# pnpm version comes from "packageManager" in package.json
RUN corepack enable

# Manifests first so the dependency layer is cached between code changes
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/web/package.json apps/web/
COPY packages/core/package.json packages/core/
COPY packages/data-firebase/package.json packages/data-firebase/
RUN pnpm install --frozen-lockfile

COPY apps apps
COPY packages packages
RUN pnpm test && pnpm build

# ---- runtime: static files served by unprivileged nginx ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY docker-local/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/out /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
