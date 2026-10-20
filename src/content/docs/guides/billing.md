---
title: Billing & Plans
description: Plans, upgrades, downgrades, and invoices via Razorpay.
---

# Billing & Plans

AirBuild offers four self-serve plans — Free, Starter, Pro, and Business — plus Enterprise with custom pricing. Billing is handled by **Razorpay** with support for INR and USD.

:::note[Live pricing]
Plan features and prices are managed in the AirBuild backend and can change at any time. For the most up-to-date pricing, see the **[Pricing page](https://airbuild.dev/pricing)**.
:::

## Plan tiers

For current limits and prices per plan, always refer to the **[Pricing page](https://airbuild.dev/pricing)** — it reads live values from the platform and is the single source of truth. The table below explains what each billed metric actually means:

| Metric | What it counts |
| ------ | -------------- |
| Apps | Apps you own in your workspace. Over the limit, excess apps are archived — still accessible, not deleted. |
| Team members | People in your workspace, including invites. |
| Storage | Build files stored on the platform. See [storage enforcement](#add-ons) below for what happens when you exceed it. |
| Build size | Maximum size of a single uploaded build. |
| Downloads/mo | Builds downloaded through install links (your testers installing apps). |
| Link expiry | How long an install link stays valid. |
| OTA update publishes/mo | Each OTA (CodePush) update you publish to a channel. |
| OTA patch downloads/mo | Each asset a device fetches when downloading an OTA update — one patch is several assets, so this number is far larger than "number of updates installed". |
| OTA devices/mo | **Unique devices** that check in for OTA updates each month — your monthly active devices (same metric as competitors' MAU). One device counts once regardless of how many updates it pulls. |
| Apple device management | Automatic UDID capture and device registration on your Apple Developer account. |
| API access / Webhooks | REST API and outbound webhooks for automation. |
| White-label / SSO | Branding removal and single sign-on. |

## Payment method

Payments are processed by **Razorpay**. Supported methods include:

- Credit and debit cards
- UPI (India)
- Net banking (eMandate — first charge happens once your bank confirms the mandate, which can take up to a day)
- Wallets

## Managing your subscription

### Upgrading

1. Go to **Settings > Billing**.
2. Select the plan you want to upgrade to.
3. Choose a billing cycle (monthly or annual).
4. Complete the Razorpay checkout.
5. Your new limits take effect immediately.

### Downgrading

1. Go to **Settings > Billing**.
2. Select a lower plan.
3. Confirm the change.
4. The downgrade takes effect at the **end of your current billing period**. Until then, you keep your current plan's limits.

> If you're over the new plan's limits (e.g. more apps than allowed), you'll need to remove apps or builds before the downgrade takes effect.

### Canceling

1. Go to **Settings > Billing**.
2. Click **Cancel Subscription**.
3. Confirm the cancellation.
4. Your plan reverts to **Free** at the end of the current billing period.

## Evaluating AirBuild

There is no timed free trial — instead, the **Free plan** serves as the evaluation tier and never expires. It includes a small OTA quota (publishes, devices, and patch downloads) so you can integrate and test over-the-air updates end-to-end before paying. Paid subscriptions charge the first billing period up front.

## Multiple organizations

The Free tier is limited to **one organization per account** — your oldest unpaid organization keeps the Free plan. If you create additional organizations without subscribing them, they are **suspended** (uploads, downloads, and OTA actions are blocked) until they get a paid plan. Suspended organizations get warning emails over a 30-day grace period; if no plan is added, the workspace's data (apps, builds, links, keys) is permanently deleted. Billing records and usage history are always retained. Paid organizations are never affected — you can own as many as you like.

## Taxes (GST)

All plan prices are shown **exclusive of GST**. GST is calculated and added at checkout, based on the billing address in **Settings > General**:

| Billing address | Tax applied |
| --- | --- |
| Outside India | No GST (export of services) |
| Karnataka (same state as AirBuild) | CGST + SGST (half the rate each) |
| Any other Indian state | IGST |

This applies to **every** charge: the first subscription payment, renewals, upgrade prorations, add-ons, and usage packs. The subscribe dialog shows the GST-inclusive total before you pay, and that total is what gets charged.

For Indian billing addresses you must select your **state** before subscribing, because it decides the CGST/SGST vs IGST split. A **GSTIN** is optional. Add one to get a B2B invoice you can claim input tax credit on; without one you get a B2C invoice.

## Coupons

You can enter a coupon code in the subscribe dialog. There are three kinds:

- **Percentage off**: reduces every billing cycle by a percentage.
- **Fixed amount off**: reduces every billing cycle by a fixed amount, in the coupon's currency.
- **Free renewals**: your first month is charged as normal, then the next *N* monthly renewals are free. Example: you subscribe on 1 October with a 2-month coupon. You pay for October, November and December are free, and normal billing resumes on 1 January. Each free month still gets a ₹0 billing document, so your billing history has no gaps. These coupons only work on **monthly** plans.

Coupon discounts are applied **before** GST, so tax is only charged on the discounted amount.

## Usage metering

The **Usage** page in the sidebar shows how much of each monthly quota your organization has consumed this period, plus a month-by-month history.

| Meter | What counts |
| --- | --- |
| Build downloads | Each build download through an install link. |
| OTA publishes | Each OTA update you publish. |
| OTA downloads | Each OTA asset a device fetches. |
| OTA devices | Unique devices that checked in for OTA updates this month (MAU). |

OTA usage is metered **separately** from regular build downloads — if you use OTA updates, check both quotas on the Usage page.

## Add-ons

**Plan add-ons** (Billing → Add-ons) add monthly capacity on top of your plan — for example +10 GB storage or +2,500 downloads per month — usually cheaper than upgrading the whole plan. Each add-on shows its rate in real units (e.g. `+10 GB · ₹149/mo`), and the quantity picker previews the exact quota and price you'll get.

OTA **update publishes** have no add-on — they stay within your plan's monthly cap (generous by design), and usage credits act as the overflow if you ever exceed it.

- Add-ons require an **active paid subscription** and only appear for features included in your plan.
- They're billed on the same cycle as your subscription; quantity increases are **prorated** immediately, while **decreases take effect at the next billing period** — you keep what you paid for this cycle.
- If a plan change makes an add-on ineligible, it's flagged so you can cancel it.

**Running out of storage:** if you exceed your storage quota, new uploads are blocked and you'll get warning emails during a grace period (7 days by default). After the grace period, your **oldest builds are automatically deleted** until you're back under quota — each app's latest build is spared so live install links keep working. If you're *still* over quota after that, you'll get one final warning, and a few days later **all remaining builds are deleted** — including latest versions.

## Referrals & wallet

Every account has a **referral link** (Settings → Referrals & Wallet). When someone signs up through it and becomes a paying customer, **both** of you receive the referral reward as wallet balance.

- Wallet balance is applied automatically to invoices, smallest charge first — or the organization owner can **convert it into usage credits** on Billing → Add-ons.
- The reward amount is platform-configured; the current value is shown on the Referrals & Wallet tab.
- A referral link also satisfies signup gating — if signups are invite-only, a referral link counts as an invitation.

## Usage credits

**Credit packs** are one-time prepaid bundles of **usage credits**, bought on Billing → Add-ons. Credits are consumed only **after** your included plan + add-on quotas are exhausted — a pay-as-you-go safety net that keeps installs and OTA updates working mid-month instead of hard-stopping at the quota.

- Credits are added to your balance immediately after payment.
- The per-action credit cost is listed on the same page (high-frequency actions like OTA downloads can price below one credit — e.g. "1 credit per 100 downloads").
- **Wallet conversion** — the organization owner can convert wallet balance (e.g. refunds or promotional credit) into usage credits at the rate shown on the page.

## Invoices

Invoices are available for download under **Settings > Billing > Invoices**. Each invoice shows the plan, billing period, amount, coupon discount, GST breakdown (CGST/SGST or IGST, with HSN/SAC code and place of supply), and payment method. An invoice is created for every charge, including your **first** subscription payment, and you get it by email once the payment succeeds.

Every charge shows two numbers: an **order number** (`ORD-…`) is assigned when the charge is initiated, and a **tax invoice number** (`INV-…`) is assigned only once the payment succeeds. Pending or abandoned checkouts therefore never consume invoice numbers — only completed payments do. Zero-value documents (such as coupon-covered free renewals) get an invoice number immediately because they settle at issuance.

## Next steps

- [Team Management](./team-management/) — Member limits per plan.
- [Upload Builds](./upload-builds/) — Build size limits per plan.
- [Install Links & QR Codes](./install-links/) — Link expiry per plan.
