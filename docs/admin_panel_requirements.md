# Admin Panel Requirements

## 1. Purpose

This document is the design and frontend-development handoff for the Omapala admin panel.

The admin panel is intended for internal moderation and platform operations. It should support:

- moderation queue management
- user report review
- user account management
- global runtime configuration
- policy/version management
- platform analytics

Frontend stack expectation:

- Next.js
- authenticated admin-only web app
- backend consumed from the existing API namespace under `/api/v1/admin/...`

## 2. Access Model

### 2.1 Authentication

The admin panel should use the normal authentication flow already used by the product:

- `POST /api/v1/auth/login`

There is no separate admin login API.

After login, frontend must inspect JWT claims/roles and only allow admin-panel access if the user has an admin-capable role.

### 2.2 Roles

Current backend role support:

- `ADMIN`
- `POST_ADMIN`
- `POST_MODERATOR`

Current admin API access is enforced mainly with:

- `ADMIN`

So for the first release of the admin panel, assume:

- only `ADMIN` users can access the full panel

Future refinement can split access by feature area.

## 3. Recommended Admin Panel Information Architecture

Recommended top-level navigation:

1. Dashboard
2. Moderation Queue
3. Reports
4. Users
5. Policies
6. Global Config
7. Analytics

Recommended layout:

- left sidebar for modules
- top bar with current admin identity and quick search
- main content area with table/detail patterns
- right-side drawer or modal for review/action details when useful

## 4. Next.js Frontend Requirements

Recommended frontend structure:

- route groups or pages under `/admin`
- shared admin layout
- protected routes using access token + role check
- centralized API client for admin endpoints
- optimistic UI only for low-risk actions
- confirmation modal for destructive actions

Recommended app sections:

- `/admin`
- `/admin/moderation`
- `/admin/reports`
- `/admin/users`
- `/admin/users/[id]`
- `/admin/policies`
- `/admin/policies/[id]`
- `/admin/config`
- `/admin/analytics`

Recommended UI patterns:

- tables with server-driven filters
- detail drawers or detail pages for high-context records
- action buttons with confirmation dialogs
- badges for statuses
- timeline/history blocks where available

## 5. Current Backend Admin API Inventory

These APIs are currently available in code and can be used by frontend now.

### 5.1 Moderation

- `GET /api/v1/admin/posts/moderation-queue`
- `POST /api/v1/admin/posts/{post_id}/moderation-review`
- `POST /api/v1/admin/posts/{post_id}/hide`
- `POST /api/v1/admin/posts/{post_id}/block`
- `POST /api/v1/admin/posts/{post_id}/restore`

### 5.2 Reports

- `GET /api/v1/admin/reports`
- `GET /api/v1/admin/reports/{report_id}`
- `POST /api/v1/admin/reports/{report_id}/dismiss`
- `POST /api/v1/admin/reports/{report_id}/action-taken`
- `POST /api/v1/admin/reports/{report_id}/review`

### 5.3 Users

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{user_id}`
- `PATCH /api/v1/admin/users/{user_id}/status`
- `PATCH /api/v1/admin/users/{user_id}/roles`
- `POST /api/v1/admin/users/{user_id}/warn`
- `POST /api/v1/admin/users/{user_id}/suspend`
- `POST /api/v1/admin/users/{user_id}/unsuspend`

### 5.4 Global Config

- `GET /api/v1/admin/config`
- `PATCH /api/v1/admin/config`

### 5.5 Policies

- `GET /api/v1/admin/policies`
- `GET /api/v1/admin/policies/{policy_id}`
- `POST /api/v1/admin/policies`
- `PATCH /api/v1/admin/policies/{policy_id}`
- `POST /api/v1/admin/policies/{policy_id}/publish`

### 5.6 Analytics

- `GET /api/v1/admin/analytics/overview`
- `GET /api/v1/admin/analytics/users`
- `GET /api/v1/admin/analytics/content`
- `GET /api/v1/admin/analytics/moderation`

### 5.7 User-Facing Policy APIs Needed By Product UI

These are not admin APIs, but design should be aware of them because policy publishing affects the consumer app:

- `GET /api/v1/policies/current`
- `GET /api/v1/users/me/policies/status`
- `POST /api/v1/users/me/policies/accept`

Also these auth responses now expose:

- `policy_acceptance_required`
- `required_policies`

on:

- login response
- authenticated OAuth response
- registration finalize response

## 6. Module Requirements

## 6.1 Dashboard

### Goal

Provide a quick operational view of platform health and moderation workload.

### UI Blocks

- KPI cards
- moderation summary
- report summary
- user growth summary
- quick links to action queues

### Required Metrics

From `GET /api/v1/admin/analytics/overview`:

- total users
- new users today / last 7 days / last 30 days
- active users today / last 7 days / last 30 days
- posts created today / last 7 days / last 30 days
- comments created today / last 7 days / last 30 days
- reports submitted today / last 7 days / last 30 days
- posts pending moderation
- posts needing review
- pending reports
- suspended users

### Suggested UI

- first row: KPI cards
- second row: moderation/report cards
- third row: compact charts or trend summary

## 6.2 Moderation Queue

### Goal

Allow moderators/admins to review posts that require action after automated moderation.

### Backend APIs

- `GET /api/v1/admin/posts/moderation-queue`
- `POST /api/v1/admin/posts/{post_id}/moderation-review`
- `POST /api/v1/admin/posts/{post_id}/hide`
- `POST /api/v1/admin/posts/{post_id}/block`
- `POST /api/v1/admin/posts/{post_id}/restore`

### Core User Flow

1. Admin opens moderation queue.
2. Admin sees flagged or pending review posts.
3. Admin opens a post detail panel.
4. Admin reviews content and moderation metadata.
5. Admin performs an action.

### Minimum Required UI Fields

- post id
- author id or basic author summary
- content text
- media preview
- created_at
- moderation status
- moderation provider
- moderation summary
- moderation confidence
- moderation reviewed_by
- moderation review note

### Actions Needed In UI

- approve
- mark sensitive
- reject
- remove
- warn user
- temporary suspend user
- permanent suspend user
- hide
- block
- restore

### UX Notes

- media preview is important
- use explicit danger styling for destructive actions
- require confirmation for user-impacting actions
- keep moderation note textarea in the action flow

## 6.3 Reports

### Goal

Allow admins to review user-submitted reports separately from automated moderation.

### Backend APIs

- `GET /api/v1/admin/reports`
- `GET /api/v1/admin/reports/{report_id}`
- `POST /api/v1/admin/reports/{report_id}/dismiss`
- `POST /api/v1/admin/reports/{report_id}/action-taken`
- `POST /api/v1/admin/reports/{report_id}/review`

### List View Requirements

- report id
- target type
- target object id
- reason
- description
- status
- reported_by
- created_at
- reviewed_by
- reviewed_at

### Filters

Recommended initial filters:

- status
- reason
- date range

### Detail View

Should show:

- report metadata
- related post/comment context if available
- reporter details
- review history fields

### Actions

- dismiss
- mark action taken
- move to reviewed

## 6.4 Users

### Goal

Allow admin to inspect and manage user accounts.

### Backend APIs

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{user_id}`
- `PATCH /api/v1/admin/users/{user_id}/status`
- `PATCH /api/v1/admin/users/{user_id}/roles`
- `POST /api/v1/admin/users/{user_id}/warn`
- `POST /api/v1/admin/users/{user_id}/suspend`
- `POST /api/v1/admin/users/{user_id}/unsuspend`

### List View Requirements

Fields:

- id
- email
- phone
- display_name
- handler
- status
- roles
- email_verified
- phone_verified
- moderation_warning_count
- suspended_until
- created_at
- updated_at

Filters supported by current API:

- `q`
- `status`
- `role`
- `limit`
- `offset`

### Detail View Requirements

Additional fields:

- first_name
- last_name
- bio
- location
- gender
- avatar_url
- agreed_to_terms
- agreed_to_terms_at
- password_changed_at
- suspension_reason

### User Actions

- change account status
- update roles
- add warning count
- temporary suspend
- permanent suspend
- unsuspend

### UX Notes

- use detail page rather than only drawer, because user records will grow
- show role badges clearly
- separate account-status actions from moderation actions

## 6.5 Global Config

### Goal

Allow operations/admin users to change business-managed runtime settings without deployment.

### Backend APIs

- `GET /api/v1/admin/config`
- `PATCH /api/v1/admin/config`

### Current Supported Config Fields

- `registration_min_age`
- `content_moderation_enabled`
- `content_moderation_provider`
- `content_moderation_fail_open`
- `app_version` (read only)

### UX Requirements

- form-based settings page
- read current values on load
- save changes with explicit confirmation
- show warning if moderation is attempted to be disabled in production

### Important Product Note

`registration_min_age` is already respected by onboarding logic, with DB value taking precedence over env fallback.

## 6.6 Policies

### Goal

Allow legal/compliance/admin staff to manage privacy policy, terms, community guidelines, and age-verification policy versions.

### Backend APIs

- `GET /api/v1/admin/policies`
- `GET /api/v1/admin/policies/{policy_id}`
- `POST /api/v1/admin/policies`
- `PATCH /api/v1/admin/policies/{policy_id}`
- `POST /api/v1/admin/policies/{policy_id}/publish`

### Supported Policy Types

- `PRIVACY_POLICY`
- `TERMS_OF_SERVICE`
- `COMMUNITY_GUIDELINES`
- `AGE_VERIFICATION_POLICY`

### Policy Lifecycle

1. Admin creates a draft policy version.
2. Admin edits the draft if needed.
3. Admin publishes the draft.
4. Published policy becomes current for that type.
5. Existing users see policy acceptance required on next login if they have not accepted the current version.
6. New users accept current policies during onboarding.

### List View Fields

- id
- policy_type
- version
- title
- is_published
- is_current
- published_at
- effective_at
- created_at
- updated_at

### Detail View Fields

- all fields above
- content_markdown
- published_by

### UI Recommendations

- list page with tabs or filters by policy type
- markdown editor area for detail/edit page
- clear draft vs current visual labels
- publish confirmation modal

### Current Limitation

- future-dated publish is not supported yet
- publish should be treated as immediate

## 6.7 Analytics

### Goal

Give the admin panel enough reporting to power dashboard, moderation monitoring, and operational review.

### Backend APIs

- `GET /api/v1/admin/analytics/overview`
- `GET /api/v1/admin/analytics/users`
- `GET /api/v1/admin/analytics/content`
- `GET /api/v1/admin/analytics/moderation`

### Overview

Intended for dashboard summary.

### Users Analytics

Fields currently available:

- total_users
- users_by_status
- verified_email_users
- verified_phone_users
- users_with_primary_email
- new_users
- active_users
- suspended_users
- warned_users

### Content Analytics

Fields currently available:

- posts_created
- comments_created
- post_reactions_created
- comment_reactions_created
- total_posts
- total_comments
- deleted_posts
- deleted_comments
- media_posts

### Moderation Analytics

Fields currently available:

- posts_by_moderation_status
- reports_by_status
- reports_by_reason
- moderation_actions_last_30_days
- pending_reports
- action_taken_reports
- dismissed_reports
- posts_pending_moderation
- posts_needing_review
- sensitive_posts
- rejected_posts

### UI Recommendations

- cards + simple charts
- keep first release lightweight
- support export later if needed

## 7. API Readiness For Frontend Development

## 7.1 Ready Now

Frontend can start building now for:

- dashboard
- moderation queue
- reports
- users
- config
- policies
- analytics

The main admin backend APIs are available in code already.

## 7.2 Things Frontend Should Expect

- standard bearer-auth protected APIs
- role-restricted access
- paginated list patterns for some modules
- enum-style status values in uppercase
- immediate-action endpoints for moderation/user management

## 7.3 Known Gaps / Non-Blocking Follow-Ups

These do not block UI design or first frontend implementation, but they are useful later:

- no dedicated admin audit-log UI/API yet
- no moderation-history endpoint for a specific post yet
- analytics currently provide aggregates, not chart-ready time-series buckets
- no future scheduling for policy publishing
- no separate granular admin roles beyond current role model
- automated tests for all admin endpoints are still recommended

## 8. Design Guidance For Admin UI

### Visual Direction

This is an operations tool, not a consumer app screen.

Recommended characteristics:

- dense but readable
- strong hierarchy
- clear state color system
- tables + detail panes
- low-friction filtering
- obvious destructive-action affordances

### Core Components Needed

- data table
- status badge
- filter bar
- search input
- pagination
- detail drawer
- full detail page
- confirmation modal
- markdown editor or textarea
- KPI card
- empty state
- error state
- loading skeleton

### State Colors

Suggested semantic colors:

- pending: amber
- approved / active: green
- review needed: orange
- rejected / blocked / banned: red
- info / neutral: blue or gray

## 9. Recommended Frontend Build Order

1. Admin auth guard + shared layout
2. Dashboard
3. Moderation queue
4. Reports
5. Users list + user detail
6. Policies
7. Global config
8. Analytics detail pages

Reason:

- dashboard and moderation are highest-value operational surfaces
- policies and config are lower-frequency admin tasks
- analytics can start with read-only pages

## 10. Final Recommendation

The admin panel design team can start immediately from this document.

The frontend team can also begin implementation now against the current backend API surface.

For the first release, the most important experience is:

- dashboard visibility
- fast moderation flow
- reliable report review
- safe user enforcement actions
- simple policy publishing
- simple config editing

That will give Omapala a functional internal operations console for launch and early growth.
