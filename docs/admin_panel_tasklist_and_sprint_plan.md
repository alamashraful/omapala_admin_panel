# Omapala Admin Panel Task List And Sprint Plan

## Scope Summary

The Omapala admin panel is a standalone Next.js application connected to the backend via `/api/v1/admin/...` APIs.  
Phase 1 assumes `ADMIN`-only access for the full panel.

Primary release goals:

- dashboard visibility
- fast moderation flow
- reliable report review
- safe user enforcement actions
- simple policy publishing
- simple config editing

## Task List

### 1. Project Setup

- create standalone Next.js admin app in project root
- add shared admin layout, sidebar, and topbar
- implement protected `/admin` route structure
- add JWT role-check scaffolding for `ADMIN` access
- set up centralized admin API client and shared request patterns

### 2. Design System And Shared UI

- implement admin theme tokens from `docs/admin_core/DESIGN.md`
- build reusable table, status badge, filter bar, search, pagination, and card components
- add empty, loading, error, and confirmation patterns
- standardize destructive action styling and admin-safe interaction patterns

### 3. Dashboard

- build `/admin` dashboard page
- show KPI cards from analytics overview data
- add moderation summary and report summary blocks
- add trend or snapshot sections using lightweight visual summaries
- provide quick links into operational modules

### 4. Moderation Queue

- build `/admin/moderation`
- add server-driven filters and queue table
- add right-side detail panel for selected queue item
- show post content, media preview, moderation metadata, and history summary
- support approve, review, hide, block, and restore flows
- include confirmation and moderation note handling for sensitive actions

### 5. Reports

- build `/admin/reports`
- add filters for status, reason, and date range
- add report detail view
- support dismiss, review, and action-taken flows

### 6. Users

- build `/admin/users`
- support search, status filter, role filter, and pagination
- build `/admin/users/[id]`
- support status changes, role updates, warnings, suspensions, and unsuspension
- separate account controls from moderation controls

### 7. Policies

- build `/admin/policies`
- build `/admin/policies/[id]`
- support create draft, edit draft, and publish flow
- add markdown editing and preview experience
- clearly label draft, published, and current versions

### 8. Global Config

- build `/admin/config`
- load current values from backend
- support editing approved runtime settings
- add warnings for high-risk config changes

### 9. Analytics

- build `/admin/analytics`
- provide read-only operational cards and simple aggregate visualizations
- defer advanced exports and time-series reporting to later iterations

### 10. Quality And Release Hardening

- validate role restrictions and protected-route behavior
- add component and integration coverage for key workflows
- add E2E coverage for critical operational flows
- polish failure handling, toasts, and recovery states
- verify desktop-first behavior with acceptable tablet fallback

## Sprint Plan

### Sprint 0: Foundations

Goal:

- establish the standalone app shell and shared infrastructure

Scope:

- Next.js scaffold
- admin route structure
- role-guard scaffolding
- theme tokens
- shared layout
- reusable UI primitives
- API client foundation

Deliverable:

- runnable protected admin shell with validated build and lint pipeline

### Sprint 1: Dashboard And Moderation

Goal:

- deliver the first operational surfaces used daily by admins

Scope:

- dashboard overview page
- KPI cards and summary sections
- moderation queue table and filters
- moderation detail panel
- primary moderation actions and confirmations

Deliverable:

- usable dashboard and moderation workflow foundation

### Sprint 2: Reports And Users List

Goal:

- extend trust-and-safety and operational account review capabilities

Scope:

- reports module
- users list page
- search and filter support
- account action entry points

Deliverable:

- report review and user-list workflows usable in the panel

### Sprint 3: User Detail And Policies

Goal:

- complete deeper account management and policy lifecycle flows

Scope:

- user detail page
- enforcement and role management flows
- policy list
- policy detail editor
- draft and publish workflow

Deliverable:

- account detail management and policy administration ready for internal use

### Sprint 4: Config, Analytics, And Hardening

Goal:

- finalize lower-frequency operations surfaces and prepare for release

Scope:

- global config page
- analytics detail pages
- validation, polish, testing, and bug fixing
- release hardening and permissions review

Deliverable:

- v1 release candidate

## Recommended Development Order

1. admin shell and auth guard
2. dashboard
3. moderation queue
4. reports
5. users
6. policies
7. global config
8. analytics

## Assumptions

- admin panel is a standalone app
- backend APIs are available or imminent enough to begin frontend work now
- reports can be developed after moderation without blocking Sprint 1
- no Jira-style backlog is required in this repository
