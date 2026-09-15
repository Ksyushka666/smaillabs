# SmailLabs

SmailLabs is a Minecraft development and community portal built with React, Tailwind CSS, Express, tRPC, Drizzle and Manus OAuth.

## Included features

- Projects, team, news, forum and team applications.
- Interactive Minecraft heads with mobile-safe layout and texture fallbacks.
- YouTube RSS/Data API synchronization for `@YTSmailDog`, video/Shorts filters, popularity sorting and title search.
- Discord notifications for new videos with configurable Shorts and message-format settings.
- Admin panel with visual settings, content management, YouTube synchronization and notification controls.

## Development

```bash
pnpm install
pnpm dev
```

Validation commands:

```bash
pnpm check
pnpm test
pnpm build
```

## Deployment

The live full-stack deployment is managed by Manus WebDev so database, OAuth, storage and server secrets remain available. Changes made in the Manus project are checkpointed and deployed through the project publishing flow. This repository contains the public source mirror and runs the same typecheck, test and production-build checks on every push through GitHub Actions.

Runtime secrets such as `DATABASE_URL`, `JWT_SECRET`, `YOUTUBE_DATA_API_KEY` and `DISCORD_YOUTUBE_WEBHOOK_URL` are intentionally not stored in this public repository.

For a separate production host, configure the host's environment variables and deploy the Node production bundle produced by `pnpm build`; do not copy secrets into GitHub files.
