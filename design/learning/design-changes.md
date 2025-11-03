[@concepts-v1](../brainstorming/concepts-v1.md)

[@concepts](../brainstorming/concepts.md)

# prompt: concepts-v1 is the initial design of the concepts and concepts is the latest version of the concept design. Explain the changes made. Keep it as concise and clear as possible.

# response:

The final version refines and expands the initial concept design, focusing on greater specificity, clearer separation of concerns, and robust interaction modeling through a new `Request` pseudo-concept and explicit `Synchronizations`.

Here's a concept-by-concept summary of changes:

1.  **UserAuth / UserAuthentication:**
    *   **State:** Added `passwordHash` for security; removed explicit `logout` (implies session management handled externally).
    *   **Actions:** Added `changePassword`.
    *   **Queries:** Added `_byUsername`.
2.  **Membership:**
    *   **State:** Simplified by removing `semester` and `price` (focusing purely on active status). Renamed `active` to `isActive`.
    *   **Actions:** Renamed `createMembership` to `activate`, `toggleActive` to `deactivate`.
    *   **Queries:** Added `_isActive` and `_joinedDate`.
3.  **Menu:**
    *   **Major Expansion:** This is the most significant change.
        *   `v1` had a simple `Item` with a `set of Options` and `available` boolean.
        *   `Final` introduces a detailed model with distinct entities: `Items`, `Options`, `Choices`, and `Applicabilities`. This allows for explicit definition of option requirements (`required`, `maxChoices`) and item-specific `disallowedChoices`.
    *   **Actions:** Expanded to manage `Items`, `Options`, `Choices`, `attachOption`, `detachOption`, `disallowChoice`, `allowChoice`.
    *   **Queries:** Added comprehensive queries like `_optionsForItem`, `_choicesFor`, and `_isSelectionSetValid` for robust selection validation.
4.  **Order:**
    *   **Expansion:** Now models detailed item customizations.
        *   `v1` had `items set of Item`.
        *   `Final` uses `OrderLines` and `SelectedChoices` to capture specific customizations (`Option`, `Choice`) for each item. Added `displayItemName`, `displayOptionName`, `displayChoiceName` to store names at the time of order.
    *   **Status Flow:** Refined status states (`pending`, `completed`, `canceled`).
    *   **Actions:** `createOrder` became `open`; `updateStatus` became more specific `submit`, `complete`, `cancel`. `addItem` now includes `selections`.
    *   **Queries:** Added `_lines` with detailed selections.
5.  **CustomerFeedback:**
    *   **State:** Simplified by removing `rating` and `public` fields.
    *   **Actions:** `submitFeedback` renamed to `create`.
    *   **Queries:** Added `_forUser`.
6.  **UserProfile:**
    *   **State:** Simplified by removing `favoriteDrink`, `classYear`, `major`, `type`, `score`. Added `avatar`.
    *   **Actions:** `updateProfile` renamed to `setProfile`.
    *   **Queries:** `_getProfile` renamed to `_profile`. Added `_allProfiles` to list all user profiles for community browsing (names, bio, optional class year/major, favorites, avatar).
7.  **Option (v1) / Integration:**
    *   The incomplete `Option` concept from `v1` was removed as a standalone concept and its functionality was thoroughly integrated and expanded within the new, detailed `Menu` concept in the final version.
8.  **New Concepts:**
    *   **Synchronizations:** Formalized the "when-where-then" logic to connect concepts and enforce business rules, replacing the ad-hoc "Sync Example" sections.

## Architectural Integration (Assignment 4a backend + Syncs)

- **Requesting-as-Gateway**: All external HTTP requests now flow through the `Requesting` concept. Requests are modeled as actions, and responses are produced by synchronizations, improving traceability and separation of concerns.
- **Passthrough Policy**: Previously, many endpoints directly mapped to concept methods. We now exclude state-changing endpoints from passthrough and require them to go through Requesting + Syncs. Read-only queries (e.g., `Menu._allActiveItems`, `Order._byStatus`) remain passthrough for simplicity and to preserve array-shaped returns.
- **Engine Registration**: A `SyncConcept` engine registers synchronizations discovered under `src/syncs/`, enabling a clear, declarative mapping from intent (request) to effects (concept actions).

### Where-Clauses (Formal Preconditions)

- **UserAuthentication.register**
  - Before: relied on concept internals or ad-hoc checks.
  - Now: `where` ensures username uniqueness by querying `_searchByKerb`. The sync proceeds only if no match is found.
- **Order.submit**
  - Before: implicit expectation that an order has lines.
  - Now: `where` checks `Order._lines(order)` and only proceeds when at least one line exists.
- **CustomerFeedback.create**
  - Before: assumed external gating for order completion.
  - Now: `where` checks that the referenced order exists in `Order._byStatus({ status: "completed" })`.

- **Order.addItem**
  - Before: client was responsible for passing valid selections.
  - Now: `where` validates selections via `Menu._isSelectionSetValid({ item, selections })` and proceeds only when `ok === true`.

These `where` guards make preconditions explicit and testable, preventing invalid actions from firing and eliminating a class of dangling or inconsistent states.

## How Final Design Differs from Assignment 2 (Initial Concepts)

- **Causality and Traceability**: Requests, actions, and responses are causally linked via frames/flows. This replaces implicit control flow with explicit synchronizations.
- **Explicit Business Logic**: Preconditions (uniqueness, order readiness, completion) move from implicit codepaths into declarative `where` clauses aligned with the concept specs.
- **State Mutation Discipline**: All mutations route through synchronizations, reinforcing concept boundaries and making side effects observable.
- **Iterative Composition**: `Frames` enable iteration and collection (`collectAs`) patterns that were not present in the initial design.

## How Final Design Aligns with Assignment 4b (Visual Design)

- **Stable API Shapes**: Frontend still posts to routes like `/Order/open`, `/Menu/_allActiveItems`. Read-only queries keep array responses; actions respond with flat objects, matching UI assumptions.
- **Clear Error Cases**: Error responses are explicit via separate sync branches, making UI toasts/loading states straightforward.
- **Cross-Concept Flows**: UI flows (e.g., opening orders, adding items, submitting, leaving feedback) are now backed by synchronizations that encode the same user journey constraints designed in 4b.

## Rationale and Tradeoffs

- **Pros**
  - Declarative, auditable flows with granular logging (TRACE/VERBOSE) for debugging.
  - Centralized preconditions reduce duplication and drift across services.
  - Easier evolution: adding or tightening rules is localized to syncs.
- **Cons / Mitigations**
  - Slight learning curve for `when/where/then` and `Frames`; mitigated by examples and consistent patterns.
  - Double maintenance risk for passthrough vs syncs; mitigated by excluding all mutating endpoints from passthrough.