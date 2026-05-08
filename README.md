<div align="center">

<img src="src/app/icon.svg" alt="" width="56" height="56" />

# Fyzz Chat

### Chat with the best AI models, all in one place

Bring your own keys, deploy in one click, or use the hosted version.

[![Build](https://img.shields.io/github/actions/workflow/status/Fyzz-Chat/fyzz-chat/prod.yml?label=build)](https://github.com/Fyzz-Chat/fyzz-chat/actions/workflows/prod.yml) [![Release](https://img.shields.io/github/v/release/Fyzz-Chat/fyzz-chat?color=3b82f6)](https://github.com/Fyzz-Chat/fyzz-chat/releases) [![License](https://img.shields.io/github/license/Fyzz-Chat/fyzz-chat)](LICENSE) [![Docker](https://img.shields.io/badge/ghcr.io-fyzz--chat-0b0b0b?logo=docker&logoColor=white)](https://github.com/Fyzz-Chat/fyzz-chat/pkgs/container/fyzz-chat) 

<a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFyzz-Chat%2Ffyzz-chat&env=AUTH_SECRET,DATABASE_URL,OPENAI_API_KEY&envDescription=Set%20an%20auth%20secret%20to%20be%20used%20with%20Auth.js%20(at%20least%2032%20characters%20long%20random%20string)%2C%20and%20your%20database%20URL.&project-name=fyzz-chat&repository-name=fyzz-chat"><img src="https://vercel.com/button" alt="Deploy with Vercel" height="32" /></a>&nbsp;<a href="https://coolify.io"><img src="https://img.shields.io/badge/Deploy%20to%20Coolify-coming%20soon-9ca3af?labelColor=8b5cf6&logo=coolify&logoColor=white" alt="Deploy to Coolify (coming soon)" height="28" /></a>

<a href="https://www.fyzz.chat/chat"><img src="https://img.shields.io/badge/Try%20the%20hosted%20version-→-3b82f6?style=for-the-badge&labelColor=3b82f6" alt="Try the hosted version →" height="40" /></a>

</div>

---

## Why Fyzz Chat

- **One chat for every model.** OpenAI, Anthropic, Google, xAI, Perplexity, Fireworks, Azure — and anything else the [Vercel AI SDK](https://ai-sdk.dev/docs/introduction) supports.
- **Tools, MCP, and the web built in.** Function calling, [MCP](https://modelcontextprotocol.io) server support, and web browsing without extra setup.
- **Self-host or hosted.** One-click Vercel, the official Docker image, or AWS CloudFormation — or skip setup with the hosted plan at [fyzz.chat](https://www.fyzz.chat/chat).

`OpenAI` · `Anthropic` · `Google` · `xAI` · `Perplexity` · `Fireworks` · `Azure`

## Quick start

> [!NOTE]
> Fyzz Chat needs a PostgreSQL database wherever you deploy it.

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FFyzz-Chat%2Ffyzz-chat&env=AUTH_SECRET,DATABASE_URL,OPENAI_API_KEY&envDescription=Set%20an%20auth%20secret%20to%20be%20used%20with%20Auth.js%20(at%20least%2032%20characters%20long%20random%20string)%2C%20and%20your%20database%20URL.&project-name=fyzz-chat&repository-name=fyzz-chat)

### Docker

```bash
docker run -p 3000:3000 \
  -e BETTER_AUTH_SECRET=... \
  -e BETTER_AUTH_URL=https://your-domain.com \
  -e DATABASE_URL=postgres://... \
  -e DIRECT_DATABASE_URL=postgres://... \
  -e OPENAI_API_KEY=... \
  ghcr.io/fyzz-chat/fyzz-chat:latest
```

To build your own image, run `bun run build:standalone` and use the resulting standalone output.

### Local development

```bash
bun install
cp .env.sample .env   # then fill in the values
bun db:deploy         # apply database migrations
bun dev               # start the dev server on http://localhost:3000
```

To preview transactional emails: `bun run dev:email` (port 3001).

## Hosted version

Don't want to self-host? [fyzz.chat](https://www.fyzz.chat/chat) runs the same project, fully managed — zero setup, automatic updates. Self-hosting stays free and supported; the hosted plan is just there if you'd rather not manage infrastructure.

## Self-hosting

Two ways to self-host:

- Deploy from the repository as a Next.js project.
- Use the [Docker image](https://github.com/Fyzz-Chat/fyzz-chat/pkgs/container/fyzz-chat) (a containerized version of the Next.js project).

### Database

Fyzz Chat uses Prisma with PostgreSQL. Before the app can start, run the migrations (with `DATABASE_URL` set):

```bash
bun run db:deploy
# or
bunx prisma migrate deploy
```

### Environment variables

**Required:**

- `BETTER_AUTH_SECRET` — random string, at least 32 characters.
- `BETTER_AUTH_URL` — public URL of your application.
- `DATABASE_URL` — pooled Postgres URL.
- `DIRECT_DATABASE_URL` — direct (non-pooled) Postgres URL.
- `OPENAI_API_KEY` — create one [here](https://platform.openai.com/api-keys).

**Authentication (optional):**

- `ANONYMOUS_LOGIN` — allow single-click anonymous logins.
- `AUTHORIZED_EMAIL_DOMAINS` — comma-separated allow-list of email domains.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — enable Google sign-in.

**Additional model providers (optional):**

- `ANTHROPIC_API_KEY` — Anthropic ([create](https://platform.claude.com/settings/keys))
- `XAI_API_KEY` — xAI ([create](https://console.x.ai))
- `GOOGLE_GENERATIVE_AI_API_KEY` — Google AI ([create](https://aistudio.google.com/app/api-keys))
- `PERPLEXITY_API_KEY` — Perplexity ([create](https://www.perplexity.ai/account/api/keys); you may need to create an [API group](https://www.perplexity.ai/account/api/group?create=true) first)
- `FIREWORKS_API_KEY` — Fireworks ([create](https://app.fireworks.ai/settings/users/api-keys))

Without these, the app still runs but only OpenAI models are available.

**File uploads to S3 + CloudFront (optional):**

- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_UPLOADS_BUCKET`
- `AWS_CLOUDFRONT_KEY_PAIR_ID`
- `AWS_CLOUDFRONT_PRIVATE_KEY` — private key with `|` as line breaks (deprecated).
- `AWS_CLOUDFRONT_PRIVATE_KEY_BASE64` — base64-encoded private key. Convert with `cat key.pem | base64 > base64_key.pem`.
- `AWS_CLOUDFRONT_DISTRIBUTION_DOMAIN` — falls back to `AWS_UPLOADS_BUCKET` if your bucket name matches the distribution domain.

> [!WARNING]
> If any `AWS_` variable is missing, uploads are persisted in the database instead of S3.

### AWS (CloudFormation)

Two ready-made stacks live in [`aws/`](aws/) — they create an ECS cluster with RDS PostgreSQL, an Application Load Balancer, and the necessary networking.

- [`cloudformation-ec2.json`](aws/cloudformation-ec2.json) — ECS on EC2.
- [`cloudformation-fargate.json`](aws/cloudformation-fargate.json) — ECS on Fargate.

To visualize either template, open the [AWS CloudFormation Infrastructure Composer](https://eu-central-1.console.aws.amazon.com/composer/home), choose **Create project → Template tab → JSON**, and paste the contents.

**Prerequisites — store secrets in AWS Secrets Manager:**

1. Go to **Secrets Manager → Store a new secret → Other type of secret → Plaintext**.
2. Create `fyzz-chat/better-auth-secret` (random string, 32+ chars).
3. Create `fyzz-chat/openai-api-key` with your OpenAI key.
4. Note the ARNs — you'll pass them as stack parameters.

**Deploy:**

1. **CloudFormation → Create stack → With new resources (standard)**.
2. Upload the chosen template, name the stack `fyzz-chat`.
3. Fill in:
   - `BetterAuthSecretArn` — ARN from above.
   - `OpenaiApiKeySecretArn` — ARN from above.
   - `BetterAuthUrl` — your public URL (e.g. `https://your-domain.com`).
4. Review and create. Stack creation takes ~10–15 minutes.

> [!NOTE]
> Deleting the stack does **not** delete the database. Disable deletion protection and remove it manually if you want it gone.

**Run database migrations:**

1. **ECS → Clusters → your cluster → Tasks tab → Run new task**.
2. Configure: task definition family `fyzz-chat-migration`, launch type Fargate.
3. Networking: VPC `fyzz-chat-vpc`, security group `fyzz-chat-ecs-sg`.
4. **Create** and wait for completion.

**Enable HTTPS (optional):**

1. **Certificate Manager → Request a certificate** for your domain.
2. Add the DNS validation records and wait for validation.
3. **CloudFormation → your stack → Update**, set the `CertificateArn` parameter, and complete the update.

The template auto-redirects HTTP to HTTPS once a certificate is attached.

## Contributing

Install [Bun](https://bun.sh):

```bash
curl -fsSL https://bun.sh/install | bash
# Windows:
powershell -c "irm bun.sh/install.ps1 | iex"
```

Then follow [Local development](#local-development) above. Other package managers (npm, yarn, pnpm) work too.

### Useful scripts

| Script | What it does |
|---|---|
| `bun dev` | Start the dev server |
| `bun build` | Build for production |
| `bun build:standalone` | Build for Docker / standalone deploy |
| `bun start` | Run the production build |
| `bun db:migrate` | Apply Prisma migrations (development) |
| `bun db:deploy` | Apply Prisma migrations (production) |
| `bun test` | Run unit tests |
| `bun test:integration` | Run integration tests |
| `bun check-write` | Lint + format with Biome |
| `bun type-check` | Type-check with TypeScript |
| `bun dev:email` | Preview transactional emails (port 3001) |

## Stack

[Next.js](https://nextjs.org) · [Bun](https://bun.sh) · [Prisma](https://www.prisma.io) · [Vercel AI SDK](https://ai-sdk.dev) · [Better Auth](https://www.better-auth.com) · [tRPC](https://trpc.io) · [Tailwind CSS](https://tailwindcss.com) · [shadcn/ui](https://ui.shadcn.com) · [Biome](https://biomejs.dev)

---

<div align="center">

If Fyzz Chat is useful to you, consider [starring the repo](https://github.com/Fyzz-Chat/fyzz-chat/stargazers) — it helps others find it.

</div>
