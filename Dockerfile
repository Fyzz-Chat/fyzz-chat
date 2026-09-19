# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1.3.13 AS base

WORKDIR /app


# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY prisma/ /temp/dev/prisma/
WORKDIR /temp/dev
RUN bun install --frozen-lockfile
WORKDIR /app

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY prisma/ /temp/prod/prisma/
WORKDIR /temp/prod
RUN bun install --frozen-lockfile --production --ignore-scripts
RUN bun run postinstall


FROM base AS migrate-deps

RUN mkdir -p /temp/migrate
COPY package.json /temp/migrate/source-package.json
# dotenv and dotenv-expand are included explicitly because prisma.config.ts
# imports them directly.
RUN cd /temp/migrate \
    && PRISMA_VER="$(bun -e "console.log(require('./source-package.json').devDependencies.prisma)")" \
    && DOTENV_VER="$(bun -e "console.log(require('./source-package.json').devDependencies.dotenv)")" \
    && DOTENV_EXPAND_VER="$(bun -e "console.log(require('./source-package.json').devDependencies['dotenv-expand'])")" \
    && rm source-package.json \
    && echo "{\"dependencies\":{\"prisma\":\"$PRISMA_VER\",\"dotenv\":\"$DOTENV_VER\",\"dotenv-expand\":\"$DOTENV_EXPAND_VER\"}}" > package.json \
    && bun install


FROM base AS prerelease

ARG NEXT_PUBLIC_TURNSTILE_SITEKEY

ENV NEXT_PUBLIC_TURNSTILE_SITEKEY=${NEXT_PUBLIC_TURNSTILE_SITEKEY}

COPY --from=install /temp/dev/node_modules ./node_modules
COPY --from=install /temp/prod/src/lib/prisma/generated ./src/lib/prisma/generated

COPY ./emails ./emails
COPY ./prisma ./prisma
COPY ./public ./public
COPY ./src ./src
COPY package.json bun.lock ./
COPY ./next.config.mjs next.config.mjs
COPY postcss.config.mjs postcss.config.mjs
COPY prisma.config.ts prisma.config.ts
COPY tsconfig.json tsconfig.json

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build:standalone


FROM base AS release

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME="0.0.0.0"

RUN useradd --system --uid 1001 nextjs

# Copy files as root:root (default), then set permissions for nextjs to read/execute only
# migrate-deps lands first so the standalone bundle's node_modules merges on top:
# the prisma CLI depends on react 19.3.0 (ink) and the app on 19.2.6, and the app's
# copy must be the one that survives the merge.
COPY --from=migrate-deps --chmod=755 /temp/migrate/node_modules ./node_modules
COPY --from=prerelease --chmod=755 /app/public ./public
COPY --from=prerelease --chmod=755 /app/.next/standalone ./
COPY --from=prerelease --chmod=755 /app/.next/static ./.next/static
COPY --from=prerelease --chmod=755 /app/prisma/ ./prisma/
COPY --from=prerelease --chmod=755 /app/prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3000

CMD ["bun", "./server.js"]




FROM base AS migrate

COPY --from=migrate-deps /temp/migrate/package.json ./package.json
COPY --from=migrate-deps /temp/migrate/node_modules ./node_modules
COPY prisma/ ./prisma/
COPY prisma.config.ts ./

CMD ["bunx", "prisma", "migrate", "deploy"]


FROM base AS dev

# copy the installed dependencies from the install stage
COPY --from=install /temp/dev/node_modules node_modules
COPY --from=install /temp/prod/src/lib/prisma/generated ./src/lib/prisma/generated
