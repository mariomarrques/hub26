# Admin Users Rebuild

## Goal
Replace the fragile admin users data flow with a minimal and predictable implementation that supports:
- admin users list
- recent users on dashboard
- explicit error handling
- real empty states

## Scope
This phase affects only:
- admin users page
- dashboard recent users block
- supporting admin users data layer

## Product decisions
- Keep existing admin routes and navigation
- Keep current page layout as much as possible
- Replace fragile RPC-dependent users data flow with a minimal reliable source
- Prefer predictability over abstraction
- Show explicit error state instead of masking backend failures as empty data

## Data goals
Users list should provide at minimum:
- id
- name
- avatar_url
- email
- role
- created_at

Recent users should be derived from the same source, ordered by newest first.

## UX goals
- Users page must clearly distinguish:
  - loading
  - error
  - empty
  - loaded data
- Dashboard recent users must show actual recent entries when available
- No fake or misleading placeholders should be shown once data is loaded

## Non-goals
- No admin redesign
- No logs rebuild yet
- No new role management features
- No analytics
- No advanced filtering logic beyond what already exists