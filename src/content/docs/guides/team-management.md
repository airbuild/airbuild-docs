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
| Developer  | Upload builds and view the dashboard.                              |
| Tester     | View the dashboard and install builds.                             |
| Guest      | Limited access — no dashboard. (For invite-only link access.)      |

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
