# Command: 365 Tools Challenge — Build One Micro-Tool

Picks a new tool idea, builds it from the base template, deploys to Vercel, and documents it on the agency website.

## When to use

Run daily via the scheduled remote agent to keep the 365 Tools Challenge going automatically.

## What it does

1. Fetches all 200+ existing repos + live site to avoid duplicates
2. Picks a new tool idea that passes the "Would someone Google this?" filter
3. Forks `base-template-for-tool-development` and clones it
4. Implements the full tool (TypeScript, pure client-side, shadcn/ui)
5. Links to Vercel, sets env vars, deploys via GitHub Actions
6. Verifies live URL returns 200 and GA tag is present
7. Creates Linear child ticket
8. Adds work MDX + blog MDX + social posts to agency-website
9. Generates OG screenshot (attempts — gracefully skips if unavailable)
10. Opens a PR on agency-website — does NOT merge

## Required environment variables

These must be set in the routine config before this runs:

| Variable | Purpose | Get it from |
|---|---|---|
| `GITHUB_TOKEN` | Clone, push, fork, open PRs | github.com/settings/tokens |
| `VERCEL_TOKEN` | `vercel link` + `vercel env add` | vercel.com/account/tokens |
| `LINEAR_API_KEY` | Create Linear child tickets | linear.app/settings/api |

## Prompt file

`.claude/prompts/tool-builder.mdx`

## Scheduled routine

Runs automatically every day at a configured IST time via the `tools-challenge-daily` remote agent routine.

## What it does NOT do

- Merge PRs
- Create `.env.production` (forbidden — Vercel env vars set via CLI)
- Use SSH git URLs (HTTPS only)
- Write backend code or API calls (all tools are pure client-side)

## Manual run

To trigger outside the schedule, go to:
https://claude.ai/code/routines
