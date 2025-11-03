# Sync Specifications

This document specifies the request/response syncs. Each spec lists the request path, required inputs, preconditions, invoked concept actions, and response shapes (success/error).

#### Auth Syncs (`auth.sync.ts`)
- **Register**
  - **Request path**: `/UserAuthentication/register`
  - **Inputs**: `username`, `password`
  - **Preconditions**: Username must not match any existing Kerb (via `UserAuthentication._searchByKerb`).
  - **Action**: `UserAuthentication.register({ username, password })`
  - **Success response**: `{ user }`
  - **Error response**: `{ error }`
- **Login**
  - **Request path**: `/UserAuthentication/login`
  - **Inputs**: `username`, `password`
  - **Action**: `UserAuthentication.login({ username, password })`
  - **Success response**: `{ user }`
  - **Error response**: `{ error }`
- **Change Password**
  - **Request path**: `/UserAuthentication/changePassword`
  - **Inputs**: `user`, `oldPassword`, `newPassword`
  - **Action**: `UserAuthentication.changePassword({ user, oldPassword, newPassword })`
  - **Success response**: `{}`
  - **Error response**: `{ error }`

#### Order Syncs (`order.sync.ts`)
- **Open Order**
  - **Request path**: `/Order/open`
  - **Inputs**: `user`
  - **Action**: `Order.open({ user })`
  - **Success response**: `{ order }`
  - **Error response**: `{ error }`
- **Add Item**
  - **Request path**: `/Order/addItem`
  - **Inputs**: `order`, `item`, `qty`, `displayItemName`, `selections` (array of `{ option, choice }`)
  - **Preconditions**: Menu selections must be valid via `Menu._isSelectionSetValid({ item, selections })`.
  - **Action**: `Order.addItem({ order, item, qty, displayItemName, selections })`
  - **Success response**: `{ line }`
  - **Error response**: `{ error }`
- **Submit Order**
  - **Request path**: `/Order/submit`
  - **Inputs**: `order`
  - **Preconditions**: Order must have at least one line (`Order._lines({ order })` non-empty).
  - **Action**: `Order.submit({ order })`
  - **Success response**: `{}`
  - **Error response**: `{ error }`
- **Complete Order**
  - **Request path**: `/Order/complete`
  - **Inputs**: `order`
  - **Action**: `Order.complete({ order })`
  - **Success response**: `{}`
  - **Error response**: `{ error }`

#### Membership Syncs (`membership.sync.ts`)
- **Activate Membership**
  - **Request path**: `/Membership/activate`
  - **Inputs**: `user`
  - **Action**: `Membership.activate({ user })`
  - **Success response**: `{}`
  - **Error response**: `{ error }`
- **Deactivate Membership**
  - **Request path**: `/Membership/deactivate`
  - **Inputs**: `user`
  - **Action**: `Membership.deactivate({ user })`
  - **Success response**: `{}`
  - **Error response**: `{ error }`

#### User Profile Syncs (`userProfile.sync.ts`)
- **Set Profile**
  - **Request path**: `/UserProfile/setProfile`
  - **Inputs**: `user`, `name`, `classYear`, `major`, `bio`, `favoriteDrink`, `favoriteCafe`, `avatar`
  - **Action**: `UserProfile.setProfile({ user, name, classYear, major, bio, favoriteDrink, favoriteCafe, avatar })`
  - **Success response**: `{}`
  - **Error response**: `{ error }`

#### Customer Feedback Syncs (`feedback.sync.ts`)
- **Create Feedback**
  - **Request path**: `/CustomerFeedback/create`
  - **Inputs**: `user`, `order`, `comment`
  - **Preconditions**: Target order must be in `completed` status (via `Order._byStatus({ status: "completed" })`).
  - **Action**: `CustomerFeedback.create({ user, order, comment })`
  - **Success response**: `{ feedbackId }`
  - **Error response**: `{ error }`

#### Sync Registry (`syncs.ts`)
- **Purpose**: Aggregates and exports all syncs from `auth`, `order`, `userProfile`, `feedback`, and `membership` as a single map.
- **Behavior**: Iterates module exports, adding functions to `allSyncs` under namespaced keys (e.g., `order.AddItemRequest`). Auto-generated; do not edit manually.


