---
title: Team Management
description: Roles, permissions, invites, and member limits for your organization.
---

# Team Management

AirBuild organizations support multiple members with role-based access control. Invite teammates, assign roles, and control who can upload builds, manage the org, or view the dashboard.

## Roles

AirBuild supports five roles, listed from most to least privileged:

| Role       | Description                                                        |
| ---------- | ------------------------------------------------------------------ |
| Owner      | Full control, including deleting the organization.                 |
| Admin      | Manage members and org settings, upload builds.                    |
| Developer  | Upload builds and view the dashboard. Scoped to granted apps.      |
| Tester     | View the dashboard and install builds. Scoped to granted apps.     |
| Guest      | View-only access, scoped to granted apps.                          |

## Role permissions

| Action            | Owner | Admin | Developer | Tester | Guest |
| ----------------- | :---: | :---: | :-------: | :----: | :---: |
| Manage org        | ✓     | ✓     | —         | —      | —     |
| Delete org        | ✓     | —     | —         | —      | —     |
| Invite members    | ✓     | ✓     | —         | —      | —     |
| Remove members    | ✓     | ✓     | —         | —      | —     |
| Change roles      | ✓     | ✓     | —         | —      | —     |
| Upload builds     | ✓     | ✓     | ✓         | —      | —     |
| View dashboard    | ✓     | ✓     | ✓         | ✓      | —     |

## Per-app access

Owners and Admins always have access to every app in the organization.
Developers, Testers, and Guests only see the apps they are explicitly
granted — a member with no grants sees no apps at all.

Each grant carries a **per-app role** that caps what the member can do on
that app:

| Per-app role | Can view the app | Can upload builds / manage OTA updates |
| ------------ | :--------------: | :------------------------------------: |
| Developer    | ✓                | ✓                                      |
| Tester       | ✓                | —                                      |
| Guest        | ✓                | —                                      |

To manage a member's app access:

1. Go to **Team** in the sidebar.
2. In the member's row, click the **App Access** button (shows the current
   grant count).
3. For each app, choose **Developer**, **Tester**, **Guest**, or
   **No access**.
4. Click **Save**.

Grants take effect immediately. Newly invited members start with no app
access until an Owner or Admin grants it.

:::note
API keys authenticate as the organization itself and are **not** bound to
per-app scoping. Only Owners and Admins can create or revoke API keys.
:::

:::note[Organization-wide areas]
Some features are org-scoped rather than app-scoped and don't follow app
grants: the **Apple Devices** page and **Apple Developer credentials** are
visible to Owners, Admins, and Developers — Testers and Guests can't access
them regardless of app access. Connecting or replacing the Apple credential
is limited to Owners and Admins.
:::

## Inviting members

1. Go to **Team** in the sidebar.
2. Click **Invite Member**.
3. Enter the invitee's **email address**.
4. Select a **role** (Admin, Developer, Tester, or Guest).
5. Click **Send Invite**.

An **invite link** is sent to the invitee via email. They click the link, sign in (or create an account), and are added to the organization with the assigned role.

## Member limits per plan

The number of members you can invite depends on your plan:

| Plan        | Members     |
| ----------- | ----------- |
| Free        | 2           |
| Starter     | 5           |
| Pro         | 20          |
| Business    | 50          |
| Enterprise  | Unlimited   |

If you've reached your limit, upgrade your plan or remove an existing member before inviting a new one.

## Removing members

Owners and Admins can remove members from the organization:

1. Go to **Team** in the sidebar.
2. Find the member you want to remove.
3. Click **Remove**.
4. Confirm the removal.

Removed members immediately lose access to the organization's apps and dashboard.

## Changing roles

Owners and Admins can change a member's role at any time:

1. Go to **Team** in the sidebar.
2. Find the member whose role you want to change.
3. Select a new role from the dropdown.
4. The change takes effect immediately.

## Cannot remove the last owner

An organization must always have at least one **Owner**. You cannot remove or downgrade the last remaining owner. Assign another member as Owner first, then remove or downgrade the current owner.

## Next steps

- [Billing & Plans](./billing/) — Upgrade to increase your member limit.
- [Organization](../getting-started/organization/) — Manage org-level settings and branding.
