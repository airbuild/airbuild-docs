---
title: UDID Capture
description: Collect iOS device UDIDs from invited testers with a one-tap profile installation flow.
---

# UDID Capture

To install an ad-hoc iOS build, the device's **UDID** must be included in the app's provisioning profile. AirBuild lets you invite testers by email and capture their UDID — together with their name — without spreadsheets or back-and-forth messages.

## What is a UDID?

The **UDID** (Unique Device Identifier) is a 40-character (or 25-character on newer devices) string that uniquely identifies an iOS device. Apple requires it to be included in your provisioning profile before an ad-hoc build can be installed on that device.

## Why is it needed?

Ad-hoc iOS builds are restricted to devices listed in the provisioning profile. If a tester's device UDID isn't in the profile, the install will fail. Before you can distribute to a new tester, you need their UDID — and AirBuild captures it automatically.

## How AirBuild captures UDID

UDID capture is **invite-based**. Each tester gets a personal, single-use registration link:

1. **You send a device invite** — In the dashboard, open your app and go to the **Devices** tab, then click **Invite Tester** and enter the tester's email (and optional name).
2. **The tester opens the link on their iPhone** — The link takes them to a personal enrollment page that greets them by name and email.
3. **iOS installs a `.mobileconfig` profile** — iOS prompts the tester to install a temporary configuration profile.
4. **The profile sends the UDID back to AirBuild** — The device record is stored together with the tester's **name and email**, so you always know which UDID belongs to whom.
5. **You get an email notification** — Org owners and admins are notified when a device registers.
6. **Register the UDID on your Apple Developer account** — If you've connected the [Apple Developer integration](./apple-developer-integration/) and enabled auto-registration, this happens automatically. Otherwise register the device manually in the Apple Developer portal (or use the **Register** button in the Devices tab).
7. **Add the device to your provisioning profile** — Include it in the profile, download the updated profile, and mark the device as **Registered** in the Devices tab to track it.
8. **Rebuild and re-upload** — Upload a build signed with the updated profile; the tester can now install it.

:::note
Public install links no longer offer UDID registration — device enrollment always happens through a personal invite so every UDID is tied to a verified email address.
:::

## Managing invites

The **Devices** tab shows pending invites with resend and revoke actions:

- **Resend** — Sends the enrollment email again.
- **Revoke** — Invalidates the invite link (does not remove an already-captured device).

Invites are single-use and expire after 30 days.

## Device info captured

When a tester registers their device, AirBuild captures:

- **Tester name and email** — From the invite, so every UDID has an owner
- **UDID** — The unique device identifier
- **Device name** — The user-set name of the device (e.g. "Alice's iPhone")
- **Model** — The device model (e.g. "iPhone 15 Pro")
- **OS version** — The installed iOS version (e.g. "17.4.1")

## Viewing registered devices

Devices are listed in your app's **Devices** tab. You can copy the UDID directly from the list to paste into the Apple Developer portal, and mark a device as **Registered** once it's been added to a provisioning profile.

With the [Apple Developer integration](./apple-developer-integration/) connected, the tab also offers:

- **Auto-register devices** — Toggle to register every newly captured UDID on your Apple account automatically.
- **Register** / **Register all** — Push captured UDIDs to Apple manually.
- **Sync status** — Reconcile the registered flag with what's actually on your Apple account.
- **Remove** — Delete the captured device from AirBuild (does not affect the Apple account or already-installed builds).

For account-wide device management — including devices registered outside AirBuild — see the [Apple Devices page](./apple-developer-integration/#the-apple-devices-page).

## Standalone UDID tool

Need *your own* UDID quickly, without any app or invite? There's a public, build-agnostic version of the tool at [airbuild.dev/udid](https://airbuild.dev/udid). Enter an email, verify the magic link, install the profile on your iPhone, and the UDID is shown on screen and emailed to you. It isn't tied to any app or organization.

## Next steps

- [Apple Developer Integration](./apple-developer-integration/) — Auto-register UDIDs and manage devices centrally.
- [iOS OTA Installation](./ios-installation/) — How ad-hoc installs work once the UDID is registered.
- [Team Management](./team-management/) — Manage who has access to your apps.
