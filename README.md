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
- `OPENAI_API_KEY`: The API key for OpenAI. Create one [here](https://platform.openai.com/api-keys).

The following environment variables are optional and influence the authentication process:

- `ANONYMOUS_LOGIN`: Whether to allow single-click anonymous logins.
- `AUTHORIZED_EMAIL_DOMAINS`: A comma-separated list of email domains that are allowed to sign up and log in.
- To enable login with Google, you need to set the following environment variables:
- `GOOGLE_CLIENT_ID`: The Google client ID.
- `GOOGLE_CLIENT_SECRET`: The Google client secret.

The following environment variables are optional and control which additional models are available for use:

- `ANTHROPIC_API_KEY`: The API key for Anthropic. Create one [here](https://platform.claude.com/settings/keys).
- `XAI_API_KEY`: The API key for XAI. Create it one [here](https://console.x.ai).
- `GOOGLE_GENERATIVE_AI_API_KEY`: The API key for Google Generative AI. Create one [here](https://aistudio.google.com/app/api-keys).
- `PERPLEXITY_API_KEY`: The API key for Perplexity. Create one [here](https://www.perplexity.ai/account/api/keys). You might need to create an API Group first [here](https://www.perplexity.ai/account/api/group?create=true).
- `FIREWORKS_API_KEY`: The API key for Fireworks. Create one [here](https://app.fireworks.ai/settings/users/api-keys).

If you don't set any of these, the application will still start up, but you will only be able to use models from OpenAI.

The following environment variables are also optional and control whether uploaded files will be persisted in a CDN or in the database:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
- `AWS_REGION`: The AWS region of your bucket.
- `AWS_UPLOADS_BUCKET`: The AWS bucket for uploads.
- `AWS_CLOUDFRONT_KEY_PAIR_ID`: AWS CloudFront key pair ID.
- `AWS_CLOUDFRONT_PRIVATE_KEY`: AWS CloudFront private key with | as line breaks (deprecated).
- `AWS_CLOUDFRONT_PRIVATE_KEY_BASE64`: AWS CloudFront private key in base64 format.
    * Quick way to convert to base64 format: `cat key.pem | base64 > base64_key.pem`
- `AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN`: AWS CloudFront distribution domain. Falls back to `AWS_UPLOADS_BUCKET` if not set. The fallback only works if your bucket's name is the same as your distribution domain.

The last two are required to create signed URLs for uploaded files.

> [!WARNING]
> If any of the above `AWS_` variables is not set, the application will still work, but uploaded files will be persisted in the database.

#### AWS

Deploy Fyzz Chat to AWS using one of the provided CloudFormation templates in [aws/](aws/). The templates create an ECS cluster with RDS PostgreSQL, Application Load Balancer, and all necessary networking.

There are two templates available:
- [cloudformation-ec2.json](aws/cloudformation-ec2.json): Deploy Fyzz Chat to AWS using EC2.
- [cloudformation-fargate.json](aws/cloudformation-fargate.json): Deploy Fyzz Chat to AWS using Fargate.

If you'd like to visualize the templates, you can use the [AWS CloudFormation Infrastructure Composer](https://eu-central-1.console.aws.amazon.com/composer/home). Click on **Create project**, choose the **Template** tab, set the file type to JSON, then copy and paste the template content. Finally, switch back to the **Canvas** tab to visualize the infrastructure.

**Prerequisites:**

1. Create secrets in AWS Secrets Manager:
   - Go to **Secrets Manager** → **Store a new secret**
   - Select **Other type of secret**
   - Select **Plaintext**
   - Create a secret named `fyzz-chat/better-auth-secret` with a random string of at least 32 characters
   - Create a secret named `fyzz-chat/openai-api-key` with your OpenAI API key
   - Note the ARN of each secret (you'll need them for the stack parameters)

**Deploy:**

1. Go to **CloudFormation** → **Create stack** → **With new resources (standard)**
2. Upload `cloudformation.json` as the template
3. Enter stack name: `fyzz-chat`
4. Fill in the required parameters:
   - `BetterAuthSecretArn`: ARN of your BETTER_AUTH_SECRET
   - `OpenaiApiKeySecretArn`: ARN of your OPENAI_API_KEY
   - `BetterAuthUrl`: Your application URL (e.g., `https://your-domain.com`)
5. Review and create the stack
6. Wait for stack creation to complete (takes ~10-15 minutes)

> [!NOTE]
> When deleting the stack, the database will NOT be deleted. You will need to turn off deletion protection and delete the database manually.

**Run Database Migrations:**

1. Go to **ECS** → **Clusters** → Select your cluster
2. Go to the **Tasks** tab
3. Click **Run new task**
4. Configure:
   - **Task definition family**: `fyzz-chat-migration`
   - **Launch type**: Fargate
5. Networking
   - VPC: Select `fyzz-chat-vpc`
   - Security group: Select `fyzz-chat-ecs-sg`
5. Click **Create** and wait for completion

**Enable HTTPS (Optional):**

1. Go to **Certificate Manager** → **Request a certificate**
2. Request a public certificate for your domain
3. Add the DNS validation records to your DNS provider
4. Wait for certificate validation
5. Go back to **CloudFormation** → Select your stack → **Update**
6. Use current template and update the `CertificateArn` parameter with your certificate ARN
7. Complete the stack update

The template will automatically redirect HTTP to HTTPS when a certificate is provided.

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
