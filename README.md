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
bun run db:deploy

# or

bunx prisma migrate deploy
```

The next step is to set up the environment variables.

### Environment Variables

The following environment variables are required:

- `BETTER_AUTH_SECRET`: A random string of at least 32 characters.
- `BETTER_AUTH_URL`: The URL of your application.
- `DATABASE_URL`: The URL of your database.
- `DIRECT_DATABASE_URL`: The URL of your database.
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
