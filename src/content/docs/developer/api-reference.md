---
title: REST API Reference
description: Complete reference for the AirBuild REST API, including uploads, links, and CLI endpoints.
---

# REST API Reference

The AirBuild REST API lets you upload builds, manage apps and links, invite team members, configure webhooks, and create API keys programmatically.

## Base URL

```text
https://airbuild.dev
```

## Authentication

The API supports two authentication methods:

| Method      | Header / mechanism                          | Use case                    |
| ----------- | ------------------------------------------- | --------------------------- |
| Session     | Browser cookie (set by Better Auth)         | Dashboard, browser flows    |
| API key     | `Authorization: Bearer airbuild_xxx`        | CLI, CI/CD, scripts         |

## Interactive API docs

An interactive **OpenAPI viewer** is available at [`/api-docs`](https://airbuild.dev/api-docs) when logged in. You can explore endpoints, parameters, and try requests directly from the browser.

## Endpoints

### Uploads

#### `POST /api/upload` — Upload a build

Upload a build file. Requires an API key. Request body is `multipart/form-data`.

| Field          | Type   | Required | Description                |
| -------------- | ------ | -------- | -------------------------- |
| `file`         | file   | ✓        | The `.ipa` or `.apk` file. |
| `appId`        | string | ✓        | The app to upload to.      |
| `platform`     | string | ✓        | `ios` or `android`.        |
| `releaseNotes` | string | —        | Optional release notes.    |

```bash
curl -X POST https://airbuild.dev/api/upload \
  -H "Authorization: Bearer airbuild_xxx" \
  -F "file=@./app.apk" \
  -F "appId=clxxxxx" \
  -F "platform=android" \
  -F "releaseNotes=Bug fixes and performance improvements"
```

### Apps

#### `GET /api/apps` — List apps

List all apps in the current organization.

```bash
curl https://airbuild.dev/api/apps \
  -H "Authorization: Bearer airbuild_xxx"
```

#### `POST /api/apps` — Create an app

Create a new app within the current organization.

| Field      | Type   | Required | Description          |
| ---------- | ------ | -------- | -------------------- |
| `name`     | string | ✓        | App name.            |
| `platform` | string | ✓        | `ios` or `android`.  |

```bash
curl -X POST https://airbuild.dev/api/apps \
  -H "Authorization: Bearer airbuild_xxx" \
  -H "Content-Type: application/json" \
  -d '{"name":"My App","platform":"ios"}'
```

### Builds

#### `GET /api/apps/{appId}/builds` — List builds

List all builds for a given app.

```bash
curl https://airbuild.dev/api/apps/{appId}/builds \
  -H "Authorization: Bearer airbuild_xxx"
```

#### `DELETE /api/apps/{appId}/builds/{buildId}` — Delete a build

Delete a specific build and its associated file.

```bash
curl -X DELETE https://airbuild.dev/api/apps/{appId}/builds/{buildId} \
  -H "Authorization: Bearer airbuild_xxx"
```

#### `PATCH /api/builds/{buildId}/password` — Set password

Set or update the password on a build's install link.

```bash
curl -X PATCH https://airbuild.dev/api/builds/{buildId}/password \
  -H "Authorization: Bearer airbuild_xxx" \
  -H "Content-Type: application/json" \
  -d '{"password":"s3cret"}'
```

### Links

#### `GET /api/links/{slug}` — Get link info

Retrieve details about an install link by its slug.

```bash
curl https://airbuild.dev/api/links/{slug} \
  -H "Authorization: Bearer airbuild_xxx"
```

#### `POST /api/links/{slug}` — Regenerate link

Generate a new slug for the link. The old URL stops working immediately.

```bash
curl -X POST https://airbuild.dev/api/links/{slug} \
  -H "Authorization: Bearer airbuild_xxx"
```

#### `PATCH /api/links/{slug}` — Revoke or restore

Revoke or restore an install link.

```bash
curl -X PATCH https://airbuild.dev/api/links/{slug} \
  -H "Authorization: Bearer airbuild_xxx" \
  -H "Content-Type: application/json" \
  -d '{"revoked":true}'
```

### CLI endpoints

These endpoints are optimized for CLI and CI/CD usage and require an API key.

| Method | Path                              | Description              |
| ------ | --------------------------------- | ------------------------ |
| GET    | `/api/cli/verify`                 | Verify an API key.       |
| GET    | `/api/cli/apps`                   | List apps.               |
| GET    | `/api/cli/apps/{appId}/builds`    | List builds for an app.  |
| GET    | `/api/cli/links?appId=`           | List links for an app.   |
| POST   | `/api/cli/links`                  | Create a link.           |

```bash
# Verify an API key
curl https://airbuild.dev/api/cli/verify \
  -H "Authorization: Bearer airbuild_xxx"

# List apps
curl https://airbuild.dev/api/cli/apps \
  -H "Authorization: Bearer airbuild_xxx"

# List builds for an app
curl https://airbuild.dev/api/cli/apps/{appId}/builds \
  -H "Authorization: Bearer airbuild_xxx"

# List links for an app
curl "https://airbuild.dev/api/cli/links?appId={appId}" \
  -H "Authorization: Bearer airbuild_xxx"

# Create a link
curl -X POST https://airbuild.dev/api/cli/links \
  -H "Authorization: Bearer airbuild_xxx" \
  -H "Content-Type: application/json" \
  -d '{"buildId":"clxxxxx"}'
```

### Downloads & manifests

| Method | Path                            | Description                              |
| ------ | ------------------------------- | ---------------------------------------- |
| GET    | `/api/dl/{slug}/download`       | Download the build file.                 |
| GET    | `/api/dl/{slug}/manifest`       | Get the iOS manifest plist.              |
| POST   | `/api/dl/{slug}/unlock`         | Unlock a password-protected link.        |

```bash
# Download a build
curl -L https://airbuild.dev/api/dl/{slug}/download -o app.apk

# Unlock a password-protected link
curl -X POST https://airbuild.dev/api/dl/{slug}/unlock \
  -H "Content-Type: application/json" \
  -d '{"password":"s3cret"}'
```

### SDK endpoints

These public endpoints are used by the AirBuild SDKs (Flutter, React Native, iOS, Android). They do not require an API key — authentication is via the distribution key (`dk_xxx`) which is public and safe to embed in client apps.

#### `GET /api/sdk/check-update` — Check for updates

Query the server for the latest build available for a given app and platform.

| Parameter   | Type   | Required | Description                              |
| ----------- | ------ | -------- | ---------------------------------------- |
| `key`       | string | ✓        | Distribution key (`dk_xxx`).             |
| `version`   | string | ✓        | Current app version (e.g. `1.0.0`).      |
| `platform`  | string | ✓        | `ios` or `android`.                      |

```bash
curl "https://airbuild.dev/api/sdk/check-update?key=dk_xxx&version=1.0.0&platform=android"
```

Response when an update is available:

```json
{
  "hasUpdate": true,
  "latestVersion": "1.2.0",
  "latestBuildNumber": 42,
  "buildId": "clxxxxx",
  "releaseNotes": "Bug fixes and performance improvements",
  "downloadUrl": "https://airbuild.dev/api/sdk/download/abc123",
  "installUrl": "https://airbuild.dev/d/abc123",
  "fileSizeBytes": 24567890,
  "iconUrl": "https://airbuild.dev/icon/app-icon.png",
  "minOsVersion": "13.0",
  "isPasswordProtected": false,
  "createdAt": "2026-09-01T12:00:00.000Z"
}
```

Response when no update is available:

```json
{ "hasUpdate": false }
```

#### `GET /api/sdk/download/{key}` — Download build

Redirects to a signed S3 URL for the build binary (APK or IPA). Used by Android SDKs to download the APK for installation.

```bash
curl -L "https://airbuild.dev/api/sdk/download/{key}" -o app.apk
```

#### `POST /api/sdk/report-event` — Report analytics event

Records an analytics event from the SDK. Used for tracking update prompts, downloads, and installs.

| Field      | Type   | Required | Description                                              |
| ---------- | ------ | -------- | -------------------------------------------------------- |
| `key`      | string | ✓        | Distribution key (`dk_xxx`).                             |
| `buildId`  | string | ✓        | The build ID the event pertains to.                      |
| `event`    | string | ✓        | Event type (see below).                                  |
| `platform` | string | —        | `ios` or `android`.                                      |
| `udid`     | string | —        | Device UDID (for iOS ad-hoc distribution).               |

Event types:

| Event                | When it fires                                  |
| -------------------- | ----------------------------------------------- |
| `update_prompt_shown` | The update dialog was shown to the tester.     |
| `update_accepted`     | The tester tapped "Update".                    |
| `update_declined`     | The tester tapped "Later" or dismissed.        |
| `download_started`    | The SDK started downloading the APK (Android). |
| `install_started`     | The SDK triggered the system installer.        |

```bash
curl -X POST https://airbuild.dev/api/sdk/report-event \
  -H "Content-Type: application/json" \
  -d '{"key":"dk_xxx","buildId":"clxxxxx","event":"update_accepted","platform":"android"}'
```

### Team

| Method | Path                | Description         |
| ------ | ------------------- | ------------------- |
| GET    | `/api/team/invites` | List pending invites. |
| POST   | `/api/team/invites` | Invite a member.    |

```bash
# List invites
curl https://airbuild.dev/api/team/invites \
  -H "Authorization: Bearer airbuild_xxx"

# Invite a member
curl -X POST https://airbuild.dev/api/team/invites \
  -H "Authorization: Bearer airbuild_xxx" \
  -H "Content-Type: application/json" \
  -d '{"email":"tester@example.com","role":"tester"}'
```

### Webhooks

| Method | Path                | Description          |
| ------ | ------------------- | -------------------- |
| GET    | `/api/org/webhooks` | List webhooks.       |
| POST   | `/api/org/webhooks` | Create a webhook.    |

```bash
# List webhooks
curl https://airbuild.dev/api/org/webhooks \
  -H "Authorization: Bearer airbuild_xxx"

# Create a webhook
curl -X POST https://airbuild.dev/api/org/webhooks \
  -H "Authorization: Bearer airbuild_xxx" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/webhook","events":["build.uploaded","download.started"]}'
```

### API keys

| Method | Path             | Description          |
| ------ | ---------------- | -------------------- |
| GET    | `/api/api-keys`  | List API keys.       |
| POST   | `/api/api-keys`  | Create an API key.   |

```bash
# List API keys
curl https://airbuild.dev/api/api-keys \
  -H "Authorization: Bearer airbuild_xxx"

# Create an API key
curl -X POST https://airbuild.dev/api/api-keys \
  -H "Authorization: Bearer airbuild_xxx" \
  -H "Content-Type: application/json" \
  -d '{"name":"CI pipeline"}'
```

## Next steps

- [API Keys](./api-keys/) — Create and manage keys.
- [Webhooks](./webhooks/) — Receive event callbacks.
- [CLI Tool](./cli/) — Use the API from the command line.
