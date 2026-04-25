# Omapala Admin Panel

Standalone Next.js admin application for Omapala operations. This app is intended for `ADMIN` users and connects to the Omapala backend over HTTP APIs.

## Overview

This project provides the internal admin surface for:

- admin login and logout
- dashboard overview
- moderation queue actions
- report review actions
- user management
- policy management
- global runtime config management
- analytics and operational reporting

The consumer-facing app is separate. This repository is only for the admin panel.

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- App Router
- Server Actions for authenticated mutations

Recommended runtime for deployment:

- Node.js 22

## Main Functionalities

### 1. Authentication

- `GET /` shows the admin login page
- login posts credentials to the backend auth API
- successful login stores the backend JWT in the `omapala_access_token` cookie
- `/admin` and all child routes are protected by `middleware.ts`
- logout clears the auth cookie

### 2. Dashboard

- platform overview metrics
- moderation and report summaries
- operational quick links

### 3. Moderation

- live moderation queue
- review notes
- approve, sensitive, reject, remove
- warn, suspend, restore
- quick actions from the queue table

### 4. Reports

- report list and detail view
- dismiss, mark reviewed, mark action taken

### 5. Users

- user directory
- user detail page
- role updates
- status updates
- warning, suspend, unsuspend

### 6. Policies

- policy list
- draft creation
- draft update
- publish current version

### 7. Global Config

- editable runtime settings
- moderation-related config management

### 8. Analytics

- user analytics
- content analytics
- moderation analytics

## How It Connects To The Backend

The app talks to the backend through REST endpoints under `/api/v1/...`.

There are two main backend integration paths:

### Read path

Server-side page loaders in `lib/admin-*.ts` call:

- `lib/admin-api-server.ts`

This helper:

- reads the `omapala_access_token` cookie
- sends `Authorization: Bearer <token>`
- fetches data from the configured backend base URL

### Mutation path

Form submissions use Server Actions in:

- `app/admin/actions.ts`
- `app/auth-actions.ts`

These actions:

- receive form data
- call backend APIs
- revalidate affected admin routes
- redirect back with success or error messages

### Auth path

Login uses:

- `POST /api/v1/auth/login`

The returned access token is stored in:

- cookie: `omapala_access_token`

## Environment Variables

These are the important runtime values:

### `NEXT_PUBLIC_API_BASE_URL`

Backend API base URL used by the admin app.

Examples:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost
```

```env
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
```

This is the main value to change during deployment if the backend endpoint changes.

### `OMAPALA_ADMIN_ACCESS_TOKEN`

Optional server-side fallback token.

Use this only if you intentionally want the server to call the backend with a pre-provisioned token. In normal browser login flow, this is not required.

### `NEXT_PUBLIC_ENABLE_ADMIN_BYPASS`

Optional bypass for admin middleware.

```env
NEXT_PUBLIC_ENABLE_ADMIN_BYPASS=false
```

Do not enable this in production.

## Project Structure

```text
omapala_admin_panel/
├─ app/
│  ├─ admin/
│  │  ├─ analytics/
│  │  ├─ config/
│  │  ├─ moderation/
│  │  ├─ policies/
│  │  ├─ reports/
│  │  ├─ users/
│  │  ├─ actions.ts
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ auth-actions.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  └─ admin/
│     ├─ admin-sidebar.tsx
│     ├─ admin-topbar.tsx
│     ├─ confirm-submit-button.tsx
│     ├─ form-submit-button.tsx
│     ├─ flash-banner.tsx
│     ├─ filter-bar.tsx
│     ├─ pagination.tsx
│     └─ ...
├─ lib/
│  ├─ admin-analytics.ts
│  ├─ admin-api-server.ts
│  ├─ admin-config.ts
│  ├─ admin-dashboard.ts
│  ├─ admin-moderation.ts
│  ├─ admin-policies.ts
│  ├─ admin-reports.ts
│  ├─ admin-users.ts
│  ├─ auth.ts
│  └─ format.ts
├─ docs/
│  ├─ admin_panel_requirements.md
│  ├─ admin_module_structure_and_rollout_plan.md
│  └─ design samples...
├─ middleware.ts
├─ next.config.ts
├─ package.json
└─ README.md
```

## Important Files

### Routing and auth

- `app/page.tsx`
- `app/auth-actions.ts`
- `middleware.ts`
- `lib/auth.ts`

### Admin page shell

- `app/admin/layout.tsx`
- `components/admin/admin-sidebar.tsx`
- `components/admin/admin-topbar.tsx`

### Backend integration

- `lib/admin-api-server.ts`
- `app/admin/actions.ts`

## Local Development

Install and run:

```bash
npm install
npm run dev
```

Then open:

- `http://localhost:3000`

Build locally:

```bash
npm run build
npm start
```

## Deployment Notes

### What to change for a new backend environment

For staging, production, or any new API server, update:

- `NEXT_PUBLIC_API_BASE_URL`

Example:

```env
NEXT_PUBLIC_API_BASE_URL=https://api.omapala.com
```

If your backend auth domain, API domain, or load balancer changes, this is the first value to update.

### Cookie and auth behavior

- login happens through backend auth API
- access token is stored as `omapala_access_token`
- admin routes require a valid token with `ADMIN` role

### Production recommendations

- keep `NEXT_PUBLIC_ENABLE_ADMIN_BYPASS=false`
- run behind HTTPS
- use secure environment variable management
- restrict access with network and IAM controls where possible

## Suggested Deployment Process

This app is a standard Next.js server application. It should be deployed as a long-running Node.js service.

### Recommended container runtime

- container port: `3000`
- startup command: `npm start`

### Typical CI/CD flow

1. Install dependencies
2. Run typecheck and lint
3. Build the app
4. Build container image
5. Push image to registry
6. Deploy new image to the target environment

Recommended checks:

```bash
npm ci
npm run typecheck
npm run lint
npm run build
```

## Deploying To AWS ECS

Below is a practical deployment flow for AWS ECS with ECR and an Application Load Balancer.

### 1. Create an ECR repository

Example repository:

- `omapala-admin-panel`

### 2. Add a Dockerfile

This repository does not currently include a Dockerfile. A typical production Dockerfile would:

- use Node 22
- install dependencies
- build Next.js
- run `npm start`
- expose port `3000`

Example shape:

```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Build and push the image

Example high-level flow:

```bash
docker build -t omapala-admin-panel .
docker tag omapala-admin-panel:latest <account-id>.dkr.ecr.<region>.amazonaws.com/omapala-admin-panel:latest
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/omapala-admin-panel:latest
```

### 4. Create an ECS task definition

Use:

- launch type: Fargate or EC2
- container port: `3000`
- CPU and memory sized for Next.js server traffic
- environment variables:
  - `NEXT_PUBLIC_API_BASE_URL`
  - `NEXT_PUBLIC_ENABLE_ADMIN_BYPASS=false`

Optional:

- `OMAPALA_ADMIN_ACCESS_TOKEN`

### 5. Create an ECS service

Configure:

- desired task count
- rolling deployment
- ALB target group
- health check path: `/`

### 6. Configure the load balancer and DNS

- route public/admin domain to ALB
- enable HTTPS with ACM certificate

Example:

- `admin.omapala.com`

### 7. Verify after deployment

Check:

- login page loads at `/`
- unauthenticated `/admin` redirects to login
- admin login succeeds
- dashboard data loads from production API
- mutations work for moderation, reports, users, config, and policies

## Deploying To Other Clouds

This app can also be deployed to:

- AWS App Runner
- EC2
- Azure App Service
- Google Cloud Run
- Kubernetes

Core requirements stay the same:

- run a Node.js server
- expose port `3000`
- set `NEXT_PUBLIC_API_BASE_URL`
- terminate TLS in front of the app

## Pre-Deployment Checklist

- backend API is reachable from the deployed environment
- `NEXT_PUBLIC_API_BASE_URL` points to the correct backend
- `NEXT_PUBLIC_ENABLE_ADMIN_BYPASS` is disabled
- admin login works with production/staging admin accounts
- security group / firewall rules allow outbound backend access
- HTTPS is enabled

## Documents In `docs/`

Reference materials used for this build are stored in:

- `docs/admin_panel_requirements.md`
- `docs/admin_module_structure_and_rollout_plan.md`
- `docs/admin_core/DESIGN.md`
- design sample folders under `docs/`

## Current Status

Implemented:

- admin login page
- protected admin routes
- dashboard
- moderation UI
- reports UI
- users UI
- policies UI
- config UI
- analytics UI
- live API integration for reads and mutations

Still recommended as future improvements:

- add Dockerfile and infrastructure templates
- add automated tests for critical admin mutations
- add production monitoring and structured logging
- add richer user/session display in the top bar
