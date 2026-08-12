---
title: Install Links & QR Codes
description: Shareable install URLs with QR codes, passwords, expiry, and quotas.
---

# Install Links & QR Codes

Every build gets a shareable **install link** — a short URL that opens an install page where testers can install the app over the air.

## What are install links?

An install link is a URL of the form:

```text
https://airbuild.dev/i/abc123
```

The slug (`abc123`) is unique per link. Opening the link on a mobile device shows the install page with app details and an install/download button.

## QR code

Each install link comes with an auto-generated **QR code**. Testers can scan it with their phone camera to open the install page instantly — no typing required.

## Password protection

You can set a **password** on any install link. When a tester opens the link, they'll be prompted to enter the password before they can view the install page or download the build.

Set or change a password from the build detail page or via the API:

```bash
curl -X PATCH https://airbuild.dev/api/builds/{buildId}/password \
  -H "Authorization: Bearer airbuild_xxx" \
  -H "Content-Type: application/json" \
  -d '{"password": "s3cret"}'
```

## Link expiry

Install links expire automatically based on your plan:

| Plan        | Link expiry |
| ----------- | ----------- |
| Free        | 7 days      |
| Starter     | 30 days     |
| Pro         | Never       |
| Enterprise  | Never       |

Expired links return a "link expired" page and can't be used to install. Create a new link to restore access.

## Download quota

You can optionally set a **maximum number of downloads** per link. Once the quota is reached, the link is automatically disabled. This is useful for limited beta rollouts.

## Revoking and restoring links

You can **revoke** a link at any time to immediately disable downloads. Revoked links show a "link revoked" page. You can **restore** a revoked link later to re-enable it.

## Regenerating links

Regenerating a link creates a **new slug** and invalidates the old URL. Anyone using the old URL will see a "link not found" page. Use this if a link has been leaked or shared too widely.

## Install page

The install page displays the following information about the build:

- App icon
- App name
- Version
- Build number
- File size
- Upload date
- Release notes
- Bundle ID
- SHA-256 checksum

## White-label branding

On **Pro** and **Enterprise** plans, the install page can be branded with your organization's logo, brand color, and display name. Configure branding under **Settings > Organization**.

## Next steps

- [iOS OTA Installation](./ios-installation/) — How iOS installs work from the install page.
- [Android APK Installation](./android-installation/) — How Android installs work.
- [API Reference](../developer/api-reference/) — Manage links programmatically.
