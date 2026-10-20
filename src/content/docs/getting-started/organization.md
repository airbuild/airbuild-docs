---
title: Create an Organization
description: Organizations are workspaces that group your team, apps, and billing.
---

# Organizations

An **organization** is a workspace that contains your apps, team members, builds, and billing. Everything in AirBuild — apps, links, members, webhooks, API keys — belongs to an organization.

## Creating an organization

Your first organization is created automatically when you sign up. You can create additional organizations from the sidebar:

1. Open the **org switcher** in the sidebar.
2. Click **Create Organization**.
3. Enter a name and (on Pro/Enterprise) upload a logo and pick a brand color.
4. Click **Create**.

## Organization limit

Each user can own up to **10 organizations**. Need more? Contact support.

Only **one unpaid organization per account** gets the Free plan — your oldest one. Additional unpaid organizations are suspended until they subscribe. See [Billing & Plans](../guides/billing/#multiple-organizations).

## Deleting an organization

Only the **sole owner** can delete an organization, from **Settings → Danger Zone**. If other members exist, they must be removed first.

When an organization is deleted:

- **Data is permanently wiped immediately** — apps, builds, install links, API keys, webhooks, invites, and Apple Developer credentials are gone for good.
- **Billing records are retained** — invoices, subscriptions, and usage history are kept for statutory and support purposes, and the subscription is cancelled.
- **Members are removed** and the organization disappears from everyone's sidebar. Its original name/slug becomes reusable.
- **Recovery is admin-side only** — if the deletion was a genuine mistake, contact support promptly. Support can restore the organization shell and re-create memberships, but **wiped data cannot be recovered**.

## Switching between orgs

Use the **org switcher** in the sidebar to switch between organizations you belong to. Your current organization is shown at the top of the sidebar, and all pages (Apps, Team, Settings, Billing) are scoped to the selected org.

## Organization settings

Open **Settings** to manage your organization:

| Setting            | Description                                                        | Plans              |
| ------------------ | ------------------------------------------------------------------ | ------------------ |
| Name               | The display name of your organization.                             | All                |
| Logo               | Custom logo shown on install pages and the dashboard.              | Pro, Enterprise    |
| Brand color        | Accent color used on install pages and emails.                     | Pro, Enterprise    |
| Display name       | Custom name shown on install pages (white-label).                  | Pro, Enterprise    |

## Next steps

- [Team Management](../guides/team-management/) — Invite members and assign roles.
- [Billing & Plans](../guides/billing/) — Upgrade your organization for more apps and storage.
