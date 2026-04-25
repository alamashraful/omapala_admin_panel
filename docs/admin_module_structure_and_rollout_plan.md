# Admin Module Structure And Rollout Plan

## 1. Goal

This document defines the recommended backend structure for the Omapala admin panel and a safe rollout order for implementation.

The goal is to support:

- moderation management
- user report management
- user account management
- global app configuration
- policy/version management
- analytics and dashboard summaries

This plan is designed to fit the current backend architecture:

- modular monolith
- FastAPI
- module layering: `api -> application -> infrastructure`
- shared role-based auth via IAM

## 2. Current State

The backend already supports a small subset of admin functionality:

- post moderation queue
- post moderation actions
- pending user-submitted content reports
- seeded admin and post moderation roles

Current roles already present:

- `ADMIN`
- `POST_ADMIN`
- `POST_MODERATOR`

Current gaps:

- no admin user-management APIs
- no report review lifecycle APIs
- no admin analytics APIs
- no admin global-config APIs
- no versioned policy management
- no user re-acceptance flow for updated policies

## 3. Recommended Module Structure

Recommended new module:

- `app/modules/admin/`

Recommended internal layout:

```text
app/modules/admin/
  api/
    analytics_routes.py
    config_routes.py
    policy_routes.py
    report_routes.py
    user_routes.py
    router.py
  application/
    analytics_service.py
    config_service.py
    policy_service.py
    report_admin_service.py
    user_admin_service.py
    schemas.py
  domain/
    models.py
  infrastructure/
    repositories.py
```

Why a dedicated `admin` module:

- keeps admin-only logic separate from user-facing APIs
- avoids bloating IAM and post modules with control-plane behavior
- lets us reuse existing domain modules without tightly coupling them
- gives frontend/admin-panel developers a stable API namespace

Recommended API prefix:

- `/api/v1/admin/...`

## 4. Recommended Responsibility Split

### 4.1 Admin Module

Owns:

- admin orchestration
- cross-domain admin queries
- dashboard summaries
- global configuration
- policy publishing/versioning
- admin actions over users and reports

### 4.2 IAM Module

Continues to own:

- identity
- roles
- authentication
- self-service profile
- self-service settings

Admin module may call IAM repositories/services for:

- user lookups
- role updates
- status changes

### 4.3 Post Module

Continues to own:

- posts
- reports
- post moderation state
- moderation queue storage

Admin module may call post repositories/services for:

- flagged post lists
- report review actions
- moderation actions

### 4.4 Notifications Module

Can be reused for:

- admin-triggered announcements
- policy update notifications
- enforcement notifications

## 5. Admin API Groups

### 5.1 User Management

Recommended endpoints:

- `GET /api/v1/admin/users`
- `GET /api/v1/admin/users/{user_id}`
- `PATCH /api/v1/admin/users/{user_id}/status`
- `PATCH /api/v1/admin/users/{user_id}/roles`
- `POST /api/v1/admin/users/{user_id}/warn`
- `POST /api/v1/admin/users/{user_id}/suspend`
- `POST /api/v1/admin/users/{user_id}/unsuspend`

Recommended filters for list endpoint:

- search by email/phone/name/handler
- status
- role
- verified email / verified phone
- created date range
- warning count
- suspended users only

Suggested actions:

- warning
- temporary suspension
- permanent suspension
- role assignment
- role removal

### 5.2 Report Management

Recommended endpoints:

- `GET /api/v1/admin/reports`
- `GET /api/v1/admin/reports/{report_id}`
- `POST /api/v1/admin/reports/{report_id}/dismiss`
- `POST /api/v1/admin/reports/{report_id}/action-taken`

Recommended filters:

- pending / reviewed / dismissed / action_taken
- report reason
- target type
- date range
- reporter

This is separate from post moderation queue because:

- reports are user-driven
- moderation queue is system/provider-driven

### 5.3 Moderation Management

Current post moderation queue should stay in the post module, but admin panel will consume it as part of admin behavior.

Already existing or recently added:

- `GET /api/v1/admin/posts/moderation-queue`
- `POST /api/v1/admin/posts/{post_id}/moderation-review`
- `POST /api/v1/admin/posts/{post_id}/hide`
- `POST /api/v1/admin/posts/{post_id}/block`
- `POST /api/v1/admin/posts/{post_id}/restore`

Recommended later additions:

- `GET /api/v1/admin/posts/{post_id}/moderation-history`
- `POST /api/v1/admin/posts/{post_id}/re-run-moderation`

### 5.4 Global Config

Recommended endpoints:

- `GET /api/v1/admin/config`
- `PATCH /api/v1/admin/config`

Config examples:

- minimum registration age
- moderation enabled/disabled flags
- moderation fail-open policy
- supported onboarding options
- feature switches for rollout
- announcement banner text

Important note:

- runtime config should move from pure env-only values into database-backed admin config for business-managed settings
- infrastructure secrets should remain in env or secret manager

### 5.5 Policy Management

Recommended endpoints:

- `GET /api/v1/admin/policies`
- `GET /api/v1/admin/policies/{policy_id}`
- `POST /api/v1/admin/policies`
- `PATCH /api/v1/admin/policies/{policy_id}`
- `POST /api/v1/admin/policies/{policy_id}/publish`

Policy types:

- privacy_policy
- terms_of_service
- community_guidelines
- age_verification_policy

Recommended user-facing support endpoints:

- `GET /api/v1/policies/current`
- `POST /api/v1/users/me/policies/accept`

### 5.6 Analytics

Recommended endpoints:

- `GET /api/v1/admin/analytics/overview`
- `GET /api/v1/admin/analytics/users`
- `GET /api/v1/admin/analytics/content`
- `GET /api/v1/admin/analytics/moderation`

Overview metrics:

- total users
- new users today / this week / this month
- active users today / week / month
- posts created today / week / month
- posts pending moderation
- posts needing review
- reports pending review
- warnings issued
- suspended users

## 6. Recommended Data Model Additions

### 6.1 Admin Config

Recommended table:

- `app_config`

Suggested fields:

- `key`
- `value_json`
- `updated_by`
- `updated_at`

Use this for:

- min age
- moderation toggles
- UI-driven global settings

### 6.2 Policy Versions

Recommended table:

- `policy_document`

Suggested fields:

- `id`
- `policy_type`
- `version`
- `title`
- `content_markdown` or `content_html`
- `is_published`
- `published_at`
- `published_by`
- `effective_at`
- `created_at`
- `updated_at`

### 6.3 User Policy Acceptance

Recommended table:

- `user_policy_acceptance`

Suggested fields:

- `id`
- `user_id`
- `policy_document_id`
- `accepted_at`
- `source`

This supports:

- proving consent by policy version
- forcing re-acceptance after policy updates
- showing acceptance audit history

### 6.4 Optional Admin Audit Log

Recommended table:

- `admin_action_log`

Suggested fields:

- `id`
- `admin_user_id`
- `action_type`
- `target_type`
- `target_id`
- `payload_json`
- `created_at`

This is strongly recommended for:

- moderator actions
- user enforcement
- config changes
- policy publishes

## 7. Policy And Config Behavior

### 7.1 Updated Privacy Policy / Terms

Required behavior:

1. Admin publishes a new policy version.
2. Backend marks it as current.
3. Existing users are checked against current accepted version at login and session refresh.
4. New users are required to accept the current version during onboarding.

Recommended backend behavior:

- login response should include a flag like `policy_acceptance_required`
- optionally include `required_policies`
- protected user actions may be limited until required policies are accepted

### 7.2 Minimum Age

Current state:

- min age is env-based

Recommended future state:

- admin-managed in `app_config`
- fallback to env if DB entry missing

Recommended precedence:

1. DB config
2. env default

## 8. Recommended Permissions Model

Keep current roles and expand usage:

- `ADMIN`
  - full access to admin panel
- `POST_ADMIN`
  - post/report/moderation management
- `POST_MODERATOR`
  - moderation queue and report review, but limited config access

Recommended future roles:

- `USER_ADMIN`
- `ANALYTICS_ADMIN`
- `CONFIG_ADMIN`

If you want to stay simple for now, `ADMIN` plus existing post roles are enough for phase 1.

## 9. Rollout Order

### Phase 1: Moderation Completion

Goal:

- make moderation and report handling usable for the first admin panel release

Scope:

- finalize moderation queue APIs
- add report lifecycle review APIs
- add moderation history endpoint
- add admin user enforcement actions if missing

Why first:

- highest product risk
- directly tied to trust and safety

### Phase 2: User Management

Goal:

- give admin panel basic account control

Scope:

- admin user list/detail
- warning / suspend / unsuspend
- role update
- basic user moderation history

Why second:

- needed for daily operations
- depends on enforcement logic already used by moderation

### Phase 3: Global Config

Goal:

- move business-managed settings out of env-only control

Scope:

- `app_config`
- admin config read/update APIs
- move min-age lookup to DB-backed config with env fallback

Why third:

- lower operational urgency than moderation
- good foundation for future admin tools

### Phase 4: Policy Versioning

Goal:

- support real legal/policy lifecycle

Scope:

- policy document table
- user acceptance table
- publish flow
- login/onboarding enforcement

Why fourth:

- more cross-cutting
- touches auth and onboarding contracts
- best done after config/admin foundations exist

### Phase 5: Analytics

Goal:

- power admin dashboard reporting

Scope:

- overview metrics
- moderation metrics
- user growth metrics
- report trend metrics

Why fifth:

- easier once moderation and admin actions already generate structured data

## 10. Recommended First Implementation Batch

If we want the most useful admin panel quickly, the first concrete batch should be:

1. admin report lifecycle APIs
2. admin user list/detail/status APIs
3. admin role update API
4. admin config table + min-age override API
5. policy version tables and publish flow

This gives the frontend/admin-panel team enough to build around while keeping risk manageable.

## 11. Risks And Notes

- putting business config only in env will keep blocking non-engineering admin changes
- storing only a boolean `agreed_to_terms` is not enough for future legal versioning
- user suspension and moderation actions should always be audit logged
- analytics should be based on stable aggregated queries first, not over-engineered event pipelines
- keep admin APIs behind strict role checks and avoid mixing them into self-service routers

## 12. Recommended Next Step

Implement Phase 1 and Phase 2 together:

- report review lifecycle
- admin user management

Then implement:

- admin config
- policy versioning

This is the best balance between operational need and implementation risk.
