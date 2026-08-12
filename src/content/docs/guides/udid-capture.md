---
title: UDID Capture
description: Collect iOS device UDIDs with a one-tap profile installation flow.
---

# UDID Capture

To install an ad-hoc iOS build, the device's **UDID** must be included in the app's provisioning profile. AirBuild makes it easy to collect UDIDs from testers without spreadsheets or manual emails.

## What is a UDID?

The **UDID** (Unique Device Identifier) is a 40-character (or 25-character on newer devices) string that uniquely identifies an iOS device. Apple requires it to be included in your provisioning profile before an ad-hoc build can be installed on that device.

## Why is it needed?

Ad-hoc iOS builds are restricted to devices listed in the provisioning profile. If a tester's device UDID isn't in the profile, the install will fail. Before you can distribute to a new tester, you need their UDID — and AirBuild captures it automatically.

## How AirBuild captures UDID

The UDID capture flow uses iOS's mobileconfig profile mechanism:

1. **Tester taps "Register Device"** on the AirBuild install page.
2. **iOS installs a `.mobileconfig` profile** — AirBuild generates and serves a temporary configuration profile. iOS prompts the tester to install it.
3. **Profile sends UDID back to AirBuild** — When the profile is installed, iOS sends the device's UDID (and other info) back to AirBuild's server. The profile is then automatically removed.
4. **Org owners/admins get an email notification** — A notification is sent with the device details so the developer knows a new device needs to be added.
5. **Developer adds the UDID to the provisioning profile** — In the Apple Developer portal, register the device, add it to the provisioning profile, and download the updated profile.
6. **Rebuild and re-upload** — Rebuild the app with the updated provisioning profile and upload the new build to AirBuild. The tester can now install it.

## Device info captured

When a tester registers their device, AirBuild captures:

- **UDID** — The unique device identifier
- **Device name** — The user-set name of the device (e.g. "Alice's iPhone")
- **Model** — The device model (e.g. "iPhone 15 Pro")
- **OS version** — The installed iOS version (e.g. "17.4.1")

## Viewing registered devices

Registered devices are listed in the dashboard under **Devices** (within an app or organization). You can copy the UDID directly from the list to paste into the Apple Developer portal.

## Next steps

- [iOS OTA Installation](./ios-installation/) — How ad-hoc installs work once the UDID is registered.
- [Team Management](./team-management/) — Manage who has access to your apps.
