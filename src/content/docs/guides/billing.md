---
title: Billing & Plans
description: Plans, upgrades, downgrades, and invoices via Razorpay.
---

# Billing & Plans

AirBuild offers four plans — Free, Starter, Pro, and Enterprise. Billing is handled by **Razorpay** with support for INR and USD.

:::note[Live pricing]
Plan features and prices are managed in the AirBuild backend and can change at any time. For the most up-to-date pricing, see the **[Pricing page](https://airbuild.dev/pricing)**.
:::

## Plan tiers

| Feature        | Free      | Starter   | Pro        | Enterprise |
| -------------- | --------- | --------- | ---------- | ---------- |
| Apps           | 1         | 3         | 10         | Unlimited  |
| Members        | 2         | 5         | 20         | Unlimited  |
| Storage        | 500 MB    | 10 GB     | 100 GB     | Unlimited  |
| Build size     | 100 MB    | 300 MB    | 1 GB       | Unlimited  |
| Downloads/mo   | 50        | 1,000     | Unlimited  | Unlimited  |
| Link expiry    | 7 days    | 30 days   | Never      | Never      |
| White-label    | —         | —         | ✓          | ✓          |
| SSO            | —         | —         | —          | ✓          |

> Limits shown above are defaults and may differ from what's currently configured. Always refer to the [Pricing page](https://airbuild.dev/pricing) for live values.

## Payment method

Payments are processed by **Razorpay**. Supported methods include:

- Credit and debit cards
- UPI (India)
- Net banking (India)
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

## Trial periods

New paid plans may include a **trial period** (e.g. 14 days of Pro for free). During the trial, you have full access to the plan's features. No payment is charged until the trial ends. You can cancel anytime during the trial to avoid being charged.

## Invoices

Invoices are available for download under **Settings > Billing > Invoices**. Each invoice includes the plan, billing period, amount, tax, and payment method. Invoices are generated automatically after each successful payment.

## Next steps

- [Team Management](./team-management/) — Member limits per plan.
- [Upload Builds](./upload-builds/) — Build size limits per plan.
- [Install Links & QR Codes](./install-links/) — Link expiry per plan.
