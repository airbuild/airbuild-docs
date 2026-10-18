---
title: Apple Developer Integration
description: Connect your Apple Developer account to auto-register tester device UDIDs and manage devices centrally.
---

# Apple Developer Integration

Connect your Apple Developer account once, and AirBuild can register captured device UDIDs on it automatically — no more pasting UDIDs into the Apple Developer portal by hand. You can also view and manage every device on your account from one place.

## What you get

- **Automatic device registration** — When a tester registers their device via a [UDID invite](./udid-capture/), AirBuild registers the UDID on your Apple Developer account immediately.
- **Central device management** — The **Apple Devices** page lists every device on your Apple Developer account, including devices registered outside AirBuild, with rename and enable/disable actions.
- **Registration status tracking** — See which captured UDIDs are already on your account and register the rest in one click.
- **Failure alerts** — If Apple rejects your API key, owners and admins are notified by email and a warning appears in Settings.

## Prerequisites

- A **paid Apple Developer Program** membership.
- **Account Holder** or **Admin** access in App Store Connect (required to create API keys).
- An **owner or admin** role in your AirBuild organization.

## Step 1 — Create an App Store Connect API key

1. Sign in to [App Store Connect](https://appstoreconnect.apple.com).
2. Go to **Users and Access → Integrations → App Store Connect API**.
3. Under **Team Keys**, click **Generate API Key** (or the **+** button).
4. Give the key a name you'll recognize, e.g. "AirBuild".
5. Set the role to **App Manager** or **Admin** — a Developer-role key cannot register devices.
6. Click **Generate**.
7. **Download the `.p8` private key immediately** — Apple only lets you download it once. If you lose it, you must revoke the key and create a new one.
8. Note the **Key ID** shown next to the key, and the **Issuer ID** shown at the top of the Integrations page.

:::caution
Create a **dedicated** key for AirBuild rather than reusing one shared with other tools — you can revoke it independently later.
:::

### Finding each value

| Field | Where to find it |
|---|---|
| **Issuer ID** | App Store Connect → Users and Access → Integrations → top of the page (UUID format). |
| **Key ID** | The 10-character ID shown next to your API key in the same list. |
| **Private key** | The contents of the `.p8` file you downloaded — open it in a text editor and copy everything including the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. |
| **Team ID** (optional) | [developer.apple.com](https://developer.apple.com) → Membership details → 10-character Team ID. |

## Step 2 — Connect in AirBuild

1. Open **Settings** and find the **Apple Developer Integration** card.
2. Click to edit and fill in **Issuer ID**, **Key ID**, the **private key contents**, and optionally **Team ID**.
3. Click **Verify & Save**.

AirBuild calls Apple with the key before saving it — if Apple rejects it, you'll see the reason immediately and nothing is stored. Once verified, the key is stored **encrypted** and is never shown or returned again. If you need to change it later, generate a new key and use **Replace key**.

## Step 3 — Enable auto-registration per app

Auto-registration is opt-in for each app:

1. Open your app and go to the **Devices** tab.
2. Turn on **Auto-register devices**.
3. From now on, every UDID captured through a device invite is registered on your Apple Developer account automatically.

The "new device registered" email sent to owners and admins reports the outcome — either "Registered on your Apple Developer account" or the reason it couldn't be, so failures never go unnoticed.

:::note
Auto-registration only registers the device — it does not add it to a provisioning profile. You still need to include the device in your provisioning profile and rebuild before the tester can install.
:::

## The Apple Devices page

:::note[Plan availability]
Central device management is available on **Starter, Pro, Business, and Enterprise** plans. Device *registration* — auto-registration, manual Register, Register all, and Sync status — works on every plan, including Free.
:::

Once connected, an **Apple Devices** item appears in the sidebar (visible to owners, admins, and developers). It shows **every device on your Apple Developer account** — not just ones captured by AirBuild — merged with AirBuild context like the tester's email and the app they registered for.

From there you can:

- **Rename** a device — updates the name on Apple's side.
- **Enable / disable** a device — disabled devices can't be added to new provisioning profiles, but apps already installed keep working.
- **Refresh** — pull the latest list from Apple.
- See the **total device count** for your account.

:::caution[Apple limitations]
- Apple does not allow deleting devices via the API — devices can only be disabled.
- A disabled device still counts toward Apple's 100-devices-per-year limit until your membership renews. Plan accordingly.
:::

## Managing devices per app

Your app's **Devices** tab keeps working as before, plus:

- **Register** — send a single captured UDID to Apple manually.
- **Register all** — register every captured device not yet on your account.
- **Sync status** — reconcile the local "registered" flag with what's actually on your Apple account (disabled devices count as registered — they still occupy a slot).
- **Remove** — delete a captured device from AirBuild. This doesn't remove it from your Apple Developer account (use Apple Devices to disable it there) and doesn't affect builds already installed on it.

## Connection problems

If Apple rejects the API key — for example it's been revoked, expired, or had its role reduced:

- Owners and admins receive an **email alert** (at most one per day).
- A **"Connection problem"** warning appears on the Settings card and the Apple Devices page, along with the reason and when it started.
- Auto-registration keeps trying but keeps failing until the key is replaced — captured devices can always be registered manually afterward.

Any successful call to Apple clears the warning automatically.

## Troubleshooting

### "Verify & Save" fails

- Check the **Issuer ID** — it's the UUID at the top of the Integrations page, not your Team ID.
- Check the **Key ID** — the 10-character ID of the API key, not the key's name.
- Paste the **entire `.p8` file contents**, including the `BEGIN`/`END` lines.
- Make sure the key's role is **App Manager** or **Admin**.

### Auto-registration fails on capture

- **Device limit reached** — Apple caps each account at 100 devices per membership year. Disable unused devices on the Apple Devices page, or wait for your renewal reset.
- **Invalid UDID** — rare; usually means a malformed capture.
- The failure reason is always included in the capture notification email.

### "Connection problem" banner won't go away

- Click **Check** next to "Devices on Apple" in Settings, or **Refresh** on the Apple Devices page — a successful call clears it.
- If calls keep failing, replace the API key.

## Next steps

- [UDID Capture](./udid-capture/) — How device invites and UDID capture work.
- [iOS OTA Installation](./ios-installation/) — How installs work once devices are registered.
- [Team Management](./team-management/) — Control who can manage credentials and devices.
