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

1. Open the **[API Keys](https://airbuild.dev/api-keys)** page in the dashboard (sidebar → API Keys).
2. Click **Create API Key**.
3. Enter a **name** for the key (e.g. "CI pipeline", "Local CLI").
4. Choose the key's **scopes** — what it is allowed to do (see [Scopes](#scopes)).
5. Choose **All apps** or **Specific apps** (see [Limiting a key to specific apps](#limiting-a-key-to-specific-apps)).
6. Choose an **expiry**. Keys that can change data must expire within 1 year.
7. Click **Create**.
8. The key is displayed **once** — copy it immediately and store it securely.

> ⚠️ The full key is only shown at creation time. If you lose it, you'll need to revoke it and create a new one.

## Scopes

Give each key only the scopes it needs. A key can hold any combination:

| Scope | Allows |
| ----- | ------ |
| `read` | List apps, builds, install links and OTA status; download a release. |
| `upload` | Upload builds and create install links. |
| `ota:publish` | Publish, promote and roll back OTA updates (Flutter and React Native). |
| `apps:create` | Create new apps. A key without this scope can never create apps. |

Scopes are independent: `upload` does not include `read`, and `ota:publish` does not include `upload`. A CI job that only uploads builds needs just `upload`. Add `read` if it also needs to list apps or builds.

A request outside a key's scopes is rejected with `401`, except app creation, which returns `403` with an explanation.

> Keys created before granular scopes keep working: a legacy **Deploy** key behaves as `upload` + `ota:publish`, and a legacy **Full** key behaves as every scope. You can't create new keys with these legacy values.

## Limiting a key to specific apps

By default a key works on **all apps** in your organization. For CI, restrict it to just the app that pipeline ships:

1. In the create form, choose **Specific apps**.
2. Tick the apps the key may use.

A restricted key only sees its own apps in lists, and any request for another app returns `404 App not found`. This limits the damage if a pipeline secret leaks: it can't upload to, or publish OTA updates for, your other apps.

A key that can create apps can't be restricted to specific apps, because a new app can't be in a list chosen in advance.

## Expiry

- Keys with `upload`, `ota:publish` or `apps:create` **must** expire in 1 to 365 days.
- Read-only keys may have no expiry, or expire in up to 10 years.
- An expired key stops working immediately. Create a replacement and update your pipeline secret before the old key expires.

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
- Prefer the narrowest scopes and a single app per CI key — for example `upload` on one app for a build pipeline.

## Revoking keys

To revoke a key:

1. Go to the **[API Keys](https://airbuild.dev/api-keys)** page.
2. Find the key you want to revoke.
3. Click **Revoke**.
4. The key immediately stops working for all API and CLI requests.

## Usage tracking

Each key has a `lastUsedAt` timestamp visible on the API Keys page. Use this to identify stale or unused keys that can be safely revoked.

## Next steps

- [REST API Reference](./api-reference/) — Full list of endpoints.
- [CLI Tool](./cli/) — Use API keys with the AirBuild CLI.
- [Webhooks](./webhooks/) — Receive event callbacks.
