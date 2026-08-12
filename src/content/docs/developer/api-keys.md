---
title: API Keys
description: Create and manage API keys for CLI and CI/CD access.
---

# API Keys

API keys let you authenticate with the AirBuild API and CLI without a browser session. They're ideal for CI/CD pipelines, automation scripts, and the AirBuild CLI.

## What are API keys?

An API key is a long-lived secret token that authenticates requests to the AirBuild REST API. Use it in place of a browser session cookie when running automated workflows or the CLI.

## Key format

API keys follow the format:

```text
airbuild_ + 32 hex characters
```

For example:

```text
airbuild_1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d
```

The `airbuild_` prefix makes keys easy to identify in logs and secrets managers.

## Creating an API key

1. Go to **Settings > API Keys** in the dashboard.
2. Click **Create API Key**.
3. Enter a **name** for the key (e.g. "CI pipeline", "Local CLI").
4. Click **Create**.
5. The key is displayed **once** — copy it immediately and store it securely.

> ⚠️ The full key is only shown at creation time. If you lose it, you'll need to revoke it and create a new one.

## Authentication

Use the key in the `Authorization` header as a Bearer token:

```text
Authorization: Bearer airbuild_xxx
```

Example:

```bash
curl https://airbuild.dev/api/cli/verify \
  -H "Authorization: Bearer airbuild_xxx"
```

## Storage and security

- The API key is **hashed (SHA-256)** in the database. AirBuild cannot recover or display the full key after creation.
- Store keys in a secrets manager (e.g. GitHub Actions secrets, AWS Secrets Manager, 1Password).
- Never commit keys to source control.
- Use a separate key for each environment or pipeline so you can revoke individual keys if compromised.

## Revoking keys

To revoke a key:

1. Go to **Settings > API Keys**.
2. Find the key you want to revoke.
3. Click **Revoke**.
4. The key immediately stops working for all API and CLI requests.

## Usage tracking

Each key has a `lastUsedAt` timestamp visible on the API Keys page. Use this to identify stale or unused keys that can be safely revoked.

## Next steps

- [REST API Reference](./api-reference/) — Full list of endpoints.
- [CLI Tool](./cli/) — Use API keys with the AirBuild CLI.
- [Webhooks](./webhooks/) — Receive event callbacks.
