# Suppliers Management MVP

## Goal
Enable supplier creation and moderation with a minimal admin-first flow, while preserving an easy path for future user-submitted supplier suggestions.

## Scope
This phase adds supplier management capabilities to the existing suppliers feature.

### Public users
- Can view approved suppliers
- Can submit reviews for suppliers
- Cannot create or edit suppliers in this phase

### Admin users
- Can create suppliers
- Can edit suppliers
- Can approve suppliers
- Can reject suppliers
- Can access supplier management from:
  - the Suppliers page
  - the Admin panel

## Product decisions
- The visible button label remains **Fornecedores**
- On the Suppliers page, only admins see the **Cadastrar fornecedor** action
- Supplier moderation should use a status-based model:
  - `pending`
  - `approved`
  - `rejected`
- Existing public listing must continue to show only approved suppliers
- This MVP does not yet allow regular users to suggest suppliers
- Future user suggestion flow should be enabled later without major schema redesign

## Minimal supplier fields
- name
- avatar_url
- country
- shipping_method
- prep_time
- shipping_time
- whatsapp_link
- group_link
- status
- created_at

## Admin flows
1. Admin opens Suppliers page
2. Admin sees button **Cadastrar fornecedor**
3. Admin opens supplier form modal/page
4. Admin creates supplier
5. Supplier can be saved as pending or approved depending on chosen admin flow
6. Admin can edit an existing supplier
7. Admin can approve or reject supplier from admin management area

## Public visibility rule
Only suppliers with status `approved` should appear in the public suppliers page.

## Non-goals
- No user supplier suggestion flow yet
- No advanced moderation workflow
- No audit log
- No bulk actions
- No notifications
- No complex filtering for admin

## Success criteria
- Admin can create supplier
- Admin can edit supplier
- Admin can approve/reject supplier
- Public page shows only approved suppliers
- Existing suppliers listing continues to work
- Structure is compatible with future user suggestions