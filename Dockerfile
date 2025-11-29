# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 AS base

# install Node.js version 22
RUN apt-get update && apt-get install -y curl gnupg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs

WORKDIR /usr/src/app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install

RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
COPY prisma/ /temp/dev/prisma/
RUN cd /temp/dev && bun install --frozen-lockfile

RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
COPY prisma/ /temp/prod/prisma/
RUN cd /temp/prod && bun install --frozen-lockfile --production --ignore-scripts
RUN cd /temp/prod && bun run postinstall

FROM base AS prerelease

# Use the dev node_modules for the prerelease stage to have typescript and other required dependencies
COPY --from=install /temp/dev/node_modules ./node_modules
COPY --from=install /temp/prod/src/lib/prisma/generated ./src/lib/prisma/generated
COPY . .

# These are required for the build step but not for the runtime image
ENV AUTHORITY="localhost:3000"
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DIRECT_DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN bun run build

FROM base AS release

COPY --from=prerelease /usr/src/app/public ./public
COPY --from=prerelease /usr/src/app/.next/standalone ./
COPY --from=prerelease /usr/src/app/.next/static ./.next/static
COPY --from=prerelease /usr/src/app/prisma/ ./prisma/
COPY --from=prerelease /usr/src/app/prisma.config.ts ./prisma.config.ts

CMD ["bun", "run", "server.js"]

FROM base AS dev

# copy the installed dependencies from the install stage
COPY --from=install /temp/dev/node_modules node_modules
