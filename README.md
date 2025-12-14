# <img src="src/app/icon.svg" alt="Fyzz Chat" width="28" height="28" /> Fyzz Chat

![GitHub Workflow Status](https://github.com/Fyzz-Chat/fyzz-chat/actions/workflows/prod.yml/badge.svg)

## About Fyzz Chat

Fyzz Chat is an open-source & self-hostable alternative to ChatGPT, Claude, Gemini, Perplexity, or actually any other LLM you can think of.

Although it comes with some of the most popular models preconfigured for you (you only need some API keys to get started), you can easily add your own models to it if you'd like because Fyzz Chat is built on top of the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction).

## Quick Start

> [!NOTE]
> Regardless of where you deploy Fyzz Chat, you will need a PostgreSQL database first to store your data.

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFyzz-Chat%2Ffyzz-chat&env=AUTH_SECRET,DATABASE_URL,OPENAI_API_KEY&envDescription=Set%20an%20auth%20secret%20to%20be%20used%20with%20Auth.js%20(at%20least%2032%20characters%20long%20random%20string)%2C%20and%20your%20database%20URL.&project-name=fyzz-chat&repository-name=fyzz-chat)

### Coolify

Coming soon!

## Hosted version

Interested in the hosted version? Check out [Fyzz Chat](https://www.fyzz.chat/chat) in action. We have everything configured for you, plus some extra features.

However, if you prefer to host it yourself, read on!

## Docs for Self-hosters

There are two ways to self-host Fyzz Chat:

- You can deploy it from the repository as a Next.js project
- You can use the [Docker image](https://github.com/Fyzz-Chat/fyzz-chat/pkgs/container/fyzz-chat) (which is a containerized version of the Next.js project)

### Database

Fyzz Chat uses Prisma to interact with the database. By default, it uses PostgreSQL as the database engine.

Regardless of where you will host it, you will have to migrate it first to create the database schema. (You will need to have the `DATABASE_URL` environment variable set up for this to work.)

```bash
bun run db-push

# or

bunx prisma db push
```

The next step is to set up the environment variables.

### Environment Variables

The following environment variables are required:

- `AUTH_SECRET`: A random string of at least 32 characters.
- `DATABASE_URL`: The URL of your database.
- `OPENAI_API_KEY`: The API key for OpenAI.

The following environment variables are optional and control which additional models are available for use:

- `ANTHROPIC_API_KEY`: The API key for Anthropic.
- `XAI_API_KEY`: The API key for XAI.
- `GOOGLE_GENERATIVE_AI_API_KEY`: The API key for Google Generative AI.
- `PERPLEXITY_API_KEY`: The API key for Perplexity.
- `FIREWORKS_API_KEY`: The API key for Fireworks.

If you don't set any of these, the application will still start up, but you will only be able to use models from OpenAI.

The following environment variables are also optional and control whether uploaded files will be persisted in a CDN or in the database:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
- `AWS_REGION`: The AWS region of your bucket.
- `AWS_UPLOADS_BUCKET`: The AWS bucket for uploads.
- `AWS_CLOUDFRONT_KEY_PAIR_ID`: AWS CloudFront key pair ID.
- `AWS_CLOUDFRONT_PRIVATE_KEY`: AWS CloudFront private key.

The last two are required to create signed URLs for uploaded files.

> [!WARNING]
> If any of the above `AWS_` variables is not set, the application will still work, but uploaded files will be persisted in the database.

Other environment variables

- `JWT_SECRET`: Needed if you want to enable sharing.

#### AWS

# TODO: Add docs for AWS

## Docs for Builders

### Prerequisites

Ensure that you have the following tools installed on your machine:

- [Bun](https://bun.sh): Install Bun via the command line by running:

```bash
curl -fsSL https://bun.sh/install | bash
```

or

```bash
powershell -c "irm bun.sh/install.ps1 | iex"
```

Or if you prefer, you can use other package managers like npm, yarn, or pnpm.

### Development

Copy the [`.env.sample`](.env.sample) file to `.env` to set up the environment variables. Then, run the development server:

```bash
bun dev
# or
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# TODO: Rewrite Catalyst docs

## Database

The Catalyst starter kit uses Prisma to interact with the database. By default, it uses PostgreSQL as the database engine.

To set up a local database for development, you can use Docker:

```bash
docker compose up -d
```

This command starts a PostgreSQL database in a Docker container and lets it run in the background.

You can find the database connection URL in the [`.env.sample`](.env.sample?plain=1#L38) file.

You can connect to the database with the following command:

```bash
docker compose exec database psql -U app_dev -d dev
```

Or, if you have `make` installed, you can use the following command:

```bash
make db
```

There is already a `User` model defined in [`prisma/schema.prisma`](prisma/schema.prisma). The correspondent migration file is located in [`prisma/migrations/`](prisma/migrations/). To create the database schema and generate the Prisma client, run:

```bash
bun run db:migrate
```

## Authentication

The Catalyst starter kit uses Auth.js for authentication. You can find the authentication logic in [`src/auth.ts`](src/auth.ts).

By default, a development secret is already set in the [`.env.sample`](.env.sample?plain=1#L26) file called `AUTH_SECRET`. Set this secret to a more secure random string at the hosting provider of your choice when deploying the application.

If you also need Google login, add your Google OAuth client ID and secret to the [`.env`](.env.sample?plain=1#L29) file.

GitHub login is also supported. Add your GitHub OAuth client ID and secret to the [`.env`](.env.sample?plain=1#L27) file.

All of these environment variables have placeholders if you copied the [`.env.sample`](.env.sample) file.

## CI/CD

This project uses GitHub Actions for continuous integration and deployment. An example workflow is defined in [`.github/workflows/build.yml`](.github/workflows/build.yml).
It installs the dependencies, lints the code, and builds the project.

## Logging

Catalyst uses Winston as the default logger and the default log level is `info`. You can change this by setting the `LOG_LEVEL` environment variable in the [`.env`](.env.sample?plain=1#L22) file.

If you want to configure a log drain, set the `LOG_DRAIN_URL` environment variable in the [`.env`](.env.sample?plain=1#L23) file. This will send the logs to the specified URL as well as to the console.
