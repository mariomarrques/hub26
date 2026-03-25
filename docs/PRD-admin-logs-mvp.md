# Admin Logs MVP

## Goal
Provide a minimal, reliable admin logs view that helps understand key administrative actions without building a heavy audit system.

## Scope
This phase affects only:
- admin logs data flow
- admin logs page/block rendering
- minimal instrumentation for key admin events if needed

## Product decisions
- Logs should be useful, not exhaustive
- Focus on key admin actions first
- Do not attempt full behavioral tracking of all user activity
- Keep the admin logs experience simple and readable
- Prefer explicit backend errors over silent empty states

## Minimum useful events
- supplier_created
- supplier_updated
- supplier_approved
- supplier_rejected
- role_changed (if already available)
- bulk_notification_sent (if already available)

## Minimum log fields
- id
- action
- actor_id
- target_type
- target_id
- created_at

Optional enrichment if already easy:
- actor_name
- short human-readable label

## UX goals
- Admin logs page must clearly distinguish:
  - loading
  - error
  - empty
  - loaded rows
- Logs should be easy to scan
- Avoid noisy or overly technical presentation in the default view

## Non-goals
- No full audit trail of all user behavior
- No analytics dashboard
- No advanced filtering yet
- No diff viewer
- No export feature